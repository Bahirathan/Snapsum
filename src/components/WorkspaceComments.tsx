import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkspaceCommentsProps {
  shareId: string;
  visitorUser: any;
  setShowAuthModal?: (show: boolean) => void;
}

interface Comment {
  id: string;
  shareId: string;
  text: string;
  userName: string;
  userAvatar: string;
  userId: string;
  createdAt: string;
}

interface Reactions {
  thumbsup: number;
  heart: number;
  brain: number;
  rocket: number;
  clap: number;
}

export default function WorkspaceComments({ shareId, visitorUser, setShowAuthModal }: WorkspaceCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reactions>({
    thumbsup: 0,
    heart: 0,
    brain: 0,
    rocket: 0,
    clap: 0
  });
  const [commentText, setCommentText] = useState('');
  const [customName, setCustomName] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reactedTypes, setReactedTypes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!shareId) return;

    const fetchData = async () => {
      try {
        setLoadingComments(true);
        const [commentsRes, reactionsRes] = await Promise.all([
          fetch(`/api/shared-summary/${shareId}/comments`),
          fetch(`/api/shared-summary/${shareId}/reactions`)
        ]);

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData.comments || []);
        }

        if (reactionsRes.ok) {
          const reactionsData = await reactionsRes.json();
          setReactions(reactionsData.reactions || {
            thumbsup: 0,
            heart: 0,
            brain: 0,
            rocket: 0,
            clap: 0
          });
        }
      } catch (err) {
        console.error('Error fetching comments/reactions:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchData();
  }, [shareId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    const resolvedName = visitorUser?.displayName || customName.trim() || 'Anonymous Scholar';
    const resolvedAvatar = visitorUser?.photoURL || '';
    const resolvedUserId = visitorUser?.uid || 'guest_' + Math.random().toString(36).substring(2, 9);

    try {
      const res = await fetch(`/api/shared-summary/${shareId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: commentText,
          userName: resolvedName,
          userAvatar: resolvedAvatar,
          userId: resolvedUserId
        })
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
        setCommentText('');
        if (!visitorUser) {
          // Keep the custom name saved in session
          localStorage.setItem('zipytiny_guest_name', resolvedName);
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReact = async (type: keyof Reactions) => {
    // Optimistic update
    setReactions(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + 1
    }));
    setReactedTypes(prev => ({ ...prev, [type]: true }));

    try {
      const res = await fetch(`/api/shared-summary/${shareId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reactionType: type,
          userId: visitorUser?.uid || 'anonymous'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reactions) {
          setReactions(data.reactions);
        }
      }
    } catch (err) {
      console.error('Failed to register reaction:', err);
    }
  };

  // Restore guest name if saved
  useEffect(() => {
    if (!visitorUser) {
      const savedName = localStorage.getItem('zipytiny_guest_name');
      if (savedName) {
        setCustomName(savedName);
      }
    }
  }, [visitorUser]);

  const reactionOptions = [
    { type: 'thumbsup' as const, emoji: '👍', label: 'Like' },
    { type: 'heart' as const, emoji: '❤️', label: 'Love' },
    { type: 'brain' as const, emoji: '🧠', label: 'Insightful' },
    { type: 'rocket' as const, emoji: '🚀', label: 'Inspiring' },
    { type: 'clap' as const, emoji: '👏', label: 'Applaud' }
  ];

  const formatCommentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Reactions Section */}
      <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-5 rounded-2xl shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
          ⚡ Quick Workspace Reactions
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {reactionOptions.map((opt) => {
            const count = reactions[opt.type] || 0;
            const hasReacted = reactedTypes[opt.type];
            return (
              <button
                key={opt.type}
                onClick={() => handleReact(opt.type)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition duration-150 cursor-pointer ${
                  hasReacted
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-750 border-slate-150 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300'
                }`}
              >
                <span className={`text-base transition-transform duration-150 ${hasReacted ? 'scale-125' : 'hover:scale-110'}`}>
                  {opt.emoji}
                </span>
                <span className="font-mono font-bold">{count}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments List Section */}
      <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">
              Discussion Board ({comments.length})
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Collaborative Study
          </span>
        </div>

        {loadingComments ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            Loading study comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="text-2xl">💬</div>
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              No comments yet on this shared workspace.
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Be the first to share your takeaways, ask a question, or start a collaborative discussion!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {comments.map((comment, idx) => (
                <motion.div
                  key={comment.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3 text-xs border-b border-slate-50 dark:border-zinc-850/50 pb-3 last:border-0 last:pb-0"
                >
                  {comment.userAvatar ? (
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-8 h-8 rounded-full border border-black/[0.04] object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-200 dark:border-zinc-700">
                      {comment.userName.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                        {comment.userName}
                        {comment.userId && !comment.userId.startsWith('guest_') && comment.userId !== 'anonymous' && (
                          <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-1.5 py-0.2 rounded-md font-mono font-bold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 shrink-0" />
                            PRO
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-sans pr-2 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Comment Input Box */}
        <form onSubmit={handlePostComment} className="border-t dark:border-zinc-800 pt-4 space-y-3">
          {!visitorUser && (
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Name (e.g., Jane Doe) - Guest Student"
                  maxLength={40}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 focus:bg-white focus:outline-none focus:border-indigo-500 transition duration-150"
                />
              </div>
              {setShowAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('zipytiny_trigger_discuss', 'true');
                    setShowAuthModal(true);
                  }}
                  className="shrink-0 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold px-2.5 py-2.5 rounded-xl border dark:border-zinc-700 cursor-pointer transition"
                >
                  Sign In SSO
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                visitorUser
                  ? "Share an observation or ask a question about this summary..."
                  : "Type a study comment..."
              }
              rows={2}
              maxLength={1000}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 focus:bg-white focus:outline-none focus:border-indigo-500 transition duration-150 leading-relaxed font-sans"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-3.5 rounded-xl cursor-pointer flex items-center justify-center transition duration-150 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
