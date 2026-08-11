import React from 'react';
import { PAST_REELS_LIBRARY, PastReelReference, BrainDecision } from '../utils/brainEngine';
import { Film, Sparkles, TrendingUp, Cpu, Copy, Flame } from 'lucide-react';

interface Props {
  activeReferenceId?: string;
  onSelectReference: (reel: PastReelReference) => void;
  brainMeta?: BrainDecision;
}

export default function BrandMemory({ activeReferenceId, onSelectReference, brainMeta }: Props) {
  return (
    <div className="studio-card p-5 space-y-4 border-slate-800 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Past Reels & Brand Memory Library
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          VIRAL PATTERNS ACTIVE
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Select a high-performing past video as a style reference. The AI Brain will clone its viral structure, timing, and color palette for your new reel.
      </p>

      {/* Past Reels List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PAST_REELS_LIBRARY.map((reel) => {
          const isSelected = activeReferenceId === reel.id;
          return (
            <button
              key={reel.id}
              onClick={() => onSelectReference(reel)}
              className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {reel.hookStyle}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {reel.avgViews}
                </span>
              </div>

              <div className="text-xs font-bold text-white leading-tight">{reel.title}</div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-amber-400 font-mono font-semibold">
                  Viral Score: {reel.viralScore}/100
                </span>
                {isSelected ? (
                  <span className="text-[10px] font-bold text-indigo-400">● Active Ref</span>
                ) : (
                  <span className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Remix Style
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Brain Live Decision Badge */}
      {brainMeta && (
        <div className="bg-slate-950 border border-indigo-500/30 p-3.5 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-indigo-400 font-bold">
            <span className="flex items-center gap-1.5 uppercase text-[11px]">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Brain Storyboard Strategy
            </span>
            <span className="text-[10px] font-mono text-slate-400">{brainMeta.bgTrack.toUpperCase()} AUDIO</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">Emotional Angle</span>
              <span className="text-white font-semibold">{brainMeta.emotionalAngle}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">Camera Motion & Pacing</span>
              <span className="text-white font-semibold">{brainMeta.pacingStyle}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
