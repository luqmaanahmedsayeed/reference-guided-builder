import { en, type Key } from "@/i18n/en";
import { hi } from "@/i18n/hi";
import { ta } from "@/i18n/ta";
import type { L } from "@/data/hospital";
import { usePrefs, type Lang } from "./store";

export const DICTS: Record<Lang, Record<Key, string>> = { en, hi, ta };
export const LANGS: { id: Lang; native: string; label: string; mark: string }[] = [
  { id: "en", native: "English", label: "English", mark: "A" },
  { id: "hi", native: "हिंदी", label: "Hindi", mark: "अ" },
  { id: "ta", native: "தமிழ்", label: "Tamil", mark: "அ" },
];

export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>) {
  let s = DICTS[lang][key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function useT() {
  const prefs = usePrefs();
  const lang: Lang = prefs.lang ?? "en";
  return {
    lang,
    t: (key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars),
    l: (x: L) => x[lang],
  };
}

export const fmtTime = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
