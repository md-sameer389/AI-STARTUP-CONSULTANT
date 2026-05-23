'use client';

import React from 'react';
import { ReportResponse } from '../lib/api';

interface ReportViewerProps {
  report: ReportResponse;
}

export default function ReportViewer({ report }: ReportViewerProps) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white">Report Summary View</h2>
      <p className="text-xs text-textSecondary leading-relaxed">
        The report has been parsed successfully. Switch tabs above to see section details.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-white/5 p-4 rounded-xl border border-borderColor">
          <span className="text-[10px] text-textSecondary uppercase tracking-wider block">Startup Concept</span>
          <span className="text-xs font-bold text-white mt-1 block line-clamp-2">{report.startup_idea}</span>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-borderColor">
          <span className="text-[10px] text-textSecondary uppercase tracking-wider block">PDF Status</span>
          <span className="text-xs font-bold text-successColor mt-1 block">{report.pdf_url ? 'Hosted Remote URL Available' : 'Cached Local PDF'}</span>
        </div>
      </div>
    </div>
  );
}
