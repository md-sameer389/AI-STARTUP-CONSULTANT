'use client';

import React from 'react';
import { 
  Search, 
  Users, 
  Compass, 
  TrendingUp, 
  AlertTriangle, 
  Layout, 
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface ProgressTrackerProps {
  status: 'queued' | 'running' | 'completed' | 'failed' | null;
  currentAgent: string | null;
  progressPercent: number;
  error?: string | null;
}

interface Step {
  name: string;
  agentName: string;
  description: string;
  icon: React.ComponentType<any>;
}

const STEPS: Step[] = [
  {
    name: 'Market Research',
    agentName: 'Market Research Agent',
    description: 'Scanning web directories for industry trends, sizes and demand.',
    icon: Search
  },
  {
    name: 'Competitor Intelligence',
    agentName: 'Competitor Analysis Agent',
    description: 'Identifying verifiable competitors and mapping market openings.',
    icon: Users
  },
  {
    name: 'Strategic Architecture',
    agentName: 'Business Strategy Agent',
    description: 'Drafting business plans, pricing structures and launch GTM paths.',
    icon: Compass
  },
  {
    name: 'Financial Modeling',
    agentName: 'Financial Estimation Agent',
    description: 'Projecting operational run-rates and capital costs.',
    icon: TrendingUp
  },
  {
    name: 'SWOT Analysis',
    agentName: 'SWOT Analysis Agent',
    description: 'Evaluating internal capabilities against external market risks.',
    icon: AlertTriangle
  },
  {
    name: 'Pitch Deck Creation',
    agentName: 'Pitch Deck Agent',
    description: 'Structuring investor slides and presentation guidelines.',
    icon: Layout
  },
  {
    name: 'Report Synthesis',
    agentName: 'Report Generation Agent',
    description: 'Compiling structured findings into a downloadable PDF report.',
    icon: FileText
  }
];

export default function AgentProgressTracker({ 
  status, 
  currentAgent, 
  progressPercent, 
  error 
}: ProgressTrackerProps) {
  
  // Calculate index of currently running step
  const activeIndex = STEPS.findIndex(step => step.agentName === currentAgent);

  const getStepStatus = (index: number) => {
    if (status === 'completed') return 'done';
    if (status === 'failed') {
      if (index === activeIndex) return 'failed';
      if (index > activeIndex) return 'pending';
      return 'done'; // Steps before the crash succeeded
    }
    
    if (status === 'queued') return 'pending';
    
    // Running flow
    if (index < activeIndex) return 'done';
    if (index === activeIndex) return 'running';
    return 'pending';
  };

  // Rough estimation of time remaining (avg 18s per agent)
  const remainingSteps = STEPS.length - Math.max(0, activeIndex);
  const estSecondsRemaining = status === 'queued' ? 120 : remainingSteps * 18;
  const minutes = Math.floor(estSecondsRemaining / 60);
  const seconds = estSecondsRemaining % 60;

  return (
    <div className="w-full max-w-3xl glass-card p-6 md:p-8 flex flex-col gap-8 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderColor pb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            Analyzing Idea Feasibility
          </h2>
          <p className="text-sm text-textSecondary">
            {status === 'completed' && 'Analysis completed! Loading report...'}
            {status === 'failed' && 'Analysis pipeline failed.'}
            {status === 'queued' && 'Waiting in queue for processing...'}
            {status === 'running' && `Currently consulting: ${currentAgent || 'Starting up...'}`}
          </p>
        </div>
        
        {status !== 'completed' && status !== 'failed' && (
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-right">
            <span className="text-xs text-textSecondary block uppercase tracking-wider">Est. Time Remaining</span>
            <span className="text-sm font-semibold text-primaryAccent">
              {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-textSecondary">Total Progression</span>
          <span className="font-bold text-white">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-borderColor">
          <div 
            className="h-full bg-indigo-violet transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-6">
        {STEPS.map((step, idx) => {
          const stepStatus = getStepStatus(idx);
          const Icon = step.icon;

          return (
            <div 
              key={idx} 
              className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                stepStatus === 'running' 
                  ? 'bg-primaryAccent/5 border border-primaryAccent/20' 
                  : 'bg-transparent border border-transparent'
              }`}
            >
              {/* Step Status Indicator */}
              <div className="relative mt-1">
                {stepStatus === 'done' && (
                  <div className="h-6 w-6 rounded-full bg-successColor/10 border border-successColor/30 flex items-center justify-center text-successColor">
                    <CheckCircle2 size={16} />
                  </div>
                )}
                {stepStatus === 'failed' && (
                  <div className="h-6 w-6 rounded-full bg-dangerColor/10 border border-dangerColor/30 flex items-center justify-center text-dangerColor">
                    <XCircle size={16} />
                  </div>
                )}
                {stepStatus === 'running' && (
                  <div className="h-6 w-6 rounded-full bg-primaryAccent/20 border border-primaryAccent flex items-center justify-center text-primaryAccent pulse-glow-indicator">
                    <span className="h-2 w-2 rounded-full bg-primaryAccent" />
                  </div>
                )}
                {stepStatus === 'pending' && (
                  <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-textSecondary">
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  </div>
                )}
              </div>

              {/* Step Context */}
              <div className="flex-grow flex gap-3">
                <div className={`p-2.5 rounded-lg border ${
                  stepStatus === 'running'
                    ? 'bg-primaryAccent/10 border-primaryAccent/30 text-primaryAccent'
                    : 'bg-white/5 border-borderColor text-textSecondary'
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold transition-colors ${
                    stepStatus === 'running' ? 'text-white' : 
                    stepStatus === 'done' ? 'text-textPrimary' : 'text-textSecondary'
                  }`}>
                    {step.name}
                  </h4>
                  <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {error && (
        <div className="p-4 rounded-xl bg-dangerColor/10 border border-dangerColor/20 text-dangerColor text-sm text-center">
          <h4 className="font-semibold mb-1">Workflow Pipeline Crashed</h4>
          <p className="opacity-90">{error}</p>
        </div>
      )}
    </div>
  );
}
