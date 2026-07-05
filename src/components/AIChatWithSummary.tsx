import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, RefreshCw, Zap, ChevronRight } from 'lucide-react';

interface AIChatWithSummaryProps {
  title: string;
  summary: string;
  getHeaders: () => Record<string, string>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// Render **bold** markdown inline
function renderInlineMd(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      : part
  );
}

export default function AIChatWithSummary({ title, summary, getHeaders }: AIChatWithSummaryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `👋 Hello! I'm your Zipytiny **AI Research Assistant**. I've fully digested **"${title}"**.\n\nAsk me anything — key facts, simplifications, action plans, or deep-dives on any concept.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    '🎯 Core thesis in one sentence',
    '📋 Bulleted list of Action Items',
    '🧒 Explain the main concept to a 12-year-old',
    '❓ What follow-up questions should I ask?',
    '🔑 Key takeaways in 5 bullet points',
    '⚡ What surprised you most in this content?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          summary,
          message: textToSend,
          history: chatHistory,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI reply');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'model',
        text: data.reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          text: '❌ Apologies, I encountered an issue connecting to the AI brain. Please try again, or make sure your server API key or custom key is fully configured!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: `👋 Hello! Let's start fresh. I've digested **"${title}"**.\n\nAsk me anything!`,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[520px] bg-neutral-50 dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800/60 rounded-3xl overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="px-5 py-4 bg-white dark:bg-zinc-950/80 border-b border-black/[0.04] dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-200">AI Summary Companion</h4>
            <p className="text-[10px] text-[#86868b] dark:text-zinc-400 truncate max-w-[200px] sm:max-w-xs">Ask specific queries about this item</p>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="text-[10px] font-medium text-indigo-200 hover:text-white transition flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-white/10"
          title="Clear Conversation History"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none bg-neutral-50 dark:bg-zinc-950/50">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'ml-auto flex-row-reverse max-w-[82%]' : 'mr-auto max-w-[88%]'} animate-scaleIn`}
            >
              <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold shadow-sm ${
                isUser
                  ? 'bg-zinc-800 text-white dark:bg-zinc-700'
                  : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                isUser
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 border border-black/[0.05] dark:border-zinc-800/60 rounded-tl-sm shadow-sm'
              }`}>
                <p className="whitespace-pre-line text-left">{renderInlineMd(m.text)}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 mr-auto max-w-[70%] items-end animate-scaleIn">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shrink-0 flex items-center justify-center shadow-sm">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-4 py-3 bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-zinc-800/60 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-[10px] text-neutral-400 dark:text-zinc-500 font-medium">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Prompts */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-black/[0.04] dark:border-zinc-800/50 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-amber-500" />
            <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 dark:text-zinc-500 font-bold">Quick Questions</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[10px] font-medium text-neutral-700 dark:text-zinc-300 bg-neutral-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 border border-transparent hover:border-indigo-200/60 px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1"
              >
                {q}
                <ChevronRight className="w-2.5 h-2.5 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Tray */}
      <div className="p-3.5 bg-white dark:bg-zinc-950/90 border-t border-black/[0.04] dark:border-zinc-800/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question about this summary..."
            className="flex-1 px-4 py-2.5 text-xs bg-neutral-100 dark:bg-zinc-900 border border-transparent focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-400/60 outline-none rounded-xl transition placeholder:text-neutral-400 dark:text-zinc-500 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-xl transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center shadow-sm active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
