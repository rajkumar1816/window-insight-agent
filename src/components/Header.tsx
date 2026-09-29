import React from 'react';
import { 
  Laptop, 
  RotateCw, 
  Brain, 
  Layers, 
  MessageSquare, 
  Sparkles, 
  PlayCircle,
  BellRing
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onScan: () => void;
  isScanning: boolean;
  onTriggerToast: () => void;
  pendingUpdatesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onScan,
  isScanning,
  onTriggerToast,
  pendingUpdatesCount
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Laptop },
    { id: 'updates', label: 'Updates', icon: Layers, count: pendingUpdatesCount },
    { id: 'memory', label: 'Agent Memory', icon: Brain },
    { id: 'comparison', label: 'Mode Comparison', icon: Sparkles },
    { id: 'chat', label: 'Ask Agent', icon: MessageSquare },
    { id: 'demo', label: 'Demo Script', icon: PlayCircle }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap">
            Windows Insight Agent
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono tabular-nums bg-sky-500 text-slate-950 font-bold rounded">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onTriggerToast}
            title="Simulate Windows Toast Notification"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
          >
            <BellRing className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline text-xs">Simulate Toast</span>
          </button>

          <button
            onClick={onScan}
            disabled={isScanning}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning WUA...' : 'Check Updates'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-1.5 bg-slate-900/60">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === item.id 
                ? 'bg-sky-500/20 text-sky-300 font-medium' 
                : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
