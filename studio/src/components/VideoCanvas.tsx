import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, Image, Video, RefreshCw, Clock, Layers } from 'lucide-react';
import type { VideoState } from '../types';

interface Props {
  videoState: VideoState;
}

export default function VideoCanvas({ videoState }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const durationSec = 15; // 15-second Instagram Reel
  const width = 1080;
  const height = videoState.aspectRatio === '9:16' ? 1920 : videoState.aspectRatio === '1:1' ? 1080 : 1350;

  useEffect(() => {
    if (videoState.templateId === 'accepted_story') {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
    }
  }, [videoState.templateId, videoState.userPrompt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsedTotal = (now - startTime) / 1000;
      const elapsed = elapsedTotal % durationSec; // Loops smoothly over 15 seconds
      setCurrentTimeSec(+elapsed.toFixed(1));

      ctx.clearRect(0, 0, width, height);

      // Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#060913');
      gradient.addColorStop(0.5, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Decorative Glow
      const pulse = Math.sin(elapsed * 2) * 40;
      const glowGrad = ctx.createRadialGradient(width / 2, height / 3, 10, width / 2, height / 3, 400 + pulse);
      glowGrad.addColorStop(0, (videoState.accentColor || '#3B82F6') + '55');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid Lines Effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // ── 15-SECOND MULTI-SCENE STORYBOARD LOGIC ──
      // Scene 1: 0s - 5s (Viral Hook)
      // Scene 2: 5s - 10s (Actionable Value / Proof)
      // Scene 3: 10s - 15s (Outcome & Call To Action)

      if (elapsed < 5) {
        renderScene1Hook(ctx, elapsed);
      } else if (elapsed < 10) {
        renderScene2Body(ctx, elapsed - 5);
      } else {
        renderScene3Cta(ctx, elapsed - 10);
      }

      // Render PrepPath Watermark
      if (videoState.showWatermark) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎓 PREPPATH.AI', width / 2, height - 80);
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoState, isPlaying, height, width]);

  // ── SCENE 1: HOOK (0s - 5s) ──
  const renderScene1Hook = (ctx: CanvasRenderingContext2D, t: number) => {
    const scale = Math.min(1, 0.8 + t * 0.1);
    const cardY = height / 3 + Math.sin(t * 2) * 8;

    ctx.save();
    ctx.translate(width / 2, cardY);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = videoState.accentColor || '#3B82F6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-420, -180, 840, 360, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.font = '800 36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SCENE 1: VIRAL HOOK', 0, -110);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 58px Outfit, sans-serif';
    ctx.fillText(videoState.sceneScript?.scene1Hook || `✨ I GOT INTO ${videoState.schoolName.toUpperCase()}! 🎓`, 0, 10);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 36px Inter, sans-serif';
    ctx.fillText(`Target School: ${videoState.schoolName}`, 0, 110);

    ctx.restore();
  };

  // ── SCENE 2: VALUE & PROOF (5s - 10s) ──
  const renderScene2Body = (ctx: CanvasRenderingContext2D, t: number) => {
    ctx.fillStyle = '#10B981';
    ctx.font = '900 52px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💡 SCENE 2: STRATEGY & VALUE', width / 2, height / 4);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(100, height / 3, width - 200, 480, 28);
    ctx.fill();
    ctx.stroke();

    const lines = (videoState.sceneScript?.scene2Body || '1. Master Verbal Analogies\n2. Skip Unsure Math Questions\n3. Practice 50+ Timed Passages').split('\n');
    lines.forEach((line, idx) => {
      ctx.fillStyle = idx === 0 ? '#F59E0B' : '#FFFFFF';
      ctx.font = '700 38px Inter, sans-serif';
      ctx.fillText(line, width / 2, height / 3 + 120 + idx * 75);
    });
  };

  // ── SCENE 3: OUTCOME & CTA (10s - 15s) ──
  const renderScene3Cta = (ctx: CanvasRenderingContext2D, t: number) => {
    const cardY = height / 2 - 200;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#EC4899';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(120, cardY, width - 240, 520, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 200, cardY - 35, 400, 70, 20);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 34px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 SCENE 3: FINAL CALL TO ACTION', width / 2, cardY + 12);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 56px Outfit, sans-serif';
    ctx.fillText(`SSAT SCORE: ${videoState.score}`, width / 2, cardY + 160);

    ctx.fillStyle = '#F472B6';
    ctx.font = '700 40px Inter, sans-serif';
    ctx.fillText(videoState.sceneScript?.scene3Cta || '📲 Tap link in bio to predict your score on PrepPath.ai!', width / 2, cardY + 300);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `preppath-story-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const start15SecRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preppath-15sec-reel-${Date.now()}.webm`;
      a.click();
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);

    // Auto-stop after 15 seconds
    setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, 15000);
  };

  const currentSceneName = currentTimeSec < 5 ? 'Scene 1: Viral Hook' : currentTimeSec < 10 ? 'Scene 2: Strategy Value' : 'Scene 3: Call To Action';

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* 15-Second Timeline Progress Bar */}
      <div className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-400">
          <Clock className="w-4 h-4 animate-spin" />
          <span>{currentTimeSec.toFixed(1)}s / 15.0s</span>
        </div>

        <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
          {currentSceneName}
        </span>
      </div>

      {/* Canvas Display */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 glow-blue"
        style={{
          width: '340px',
          height: videoState.aspectRatio === '9:16' ? '604px' : videoState.aspectRatio === '1:1' ? '340px' : '425px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full object-contain bg-black"
        />
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center gap-3 w-full justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          {isPlaying ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-emerald-400" />}
        </button>

        <button
          onClick={downloadImage}
          className="px-3.5 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-2 transition"
        >
          <Image className="w-4 h-4 text-indigo-400" /> PNG Frame
        </button>

        <button
          onClick={start15SecRecording}
          disabled={isRecording}
          className="px-4 py-2.5 rounded-xl studio-btn-primary text-xs font-semibold flex items-center gap-2 transition"
        >
          {isRecording ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" /> Recording 15s Reel ({currentTimeSec.toFixed(0)}s)...
            </>
          ) : (
            <>
              <Video className="w-4 h-4 text-white" /> Export 15s Reel (.WEBM)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
