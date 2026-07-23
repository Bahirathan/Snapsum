import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Target, Lightbulb, Brain, Calendar, GraduationCap, CheckCircle2, 
  Sparkles, BookOpen, Clock, ChevronRight, Award, Flame, Layers
} from 'lucide-react';

interface FormattedSummaryViewProps {
  summaryText: string;
}

export default function FormattedSummaryView({ summaryText }: FormattedSummaryViewProps) {
  if (!summaryText) {
    return (
      <div className="p-8 text-center text-slate-400">
        No summary content available.
      </div>
    );
  }

  // Parse sections if markdown contains special section markers
  const sections = parseSummarySections(summaryText);

  // If structured sections were found, render rich visual cards
  if (sections.length > 0) {
    return (
      <div className="space-y-6 text-left">
        {sections.map((section, idx) => (
          <SummarySectionCard key={idx} section={section} />
        ))}
      </div>
    );
  }

  // Fallback to rich ReactMarkdown rendering if standard markdown
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm text-left">
      <div className="prose dark:prose-invert max-w-none space-y-4 text-slate-700 dark:text-zinc-200 text-sm leading-relaxed">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-lg font-bold font-display text-slate-900 dark:text-white border-l-4 border-indigo-600 pl-3 py-1 my-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-bold font-display text-slate-900 dark:text-white mt-5 mb-2 pb-1 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold font-display text-slate-800 dark:text-zinc-100 mt-4 mb-2 flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed my-2">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-slate-900 dark:text-white bg-indigo-50/80 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
                {children}
              </strong>
            ),
            ul: ({ children }) => (
              <ul className="space-y-2 my-3 pl-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-2 my-3 pl-1 list-decimal list-inside">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <span className="flex-1">{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-r-2xl italic text-slate-700 dark:text-zinc-300 text-sm my-4">
                {children}
              </blockquote>
            )
          }}
        >
          {summaryText}
        </ReactMarkdown>
      </div>
    </div>
  );
}

interface SummarySection {
  type: 'objectives' | 'relationships' | 'memory' | 'revision' | 'guide' | 'general';
  title: string;
  icon: any;
  iconColor: string;
  badgeColor: string;
  content: string;
  bullets?: string[];
}

function parseSummarySections(text: string): SummarySection[] {
  const sections: SummarySection[] = [];
  
  // Clean markdown noise from section titles
  const rawBlocks = text.split(/(?=\n(?:🎯|💡|🧠|📅|🎓|\*\*🎯|\*\*💡|\*\*🧠|\*\*📅|\*\*🎓|#{1,3}\s))/g);

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.includes('LEARNING OBJECTIVES') || trimmed.includes('🎯')) {
      const cleanTitle = trimmed.split('\n')[0].replace(/[\*#🎯]/g, '').trim();
      const content = trimmed.split('\n').slice(1).join('\n').trim();
      sections.push({
        type: 'objectives',
        title: cleanTitle || 'Core Learning Objectives',
        icon: Target,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        content,
        bullets: extractBullets(content)
      });
    } else if (trimmed.includes('CONCEPT RELATIONSHIPS') || trimmed.includes('💡')) {
      const cleanTitle = trimmed.split('\n')[0].replace(/[\*#💡]/g, '').trim();
      const content = trimmed.split('\n').slice(1).join('\n').trim();
      sections.push({
        type: 'relationships',
        title: cleanTitle || 'Concept Relationships & Advanced Themes',
        icon: Lightbulb,
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        content,
        bullets: extractBullets(content)
      });
    } else if (trimmed.includes('MEMORY TIPS') || trimmed.includes('RETENTION') || trimmed.includes('🧠')) {
      const cleanTitle = trimmed.split('\n')[0].replace(/[\*#🧠]/g, '').trim();
      const content = trimmed.split('\n').slice(1).join('\n').trim();
      sections.push({
        type: 'memory',
        title: cleanTitle || 'Expert Memory Tips & Retention Metrics',
        icon: Brain,
        iconColor: 'text-purple-600 dark:text-purple-400',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
        content,
        bullets: extractBullets(content)
      });
    } else if (trimmed.includes('REVISION PLAN') || trimmed.includes('📅')) {
      const cleanTitle = trimmed.split('\n')[0].replace(/[\*#📅]/g, '').trim();
      const content = trimmed.split('\n').slice(1).join('\n').trim();
      sections.push({
        type: 'revision',
        title: cleanTitle || 'Suggested 7-Day Revision Plan',
        icon: Calendar,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
        content,
        bullets: extractBullets(content)
      });
    } else if (trimmed.includes('COMPREHENSIVE STUDY GUIDE') || trimmed.includes('🎓') || trimmed.includes('Core Thesis')) {
      const cleanTitle = trimmed.split('\n')[0].replace(/[\*#🎓]/g, '').trim();
      const content = trimmed.split('\n').slice(1).join('\n').trim();
      sections.push({
        type: 'guide',
        title: cleanTitle || 'Comprehensive Study Guide & Detailed Explanations',
        icon: GraduationCap,
        iconColor: 'text-blue-600 dark:text-blue-400',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        content,
        bullets: extractBullets(content)
      });
    } else {
      sections.push({
        type: 'general',
        title: 'Executive Summary Narrative',
        icon: BookOpen,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
        content: trimmed,
        bullets: extractBullets(trimmed)
      });
    }
  }

  return sections;
}

function extractBullets(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+[\.\)]/.test(trimmed)) {
      const clean = trimmed.replace(/^[\•\-\*\d\.\)]+\s*/, '').trim();
      if (clean) bullets.push(clean);
    }
  }

  return bullets;
}

function SummarySectionCard({ section }: { section: SummarySection }) {
  const Icon = section.icon;
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 md:p-7 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${section.badgeColor} border shrink-0`}>
            <Icon className={`w-5 h-5 ${section.iconColor}`} />
          </div>
          <div>
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${section.badgeColor} border inline-block mb-1`}>
              {section.type.toUpperCase()} MODULE
            </span>
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white leading-tight">
              {section.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Revision Plan Special Timeline View */}
      {section.type === 'revision' && section.bullets && section.bullets.length > 0 ? (
        <div className="space-y-3 mt-4">
          {section.bullets.map((bullet, idx) => {
            const isDone = completedSteps[idx];
            return (
              <div 
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition cursor-pointer ${
                  isDone 
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 opacity-80' 
                    : 'bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200/70 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-900'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition ${
                  isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="font-mono text-xs font-bold">{idx + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-relaxed transition ${
                    isDone ? 'line-through text-slate-500 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200'
                  }`}>
                    {renderFormattedText(bullet)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : section.bullets && section.bullets.length > 0 ? (
        /* Bulleted Card Items */
        <div className="space-y-2.5 mt-3">
          {section.bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/60 dark:bg-zinc-950/30 border border-slate-200/60 dark:border-zinc-800/80">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
                {renderFormattedText(bullet)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* General Markdown Content */
        <div className="prose dark:prose-invert max-w-none text-xs md:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed space-y-2">
          <ReactMarkdown
            components={{
              strong: ({ children }) => (
                <strong className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
                  {children}
                </strong>
              ),
              p: ({ children }) => (
                <p className="my-1.5 text-xs md:text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
                  {children}
                </p>
              )
            }}
          >
            {section.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// Inline formatting helper for cleaning double stars **text** into bold badges
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <span key={i} className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40 mx-0.5">
          {inner}
        </span>
      );
    }
    return part;
  });
}
