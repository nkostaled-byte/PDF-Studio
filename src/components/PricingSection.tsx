import React from 'react';
import { Sparkles, Check, X, ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface PricingSectionProps {
  user: UserProfile | null;
  onUpgradeToPro: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ user, onUpgradeToPro }) => {
  const isPro = user?.plan === 'pro';

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Unlock Unlimited Client-Side Power
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Start for free with zero sign-up required. Upgrade to Pro anytime for high-volume batch processing and unlimited file sizes.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Free Plan Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between relative shadow-sm transition-colors">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Free Tier</span>
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-semibold border border-slate-200 dark:border-slate-700">
                Frictionless Entry
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">R0</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal"> / forever</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              Perfect for quick single-file merges and occasional PDF compression. No account required!
            </p>

            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 mb-8">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Up to <strong>5MB</strong> per PDF file</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Max <strong>3 files</strong> per batch merge/convert</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Browser-Side Privacy</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-600">
                <X className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                <span>Page Numbering & Custom Watermarks</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-600">
                <X className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                <span>Saved Conversion History in Cloud</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-3.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs border border-slate-200 dark:border-slate-700 text-center cursor-not-allowed"
          >
            Currently Active
          </button>
        </div>

        {/* Pro Plan Card */}
        <div className="bg-slate-900 dark:bg-slate-950 border-2 border-indigo-600 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl text-white">
          
          <div className="absolute -top-3.5 right-6 bg-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
            MOST POPULAR
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-lg text-white">Pro Member</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-amber-400 font-heading">R95</span>
              <span className="text-xs text-slate-400 font-normal"> / month ($5/mo)</span>
            </div>

            <p className="text-xs text-slate-300 mb-6 pb-6 border-b border-slate-800">
              For power users and professionals who need heavy batch processing and high-compression features.
            </p>

            <ul className="space-y-3 text-xs text-slate-200 mb-8">
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>200MB</strong> per PDF file size limit</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Batch process up to <strong>100 files</strong> simultaneously</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Page Numbering</strong> & Custom Watermark Tool</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Extreme Compression Engine</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Saved Conversion History in Firestore</span>
              </li>
            </ul>
          </div>

          {isPro ? (
            <div className="w-full py-3.5 px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>You are an Active Pro Subscriber!</span>
            </div>
          ) : (
            <button
              onClick={onUpgradeToPro}
              className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Upgrade to Pro via Paystack</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Paystack Security Guarantee */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Paystack Bank Grade Payment Security</div>
            <div>Supports Debit/Credit Cards, Bank Transfer, Apple Pay, & USSD in ZAR (South African Rand) & USD.</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono text-[10px]">VISA</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono text-[10px]">Mastercard</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono text-[10px]">Verve</span>
        </div>
      </div>
    </div>
  );
};
