"use client";

/**
 * Tap sound effects + haptic feedback (backlog M6 P1).
 * Sounds are synthesized with Web Audio (no assets); haptics use
 * navigator.vibrate where supported. Mute preference lives in
 * localStorage (small preference, per design doc section 24).
 */

const MUTE_KEY = "dog-bingo:muted";
let ctx: AudioContext | null = null;
const muteListeners = new Set<() => void>();

/** Subscribe to mute changes (for useSyncExternalStore). */
export function subscribeMuted(cb: () => void): () => void {
  muteListeners.add(cb);
  return () => muteListeners.delete(cb);
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    if (muted) localStorage.setItem(MUTE_KEY, "1");
    else localStorage.removeItem(MUTE_KEY);
  } catch {
    /* private mode */
  }
  muteListeners.forEach((cb) => cb());
}

function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function blip(
  startFreq: number,
  endFreq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0,
) {
  const c = audioCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, t0);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

/** Bright two-note chirp + short buzz when a tile is marked found. */
export function feedbackFound(): void {
  if (!isMuted()) {
    blip(523, 784, 0.09, "triangle", 0.14);
    blip(784, 1047, 0.12, "triangle", 0.12, 0.07);
  }
  vibrate(18);
}

/** Soft downward blip + light tick when a tile is unmarked. */
export function feedbackUnfound(): void {
  if (!isMuted()) blip(440, 294, 0.11, "sine", 0.08);
  vibrate(8);
}
