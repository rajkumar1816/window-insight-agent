import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  RotateCw, 
  Brain, 
  Sparkles, 
  HardDrive, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Zap,
  Laptop
} from 'lucide-react';
import { WindowsUpdate, AgentLearningMetrics } from '../types/update.ts';

interface OverviewTabProps {
  updates: WindowsUpdate[];
  metrics: AgentLearningMetrics;
  onExplainUpdate: (update: WindowsUpdate) => void;
  onInspectReasoning: (update: WindowsUpdate) => void;
  onSimulateUpdate: (type: 'zero_day' | 'graphics_driver' | 'audio_driver') => void;
  onNavigateToTab: (tab: string) => void;
  lastScanTime: string;
  isScanning: boolean;
  onScan: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  updates,
  metrics,
  onExplainUpdate,
  onInspectReasoning,
  onSimulateUpdate,
  onNavigateToTab,
  lastScanTime,
  isScanning,
  onScan
}) => {
  const pendingUpdates = updates.filter(u => u.status === 'Available' || u.status === 'Pending Download');
  const securityUpdates = updates.filter(u => u.category === 'Security' || u.category === 'Cumulative');
  const driverUpdates = updates.filter(u => u.category === 'Driver');
  const rebootRequiredCount = updates.filter(u => u.rebootRequired && (u.status === 'Available' || u.status === 'Pending Download')).length;

  const urgentUpdate = pendingUpdates.find(u => u.severity === 'Critical') || pendingUpdates[0];

  return (
    <div className="space-y-6">
      {/* System Status Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">System Status: Protected & Monitored</h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ONLINE
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Windows 11 Version 24H2 (x64)</span>
                <span>·</span>
                <span>WUA API Collector: Active</span>
                <span>·</span>
                <span>Hindsight Bank: <strong className="text-purple-300 font-mono">windows-update-agent</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-slate-500">Last Telemetry Scan</div>
              <div className="text-xs font-mono text-slate-300 tabular-nums">
                {new Date(lastScanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <button
              onClick={onScan}
              disabled={isScanning}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Poll WUA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Pending Updates</span>
            <Laptop className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {pendingUpdates.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {updates.length} total monitored updates
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Security & Cumulative</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {securityUpdates.length}
          </div>
          <div className="mt-1 text-[11px] text-purple-400 flex items-center gap-1">
            <span>User preference: Highlighted</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Driver Updates</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {driverUpdates.length}
          </div>
          <div className="mt-1 text-[11px] text-amber-400/90 flex items-center gap-1">
            <span>⚠️ Prior display issue recalled</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Reboot Required</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {rebootRequiredCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Advises schedule-safe installation
          </div>
        </div>
      </div>

      {/* Spotlight: Urgent Pending Action */}
      {urgentUpdate && (
        <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-purple-950/30 border border-sky-800/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-semibold">
                  Action Recommended
                </span>
                <span className="text-xs text-slate-400 font-mono">{urgentUpdate.kbNumber}</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400">{urgentUpdate.category}</span>
              </div>
              <h3 className="text-base font-semibold text-white">
                {urgentUpdate.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {urgentUpdate.rawDescription}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span>Payload: <strong className="text-slate-200 tabular-nums">{(urgentUpdate.sizeBytes / 1000000).toFixed(0)} MB</strong></span>
                <span>·</span>
                <span>Reboot: <strong className={urgentUpdate.rebootRequired ? 'text-amber-400' : 'text-emerald-400'}>{urgentUpdate.rebootRequired ? 'Required' : 'Not Needed'}</strong></span>
                <span>·</span>
                <span className="text-purple-300 flex items-center gap-1 font-medium">
                  <Brain className="w-3.5 h-3.5" /> Hindsight Context Ready
                </span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 shrink-0">
              <button
                onClick={() => onExplainUpdate(urgentUpdate)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explain This Update</span>
              </button>
              <button
                onClick={() => onInspectReasoning(urgentUpdate)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Why say this?</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Agent Learning Heart & WUA Event Injector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Agent Learning & Memory Engine */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Hindsight Learning Engine</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('memory')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>View Bank</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Unlike static notification tools, this agent retains update outcomes, learns your language preferences, and recalls past hardware regressions before recommending new updates.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Interactions</div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">{metrics.totalInteractions}</div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Memories Stored</div>
                <div className="text-lg font-bold font-mono text-purple-300 tabular-nums">{metrics.memoriesStored}</div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Adaptations</div>
                <div className="text-lg font-bold font-mono text-sky-400 tabular-nums">{metrics.preferenceAdaptations}</div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Readability</div>
                <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">{metrics.readabilityScore}%</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Active Memory Highlights:</div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>Prior graphics update (KB5042211) caused display flickering & rollback</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>User prefers plain English, concise 3-bullet points, no kernel jargon</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Automatic caution advisories enforced for GPU & Audio drivers</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Latest event: <em className="text-slate-300">{metrics.lastLearnedEvent}</em></span>
          </div>
        </div>

        {/* Right: Event Injector for Hackathon Demonstrations */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Simulate Windows Update Events</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Live Testing
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Simulate arrival of new updates to test the change detector, Hindsight recall, and Windows 11 notification toasts in real time.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onSimulateUpdate('graphics_driver')}
                className="w-full text-left p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 group-hover:text-amber-300">
                    <span>Inject New Graphics Driver Update</span>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded">Tests Past Issue Recall</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Triggers display driver alert; agent checks past monitor flickering memory.
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </button>

              <button
                onClick={() => onSimulateUpdate('zero_day')}
                className="w-full text-left p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-red-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 group-hover:text-red-300">
                    <span>Inject Emergency Zero-Day Security Patch</span>
                    <span className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.2 rounded">High Priority</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Tests user preference rule: "Always highlight security updates immediately".
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
              </button>

              <button
                onClick={() => onSimulateUpdate('audio_driver')}
                className="w-full text-left p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 group-hover:text-sky-300">
                    <span>Inject Audio Driver Codec Update</span>
                    <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.2 rounded">Hardware</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Tests routine hardware device classification and reboot advice.
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Injecting updates simulates WUA API notifications.</span>
            <button
              onClick={() => onNavigateToTab('demo')}
              className="text-xs text-sky-400 hover:text-sky-300 underline font-medium"
            >
              Open Guided Demo Script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
