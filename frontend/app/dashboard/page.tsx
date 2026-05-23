'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, ReportResponse } from '../../lib/api';
import { FileText, ArrowRight, Download, Search, Sparkles, Loader2, Calendar } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';

export default function DashboardPage() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user_id') || 'demo-user';
    setUserId(stored);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchReports = async () => {
      try {
        const data = await api.getReportsByUser(userId);
        setReports(data);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError('Could not retrieve past analysis reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [userId]);

  const filteredReports = reports.filter(r => 
    r.startup_idea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthGuard>
    <div className="flex-grow flex flex-col gap-8 max-w-6xl mx-auto w-full px-4 md:px-6 py-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-borderColor pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Plan <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Access and manage all your past AI agent strategic analysis reports.
          </p>
        </div>
        
        <Link 
          href="/analyze" 
          className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-indigo-violet hover:opacity-90 font-semibold text-xs text-white tracking-wide shadow-lg shadow-primaryAccent/25 transition-all"
        >
          <Sparkles size={14} />
          New Analysis
        </Link>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="animate-spin text-primaryAccent" size={40} />
            <p className="text-textSecondary text-sm">Retrieving your analysis history...</p>
          </div>
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center max-w-md mx-auto my-10 flex flex-col items-center gap-4">
          <p className="text-dangerColor text-sm font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="py-2 px-5 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 text-white"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Search Filter */}
          {reports.length > 0 && (
            <div className="relative max-w-md w-full glass-card p-1">
              <span className="absolute inset-y-0 left-4 flex items-center text-textSecondary">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past startup ideas..."
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-white placeholder-textSecondary focus:outline-none"
              />
            </div>
          )}

          {/* List/Cards */}
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReports.map((report) => (
                <div 
                  key={report.job_id} 
                  className="glass-card p-6 flex flex-col justify-between gap-6 hover:translate-y-[-2px] transition-all"
                >
                  <div className="flex flex-col gap-3">
                    {/* Timestamp & Icon */}
                    <div className="flex items-center gap-2 text-[10px] text-textSecondary uppercase tracking-wider font-semibold">
                      <Calendar size={12} className="text-primaryAccent" />
                      {new Date(report.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {/* Startup Idea */}
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-relaxed">
                      {report.startup_idea}
                    </h3>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between border-t border-borderColor pt-4 mt-2">
                    <span className="text-[10px] font-bold text-successColor uppercase tracking-wider bg-successColor/10 border border-successColor/20 px-2 py-0.5 rounded-full">
                      Completed
                    </span>

                    <div className="flex items-center gap-2">
                      {report.pdf_url && (
                        <a
                          href={api.getDownloadUrl(report.job_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download PDF"
                          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-textSecondary hover:text-white transition-all"
                        >
                          <Download size={14} />
                        </a>
                      )}
                      
                      <Link
                        href={`/report/${report.job_id}`}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primaryAccent/10 border border-primaryAccent/20 hover:bg-primaryAccent/20 text-primaryAccent text-xs font-semibold transition-all"
                      >
                        View Report
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center flex flex-col items-center gap-4 my-10 max-w-lg mx-auto">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-textSecondary">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">No reports found</h3>
                <p className="text-xs text-textSecondary max-w-sm">
                  {searchQuery 
                    ? `No past reports match the query "${searchQuery}"`
                    : 'You haven\'t created any startup analysis reports yet. Submit an idea on the homepage to start.'}
                </p>
              </div>
              {!searchQuery && (
                <Link 
                  href="/analyze" 
                  className="py-2.5 px-5 rounded-xl bg-indigo-violet text-white text-xs font-semibold hover:opacity-90 shadow-lg shadow-primaryAccent/20 transition-all"
                >
                  Start First Analysis
                </Link>
              )}
            </div>
          )}

        </div>
      )}
    </div>
    </AuthGuard>
  );
}
