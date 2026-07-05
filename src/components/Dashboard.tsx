import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  CreditCard, 
  FileCheck, 
  HardDrive, 
  Clock, 
  Download, 
  History, 
  User,
  ShieldCheck
} from 'lucide-react';
import { ProcessingHistoryItem, UserProfile } from '../types';
import { getProcessingHistory } from '../lib/firebase';
import { ProBadge } from './ProBadge';

interface DashboardProps {
  user: UserProfile;
  onUpgradeToPro: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onUpgradeToPro }) => {
  const [history, setHistory] = useState<ProcessingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      const items = await getProcessingHistory(user.uid);
      setHistory(items);
      setLoading(false);
    }
    loadHistory();
  }, [user.uid]);

  const isPro = user.plan === 'pro';

  const totalProcessedSize = history.reduce((acc, h) => acc + h.originalSize, 0);
  const totalMb = (totalProcessedSize / (1024 * 1024)).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Profile Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xl font-heading">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {user.displayName || user.email.split('@')[0]}
              </h1>
              <ProBadge plan={user.plan} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {!isPro && (
          <button
            onClick={onUpgradeToPro}
            className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Upgrade to Pro Plan</span>
          </button>
        )}
      </div>

      {/* Subscription Billing Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Paystack Billing & Membership Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Active Tier</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 capitalize text-sm">{user.plan} Membership</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Paystack Reference</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              {user.paystackRef || 'N/A (Free Tier)'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Member Since</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">{history.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Files Processed</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">{totalMb} MB</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Data Processed</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">{Math.round(history.length * 2.5)} mins</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Estimated Time Saved</div>
          </div>
        </div>
      </div>

      {/* Conversion History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Recent Conversion Activity</h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">Stored locally & in Firestore</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">Loading activity history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <FileCheck className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p>No recent processing history yet. Merge or compress a file to view logs here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Original Size</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                      {item.tool}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium truncate max-w-xs">
                      {item.fileName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {(item.originalSize / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(item.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
