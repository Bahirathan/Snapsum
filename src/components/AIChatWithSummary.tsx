import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Bot, User, Loader2, RefreshCw } from 'lucide-react';

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

export default function AIChatWithSummary({ title, summary, getHeaders }: AIChatWithSummaryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `👋 Hello! I am your Zipytiny AI Research Assistant. I've digested **"${title}"**.\n\nAsk me anything about this content! You can query key facts, ask for simplification, expand on terms, or extract concrete action plans.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'What is the core thesis of this content?',
    'Extract a bulleted list of immediate Action Items.',
    'Explain the most complex concept here like I am 12.',
    'What are some practical follow-up questions to ask?',
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
      // Map history to Google Gemini SDK format: [{ role: 'user' | 'model', parts: [{ text: string }] }]
      const chatHistory = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
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
          className="text-[10px] font-mono text-[#86868b] hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-800"
          title="Clear Conversation History"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold shadow-sm ${
                isUser 
                  ? 'bg-neutral-800 text-white dark:bg-zinc-700' 
                  : 'bg-indigo-600 text-white dark:bg-indigo-500'
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                isUser 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-zinc-950 text-neutral-800 dark:text-zinc-200 border border-black/[0.02] dark:border-zinc-800/60 rounded-tl-none shadow-sm'
              }`}>
                <p className="whitespace-pre-line text-left">{m.text}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="h-7 w-7 rounded-full bg-indigo-600 text-white shrink-0 flex items-center justify-center shadow-sm">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-white dark:bg-zinc-950 text-neutral-500 dark:text-zinc-400 border border-black/[0.02] dark:border-zinc-800/60 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-medium font-mono">Assistant is reading transcript & formulating insights...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Prompts */}
      {messages.length === 1 && (
        <div className="px-5 py-2.5 bg-neutral-100/50 dark:bg-zinc-900 border-t border-black/[0.02] dark:border-zinc-800/60">
          <p className="text-[9px] font-mono uppercase tracking-widest text-[#86868b] dark:text-zinc-400 mb-1.5 text-left font-bold">Suggested Prompts</p>
          <div className="flex flex-wrap gap-1.5 justify-start">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[10px] font-sans font-medium text-[#1d1d1f] dark:text-zinc-300 bg-white dark:bg-zinc-950 border border-black/[0.05] dark:border-zinc-800/60 px-3 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:border-black/[0.1] transition cursor-pointer text-left shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Tray */}
      <div className="p-4 bg-white dark:bg-zinc-950/85 border-t border-black/[0.04] dark:border-zinc-800/60">
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
            className="flex-1 px-4 py-3 text-xs bg-neutral-100/60 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500/50 outline-none rounded-xl transition placeholder:text-neutral-400 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
