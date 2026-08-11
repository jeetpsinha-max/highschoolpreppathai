import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, Image, Video, RefreshCw, Clock, Volume2, VolumeX, Sparkles } from 'lucide-react';
import type { VideoState } from '../types';

interface Props {
  videoState: VideoState;
}

export default function VideoCanvas({ videoState }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const durationSec = 15;
  const width = 1080;
  const height = videoState.aspectRatio === '9:16' ? 1920 : videoState.aspectRatio === '1:1' ? 1080 : 1350;

  useEffect(() => {
    if (videoState.templateId === 'accepted_story') {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
    }
  }, [videoState.templateId, videoState.userPrompt, videoState.pastReelReferenceId]);

  // Voiceover Speech Synthesis
  const toggleVoiceover = () => {
    if (!('speechSynthesis' in window)) return alert('Web Speech API not supported.');

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const script = videoState.brainMeta?.voiceOverScript || `I got accepted into ${videoState.schoolName} using PrepPath AI!`;
      const speech = new SpeechSynthesisUtterance(script);
      speech.rate = 1.05;
      speech.pitch = 1.0;
      speech.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(speech);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsedTotal = (now - startTime) / 1000;
      const elapsed = elapsedTotal % durationSec;
      setCurrentTimeSec(+elapsed.toFixed(1));

      ctx.clearRect(0, 0, width, height);

      // Ken Burns Camera Zoom Factor (1.0x -> 1.12x)
      const zoom = 1.0 + (elapsed / durationSec) * 0.12;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#060913');
      gradient.addColorStop(0.5, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Dynamic Ambient Glow
      const pulse = Math.sin(elapsed * 3) * 50;
      const glowGrad = ctx.createRadialGradient(width / 2, height / 3, 10, width / 2, height / 3, 420 + pulse);
      glowGrad.addColorStop(0, (videoState.accentColor || '#3B82F6') + '66');
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

      // ── 4-SCENE COMPLEX STORYBOARD RENDERER ──
      // Scene 1: 0.0s - 3.5s (High Impact Viral Hook)
      // Scene 2: 3.5s - 7.5s (The Problem / Before State)
      // Scene 3: 7.5s - 11.5s (PrepPath Transformation / Solution)
      // Scene 4: 11.5s - 15.0s (Call To Action & Bio Link)

      if (elapsed < 3.5) {
        renderScene1Hook(ctx, elapsed);
      } else if (elapsed < 7.5) {
        renderScene2Problem(ctx, elapsed - 3.5);
      } else if (elapsed < 11.5) {
        renderScene3Solution(ctx, elapsed - 7.5);
      } else {
        renderScene4Cta(ctx, elapsed - 11.5);
      }

      // Render PrepPath Watermark
      if (videoState.showWatermark) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎓 PREPPATH.AI', width / 2, height - 80);
      }

      ctx.restore();

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoState, isPlaying, height, width]);

  // ── SCENE 1: VIRAL HOOK (0s - 3.5s) ──
  const renderScene1Hook = (ctx: CanvasRenderingContext2D, t: number) => {
    const cardY = height / 3 + Math.sin(t * 3) * 10;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = videoState.accentColor || '#3B82F6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(100, cardY - 50, width - 200, 420, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.font = '800 36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 SCENE 1: VIRAL HOOK', width / 2, cardY + 20);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 56px Outfit, sans-serif';
    ctx.fillText(videoState.sceneScript?.scene1Hook || `✨ I GOT INTO ${videoState.schoolName.toUpperCase()}!`, width / 2, cardY + 140);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 36px Inter, sans-serif';
    ctx.fillText(`Target School: ${videoState.schoolName}`, width / 2, cardY + 240);
  };

  // ── SCENE 2: THE PROBLEM (3.5s - 7.5s) ──
  const renderScene2Problem = (ctx: CanvasRenderingContext2D, t: number) => {
    ctx.fillStyle = '#EF4444';
    ctx.font = '900 52px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ SCENE 2: THE PROBLEM', width / 2, height / 4);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(100, height / 3, width - 200, 440, 28);
    ctx.fill();
    ctx.stroke();

    const text = videoState.sceneScript?.scene2Problem || '❌ COMMON MISTAKE: Generic answers in essays & interviews.';
    ctx.fillStyle = '#FCA5A5';
    ctx.font = '700 38px Inter, sans-serif';
    ctx.fillText(text, width / 2, height / 3 + 180);
  };

  // ── SCENE 3: SOLUTION / TRANSFORMATION (7.5s - 11.5s) ──
  const renderScene3Solution = (ctx: CanvasRenderingContext2D, t: number) => {
    ctx.fillStyle = '#10B981';
    ctx.font = '900 52px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💡 SCENE 3: PREPPATH SOLUTION', width / 2, height / 4);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(100, height / 3, width - 200, 460, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#6EE7B7';
    ctx.font = '700 38px Inter, sans-serif';
    ctx.fillText(videoState.sceneScript?.scene3Solution || '✅ PREPPATH AI: Personalized scoring & 99th %ile strategies.', width / 2, height / 3 + 180);
  };

  // ── SCENE 4: CALL TO ACTION (11.5s - 15.0s) ──
  const renderScene4Cta = (ctx: CanvasRenderingContext2D, t: number) => {
    const cardY = height / 2 - 220;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#EC4899';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(120, cardY, width - 240, 540, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 220, cardY - 35, 440, 70, 20);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 34px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 SCENE 4: FINAL CALL TO ACTION', width / 2, cardY + 12);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 56px Outfit, sans-serif';
    ctx.fillText(`SSAT SCORE: ${videoState.score}`, width / 2, cardY + 160);

    ctx.fillStyle = '#F472B6';
    ctx.font = '700 40px Inter, sans-serif';
    ctx.fillText(videoState.sceneScript?.scene4Cta || '📲 Tap link in bio to predict your score on PrepPath.ai!', width / 2, cardY + 320);
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

    setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, 15000);
  };

  const currentSceneName =
    currentTimeSec < 3.5
      ? 'Scene 1: Viral Hook'
      : currentTimeSec < 7.5
      ? 'Scene 2: Problem'
      : currentTimeSec < 11.5
      ? 'Scene 3: Solution'
      : 'Scene 4: Call To Action';

  return (
    <div className="flex flex-col items-center space-y-4 w-full font-sans">
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
      <div className="flex flex-wrap items-center gap-2 w-full justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          {isPlaying ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-emerald-400" />}
        </button>

        <button
          onClick={toggleVoiceover}
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
            isSpeaking
              ? 'bg-red-500/20 border-red-500/40 text-red-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          {isSpeaking ? 'Mute AI Voice' : 'AI Voiceover'}
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
          className="px-4 py-2.5 rounded-xl studio-btn-primary text-xs font-semibold flex items-center gap-2 transition shadow-lg"
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
