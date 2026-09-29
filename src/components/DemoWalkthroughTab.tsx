import React, { useState } from 'react';
import { 
  PlayCircle, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Brain, 
  AlertTriangle, 
  Sparkles, 
  Laptop, 
  Layers, 
  ArrowDown,
  ShieldCheck,
  Send
} from 'lucide-react';

interface DemoWalkthroughTabProps {
  onNavigateToTab: (tab: string) => void;
  onRetainCustomMemory: (memory: any) => Promise<void>;
  onSimulateDriver: () => void;
}

export const DemoWalkthroughTab: React.FC<DemoWalkthroughTabProps> = ({
  onNavigateToTab,
  onRetainCustomMemory,
  onSimulateDriver
}) => {
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [scene3FeedbackSubmitted, setScene3FeedbackSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scenes = [
    {
      num: 1,
      title: "Scene 1: The Problem (User Confused)",
      subtitle: "Windows user receives an update notification but doesn't understand what it means."
    },
    {
      num: 2,
      title: "Scene 2: Agent Explains the Update",
      subtitle: "Agent detects new update and translates cryptic KB metadata into plain English."
    },
    {
      num: 3,
      title: "Scene 3: User Reports Hardware Glitch",
      subtitle: "User reports: 'Last time I installed a graphics update, my display had problems.' Agent retains in Hindsight."
    },
    {
      num: 4,
      title: "Scene 4: Next Similar Update Arrives",
      subtitle: "Another display driver update is detected by the WUA collector."
    },
    {
      num: 5,
      title: "Scene 5: Agent Adapts and Warns User",
      subtitle: "Agent recalls the display flickering incident and dynamically injects caution advice."
    },
    {
      num: 6,
      title: "Scene 6: Inspect Hindsight Memory Bank",
      subtitle: "Judges see the retain → recall → reflect chain that made the adaptation possible."
    }
  ];

  const handleRunScene3Feedback = async () => {
    setIsSubmitting(true);
    try {
      await onRetainCustomMemory({
        title: 'Display flickering reported after graphics driver install',
        content: 'User reported display flickering and 144Hz monitor blackouts after installing graphics update KB5042211. Advise extra caution, work saving, and restore point on upcoming graphics drivers.',
        type: 'outcome',
        category: 'Driver',
        tags: ['driver', 'graphics', 'display_issue', 'flickering', 'caution'],
        impactWeight: 5
      });
      setScene3FeedbackSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentScene === 3 && !scene3FeedbackSubmitted) {
      handleRunScene3Feedback();
    }
    if (currentScene === 4) {
      onSimulateDriver();
    }
    if (currentScene < 6) {
      setCurrentScene(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentScene(1);
    setScene3FeedbackSubmitted(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Interactive Hackathon Demo Script</span>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                6-Scene Presentation Story
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Step through the exact scenario recommended for judges to prove how Hindsight turns Windows updates into a true continuous learning agent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scenario</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentScene === 6}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>{currentScene === 6 ? 'Completed' : 'Next Scene'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scene Stepper Navigation */}
        <div className="grid grid-cols-6 gap-2 mt-5 pt-4 border-t border-slate-800">
          {scenes.map(s => {
            const isActive = currentScene === s.num;
            const isPassed = currentScene > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentScene(s.num)}
                className={`p-2 rounded-lg text-left transition-all border ${
                  isActive
                    ? 'bg-purple-950/40 border-purple-500/50 ring-1 ring-purple-500/20'
                    : isPassed
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                    : 'bg-slate-950/30 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span>Scene {s.num}</span>
                  {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className={`text-[11px] font-medium mt-1 truncate ${isActive ? 'text-white' : ''}`}>
                  {s.title.split(':')[1]?.trim() || s.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scene Display Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
        {/* Scene 1: The Problem */}
        {currentScene === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 font-mono">
              SCENE 1: THE WINDOWS UPDATE DILEMMA
            </div>
            <h3 className="text-base font-bold text-white">
              A typical user sees a confusing Windows update notification
            </h3>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs text-slate-500 font-mono">Windows Update Settings (Stock OS Screen):</div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-white">
                  2026-09 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5061234)
                </div>
                <div className="text-slate-400">
                  Status: Pending download · Size: 2,470 MB · Error: None
                </div>
                <div className="text-[11px] text-slate-500">
                  Some updates require restarting your device. You can schedule the restart when you're not using your PC.
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">What the user doesn't know:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1 pl-2">
                  <li>What actually changed?</li>
                  <li>Is it security-related or a feature?</li>
                  <li>Will it break my daily applications or games?</li>
                  <li>What happened the last time I installed a similar update?</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentScene(2)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Proceed to Scene 2: Introduce Agent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scene 2: Agent Explains the Update */}
        {currentScene === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 font-mono">
              SCENE 2: AGENT INTERVENES WITH CONCISE TRANSLATION
            </div>
            <h3 className="text-base font-bold text-white">
              The agent translates cryptic KB metadata into actionable human language
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-500 font-mono">Traditional Cryptic View:</div>
                <div className="text-slate-300 font-mono bg-slate-900 p-3 rounded border border-slate-800 text-[11px]">
                  KB5061234 — Cumulative Update — 2.3 GB — Servicing Stack 26100.1742 — RPC, TCP/IP, DirectX Core
                </div>
              </div>

              <div className="bg-purple-950/20 p-4 rounded-xl border border-purple-500/30 space-y-2 text-xs">
                <div className="text-purple-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Windows Insight Agent Says:
                </div>
                <div className="bg-slate-900/90 p-3.5 rounded-lg border border-purple-900/40 text-slate-200 space-y-2">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    🔐 Security & System Update (KB5061234)
                  </div>
                  <p className="leading-relaxed text-[11px] text-slate-300">
                    Microsoft released this update to fix security vulnerabilities in Windows networking and stop File Explorer memory leaks.
                  </p>
                  <div className="text-[11px] text-slate-400">
                    <strong>What you should do:</strong> A 10-minute restart is required. Install when you are ready to take a break.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCurrentScene(1)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentScene(3)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Proceed to Scene 3: User Feedback</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scene 3: User Reports Problem */}
        {currentScene === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 font-mono">
              SCENE 3: THE LEARNING TRIGGER (USER PROBLEM REPORT)
            </div>
            <h3 className="text-base font-bold text-white">
              The user tells the agent about a past hardware glitch
            </h3>
            <p className="text-xs text-slate-300">
              In August, after installing an Intel graphics driver, the user's external monitor flickered and had blackouts. Watch how Hindsight retains this critical experience.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400 font-medium">Simulated User Feedback on Driver Update:</div>
              <div className="flex items-start gap-3 bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-xs">
                <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white shrink-0 font-bold">
                  U
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-white">User Report:</div>
                  <p className="text-slate-300 italic">
                    "Last time I installed an Intel graphics driver update (KB5042211), my primary monitor started flickering and I had to rollback the driver. Please warn me about display updates in the future."
                  </p>
                </div>
              </div>

              {!scene3FeedbackSubmitted ? (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Click below to retain this experience into Hindsight memory bank:</span>
                  <button
                    onClick={handleRunScene3Feedback}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Retaining in Hindsight...' : 'Retain in Hindsight Bank'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Experience Retained!</strong> Stored in memory bank <code className="font-mono text-purple-300">windows-update-agent</code> with impact weight 5/5.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCurrentScene(2)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!scene3FeedbackSubmitted) handleRunScene3Feedback();
                  setCurrentScene(4);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Proceed to Scene 4: Next Driver Arrives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scene 4: Next Similar Update Arrives */}
        {currentScene === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 font-mono">
              SCENE 4: A NEW GRAPHICS DRIVER ARRIVES (KB5068912)
            </div>
            <h3 className="text-base font-bold text-white">
              The WUA collector detects a new Intel Graphics Driver update
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-white font-bold">KB5068912</span>
                <span className="text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">Category: Driver</span>
              </div>
              <p className="text-slate-300">
                Intel Corporation - Display - 32.0.101.5972 Graphics Driver & Display Adapter (680 MB, restart required).
              </p>
              <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-lg text-purple-200 text-xs">
                <strong>Hindsight Trigger: </strong>
                Agent immediately queries: <em>"What do I know about Intel graphics driver updates and user hardware outcomes?"</em>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCurrentScene(3)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentScene(5)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Proceed to Scene 5: See Adapted Explanation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scene 5: Agent Adapts & Warns User */}
        {currentScene === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono">
              SCENE 5: THE LEARNING LOOP PAYOFF (ADAPTED EXPLANATION)
            </div>
            <h3 className="text-base font-bold text-white">
              Instead of generic boilerplate, the agent warns the user based on memory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Without Memory */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 opacity-70">
                <div className="text-slate-500 font-semibold">Without Memory (Generic):</div>
                <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-400 font-mono text-[11px]">
                  "KB5068912 is a display driver update. Install update and reboot."
                </div>
              </div>

              {/* With Hindsight */}
              <div className="bg-purple-950/25 p-4 rounded-xl border border-purple-500/40 space-y-2">
                <div className="text-purple-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> With Hindsight Memory (Personalized):
                </div>
                <div className="bg-slate-900 p-3.5 rounded-lg border border-purple-900/40 text-slate-200 space-y-2">
                  <div className="text-amber-400 font-semibold flex items-center gap-1">
                    ⚠️ Caution: Graphics Driver Update (KB5068912)
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    "This update affects your Intel display driver. You previously experienced screen flickering on your external monitor after installing a graphics update (KB5042211)."
                  </p>
                  <div className="text-[11px] text-sky-300 bg-sky-950/40 p-2 rounded border border-sky-900/40">
                    <strong>Recommended Action:</strong> Save your active work documents, close full-screen games, and create a system restore point before installation.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCurrentScene(4)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentScene(6)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <span>Proceed to Scene 6: Inspect Hindsight Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scene 6: Inspect Hindsight Memory Graph */}
        {currentScene === 6 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 font-mono">
              SCENE 6: HINDSIGHT VISIBILITY (RETAIN · RECALL · REFLECT)
            </div>
            <h3 className="text-base font-bold text-white">
              The complete memory chain making the agent intelligent
            </h3>

            {/* Visual Flow Graph */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-mono uppercase">1. Retain Experience</div>
                  <div className="text-xs font-semibold text-white mt-1">KB5042211 Regression</div>
                  <div className="text-[11px] text-slate-400 mt-1">Stored display flickering crash</div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-purple-900/40">
                  <div className="text-[10px] text-purple-400 font-mono uppercase">2. Recall Semantic</div>
                  <div className="text-xs font-semibold text-purple-300 mt-1">KB5068912 Match</div>
                  <div className="text-[11px] text-slate-400 mt-1">Matched "Intel Display Driver"</div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-sky-900/40">
                  <div className="text-[10px] text-sky-400 font-mono uppercase">3. Reflect & Reason</div>
                  <div className="text-xs font-semibold text-sky-300 mt-1">Risk Mitigation</div>
                  <div className="text-[11px] text-slate-400 mt-1">Applied save work warning</div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-emerald-900/40">
                  <div className="text-[10px] text-emerald-400 font-mono uppercase">4. Personalized Output</div>
                  <div className="text-xs font-semibold text-emerald-300 mt-1">Safe User Outcome</div>
                  <div className="text-[11px] text-slate-400 mt-1">Clear, safe, calibrated</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Verified in memory bank <code className="text-purple-300 font-mono">windows-update-agent</code>.
                </span>
                <button
                  onClick={() => onNavigateToTab('memory')}
                  className="text-purple-400 hover:text-purple-300 underline font-medium"
                >
                  Inspect Full Memory Bank →
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Hackathon Scenario</span>
              </button>

              <button
                onClick={() => onNavigateToTab('overview')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
