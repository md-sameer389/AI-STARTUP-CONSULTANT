'use client';

import React, { useState } from 'react';
import { api, ReportResponse } from '../lib/api';
import { FileDown, Code, Link as LinkIcon, Check } from 'lucide-react';

interface DownloadCenterProps {
  jobId: string;
  reportData: ReportResponse;
}

export default function DownloadCenter({ jobId, reportData }: DownloadCenterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/report/${jobId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `startup_report_${jobId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export raw JSON:', err);
    }
  };

  const downloadPdfUrl = api.getDownloadUrl(jobId);

  return (
    <div className="w-full glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
      <div>
        <h4 className="text-sm font-bold text-white mb-0.5">Export Planning Collaterals</h4>
        <p className="text-xs text-textSecondary">Download resources for offline pitches, presentations, and spreadsheet models.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* PDF Download */}
        <a
          href={downloadPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-indigo-violet hover:opacity-90 font-semibold text-white text-xs tracking-wide shadow-lg shadow-primaryAccent/25 transition-all"
        >
          <FileDown size={16} />
          Download PDF Report
        </a>

        {/* JSON Export */}
        <button
          onClick={handleDownloadJSON}
          className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs tracking-wide transition-all"
        >
          <Code size={16} />
          Export JSON Data
        </button>

        {/* Copy Share Link */}
        <button
          onClick={handleCopyLink}
          className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs tracking-wide transition-all min-w-[130px]"
        >
          {copied ? (
            <>
              <Check size={16} className="text-successColor" />
              <span className="text-successColor">Link Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon size={16} />
              Share Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
