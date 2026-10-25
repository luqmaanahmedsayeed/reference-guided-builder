import { useSyncExternalStore } from "react";
import { DEPARTMENTS, deptById, type DeptId } from "@/data/departments";
import { SAMPLE_20, SEED_PATIENTS } from "@/data/patients";

export type Lang = "en" | "hi" | "ta";
export type Status = "waiting" | "serving" | "done" | "noshow";
export type Entry = {
  token: string; dept: DeptId; name: string; age?: number; gender?: string; mobile?: string;
  status: Status; seq: number; createdAt: number; startedAt?: number;
};
export type DeptState = { doctor: "available" | "break" | "late"; breakUntil?: number; lateBy: number; history: number[] };
export type Flag = { id: string; at: number; ack: boolean };
export type State = {
  version: 1; entries: Entry[]; depts: Record<DeptId, DeptState>; counters: Record<DeptId, number>;
  flags: Flag[]; sampleAdded: boolean; speed: boolean; updatedAt: number;
  lastCall?: { token: string; dept: DeptId; at: number }; alerted: string[];
};
export type Prefs = { lang: Lang | null; size: 0 | 1 | 2; contrast: boolean; read: boolean; avoidStairs: boolean; assisted: boolean };

const KEY = "opd.state.v1";
const PKEY = "opd.prefs.v1";
const DEFAULT_PREFS: Prefs = { lang: null, size: 0, contrast: false, read: false, avoidStairs: false, assisted: false };

const pad = (n: number) => String(n).padStart(3, "0");

export function makeSeed(now: number): State {
  const depts = {} as Record<DeptId, DeptState>;
  const counters = {} as Record<DeptId, number>;
  const entries: Entry[] = [];
  DEPARTMENTS.forEach((d) => { depts[d.id] = { doctor: "available", lateBy: 0, history: [] }; counters[d.id] = 38; });
  depts.ORT = { doctor: "late", lateBy: 15, history: [] };
  SEED_PATIENTS.forEach((sp, i) => {
    const n = ++counters[sp.dept];
    const first = !entries.some((e) => e.dept === sp.dept);
    entries.push({ token: `${sp.dept}-${pad(n)}`, dept: sp.dept, name: sp.name, status: first ? "serving" : "waiting", seq: i, createdAt: now - (60 - i) * 60000, startedAt: first ? now - 3 * 60000 : undefined });
  });
  return { version: 1, entries, depts, counters, flags: [], sampleAdded: false, speed: false, updatedAt: now, alerted: [] };
}

function valid(s: unknown): s is State {
  const x = s as State;
  return !!x && x.version === 1 && Array.isArray(x.entries) && !!x.depts && !!x.counters && DEPARTMENTS.every((d) => x.depts[d.id] && typeof x.counters[d.id] === "number");
}

const listeners = new Set<() => void>();
let cache: State | null = null;
let pcache: Prefs | null = null;
let serverState: State | null = null;
let chan: BroadcastChannel | null = null;
let wired = false;

function emit() { listeners.forEach((l) => l()); }
function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  try { if ("BroadcastChannel" in window) { chan = new BroadcastChannel("opd-saathi"); chan.onmessage = () => { cache = null; pcache = null; emit(); }; } } catch { chan = null; }
  window.addEventListener("storage", (e) => { if (e.key === KEY || e.key === PKEY) { cache = null; pcache = null; emit(); } });
}

function readState(): State {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (valid(s)) return s; } } catch { /* recover below */ }
  const s = makeSeed(Date.now());
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  return s;
}
function readPrefs(): Prefs {
  try { const raw = localStorage.getItem(PKEY); if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }; } catch { /* ignore */ }
  return DEFAULT_PREFS;
}

const subscribe = (l: () => void) => { wire(); listeners.add(l); return () => listeners.delete(l); };
const getState = () => (cache ??= readState());
const getServerState = () => (serverState ??= makeSeed(0));
const getPrefs = () => (pcache ??= readPrefs());

export const useQueue = () => useSyncExternalStore(subscribe, getState, getServerState);
export const usePrefs = () => useSyncExternalStore(subscribe, getPrefs, () => DEFAULT_PREFS);

/** Discrete operation: re-read the latest persisted state, apply, write, broadcast. */
export function mutate(fn: (s: State) => void) {
  const s: State = structuredClone(readState());
  fn(s);
  s.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  cache = s; emit(); chan?.postMessage("state");
  return s;
}
export function setPrefs(patch: Partial<Prefs>) {
  const next = { ...readPrefs(), ...patch };
  try { localStorage.setItem(PKEY, JSON.stringify(next)); } catch { /* ignore */ }
  pcache = next; emit(); chan?.postMessage("prefs");
}

// ---------- Queue logic ----------
export const active = (e: Entry) => e.status === "waiting" || e.status === "serving";
export function deptQueue(s: State, dept: DeptId) {
  return s.entries.filter((e) => e.dept === dept && active(e))
    .sort((a, b) => (a.status === "serving" ? 0 : 1) - (b.status === "serving" ? 0 : 1) || a.seq - b.seq);
}
export const findEntry = (s: State, token: string) => s.entries.find((e) => e.token === token);
export function peopleAhead(s: State, token: string) {
  const e = findEntry(s, token); if (!e || !active(e)) return 0;
  return deptQueue(s, e.dept).findIndex((x) => x.token === token);
}
export function avgConsult(s: State, dept: DeptId) {
  const h = s.depts[dept].history.slice(-10);
  return h.length ? h.reduce((a, b) => a + b, 0) / h.length : deptById(dept)!.avgMin;
}
export function doctorDelay(s: State, dept: DeptId, now: number) {
  const d = s.depts[dept];
  if (d.doctor === "late") return d.lateBy;
  if (d.doctor === "break" && d.breakUntil) return Math.max(0, Math.ceil((d.breakUntil - now) / 60000));
  return 0;
}
/** (people ahead × average consultation) + doctor delay, rounded to nearest 5 minutes. */
export function estimateWait(ahead: number, avg: number, delay: number) {
  return Math.round((ahead * avg + delay) / 5) * 5;
}
export const etaFor = (s: State, token: string, now: number) => {
  const e = findEntry(s, token)!;
  return estimateWait(peopleAhead(s, token), avgConsult(s, e.dept), doctorDelay(s, e.dept, now));
};
export const serving = (s: State, dept: DeptId) => s.entries.find((e) => e.dept === dept && e.status === "serving");

export function normalizeToken(raw: string) {
  const m = raw.toUpperCase().replace(/\s/g, "").match(/([A-Z]{3})-?(\d{1,3})/);
  return m ? `${m[1]}-${m[2].padStart(3, "0")}` : null;
}

export function createToken(d: { name: string; dept: DeptId; age?: number; gender?: string; mobile?: string }, tokenOverride?: string) {
  let token = "";
  mutate((s) => {
    token = tokenOverride ?? `${d.dept}-${pad(++s.counters[d.dept])}`;
    if (s.entries.some((entry) => entry.token === token)) return;
    const number = Number(token.split("-")[1]);
    if (Number.isFinite(number)) s.counters[d.dept] = Math.max(s.counters[d.dept], number);
    const seq = Math.max(0, ...s.entries.map((e) => e.seq)) + 1;
    s.entries.push({ ...d, token, status: "waiting", seq, createdAt: Date.now() });
  });
  return token;
}

function finishServing(s: State, dept: DeptId, duration?: number) {
  const cur = serving(s, dept); if (!cur) return;
  cur.status = "done";
  const mins = duration ?? Math.max(3, Math.round((Date.now() - (cur.startedAt ?? Date.now())) / 60000)) ;
  s.depts[dept].history = [...s.depts[dept].history, mins].slice(-10);
}
export function callNext(dept: DeptId, duration?: number) {
  let called: string | null = null;
  mutate((s) => {
    finishServing(s, dept, duration ?? 4 + Math.round(Math.random() * 8));
    const next = deptQueue(s, dept).find((e) => e.status === "waiting");
    if (next) { next.status = "serving"; next.startedAt = Date.now(); called = next.token; s.lastCall = { token: next.token, dept, at: Date.now() }; }
  });
  return called;
}
export const completeConsult = (dept: DeptId) => mutate((s) => finishServing(s, dept, 4 + Math.round(Math.random() * 8)));
export const markNoShow = (token: string) => mutate((s) => { const e = findEntry(s, token); if (e) e.status = "noshow"; });
export const moveToEnd = (token: string) => mutate((s) => {
  const e = findEntry(s, token); if (!e) return;
  e.status = "waiting"; e.seq = Math.max(...s.entries.map((x) => x.seq)) + 1;
});
export const moveDept = (token: string, dept: DeptId) => mutate((s) => {
  const e = findEntry(s, token); if (!e) return;
  e.dept = dept; e.status = "waiting"; e.seq = Math.max(...s.entries.map((x) => x.seq)) + 1;
});
export const setDoctor = (dept: DeptId, st: DeptState["doctor"], mins = 0) => mutate((s) => {
  const d = s.depts[dept]; d.doctor = st;
  d.lateBy = st === "late" ? mins : 0;
  d.breakUntil = st === "break" ? Date.now() + mins * 60000 : undefined;
});
export const raiseFlag = () => mutate((s) => { s.flags.push({ id: `F${Date.now()}`, at: Date.now(), ack: false }); });
export const ackFlag = (id: string) => mutate((s) => { const f = s.flags.find((x) => x.id === id); if (f) f.ack = true; });
export const markAlerted = (token: string) => mutate((s) => { if (!s.alerted.includes(token)) s.alerted.push(token); });
export const clearAlerted = (token: string) => mutate((s) => { s.alerted = s.alerted.filter((t) => t !== token); });
export const setSpeed = (on: boolean) => mutate((s) => { s.speed = on; });
export function addSample20() {
  let added = false;
  mutate((s) => {
    if (s.sampleAdded) return;
    let seq = Math.max(0, ...s.entries.map((e) => e.seq));
    SAMPLE_20.forEach((sp) => {
      const n = ++s.counters[sp.dept];
      s.entries.push({ token: `${sp.dept}-${pad(n)}`, dept: sp.dept, name: sp.name, status: "waiting", seq: ++seq, createdAt: Date.now() });
    });
    s.sampleAdded = true; added = true;
  });
  return added;
}
export function resetDemo() {
  const s = makeSeed(Date.now());
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  cache = s; emit(); chan?.postMessage("state");
}
