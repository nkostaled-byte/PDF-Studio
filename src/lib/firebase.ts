import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  orderBy, 
  limit,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserPlan, ProcessingHistoryItem } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Test Connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Local mock storage key for fallback unconfigured mode
const LOCAL_USER_KEY = 'pdf_studio_local_user_v1';
const LOCAL_HISTORY_KEY = 'pdf_studio_local_history_v1';

type AuthCallback = (user: UserProfile | null) => void;
const listeners = new Set<AuthCallback>();

function notifyListeners(user: UserProfile | null) {
  listeners.forEach((cb) => cb(user));
}

export function getCurrentLocalUser(): UserProfile | null {
  const data = localStorage.getItem(LOCAL_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setCurrentLocalUser(profile: UserProfile | null) {
  if (profile) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
  notifyListeners(profile);
}

export async function signUpUser(email: string, pass: string): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const profile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email || email,
    displayName: email.split('@')[0],
    plan: 'free',
    totalFilesProcessed: 0,
    totalMbProcessed: 0,
    createdAt: new Date().toISOString(),
  };
  const userPath = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }
  return profile;
}

export async function loginUser(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const userPath = `users/${cred.user.uid}`;
  let userDoc;
  try {
    userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, userPath);
  }

  if (userDoc && userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }

  const profile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email || email,
    displayName: email.split('@')[0],
    plan: 'free',
    totalFilesProcessed: 0,
    totalMbProcessed: 0,
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }
  return profile;
}

export async function loginWithGoogleDemo(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const userPath = `users/${cred.user.uid}`;
  let userDoc;
  try {
    userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, userPath);
  }

  if (userDoc && userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }

  const profile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email || 'user@example.com',
    displayName: cred.user.displayName || 'Google User',
    plan: 'free',
    totalFilesProcessed: 0,
    totalMbProcessed: 0,
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }
  return profile;
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
  setCurrentLocalUser(null);
}

export async function upgradeUserToPro(uid: string, paystackRef: string): Promise<UserProfile> {
  const updateData = {
    plan: 'pro' as UserPlan,
    subscriptionDate: new Date().toISOString(),
    paystackRef,
  };
  const userPath = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), updateData);
    const updated = await getDoc(doc(db, 'users', uid));
    if (updated.exists()) {
      return updated.data() as UserProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }

  const currentUser = getCurrentLocalUser();
  if (currentUser) {
    const updatedProfile: UserProfile = { ...currentUser, ...updateData };
    setCurrentLocalUser(updatedProfile);
    return updatedProfile;
  }
  const newPro: UserProfile = {
    uid,
    email: 'subscriber@example.com',
    displayName: 'Pro Subscriber',
    plan: 'pro',
    subscriptionDate: new Date().toISOString(),
    paystackRef,
    totalFilesProcessed: 0,
    totalMbProcessed: 0,
    createdAt: new Date().toISOString(),
  };
  setCurrentLocalUser(newPro);
  return newPro;
}

export async function recordHistory(uid: string, item: Omit<ProcessingHistoryItem, 'id'>) {
  const historyPath = `users/${uid}/history`;
  try {
    await addDoc(collection(db, 'users', uid, 'history'), {
      ...item,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, historyPath);
  }
}

export async function getProcessingHistory(uid: string): Promise<ProcessingHistoryItem[]> {
  const historyPath = `users/${uid}/history`;
  try {
    const q = query(collection(db, 'users', uid, 'history'), orderBy('timestamp', 'desc'), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProcessingHistoryItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, historyPath);
    return [];
  }
}

export function subscribeAuthStatus(callback: AuthCallback): () => void {
  listeners.add(callback);
  
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const userPath = `users/${firebaseUser.uid}`;
    try {
      const uDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (uDoc.exists()) {
        callback(uDoc.data() as UserProfile);
      } else {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'user@example.com',
          displayName: firebaseUser.displayName || 'User',
          plan: 'free',
          totalFilesProcessed: 0,
          totalMbProcessed: 0,
          createdAt: new Date().toISOString(),
        };
        callback(profile);
      }
    } catch (e) {
      console.error('Error fetching user profile:', e);
      callback(getCurrentLocalUser());
    }
  });

  return () => {
    listeners.delete(callback);
    unsubscribe();
  };
}
