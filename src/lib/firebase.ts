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
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { UserProfile, UserPlan, ProcessingHistoryItem } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization warning, falling back to local auth store:', err);
  }
}

// Local mock storage key for unconfigured mode
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
  if (isFirebaseConfigured && auth && db) {
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
    await setDoc(doc(db, 'users', profile.uid), profile);
    return profile;
  } else {
    // Local execution
    const profile: UserProfile = {
      uid: 'user_' + Math.random().toString(36).substring(2, 9),
      email,
      displayName: email.split('@')[0],
      plan: 'free',
      totalFilesProcessed: 0,
      totalMbProcessed: 0,
      createdAt: new Date().toISOString(),
    };
    setCurrentLocalUser(profile);
    return profile;
  }
}

export async function loginUser(email: string, pass: string): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
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
    await setDoc(doc(db, 'users', profile.uid), profile);
    return profile;
  } else {
    let profile = getCurrentLocalUser();
    if (!profile || profile.email !== email) {
      profile = {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0],
        plan: 'free',
        totalFilesProcessed: 0,
        totalMbProcessed: 0,
        createdAt: new Date().toISOString(),
      };
    }
    setCurrentLocalUser(profile);
    return profile;
  }
}

export async function loginWithGoogleDemo(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    const profile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || 'google_user@example.com',
      displayName: cred.user.displayName || 'Google User',
      plan: 'free',
      totalFilesProcessed: 0,
      totalMbProcessed: 0,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', profile.uid), profile);
    return profile;
  } else {
    const profile: UserProfile = {
      uid: 'google_' + Math.random().toString(36).substring(2, 9),
      email: 'alex.pro@example.com',
      displayName: 'Alex Rivers',
      plan: 'free',
      totalFilesProcessed: 0,
      totalMbProcessed: 0,
      createdAt: new Date().toISOString(),
    };
    setCurrentLocalUser(profile);
    return profile;
  }
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
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

  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'users', uid), updateData);
    const updated = await getDoc(doc(db, 'users', uid));
    return updated.data() as UserProfile;
  } else {
    const currentUser = getCurrentLocalUser();
    if (currentUser) {
      const updatedProfile: UserProfile = {
        ...currentUser,
        ...updateData,
      };
      setCurrentLocalUser(updatedProfile);
      return updatedProfile;
    } else {
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
  }
}

export async function recordHistory(uid: string, item: Omit<ProcessingHistoryItem, 'id'>) {
  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, 'users', uid, 'history'), {
      ...item,
      createdAt: new Date().toISOString(),
    });
  } else {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    const list: ProcessingHistoryItem[] = raw ? JSON.parse(raw) : [];
    const newItem: ProcessingHistoryItem = {
      ...item,
      id: 'hist_' + Math.random().toString(36).substring(2, 9),
    };
    list.unshift(newItem);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
  }
}

export async function getProcessingHistory(uid: string): Promise<ProcessingHistoryItem[]> {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'users', uid, 'history'), orderBy('timestamp', 'desc'), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProcessingHistoryItem));
  } else {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}

export function subscribeAuthStatus(callback: AuthCallback): () => void {
  listeners.add(callback);
  
  if (isFirebaseConfigured && auth && db) {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
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
  } else {
    // Initial sync
    callback(getCurrentLocalUser());
    return () => {
      listeners.delete(callback);
    };
  }
}
