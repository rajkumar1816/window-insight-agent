import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { WindowsUpdate } from '../types/update.ts';

interface WindowsToastProps {
  update: WindowsUpdate | null;
  onExplain: (update: WindowsUpdate) => void;
  onView: (update: WindowsUpdate) => void;
  onClose: () => void;
}

export const WindowsToast: React.FC<WindowsToastProps> = ({
  update,
  onExplain,
  onView,
  onClose
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (update) {
      setVisible(true);
      // Play a soft synthetic Windows notification chime via Web Audio API if permitted
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {
        // audio context ignored if browser requires interaction
      }
    } else {
      setVisible(false);
    }
  }, [update]);

  if (!update || !visible) return null;

  const isDriver = update.category === 'Driver';
  const isSecurity = update.category === 'Security' || update.category === 'Cumulative';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl p-4 shadow-2xl shadow-black/60 text-slate-200 ring-1 ring-white/10">
        {/* Windows App Title Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <svg className="w-3.5 h-3.5 fill-sky-400" viewBox="0 0 24 24">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
            </svg>
            <span>Windows Update Agent</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">Just now</span>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3 my-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isDriver 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
          }`}>
            {isDriver ? <AlertTriangle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
              <span>{isDriver ? '⚠️ Driver Update Detected' : '🔐 Important Windows Update'}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {update.title} ({update.kbNumber})
            </p>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
              <span>{(update.sizeBytes / 1000000).toFixed(0)} MB</span>
              <span>·</span>
              <span>{update.rebootRequired ? 'Restart required' : 'No restart'}</span>
              <span>·</span>
              <span className="text-sky-400 flex items-center gap-0.5 font-medium">
                <Sparkles className="w-2.5 h-2.5" /> Hindsight ready
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setVisible(false);
              onView(update);
            }}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            View Details
          </button>
          <button
            onClick={() => {
              setVisible(false);
              onExplain(update);
            }}
            className="px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors font-medium flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>Explain with Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
};
