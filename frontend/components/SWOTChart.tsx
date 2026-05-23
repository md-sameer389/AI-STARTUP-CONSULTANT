'use client';

import React from 'react';
import { Shield, AlertOctagon, Sparkles, AlertTriangle } from 'lucide-react';

interface SWOTProps {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  } | null;
}

export default function SWOTChart({ swot }: SWOTProps) {
  if (!swot) {
    return (
      <div className="text-center text-textSecondary py-10">
        SWOT Analysis data is unavailable.
      </div>
    );
  }

  const quadrants = [
    {
      title: 'Strengths',
      subtitle: 'Internal Advantages',
      data: swot.strengths || [],
      bgColor: 'bg-successColor/5 hover:bg-successColor/10',
      borderColor: 'border-successColor/20 hover:border-successColor/40',
      titleColor: 'text-successColor',
      icon: Shield,
      iconColor: 'bg-successColor/10 text-successColor',
      delay: 'delay-0'
    },
    {
      title: 'Weaknesses',
      subtitle: 'Internal Limitations',
      data: swot.weaknesses || [],
      bgColor: 'bg-dangerColor/5 hover:bg-dangerColor/10',
      borderColor: 'border-dangerColor/20 hover:border-dangerColor/40',
      titleColor: 'text-dangerColor',
      icon: AlertOctagon,
      iconColor: 'bg-dangerColor/10 text-dangerColor',
      delay: 'delay-100'
    },
    {
      title: 'Opportunities',
      subtitle: 'External Prospects',
      data: swot.opportunities || [],
      bgColor: 'bg-primaryAccent/5 hover:bg-primaryAccent/10',
      borderColor: 'border-primaryAccent/20 hover:border-primaryAccent/40',
      titleColor: 'text-primaryAccent',
      icon: Sparkles,
      iconColor: 'bg-primaryAccent/10 text-primaryAccent',
      delay: 'delay-200'
    },
    {
      title: 'Threats',
      subtitle: 'External Risks',
      data: swot.threats || [],
      bgColor: 'bg-warningColor/5 hover:bg-warningColor/10',
      borderColor: 'border-warningColor/20 hover:border-warningColor/40',
      titleColor: 'text-warningColor',
      icon: AlertTriangle,
      iconColor: 'bg-warningColor/10 text-warningColor',
      delay: 'delay-300'
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <div className="text-center md:text-left mb-2">
        <h3 className="text-lg font-bold text-white">SWOT Analysis Matrix</h3>
        <p className="text-xs text-textSecondary">Strategic overview of internal and external operational vectors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quadrants.map((quad, idx) => {
          const IconComponent = quad.icon;

          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.01] flex flex-col gap-4 shadow-lg ${quad.bgColor} ${quad.borderColor} ${quad.delay}`}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${quad.iconColor}`}>
                  <IconComponent size={20} />
                </div>
                <div>
                  <h4 className={`text-base font-bold uppercase tracking-wider ${quad.titleColor}`}>
                    {quad.title}
                  </h4>
                  <span className="text-[10px] text-textSecondary font-medium uppercase tracking-widest block">
                    {quad.subtitle}
                  </span>
                </div>
              </div>

              {/* Bullet Points */}
              <ul className="flex flex-col gap-2.5 flex-grow">
                {quad.data.map((point, pIdx) => (
                  <li 
                    key={pIdx} 
                    className="text-xs text-textPrimary leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-white/20"
                  >
                    {point}
                  </li>
                ))}
                {quad.data.length === 0 && (
                  <span className="text-xs text-textSecondary italic">No specific points generated.</span>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
