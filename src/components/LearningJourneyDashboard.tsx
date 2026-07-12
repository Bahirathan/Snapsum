/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  BookOpen, 
  Network, 
  Video, 
  Check, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight, 
  Zap, 
  History, 
  RotateCcw,
  Sparkles,
  Play,
  Bookmark,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lightbulb,
  Award,
  ChevronRight,
  RefreshCw,
  Star,
  Activity,
  Clock,
  Shield,
  Brain,
  FileText,
  Folder,
  Calendar,
  Plus,
  ChevronLeft,
  LayoutDashboard,
  Flame,
  Book,
  GraduationCap,
  FolderPlus,
  Trash2,
  FolderOpen,
  Search,
  BookOpenCheck,
  Tag,
  Link2,
  X,
  Compass,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  YouTubeSummaryResponse, 
  LearningMemoryGraph, 
  MemoryConcept, 
  VideoLearningSession,
  QuizQuestion,
  DailyChallengeQuestion,
  SavedSummary
} from '../types';
import { loadMemoryGraph, saveMemoryGraph } from './LearningDashboard';
import KnowledgeGraphVisualizer, { GraphNode, GraphLink } from './KnowledgeGraphVisualizer';

// Custom interface matching App.tsx states passed down
interface LearningJourneyDashboardProps {
  onLoadVideo: (videoId: string, isSummary: boolean) => void;
  onActivateDemo: (response: YouTubeSummaryResponse) => void;
  onLoadStack?: (stack: any) => void;
  savedSummaries?: SavedSummary[];
  onUpdateSavedSummaries?: (updated: SavedSummary[]) => void;
  savedStacks?: any[];
  collections?: string[];
  onAddCollection?: (name: string) => void;
  visitorUser?: any;
  setShowAuthModal?: (show: boolean) => void;
  setAuthModalPurpose?: (purpose: string) => void;
}

// Reusable Metric Card component
interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  progress?: number;
  badge?: string;
  badgeColor?: string;
}

function MetricCard({ title, value, subtext, icon, progress, badge, badgeColor }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between min-h-[145px] relative overflow-hidden group">
      <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.04] blur-2xl rounded-full group-hover:scale-125 transition-transform duration-500"></div>
      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 dark:text-zinc-500 uppercase">{title}</span>
        <div className="p-1.5 rounded-xl bg-neutral-50 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
          {icon}
        </div>
      </div>
      <div className="my-2 text-left z-10">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-neutral-950 dark:text-zinc-100">{value}</span>
          {badge && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono uppercase ${badgeColor || 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'}`}>
              {badge}
            </span>
          )}
        </div>
        {progress !== undefined && (
          <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      <div className="text-[10px] text-neutral-500 dark:text-zinc-400 font-light text-left leading-normal font-sans z-10">
        {subtext}
      </div>
    </div>
  );
}

export default function LearningJourneyDashboard({
  onLoadVideo,
  onActivateDemo,
  onLoadStack,
  savedSummaries = [],
  onUpdateSavedSummaries,
  savedStacks = [],
  collections = [],
  onAddCollection,
  visitorUser,
  setShowAuthModal,
  setAuthModalPurpose
}: LearningJourneyDashboardProps) {
  const [graph, setGraph] = useState<LearningMemoryGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<MemoryConcept | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(false);
  const [dailyChoice, setDailyChoice] = useState<number | null>(null);
  const [dailySubmitted, setDailySubmitted] = useState<boolean>(false);
  const [currentDaily, setCurrentDaily] = useState<DailyChallengeQuestion | null>(null);
  const [activeRevisionConcept, setActiveRevisionConcept] = useState<MemoryConcept | null>(null);
  const [revisionTypedAnswer, setRevisionTypedAnswer] = useState<string>('');
  const [revisionFeedback, setRevisionFeedback] = useState<string | null>(null);
  const [revisionStage, setRevisionStage] = useState<'type' | 'assess' | 'done'>('type');
  const [showAllConcepts, setShowAllConcepts] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Connected Knowledge System tabs & layout
  const [activeDashboardTab, setActiveDashboardTab] = useState<'graph' | 'vault' | 'stats'>('graph');
  const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<GraphNode[]>([]);
  
  // Custom sidebar/editor inputs
  const [nodePersonalNotes, setNodePersonalNotes] = useState<string>('');
  const [nodeTagInput, setNodeTagInput] = useState<string>('');
  const [crossLinkTargetId, setCrossLinkTargetId] = useState<string>('');
  const [crossLinkDescription, setCrossLinkDescription] = useState<string>('');
  
  // Active coordinate simulation state
  const [graphNodesState, setGraphNodesState] = useState<GraphNode[]>([]);
  const [graphLinksState, setGraphLinksState] = useState<GraphLink[]>([]);

  // Redesigned dashboard states
  const [activeFilter, setActiveFilter] = useState<'all' | 'videos' | 'documents' | 'courses' | 'collections'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [showAddFolderInput, setShowAddFolderInput] = useState<boolean>(false);

  // Study Reminders states
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => localStorage.getItem('zipytiny_reminder_enabled') === 'true');
  const [reminderTime, setReminderTime] = useState<string>(() => localStorage.getItem('zipytiny_reminder_time') || '09:00');
  const [reminderFreq, setReminderFreq] = useState<string>(() => localStorage.getItem('zipytiny_reminder_freq') || 'daily');
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  // Daily goal tracking states
  const [reviewedTodayCount, setReviewedTodayCount] = useState<number>(() => {
    const saved = localStorage.getItem('zipytiny_reviewed_today_' + new Date().toDateString());
    return saved ? parseInt(saved, 10) : 0;
  });
  const [insightsSavedToday, setInsightsSavedToday] = useState<boolean>(() => {
    return localStorage.getItem('zipytiny_insights_today_' + new Date().toDateString()) === 'true';
  });
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState<boolean>(() => {
    return localStorage.getItem('zipytiny_daily_bonus_' + new Date().toDateString()) === 'true';
  });

  // Study calendar tracking state
  const [studyCalendar, setStudyCalendar] = useState<string[]>(() => {
    const stored = localStorage.getItem('zipytiny_study_calendar');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const logStudyActivity = () => {
    const todayStr = new Date().toDateString();
    setStudyCalendar((prev) => {
      if (!prev.includes(todayStr)) {
        const next = [...prev, todayStr];
        localStorage.setItem('zipytiny_study_calendar', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  };

  // Sync graph state
  useEffect(() => {
    const loaded = loadMemoryGraph();
    
    // Check streaks & last active date
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (loaded.lastActiveDate && loaded.lastActiveDate !== today) {
      if (loaded.lastActiveDate !== yesterday) {
        loaded.streak = 1;
      }
      loaded.lastActiveDate = today;
      saveMemoryGraph(loaded);
    }
    
    // Seed calendar dates if empty
    const calendarSaved = localStorage.getItem('zipytiny_study_calendar');
    if (!calendarSaved) {
      const dates = [];
      const todayDate = new Date();
      for (let i = 0; i < loaded.streak; i++) {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() - i);
        dates.push(d.toDateString());
      }
      localStorage.setItem('zipytiny_study_calendar', JSON.stringify(dates));
      setStudyCalendar(dates);
    }
    
    setGraph(loaded);

    // Pick Daily Challenge from global preloaded questions array
    const sampleChallenges = [
      {
        question: "According to Steve Jobs' Stanford address, why is it impossible to connect the dots of your life looking forward?",
        options: [
          "Because human intuition is naturally flawed and unpredictable.",
          "Because you can only recognize the value and synergy of life events in hindsight.",
          "Because career advice from academic institutions is usually outdated.",
          "Because modern technology moves too quickly to make accurate plans."
        ],
        answerIndex: 1,
        explanation: "Steve Jobs states that you cannot connect the dots looking forward; you can only connect them looking backward. You have to trust that the dots will somehow connect in your future.",
        conceptName: "Trust and Intuition"
      },
      {
        question: "Which layer of Simon Sinek's Golden Circle corresponds directly to the human neocortex?",
        options: [
          "The 'Why' (Core Purpose)",
          "The 'What' (Rational Features / Language)",
          "The 'How' (Secret Process)",
          "None of the above"
        ],
        answerIndex: 1,
        explanation: "The neocortex parses language, numbers, and logical details, aligning directly with the outer 'What' layer, whereas emotional choices are generated in the inner limbic core.",
        conceptName: "Neurological Anatomy"
      }
    ];

    const dayIndex = new Date().getDate() % sampleChallenges.length;
    setCurrentDaily(sampleChallenges[dayIndex]);

    const doneToday = localStorage.getItem('snapsum_daily_done_' + today) === 'true';
    setDailyCompleted(doneToday);
  }, []);

  if (!graph || !currentDaily) return null;

  const conceptsArray = Object.values(graph.concepts) as MemoryConcept[];
  const sessionsArray = Object.values(graph.sessions) as VideoLearningSession[];

  const topicsMastered = conceptsArray.filter(c => c.masteryLevel >= 70).length;
  const totalConceptsCount = Object.keys(graph.concepts).length;
  const overallComprehensionProgress = totalConceptsCount > 0 
    ? Math.round((conceptsArray.reduce((acc, c) => acc + c.masteryLevel, 0) / (totalConceptsCount * 100)) * 100) 
    : 0;

  // XP awards
  const awardXpPoints = (amount: number, updatedGraph: LearningMemoryGraph) => {
    const nextXp = updatedGraph.xp + amount;
    updatedGraph.xp = nextXp;
    
    const nextLevel = Math.floor(nextXp / 500) + 1;
    if (nextLevel > updatedGraph.level) {
      updatedGraph.level = nextLevel;
    }
    saveMemoryGraph(updatedGraph);
    setGraph({ ...updatedGraph });
  };

  // Synchronize graph nodes and links whenever savedSummaries or graph.concepts change
  useEffect(() => {
    if (!graph) return;
    
    const conceptsArray = Object.values(graph.concepts) as MemoryConcept[];
    
    // Create base nodes list
    const workspaceNodes = savedSummaries.map((item) => {
      return {
        id: `w-${item.id}`,
        type: 'workspace' as const,
        label: item.response?.metadata?.title || 'Untitled Workspace',
        tags: item.tags || [],
        bookmarks: item.bookmarks && item.bookmarks.length > 0,
        personalNotes: item.personalNotes || '',
        crossLinks: item.crossLinks || [],
        rawObject: item
      };
    });

    const conceptNodes = conceptsArray.map((c) => ({
      id: `c-${c.id}`,
      type: 'concept' as const,
      label: c.concept,
      sourceId: c.sourceVideoId,
      mastery: c.masteryLevel,
      tags: c.tags || [],
      bookmarks: c.bookmarks || false,
      personalNotes: c.personalNotes || '',
      crossLinks: c.crossLinks || [],
      rawObject: c
    }));

    const combinedNodes = [...workspaceNodes, ...conceptNodes];

    // Compute positions, preserving existing coordinates if already simulated
    setGraphNodesState((prevNodes) => {
      const centerX = 350;
      const centerY = 220;
      const radius = 160;

      return combinedNodes.map((node, index) => {
        const match = prevNodes.find((pn) => pn.id === node.id);
        if (match) {
          return {
            ...node,
            x: match.x,
            y: match.y,
            vx: match.vx,
            vy: match.vy
          };
        } else {
          const angle = (index / (combinedNodes.length || 1)) * 2 * Math.PI;
          return {
            ...node,
            x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
            y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 40,
            vx: 0,
            vy: 0
          };
        }
      });
    });

    // Compute Links
    const computedLinks: any[] = [];

    // Link concepts to their source workspaces
    conceptNodes.forEach((cn) => {
      if (cn.sourceId) {
        computedLinks.push({
          source: cn.id,
          target: `w-${cn.sourceId}`,
          type: 'source'
        });
      }
    });

    // Link nodes based on manual crossLinks
    combinedNodes.forEach((node) => {
      if (node.crossLinks) {
        node.crossLinks.forEach((targetId) => {
          const actualTargetId = targetId.startsWith('w-') || targetId.startsWith('c-') 
            ? targetId 
            : `w-${targetId}`;

          const alreadyLinked = computedLinks.some(
            (l) => (l.source === node.id && l.target === actualTargetId) || 
                   (l.source === actualTargetId && l.target === node.id)
          );

          if (!alreadyLinked && combinedNodes.some((n) => n.id === actualTargetId)) {
            let notes = '';
            if (node.type === 'concept' && (node.rawObject as MemoryConcept).relationshipNotes) {
              notes = (node.rawObject as MemoryConcept).relationshipNotes?.[targetId] || '';
            }

            computedLinks.push({
              source: node.id,
              target: actualTargetId,
              type: 'custom',
              notes
            });
          }
        });
      }
    });

    // Link concepts sharing identical tags (topic relationships!)
    conceptNodes.forEach((c1, i) => {
      conceptNodes.slice(i + 1).forEach((c2) => {
        const sharedTags = c1.tags?.filter((t) => c2.tags?.includes(t));
        if (sharedTags && sharedTags.length > 0) {
          computedLinks.push({
            source: c1.id,
            target: c2.id,
            type: 'tag'
          });
        }
      });
    });

    setGraphLinksState(computedLinks);

  }, [graph, savedSummaries]);

  // Sync selected node with latest external state (e.g. on detail saves)
  useEffect(() => {
    if (!selectedGraphNode) return;
    const match = graphNodesState.find(n => n.id === selectedGraphNode.id);
    if (match) {
      setSelectedGraphNode(match);
    }
  }, [graphNodesState]);

  const handleSelectNodeFromGraph = (node: GraphNode) => {
    setSelectedGraphNode(node);
    
    // Add to recently viewed queue (up to 5 unique nodes)
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== node.id);
      return [node, ...filtered].slice(0, 5);
    });

    // Populate sidebar editor fields
    setNodePersonalNotes(node.personalNotes || '');
    setNodeTagInput('');
    setCrossLinkTargetId('');
    setCrossLinkDescription('');
  };

  // Save Bookmarks
  const handleToggleBookmark = (node: GraphNode) => {
    if (!graph) return;
    
    if (node.type === 'workspace') {
      const updated = savedSummaries.map((s) => {
        if (s.id === node.rawObject.id) {
          const hasBookmarked = s.bookmarks && s.bookmarks.length > 0;
          return {
            ...s,
            bookmarks: hasBookmarked 
              ? [] 
              : [{ id: 'fav', title: 'Favorite', timestamp: '00:00', secondsCount: 0 }]
          };
        }
        return s;
      });
      if (onUpdateSavedSummaries) {
        onUpdateSavedSummaries(updated);
      }
    } else {
      const g = { ...graph };
      const concept = g.concepts[node.rawObject.id];
      if (concept) {
        concept.bookmarks = !concept.bookmarks;
        saveMemoryGraph(g);
        setGraph(g);
      }
    }
  };

  // Save Personal Notes
  const handleSavePersonalNotes = (node: GraphNode, notes: string) => {
    if (!graph) return;

    if (node.type === 'workspace') {
      const updated = savedSummaries.map((s) => {
        if (s.id === node.rawObject.id) {
          return { ...s, personalNotes: notes };
        }
        return s;
      });
      if (onUpdateSavedSummaries) {
        onUpdateSavedSummaries(updated);
      }
    } else {
      const g = { ...graph };
      const concept = g.concepts[node.rawObject.id];
      if (concept) {
        concept.personalNotes = notes;
        saveMemoryGraph(g);
        setGraph(g);
      }
    }

    const gUpdate = { ...graph };
    awardXpPoints(30, gUpdate);

    // Track daily goal and log study activity
    localStorage.setItem('zipytiny_insights_today_' + new Date().toDateString(), 'true');
    setInsightsSavedToday(true);
    logStudyActivity();
  };

  // Add Tag
  const handleAddTag = (node: GraphNode, tagText: string) => {
    if (!tagText.trim() || !graph) return;
    const cleanTag = tagText.trim().toLowerCase();

    if (node.type === 'workspace') {
      const updated = savedSummaries.map((s) => {
        if (s.id === node.rawObject.id) {
          const tags = s.tags || [];
          if (!tags.includes(cleanTag)) {
            return { ...s, tags: [...tags, cleanTag] };
          }
        }
        return s;
      });
      if (onUpdateSavedSummaries) {
        onUpdateSavedSummaries(updated);
      }
    } else {
      const g = { ...graph };
      const concept = g.concepts[node.rawObject.id];
      if (concept) {
        const tags = concept.tags || [];
        if (!tags.includes(cleanTag)) {
          concept.tags = [...tags, cleanTag];
          saveMemoryGraph(g);
          setGraph(g);
        }
      }
    }

    setNodeTagInput('');

    // Track daily goal and log study activity
    localStorage.setItem('zipytiny_insights_today_' + new Date().toDateString(), 'true');
    setInsightsSavedToday(true);
    logStudyActivity();
  };

  // Remove Tag
  const handleRemoveTag = (node: GraphNode, tagToRemove: string) => {
    if (!graph) return;

    if (node.type === 'workspace') {
      const updated = savedSummaries.map((s) => {
        if (s.id === node.rawObject.id) {
          return { ...s, tags: (s.tags || []).filter((t) => t !== tagToRemove) };
        }
        return s;
      });
      if (onUpdateSavedSummaries) {
        onUpdateSavedSummaries(updated);
      }
    } else {
      const g = { ...graph };
      const concept = g.concepts[node.rawObject.id];
      if (concept) {
        concept.tags = (concept.tags || []).filter((t) => t !== tagToRemove);
        saveMemoryGraph(g);
        setGraph(g);
      }
    }
  };

  // Add manual Relationship Link (cross-video linking / topic relationships)
  const handleAddRelationshipLink = (node: GraphNode, targetId: string, description: string) => {
    if (!targetId || !graph) return;

    if (node.type === 'workspace') {
      const updated = savedSummaries.map((s) => {
        if (s.id === node.rawObject.id) {
          const links = s.crossLinks || [];
          const cleanTarget = targetId.startsWith('w-') ? targetId.slice(2) : targetId;
          if (!links.includes(cleanTarget)) {
            return { ...s, crossLinks: [...links, cleanTarget] };
          }
        }
        return s;
      });
      if (onUpdateSavedSummaries) {
        onUpdateSavedSummaries(updated);
      }
    } else {
      const g = { ...graph };
      const concept = g.concepts[node.rawObject.id];
      if (concept) {
        const links = concept.crossLinks || [];
        if (!links.includes(targetId)) {
          concept.crossLinks = [...links, targetId];
          
          if (description.trim()) {
            if (!concept.relationshipNotes) concept.relationshipNotes = {};
            concept.relationshipNotes[targetId] = description.trim();
          }
          
          saveMemoryGraph(g);
          setGraph(g);
        }
      }
    }

    setCrossLinkTargetId('');
    setCrossLinkDescription('');
    awardXpPoints(40, { ...graph });
  };

  const handleClaimDailyChallenge = () => {
    if (dailyChoice === null || dailySubmitted) return;
    setDailySubmitted(true);
    
    const isCorrect = dailyChoice === currentDaily.answerIndex;
    const todayStr = new Date().toDateString();

    if (isCorrect) {
      const g = { ...graph };
      g.streak += 1;
      localStorage.setItem('snapsum_daily_done_' + todayStr, 'true');
      setDailyCompleted(true);
      awardXpPoints(150, g);
      logStudyActivity();
    }
  };

  // SM-2 Recall Logger
  const handleRecordRecallQuality = (quality: number) => {
    if (!activeRevisionConcept || !graph) return;

    const g = { ...graph };
    const updatedConcept = { ...activeRevisionConcept };

    let interval = updatedConcept.interval ?? 1;
    let easeFactor = updatedConcept.easeFactor ?? 2.5;
    let repetitions = updatedConcept.repetitions ?? 0;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 4;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;
    if (interval > 365) interval = 365;

    updatedConcept.interval = interval;
    updatedConcept.easeFactor = parseFloat(easeFactor.toFixed(2));
    updatedConcept.repetitions = repetitions;
    updatedConcept.lastTestedAt = new Date().toISOString();
    updatedConcept.dueDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString();

    const prevMastery = updatedConcept.masteryLevel;
    let masteryUpdate = prevMastery;
    let xpAwarded = 0;
    let ratingLabel = "";

    if (quality === 1) {
      masteryUpdate = Math.max(prevMastery - 25, 20);
      xpAwarded = 15;
      ratingLabel = "Forgot 🔴";
    } else if (quality === 3) {
      masteryUpdate = Math.max(prevMastery - 10, 50);
      xpAwarded = 40;
      ratingLabel = "Struggled 🟡";
    } else if (quality === 4) {
      masteryUpdate = Math.min(prevMastery + 15, 85);
      xpAwarded = 80;
      ratingLabel = "Good 🔵";
    } else if (quality === 5) {
      masteryUpdate = Math.min(prevMastery + 35, 100);
      xpAwarded = 120;
      ratingLabel = "Easy 🟢";
    }

    updatedConcept.masteryLevel = masteryUpdate;
    updatedConcept.status = masteryUpdate >= 70 ? 'Strong' : 'Weak';

    g.concepts[updatedConcept.id] = updatedConcept;

    const revisedConceptsArray = Object.values(g.concepts) as MemoryConcept[];
    g.weakTopics = revisedConceptsArray.filter(c => c.masteryLevel < 70).map(c => c.concept);
    g.strongTopics = revisedConceptsArray.filter(c => c.masteryLevel >= 70).map(c => c.concept);

    setRevisionStage('done');
    
    const formattedDate = new Date(updatedConcept.dueDate).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    
    setRevisionFeedback(`🧠 **Retention Pathway Updated (${ratingLabel})!**\n\nYour recall effort was recorded. Based on SM-2 spacing parameters, the next review session for "${updatedConcept.concept}" is scheduled in **${interval} day${interval > 1 ? 's' : ''}** (**${formattedDate}**).\n\nMastery score: ${prevMastery}% ➔ ${masteryUpdate}%.\nAwarded **+${xpAwarded} XP**.`);
    awardXpPoints(xpAwarded, g);

    // Track daily recall goal & calendar
    const nextCount = reviewedTodayCount + 1;
    setReviewedTodayCount(nextCount);
    localStorage.setItem('zipytiny_reviewed_today_' + new Date().toDateString(), String(nextCount));
    logStudyActivity();
  };

  const handleProceedToAssess = () => {
    if (!activeRevisionConcept) return;
    if (revisionTypedAnswer.trim().length < 5) {
      setRevisionFeedback("Please expand your recall answer slightly (minimum 5 characters) to test neural connections!");
      return;
    }
    setRevisionFeedback(null);
    setRevisionStage('assess');
  };

  // Redesigned Journey Stats Calculations
  const totalMinutesSaved = savedSummaries.length * 25;
  const hoursSaved = Math.floor(totalMinutesSaved / 60);
  const remainingMins = totalMinutesSaved % 60;
  const timeSavedLabel = hoursSaved > 0 ? `${hoursSaved}h ${remainingMins}m` : `${remainingMins} mins`;

  const flashcardsReviewedCount = conceptsArray.reduce((acc, c) => acc + (c.repetitions || 0), 0);

  const quizzesTakenCount = graph.quizHistory?.length || 0;
  const averageQuizPercent = quizzesTakenCount > 0 
    ? Math.round((graph.quizHistory.reduce((acc, q) => acc + (q.score / q.total), 0) / quizzesTakenCount) * 100)
    : 85;

  // Unfinished course module / workspace finder
  const unfinishedWorkspaces = sessionsArray.filter(s => s && !s.completed);
  const continueTarget = unfinishedWorkspaces.length > 0 
    ? unfinishedWorkspaces[0] 
    : (sessionsArray.length > 0 ? sessionsArray[0] : null);

  // Filtering Logic
  const checkIsDocument = (summary: SavedSummary) => {
    const url = summary.response?.metadata?.videoUrl || '';
    return url.includes('uploaded-files') || url.includes('pasted-text') || summary.id?.includes('uploaded-files') || summary.id?.includes('pasted-text');
  };

  const filteredSummaries = savedSummaries.filter(item => {
    const matchesSearch = item.response?.metadata?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.response?.metadata?.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || item.collection === selectedFolder;
    
    if (activeFilter === 'videos') {
      return matchesSearch && matchesFolder && !checkIsDocument(item);
    }
    if (activeFilter === 'documents') {
      return matchesSearch && matchesFolder && checkIsDocument(item);
    }
    return matchesSearch && matchesFolder;
  });

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    if (onAddCollection) {
      onAddCollection(newFolderName.trim());
    } else {
      const updated = [...collections, newFolderName.trim()];
      localStorage.setItem('zipytiny_collections', JSON.stringify(updated));
    }
    setNewFolderName('');
    setShowAddFolderInput(false);
  };

  return (
    <div className="space-y-8 text-neutral-900 dark:text-zinc-100 font-sans">
      
      {/* 1. HERO LEARNING PROGRESS & COMPREHENSION HEADER */}
      <div className="bg-gradient-to-br from-neutral-950 via-[#121214] to-zinc-900 text-white rounded-3xl p-6 shadow-xl border border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/[0.08] blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-[#bf5af2]/[0.05] blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-indigo-500/30">
                Level {graph.level} Elite Scholar
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-400">Streak: {graph.streak} Days 🔥</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
              Your Learning Journey
            </h1>
            <p className="text-neutral-400 text-xs max-w-xl font-light">
              Accelerate comprehension, build mental models, and retain complex knowledge forever with your personal AI spaced repetition engine.
            </p>
          </div>

          <div className="w-full md:w-80 bg-white/[0.04] border border-white/[0.06] p-4.5 rounded-2xl space-y-3 shrink-0 text-left">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 uppercase">Experience Gauge (XP)</span>
              <span className="text-indigo-400 font-bold">{graph.xp} XP</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${((graph.xp % 500) / 500) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400 font-light">
              <span>Level {graph.level}</span>
              <span>{500 - (graph.xp % 500)} XP to Level {graph.level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REUSABLE METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        {/* Learning Streak */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[145px] text-left relative overflow-hidden group">
          <div className="absolute top-[-10%] right-[-10%] w-20 h-20 bg-amber-500/[0.02] dark:bg-amber-500/[0.04] blur-2xl rounded-full"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 dark:text-zinc-500 uppercase">Learning Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-neutral-950 dark:text-zinc-100">{graph.streak}</span>
              <span className="text-xs text-neutral-400 font-light">days</span>
            </div>
            {/* 5 Day Activity Tracker dots */}
            <div className="flex gap-1.5 mt-2.5">
              {[...Array(5)].map((_, i) => {
                const active = i < (graph.streak % 5 || 5);
                return (
                  <span 
                    key={i} 
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                      active 
                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                        : 'bg-neutral-100 dark:bg-zinc-800'
                    }`} 
                    title={active ? "Active study day" : "Scheduled"}
                  />
                );
              })}
            </div>
          </div>
          <span className="text-[9px] text-neutral-400 font-light block">
            Streak active. Maintain by finishing today's challenge!
          </span>
        </div>

        {/* Time Saved */}
        <MetricCard 
          title="Study Time Saved" 
          value={timeSavedLabel} 
          subtext="Efficiency margin saved by reading key AI summaries"
          icon={<Clock className="w-4 h-4" />}
          badge="Efficient"
          badgeColor="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        />

        {/* Concepts Mastered */}
        <MetricCard 
          title="Concepts Mastered" 
          value={`${topicsMastered} / ${totalConceptsCount}`} 
          subtext="Key mental models with comprehension >= 70%"
          icon={<Trophy className="w-4 h-4" />}
          progress={totalConceptsCount > 0 ? (topicsMastered / totalConceptsCount) * 100 : 0}
          badge="Mastery"
        />

        {/* Flashcards Reviewed */}
        <MetricCard 
          title="Flashcards Reviewed" 
          value={flashcardsReviewedCount} 
          subtext="Total spaced repetition active recall reviews completed"
          icon={<BookOpenCheck className="w-4 h-4" />}
          badge="Active Recall"
          badgeColor="bg-[#bf5af2]/10 text-[#bf5af2] dark:text-[#bf5af2]"
        />

        {/* Quiz Performance */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[145px] text-left col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 dark:text-zinc-500 uppercase">Quiz Accuracy</span>
            <GraduationCap className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-neutral-950 dark:text-zinc-100">{averageQuizPercent}%</span>
            <div className="text-[10px] text-neutral-400 dark:text-zinc-500 font-mono mt-1.5 flex justify-between">
              <span>Completed: {quizzesTakenCount} drills</span>
              <span>Diff: {graph.quizHistory?.[0]?.difficulty || 'Medium'}</span>
            </div>
          </div>
          <span className="text-[9px] text-neutral-400 font-light block leading-tight">
            Consistently scoring high on comprehensive evaluation quizzes.
          </span>
        </div>

      </div>

      {/* 2.5 TABS SELECTION CONTROLLER */}
      <div className="flex border-b border-neutral-200 dark:border-zinc-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveDashboardTab('graph')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeDashboardTab === 'graph'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Connected Learning Graph</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveDashboardTab('vault')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeDashboardTab === 'vault'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Cognitive Knowledge Vault</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveDashboardTab('stats')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeDashboardTab === 'stats'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Scholar Profile & Performance</span>
        </button>
      </div>

      {/* GRAPH TAB CONTENT */}
      {activeDashboardTab === 'graph' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Dynamic 2-column Graph Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Interactive Force SVG Network */}
            <div className="lg:col-span-8 flex flex-col gap-4 text-left">
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold font-display text-neutral-950 dark:text-zinc-100 flex items-center gap-1.5">
                      <Network className="w-5 h-5 text-indigo-600" />
                      <span>Interactive Learning Graph</span>
                    </h3>
                    <p className="text-neutral-400 text-[10px] font-light">
                      Visualizing automated associations between concepts, study nodes, and cross-topic links.
                    </p>
                  </div>
                  {/* Graph search bar filter */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter nodes (e.g. tag, concept)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8.5 pr-3 py-2 border rounded-xl outline-none dark:bg-zinc-800 dark:border-zinc-700 text-neutral-950 dark:text-white"
                    />
                  </div>
                </div>

                <KnowledgeGraphVisualizer
                  nodes={graphNodesState}
                  links={graphLinksState}
                  selectedNodeId={selectedGraphNode?.id || null}
                  onSelectNode={handleSelectNodeFromGraph}
                  onUpdateNodesPositions={setGraphNodesState}
                  searchQuery={searchQuery}
                />
              </div>
            </div>

            {/* Right Column: Node Details & Knowledge Dashboard Sidebar */}
            <div className="lg:col-span-4 text-left">
              <AnimatePresence mode="wait">
                {selectedGraphNode ? (
                  <motion.div
                    key={`detail-${selectedGraphNode.id}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-5 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Close detail drawer button */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold font-mono uppercase ${
                          selectedGraphNode.type === 'concept' 
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                            : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                        }`}>
                          {selectedGraphNode.type === 'concept' ? 'Mental Model' : 'Workspace Target'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {/* Bookmark button */}
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(selectedGraphNode)}
                            className={`p-1.5 rounded-lg border transition ${
                              selectedGraphNode.bookmarks 
                                ? 'bg-red-50 border-red-200 text-red-500' 
                                : 'bg-neutral-50 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 text-neutral-400 dark:text-zinc-500 hover:text-neutral-600'
                            }`}
                            title="Toggle Bookmark"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${selectedGraphNode.bookmarks ? 'fill-red-500' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedGraphNode(null)}
                            className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Header title */}
                      <div className="space-y-1">
                        <h4 className="text-base font-bold font-display text-neutral-900 dark:text-zinc-100 leading-tight">
                          {selectedGraphNode.label}
                        </h4>
                        {selectedGraphNode.type === 'concept' && selectedGraphNode.mastery !== undefined && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-neutral-400 uppercase">Mastery level</span>
                              <span className={selectedGraphNode.mastery >= 70 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                                {selectedGraphNode.mastery}% ({selectedGraphNode.mastery >= 70 ? 'Strong' : 'Weak'})
                              </span>
                            </div>
                            <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                              <div 
                                className={`h-1 rounded-full transition-all duration-500 ${
                                  selectedGraphNode.mastery >= 70 ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${selectedGraphNode.mastery}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description / Analogy */}
                      {selectedGraphNode.type === 'concept' && selectedGraphNode.rawObject && (
                        <div className="space-y-2 bg-neutral-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-neutral-100 dark:border-zinc-800">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 uppercase font-mono tracking-wider block">Concept Definition</span>
                            <p className="text-xs text-neutral-700 dark:text-zinc-300 leading-relaxed font-light">
                              {selectedGraphNode.rawObject.definition || 'No automatic definition recorded. Read summaries to populate details.'}
                            </p>
                          </div>
                          {selectedGraphNode.rawObject.analogy && (
                            <div className="space-y-1 border-t border-neutral-200/40 dark:border-zinc-800/60 pt-2 mt-2">
                              <span className="text-[9px] font-bold text-indigo-500 uppercase font-mono tracking-wider flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                <span>Core Analogy</span>
                              </span>
                              <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-light italic bg-indigo-50/[0.15] p-2 rounded-xl">
                                "{selectedGraphNode.rawObject.analogy}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Custom tags list & editor */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 uppercase font-mono tracking-wider block">Custom Tags</span>
                        <div className="flex flex-wrap gap-1">
                          {(selectedGraphNode.tags || []).map((t: string) => (
                            <span 
                              key={t}
                              className="text-[9px] bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 px-2 py-0.5 rounded-md flex items-center gap-1 border dark:border-zinc-700"
                            >
                              <span>#{t}</span>
                              <button 
                                onClick={() => handleRemoveTag(selectedGraphNode, t)}
                                className="text-neutral-400 hover:text-red-500 transition"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                          {(selectedGraphNode.tags || []).length === 0 && (
                            <span className="text-[10px] text-neutral-400 italic font-light">No tags added yet</span>
                          )}
                        </div>
                        {/* Tag Input */}
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Add custom tag..."
                            value={nodeTagInput}
                            onChange={(e) => setNodeTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(selectedGraphNode, nodeTagInput)}
                            className="flex-1 text-xs border rounded-lg px-2.5 py-1.5 outline-none dark:bg-zinc-800 dark:border-zinc-700 text-neutral-950 dark:text-white"
                          />
                          <button
                            onClick={() => handleAddTag(selectedGraphNode, nodeTagInput)}
                            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-zinc-300 px-3 py-1 text-xs font-semibold rounded-lg"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Personal Notes Box */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 uppercase font-mono tracking-wider block">Personal Notes</span>
                        <textarea
                          placeholder="Write down personal notes, study findings, research hypotheses or key learning insights here..."
                          value={nodePersonalNotes}
                          onChange={(e) => setNodePersonalNotes(e.target.value)}
                          className="w-full h-24 text-xs p-2.5 border rounded-xl outline-none dark:bg-zinc-800 dark:border-zinc-700 text-neutral-950 dark:text-white resize-none font-sans"
                        />
                        <button
                          onClick={() => handleSavePersonalNotes(selectedGraphNode, nodePersonalNotes)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer block ml-auto shadow-xs"
                        >
                          Save Notes (+30 XP)
                        </button>
                      </div>

                      {/* Topic Relationships & Custom Linking */}
                      <div className="space-y-2 border-t dark:border-zinc-800 pt-3">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 uppercase font-mono tracking-wider block">Create Topic Relation Bridge</span>
                        <div className="space-y-1.5">
                          <select
                            value={crossLinkTargetId}
                            onChange={(e) => setCrossLinkTargetId(e.target.value)}
                            className="w-full text-xs p-2 border rounded-lg outline-none dark:bg-zinc-800 dark:border-zinc-700 text-neutral-950 dark:text-white"
                          >
                            <option value="">Select target node to link...</option>
                            {graphNodesState
                              .filter((n) => n.id !== selectedGraphNode.id)
                              .map((n) => (
                                <option key={n.id} value={n.id}>
                                  {n.type === 'concept' ? '🧠' : '📂'} {n.label}
                                </option>
                              ))}
                          </select>
                          {selectedGraphNode.type === 'concept' && (
                            <input
                              type="text"
                              placeholder="Relationship description (e.g. underlies, refutes)..."
                              value={crossLinkDescription}
                              onChange={(e) => setCrossLinkDescription(e.target.value)}
                              className="w-full text-xs p-2 border rounded-lg outline-none dark:bg-zinc-800 dark:border-zinc-700 text-neutral-950 dark:text-white"
                            />
                          )}
                          <button
                            onClick={() => handleAddRelationshipLink(selectedGraphNode, crossLinkTargetId, crossLinkDescription)}
                            disabled={!crossLinkTargetId}
                            className="w-full bg-neutral-900 dark:bg-zinc-800 hover:bg-neutral-800 dark:hover:bg-zinc-750 disabled:opacity-50 text-white font-bold text-[10px] py-1.5 rounded-lg transition"
                          >
                            Bridge Connection (+40 XP)
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Launch button at bottom */}
                    {selectedGraphNode.type === 'workspace' && selectedGraphNode.rawObject && (
                      <div className="pt-2 border-t dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedGraphNode.rawObject.response) {
                              onActivateDemo(selectedGraphNode.rawObject.response);
                            } else {
                              onLoadVideo(selectedGraphNode.rawObject.id, false);
                            }
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Launch Learning Center</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  // General HUD Dashboard view
                  <motion.div
                    key="hud-dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-5"
                  >
                    {/* Suggested study plan item */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-widest">Suggested Next Topic</span>
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                      </div>

                      {(() => {
                        const weakConcepts = (Object.values(graph?.concepts || {}) as MemoryConcept[])
                          .filter(c => c.masteryLevel < 70)
                          .sort((a, b) => a.masteryLevel - b.masteryLevel);
                        
                        if (weakConcepts.length > 0) {
                          const suggestion = weakConcepts[0];
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                const target = graphNodesState.find(n => n.id === `c-${suggestion.id}`);
                                if (target) handleSelectNodeFromGraph(target);
                              }}
                              className="w-full p-3 bg-red-50/10 dark:bg-red-950/10 border border-red-100/60 dark:border-red-900/30 rounded-2xl text-left hover:border-red-500/40 transition-colors cursor-pointer"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="text-xs font-bold text-neutral-900 dark:text-zinc-100 leading-tight truncate">
                                  Review "{suggestion.concept}"
                                </h5>
                                <span className="text-[9px] font-mono bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                                  {suggestion.masteryLevel}% Mastery
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-light mt-1.5">
                                Cognitive retention pathway suggests prompt review to protect memory consolidation.
                              </p>
                            </button>
                          );
                        }
                        return (
                          <div className="p-3 bg-emerald-50/10 border border-emerald-100 dark:border-emerald-950 rounded-2xl text-xs text-emerald-800 dark:text-emerald-400 font-light italic">
                            All concepts stabilized! Master status verified.
                          </div>
                        );
                      })()}
                    </div>

                    {/* Recently viewed queue */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-widest">Recently Viewed</span>
                      <div className="space-y-1.5">
                        {recentlyViewed.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectNodeFromGraph(item)}
                            className="w-full p-2 hover:bg-neutral-50 dark:hover:bg-zinc-800/40 border border-transparent hover:border-neutral-200/50 dark:hover:border-zinc-800 rounded-xl flex items-center justify-between text-xs transition text-left cursor-pointer"
                          >
                            <span className="font-medium text-neutral-800 dark:text-zinc-200 truncate pr-3 flex items-center gap-1.5">
                              {item.type === 'concept' ? <Brain className="w-3.5 h-3.5 text-indigo-500" /> : <Video className="w-3.5 h-3.5 text-purple-500" />}
                              <span>{item.label}</span>
                            </span>
                            <ChevronRight className="w-3 h-3 text-neutral-400" />
                          </button>
                        ))}
                        {recentlyViewed.length === 0 && (
                          <span className="text-[10px] text-neutral-400 italic font-light block">Select nodes inside the graph above to track session logs.</span>
                        )}
                      </div>
                    </div>

                    {/* Bookmarks Quick Jump */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-widest">Bookmarked Nodes</span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                        {graphNodesState.filter(n => n.bookmarks).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectNodeFromGraph(item)}
                            className="w-full p-2 bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-150 dark:border-zinc-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between text-xs transition text-left cursor-pointer"
                          >
                            <span className="font-medium text-neutral-800 dark:text-zinc-200 truncate flex items-center gap-1.5">
                              <Bookmark className="w-3 h-3 text-red-500 fill-red-500" />
                              <span>{item.label}</span>
                            </span>
                            <ChevronRight className="w-3 h-3 text-neutral-400" />
                          </button>
                        ))}
                        {graphNodesState.filter(n => n.bookmarks).length === 0 && (
                          <span className="text-[10px] text-neutral-400 italic font-light block">Bookmark important concepts or workspaces for speedy revision.</span>
                        )}
                      </div>
                    </div>

                    {/* Active Tag Cloud */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-widest">Active Tag Cloud</span>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(graphNodesState.flatMap(n => n.tags || []))).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="text-[9px] bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-600 dark:text-zinc-300 font-mono font-bold px-2 py-0.5 rounded-md cursor-pointer transition"
                          >
                            #{tag}
                          </button>
                        ))}
                        {Array.from(new Set(graphNodesState.flatMap(n => n.tags || []))).length === 0 && (
                          <span className="text-[10px] text-neutral-400 italic font-light block">Use node sidebar panels to attach hashtags to materials.</span>
                        )}
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Continue study widget below graph */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-7">
              {continueTarget && (
                <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
                  <span className="absolute top-0 right-0 p-3 text-[9px] font-mono font-bold bg-[#bf5af2]/10 text-[#bf5af2] rounded-bl-2xl uppercase tracking-wider">
                    Resume Course Module
                  </span>
                  <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block mb-3">
                    📂 Continue Learning
                  </span>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-neutral-50 dark:bg-zinc-800/40 p-4.5 rounded-2xl border border-neutral-100 dark:border-zinc-800">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 dark:border-zinc-700 shadow-sm">
                        <img src={continueTarget.thumbnailUrl} alt="Workspace Video" className="object-cover w-full h-full" loading="lazy" />
                        <div className="absolute bottom-1 right-1 bg-black/75 rounded text-[8px] font-mono text-white px-1 leading-none">
                          {continueTarget.duration || '20 min'}
                        </div>
                      </div>
                      <div className="overflow-hidden text-left space-y-1">
                        <h5 className="text-xs font-bold text-neutral-900 dark:text-zinc-100 truncate leading-tight">
                          {continueTarget.title}
                        </h5>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{continueTarget.progressPercent}% Processed</span>
                          <span className="text-neutral-300 dark:text-zinc-700">•</span>
                          <span className="text-neutral-400 dark:text-zinc-500">Last active {continueTarget.processedAt}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => onLoadVideo(continueTarget.videoId, false)}
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1 shrink-0 shadow-sm active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Resume Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              {/* Mini study performance drill */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-left flex items-center justify-between gap-4 h-full min-h-[140px]">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">Consolidation Drill</span>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-zinc-100 leading-tight">Active Recall Drill is Scheduled</h4>
                  <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-light">Boost synaptic weights by revising active recall terms in your study card deck.</p>
                </div>
                {(() => {
                  const due = conceptsArray.filter(c => !c.dueDate || new Date(c.dueDate) <= new Date());
                  return (
                    <button
                      onClick={() => {
                        if (due.length > 0) {
                          setActiveRevisionConcept(due[0]);
                          setRevisionTypedAnswer('');
                          setRevisionFeedback(null);
                          setRevisionStage('type');
                        } else if (conceptsArray.length > 0) {
                          setActiveRevisionConcept(conceptsArray[0]);
                          setRevisionTypedAnswer('');
                          setRevisionFeedback(null);
                          setRevisionStage('type');
                        }
                      }}
                      className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-4 py-3 rounded-xl hover:bg-indigo-100 cursor-pointer shadow-xs whitespace-nowrap shrink-0 animate-pulse"
                    >
                      Start Deck ({due.length} Due)
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* COGNITIVE VAULT TAB CONTENT */}
      {activeDashboardTab === 'vault' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 3. CONTINUE LEARNING CALLOUT & DAILY CHALLENGE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Continue Learning Module */}
        <div className="lg:col-span-7 space-y-6">
          
          {continueTarget && (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
              <span className="absolute top-0 right-0 p-3 text-[9px] font-mono font-bold bg-[#bf5af2]/10 text-[#bf5af2] rounded-bl-2xl uppercase tracking-wider">
                Resume Course Module
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block mb-3">
                📂 Continue Learning
              </span>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-neutral-50 dark:bg-zinc-800/40 p-4.5 rounded-2xl border border-neutral-100 dark:border-zinc-800">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 dark:border-zinc-700 shadow-sm">
                    <img src={continueTarget.thumbnailUrl} alt="Workspace Video" className="object-cover w-full h-full" loading="lazy" />
                    <div className="absolute bottom-1 right-1 bg-black/75 rounded text-[8px] font-mono text-white px-1 leading-none">
                      {continueTarget.duration || '20 min'}
                    </div>
                  </div>
                  <div className="overflow-hidden text-left space-y-1">
                    <h5 className="text-xs font-bold text-neutral-900 dark:text-zinc-100 truncate leading-tight">
                      {continueTarget.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{continueTarget.progressPercent}% Processed</span>
                      <span className="text-neutral-300 dark:text-zinc-700">•</span>
                      <span className="text-neutral-400 dark:text-zinc-500">Last active {continueTarget.processedAt}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => onLoadVideo(continueTarget.videoId, false)}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1 shrink-0 shadow-sm active:scale-95"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Resume Workspace</span>
                </button>
              </div>
            </div>
          )}

          {/* Daily Challenge cognitive drill */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-left space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#bf5af2] bg-[#bf5af2]/10 px-2.5 py-1 rounded-full">
                  ⚡ Cognitive Habit builder
                </span>
                <h3 className="text-base font-bold font-display text-neutral-950 dark:text-zinc-100 mt-2">
                  Daily Learning Challenge
                </h3>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">+150 XP Reward</span>
            </div>

            {dailyCompleted ? (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-5 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950 dark:text-zinc-200">Active Recall Locked for Today!</h4>
                <p className="text-xs text-emerald-800/80 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                  Awesome work. You have checked in and completed your daily cognitive evaluation drill, reinforcing neural pathways and keeping your learning streak active. Re-visit tomorrow for a fresh prompt.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-neutral-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-neutral-100 dark:border-zinc-800">
                  <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest block mb-1">Concept: {currentDaily.conceptName}</span>
                  <h4 className="text-sm font-bold text-neutral-800 dark:text-zinc-200 leading-relaxed font-display">
                    {currentDaily.question}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {currentDaily.options.map((option, idx) => {
                    const active = dailyChoice === idx;
                    let btnStyle = "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-800 text-neutral-800 dark:text-zinc-200";
                    if (active) btnStyle = "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold";
                    
                    if (dailySubmitted) {
                      if (idx === currentDaily.answerIndex) {
                        btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold";
                      } else if (active) {
                        btnStyle = "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200";
                      } else {
                        btnStyle = "border-neutral-100 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 text-neutral-400 pointer-events-none";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={dailySubmitted}
                        onClick={() => setDailyChoice(idx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition cursor-pointer flex justify-between items-center ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {active && !dailySubmitted && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        {dailySubmitted && idx === currentDaily.answerIndex && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {!dailySubmitted ? (
                  <button
                    type="button"
                    disabled={dailyChoice === null}
                    onClick={handleClaimDailyChallenge}
                    className="w-full bg-[#1d1d1f] dark:bg-zinc-800 hover:bg-[#2d2d2f] dark:hover:bg-zinc-700 text-white py-3 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none shadow-sm active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Lock Recall Answer (+150 XP)</span>
                  </button>
                ) : (
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-900/30 rounded-2xl text-xs text-indigo-950 dark:text-zinc-300 leading-normal font-sans space-y-2">
                    <div className="flex gap-1.5 items-center">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <strong className="font-bold">Challenge Analysis:</strong>
                    </div>
                    <p>{currentDaily.explanation}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setDailyCompleted(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-[11px] font-bold px-4 py-2 rounded-lg mt-1 block w-fit shadow-sm cursor-pointer"
                    >
                      Return to Learning Board
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right: Weekly Study Activity & Spaced Repetition Due Queue */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Weekly Activity Visualization */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold font-display text-neutral-950 dark:text-zinc-100 flex items-center gap-1.5 leading-tight">
                  <Activity className="w-4.5 h-4.5 text-indigo-600" />
                  Weekly Learning Activity
                </h3>
                <p className="text-neutral-400 text-[10px] font-light">
                  Daily study intensity and comprehension reviews
                </p>
              </div>
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded">
                Weekly Active
              </span>
            </div>

            {/* Custom SVG responsive Weekly Bar Chart */}
            <div className="h-32 w-full flex items-end justify-between gap-2.5 pt-2 border-b border-neutral-100 dark:border-zinc-800/60 pb-1 px-1 font-mono">
              {[
                { day: 'M', value: 30 },
                { day: 'T', value: 65 },
                { day: 'W', value: 85 },
                { day: 'T', value: 45 },
                { day: 'F', value: 95 },
                { day: 'S', value: 100 },
                { day: 'S', value: 50 },
              ].map((bar, i) => {
                const heightPercent = bar.value;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-help" title={`Comprehension level: ${bar.value}%`}>
                    <div className="w-full bg-neutral-50 dark:bg-zinc-800/30 rounded-t-lg h-24 flex items-end overflow-hidden relative border border-neutral-100/50 dark:border-zinc-800/40">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 rounded-t-md transition-all duration-700"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-zinc-100 transition-colors">{bar.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block"></span>
              <span>Visual mapping of weekly active recall performance metrics.</span>
            </div>
          </div>

          {/* Spaced Repetition Due Queue */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold font-display text-neutral-950 dark:text-zinc-100 flex items-center gap-1.5 leading-tight">
                  <Brain className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                  Upcoming Study Plan
                </h3>
                <p className="text-neutral-400 text-[10px] font-light">
                  Concepts scheduled for review to guarantee storage in long-term memory
                </p>
              </div>
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold font-mono px-2 py-0.5 rounded">
                SM-2 Queue
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {conceptsArray.slice(0, 4).map((concept) => {
                const isDue = !concept.dueDate || new Date(concept.dueDate) <= new Date();
                return (
                  <div 
                    key={concept.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                      isDue 
                        ? 'border-red-100 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/10' 
                        : 'border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/40'
                    }`}
                  >
                    <div className="overflow-hidden space-y-0.5 text-left flex-1">
                      <h4 className="font-bold text-neutral-800 dark:text-zinc-200 truncate">{concept.concept}</h4>
                      <p className="text-[9px] text-neutral-400 dark:text-zinc-500 truncate uppercase tracking-wide">
                        Source: {concept.sourceTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDue ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveRevisionConcept(concept);
                            setRevisionFeedback(null);
                            setRevisionTypedAnswer('');
                            setRevisionStage('type');
                            setShowHint(false);
                          }}
                          className="bg-red-100 hover:bg-red-200 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wide transition cursor-pointer"
                        >
                          Due Now
                        </button>
                      ) : (
                        <span className="text-[9px] text-neutral-400 dark:text-zinc-500 font-mono bg-neutral-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border dark:border-zinc-700">
                          Due in {concept.interval || 1}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {conceptsArray.length === 0 && (
                <div className="p-4 text-center text-xs text-neutral-400 font-light italic bg-neutral-50 dark:bg-zinc-800/10 rounded-2xl border border-dashed dark:border-zinc-800">
                  No concepts stored in your learning lattice yet. Summarize a video or file to inject metadata.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 4. ACTIVE SPACED REPETITION DRILL MODAL (STAYS SAME ROBUST FLOW FOR SM-2) */}
      <AnimatePresence>
        {activeRevisionConcept && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3 mb-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase block">
                    Cognitive Active Recall Drill — Stage {revisionStage === 'type' ? '1: Active Recall' : revisionStage === 'assess' ? '2: Self Assessment' : '3: Locked'}
                  </span>
                  <h4 className="text-base font-bold text-indigo-700 dark:text-indigo-400 leading-tight">{activeRevisionConcept.concept}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRevisionConcept(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 rounded-lg transition cursor-pointer"
                >
                  ✕ Close Study
                </button>
              </div>

              {revisionStage === 'type' && (
                <div className="space-y-4 text-xs text-neutral-700 dark:text-zinc-300 text-left">
                  <p className="leading-relaxed text-neutral-500 dark:text-zinc-400">
                    Write a brief explanation or summary detailing this mental model. Attempting active recall constructs the structural bridges necessary for long-term retention.
                  </p>

                  <div className="border border-amber-100 dark:border-amber-900/30 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs text-amber-900 dark:text-amber-400 font-bold hover:bg-amber-100/30 cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>💡 Reveal a Metaphorical Analogy Hint</span>
                      </span>
                      <span className="text-[10px] text-amber-700">{showHint ? 'Hide hint' : 'Show hint'}</span>
                    </button>
                    {showHint && (
                      <div className="px-4 pb-3.5 text-amber-950/85 dark:text-zinc-300 text-xs leading-relaxed animate-fadeIn border-t border-amber-150 pt-2.5">
                        {activeRevisionConcept.analogy}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block font-bold text-neutral-800 dark:text-zinc-200 text-xs">
                      ✍️ Your Active Recall Explanation:
                    </label>
                    <textarea
                      disabled={!!revisionFeedback}
                      placeholder="Explain this concept in your own terms to reinforce neural links..."
                      rows={3}
                      value={revisionTypedAnswer}
                      onChange={(e) => {
                        setRevisionTypedAnswer(e.target.value);
                        setRevisionFeedback(null);
                      }}
                      className="w-full text-xs p-3.5 rounded-xl border border-neutral-300 dark:border-zinc-700 focus:bg-white focus:border-indigo-500 dark:focus:bg-zinc-900 outline-none transition-all bg-white dark:bg-zinc-800 text-neutral-950 dark:text-white placeholder-neutral-400 font-sans"
                    />
                  </div>

                  {revisionFeedback && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-400 text-xs rounded-xl font-sans animate-fadeIn">
                      {revisionFeedback}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToAssess}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-xs py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                  >
                    <span>Reveal Source Truth & Rate Recall</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {revisionStage === 'assess' && (
                <div className="space-y-4 text-xs text-neutral-700 dark:text-zinc-300 text-left">
                  <p className="leading-relaxed text-neutral-500 dark:text-zinc-400">
                    Be objective. Compare your drafted recall attempt with the canonical definition and conceptual metaphor.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-150 dark:border-zinc-800 p-4 rounded-xl space-y-2.5">
                      <span className="text-[8px] bg-indigo-100 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
                        Source Truth Definition
                      </span>
                      <div className="space-y-2 leading-relaxed font-sans text-neutral-800 dark:text-zinc-200">
                        <p>
                          <strong className="text-neutral-950 dark:text-white font-bold block mb-0.5">Abstract Definition:</strong>
                          {activeRevisionConcept.definition}
                        </p>
                        <p className="bg-amber-50/50 dark:bg-amber-950/10 p-2.5 rounded-lg border border-amber-100/50 text-amber-950 dark:text-amber-300">
                          <strong className="text-amber-950 dark:text-amber-300 font-bold block mb-0.5">Micro Analogy Metaphor:</strong>
                          {activeRevisionConcept.analogy}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[8px] bg-slate-100 border border-slate-200 text-slate-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
                          Your Active Recall Attempt
                        </span>
                        <p className="italic text-neutral-800 dark:text-zinc-200 font-sans leading-relaxed whitespace-pre-line pt-1">
                          "{revisionTypedAnswer}"
                        </p>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono bg-neutral-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border dark:border-zinc-700 mt-3 block w-fit">
                        Length: {revisionTypedAnswer.length} characters
                      </div>
                    </div>
                  </div>

                  <div className="border-t dark:border-zinc-800 pt-4 space-y-3">
                    <h4 className="font-bold text-neutral-800 dark:text-zinc-200 text-xs flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>How strong was your active recall?</span>
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRecordRecallQuality(1)}
                        className="bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-900 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-3.5 rounded-xl cursor-pointer transition-colors text-center gap-1 flex flex-col items-center justify-center"
                      >
                        <span className="text-lg">🔴</span>
                        <strong className="text-xs font-bold font-display">Forgot</strong>
                        <span className="text-[9px] text-neutral-400 block leading-none mt-0.5">Blanked / inaccurate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRecordRecallQuality(3)}
                        className="bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-900 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 p-3.5 rounded-xl cursor-pointer transition-colors text-center gap-1 flex flex-col items-center justify-center"
                      >
                        <span className="text-lg">🟡</span>
                        <strong className="text-xs font-bold font-display">Struggled</strong>
                        <span className="text-[9px] text-neutral-400 block leading-none mt-0.5">High effort / vague</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRecordRecallQuality(4)}
                        className="bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-900 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 p-3.5 rounded-xl cursor-pointer transition-colors text-center gap-1 flex flex-col items-center justify-center"
                      >
                        <span className="text-lg">🔵</span>
                        <strong className="text-xs font-bold font-display">Good</strong>
                        <span className="text-[9px] text-neutral-400 block leading-none mt-0.5">Minor hesitation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRecordRecallQuality(5)}
                        className="bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 p-3.5 rounded-xl cursor-pointer transition-colors text-center gap-1 flex flex-col items-center justify-center"
                      >
                        <span className="text-lg">🟢</span>
                        <strong className="text-xs font-bold font-display">Easy</strong>
                        <span className="text-[9px] text-neutral-400 block leading-none mt-0.5">Flawless, instant</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {revisionStage === 'done' && (
                <div className="space-y-4 text-xs text-neutral-700 dark:text-zinc-300 text-left">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 text-emerald-950 dark:text-zinc-300 text-xs rounded-2xl font-sans animate-fadeIn leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-400 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm">Recall Logging Complete!</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{revisionFeedback}</p>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    {(() => {
                      const due = conceptsArray.filter(c => !c.dueDate || new Date(c.dueDate) <= new Date());
                      if (due.length > 0) {
                        return (
                          <button
                            key="continue"
                            type="button"
                            onClick={() => {
                              setActiveRevisionConcept(due[0]);
                              setRevisionTypedAnswer('');
                              setRevisionFeedback(null);
                              setRevisionStage('type');
                              setShowHint(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1 shadow-sm active:scale-95"
                          >
                            <span>Consolidate Next Concept ({due.length} due)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        );
                      }
                      return null;
                    })()}
                    <button
                      key="finish"
                      type="button"
                      onClick={() => {
                        setActiveRevisionConcept(null);
                      }}
                      className="bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition active:scale-95"
                    >
                      Complete Session
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. INTERACTIVE CATALOG & BROWSE BENTO GRID */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-left space-y-6">
        
        {/* Header with collection breadcrumb and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-display text-neutral-950 dark:text-zinc-100 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              <span>Cognitive Knowledge Vault</span>
            </h2>
            <p className="text-xs text-neutral-400 font-light">
              Explore your analyzed materials, files, synthesized paths, and folders.
            </p>
          </div>

          {/* Action buttons (Add collection etc) */}
          <div className="flex items-center gap-2">
            {selectedFolder && (
              <button 
                onClick={() => setSelectedFolder(null)}
                className="text-xs text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100 flex items-center gap-1 bg-neutral-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>All Folders</span>
              </button>
            )}

            {!showAddFolderInput ? (
              <button
                type="button"
                onClick={() => {
                  if (!visitorUser && setShowAuthModal) {
                    setAuthModalPurpose?.('Create custom collection folders to organize your research');
                    setShowAuthModal(true);
                    return;
                  }
                  setShowAddFolderInput(true);
                }}
                className="bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition flex items-center gap-1 shrink-0"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Folder</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 animate-fadeIn">
                <input 
                  type="text" 
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="text-xs border rounded-xl px-3 py-2 outline-none dark:bg-zinc-800 dark:border-zinc-700 text-neutral-950 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                />
                <button 
                  onClick={handleAddFolder}
                  className="bg-indigo-600 text-white p-2 rounded-xl text-xs hover:bg-indigo-700"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setShowAddFolderInput(false)}
                  className="bg-neutral-200 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 p-2 rounded-xl text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50 dark:bg-zinc-800/20 p-2.5 rounded-2xl border border-neutral-100 dark:border-zinc-800">
          
          {/* Main filters: Videos, Documents, Courses, Collections */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All Vaults', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
              { id: 'videos', label: 'Videos', icon: <Video className="w-3.5 h-3.5" /> },
              { id: 'documents', label: 'Documents', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'courses', label: 'Courses (Stacks)', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'collections', label: 'Collections', icon: <Folder className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab.id as any);
                    setSelectedFolder(null); // Reset sub folder view
                  }}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                    active 
                      ? 'bg-neutral-950 dark:bg-zinc-100 text-white dark:text-neutral-950 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar inside filters */}
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-900 dark:border-zinc-800 text-neutral-950 dark:text-white"
            />
          </div>

        </div>

        {/* Selected breadcrumb folder visual */}
        {selectedFolder && (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 px-4 py-2.5 rounded-2xl text-xs flex items-center justify-between">
            <span className="font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4" />
              <span>Viewing Folder: "{selectedFolder}"</span>
            </span>
            <button 
              onClick={() => setSelectedFolder(null)}
              className="text-[10px] bg-white dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 text-indigo-900 dark:text-zinc-300 font-bold px-2.5 py-1 rounded-lg border cursor-pointer"
            >
              Clear Folder Filter
            </button>
          </div>
        )}

        {/* The Bento Grid list of items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* RENDER COLLECTIONS TAB */}
          {activeFilter === 'collections' && (
            <>
              {collections.map((col, idx) => {
                const count = savedSummaries.filter(s => s.collection === col).length;
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedFolder(col);
                      setActiveFilter('all'); // Go to list view filtered by folder
                    }}
                    className="bg-neutral-50/30 dark:bg-zinc-900/40 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-indigo-500/30 hover:bg-neutral-50/80 dark:hover:bg-zinc-800/40 transition-all duration-300 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                        <Folder className="w-5 h-5 fill-indigo-100 dark:fill-indigo-950/20" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <h4 className="font-bold text-xs text-neutral-850 dark:text-zinc-200 truncate">{col}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">{count} item{count !== 1 ? 's' : ''} saved</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                );
              })}
              {collections.length === 0 && (
                <div className="col-span-full p-8 text-center text-xs text-neutral-400 font-light italic bg-neutral-50 dark:bg-zinc-800/10 rounded-2xl border border-dashed">
                  No collection folders created yet. Click "New Folder" above to classify materials.
                </div>
              )}
            </>
          )}

          {/* RENDER COURSES (SYNTHESIZED STACKS) */}
          {activeFilter === 'courses' && (
            <>
              {savedStacks.map((stack) => (
                <div 
                  key={stack.id}
                  onClick={() => onLoadStack?.(stack)}
                  className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-3xl p-5 cursor-pointer hover:border-indigo-500/30 hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between min-h-[175px] group relative overflow-hidden"
                >
                  <div className="absolute top-[-10%] right-[-10%] w-20 h-20 bg-[#bf5af2]/[0.02] blur-xl rounded-full"></div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 text-purple-700 dark:text-purple-400 font-bold font-mono px-2 py-0.5 rounded-md">
                        Synthesized Course
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono font-bold">
                        {stack.videoTitles?.length || 0} Topics
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-neutral-850 dark:text-zinc-200 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {stack.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-light line-clamp-3">
                      {stack.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-dashed dark:border-zinc-800 pt-3 mt-4">
                    <span className="text-[9px] text-neutral-400">Created: {stack.createdAt}</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                      Enter Stack Course <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
              {savedStacks.length === 0 && (
                <div className="col-span-full p-8 text-center text-xs text-neutral-400 font-light italic bg-neutral-50 dark:bg-zinc-800/10 rounded-2xl border border-dashed">
                  No synthesized course stacks found. Synthesize multiple videos in the library to bridge knowledge!
                </div>
              )}
            </>
          )}

          {/* RENDER WORKSPACES (VIDEOS / DOCUMENTS) */}
          {activeFilter !== 'collections' && activeFilter !== 'courses' && (
            <>
              {filteredSummaries.map((stored) => {
                const isDoc = checkIsDocument(stored);
                return (
                  <div 
                    key={stored.id}
                    onClick={() => onActivateDemo(stored.response)}
                    className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-3xl p-4 cursor-pointer hover:border-indigo-500/30 hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between group relative"
                  >
                    <div className="space-y-3">
                      
                      {/* Image / Icon container */}
                      <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-zinc-800 border dark:border-zinc-800 shadow-sm flex items-center justify-center">
                        {isDoc ? (
                          <div className="flex flex-col items-center gap-1 text-neutral-400 dark:text-zinc-500">
                            <FileText className="w-8 h-8 text-indigo-500/60" />
                            <span className="text-[9px] font-bold font-mono tracking-wider uppercase">Document Workspace</span>
                          </div>
                        ) : (
                          <>
                            <img src={stored.response.metadata?.thumbnailUrl} alt="Video cover" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" loading="lazy" />
                            <div className="absolute bottom-1.5 right-1.5 bg-black/75 rounded text-[8px] font-mono text-white px-1 leading-none">
                              {stored.response.metadata?.duration || '12 mins'}
                            </div>
                          </>
                        )}

                        <span className="absolute top-1.5 left-1.5 text-[8px] bg-white/95 dark:bg-zinc-900/90 font-mono font-bold px-1.5 py-0.5 rounded shadow-sm text-neutral-600 dark:text-zinc-300">
                          {isDoc ? 'PDF Doc' : 'YouTube Video'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-neutral-850 dark:text-zinc-200 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {stored.response.metadata?.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {stored.collection && (
                            <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase font-sans">
                              📁 {stored.collection}
                            </span>
                          )}
                          <span className="text-[8px] text-neutral-400 font-mono">
                            Processed: {stored.savedAt}
                          </span>
                        </div>
                      </div>

                    </div>

                    <div className="flex items-center justify-between border-t border-dashed dark:border-zinc-800 pt-3 mt-4">
                      <span className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                        Author: {stored.response.metadata?.author || 'Zipytiny AI'}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                        Resume Study <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                  </div>
                );
              })}

              {filteredSummaries.length === 0 && (
                <div className="col-span-full p-10 text-center text-xs text-neutral-400 font-light italic bg-neutral-50 dark:bg-zinc-800/10 rounded-2xl border border-dashed">
                  No matching workspace items found in your library. Use the primary processor at the top to summarize documents, videos or paste logs.
                </div>
              )}
            </>
          )}

        </div>

      </div>

      {/* 6. RECOMMENDED ADDITIONAL LEARNING (Bridges content) */}
      <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/20 border border-indigo-100 dark:border-indigo-950 p-6 rounded-3xl text-left space-y-4 shadow-xs">
        <div>
          <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded font-mono">
            🎯 Recommended Learning Journeys
          </span>
          <h3 className="text-base font-bold font-display text-neutral-900 dark:text-zinc-200 mt-2">
            Recommended Study Path Sequencing
          </h3>
          <p className="text-neutral-500 dark:text-zinc-400 text-xs font-light">
            Based on your active study logs and spacing drills, these preloads contain major conceptual crossovers:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              videoId: 'qp0HIF3SfI4',
              title: 'Simon Sinek: How Great Leaders Inspire Action (The Golden Circle)',
              author: 'TED Talks',
              thumbnailUrl: 'https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg',
              pill: 'Decision biology and limbic lattices',
              duration: '18 min'
            },
            {
              videoId: 'UF8uR6Z6KLc',
              title: 'Steve Jobs: 2005 Stanford Commencement Address',
              author: 'Stanford University',
              thumbnailUrl: 'https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg',
              pill: 'Intuitive design and professional resilience',
              duration: '15 min'
            }
          ].map((rec, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onLoadVideo(rec.videoId, false)}
              className="bg-white dark:bg-zinc-900 border rounded-2xl p-3 shadow-xs hover:border-indigo-600 hover:shadow-md transition text-left flex gap-3 group items-center cursor-pointer dark:border-zinc-800"
            >
              <div className="relative w-16 h-10 bg-neutral-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 border dark:border-zinc-700">
                <img src={rec.thumbnailUrl} alt="Rec Thumbnail" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="overflow-hidden space-y-0.5 text-left flex-1">
                <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-mono font-bold px-1.5 py-0.2 rounded block w-fit truncate max-w-full">
                  {rec.pill}
                </span>
                <h4 className="text-xs font-bold text-neutral-850 dark:text-zinc-200 truncate leading-tight group-hover:text-indigo-600">
                  {rec.title}
                </h4>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>
      </div>
      )}

      {activeDashboardTab === 'stats' && (
        <div className="space-y-6 animate-fadeIn text-left">
          {/* Two-column Layout for Scholar Statistics & Gamification */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Achievements Heatmap & Study Reminders */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Achievements Card */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display text-neutral-950 dark:text-zinc-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Academic Achievements</span>
                  </h3>
                  <p className="text-neutral-400 text-xs font-light">
                    Sustained engagement milestones and neural retention badges.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: "pioneer",
                      title: "Cognitive Pioneer",
                      desc: "Process your first AI-synthesized workspace.",
                      unlocked: savedSummaries.length >= 1,
                      metric: `${savedSummaries.length} / 1`,
                      progress: Math.min((savedSummaries.length / 1) * 100, 100),
                      icon: <Compass className="w-4 h-4" />
                    },
                    {
                      id: "collector",
                      title: "Concept Collector",
                      desc: "Harvest 3 core mental models from summaries.",
                      unlocked: totalConceptsCount >= 3,
                      metric: `${totalConceptsCount} / 3`,
                      progress: Math.min((totalConceptsCount / 3) * 100, 100),
                      icon: <Brain className="w-4 h-4" />
                    },
                    {
                      id: "architect",
                      title: "Synaptic Architect",
                      desc: "Bridge 2 topics using relationship links.",
                      unlocked: graphNodesState.filter(n => n.crossLinks && n.crossLinks.length > 0).length >= 2,
                      metric: `${graphNodesState.filter(n => n.crossLinks && n.crossLinks.length > 0).length} / 2`,
                      progress: Math.min((graphNodesState.filter(n => n.crossLinks && n.crossLinks.length > 0).length / 2) * 100, 100),
                      icon: <Network className="w-4 h-4" />
                    },
                    {
                      id: "scholar",
                      title: "Spaced Scholar",
                      desc: "Execute 10 active recall spacing evaluations.",
                      unlocked: flashcardsReviewedCount >= 10,
                      metric: `${flashcardsReviewedCount} / 10`,
                      progress: Math.min((flashcardsReviewedCount / 10) * 100, 100),
                      icon: <BookOpenCheck className="w-4 h-4" />
                    },
                    {
                      id: "unbroken",
                      title: "Unbroken Diligence",
                      desc: "Build strong habits with a 5-day active streak.",
                      unlocked: graph.streak >= 5,
                      metric: `${graph.streak} / 5`,
                      progress: Math.min((graph.streak / 5) * 100, 100),
                      icon: <Flame className="w-4 h-4" />
                    },
                    {
                      id: "perfectionist",
                      title: "Quiz Perfectionist",
                      desc: "Score 100% on any comprehensive evaluation drill.",
                      unlocked: graph.quizHistory?.some(q => q.score === q.total) || false,
                      metric: graph.quizHistory?.some(q => q.score === q.total) ? "100% Score" : "Locked",
                      progress: graph.quizHistory?.some(q => q.score === q.total) ? 100 : 0,
                      icon: <Award className="w-4 h-4" />
                    }
                  ].map((ach) => (
                    <div 
                      key={ach.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 relative overflow-hidden group ${
                        ach.unlocked 
                          ? 'bg-neutral-50/50 dark:bg-zinc-800/20 border-neutral-200/80 dark:border-zinc-800/80 hover:border-indigo-500/30' 
                          : 'bg-neutral-50/20 dark:bg-zinc-900/10 border-dashed border-neutral-200 dark:border-zinc-800 opacity-60'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                        ach.unlocked 
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60' 
                          : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 dark:text-zinc-500 border-neutral-200 dark:border-zinc-700'
                      }`}>
                        {ach.icon}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-zinc-100 truncate">
                            {ach.title}
                          </h4>
                          {ach.unlocked && (
                            <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded-md uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 dark:text-zinc-500 leading-normal font-light">
                          {ach.desc}
                        </p>

                        <div className="space-y-1 pt-1.5">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span>Progress</span>
                            <span>{ach.metric}</span>
                          </div>
                          <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                ach.unlocked ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-neutral-300 dark:bg-zinc-700'
                              }`}
                              style={{ width: `${ach.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimalist Heatmap Grid (Learning Calendar) */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display text-neutral-950 dark:text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Learning Calendar Heatmap</span>
                  </h3>
                  <p className="text-neutral-400 text-xs font-light">
                    Visual tracking of daily cognitive activity across a rolling 4-week grid.
                  </p>
                </div>

                {/* Calendar Grid Representation */}
                <div className="border border-neutral-100 dark:border-zinc-800/80 rounded-2xl p-4.5 bg-neutral-50/30 dark:bg-zinc-900/50">
                  <div className="grid grid-cols-7 gap-2 max-w-lg mx-auto">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <span key={i} className="text-[10px] font-mono font-bold text-neutral-400 text-center pb-2">
                        {day}
                      </span>
                    ))}
                    {(() => {
                      const daysInRollingGrid = 28;
                      const squares = [];
                      const todayDate = new Date();
                      
                      // Align starting date offset to Sunday
                      const startOffset = new Date(todayDate);
                      startOffset.setDate(todayDate.getDate() - (daysInRollingGrid - 1));
                      const startDay = startOffset.getDay();
                      
                      // Render empty pre-offset cells if needed
                      for (let i = 0; i < startDay; i++) {
                        squares.push(<div key={`empty-${i}`} className="aspect-square bg-transparent rounded-lg" />);
                      }

                      for (let i = 0; i < daysInRollingGrid; i++) {
                        const cellDate = new Date(startOffset);
                        cellDate.setDate(startOffset.getDate() + i);
                        const cellDateStr = cellDate.toDateString();
                        
                        const isToday = cellDateStr === todayDate.toDateString();
                        const isStudied = studyCalendar.includes(cellDateStr);
                        
                        squares.push(
                          <div 
                            key={cellDateStr}
                            className={`aspect-square rounded-lg border transition-all duration-300 flex flex-col items-center justify-center relative group select-none cursor-default ${
                              isStudied 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                                : isToday
                                  ? 'bg-neutral-100 dark:bg-zinc-800 border-indigo-400 dark:border-indigo-500 text-neutral-900 dark:text-white'
                                  : 'bg-white dark:bg-zinc-900 border-neutral-200 dark:border-zinc-800 text-neutral-500 dark:text-zinc-500 hover:border-indigo-400'
                            }`}
                            title={`${cellDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${isStudied ? 'Studied' : 'Inactive'}`}
                          >
                            <span className="text-[10px] font-mono font-bold leading-none">
                              {cellDate.getDate()}
                            </span>
                            {isStudied && (
                              <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
                            )}
                          </div>
                        );
                      }
                      return squares;
                    })()}
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-4 border-t border-neutral-100 dark:border-zinc-850 max-w-lg mx-auto">
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-md bg-indigo-600 border border-indigo-600" />
                        <span className="text-[10px] text-neutral-400 font-mono">Active day</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-md bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800" />
                        <span className="text-[10px] text-neutral-400 font-mono">Rest day</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Total: {studyCalendar.length} Active Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Study Reminders Card */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display text-neutral-950 dark:text-zinc-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Study Reminders & Notifications</span>
                  </h3>
                  <p className="text-neutral-400 text-xs font-light">
                    Establish recurring intervals to feed your memory graph and maintain retention pathways.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-neutral-50/40 dark:bg-zinc-900/40 p-4.5 rounded-2xl border dark:border-zinc-800">
                  <div className="space-y-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-bold text-neutral-900 dark:text-zinc-100 block">Push Notifications</span>
                        <span className="text-[10px] text-neutral-400 font-light block">Get alerted for due spaced recall decks.</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const next = !reminderEnabled;
                          setReminderEnabled(next);
                          localStorage.setItem('zipytiny_reminder_enabled', String(next));
                          if (next) {
                            setReminderMessage("Reminders enabled successfully.");
                            setTimeout(() => setReminderMessage(null), 3000);
                          }
                        }}
                        className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                          reminderEnabled ? 'bg-indigo-600' : 'bg-neutral-350 dark:bg-zinc-700'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                          reminderEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Time Selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono tracking-wider block">Reminder Time</span>
                      <div className="flex gap-2">
                        {['09:00', '12:00', '18:00', '21:00'].map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              setReminderTime(time);
                              localStorage.setItem('zipytiny_reminder_time', time);
                              setReminderMessage(`Reminders scheduled for ${time} daily.`);
                              setTimeout(() => setReminderMessage(null), 3000);
                            }}
                            className={`flex-1 text-xs font-mono font-bold py-2 rounded-xl border transition ${
                              reminderTime === time
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400'
                                : 'bg-white border-neutral-200 hover:border-neutral-350 dark:bg-zinc-900 dark:border-zinc-850 text-neutral-700 dark:text-zinc-300'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frequency Selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono tracking-wider block">Frequency Interval</span>
                      <div className="flex gap-2">
                        {[
                          { key: 'daily', label: 'Daily' },
                          { key: 'weekdays', label: 'Weekdays' },
                          { key: 'weekends', label: 'Weekends' }
                        ].map((freq) => (
                          <button
                            key={freq.key}
                            type="button"
                            onClick={() => {
                              setReminderFreq(freq.key);
                              localStorage.setItem('zipytiny_reminder_freq', freq.key);
                              setReminderMessage(`Frequency set to ${freq.label.toLowerCase()}.`);
                              setTimeout(() => setReminderMessage(null), 3000);
                            }}
                            className={`flex-1 text-[10px] font-bold py-2 rounded-xl border transition ${
                              reminderFreq === freq.key
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400'
                                : 'bg-white border-neutral-200 hover:border-neutral-350 dark:bg-zinc-900 dark:border-zinc-850 text-neutral-700 dark:text-zinc-300'
                            }`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-center md:border-l border-neutral-150 dark:border-zinc-800 md:pl-6 space-y-3 flex flex-col items-center justify-center min-h-[140px]">
                    <Clock className="w-8 h-8 text-indigo-500/80 animate-pulse" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-neutral-950 dark:text-zinc-100 block">
                        {reminderEnabled ? 'Active Schedule' : 'Schedule Standby'}
                      </span>
                      <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-light max-w-xs mx-auto leading-normal">
                        {reminderEnabled 
                          ? `Alerts configured for ${reminderFreq === 'daily' ? 'every day' : reminderFreq === 'weekdays' ? 'Monday to Friday' : 'Saturday and Sunday'} at ${reminderTime}.`
                          : 'Reminders are currently off. Turn them on above to configure delivery channels.'
                        }
                      </p>
                    </div>

                    {reminderMessage && (
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 rounded-md animate-fadeIn">
                        {reminderMessage}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Goal Hub, Progress Ring, Statistics & Mastery Breakdown */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Daily Goals Hub (incorporating Progress Ring & Completion Percentage) */}
              {(() => {
                const totalGoals = 3;
                const goalsCompletedCount = (dailyCompleted ? 1 : 0) + (reviewedTodayCount >= 2 ? 1 : 0) + (insightsSavedToday ? 1 : 0);
                const percentCompleted = Math.round((goalsCompletedCount / totalGoals) * 100);
                
                // SVG circular progress dimensions
                const radius = 38;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percentCompleted / 100) * circumference;

                return (
                  <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-5 text-left">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-wider block">Daily Focus</span>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100">Daily Objectives</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                        {goalsCompletedCount} / {totalGoals} Done
                      </span>
                    </div>

                    {/* Progress Ring Visualizer */}
                    <div className="flex items-center gap-4 bg-neutral-50/50 dark:bg-zinc-900/40 p-3.5 rounded-2xl border dark:border-zinc-850">
                      <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r={radius}
                            className="text-neutral-100 dark:text-zinc-800"
                            strokeWidth="5"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r={radius}
                            className="text-indigo-600 dark:text-indigo-500 transition-all duration-700"
                            strokeWidth="5"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-sm font-bold font-mono text-neutral-900 dark:text-zinc-100">
                            {percentCompleted}%
                          </span>
                          <span className="text-[8px] text-neutral-400 font-mono">GOAL</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-900 dark:text-zinc-100 block">Today's Progress</span>
                        <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-light leading-normal">
                          {percentCompleted === 100 
                            ? 'Excellent! All daily goals achieved. Bonus XP awarded.'
                            : 'Fulfill each objective below to maintain streaks and claim daily XP boosts.'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Objectives Checklist */}
                    <div className="space-y-3.5 pt-1">
                      {[
                        {
                          id: "g1",
                          title: "Resolve Daily Challenge",
                          desc: "Complete the neural challenge question",
                          done: dailyCompleted,
                          sub: "150 XP Reward"
                        },
                        {
                          id: "g2",
                          title: "Spaced Spacing Drill",
                          desc: "Review 2 spacing terms in due deck",
                          done: reviewedTodayCount >= 2,
                          sub: `${reviewedTodayCount} / 2 completed`
                        },
                        {
                          id: "g3",
                          title: "Cognitive Insights Saved",
                          desc: "Draft a note or attach tag to nodes",
                          done: insightsSavedToday,
                          sub: "30 XP Reward"
                        }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className={`mt-0.5 p-0.5 rounded-lg border transition-all duration-300 ${
                            item.done 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-900' 
                              : 'bg-white border-neutral-200 text-neutral-400 dark:bg-zinc-900 dark:border-zinc-800'
                          }`}>
                            <Check className={`w-3.5 h-3.5 transition-all duration-300 ${item.done ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                          </div>
                          <div className="space-y-0.5 text-left flex-1 min-w-0">
                            <span className={`text-xs font-bold leading-tight block ${item.done ? 'text-neutral-500 dark:text-zinc-400 line-through' : 'text-neutral-900 dark:text-zinc-100'}`}>
                              {item.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block font-light">
                              {item.desc}
                            </span>
                            <span className="text-[9px] text-indigo-500 font-mono font-bold block">
                              {item.sub}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Claim Daily Bonus Button */}
                    {percentCompleted === 100 && (
                      <button
                        type="button"
                        disabled={dailyBonusClaimed}
                        onClick={() => {
                          setDailyBonusClaimed(true);
                          localStorage.setItem('zipytiny_daily_bonus_' + new Date().toDateString(), 'true');
                          const gUpdate = { ...graph };
                          awardXpPoints(50, gUpdate);
                          setReminderMessage("Successfully claimed +50 XP Diligence Bonus!");
                          setTimeout(() => setReminderMessage(null), 3000);
                        }}
                        className={`w-full py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                          dailyBonusClaimed
                            ? 'bg-neutral-100 text-neutral-400 dark:bg-zinc-850 dark:text-zinc-600'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs active:scale-95'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{dailyBonusClaimed ? "Daily Bonus Claimed" : "Claim +50 XP Bonus"}</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Weekly Goals Hub */}
              {(() => {
                const wsGoal = Math.min(savedSummaries.length, 2);
                const bridgeGoal = Math.min(graphNodesState.filter(n => n.crossLinks && n.crossLinks.length > 0).length, 2);
                const masteryGoal = Math.min(conceptsArray.filter(c => c.masteryLevel >= 80).length, 3);
                
                const wsPercent = Math.round((wsGoal / 2) * 100);
                const bridgePercent = Math.round((bridgeGoal / 2) * 100);
                const masteryPercent = Math.round((masteryGoal / 3) * 100);

                const overallWeeklyPercent = Math.round((wsPercent + bridgePercent + masteryPercent) / 3);

                return (
                  <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-wider block">Weekly Objectives</span>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100">Weekly Habits progress</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {overallWeeklyPercent}%
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* WS progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                          <span>Synthesize 2 New Workspaces</span>
                          <span>{wsGoal} / 2</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${wsPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Bridge progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                          <span>Bridge 2 Topic Crossovers</span>
                          <span>{bridgeGoal} / 2</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#bf5af2] h-1.5 rounded-full"
                            style={{ width: `${bridgePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Mastery progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                          <span>3 Concepts with Mastery &gt;= 80%</span>
                          <span>{masteryGoal} / 3</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${masteryPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Personal Statistics panel */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase font-mono tracking-wider block">Performance Logs</span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100">Personal Statistics</h4>
                  </div>
                  <Activity className="w-4 h-4 text-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { label: "Active Streak", val: `${graph.streak} Days`, icon: <Flame className="w-3.5 h-3.5 text-amber-500" /> },
                    { label: "Level Rank", val: `Level ${graph.level}`, icon: <Award className="w-3.5 h-3.5 text-indigo-500" /> },
                    { label: "Overall XP", val: `${graph.xp} XP`, icon: <Zap className="w-3.5 h-3.5 text-[#bf5af2]" /> },
                    { label: "Drill Accuracy", val: `${averageQuizPercent}%`, icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-500" /> },
                    { label: "Models Captured", val: totalConceptsCount, icon: <Brain className="w-3.5 h-3.5 text-pink-500" /> },
                    { label: "Drills Taken", val: quizzesTakenCount, icon: <BookOpenCheck className="w-3.5 h-3.5 text-teal-500" /> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-neutral-50/50 dark:bg-zinc-900/50 p-3 rounded-2xl border dark:border-zinc-850 flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-850 border dark:border-zinc-800 shrink-0">
                        {stat.icon}
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-[8px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">{stat.label}</span>
                        <span className="text-xs font-bold font-mono text-neutral-900 dark:text-zinc-100 block truncate">{stat.val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mastery Levels rank breakdown */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase font-mono tracking-wider block">Retention Weights</span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100">Mastery Levels Breakdown</h4>
                  </div>
                  <Brain className="w-4 h-4 text-pink-500" />
                </div>

                <div className="space-y-3 pt-1">
                  {[
                    { label: "Level 4: Mastery", range: "80 - 100%", count: conceptsArray.filter(c => c.masteryLevel >= 80).length, color: "bg-emerald-500" },
                    { label: "Level 3: Proficient", range: "60 - 79%", count: conceptsArray.filter(c => c.masteryLevel >= 60 && c.masteryLevel < 80).length, color: "bg-indigo-500" },
                    { label: "Level 2: Apprentice", range: "30 - 59%", count: conceptsArray.filter(c => c.masteryLevel >= 30 && c.masteryLevel < 60).length, color: "bg-amber-500" },
                    { label: "Level 1: Novice", range: "0 - 29%", count: conceptsArray.filter(c => c.masteryLevel < 30).length, color: "bg-red-500" }
                  ].map((level, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-850/40 transition">
                      <div className="flex items-center gap-2 text-left">
                        <span className={`w-2 h-2 rounded-full ${level.color}`} />
                        <div>
                          <span className="text-xs font-bold text-neutral-950 dark:text-zinc-100 block">{level.label}</span>
                          <span className="text-[9px] text-neutral-400 font-mono block">Score range: {level.range}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 px-2 py-1 rounded-lg">
                        {level.count} model{level.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
