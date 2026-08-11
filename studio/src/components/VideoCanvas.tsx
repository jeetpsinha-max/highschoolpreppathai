import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, Image, Video, RefreshCw, Clock, Volume2, VolumeX, Sparkles, Film, Download } from 'lucide-react';
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
  const [exportFormat, setExportFormat] = useState<'webm' | 'png'>('webm');
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const durationSec = 15;
  const width = 1080;
  const height = videoState.aspectRatio === '9:16' ? 1920 : videoState.aspectRatio === '1:1' ? 1080 : 1350;

  useEffect(() => {
    if (videoState.bgImageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = videoState.bgImageUrl;
      img.onload = () => {
        bgImageRef.current = img;
      };
    } else {
      bgImageRef.current = null;
    }
  }, [videoState.bgImageUrl]);

  useEffect(() => {
    if (videoState.templateId === 'accepted_story') {
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
    }
  }, [videoState.templateId, videoState.userPrompt, videoState.pastReelReferenceId]);

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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsedTotal = (now - startTime) / 1000;
      const elapsed = elapsedTotal % durationSec;
      setCurrentTimeSec(+elapsed.toFixed(1));

      ctx.clearRect(0, 0, width, height);

      // Ken Burns 3D Parallax & Camera Zoom
      const cameraZoom = 1.0 + (elapsed / durationSec) * 0.14;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(cameraZoom, cameraZoom);
      ctx.translate(-width / 2, -height / 2);

      // Photo Background
      if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, -20, -20, width + 40, height + 40);

        const darkGrad = ctx.createLinearGradient(0, 0, 0, height);
        darkGrad.addColorStop(0, 'rgba(6, 9, 19, 0.60)');
        darkGrad.addColorStop(0.5, 'rgba(6, 9, 19, 0.75)');
        darkGrad.addColorStop(1, 'rgba(6, 9, 19, 0.85)');
        ctx.fillStyle = darkGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#060913');
        gradient.addColorStop(0.5, '#0f172a');
        gradient.addColorStop(1, '#020617');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Glow Pulse
      const pulse = Math.sin(elapsed * 3) * 60;
      const glowGrad = ctx.createRadialGradient(width / 2, height / 3, 10, width / 2, height / 3, 440 + pulse);
      glowGrad.addColorStop(0, (videoState.accentColor || '#3B82F6') + '77');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Shimmer Streak Sweep
      const sweepX = ((elapsed % 3) / 3) * (width + 600) - 300;
      const lightGrad = ctx.createLinearGradient(sweepX, 0, sweepX + 200, height);
      lightGrad.addColorStop(0, 'transparent');
      lightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, width, height);

      // 4-Scene Storyboard
      if (elapsed < 3.5) {
        renderScene1Hook(ctx, elapsed);
      } else if (elapsed < 7.5) {
        renderScene2Problem(ctx, elapsed - 3.5);
      } else if (elapsed < 11.5) {
        renderScene3Solution(ctx, elapsed - 7.5);
      } else {
        renderScene4Cta(ctx, elapsed - 11.5);
      }

      // Audio Spectrum
      renderAudioSpectrum(ctx, elapsed);

      // Vignette Overlay
      const vignette = ctx.createRadialGradient(width / 2, height / 2, width / 3, width / 2, height / 2, width);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Watermark
      if (videoState.showWatermark) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎓 PREPPATH.AI', width / 2, height - 90);
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

  const renderAudioSpectrum = (ctx: CanvasRenderingContext2D, t: number) => {
    const barCount = 18;
    const barWidth = 14;
    const gap = 8;
    const totalW = barCount * (barWidth + gap);
    const startX = width / 2 - totalW / 2;
    const startY = height - 160;

    for (let i = 0; i < barCount; i++) {
      const h = Math.abs(Math.sin(t * 6 + i * 0.4)) * 40 + 10;
      ctx.fillStyle = (videoState.accentColor || '#3B82F6') + 'AA';
      ctx.beginPath();
      ctx.roundRect(startX + i * (barWidth + gap), startY - h, barWidth, h, 6);
      ctx.fill();
    }
  };

  const renderScene1Hook = (ctx: CanvasRenderingContext2D, t: number) => {
    const entranceScale = Math.min(1, 0.7 + t * 0.15);
    const cardY = height / 3 + Math.sin(t * 3) * 8;

    ctx.save();
    ctx.translate(width / 2, cardY + 100);
    ctx.scale(entranceScale, entranceScale);
    ctx.translate(-width / 2, -(cardY + 100));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = videoState.accentColor || '#3B82F6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(100, cardY - 50, width - 200, 440, 32);
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

    ctx.restore();
  };

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
              <RefreshCw className="w-4 h-4 animate-spin text-white" /> Recording 15s HD Reel ({currentTimeSec.toFixed(0)}s)...
            </>
          ) : (
            <>
              <Video className="w-4 h-4 text-white" /> Export 15s HD Reel (.WEBM)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
