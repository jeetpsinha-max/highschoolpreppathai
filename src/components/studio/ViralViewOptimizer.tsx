import React, { useEffect, useState } from 'react';
import { Flame, Eye } from 'lucide-react';
import { analyzeReelForViralViews, INSTAGRAM_VIRAL_TRENDS } from '../utils/instagramScraperEngine';

interface Props {
  schoolName: string;
  templateId: string;
  userPrompt: string;
}

export default function ViralViewOptimizer({ schoolName, templateId, userPrompt }: Props) {
  const [trends, setTrends] = useState(INSTAGRAM_VIRAL_TRENDS);

  const report = analyzeReelForViralViews(schoolName, templateId, userPrompt);

  return (
    <div className="studio-card p-5 space-y-4 border-slate-800 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Instagram Viral View Maximizer & Gemini Omni Engine
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          VIRAL ALGORITHM OPTIMIZED
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Predicted Organic Views</span>
          <span className="text-lg font-mono font-bold text-emerald-400 block mt-0.5">{report.predictedViews}</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Viral Index Score</span>
          <span className="text-lg font-mono font-bold text-amber-400 block mt-0.5">{report.viralScore} / 100</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Hook Retention (3s)</span>
          <span className="text-lg font-mono font-bold text-cyan-400 block mt-0.5">{report.hookRetentionPct}%</span>
        </div>
      </div>

      {/* Scraped Instagram Trends Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-indigo-400" /> Live Scraped Instagram Trends
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">2026 ALGORITHM MATCH</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {trends.map((t, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-purple-400 font-bold block">{t.hashtag}</span>
              <span className="text-xs font-bold text-white block">{t.avgViews} Avg Plays</span>
              <span className="text-[9px] text-slate-400 block">{t.topHookFormat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Boost Recommendations */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl space-y-2">
        <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">
          ⚡ ACTIONABLE ALGORITHM BOOST ADVICE
        </span>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {report.optimizations.map((opt, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span>{opt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
