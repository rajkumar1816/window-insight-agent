import React, { useState } from 'react';
import { 
  Send, 
  Brain, 
  Sparkles, 
  User, 
  RotateCcw, 
  Laptop, 
  ShieldCheck, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { ChatMessage } from '../types/update.ts';

interface ChatTabProps {
  initialMessages?: ChatMessage[];
}

export const ChatTab: React.FC<ChatTabProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'agent',
      text: "Hello! I am your Windows Insight Agent. I monitor your Windows Update Agent telemetry, remember past update outcomes and issues, and provide personalized guidance. What would you like to know about your system?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeUsed: 'hindsight'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatMode, setChatMode] = useState<'hindsight' | 'no_memory'>('hindsight');

  const suggestedQuestions = [
    "What changed this week?",
    "Did I have problems with similar updates before?",
    "Explain today's update simply",
    "Is it safe to update before my meeting?"
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, mode: chatMode })
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || "I've checked your Windows Update Agent status.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modeUsed: data.modeUsed,
        recalledMemoriesCount: data.recalledMemoriesCount,
        hindsightNotes: data.hindsightNotes
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: "I am temporarily offline from the Windows update agent telemetry. Please retry shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modeUsed: chatMode
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'm-reset',
        sender: 'agent',
        text: "Conversation reset. How can I help you with Windows updates today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modeUsed: chatMode
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Chat Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span>Ask My Windows Agent</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                Grounded in Telemetry & Hindsight
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Query update changes, hardware safety, and past update regressions
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChatMode('hindsight')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                chatMode === 'hindsight'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hindsight Mode
            </button>
            <button
              onClick={() => setChatMode('no_memory')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                chatMode === 'no_memory'
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              No Memory
            </button>
          </div>

          <button
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-500 mr-1">Ask:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 text-xs bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-full transition-colors"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 min-h-[420px] max-h-[520px] overflow-y-auto space-y-4 shadow-inner">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isUser 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[80%] space-y-1.5 ${isUser ? 'items-end' : ''}`}>
                <div className={`p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                  isUser 
                    ? 'bg-sky-600 text-white rounded-tr-none' 
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>

                {/* Hindsight Context Notes */}
                {!isUser && msg.hindsightNotes && msg.hindsightNotes.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px] text-purple-300">
                    {msg.hindsightNotes.map((note, i) => (
                      <span key={i} className="bg-purple-950/40 border border-purple-900/40 px-1.5 py-0.2 rounded font-mono">
                        ✓ {note}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-slate-500 px-1 ${isUser ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
            <span>Consulting Hindsight memory bank & analyzing system telemetry...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask anything: e.g. What changed this week? Did similar updates fail before?..."
          className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
