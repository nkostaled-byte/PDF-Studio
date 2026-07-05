import React from 'react';
import { ShieldCheck, Lock, FileCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Privacy Security Box */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Client-Side Privacy Guarantee</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All PDF merges, splits, compressions, and image conversions are performed directly inside your browser using JavaScript and WebAssembly. Your documents are never uploaded to any remote server.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
            <Lock className="w-3.5 h-3.5" /> Zero Uploads
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">PDF Studio</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">Powered by Paystack & Firebase</span>
          </div>

          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
            © {new Date().getFullYear()} PDF Studio. All processing client-side.
          </div>
        </div>
      </div>
    </footer>
  );
};
