import type { AspectRatio, TemplateId, VideoState } from '../types';

interface Props {
  videoState: VideoState;
  onChange: (newState: Partial<VideoState>) => void;
}

const TEMPLATES: { id: TemplateId; name: string; icon: string; desc: string }[] = [
  { id: 'accepted_story', name: 'Accepted Story', icon: '🎓', desc: 'Animated acceptance reveal + confetti' },
  { id: 'ssat_protip', name: 'SSAT Pro-Tip', icon: '🧠', desc: 'Question walkthrough & score hack' },
  { id: 'school_comparison', name: 'School Matrix', icon: '⚔️', desc: 'Side-by-side Peddie vs Andover' },
  { id: 'essay_before_after', name: 'Essay Coach', icon: '✍️', desc: '+24% acceptance odds boost' },
  { id: 'interview_simulator', name: 'Interview Sim', icon: '🎙️', desc: 'Mock interviewer reel' },
];

export default function TemplateSelector({ videoState, onChange }: Props) {
  return (
    <div className="studio-card p-6 space-y-5 border-slate-800">
      {/* Aspect Ratio Switcher */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Canvas Format & Aspect Ratio
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['9:16', '1:1', '4:5'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => onChange({ aspectRatio: ratio })}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                videoState.aspectRatio === ratio
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ratio === '9:16' ? '📱 9:16 Reel' : ratio === '1:1' ? '🔳 1:1 Post' : '🖼️ 4:5 Portrait'}
            </button>
          ))}
        </div>
      </div>

      {/* Template Selectors */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Reel & Story Template Preset
        </label>
        <div className="space-y-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ templateId: t.id })}
              className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                videoState.templateId === t.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{t.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{t.name}</div>
                  <div className="text-[10px] text-slate-400">{t.desc}</div>
                </div>
              </div>
              {videoState.templateId === t.id && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Customizable Text Inputs */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Target School Name</label>
          <input
            type="text"
            value={videoState.schoolName}
            onChange={(e) => onChange({ schoolName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            placeholder="e.g. The Peddie School"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Student / Applicant Name</label>
          <input
            type="text"
            value={videoState.studentName}
            onChange={(e) => onChange({ studentName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            placeholder="e.g. Alex"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">SSAT Score</label>
            <input
              type="text"
              value={videoState.score}
              onChange={(e) => onChange({ score: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              placeholder="e.g. 2280"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Watermark</label>
            <button
              onClick={() => onChange({ showWatermark: !videoState.showWatermark })}
              className={`w-full py-2.5 rounded-lg border text-xs font-semibold transition ${
                videoState.showWatermark
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              {videoState.showWatermark ? '🎓 Watermark ON' : 'Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
