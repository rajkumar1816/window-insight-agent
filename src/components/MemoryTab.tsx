import React, { useState } from 'react';
import { 
  Brain, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sliders, 
  History, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Tag, 
  ShieldAlert,
  Search
} from 'lucide-react';
import { HindsightMemory, MemoryType } from '../types/update.ts';

interface MemoryTabProps {
  memories: HindsightMemory[];
  onRetainMemory: (memory: {
    title: string;
    content: string;
    type: MemoryType;
    category?: string;
    tags: string[];
    impactWeight: number;
  }) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
}

export const MemoryTab: React.FC<MemoryTabProps> = ({
  memories,
  onRetainMemory,
  onDeleteMemory
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New memory form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<MemoryType>('preference');
  const [category, setCategory] = useState('Driver');
  const [tagsString, setTagsString] = useState('driver, caution');
  const [impactWeight, setImpactWeight] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const filteredMemories = memories.filter(m => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(query) ||
      m.content.toLowerCase().includes(query) ||
      m.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  const outcomeCount = memories.filter(m => m.type === 'outcome').length;
  const preferenceCount = memories.filter(m => m.type === 'preference').length;
  const historyCount = memories.filter(m => m.type === 'history').length;
  const feedbackCount = memories.filter(m => m.type === 'feedback').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsString
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      await onRetainMemory({
        title: title.trim(),
        content: content.trim(),
        type,
        category: category || 'general',
        tags,
        impactWeight
      });

      setTitle('');
      setContent('');
      setIsFormOpen(false);
      setSuccessNotice('Memory successfully retained in Hindsight bank!');
      setTimeout(() => setSuccessNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (preset: {
    title: string;
    content: string;
    type: MemoryType;
    category: string;
    tags: string;
    impact: number;
  }) => {
    setTitle(preset.title);
    setContent(preset.content);
    setType(preset.type);
    setCategory(preset.category);
    setTagsString(preset.tags);
    setImpactWeight(preset.impact);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Hindsight Memory Bank: windows-update-agent</h2>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                  Retain · Recall · Reflect
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stores update history, user preferences, previous hardware outcomes, and feedback experiences.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Teach Agent Memory</span>
          </button>
        </div>

        {/* Counts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="text-xs">
            <span className="text-slate-400">Total Memories:</span>{' '}
            <strong className="text-white font-mono">{memories.length}</strong>
          </div>
          <div className="text-xs">
            <span className="text-slate-400">Past Outcomes:</span>{' '}
            <strong className="text-amber-400 font-mono">{outcomeCount}</strong>
          </div>
          <div className="text-xs">
            <span className="text-slate-400">User Preferences:</span>{' '}
            <strong className="text-sky-400 font-mono">{preferenceCount}</strong>
          </div>
          <div className="text-xs">
            <span className="text-slate-400">Feedback Records:</span>{' '}
            <strong className="text-purple-300 font-mono">{feedbackCount + historyCount}</strong>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Retain New Memory Form Modal / Inline */}
      {isFormOpen && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-5 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-semibold text-white">Retain New Experience in Hindsight</h3>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Quick Presets for Demo */}
          <div className="mb-4">
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Quick Demo Scenarios:</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset({
                  title: 'Microphone cuts out after Realtek audio updates',
                  content: 'User reported that after realtek audio updates install, microphone input volume resets to 0% and Discord stops detecting sound.',
                  type: 'outcome',
                  category: 'Driver',
                  tags: 'driver, audio, microphone, realtek',
                  impact: 5
                })}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                + Audio Driver Issue
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset({
                  title: 'User works night shifts (Do not prompt reboot 10pm-6am)',
                  content: 'User is active on their PC between 22:00 and 06:00. Always suggest deferring reboots until 09:00.',
                  type: 'preference',
                  category: 'general',
                  tags: 'preference, schedule, reboot, quiet_hours',
                  impact: 4
                })}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                + Night Shift Preference
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset({
                  title: 'Keep explanations under 2 sentences for simple patches',
                  content: 'User strongly prefers minimal explanations for routine Defender and quality updates.',
                  type: 'preference',
                  category: 'general',
                  tags: 'preference, concise, plain_english',
                  impact: 3
                })}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                + Ultra-Concise Rule
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Memory Title / Summary
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Previous display driver caused screen flickering"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Memory Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MemoryType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="outcome">Past Outcome (Problem/Success)</option>
                    <option value="preference">User Preference</option>
                    <option value="feedback">User Feedback</option>
                    <option value="history">Update History</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Impact Weight (1-5)
                  </label>
                  <select
                    value={impactWeight}
                    onChange={(e) => setImpactWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="5">5 - Critical (Always apply)</option>
                    <option value="4">4 - High Impact</option>
                    <option value="3">3 - Moderate</option>
                    <option value="2">2 - Low</option>
                    <option value="1">1 - Informational</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Detailed Memory Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="Describe what occurred, how the user reacted, or what recommendation should be made in the future..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category Scope
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="general">General (All Updates)</option>
                  <option value="Driver">Hardware Drivers</option>
                  <option value="Security">Security & Cumulative</option>
                  <option value="Defender">Windows Defender</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tags (comma-separated for semantic recall)
                </label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="driver, display, caution"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
              >
                {isSubmitting ? 'Retaining...' : 'Retain in Hindsight'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by keyword or tag..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All Memories' },
            { id: 'outcome', label: 'Outcomes' },
            { id: 'preference', label: 'Preferences' },
            { id: 'history', label: 'History' },
            { id: 'feedback', label: 'Feedback' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
            No memories matched your query.
          </div>
        ) : (
          filteredMemories.map(mem => {
            const isOutcome = mem.type === 'outcome';
            const isPref = mem.type === 'preference';

            return (
              <div 
                key={mem.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                        isOutcome ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        isPref ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {isOutcome ? <AlertTriangle className="w-3.5 h-3.5" /> :
                         isPref ? <Sliders className="w-3.5 h-3.5" /> :
                         <History className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        {mem.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-900/60">
                        Weight: {mem.impactWeight}/5
                      </span>
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-white mb-1.5 leading-snug">
                    {mem.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mem.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {mem.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span>{new Date(mem.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
