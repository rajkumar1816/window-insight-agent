import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Laptop
} from 'lucide-react';
import { WindowsUpdate, UpdateExplanation, FeedbackRecord } from '../types/update.ts';

interface UpdatesTabProps {
  updates: WindowsUpdate[];
  selectedUpdate: WindowsUpdate | null;
  onSelectUpdate: (update: WindowsUpdate) => void;
  explanation: UpdateExplanation | null;
  isLoadingExplanation: boolean;
  onExplainUpdate: (update: WindowsUpdate) => void;
  onInspectReasoning: (update: WindowsUpdate) => void;
  onSubmitFeedback: (feedback: {
    updateId: string;
    kbNumber: string;
    rating: 'positive' | 'negative';
    tag: FeedbackRecord['tag'];
    comment?: string;
  }) => Promise<void>;
  feedbackSuccessMessage: string | null;
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({
  updates,
  selectedUpdate,
  onSelectUpdate,
  explanation,
  isLoadingExplanation,
  onExplainUpdate,
  onInspectReasoning,
  onSubmitFeedback,
  feedbackSuccessMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [feedbackRating, setFeedbackRating] = useState<'positive' | 'negative' | null>(null);
  const [feedbackTag, setFeedbackTag] = useState<FeedbackRecord['tag']>('helpful');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Filter updates
  const filteredUpdates = updates.filter(u => {
    const matchesSearch = 
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.kbNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.affectedComponents.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterCategory === 'pending') {
      return u.status === 'Available' || u.status === 'Pending Download';
    }
    if (filterCategory === 'installed') {
      return u.status === 'Installed';
    }
    if (filterCategory === 'driver') {
      return u.category === 'Driver';
    }
    if (filterCategory === 'security') {
      return u.category === 'Security' || u.category === 'Cumulative';
    }
    return true;
  });

  const handleSendFeedback = async () => {
    if (!selectedUpdate || !feedbackRating) return;
    setIsSubmittingFeedback(true);
    try {
      await onSubmitFeedback({
        updateId: selectedUpdate.id,
        kbNumber: selectedUpdate.kbNumber,
        rating: feedbackRating,
        tag: feedbackTag,
        comment: feedbackComment.trim() || undefined
      });
      setFeedbackComment('');
      setFeedbackRating(null);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by KB number, driver, or component..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'pending', label: 'Pending / New' },
            { id: 'installed', label: 'Installed' },
            { id: 'driver', label: 'Drivers' },
            { id: 'security', label: 'Security' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterCategory === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Update List & Interactive Agent Explanation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Updates Table */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-200">
              Windows Update Queue & History ({filteredUpdates.length})
            </div>
            <span className="text-[11px] text-slate-500">Click any row to inspect</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[640px] overflow-y-auto">
            {filteredUpdates.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No updates match the selected filters.
              </div>
            ) : (
              filteredUpdates.map(u => {
                const isSelected = selectedUpdate?.id === u.id;
                const isDriver = u.category === 'Driver';
                const isPending = u.status === 'Available' || u.status === 'Pending Download';

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSelectUpdate(u);
                      onExplainUpdate(u);
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-sky-950/30 border-l-2 border-l-sky-400' 
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white">{u.kbNumber}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs font-medium text-slate-300">{u.category}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs font-mono text-slate-400 tabular-nums">
                            {(u.sizeBytes / 1000000).toFixed(0)} MB
                          </span>
                          {u.rebootRequired && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="text-[11px] text-amber-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Restart
                              </span>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-slate-300 font-medium line-clamp-1">
                          {u.title}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Status: <strong className={isPending ? 'text-sky-300' : 'text-slate-400'}>{u.status}</strong></span>
                          <span>·</span>
                          <span>Released: {u.releaseDate}</span>
                          {isDriver && (
                            <span className="text-amber-400 font-mono text-[10px]">
                              [Hardware Driver]
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            onSelectUpdate(u);
                            onExplainUpdate(u);
                          }}
                          className="px-2.5 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Explain with Agent"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span className="hidden sm:inline">Explain</span>
                        </button>
                        <button
                          onClick={() => {
                            onSelectUpdate(u);
                            onInspectReasoning(u);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition-colors"
                          title="Why did the agent say this?"
                        >
                          <Brain className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Agent Explanation & Learning Feedback Box */}
        <div className="lg:col-span-5 space-y-4">
          {selectedUpdate ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              {/* Card Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-sky-400">{selectedUpdate.kbNumber}</span>
                    <span className="text-xs text-slate-400 font-medium">Agent Explanation</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Mode: <strong className="text-purple-300">Hindsight Enabled</strong> (Learns from history)
                  </div>
                </div>

                <button
                  onClick={() => onInspectReasoning(selectedUpdate)}
                  className="px-2.5 py-1 text-[11px] font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded flex items-center gap-1.5 transition-colors"
                >
                  <Brain className="w-3 h-3" />
                  <span>Why say this?</span>
                </button>
              </div>

              {/* Explanation Content */}
              <div className="p-5 space-y-4">
                {isLoadingExplanation ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                    <div className="text-xs text-slate-300 font-medium">
                      Recalling Hindsight memories & analyzing update impact...
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Querying past driver outcomes & user language preferences
                    </div>
                  </div>
                ) : explanation ? (
                  <>
                    {/* Hindsight Adaptation Banner */}
                    {explanation.hindsightContext?.adaptationExplanation && (
                      <div className="bg-purple-950/30 border border-purple-800/40 rounded-lg p-3 text-xs text-purple-200 flex items-start gap-2.5">
                        <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-purple-300">Hindsight Recall: </strong>
                          <span>{explanation.hindsightContext.adaptationExplanation}</span>
                        </div>
                      </div>
                    )}

                    {/* Simple User-Friendly Explanation */}
                    <div>
                      <div className="text-xs font-semibold text-slate-300 mb-1.5">
                        What this means for you:
                      </div>
                      <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 font-normal">
                        {explanation.simpleExplanation}
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
                      <div className="text-[11px] text-slate-400 font-medium">Recommended Action:</div>
                      <div className="text-xs text-white font-medium mt-0.5">
                        {explanation.recommendedAction}
                      </div>
                    </div>

                    {/* Key Attributes Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800/60">
                        <div className="text-[10px] text-slate-500">Importance</div>
                        <div className={`font-semibold ${
                          explanation.importance === 'Critical' ? 'text-red-400' :
                          explanation.importance === 'High' ? 'text-amber-400' : 'text-slate-300'
                        }`}>
                          {explanation.importance}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800/60">
                        <div className="text-[10px] text-slate-500">Restart Required</div>
                        <div className={`font-semibold ${
                          explanation.restartRequired ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {explanation.restartRequired ? 'Yes (Plan Ahead)' : 'No (Silent)'}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Technical Details (Anti-clutter rule) */}
                    <div>
                      <button
                        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
                      >
                        {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{showTechnicalDetails ? 'Hide technical details' : 'View raw technical details'}</span>
                      </button>

                      {showTechnicalDetails && (
                        <div className="mt-2 p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 space-y-2">
                          <div>
                            <span className="text-slate-500">Affected Components:</span>{' '}
                            <span className="text-slate-300">{selectedUpdate.affectedComponents.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Raw Description:</span>{' '}
                            <span className="text-slate-300">{selectedUpdate.rawDescription}</span>
                          </div>
                          {selectedUpdate.cves && selectedUpdate.cves.length > 0 && (
                            <div>
                              <span className="text-slate-500">MSRC CVEs:</span>{' '}
                              <span className="font-mono text-purple-300">{selectedUpdate.cves.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Step 11 & 15: User Feedback Section (The Learning Loop!) */}
                    <div className="pt-4 border-t border-slate-800">
                      <div className="text-xs font-semibold text-slate-200 mb-2">
                        Was this explanation helpful?
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => {
                            setFeedbackRating('positive');
                            setFeedbackTag('helpful');
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                            feedbackRating === 'positive'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful</span>
                        </button>

                        <button
                          onClick={() => {
                            setFeedbackRating('negative');
                            setFeedbackTag('too_technical');
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                            feedbackRating === 'negative'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Needs Improvement</span>
                        </button>
                      </div>

                      {feedbackRating && (
                        <div className="space-y-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 animate-in fade-in duration-150">
                          <div className="text-[11px] text-slate-400">
                            Tell the agent how to learn:
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'too_technical', label: 'Too technical' },
                              { id: 'too_long', label: 'Too long' },
                              { id: 'need_details', label: 'Need more details' },
                              { id: 'display_issue', label: 'Display problem' },
                              { id: 'audio_issue', label: 'Audio problem' }
                            ].map(item => (
                              <button
                                key={item.id}
                                onClick={() => setFeedbackTag(item.id as FeedbackRecord['tag'])}
                                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                                  feedbackTag === item.id
                                    ? 'bg-purple-500/25 border-purple-500/50 text-purple-200'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={feedbackComment}
                              onChange={(e) => setFeedbackComment(e.target.value)}
                              placeholder="Optional note: e.g. Keep explanations to 2 lines..."
                              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <button
                              onClick={handleSendFeedback}
                              disabled={isSubmittingFeedback}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>Teach</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {feedbackSuccessMessage && (
                        <div className="mt-2 p-2 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs rounded flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feedbackSuccessMessage}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Click "Explain" to generate a personalized explanation with Hindsight.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              Select an update from the list on the left to see the agent's explanation and learning history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
