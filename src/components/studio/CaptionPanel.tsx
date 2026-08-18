import { useState } from 'react';
import { Copy, Check, Sparkles, Clock, TrendingUp } from 'lucide-react';
import type { TemplateId } from '../types';
import { generateSmartCaption } from '../utils/captionGenerator';

interface Props {
  templateId: TemplateId;
  schoolName: string;
}

export default function CaptionPanel({ templateId, schoolName }: Props) {
  const [audience, setAudience] = useState<'students' | 'parents'>('students');
  const [copied, setCopied] = useState(false);

  const caption = generateSmartCaption(templateId, schoolName, audience);

  const fullText = `${caption.hook}\n\n${caption.body}\n\n${caption.callToAction}\n\n${caption.hashtags.join(' ')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="studio-card p-6 space-y-5 border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Smart AI Instagram Caption & Hashtag Engine
          </h2>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-1.5 rounded-lg studio-btn-primary text-xs font-semibold flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
          {copied ? 'Copied to Clipboard!' : 'Copy Caption & Hashtags'}
        </button>
      </div>

      {/* Target Audience Switcher */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-slate-400 font-medium">Target Persona:</span>
        <div className="grid grid-cols-2 gap-2 w-64">
          <button
            onClick={() => setAudience('students')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              audience === 'students'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            🎓 Students & Applicants
          </button>
          <button
            onClick={() => setAudience('parents')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              audience === 'parents'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            👨‍👩‍👧 Parents & Families
          </button>
        </div>
      </div>

      {/* Estimated Reach & Best Time Banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Optimal Posting Window</span>
            <span className="text-xs font-mono font-bold text-cyan-300">{caption.bestPostingTime}</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Predicted Organic Plays</span>
            <span className="text-xs font-mono font-bold text-emerald-300">{caption.estimatedReach}</span>
          </div>
        </div>
      </div>

      {/* Generated Content Box */}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 font-sans text-xs">
        <div>
          <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block mb-1">VIRAL HOOK</span>
          <p className="font-bold text-white text-sm">{caption.hook}</p>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block mb-1">CAPTION BODY</span>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">{caption.body}</p>
        </div>

        <div>
          <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase block mb-1">CALL TO ACTION (CTA)</span>
          <p className="text-indigo-200 font-semibold">{caption.callToAction}</p>
        </div>

        <div>
          <span className="text-[10px] text-purple-400 font-mono font-bold uppercase block mb-1">HASHTAG STACK</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {caption.hashtags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
