'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Brain, BarChart3, FileText, Shield, Rocket, ArrowRight, LogIn } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: '7 AI Agents',
    description: 'Specialized consultants run market research, competitor analysis, strategy, finance, SWOT, pitch deck, and report compilation.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Insights',
    description: 'Real-time web search via Tavily API delivers verified market data, competitor intelligence, and demand signals.',
  },
  {
    icon: FileText,
    title: 'PDF Report Export',
    description: 'Auto-generated, professional multi-section PDF report ready for investor meetings and board reviews.',
  },
  {
    icon: Shield,
    title: 'SWOT Matrix',
    description: 'Context-aware strategic assessment identifying strengths, weaknesses, opportunities, and threats specific to your idea.',
  },
  {
    icon: Rocket,
    title: 'Pitch Deck Builder',
    description: '10-slide investor pitch content with speaker notes, structured in the standard seed-stage fundraising format.',
  },
  {
    icon: Zap,
    title: 'Document Q&A',
    description: 'Upload business PDFs and chat with your documents using RAG-powered intelligent retrieval.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* ── Hero Section ── */}
      <section className="relative w-full flex flex-col items-center justify-center px-6 py-24 md:py-32 overflow-hidden">
        {/* Background Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primaryAccent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondaryAccent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl text-center">
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent text-xs font-semibold uppercase tracking-wider">
            <Zap size={14} />
            Multi-Agent AI Business Intelligence
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Turn Your Startup Idea Into a{' '}
            <span className="gradient-text">Full Business Plan</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-textSecondary leading-relaxed max-w-xl">
            Powered by 7 AI agents — research, strategy, finance, SWOT, pitch deck and more.
            Get a complete investor-ready report in under 2 minutes.
          </p>

          {/* CTA Buttons */}
          {/* BUG 1 FIX: "Login" → /login (already correct), "Get Started" → /analyze */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/analyze"
              id="home-get-started-btn"
              className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-indigo-violet text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primaryAccent/30 w-full sm:w-auto"
            >
              <Zap size={16} />
              Get Started
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              id="home-login-btn"
              className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 active:scale-[0.98] transition-all w-full sm:w-auto"
            >
              <LogIn size={16} />
              Login
            </Link>
          </div>

          {/* Quick-start hint */}
          <p className="text-xs text-textSecondary -mt-2">
            Free to use · No credit card required · Results in ~2 minutes
          </p>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Everything You Need to Validate &amp; Launch
          </h2>
          <p className="text-sm text-textSecondary max-w-lg mx-auto">
            Each AI agent specializes in a distinct layer of business analysis, orchestrated into one seamless pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 flex flex-col gap-4 animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="p-3 rounded-xl bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent w-fit">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-white">{feature.title}</h3>
                <p className="text-xs text-textSecondary leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="w-full max-w-4xl mx-auto px-6 py-20 border-t border-borderColor">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-sm text-textSecondary">Three steps from concept to investor-ready documentation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Describe Your Idea', desc: 'Enter a brief description of your startup concept on the Analyze page. The more specific, the better.' },
            { step: '02', title: 'AI Agents Analyze', desc: '7 specialized agents conduct deep research, modeling, and strategic planning in real-time.' },
            { step: '03', title: 'Download Report', desc: 'Get a comprehensive PDF report with market research, financials, SWOT, and pitch deck content.' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-violet flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primaryAccent/20">
                {item.step}
              </div>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-textSecondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16">
          <Link
            href="/analyze"
            id="home-cta-analyze-btn"
            className="flex items-center gap-2 py-4 px-10 rounded-xl bg-indigo-violet text-white font-semibold text-sm hover:opacity-90 transition-all shadow-xl shadow-primaryAccent/25"
          >
            <Rocket size={16} />
            Start Your First Analysis — It&apos;s Free
          </Link>
          <Link
            href="/login"
            id="home-cta-login-btn"
            className="flex items-center gap-2 py-4 px-8 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all"
          >
            <LogIn size={16} />
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
