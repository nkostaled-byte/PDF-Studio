import React from 'react';
import { 
  FileCheck, 
  Combine, 
  Scissors, 
  Minimize2, 
  Image as ImageIcon, 
  CreditCard, 
  User as UserIcon, 
  Sparkles,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';
import { ToolType, UserProfile } from '../types';
import { ProBadge } from './ProBadge';

interface HeaderProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  user: UserProfile | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onUpgradeToPro: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTool,
  onSelectTool,
  user,
  theme,
  onToggleTheme,
  onOpenAuth,
  onUpgradeToPro,
  onLogout,
}) => {
  const isPro = user?.plan === 'pro';

  const toolsList: { id: ToolType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'merge', label: 'Merge', icon: Combine },
    { id: 'split', label: 'Split', icon: Scissors },
    { id: 'compress', label: 'Compress', icon: Minimize2 },
    { id: 'img2pdf', label: 'JPG to PDF', icon: ImageIcon },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTool('merge')} 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-slate-100 tracking-tight transition-colors">PDF Studio</span>
          </div>
        </div>

        {/* Center Tool Switcher Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner max-w-2xl overflow-x-auto no-scrollbar transition-colors">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tool.id === 'pricing' && !isActive ? 'text-amber-500' : ''}`} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side Controls (Theme Toggle, Auth, Plan State) */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <ProBadge 
            plan={user?.plan || 'free'} 
            onClick={isPro ? () => onSelectTool('dashboard') : onUpgradeToPro} 
          />

          {!isPro && (
            <button
              onClick={onUpgradeToPro}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span>Upgrade to Pro</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-xs transition-colors">
              <button
                onClick={() => onSelectTool('dashboard')}
                title="Account Dashboard"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">{user.displayName || user.email.split('@')[0]}</span>
              </button>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-header Navigation Bar for Mid & Mobile Screens */}
      <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 overflow-x-auto px-3 py-2 no-scrollbar transition-colors">
        <div className="flex items-center gap-1.5 min-w-max">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tool.id === 'pricing' && !isActive ? 'text-amber-500' : ''}`} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
