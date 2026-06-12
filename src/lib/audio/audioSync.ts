// src/lib/audio/audioSync.ts
// Gemini's unique feature: record audio while writing
// Click a word/stroke → plays that moment in the recording

import { nanoid } from 'nanoid';
import type { AudioRecording } from '@/types';
import { saveAudioRecording } from '@/lib/storage/db';
import { useAppStore } from '@/store/useAppStore';

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStartTime = 0;
let currentRecordingId: string | null = null;

export async function startRecording(pageId: string): Promise<string> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  audioChunks = [];
  recordingStartTime = Date.now();
  currentRecordingId = nanoid();

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.start(100); // collect every 100ms
  useAppStore.getState().setIsRecordingAudio(true);
  return currentRecordingId;
}

export async function stopRecording(pageId: string): Promise<AudioRecording | null> {
  if (!mediaRecorder || !currentRecordingId) return null;

  return new Promise((resolve) => {
    mediaRecorder!.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const duration = Date.now() - recordingStartTime;

      const recording: AudioRecording = {
        id: currentRecordingId!,
        pageId,
        blob,
        url,
        duration,
        createdAt: recordingStartTime,
      };

      await saveAudioRecording(recording);
      useAppStore.getState().setIsRecordingAudio(false);

      // Stop all tracks
      mediaRecorder!.stream.getTracks().forEach((t) => t.stop());
      mediaRecorder = null;
      currentRecordingId = null;

      resolve(recording);
    };

    mediaRecorder!.stop();
  });
}

/**
 * Get the current timestamp offset in the recording
 * Call this when user places a stroke/text to attach audio timestamp
 */
export function getCurrentAudioTimestamp(): number {
  if (!mediaRecorder || mediaRecorder.state !== 'recording') return -1;
  return Date.now() - recordingStartTime;
}

/**
 * Play audio from a specific timestamp
 */
export function playAudioFrom(
  recording: AudioRecording,
  timestampMs: number
): HTMLAudioElement | null {
  if (!recording.url) return null;

  const audio = new Audio(recording.url);
  audio.currentTime = timestampMs / 1000;
  audio.play().catch(console.error);
  return audio;
}

/**
 * Find the nearest stroke to a click and return its audio timestamp
 */
export function findStrokeTimestamp(
  pageElements: any[],
  clickX: number,
  clickY: number,
  radius: number = 30
): number | null {
  let nearest: { dist: number; timestamp: number } | null = null;

  for (const el of pageElements) {
    if (!el.audioTimestamp || el.audioTimestamp < 0) continue;

    let cx = 0, cy = 0;
    if (el.type === 'stroke') {
      cx = el.bounds.x + el.bounds.width / 2;
      cy = el.bounds.y + el.bounds.height / 2;
    } else if ('x' in el) {
      cx = el.x + (el.width ?? 0) / 2;
      cy = el.y + (el.height ?? 0) / 2;
    }

    const dist = Math.sqrt((cx - clickX) ** 2 + (cy - clickY) ** 2);
    if (dist <= radius && (!nearest || dist < nearest.dist)) {
      nearest = { dist, timestamp: el.audioTimestamp };
    }
  }

  return nearest?.timestamp ?? null;
}
