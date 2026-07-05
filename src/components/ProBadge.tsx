import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { UserPlan } from '../types';

interface ProBadgeProps {
  plan: UserPlan;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const ProBadge: React.FC<ProBadgeProps> = ({ plan, size = 'md', onClick }) => {
  if (plan === 'pro') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-bold tracking-wide uppercase shadow-xs ${
          size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs'
        } ${onClick ? 'cursor-pointer hover:border-amber-400' : ''}`}
      >
        <Sparkles className={size === 'sm' ? 'w-3 h-3 text-amber-600' : 'w-4 h-4 text-amber-600'} />
        <span>PRO MEMBER</span>
        <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-0.5" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-slate-900 font-medium transition-all shadow-xs ${
        size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs px-3.5 py-1.5' : 'text-xs'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>Free Tier</span>
      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono border border-indigo-200">
        Upgrade ⚡
      </span>
    </button>
  );
};
