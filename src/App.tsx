import React, { useEffect, useState } from 'react';
import { ToolType, UserProfile, FREE_LIMITS, PRO_LIMITS } from './types';
import { subscribeAuthStatus, logoutUser, upgradeUserToPro } from './lib/firebase';
import { triggerPaystackCheckout } from './lib/paystack';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MergeTool } from './components/MergeTool';
import { SplitTool } from './components/SplitTool';
import { CompressTool } from './components/CompressTool';
import { ImgToPdfTool } from './components/ImgToPdfTool';
import { PricingSection } from './components/PricingSection';
import { Dashboard } from './components/Dashboard';
import { PaywallModal } from './components/PaywallModal';
import { AuthModal } from './components/AuthModal';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('merge');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Dark Mode Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pdf_studio_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pdf_studio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Modal States
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string>('');
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authIntentToSubscribe, setAuthIntentToSubscribe] = useState(false);

  // Notification Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to Firebase Auth and local profile state
    const unsubscribe = subscribeAuthStatus((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const limits = user?.plan === 'pro' ? PRO_LIMITS : FREE_LIMITS;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Triggered when a free tier limit (e.g. >5MB or batch >3) is hit
  const handleExceedLimit = (reason: string) => {
    setPaywallReason(reason);
    setIsPaywallOpen(true);
  };

  // Triggered when user explicitly clicks "Upgrade to Pro"
  const handleUpgradeToProPrompt = () => {
    setPaywallReason('Pro membership unlocks unlimited file sizes, batch operations, and watermark features.');
    setIsPaywallOpen(true);
  };

  // Step 1: User clicks upgrade on PaywallModal -> Open AuthModal with intentToSubscribe = true
  const handleProceedFromPaywallToAuth = () => {
    setIsPaywallOpen(false);
    if (!user) {
      setAuthIntentToSubscribe(true);
      setIsAuthOpen(true);
    } else {
      // User is already logged in -> Trigger Paystack immediately!
      executePaystackFlow(user);
    }
  };

  // Step 2: Paystack Checkout Execution
  const executePaystackFlow = (targetUser: UserProfile) => {
    triggerPaystackCheckout({
      email: targetUser.email,
      amountInKobo: 9500, // ZAR 95.00 ($5 USD converted to Rand)
      currency: 'ZAR',
      planName: 'PDF Studio Pro',
      onSuccess: async (ref) => {
        try {
          const updatedUser = await upgradeUserToPro(targetUser.uid, ref);
          setUser(updatedUser);
          showToast('🎉 Welcome to Pro! Unlimited file sizes and batch tools unlocked.');
        } catch (err) {
          console.error('Upgrade error:', err);
        }
      },
      onCancel: () => {
        showToast('Payment cancelled. You remain on the Free Tier.');
      },
    });
  };

  // Step 3: Auth Success Handler
  const handleAuthSuccess = (authUser: UserProfile, shouldTriggerPaystack: boolean) => {
    setUser(authUser);
    setIsAuthOpen(false);

    if (shouldTriggerPaystack) {
      executePaystackFlow(authUser);
    } else {
      showToast(`Welcome back, ${authUser.displayName || authUser.email}!`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setActiveTool('merge');
    showToast('Signed out successfully.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 dark:bg-emerald-500 text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-slide-in text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main SaaS Navbar */}
      <Header
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAuth={() => { setAuthIntentToSubscribe(false); setIsAuthOpen(true); }}
        onUpgradeToPro={handleUpgradeToProPrompt}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace (Frictionless Entry) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTool === 'merge' && (
          <MergeTool
            limits={limits}
            user={user}
            onExceedLimit={handleExceedLimit}
            onUpgradePrompt={handleUpgradeToProPrompt}
          />
        )}

        {activeTool === 'split' && (
          <SplitTool
            limits={limits}
            user={user}
            onExceedLimit={handleExceedLimit}
            onUpgradePrompt={handleUpgradeToProPrompt}
          />
        )}

        {activeTool === 'compress' && (
          <CompressTool
            limits={limits}
            user={user}
            onExceedLimit={handleExceedLimit}
            onUpgradePrompt={handleUpgradeToProPrompt}
          />
        )}

        {activeTool === 'img2pdf' && (
          <ImgToPdfTool
            limits={limits}
            user={user}
            onExceedLimit={handleExceedLimit}
          />
        )}

        {activeTool === 'pricing' && (
          <PricingSection
            user={user}
            onUpgradeToPro={handleUpgradeToProPrompt}
          />
        )}

        {activeTool === 'dashboard' && user && (
          <Dashboard
            user={user}
            onUpgradeToPro={handleUpgradeToProPrompt}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        reason={paywallReason}
        onProceedToAuthAndPayment={handleProceedFromPaywallToAuth}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        intentToSubscribe={authIntentToSubscribe}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
