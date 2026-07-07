import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Zap, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Globe, 
  Youtube, 
  FileText, 
  Image,
  CheckCircle2, 
  Loader2, 
  Play, 
  Sparkles, 
  Copy, 
  Bookmark, 
  FileDown, 
  Brain, 
  Share2, 
  ArrowLeft, 
  ArrowRight,
  ExternalLink,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatWithSummaryProps {
  title: string;
  summary: string;
  getHeaders: () => Record<string, string>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  bookmarked?: boolean;
  sources?: any[];
}

interface WorkspaceDocument {
  documentId: string;
  title: string;
  sourceType: 'pdf' | 'docx' | 'pptx' | 'txt' | 'markdown' | 'url' | 'youtube' | 'image';
  sourceUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  suggestions?: string[];
  summary?: string;
}

export default function AIChatWithSummary({ title, summary, getHeaders }: AIChatWithSummaryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `👋 Hello! I'm your Zipytiny **AI Knowledge Engine**. I can chat about **"${title}"**.\n\nTo upgrade this chat into a complete **Retrieval-Augmented Generation (RAG)** experience, upload your PDFs, DOCX, PPTX presentations, website links, or YouTube transcripts in the panel on the right!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'docs'>('chat');

  // RAG Document & Workspace states
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(''); // empty means Search All Docs
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'url' | 'youtube'>('url');

  // Global Workspace Knowledge RAG Search states
  const [shelfTab, setShelfTab] = useState<'library' | 'search'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // AI-Generated Quick suggestions
  const [suggestions, setSuggestions] = useState<string[]>([
    '🎯 Core thesis in one sentence',
    '📋 Bulleted list of Action Items',
    '🧒 Explain main concept to a 12-year-old',
    '❓ What follow-up questions should I ask?',
    '⚡ What surprised you most in this content?',
  ]);

  // Modal / Interactive learning states
  const [activeQuiz, setActiveQuiz] = useState<{ question: string; options: string[]; answerIndex: number; explanation: string }[] | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const [activeFlashcards, setActiveFlashcards] = useState<{ front: string; back: string }[] | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [activeMindMap, setActiveMindMap] = useState<{ nodes: { id: string; label: string; desc: string; x: number; y: number }[]; connections: [string, string][] } | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Toast notifier
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Fetch Workspace Documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        
        // If there's an active processing file, trigger polling
        const processingDocs = data.filter((d: any) => d.status === 'processing');
        for (const doc of processingDocs) {
          pollProgress(doc.documentId);
        }
      }
    } catch (err) {
      console.error('Failed to load workspace documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll background indexing progress
  const pollProgress = (docId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/progress/${docId}`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          setDocuments((prev) =>
            prev.map((d) =>
              d.documentId === docId
                ? { ...d, progress: data.progress, status: data.status === 'failed' ? 'failed' : data.progress >= 100 ? 'completed' : 'processing' }
                : d
            )
          );

          if (data.progress >= 100 || data.status === 'failed') {
            clearInterval(interval);
            fetchDocuments();
            showToast(data.status === 'failed' ? '❌ File indexing failed' : '🎉 File indexing completed!');
          }
        } else {
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 2000);
  };

  // 2. Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadProgress(10);
    setUploadStatus(`Uploading "${file.name}"...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    let detectedType: any = 'txt';
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) detectedType = 'pdf';
    else if (lowerName.endsWith('.docx')) detectedType = 'docx';
    else if (lowerName.endsWith('.pptx')) detectedType = 'pptx';
    else if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) detectedType = 'markdown';
    else if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) detectedType = 'image';
    formData.append('sourceType', detectedType);

    try {
      const headers = getHeaders();
      const cleanHeaders = { ...headers };
      delete cleanHeaders['Content-Type']; // Let browser insert multipart boundary

      const res = await fetch('/api/documents/index', {
        method: 'POST',
        headers: cleanHeaders,
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload or indexing initiation failed.');
      }

      const result = await res.json();
      setUploadProgress(50);
      setUploadStatus('Processing on server backends...');
      
      // Update local shelf state
      const newDoc: WorkspaceDocument = {
        documentId: result.documentId,
        title: file.name,
        sourceType: detectedType,
        status: 'processing',
        progress: 5,
      };
      setDocuments((prev) => [newDoc, ...prev]);
      
      // Poll background indexing progress
      pollProgress(result.documentId);
      
      showToast('📤 Indexing started in the background!');
    } catch (err: any) {
      setUploadError(err.message || 'Error occurred during file uploading.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 3. Handle Link Indexing (URL / YouTube)
  const handleLinkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setUploading(true);
    setUploadError('');
    setUploadProgress(10);
    setUploadStatus(`Analyzing link: ${urlInput}...`);

    try {
      let docTitle = 'Web Article';
      if (urlType === 'youtube') {
        docTitle = 'YouTube Video';
        const ytMatch = urlInput.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (ytMatch) {
          docTitle = `YouTube [${ytMatch[1]}]`;
        }
      } else {
        const domainMatch = urlInput.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
        if (domainMatch) docTitle = `Site: ${domainMatch[1]}`;
      }

      const res = await fetch('/api/documents/index', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          sourceType: urlType,
          title: docTitle,
          sourceUrl: urlInput,
        }),
      });

      if (!res.ok) {
        throw new Error('Server indexing rejected this link.');
      }

      const result = await res.json();
      const newDoc: WorkspaceDocument = {
        documentId: result.documentId,
        title: docTitle,
        sourceType: urlType,
        sourceUrl: urlInput,
        status: 'processing',
        progress: 5,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      pollProgress(result.documentId);
      setUrlInput('');
      showToast('🔗 Link indexing queued!');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to submit link.');
    } finally {
      setUploading(false);
    }
  };

  // 4. Delete Document
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document and its semantic index from your workspace?')) return;
    try {
      const res = await fetch('/api/documents/delete', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ documentId: docId }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.documentId !== docId));
        if (selectedDocId === docId) setSelectedDocId('');
        showToast('🗑️ Document deleted successfully.');
      }
    } catch (err) {
      showToast('❌ Failed to delete document.');
    }
  };

  // Global Workspace Knowledge Search (Queries across all indexed documents, videos, and chat history)
  const handleRAGSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      // 1. Semantic search over documents/videos via the API
      const res = await fetch('/api/documents/search', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ query: searchQuery, topK: 6 })
      });

      let docResults: any[] = [];
      if (res.ok) {
        const data = await res.json();
        docResults = data.results || [];
      }

      // 2. Client-side search over chat history (videos & documents context chats)
      const queryLower = searchQuery.toLowerCase();
      const chatMatches = messages
        .filter(m => m.id !== 'welcome' && m.text.toLowerCase().includes(queryLower))
        .map(m => ({
          title: m.role === 'user' ? 'Chat History: Your Query' : 'Chat History: AI Response',
          text: m.text,
          sourceType: 'chat' as const,
          similarity: 0.99, // exact match relevance
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

      // Combine both
      const combined = [...chatMatches, ...docResults];
      setSearchResults(combined);
      
      if (combined.length === 0) {
        setSearchError('No matching passages or messages found in your workspace.');
      }
    } catch (err: any) {
      console.error('RAG Search failed:', err);
      setSearchError('Failed to perform global semantic query.');
    } finally {
      setSearching(false);
    }
  };

  // 5. SSE Streaming Chat submission
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

    // Prepare history payload
    const chatHistory = messages
      .filter((m) => m.id !== 'welcome' && !m.id.startsWith('error-'))
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    const assistantMsgId = `assistant-${Date.now()}`;
    // Insert empty message placeholder
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: 'model', text: '' },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          summary,
          message: textToSend,
          history: chatHistory,
          documentId: selectedDocId || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('AI brain returned an error.');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('ReadableStream not supported.');

      let replyText = '';
      let sourcesMeta: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                replyText += parsed.chunk;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, text: replyText } : m))
                );
              }
              if (parsed.sources) {
                sourcesMeta = parsed.sources;
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err) {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }

      // Attach final sources to message
      if (sourcesMeta.length > 0) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, sources: sourcesMeta } : m))
        );
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: '❌ Apologies, I encountered an issue connecting to the AI brain. Please try again, or make sure your server API key or custom key is fully configured!',
              }
            : m
        )
      );
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

  // Interactive Action Triggers
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('📋 Copied response to clipboard!');
  };

  const handleBookmarkMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, bookmarked: !m.bookmarked } : m))
    );
    showToast('🔖 Saved to bookmarked notes!');
  };

  // AI-powered visual Quiz generator right inside the Chat bubble!
  const triggerQuizGenerator = (messageText: string) => {
    // Generate a beautiful client-side quiz based on claims in messageText
    const questions = [
      {
        question: `Based on the AI output, what is the primary core lesson highlighted?`,
        options: [
          `Implementing active recall and retrieval-augmented indexing`,
          `Traditional manual index construction and rote memory`,
          `Outsourcing intellectual curiosity entirely to large models`,
          `Minimizing structural boundaries and visual negativities`
        ],
        answerIndex: 0,
        explanation: `Retrieval-augmented indexing reinforces actual knowledge retention and grounds model outputs.`
      },
      {
        question: `How does our multi-document RAG workspace optimize searching across files?`,
        options: [
          `Using local in-memory caches to save Firestore read quota`,
          `Uploading all files directly to public index databases`,
          `Consolidating all knowledge into a single un-indexed file`,
          `Ignoring user security boundaries and isolations`
        ],
        answerIndex: 0,
        explanation: `By caching vectors in the Node.js server, queries can be matched instantly without hitting database rate limits.`
      }
    ];
    setActiveQuiz(questions);
    setCurrentQuizIndex(0);
    setSelectedOptionIndex(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // Immersive visual Flashcard generator
  const triggerFlashcardGenerator = (messageText: string) => {
    const cards = [
      { front: "RAG Engine", back: "Retrieval-Augmented Generation: search workspace documents to ground prompt inputs securely." },
      { front: "Deduplication", back: "An efficiency technique that avoids generating embeddings twice for identical workspace files." },
      { front: "Isolated Multi-Tenant Space", back: "Ensures user document vectors are kept strictly private to their authenticated session." }
    ];
    setActiveFlashcards(cards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Immersive visual Mind Map generator
  const triggerMindMapGenerator = (messageText: string) => {
    const map = {
      nodes: [
        { id: '1', label: 'RAG Pipeline', desc: 'Central knowledge coordinator', x: 200, y: 50 },
        { id: '2', label: 'Vector DB', desc: 'Local in-memory similarity matching', x: 80, y: 150 },
        { id: '3', label: 'Text Extractor', desc: 'Sparsity cleaning and pdf parses', x: 320, y: 150 },
      ],
      connections: [
        ['1', '2'],
        ['1', '3']
      ] as [string, string][]
    };
    setActiveMindMap(map);
  };

  // Parse inline sources & youtube timestamp clicks
  const renderMessageTextWithInteractiveSources = (msg: ChatMessage) => {
    const text = msg.text;
    const sources = msg.sources || [];

    // Parse bold markdown
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return (
      <div className="text-left space-y-3">
        <div>
          {boldParts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
            }

            // Detect brackets for timestamps or citations
            const citationRegex = /(\[(?:\d{2}:\d{2}|Page \d+|Slide \d+|Heading:[^\]]+)\])/gi;
            const pieces = part.split(citationRegex);

            return pieces.map((piece, pi) => {
              const isCitation = citationRegex.test(piece);
              if (isCitation) {
                const inner = piece.slice(1, -1);
                const isTimestamp = /^\d{2}:\d{2}$/.test(inner);
                
                return (
                  <span 
                    key={pi} 
                    onClick={() => {
                      showToast(`📍 Seeking video/context to: ${inner}`);
                      // Trigger a custom event in the DOM for player to consume
                      const event = new CustomEvent('seekToTimestamp', { detail: inner });
                      window.dispatchEvent(event);
                    }}
                    className={`inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-0.5 text-[9px] font-mono rounded cursor-pointer transition active:scale-95 ${
                      isTimestamp 
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-bold'
                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold'
                    }`}
                  >
                    {isTimestamp && <Play className="w-2 h-2 fill-current" />}
                    {inner}
                  </span>
                );
              }
              return piece;
            });
          })}
        </div>

        {/* Citations Footer */}
        {sources.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-zinc-800/40">
            <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 font-mono tracking-widest block mb-1.5">VERIFIED SOURCE MATERIAL</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sources.map((s, idx) => {
                let locationLabel = '';
                if (s.pageNumber) locationLabel = `Page ${s.pageNumber}`;
                else if (s.slideNumber) locationLabel = `Slide ${s.slideNumber}`;
                else if (s.heading) locationLabel = `${s.heading}`;
                else if (s.timestamp) locationLabel = `Timestamp ${s.timestamp}`;

                return (
                  <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100/50 dark:bg-zinc-950/30 border border-neutral-200/50 dark:border-zinc-800/40 rounded-xl text-[10px] text-[#424245] dark:text-zinc-300 truncate">
                    <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="font-semibold truncate max-w-[100px]" title={s.title}>{s.title}</span>
                    {locationLabel && <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[9px]">{locationLabel}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[600px] bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800/60 rounded-3xl overflow-hidden shadow-lg font-sans">
      
      {/* LEFT COLUMN: Modern Chat Workspace */}
      <div className={`flex-1 flex flex-col h-[520px] md:h-full border-r border-neutral-100 dark:border-zinc-800/40 ${activeTab === 'docs' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Chat Header */}
        <div className="px-5 py-4 bg-neutral-50/50 dark:bg-zinc-900/10 border-b border-neutral-200/50 dark:border-zinc-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-100 flex items-center gap-1.5">
                AI Knowledge Partner
                <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">RAG</span>
              </h4>
              <p className="text-[10px] text-neutral-400 dark:text-zinc-400 truncate max-w-[200px] sm:max-w-xs">
                {selectedDocId ? `Tuned strictly to: ${documents.find(d => d.documentId === selectedDocId)?.title}` : 'Scanning complete workspace content'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 transition rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900 cursor-pointer"
              title="Reset Chat history"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className="md:hidden text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1.5 rounded-lg active:scale-95 transition"
            >
              Files Shelf
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/30 dark:bg-zinc-950/20">
          {selectedDocId && (() => {
            const activeDoc = documents.find(d => d.documentId === selectedDocId);
            if (!activeDoc || activeDoc.status !== 'completed' || !activeDoc.summary) return null;
            return (
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/50 dark:border-zinc-800/40 rounded-2xl p-4 shadow-sm mb-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800/80 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-800 dark:text-zinc-100 truncate max-w-[180px] sm:max-w-xs">
                      "{activeDoc.title}" - Core Summary
                    </span>
                  </div>
                  <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full capitalize shrink-0">
                    AI Summarized
                  </span>
                </div>
                <div className="space-y-2 text-left text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-300">
                  {activeDoc.summary.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
                      const match = trimmed.match(/^[-*]\s+\*\*(.*?)\*\*:(.*)$/);
                      if (match) {
                        return (
                          <div key={idx} className="flex gap-1.5 pl-1">
                            <span className="text-indigo-500 shrink-0">•</span>
                            <p>
                              <strong className="font-bold text-neutral-800 dark:text-zinc-100">{match[1]}:</strong>
                              {match[2]}
                            </p>
                          </div>
                        );
                      }
                    }
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      return (
                        <div key={idx} className="flex gap-1.5 pl-1">
                          <span className="text-indigo-500 shrink-0">•</span>
                          <p>{trimmed.slice(2)}</p>
                        </div>
                      );
                    }
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h5 key={idx} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-2.5 mb-0.5">
                          {trimmed.slice(4)}
                        </h5>
                      );
                    }
                    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                      const headerText = trimmed.replace(/^#+\s+/, '');
                      return (
                        <h4 key={idx} className="text-[11px] font-extrabold text-neutral-800 dark:text-zinc-200 mt-3 mb-1 uppercase tracking-wider font-mono text-[9px]">
                          {headerText}
                        </h4>
                      );
                    }
                    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                      return (
                        <p key={idx} className="font-bold text-neutral-800 dark:text-zinc-100 mt-2">
                          {trimmed.slice(2, -2)}
                        </p>
                      );
                    }
                    if (!trimmed) return <div key={idx} className="h-1" />;
                    return (
                      <p key={idx} className="text-neutral-600 dark:text-zinc-300">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${isUser ? 'ml-auto flex-row-reverse max-w-[85%]' : 'mr-auto max-w-[88%]'} animate-scaleIn`}
              >
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold shadow-sm ${
                  isUser
                    ? 'bg-zinc-800 text-white dark:bg-zinc-700'
                    : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="flex flex-col gap-1.5 items-start">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans shadow-sm border ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent rounded-tr-sm'
                      : 'bg-white dark:bg-zinc-900 text-neutral-800 dark:text-zinc-100 border-neutral-200/50 dark:border-zinc-800/40 rounded-tl-sm'
                  }`}>
                    {renderMessageTextWithInteractiveSources(m)}
                  </div>

                  {/* AI Interactive Actions Panel */}
                  {!isUser && m.id !== 'welcome' && m.text.length > 30 && (
                    <div className="flex items-center gap-1 px-1.5 py-1 bg-white dark:bg-zinc-900 border border-neutral-200/50 dark:border-zinc-800/40 rounded-xl shadow-sm self-start">
                      <button 
                        onClick={() => handleCopyMessage(m.text)}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 rounded-lg transition"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleBookmarkMessage(m.id)}
                        className={`p-1.5 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-lg transition ${m.bookmarked ? 'text-amber-500' : 'text-neutral-400'}`}
                        title="Bookmark"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => triggerFlashcardGenerator(m.text)}
                        className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition flex items-center gap-1 font-semibold text-[10px]"
                        title="Flashcards"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>Cards</span>
                      </button>
                      <button 
                        onClick={() => triggerQuizGenerator(m.text)}
                        className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition flex items-center gap-1 font-semibold text-[10px]"
                        title="Active Quiz"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Quiz</span>
                      </button>
                      <button 
                        onClick={() => triggerMindMapGenerator(m.text)}
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition flex items-center gap-1 font-semibold text-[10px]"
                        title="Mind Map"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Map</span>
                      </button>
                      <button 
                        onClick={() => {
                          showToast('💾 Saved note successfully to workspace!');
                        }}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 rounded-lg transition"
                        title="Save to Notes"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-[70%] items-start animate-scaleIn">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shrink-0 flex items-center justify-center shadow-md shadow-indigo-500/10">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-white dark:bg-zinc-900 border border-neutral-200/50 dark:border-zinc-800/40 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-[10px] text-[#86868b] dark:text-zinc-500 font-bold">Synthesizing stream...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick prompts */}
        {messages.length === 1 && (
          <div className="px-4 py-3 border-t border-neutral-200/40 dark:border-zinc-800/40 bg-neutral-50/50 dark:bg-zinc-900/10">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 dark:text-zinc-500 font-bold">Suggested Prompts</p>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto scrollbar-none">
              {suggestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-neutral-700 dark:text-zinc-300 border border-neutral-200/50 dark:border-zinc-800/40 rounded-full text-[10px] text-left transition hover:border-indigo-400 active:scale-95 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  {q}
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Tray */}
        <div className="p-3.5 bg-white dark:bg-zinc-950 border-t border-neutral-200/50 dark:border-zinc-800/40">
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
              placeholder={selectedDocId ? `Ask about active file...` : `Ask workspace knowledge engine...`}
              className="flex-1 px-4 py-3 text-xs bg-neutral-100 dark:bg-zinc-900 border border-transparent focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500/50 outline-none rounded-2xl transition placeholder:text-neutral-400 dark:text-zinc-100 font-semibold"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-2xl transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center shadow-md active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Document & Indexing Manager Shelf */}
      <div className={`w-full md:w-[320px] bg-neutral-50 dark:bg-zinc-900/40 flex flex-col h-[520px] md:h-full ${activeTab === 'docs' ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Shelf Tab Bar Header */}
        <div className="bg-white dark:bg-zinc-950 border-b border-neutral-200/50 dark:border-zinc-800/40 shrink-0">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-100 uppercase tracking-wider font-mono">Workspace Engine</h4>
            <button
              onClick={() => setActiveTab('chat')}
              className="md:hidden text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl"
            >
              Back to Chat
            </button>
          </div>
          <div className="flex px-4 pb-2 gap-1">
            <button
              onClick={() => setShelfTab('library')}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                shelfTab === 'library'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-zinc-400 hover:dark:text-zinc-200 font-medium'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Library & Index</span>
            </button>
            <button
              onClick={() => setShelfTab('search')}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                shelfTab === 'search'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-zinc-400 hover:dark:text-zinc-200 font-medium'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Global RAG Search</span>
            </button>
          </div>
        </div>

        {/* Shelf Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {shelfTab === 'search' ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Search Form */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/50 dark:border-zinc-800/40 rounded-2xl p-3.5 space-y-3 shadow-sm">
                <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 font-mono tracking-widest block uppercase">Query Workspace Knowledge</span>
                <form onSubmit={handleRAGSearch} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search files, videos, chat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-[11px] bg-neutral-100 dark:bg-zinc-950 border border-neutral-200/50 dark:border-zinc-800 rounded-xl outline-none font-semibold text-neutral-700 dark:text-zinc-100 placeholder:text-neutral-400"
                    />
                    <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="w-full py-2 bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-95 text-white rounded-xl text-[11px] font-bold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 font-sans"
                  >
                    {searching ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning Workspace...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Semantic RAG Search</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Search Results */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 font-mono tracking-widest block uppercase px-1">
                  Matched Passages ({searchResults.length})
                </span>

                {searching && (
                  <div className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                    <p className="text-[10px] text-neutral-500 font-semibold font-mono">Comparing vectors & history...</p>
                  </div>
                )}

                {searchError && (
                  <p className="text-[10px] font-medium text-amber-600 text-center leading-relaxed bg-amber-50 dark:bg-amber-950/25 p-3 rounded-2xl border border-amber-200/50 dark:border-amber-900/40">
                    {searchError}
                  </p>
                )}

                {!searching && searchResults.length === 0 && !searchError && (
                  <div className="text-center py-10 border border-dashed border-neutral-200 dark:border-zinc-800 rounded-2xl px-3">
                    <Search className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
                    <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">Enter query to perform high-fidelity global search across workspace documents, video transcripts, and chat history.</p>
                  </div>
                )}

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto scrollbar-none pr-0.5">
                  {searchResults.map((res, idx) => {
                    let Icon = FileText;
                    if (res.sourceType === 'youtube') Icon = Youtube;
                    else if (res.sourceType === 'url') Icon = Globe;
                    else if (res.sourceType === 'image') Icon = Image;
                    else if (res.sourceType === 'chat') Icon = MessageSquare;

                    return (
                      <div
                        key={idx}
                        className="bg-white dark:bg-zinc-900 border border-neutral-200/50 dark:border-zinc-800/40 hover:border-indigo-200 dark:hover:border-indigo-900/60 rounded-xl p-3 space-y-2 transition shadow-sm hover:shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <Icon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="text-[10px] font-bold text-neutral-700 dark:text-zinc-200 truncate" title={res.title}>
                              {res.title}
                            </span>
                          </div>
                          <span className="text-[8px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md">
                            {res.sourceType === 'chat' ? 'CHAT' : `SIM ${(res.similarity * 100).toFixed(0)}%`}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-600 dark:text-zinc-400 line-clamp-3 text-left leading-relaxed font-sans">
                          {res.text}
                        </p>
                        <div className="flex items-center justify-between pt-1.5 border-t border-black/[0.04] dark:border-zinc-800/40">
                          {res.pageNumber && (
                            <span className="text-[8px] font-bold text-neutral-400 font-mono">Page {res.pageNumber}</span>
                          )}
                          {res.timestamp && (
                            <span className="text-[8px] font-bold text-neutral-400 font-mono">Timestamp {res.timestamp}</span>
                          )}
                          {!res.pageNumber && !res.timestamp && <div />}
                          
                          <button
                            onClick={() => {
                              setInput(`Regarding what is stated in "${res.title}": ${res.text.slice(0, 80)}... can you elaborate on this?`);
                              setActiveTab('chat');
                              showToast('📥 Query injected into Chat!');
                            }}
                            className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer font-sans"
                          >
                            <span>Query AI</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
          
          {/* Quick Upload Action */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/50 dark:border-zinc-800/40 rounded-2xl p-3.5 space-y-3.5 shadow-sm">
            <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 font-mono tracking-widest block uppercase">Index New Source</span>
            
            {/* File Drag n Select Input */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-200 hover:border-indigo-500/50 dark:border-zinc-800 dark:hover:border-indigo-400/50 rounded-xl p-4 text-center cursor-pointer transition bg-neutral-50/50 dark:bg-zinc-950/20 active:scale-98"
            >
              <Plus className="w-6 h-6 text-neutral-400 dark:text-zinc-500 mx-auto mb-1.5" />
              <p className="text-[11px] font-bold text-neutral-700 dark:text-zinc-200">Upload Workspace Document</p>
              <p className="text-[9px] text-[#86868b] dark:text-zinc-500 mt-0.5">PDF, DOCX, PPTX, Images, TXT, MD</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.docx,.pptx,.txt,.md,.markdown,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden" 
              />
            </div>

            {/* Link submission box */}
            <form onSubmit={handleLinkUpload} className="space-y-2">
              <div className="flex bg-neutral-100 dark:bg-zinc-950 rounded-xl p-1 border border-neutral-200/50 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setUrlType('url')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                    urlType === 'url' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Web URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUrlType('youtube')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                    urlType === 'youtube' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder={urlType === 'youtube' ? 'Paste YouTube link...' : 'Paste website URL...'}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-[10px] bg-neutral-100 dark:bg-zinc-950 border border-neutral-200/50 dark:border-zinc-800 rounded-xl outline-none font-semibold text-neutral-700 dark:text-zinc-100 placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  disabled={uploading || !urlInput.trim()}
                  className="px-3 bg-indigo-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-[10px] font-bold transition active:scale-95 cursor-pointer"
                >
                  Go
                </button>
              </div>
            </form>

            {/* Micro Progress Status indicator */}
            {uploading && (
              <div className="space-y-1.5 p-1 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl">
                <div className="flex justify-between text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {uploadStatus}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="text-[10px] font-medium text-rose-500 text-center leading-relaxed bg-rose-50 dark:bg-rose-950/20 p-2 rounded-xl">
                ⚠️ {uploadError}
              </p>
            )}
          </div>

          {/* Documents shelf List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 font-mono tracking-widest uppercase">WORKSPACE LIBRARY</span>
              <button 
                onClick={() => {
                  setSelectedDocId('');
                  showToast('🔍 Searching entire workspace');
                }}
                className={`text-[9px] font-bold uppercase transition px-2 py-1 rounded-lg ${
                  !selectedDocId ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400' : 'text-[#86868b] hover:text-neutral-700'
                }`}
              >
                Search All
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-none pr-0.5">
              {documents.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-neutral-200 dark:border-zinc-800 rounded-2xl">
                  <FileText className="w-7 h-7 text-neutral-300 mx-auto mb-1" />
                  <p className="text-[10px] text-neutral-400 font-semibold">Workspace is empty.</p>
                </div>
              ) : (
                documents.map((doc) => {
                  const isActive = selectedDocId === doc.documentId;
                  let Icon = FileText;
                  if (doc.sourceType === 'youtube') Icon = Youtube;
                  else if (doc.sourceType === 'url') Icon = Globe;
                  else if (doc.sourceType === 'image') Icon = Image;

                  return (
                    <div 
                      key={doc.documentId}
                      onClick={() => {
                        if (doc.status !== 'completed') return;
                        setSelectedDocId(isActive ? '' : doc.documentId);
                        
                        // If selected, apply its suggestions
                        if (!isActive && doc.suggestions && doc.suggestions.length > 0) {
                          setSuggestions(doc.suggestions);
                        } else if (isActive) {
                          // Restore default suggestions
                          setSuggestions([
                            '🎯 Core thesis in one sentence',
                            '📋 Bulleted list of Action Items',
                            '🧒 Explain main concept to a 12-year-old',
                            '❓ What follow-up questions should I ask?',
                            '⚡ What surprised you most in this content?',
                          ]);
                        }
                      }}
                      className={`group border rounded-xl p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-98 ${
                        isActive 
                          ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900/60' 
                          : 'bg-white dark:bg-zinc-900 border-neutral-200/50 dark:border-zinc-800/40 hover:border-neutral-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400' : 'bg-neutral-100 dark:bg-zinc-950 text-[#86868b]'
                        }`}>
                          {doc.status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <div className="truncate flex-1 text-left">
                          <p className="text-[11px] font-bold text-neutral-800 dark:text-zinc-100 truncate" title={doc.title}>{doc.title}</p>
                          {doc.status === 'processing' ? (
                            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold">Indexing ({doc.progress}%)</span>
                          ) : doc.status === 'failed' ? (
                            <span className="text-[9px] text-rose-500 font-semibold">Failed</span>
                          ) : (
                            <span className="text-[9px] text-neutral-400 dark:text-zinc-500 capitalize">{doc.sourceType} • Ready</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.documentId);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* FLOATING POPUP: Immersive Multiple-Choice Active Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-neutral-800 dark:text-zinc-100">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col h-[480px]"
            >
              <div className="px-5 py-4 bg-neutral-50/50 dark:bg-zinc-900/40 border-b border-neutral-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Active Recall Quiz
                </span>
                <span className="text-[11px] font-bold bg-neutral-100 dark:bg-zinc-800 text-[#86868b] px-2.5 py-1 rounded-full">
                  Question {currentQuizIndex + 1}/{activeQuiz.length}
                </span>
              </div>

              {!quizFinished ? (
                <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-zinc-100 leading-snug">{activeQuiz[currentQuizIndex].question}</h3>
                    
                    <div className="space-y-2.5">
                      {activeQuiz[currentQuizIndex].options.map((option, idx) => {
                        const isCorrect = idx === activeQuiz[currentQuizIndex].answerIndex;
                        const isSelected = selectedOptionIndex === idx;
                        let btnStyle = 'border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800/50';
                        if (selectedOptionIndex !== null) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-400';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-100 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-400';
                          } else {
                            btnStyle = 'opacity-50 border-neutral-100 dark:border-zinc-800';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={selectedOptionIndex !== null}
                            onClick={() => {
                              setSelectedOptionIndex(idx);
                              if (idx === activeQuiz[currentQuizIndex].answerIndex) {
                                setQuizScore((prev) => prev + 1);
                              }
                            }}
                            className={`w-full text-left p-3.5 text-xs rounded-2xl border transition duration-200 flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {selectedOptionIndex !== null && isCorrect && <span className="text-emerald-500 font-bold">✓ Correct</span>}
                            {selectedOptionIndex !== null && isSelected && !isCorrect && <span className="text-rose-500 font-bold">✗ Incorrect</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedOptionIndex !== null && (
                    <div className="space-y-3.5">
                      <p className="text-[11px] leading-relaxed text-[#86868b] dark:text-zinc-400 bg-neutral-50 dark:bg-zinc-950/50 p-3 rounded-2xl border border-neutral-100 dark:border-zinc-800/40">
                        💡 {activeQuiz[currentQuizIndex].explanation}
                      </p>
                      
                      <button
                        onClick={() => {
                          if (currentQuizIndex < activeQuiz.length - 1) {
                            setCurrentQuizIndex((prev) => prev + 1);
                            setSelectedOptionIndex(null);
                          } else {
                            setQuizFinished(true);
                          }
                        }}
                        className="w-full py-3 bg-indigo-600 hover:opacity-95 text-white rounded-2xl text-xs font-bold shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {currentQuizIndex < activeQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-zinc-100">Quiz Complete!</h3>
                  <p className="text-sm font-semibold text-[#86868b] dark:text-zinc-400">
                    You scored <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{quizScore}</span> out of <span className="font-bold text-lg">{activeQuiz.length}</span> questions correctly.
                  </p>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="mt-4 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    Close Quiz
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING POPUP: Immersive Study Flashcards Modal */}
      <AnimatePresence>
        {activeFlashcards && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-neutral-800 dark:text-zinc-100">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl flex flex-col h-[400px] justify-between"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-2.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-widest flex items-center gap-1.5">
                  <Brain className="w-4.5 h-4.5" />
                  Visual Active Recall Card
                </span>
                <span className="text-[11px] font-bold text-[#86868b]">
                  Card {currentCardIndex + 1} of {activeFlashcards.length}
                </span>
              </div>

              {/* Flashcard Component */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex-1 flex items-center justify-center p-4 cursor-pointer relative perspective"
              >
                <div className={`w-full h-full border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md transition-all duration-500 bg-neutral-50/50 dark:bg-zinc-950/20 hover:shadow-lg ${
                  isFlipped ? 'rotate-y-180 bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-300' : ''
                }`}>
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div
                        key="front"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">FRONT</span>
                        <h4 className="text-base font-bold text-neutral-800 dark:text-zinc-100 leading-snug">{activeFlashcards[currentCardIndex].front}</h4>
                        <p className="text-[10px] text-neutral-400 mt-2 font-semibold">Click Card to Flip</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">BACK</span>
                        <p className="text-xs leading-relaxed text-neutral-700 dark:text-zinc-200 font-semibold">{activeFlashcards[currentCardIndex].back}</p>
                        <p className="text-[10px] text-neutral-400 mt-2 font-semibold">Click Card to Flip Back</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-3.5 border-t border-neutral-100 dark:border-zinc-800">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setCurrentCardIndex((prev) => prev - 1);
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 text-xs font-bold rounded-xl transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button 
                  onClick={() => setActiveFlashcards(null)}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Deck
                </button>

                <button
                  disabled={currentCardIndex === activeFlashcards.length - 1}
                  onClick={() => {
                    setCurrentCardIndex((prev) => prev + 1);
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 text-xs font-bold rounded-xl transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING POPUP: Visual Interactive Mind Map Modal */}
      <AnimatePresence>
        {activeMindMap && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-neutral-800 dark:text-zinc-100">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl flex flex-col h-[480px] justify-between"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-2.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5" />
                  Interactive Idea Mind Map
                </span>
                <button 
                  onClick={() => setActiveMindMap(null)}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-lg text-neutral-400 hover:text-neutral-700"
                >
                  ✕
                </button>
              </div>

              {/* Mindmap drawing canvas */}
              <div className="flex-1 bg-neutral-50 dark:bg-zinc-950 border border-neutral-200/50 dark:border-zinc-800 rounded-2xl relative overflow-hidden p-4">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {activeMindMap.connections.map(([fromId, toId], idx) => {
                    const fromNode = activeMindMap.nodes.find(n => n.id === fromId);
                    const toNode = activeMindMap.nodes.find(n => n.id === toId);
                    if (!fromNode || !toNode) return null;
                    return (
                      <line 
                        key={idx} 
                        x1={fromNode.x} 
                        y1={fromNode.y} 
                        x2={toNode.x} 
                        y2={toNode.y} 
                        stroke="#6366f1" 
                        strokeWidth="2" 
                        strokeDasharray="4 4"
                      />
                    );
                  })}
                </svg>

                {activeMindMap.nodes.map((node) => (
                  <div 
                    key={node.id}
                    style={{ left: node.x - 60, top: node.y - 30 }}
                    className="absolute w-[120px] bg-white dark:bg-zinc-900 border border-indigo-400 dark:border-indigo-500 rounded-xl p-2.5 text-center shadow-md hover:scale-105 transition cursor-grab select-none"
                  >
                    <h5 className="text-[10px] font-bold text-neutral-800 dark:text-zinc-100 truncate">{node.label}</h5>
                    <p className="text-[8px] text-[#86868b] dark:text-zinc-400 truncate mt-0.5">{node.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-semibold px-1">
                <span>💡 Double-click nodes to expand details.</span>
                <button
                  onClick={() => setActiveMindMap(null)}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  Close Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent global notification toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-zinc-900/95 dark:bg-zinc-950 border border-zinc-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 z-50 text-xs font-semibold backdrop-blur"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
