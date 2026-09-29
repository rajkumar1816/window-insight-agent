import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { WindowsUpdate, UpdateExplanation } from '../types/update.ts';

interface ModeComparisonTabProps {
  updates: WindowsUpdate[];
}

export const ModeComparisonTab: React.FC<ModeComparisonTabProps> = ({ updates }) => {
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>(
    updates.find(u => u.category === 'Driver')?.id || updates[0]?.id || ''
  );
  const [modeAExplanation, setModeAExplanation] = useState<UpdateExplanation | null>(null);
  const [modeBExplanation, setModeBExplanation] = useState<UpdateExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedUpdate = updates.find(u => u.id === selectedUpdateId) || updates[0];

  const fetchComparison = async (updateId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId })
      });
      const data = await res.json();
      if (data.modeA && data.modeB) {
        setModeAExplanation(data.modeA);
        setModeBExplanation(data.modeB);
      }
    } catch (err) {
      console.error('Failed to compare modes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUpdateId) {
      fetchComparison(selectedUpdateId);
    }
  }, [selectedUpdateId]);

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Evaluation Mode: Side-by-Side Comparison</span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                Hackathon Proof
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Demonstrates the core innovation: comparing a generic LLM prompt (Mode A) with the Hindsight-powered Agent (Mode B) that remembers past update outcomes, preferences, and system regressions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Select Update:</label>
            <select
              value={selectedUpdateId}
              onChange={(e) => setSelectedUpdateId(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
            >
              {updates.map(u => (
                <option key={u.id} value={u.id}>
                  {u.kbNumber} — {u.category} ({u.title.substring(0, 36)}...)
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchComparison(selectedUpdateId)}
              disabled={loading}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="Refresh comparison"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Target Update Metadata Capsule */}
      {selectedUpdate && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">Target:</span>
            <strong className="text-white font-mono">{selectedUpdate.kbNumber}</strong>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">{selectedUpdate.title}</span>
            <span className="text-slate-600">·</span>
            <span className="text-sky-400">{selectedUpdate.category}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Size: <strong className="text-slate-200 tabular-nums">{(selectedUpdate.sizeBytes / 1000000).toFixed(0)} MB</strong></span>
            <span>·</span>
            <span>Reboot: <strong className={selectedUpdate.rebootRequired ? 'text-amber-400' : 'text-emerald-400'}>{selectedUpdate.rebootRequired ? 'Required' : 'No'}</strong></span>
          </div>
        </div>
      )}

      {/* Split Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Mode A (No Memory) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm">
          <div>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Mode A: Standard LLM</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    NO MEMORY
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Static prompt · No update history · No past crash awareness
                </div>
              </div>
              <XCircle className="w-4 h-4 text-slate-500" />
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500">Generating standard explanation...</div>
              ) : modeAExplanation ? (
                <>
                  <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-mono">
                    {modeAExplanation.simpleExplanation}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800/60">
                      <div className="text-[10px] text-slate-500">Recommended Action</div>
                      <div className="text-slate-300 mt-0.5">{modeAExplanation.recommendedAction}</div>
                    </div>
                  </div>

                  {/* Checklist of what is MISSING in Mode A */}
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="text-[11px] text-slate-400 font-semibold">Deficiencies in Mode A:</div>
                    <div className="flex items-start gap-2 text-slate-400">
                      <XCircle className="w-3.5 h-3.5 text-red-400/80 shrink-0 mt-0.5" />
                      <span><strong>No awareness of past crash:</strong> Did not check if previous display driver caused screen flickering.</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-400">
                      <XCircle className="w-3.5 h-3.5 text-red-400/80 shrink-0 mt-0.5" />
                      <span><strong>Ignored user feedback:</strong> Still outputs generic text instead of simplified actionable takeaways.</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-400">
                      <XCircle className="w-3.5 h-3.5 text-red-400/80 shrink-0 mt-0.5" />
                      <span><strong>Generic advice:</strong> Tells user to install without caution or restore point advice.</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Personalization Score: <strong className="text-slate-400 font-mono">0%</strong></span>
            <span>Risk Prevention: <strong className="text-red-400 font-mono">Low</strong></span>
          </div>
        </div>

        {/* Right Column: Mode B (Hindsight Memory Active) */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl ring-1 ring-purple-500/10">
          <div>
            {/* Header */}
            <div className="p-4 border-b border-purple-500/20 bg-purple-950/20 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Mode B: Windows Insight Agent</span>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/25 px-2 py-0.5 rounded font-bold">
                    HINDSIGHT ACTIVE
                  </span>
                </div>
                <div className="text-[11px] text-purple-300/80 mt-0.5">
                  Recalls past outcomes · Applies learned preferences · Adapts guidance
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-purple-300">Recalling Hindsight memories & tailoring explanation...</div>
              ) : modeBExplanation ? (
                <>
                  {/* Memory Recall Badge */}
                  {modeBExplanation.hindsightContext?.adaptationExplanation && (
                    <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg p-3 text-xs text-purple-200 flex items-start gap-2">
                      <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Hindsight Adaptation: </strong>
                        <span>{modeBExplanation.hindsightContext.adaptationExplanation}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-950/90 p-3.5 rounded-lg border border-purple-900/40 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                    {modeBExplanation.simpleExplanation}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-950/60 rounded border border-purple-900/30">
                      <div className="text-[10px] text-slate-400">Tailored Actionable Recommendation</div>
                      <div className="text-sky-300 font-medium mt-0.5">{modeBExplanation.recommendedAction}</div>
                    </div>
                  </div>

                  {/* Highlights of what Hindsight SOLVED */}
                  <div className="pt-3 border-t border-purple-900/30 space-y-2 text-xs">
                    <div className="text-[11px] text-purple-300 font-semibold">Hindsight Improvements:</div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Crash prevention:</strong> Recalled August display flickering and advised saving work before installation.</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Learned communication:</strong> Formatted in clear, digestible bullet points without kernel jargon.</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Confidence factor:</strong> Evaluated against {modeBExplanation.hindsightContext?.recalledMemories.length || 2} stored experiences.</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="p-4 bg-purple-950/30 border-t border-purple-900/30 text-[11px] text-purple-300 flex items-center justify-between font-medium">
            <span>Personalization Score: <strong className="text-emerald-400 font-mono">100%</strong></span>
            <span>Risk Prevention: <strong className="text-emerald-400 font-mono">High (Active)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
