"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getSoundEnabled, setSoundEnabled } from "@/lib/storage";

type SoundCtx = {
  enabled: boolean;
  toggle: () => void;
  playSubmit: () => void;
  playReveal: () => void;
  playTick: () => void;
};

const Ctx = createContext<SoundCtx>({
  enabled: false,
  toggle: () => {},
  playSubmit: () => {},
  playReveal: () => {},
  playTick: () => {},
});

/**
 * Lazy WebAudio-driven cues. No external audio files (zero asset weight).
 * Uses native AudioContext + short oscillator beeps — keeps build small,
 * dodges Howler's SSR tax. Editorial in feel: muted, brief, never punchy.
 */
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Cls = (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  if (!Cls) return null;
  try {
    audioCtx = new Cls();
    return audioCtx;
  } catch {
    return null;
  }
}

function tone(freq: number, durationMs: number, volume = 0.05) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  // ADSR: short attack, gentle decay → sounds editorial, not arcade
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.05);
}

const SOUND_KEY = "ig_sound_v1";
const soundSubscribers = new Set<() => void>();
function subscribeSound(cb: () => void) {
  soundSubscribers.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key === SOUND_KEY) cb();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    soundSubscribers.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
function notifySound() {
  soundSubscribers.forEach((cb) => cb());
}
function getSoundSnapshot(): boolean {
  return getSoundEnabled();
}
function getSoundServerSnapshot(): boolean {
  return false;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    getSoundServerSnapshot
  );
  const toggle = useCallback(() => {
    const next = !getSoundEnabled();
    setSoundEnabled(next);
    if (next) getAudioCtx()?.resume?.();
    notifySound();
  }, []);

  const value = useMemo<SoundCtx>(
    () => ({
      enabled,
      toggle,
      playSubmit: () => enabled && tone(660, 220, 0.06),
      playReveal: () => enabled && tone(440 + Math.random() * 120, 140, 0.04),
      playTick: () => enabled && tone(880, 40, 0.025),
    }),
    [enabled, toggle]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound(): SoundCtx {
  return useContext(Ctx);
}

export function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "Mute sound" : "Enable sound"}
      title={enabled ? "Sound on" : "Sound off"}
      className="inline-flex size-9 items-center justify-center rounded-full text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-ghost)] transition-colors"
    >
      {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
}
