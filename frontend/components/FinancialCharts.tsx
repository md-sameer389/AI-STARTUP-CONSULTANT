'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface FinancialsProps {
  financials: {
    startup_costs: {
      development: string;
      infrastructure: string;
      marketing: string;
      legal: string;
      total_estimated: string;
    };
    monthly_operational_costs: string;
    revenue_projection: {
      month_6: string;
      month_12: string;
      month_24: string;
    };
    break_even_estimate: string;
    funding_recommendation: string;
  } | null;
}

// Robust helper to parse number ranges from LLM strings
// Example: "$10,000–$25,000 bootstrapped / $80,000–$150,000 VC"
function parseValues(valStr: string): { bootstrapped: number; vc: number } {
  const defaultVal = { bootstrapped: 0, vc: 0 };
  if (!valStr) return defaultVal;

  try {
    const parts = valStr.split('/');
    const parsePart = (text: string): number => {
      // Find all numbers, including commas
      const matches = text.replace(/,/g, '').match(/\d+/g);
      if (!matches) return 0;
      
      const numbers = matches.map(Number);
      if (numbers.length === 1) return numbers[0];
      if (numbers.length >= 2) {
        // Return average of first two numbers (min & max)
        return (numbers[0] + numbers[1]) / 2;
      }
      return 0;
    };

    const bootstrapped = parsePart(parts[0]);
    const vc = parts.length > 1 ? parsePart(parts[1]) : bootstrapped * 5; // fallback scaling

    return { bootstrapped, vc };
  } catch (e) {
    console.error("Error parsing financial string:", valStr, e);
    return defaultVal;
  }
}

export default function FinancialCharts({ financials }: FinancialsProps) {
  const [scenario, setScenario] = useState<'bootstrapped' | 'vc'>('bootstrapped');

  if (!financials) {
    return (
      <div className="text-center text-textSecondary py-10">
        Financial projections are unavailable.
      </div>
    );
  }

  // 1. Parse Revenue projections
  const r6 = parseValues(financials.revenue_projection?.month_6 || '');
  const r12 = parseValues(financials.revenue_projection?.month_12 || '');
  const r24 = parseValues(financials.revenue_projection?.month_24 || '');

  const lineData = [
    { name: 'Month 0', Bootstrapped: 0, 'VC-Funded': 0 },
    { name: 'Month 6', Bootstrapped: r6.bootstrapped, 'VC-Funded': r6.vc },
    { name: 'Month 12', Bootstrapped: r12.bootstrapped, 'VC-Funded': r12.vc },
    { name: 'Month 24', Bootstrapped: r24.bootstrapped, 'VC-Funded': r24.vc }
  ];

  // 2. Parse Startup costs
  const cDev = parseValues(financials.startup_costs?.development || '');
  const cInfra = parseValues(financials.startup_costs?.infrastructure || '');
  const cMkt = parseValues(financials.startup_costs?.marketing || '');
  const cLegal = parseValues(financials.startup_costs?.legal || '');

  const costData = [
    { name: 'Development', value: scenario === 'bootstrapped' ? cDev.bootstrapped : cDev.vc },
    { name: 'Infrastructure', value: scenario === 'bootstrapped' ? cInfra.bootstrapped : cInfra.vc },
    { name: 'Marketing', value: scenario === 'bootstrapped' ? cMkt.bootstrapped : cMkt.vc },
    { name: 'Legal/Compliance', value: scenario === 'bootstrapped' ? cLegal.bootstrapped : cLegal.vc }
  ].filter(item => item.value > 0);

  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];

  const formatCurrency = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in">
      {/* Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-borderColor pb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Financial Feasibility Charts</h3>
          <p className="text-xs text-textSecondary">Scenario modeling comparing bootstrap vs. venture scale paths.</p>
        </div>

        <div className="flex bg-black/40 border border-borderColor rounded-xl p-1">
          <button
            onClick={() => setScenario('bootstrapped')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              scenario === 'bootstrapped'
                ? 'bg-primaryAccent text-white'
                : 'text-textSecondary hover:text-white'
            }`}
          >
            Bootstrapped
          </button>
          <button
            onClick={() => setScenario('vc')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              scenario === 'vc'
                ? 'bg-primaryAccent text-white'
                : 'text-textSecondary hover:text-white'
            }`}
          >
            VC-Funded
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Projection Area Chart */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">Revenue Growth Projection</h4>
            <span className="text-[10px] text-textSecondary uppercase tracking-wider">Estimated Run-Rate (USD)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBoot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={formatCurrency} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12121a', borderColor: '#1e1e2e', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={scenario === 'bootstrapped' ? 'Bootstrapped' : 'VC-Funded'} 
                  stroke={scenario === 'bootstrapped' ? '#10b981' : '#6366f1'} 
                  fillOpacity={1} 
                  fill={`url(${scenario === 'bootstrapped' ? '#colorBoot' : '#colorVC'})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">Startup Costs Allocation</h4>
            <span className="text-[10px] text-textSecondary uppercase tracking-wider">Midpoint allocation values</span>
          </div>

          <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            {costData.length > 0 ? (
              <>
                <div className="h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {costData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Allocated']}
                        contentStyle={{ backgroundColor: '#12121a', borderColor: '#1e1e2e', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2">
                  {costData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                      <span className="text-textSecondary">{item.name}:</span>
                      <span className="font-bold text-white">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-xs text-textSecondary italic">No cost allocation available for this path.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
