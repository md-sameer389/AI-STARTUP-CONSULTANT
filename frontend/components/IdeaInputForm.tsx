'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { Mic, ArrowRight, Loader2 } from 'lucide-react';

export default function IdeaInputForm() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 10) {
      setError('Startup idea must be at least 10 characters.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const storedUserId = localStorage.getItem('user_id') || 'demo-user';
      const res = await api.analyze(idea, storedUserId);
      router.push(`/analyze?job_id=${res.job_id}`);
    } catch (err: any) {
      console.error('Failed to submit idea:', err);
      setError(err.response?.data?.detail || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl glass-card p-6 md:p-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="startup-idea" className="text-sm font-semibold text-textSecondary uppercase tracking-wider">
          Describe Your Startup Concept
        </label>
        <div className="relative">
          <textarea
            id="startup-idea"
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value.slice(0, 500));
              if (error) setError(null);
            }}
            placeholder="e.g. AI fitness app for college students that recommends personalized workouts based on dorm gym equipment..."
            rows={4}
            className="w-full rounded-xl bg-black/40 border border-borderColor p-4 pr-12 text-white placeholder-textSecondary focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent resize-none transition-colors"
          />
          <button
            type="button"
            title="Voice input - coming soon"
            className="absolute bottom-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-textSecondary cursor-not-allowed group"
          >
            <Mic size={18} />
            <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 rounded bg-cardBg border border-borderColor text-xs text-textSecondary text-center shadow-lg">
              Voice input - coming soon
            </span>
          </button>
        </div>
        
        <div className="flex items-center justify-between text-xs text-textSecondary px-1">
          <span>Be descriptive for better research outcomes.</span>
          <span className={idea.length >= 500 ? 'text-dangerColor' : ''}>
            {idea.length} / 500
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-dangerColor/10 border border-dangerColor/20 text-dangerColor text-sm text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || idea.trim().length < 10}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-indigo-violet hover:opacity-90 font-semibold text-white tracking-wide shadow-lg shadow-primaryAccent/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Initializing AI Consultants...
          </>
        ) : (
          <>
            Analyze Startup Concept
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
