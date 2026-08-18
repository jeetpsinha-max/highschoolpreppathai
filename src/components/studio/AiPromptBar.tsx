import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { processAiPrompt } from '../utils/promptEngine';
import type { VideoState } from '../types';

interface Props {
  onGenerate: (stateUpdate: Partial<VideoState>) => void;
}

const PRESET_PROMPTS = [
  '🎓 Accepted to Peddie School with 2300 SSAT Score',
  '🧠 How to score 99th percentile on SSAT Verbal',
  '✍️ How I boosted my admissions essay odds by 24%',
  '🎙️ Top 3 questions Peddie & Andover interviewers ask',
];

export default function AiPromptBar({ onGenerate }: Props) {
  const [prompt, setPrompt] = useState('Create a 15-second viral reel about getting accepted into Peddie School with a 2300 SSAT score');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (textToUse?: string) => {
    const targetText = textToUse || prompt;
    if (!targetText.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const generated = processAiPrompt(targetText);
      onGenerate({ ...generated, userPrompt: targetText });
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="studio-card p-5 space-y-4 border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-purple-950/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            AI 15-Second Reel Prompt Generator ("Create Video to Perfection")
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          PROMPT ENGINE ACTIVE
        </span>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Create a 15-second viral video about getting accepted into Peddie with a 2300 SSAT score..."
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-32 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans resize-none"
        />

        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="absolute right-2 top-2.5 studio-btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg"
        >
          {isGenerating ? (
            <Sparkles className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              Generate Reel <ArrowRight className="w-3.5 h-3.5 text-white" />
            </>
          )}
        </button>
      </div>

      {/* Preset Prompts */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] text-slate-400 font-mono">Quick Prompts:</span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(p);
              handleGenerate(p);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-indigo-500/50 transition font-medium"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
