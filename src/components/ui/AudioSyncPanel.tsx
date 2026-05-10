'use client';
// src/components/ui/AudioSyncPanel.tsx
// Recording waveform + click-to-play audio markers on canvas

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore, useActivePage } from '@/store/useAppStore';
import { startRecording, stopRecording, playAudioFrom, findStrokeTimestamp } from '@/lib/audio/audioSync';
import { getPageAudioRecording } from '@/lib/storage/db';
import { Mic, MicOff, Play, Pause, Square } from 'lucide-react';
import type { AudioRecording } from '@/types';

export function AudioSyncPanel() {
  const activePage = useActivePage();
  const { isRecordingAudio, setIsRecordingAudio } = useAppStore();

  const [recording, setRecording] = useState<AudioRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  // Load existing recording for page
  useEffect(() => {
    if (!activePage) return;
    getPageAudioRecording(activePage.id).then((rec) => {
      if (rec) setRecording(rec);
    });
  }, [activePage?.id]);

  // Waveform animation while recording
  const drawWaveform = useCallback(() => {
    const canvas = waveformRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const handleStartRecording = async () => {
    if (!activePage) return;
    try {
      // Setup audio analyser for waveform
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      await startRecording(activePage.id);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      drawWaveform();
    } catch (e) {
      console.error('[Audio] Failed to start recording', e);
      alert('Microphone access denied. Please allow microphone access.');
    }
  };

  const handleStopRecording = async () => {
    if (!activePage) return;
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;

    const rec = await stopRecording(activePage.id);
    if (rec) setRecording(rec);
  };

  const handlePlay = () => {
    if (!recording?.url) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(recording.url);
    audioRef.current = audio;
    audio.play();
    setIsPlaying(true);
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => { setIsPlaying(false); audioRef.current = null; setCurrentTime(0); };
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const duration = recording ? recording.duration / 1000 : 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs">
      {!isRecordingAudio && !recording && (
        <button
          onClick={handleStartRecording}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 transition-colors font-medium"
        >
          <Mic size={12} />
          Record audio
        </button>
      )}

      {isRecordingAudio && (
        <>
          <div className="flex items-center gap-1.5 text-red-600 animate-pulse">
            <Mic size={12} />
            <span className="font-medium">{fmtTime(elapsed)}</span>
          </div>
          <canvas ref={waveformRef} width={120} height={24} className="flex-1 max-w-[120px]" />
          <button
            onClick={handleStopRecording}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
          >
            <Square size={10} />
            Stop
          </button>
          <span className="text-gray-400">Click elements while recording to link audio timestamps</span>
        </>
      )}

      {!isRecordingAudio && recording && (
        <>
          <button
            onClick={handlePlay}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 hover:bg-blue-100 font-medium"
          >
            {isPlaying ? <Pause size={11} /> : <Play size={11} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          {/* Progress bar */}
          <div className="flex-1 max-w-[160px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>

          <span className="text-gray-400 font-mono">
            {fmtTime(currentTime)} / {fmtTime(duration)}
          </span>

          <button
            onClick={() => { setRecording(null); audioRef.current?.pause(); audioRef.current = null; setIsPlaying(false); }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete recording"
          >
            <MicOff size={12} />
          </button>
        </>
      )}
    </div>
  );
}
