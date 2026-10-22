import type { Lang } from "./store";

const LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };

export function hasVoice(lang: Lang) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const voices = window.speechSynthesis.getVoices();
  if (lang === "en") return true;
  return voices.some((v) => v.lang.toLowerCase().startsWith(lang));
}

/** Speaks text; returns false when no suitable voice exists. */
export function speak(text: string, lang: Lang) {
  if (!hasVoice(lang)) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LOCALE[lang];
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(lang));
  if (v) u.voice = v;
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return true;
}

let ctx: AudioContext | null = null;
export function audioReady() { return !!ctx && ctx.state === "running"; }
export async function unlockAudio() {
  try { ctx ??= new AudioContext(); await ctx.resume(); return ctx.state === "running"; } catch { return false; }
}
export function beep(freq = 880, ms = 250) {
  try {
    ctx ??= new AudioContext();
    if (ctx.state !== "running") return false;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = freq; g.gain.value = 0.15;
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + ms / 1000);
    return true;
  } catch { return false; }
}

export const speechRecognitionCtor = (): (new () => any) | null => {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};
export { LOCALE };
