'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ReportResponse } from '../../../lib/api';
import SWOTChart from '../../../components/SWOTChart';
import FinancialCharts from '../../../components/FinancialCharts';
import PitchDeckPreview from '../../../components/PitchDeckPreview';
import DownloadCenter from '../../../components/DownloadCenter';
import {
  Search, Users, Compass, TrendingUp, AlertTriangle,
  Layout, FileText, Loader2, Globe, Target, Lightbulb,
  DollarSign, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

type TabId = 'market' | 'competitors' | 'strategy' | 'financials' | 'swot' | 'pitch';

const TABS: { id: TabId; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'market', label: 'Market Research', icon: Search },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'strategy', label: 'Strategy', icon: Compass },
  { id: 'financials', label: 'Financials', icon: TrendingUp },
  { id: 'swot', label: 'SWOT', icon: AlertTriangle },
  { id: 'pitch', label: 'Pitch Deck', icon: Layout },
];

// Helper to show a list of strings as bullet points
function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <span className="text-xs text-textSecondary italic">No data available.</span>;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <li key={idx} className="text-sm text-textPrimary leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primaryAccent/60">
          {item}
        </li>
      ))}
    </ul>
  );
}

// Info card sub-component
function InfoCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-borderColor pb-3">
        <Icon size={16} className="text-primaryAccent" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.job_id as string;
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('market');

  useEffect(() => {
    if (!jobId) return;
    const fetchReport = async () => {
      try {
        const data = await api.getReport(jobId);
        setReport(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load report. The analysis may not be complete yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin text-primaryAccent" size={40} />
          <p className="text-textSecondary text-sm">Loading your strategic business report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="glass-card p-8 flex flex-col items-center gap-4 text-center max-w-md">
          <AlertTriangle size={40} className="text-dangerColor" />
          <h2 className="text-xl font-bold text-white">Report Unavailable</h2>
          <p className="text-sm text-textSecondary">{error}</p>
          <button onClick={() => router.push('/')} className="mt-2 py-3 px-6 rounded-xl bg-indigo-violet text-white font-semibold text-sm hover:opacity-90 transition-all">
            Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col gap-8 max-w-6xl mx-auto w-full px-4 md:px-6 py-10 animate-fade-in">

      {/* Report Header */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-successColor/10 border border-successColor/20 text-successColor text-[10px] font-bold uppercase tracking-wider">
              Analysis Complete
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">
            {report.startup_idea}
          </h1>
          <p className="text-xs text-textSecondary mt-1">
            Generated on {new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp; Job ID: <span className="font-mono text-primaryAccent">{jobId}</span>
          </p>
        </div>
      </div>

      {/* Download Center */}
      <DownloadCenter jobId={jobId} reportData={report} />

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-cardBg border border-borderColor rounded-2xl no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-primaryAccent text-white shadow-lg shadow-primaryAccent/25'
                  : 'text-textSecondary hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">

        {/* Market Research */}
        {activeTab === 'market' && report.market_research && (
          <div className="flex flex-col gap-6">
            <InfoCard title="Market Size" icon={Globe}>
              <p className="text-sm text-textPrimary leading-relaxed">{report.market_research.market_size}</p>
            </InfoCard>
            <InfoCard title="Executive Summary" icon={Lightbulb}>
              <p className="text-sm text-textPrimary leading-relaxed">{report.market_research.summary}</p>
            </InfoCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard title="Target Demographics" icon={Target}>
                <BulletList items={report.market_research.target_demographics} />
              </InfoCard>
              <InfoCard title="Industry Trends" icon={TrendingUp}>
                <BulletList items={report.market_research.industry_trends} />
              </InfoCard>
              <InfoCard title="Demand Signals" icon={Search}>
                <BulletList items={report.market_research.demand_signals} />
              </InfoCard>
            </div>
          </div>
        )}

        {/* Competitor Analysis */}
        {activeTab === 'competitors' && report.competitor_analysis && (
          <div className="flex flex-col gap-6">
            <InfoCard title="Market Gap Identified" icon={Lightbulb}>
              <p className="text-sm text-textPrimary leading-relaxed">{report.competitor_analysis.market_gap}</p>
            </InfoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.competitor_analysis.competitors?.map((comp, idx) => (
                <div key={idx} className="glass-card p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{comp.name}</h4>
                      <a href={`https://${comp.website}`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-primaryAccent hover:underline flex items-center gap-1">
                        {comp.website} <ExternalLink size={10} />
                      </a>
                    </div>
                    <span className="text-[10px] text-textSecondary bg-white/5 border border-borderColor px-2 py-0.5 rounded-full whitespace-nowrap">
                      {comp.pricing}
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary italic">{comp.differentiator}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-successColor uppercase tracking-wider font-semibold block mb-1">Strengths</span>
                      <BulletList items={comp.strengths} />
                    </div>
                    <div>
                      <span className="text-[10px] text-dangerColor uppercase tracking-wider font-semibold block mb-1">Weaknesses</span>
                      <BulletList items={comp.weaknesses} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Strategy */}
        {activeTab === 'strategy' && report.business_strategy && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="Business Model" icon={Compass}>
                <p className="text-sm text-textPrimary leading-relaxed">{report.business_strategy.business_model}</p>
              </InfoCard>
              <InfoCard title="Target Audience" icon={Users}>
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-[10px] text-primaryAccent uppercase tracking-wider font-bold">Primary</span>
                    <p className="text-sm text-textPrimary mt-1">{report.business_strategy.target_audience?.primary}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondaryAccent uppercase tracking-wider font-bold">Secondary</span>
                    <p className="text-sm text-textPrimary mt-1">{report.business_strategy.target_audience?.secondary}</p>
                  </div>
                </div>
              </InfoCard>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard title="Revenue Streams" icon={DollarSign}>
                <BulletList items={report.business_strategy.revenue_streams} />
              </InfoCard>
              <InfoCard title="Go-to-Market Strategy" icon={Rocket}>
                <BulletList items={report.business_strategy.go_to_market_strategy} />
              </InfoCard>
              <InfoCard title="Marketing Channels" icon={Target}>
                <BulletList items={report.business_strategy.marketing_channels} />
              </InfoCard>
            </div>
            {/* Pricing Tiers */}
            {report.business_strategy.pricing_tiers?.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary flex items-center gap-2">
                  <DollarSign size={14} className="text-primaryAccent" /> Pricing Tiers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {report.business_strategy.pricing_tiers.map((tier, idx) => (
                    <div key={idx} className={`glass-card p-5 flex flex-col gap-3 ${idx === 1 ? 'border-primaryAccent/30 bg-primaryAccent/5' : ''}`}>
                      {idx === 1 && (
                        <span className="text-[10px] font-bold text-primaryAccent uppercase tracking-wider">Most Popular</span>
                      )}
                      <div>
                        <h4 className="text-base font-bold text-white">{tier.tier}</h4>
                        <span className="text-primaryAccent font-bold text-sm">{tier.price}</span>
                      </div>
                      <BulletList items={tier.features} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Financials */}
        {activeTab === 'financials' && (
          <div className="flex flex-col gap-6">
            <FinancialCharts financials={report.financials} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="Break-Even Estimate" icon={TrendingUp}>
                <p className="text-sm text-textPrimary">{report.financials?.break_even_estimate}</p>
              </InfoCard>
              <InfoCard title="Funding Recommendation" icon={Lightbulb}>
                <p className="text-sm text-textPrimary leading-relaxed">{report.financials?.funding_recommendation}</p>
              </InfoCard>
            </div>
          </div>
        )}

        {/* SWOT */}
        {activeTab === 'swot' && <SWOTChart swot={report.swot} />}

        {/* Pitch Deck */}
        {activeTab === 'pitch' && <PitchDeckPreview pitchDeck={report.pitch_deck} />}
      </div>
    </div>
  );
}

// Needed for Lucide icon in strategy tab
function Rocket({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}
