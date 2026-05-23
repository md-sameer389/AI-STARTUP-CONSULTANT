'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface Slide {
  slide_number: number;
  title: string;
  headline: string;
  bullet_points: string[];
  speaker_notes: string;
}

interface PitchDeckProps {
  pitchDeck: {
    slides: Slide[];
  } | null;
}

export default function PitchDeckPreview({ pitchDeck }: PitchDeckProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showNotes, setShowNotes] = useState(true);

  const slides = pitchDeck?.slides || [];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slides.length === 0) return;
      if (e.key === 'ArrowRight' && currentIdx < slides.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
        setCurrentIdx(prev => prev - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, slides]);

  if (slides.length === 0) {
    return (
      <div className="text-center text-textSecondary py-10">
        Pitch Deck content is unavailable.
      </div>
    );
  }

  const slide = slides[currentIdx];

  const handleNext = () => {
    if (currentIdx < slides.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-borderColor pb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">10-Slide Pitch Deck Builder</h3>
          <p className="text-xs text-textSecondary">Content outline designed for pre-seed / seed fundraising.</p>
        </div>

        {/* Slide Counter Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          
          <span className="text-sm font-semibold text-white tracking-wide min-w-[60px] text-center">
            {currentIdx + 1} / {slides.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIdx === slides.length - 1}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Slide Canvas Card */}
      <div className="w-full bg-[#12121e] border border-borderColor rounded-2xl p-6 md:p-10 shadow-2xl relative min-h-[320px] flex flex-col justify-between overflow-hidden">
        {/* Decorative Grid Corner */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-primaryAccent/5 rounded-bl-full pointer-events-none blur-xl" />

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primaryAccent">
              Slide {slide.slide_number} — {slide.title}
            </span>
            <span className="text-[10px] text-textSecondary bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Pitch Frame
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-lg md:text-xl font-bold text-white leading-snug tracking-tight">
            "{slide.headline}"
          </h2>

          {/* Bullets */}
          <ul className="flex flex-col gap-3">
            {slide.bullet_points.map((bullet, idx) => (
              <li 
                key={idx} 
                className="text-sm text-textPrimary leading-relaxed pl-5 relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primaryAccent"
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Slide Progress Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIdx ? 'w-6 bg-primaryAccent' : 'w-1.5 bg-white/10 hover:bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Speaker Notes Drawer */}
      {slide.speaker_notes && (
        <div className="w-full rounded-2xl border border-borderColor bg-[#12121a] overflow-hidden">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white/5 border-b border-borderColor text-left hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-textSecondary uppercase tracking-wider">
              <BookOpen size={16} className="text-primaryAccent" />
              Presenter Speaker Notes
            </div>
            {showNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showNotes && (
            <div className="p-6 text-sm text-textSecondary leading-relaxed bg-[#0a0a0f]/40 font-mono">
              {slide.speaker_notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
