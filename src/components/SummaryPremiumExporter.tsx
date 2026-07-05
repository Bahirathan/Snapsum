import React, { useState } from 'react';
import { Download, FileText, Share2, Clipboard, Check, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface SummaryPremiumExporterProps {
  title: string;
  summary: string;
  takeaways: any[];
  shareId?: string;
}

export default function SummaryPremiumExporter({ title, summary, takeaways, shareId }: SummaryPremiumExporterProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const getCleanTakeawaysText = () => {
    return takeaways
      .map((t, idx) => {
        const text = typeof t === 'string' ? t : t?.text || '';
        return `${idx + 1}. ${text}`;
      })
      .join('\n');
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Zipytiny Summary Report', 20, 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 32);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Title:', 20, 45);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const splitTitle = doc.splitTextToSize(title, 170);
      doc.text(splitTitle, 20, 52);
      
      let yPos = 52 + (splitTitle.length * 6) + 10;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Executive Summary:', 20, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      const splitSummary = doc.splitTextToSize(summary, 170);
      doc.text(splitSummary, 20, yPos + 7);
      
      yPos = yPos + 7 + (splitSummary.length * 5.5) + 10;
      
      if (yPos > 260) {
        doc.addPage();
        yPos = 25;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Key Takeaways:', 20, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const takeawaysList = takeaways.map((t, idx) => {
        const text = typeof t === 'string' ? t : t?.text || '';
        return `[ ] ${text}`;
      });
      
      takeawaysList.forEach((item) => {
        const splitItem = doc.splitTextToSize(item, 170);
        if (yPos + (splitItem.length * 5) > 280) {
          doc.addPage();
          yPos = 25;
        }
        doc.text(splitItem, 20, yPos + 7);
        yPos += 7 + (splitItem.length * 5);
      });
      
      doc.save(`zipytiny-summary-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Could not compile PDF. Downloading fallback Text file instead!');
      handleExportMarkdown();
    }
  };

  const handleExportMarkdown = () => {
    const content = `# Summary: ${title}\n\n## Executive Summary\n${summary}\n\n## Key Takeaways\n${getCleanTakeawaysText()}\n\n---\nGenerated with Zipytiny - Your Universal AI Video Summarizer & Study Hub (https://www.zipytiny.app)`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zipytiny-summary-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWord = () => {
    const content = `<html><head><meta charset="utf-8"></head><body><h1>Summary: ${title}</h1><h2>Executive Summary</h2><p>${summary}</p><h2>Key Takeaways</h2><ol>${takeaways.map((t) => `<li>${typeof t === 'string' ? t : t?.text || ''}</li>`).join('')}</ol><hr><p>Generated with Zipytiny (https://www.zipytiny.app)</p></body></html>`;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zipytiny-summary-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = (format: 'notion' | 'markdown' | 'share') => {
    let text = '';
    if (format === 'share') {
      text = shareId 
        ? `${window.location.origin}/s/${shareId}` 
        : `${window.location.origin}/app?video=${encodeURIComponent(title)}`;
    } else if (format === 'markdown') {
      text = `# Summary: ${title}\n\n## Executive Summary\n${summary}\n\n## Key Takeaways\n${getCleanTakeawaysText()}`;
    } else if (format === 'notion') {
      text = `title: ${title}\ntags: [Zipytiny, AI Summary]\n---\n# Executive Summary\n${summary}\n\n# Key Takeaways\n${getCleanTakeawaysText()}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-200 font-display">Export & Share</h4>
        </div>
        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full uppercase tracking-wide">Premium</span>
      </div>
      <p className="text-[11px] text-[#86868b] dark:text-zinc-400 leading-relaxed">
        Export this summary to PDF, Word, Markdown, or copy to Notion. Share a public link in one click.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'PDF Report', icon: <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />, action: handleExportPDF },
          { label: 'Word Document', icon: <FileText className="w-3.5 h-3.5 text-[#0071e3] shrink-0" />, action: handleExportWord },
          { label: 'Markdown (.md)', icon: <Download className="w-3.5 h-3.5 text-emerald-500 shrink-0" />, action: handleExportMarkdown },
          { label: copiedFormat === 'notion' ? 'Copied!' : 'Copy to Notion', icon: <Clipboard className="w-3.5 h-3.5 text-amber-500 shrink-0" />, action: () => handleCopyToClipboard('notion'), copied: copiedFormat === 'notion' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 dark:bg-zinc-800/60 hover:bg-neutral-100 dark:hover:bg-zinc-800 border border-neutral-150 dark:border-zinc-700/60 rounded-xl text-[11px] font-medium text-neutral-700 dark:text-zinc-300 transition-all cursor-pointer text-left card-hover focus-ring"
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
            {(item as any).copied && <Check className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />}
          </button>
        ))}

        <button
          onClick={() => handleCopyToClipboard('share')}
          className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0071e3] to-indigo-600 hover:opacity-95 rounded-xl text-xs font-semibold text-white transition cursor-pointer shadow-sm shadow-[#0071e3]/20 active:scale-[0.99] focus-ring"
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span>{copiedFormat === 'share' ? 'Link Copied to Clipboard!' : 'Copy Shareable Public Link'}</span>
          {copiedFormat === 'share' && <Check className="w-3.5 h-3.5 ml-1 shrink-0" />}
        </button>
      </div>
    </div>
  );
}
