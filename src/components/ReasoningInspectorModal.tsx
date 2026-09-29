import React from 'react';
import { 
  X, 
  Brain, 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Clock, 
  History,
  Sparkles,
  Layers
} from 'lucide-react';
import { UpdateExplanation, WindowsUpdate } from '../types/update.ts';

interface ReasoningInspectorModalProps {
  explanation: UpdateExplanation | null;
  update: WindowsUpdate | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMemoryTab: () => void;
}

export const ReasoningInspectorModal: React.FC<ReasoningInspectorModalProps> = ({
  explanation,
  update,
  isOpen,
  onClose,
  onOpenMemoryTab
}) => {
  if (!isOpen || !explanation || !update) return null;

  const context = explanation.hindsightContext;
  const isDriver = update.category === 'Driver';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Why Did The Agent Say This?</span>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                  Hindsight Trace
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent multi-layer reasoning chain for {update.kbNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Flow Trace */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Current Update */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Layers className="w-3.5 h-3.5" /> 1. CURRENT UPDATE INPUT
              </span>
              <span className="font-mono text-slate-500">{update.kbNumber}</span>
            </div>
            <div className="text-sm font-semibold text-white">{update.title}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span>Category: <strong className="text-slate-200">{update.category}</strong></span>
              <span>·</span>
              <span>Severity: <strong className="text-slate-200">{update.severity}</strong></span>
              <span>·</span>
              <span>Reboot Required: <strong className={update.rebootRequired ? 'text-amber-400' : 'text-emerald-400'}>{update.rebootRequired ? 'Yes' : 'No'}</strong></span>
              <span>·</span>
              <span>Size: <strong className="text-slate-200 tabular-nums">{(update.sizeBytes / 1000000).toFixed(0)} MB</strong></span>
            </div>
            <div className="mt-2 text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
              Raw WUA Description: "{update.rawDescription}"
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 2: Hindsight Memory Bank Retrieval */}
          <div className="bg-slate-950/70 border border-purple-900/40 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-purple-400 mb-3 font-medium">
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> 2. RECALLED HINDSIGHT MEMORIES ({context?.recalledMemories.length || 0} retrieved)
              </span>
              <button 
                onClick={() => {
                  onClose();
                  onOpenMemoryTab();
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 underline"
              >
                Inspect Bank
              </button>
            </div>

            {context?.recalledMemories && context.recalledMemories.length > 0 ? (
              <div className="space-y-2.5">
                {context.recalledMemories.map(mem => (
                  <div key={mem.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {mem.type === 'outcome' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                        {mem.type === 'preference' && <Sliders className="w-3.5 h-3.5 text-sky-400" />}
                        {mem.type === 'history' && <History className="w-3.5 h-3.5 text-slate-400" />}
                        {mem.title}
                      </span>
                      <span className="text-[10px] text-purple-300 font-mono bg-purple-500/10 px-1.5 py-0.5 rounded">
                        Weight: {mem.impactWeight}/5
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{mem.content}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {mem.tags.map(t => (
                        <span key={t} className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.2 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific previous outcome found; standard preferences applied.</p>
            )}
          </div>

          <div className="flex justify-center -my-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 3: Synthesis & Adaptation */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-sky-400 mb-2 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 3. AGENT REASONING SYNTHESIS
            </div>
            
            <div className="bg-sky-950/20 border border-sky-900/40 rounded-lg p-3 mb-3 text-xs text-sky-200 leading-relaxed">
              <strong>Learning Adaptation: </strong>
              {context?.adaptationExplanation || 'Synthesized based on memory profile.'}
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              {context?.reasoningSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 4: Final Output */}
          <div className="bg-slate-950/90 border border-emerald-900/40 rounded-xl p-4">
            <div className="text-xs text-emerald-400 mb-2 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 4. FINAL USER-FRIENDLY EXPLANATION
              </span>
              <span className="text-[10px] text-emerald-300 font-mono">
                Confidence: {((explanation.confidenceScore || 0.95) * 100).toFixed(0)}%
              </span>
            </div>
            
            <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              {explanation.simpleExplanation}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
              <strong className="text-white">Action Recommendation:</strong>
              <span>{explanation.recommendedAction}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="text-xs text-slate-400">
            Memory bank: <code className="text-purple-300 font-mono">windows-update-agent</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
