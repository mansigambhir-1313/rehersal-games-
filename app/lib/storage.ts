"use client";

import type { Session } from "@/lib/types";

const KEY_SESSIONS = "ig_sessions_v1";
const KEY_LAST_RESULT = "ig_last_result_v1";
const KEY_SOUND = "ig_sound_v1";
const MAX_SESSIONS = 25;

function isBrowser() {
  return typeof window !== "undefined" && !!window.localStorage;
}

// ── reference-stable snapshot cache ──────────────────────────────
// useSyncExternalStore requires getSnapshot to return a cached object;
// otherwise React infinite-loops with "Maximum update depth exceeded" (#185).
let cachedSessionsRaw: string | null = null;
let cachedSessions: Session[] = [];

function readSessionsRaw(): string {
  if (!isBrowser()) return "[]";
  return localStorage.getItem(KEY_SESSIONS) ?? "[]";
}

export function loadSessions(): Session[] {
  const raw = readSessionsRaw();
  if (raw === cachedSessionsRaw) return cachedSessions;
  try {
    cachedSessions = JSON.parse(raw) as Session[];
  } catch {
    cachedSessions = [];
  }
  cachedSessionsRaw = raw;
  return cachedSessions;
}

export function loadSession(sessionId: string): Session | null {
  return loadSessions().find((s) => s.id === sessionId) ?? null;
}

export function loadLastSession(): Session | null {
  if (!isBrowser()) return null;
  const lastId = localStorage.getItem(KEY_LAST_RESULT);
  if (!lastId) return null;
  return loadSession(lastId);
}

export function saveSession(session: Session) {
  if (!isBrowser()) return;
  const all = loadSessions();
  const merged = [session, ...all.filter((s) => s.id !== session.id)].slice(
    0,
    MAX_SESSIONS
  );
  const serialized = JSON.stringify(merged);
  localStorage.setItem(KEY_SESSIONS, serialized);
  localStorage.setItem(KEY_LAST_RESULT, session.id);
  // bust cache so subscribers see the new data
  cachedSessionsRaw = serialized;
  cachedSessions = merged;
  // notify same-tab subscribers; the native "storage" event only fires across tabs
  window.dispatchEvent(new StorageEvent("storage", { key: KEY_SESSIONS }));
}

export function getSoundEnabled(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(KEY_SOUND) === "1";
}

export function setSoundEnabled(enabled: boolean) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_SOUND, enabled ? "1" : "0");
}

export const STORAGE_KEY_SESSIONS = KEY_SESSIONS;
