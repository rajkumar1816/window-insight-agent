import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { OverviewTab } from './components/OverviewTab.tsx';
import { UpdatesTab } from './components/UpdatesTab.tsx';
import { MemoryTab } from './components/MemoryTab.tsx';
import { ModeComparisonTab } from './components/ModeComparisonTab.tsx';
import { ChatTab } from './components/ChatTab.tsx';
import { DemoWalkthroughTab } from './components/DemoWalkthroughTab.tsx';
import { WindowsToast } from './components/WindowsToast.tsx';
import { ReasoningInspectorModal } from './components/ReasoningInspectorModal.tsx';
import { 
  WindowsUpdate, 
  HindsightMemory, 
  UpdateExplanation, 
  FeedbackRecord, 
  AgentLearningMetrics,
  MemoryType 
} from './types/update.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [updates, setUpdates] = useState<WindowsUpdate[]>([]);
  const [memories, setMemories] = useState<HindsightMemory[]>([]);
  const [metrics, setMetrics] = useState<AgentLearningMetrics>({
    totalInteractions: 28,
    memoriesStored: 5,
    preferenceAdaptations: 12,
    outcomesUsed: 16,
    readabilityScore: 94,
    lastLearnedEvent: 'Recalled driver display issue for upcoming Intel graphics update'
  });

  const [selectedUpdate, setSelectedUpdate] = useState<WindowsUpdate | null>(null);
  const [currentExplanation, setCurrentExplanation] = useState<UpdateExplanation | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState<string | null>(null);

  // Inspector Modal State
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorExplanation, setInspectorExplanation] = useState<UpdateExplanation | null>(null);
  const [inspectorUpdate, setInspectorUpdate] = useState<WindowsUpdate | null>(null);

  // Toast Notification State
  const [toastUpdate, setToastUpdate] = useState<WindowsUpdate | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string>(new Date().toISOString());

  // Load initial data from Express backend
  const loadData = async () => {
    try {
      const [updRes, memRes, statRes] = await Promise.all([
        fetch('/api/updates'),
        fetch('/api/memories'),
        fetch('/api/learning-stats')
      ]);

      if (updRes.ok) {
        const d = await updRes.json();
        setUpdates(d.updates || []);
        if (d.updates && d.updates.length > 0 && !selectedUpdate) {
          setSelectedUpdate(d.updates[0]);
        }
      }

      if (memRes.ok) {
        const d = await memRes.json();
        setMemories(d.memories || []);
      }

      if (statRes.ok) {
        const d = await statRes.json();
        if (d.metrics) setMetrics(d.metrics);
      }
    } catch (err) {
      console.warn('Backend API connection warning (running with local state):', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Poll WUA / Scan for updates
  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      const data = await res.json();
      setLastScanTime(data.scannedAt || new Date().toISOString());
      await loadData();
      
      // If there's an available update, show a toast notification
      const pending = updates.find(u => u.status === 'Available' || u.status === 'Pending Download');
      if (pending) {
        setToastUpdate(pending);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Generate explanation for update
  const handleExplainUpdate = async (update: WindowsUpdate) => {
    setSelectedUpdate(update);
    setIsLoadingExplanation(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId: update.id, mode: 'hindsight' })
      });
      const data = await res.json();
      if (data.explanation) {
        setCurrentExplanation(data.explanation);
      }
    } catch (err) {
      console.error('Explanation error:', err);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  // Inspect reasoning chain
  const handleInspectReasoning = async (update: WindowsUpdate) => {
    setInspectorUpdate(update);
    setIsInspectorOpen(true);
    
    // If we already have the explanation for this update, use it; otherwise generate it
    if (currentExplanation && currentExplanation.updateId === update.id && currentExplanation.hindsightContext) {
      setInspectorExplanation(currentExplanation);
    } else {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updateId: update.id, mode: 'hindsight' })
        });
        const data = await res.json();
        if (data.explanation) {
          setInspectorExplanation(data.explanation);
        }
      } catch (err) {
        console.error('Inspect reasoning error:', err);
      }
    }
  };

  // Submit Feedback (The learning loop heart)
  const handleSubmitFeedback = async (fb: {
    updateId: string;
    kbNumber: string;
    rating: 'positive' | 'negative';
    tag: FeedbackRecord['tag'];
    comment?: string;
  }) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fb)
      });
      const data = await res.json();
      setFeedbackSuccessMessage(data.message || 'Feedback retained in Hindsight bank!');
      await loadData();
      setTimeout(() => setFeedbackSuccessMessage(null), 4500);
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  // Retain Memory manually
  const handleRetainMemory = async (mem: {
    title: string;
    content: string;
    type: MemoryType;
    category?: string;
    tags: string[];
    impactWeight: number;
  }) => {
    try {
      await fetch('/api/memories/retain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mem)
      });
      await loadData();
    } catch (err) {
      console.error('Retain memory error:', err);
    }
  };

  // Delete Memory
  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      console.error('Delete memory error:', err);
    }
  };

  // Simulate update injection
  const handleSimulateUpdate = async (type: 'zero_day' | 'graphics_driver' | 'audio_driver') => {
    try {
      const res = await fetch('/api/simulate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.update) {
        setUpdates(prev => [data.update, ...prev]);
        setToastUpdate(data.update);
      }
    } catch (err) {
      console.error('Simulate update error:', err);
    }
  };

  const pendingCount = updates.filter(u => u.status === 'Available' || u.status === 'Pending Download').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Universal Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onScan={handleScan}
        isScanning={isScanning}
        onTriggerToast={() => {
          const candidate = updates.find(u => u.category === 'Driver') || updates[0];
          if (candidate) setToastUpdate(candidate);
        }}
        pendingUpdatesCount={pendingCount}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            updates={updates}
            metrics={metrics}
            onExplainUpdate={(u) => {
              setActiveTab('updates');
              handleExplainUpdate(u);
            }}
            onInspectReasoning={handleInspectReasoning}
            onSimulateUpdate={handleSimulateUpdate}
            onNavigateToTab={setActiveTab}
            lastScanTime={lastScanTime}
            isScanning={isScanning}
            onScan={handleScan}
          />
        )}

        {activeTab === 'updates' && (
          <UpdatesTab
            updates={updates}
            selectedUpdate={selectedUpdate}
            onSelectUpdate={setSelectedUpdate}
            explanation={currentExplanation}
            isLoadingExplanation={isLoadingExplanation}
            onExplainUpdate={handleExplainUpdate}
            onInspectReasoning={handleInspectReasoning}
            onSubmitFeedback={handleSubmitFeedback}
            feedbackSuccessMessage={feedbackSuccessMessage}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryTab
            memories={memories}
            onRetainMemory={handleRetainMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {activeTab === 'comparison' && (
          <ModeComparisonTab updates={updates} />
        )}

        {activeTab === 'chat' && (
          <ChatTab />
        )}

        {activeTab === 'demo' && (
          <DemoWalkthroughTab
            onNavigateToTab={setActiveTab}
            onRetainCustomMemory={handleRetainMemory}
            onSimulateDriver={() => handleSimulateUpdate('graphics_driver')}
          />
        )}
      </main>

      {/* Windows 11 Toast Notification Simulator */}
      <WindowsToast
        update={toastUpdate}
        onExplain={(u) => {
          setActiveTab('updates');
          handleExplainUpdate(u);
          setToastUpdate(null);
        }}
        onView={(u) => {
          setActiveTab('updates');
          setSelectedUpdate(u);
          setToastUpdate(null);
        }}
        onClose={() => setToastUpdate(null)}
      />

      {/* "Why did the agent say this?" Reasoning Inspector Modal */}
      <ReasoningInspectorModal
        explanation={inspectorExplanation}
        update={inspectorUpdate}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onOpenMemoryTab={() => setActiveTab('memory')}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Windows Insight Agent · Continuous Learning with Hindsight</span>
          <span className="font-mono text-[11px] text-slate-600">Memory Bank: windows-update-agent</span>
        </div>
      </footer>
    </div>
  );
}
