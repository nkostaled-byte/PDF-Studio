import React from 'react';
import { Sparkles, Check, Lock, Zap, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  onProceedToAuthAndPayment: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  reason,
  onProceedToAuthAndPayment,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pro Badge Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>PRO FEATURE UNLOCK</span>
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
          Upgrade to PDF Studio Pro
        </h2>

        {reason && (
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{reason}</span>
          </div>
        )}

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Unlock unlimited client-side processing with zero server uploads, priority compression speed, and high-volume batch tools.
        </p>

        {/* Feature Comparison Bullets */}
        <div className="space-y-3 mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>200MB</strong> per file (vs 5MB on Free)</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Batch process up to 100 files</strong> simultaneously</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Page Numbering & Custom Watermarks</strong></span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Saved Conversion History</strong> stored in Firestore</span>
          </div>
        </div>

        {/* Pricing tag & Paystack Trigger */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Pro Membership</div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-heading">
              R95 <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ month ($5/mo)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block text-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-medium px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              Cancel Anytime
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onProceedToAuthAndPayment}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue & Checkout via Paystack</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Paystack 256-bit Encrypted Checkout • Instant Access</span>
        </div>
      </div>
    </div>
  );
};
