'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AgentProgressTracker from '../../components/AgentProgressTracker';
import { useJobStatus } from '../../lib/hooks/useJobStatus';
import AuthGuard from '../components/AuthGuard';
import {
  AlertTriangle, Zap, ArrowRight, Loader2, Mic, FileText
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ─── Phase 1: Idea submission form ───────────────────────────────────────────
function IdeaSubmissionForm({ onJobStarted }: { onJobStarted: (jobId: string) => void }) {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (idea.trim().length < 10) {
      setError('Please describe your startup idea in at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id') || 'demo-user';

      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ startup_idea: idea.trim(), user_id: userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || 'Failed to submit your idea. Please try again.');
      }

      // Hand off job_id to the parent so we switch to the tracker phase
      onJobStarted(data.job_id);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 gap-10 animate-fade-in">
      {/* Page Header */}
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent text-xs font-semibold uppercase tracking-wider">
          <Zap size={13} />
          7-Agent AI Analysis Pipeline
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Analyze Your <span className="gradient-text">Startup Idea</span>
        </h1>
        <p className="text-sm text-textSecondary leading-relaxed">
          Describe your startup concept and our 7 specialized AI agents will generate a complete
          business plan — market research, competitors, strategy, financials, SWOT, and pitch deck.
        </p>
      </div>

      {/* Input Card */}
      <div className="w-full max-w-2xl glass-card p-6 md:p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="analyze-idea-input"
            className="text-xs font-semibold text-textSecondary uppercase tracking-wider"
          >
            Describe Your Startup Concept
          </label>

          <div className="relative">
            <textarea
              id="analyze-idea-input"
              value={idea}
              onChange={(e) => {
                setIdea(e.target.value.slice(0, 500));
                if (error) setError(null);
              }}
              placeholder="e.g. An AI-powered fitness app for college students that recommends personalized workout plans based on available dorm gym equipment and weekly schedule..."
              rows={5}
              disabled={loading}
              className="w-full rounded-xl bg-black/40 border border-borderColor p-4 pr-12 text-sm text-white placeholder-textSecondary focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent/40 resize-none transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              title="Voice input - coming soon"
              className="absolute bottom-3 right-3 p-2 rounded-lg bg-white/5 border border-white/10 text-textSecondary cursor-not-allowed"
              tabIndex={-1}
            >
              <Mic size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-textSecondary px-0.5">
            <span>More detail → better AI research output</span>
            <span className={idea.length >= 480 ? 'text-warningColor' : idea.length >= 500 ? 'text-dangerColor' : ''}>
              {idea.length} / 500
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-dangerColor/10 border border-dangerColor/25 animate-slide-up">
            <AlertTriangle size={14} className="text-dangerColor flex-shrink-0 mt-0.5" />
            <p className="text-dangerColor text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          id="analyze-submit-btn"
          onClick={handleAnalyze}
          disabled={loading || idea.trim().length < 10}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-indigo-violet text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primaryAccent/25"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Initializing AI Consultant Pipeline...
            </>
          ) : (
            <>
              <Zap size={16} />
              Start AI Analysis
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Info strip */}
        <div className="flex items-center justify-center gap-6 text-[10px] text-textSecondary border-t border-borderColor pt-4">
          {['Market Research', 'Competitor Intel', 'Financial Model', 'Pitch Deck'].map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primaryAccent/60 inline-block" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Phase 2: Progress tracker (after job submitted) ─────────────────────────
function AnalysisProgress({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { status, currentAgent, progressPercent, isLoading, error } = useJobStatus(jobId);

  // Auto-redirect to report when complete
  useEffect(() => {
    if (status === 'completed' && jobId) {
      // Small delay so user sees the 100% state
      const t = setTimeout(() => router.push(`/report/${jobId}`), 1500);
      return () => clearTimeout(t);
    }
  }, [status, jobId, router]);

  return (
    <div className="flex-grow flex flex-col items-center justify-start px-4 md:px-6 py-12 gap-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          AI Consultant <span className="gradient-text">Pipeline Running</span>
        </h1>
        <p className="text-sm text-textSecondary leading-relaxed">
          Your startup concept is being analyzed by 7 specialized AI agents.
          This typically takes 90–120 seconds. You'll be redirected automatically when complete.
        </p>
      </div>

      {/* Agent Progress Tracker */}
      <AgentProgressTracker
        status={status}
        currentAgent={currentAgent}
        progressPercent={progressPercent}
        error={error}
      />

      {/* Job ID display */}
      <div className="text-center">
        <span className="text-xs text-textSecondary font-mono">
          Job ID: <span className="text-primaryAccent">{jobId}</span>
        </span>
      </div>

      {/* View Report button shown when complete */}
      {status === 'completed' && (
        <div className="animate-slide-up">
          <button
            onClick={() => router.push(`/report/${jobId}`)}
            className="flex items-center gap-2 py-3.5 px-8 rounded-xl bg-indigo-violet text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primaryAccent/25"
          >
            <FileText size={16} />
            View Full Report
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Error state */}
      {status === 'failed' && (
        <button
          onClick={() => router.push('/analyze')}
          className="py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// ─── Main Analyze Page ────────────────────────────────────────────────────────
function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobId, setJobId] = useState<string | null>(searchParams.get('job_id'));

  // If URL already has job_id (e.g. user refreshed), go straight to tracker
  // If user starts fresh, show the submission form
  const handleJobStarted = (id: string) => {
    setJobId(id);
    // Update URL without navigation so the job_id is bookmarkable
    router.replace(`/analyze?job_id=${id}`);
  };

  if (jobId) {
    return <AnalysisProgress jobId={jobId} />;
  }

  return <IdeaSubmissionForm onJobStarted={handleJobStarted} />;
}

export default function AnalyzePage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primaryAccent" />
              <p className="text-textSecondary text-sm">Loading analysis pipeline...</p>
            </div>
          </div>
        }
      >
        <AnalyzeContent />
      </Suspense>
    </AuthGuard>
  );
}
