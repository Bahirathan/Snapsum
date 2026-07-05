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
    <div className="bg-white dark:bg-zinc-950/80 border border-black/[0.04] dark:border-zinc-850 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h4 className="text-xs font-bold text-neutral-850 dark:text-zinc-200">Export & Share Knowledge Suite</h4>
      </div>
      <p className="text-[10px] text-[#86868b] dark:text-zinc-400 text-left">
        Sync, download, or copy this summary into your favorite personal workspaces. Fully compliant with modern markdown and layout parameters.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {/* PDF */}
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-black/[0.04] dark:border-zinc-800 rounded-xl text-xs font-medium text-neutral-800 dark:text-zinc-200 transition cursor-pointer text-left"
        >
          <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">Download PDF Report</span>
        </button>

        {/* Word */}
        <button
          onClick={handleExportWord}
          className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-black/[0.04] dark:border-zinc-800 rounded-xl text-xs font-medium text-neutral-800 dark:text-zinc-200 transition cursor-pointer text-left"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate">Download Word Doc</span>
        </button>

        {/* Markdown */}
        <button
          onClick={handleExportMarkdown}
          className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-black/[0.04] dark:border-zinc-800 rounded-xl text-xs font-medium text-neutral-800 dark:text-zinc-200 transition cursor-pointer text-left"
        >
          <Download className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">Export Markdown (.md)</span>
        </button>

        {/* Copy to Notion */}
        <button
          onClick={() => handleCopyToClipboard('notion')}
          className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-black/[0.04] dark:border-zinc-800 rounded-xl text-xs font-medium text-neutral-800 dark:text-zinc-200 transition cursor-pointer text-left relative"
        >
          <Clipboard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">{copiedFormat === 'notion' ? 'Copied to clipboard!' : 'Copy to Notion'}</span>
          {copiedFormat === 'notion' && <Check className="w-3 h-3 text-emerald-500 absolute right-3" />}
        </button>

        {/* Copy Share Link */}
        <button
          onClick={() => handleCopyToClipboard('share')}
          className="col-span-2 flex items-center justify-center gap-2 px-3 py-3 bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl text-xs font-semibold text-white transition cursor-pointer shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span>{copiedFormat === 'share' ? 'Copied Public Link!' : 'Generate Shareable Link'}</span>
          {copiedFormat === 'share' && <Check className="w-3.5 h-3.5 text-white ml-1" />}
        </button>
      </div>
    </div>
  );
}
