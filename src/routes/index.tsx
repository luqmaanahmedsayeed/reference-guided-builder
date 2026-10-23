import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { LANGS, translate } from "@/lib/i18n";
import { setPrefs, usePrefs, type Lang } from "@/lib/store";
import { Btn } from "@/components/kit";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/")({
  head: pageHead("Choose your language", "OPD Saathi — register in English, Hindi or Tamil, know your turn and find your room."),
  component: LanguagePicker,
});

function LanguagePicker() {
  const prefs = usePrefs();
  const [sel, setSel] = useState<Lang | null>(null);
  useEffect(() => { if (prefs.lang) setSel(prefs.lang); }, [prefs.lang]);
  const navigate = useNavigate();
  const L = sel ?? "en";
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <p className="bg-ink px-4 py-1.5 text-center font-mono text-xs text-ink-foreground">{translate(L, "app.demo")}</p>
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-32 size-[26rem] rounded-full bg-primary" />
      <div className="relative mx-auto grid max-w-5xl gap-10 px-5 py-10 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div>
          <p className="font-display text-4xl font-bold leading-none">OPD<br /><span className="text-primary">Saathi</span></p>
          <p className="eyebrow mt-3">City District Hospital · सिटी जिला अस्पताल · நகர மாவட்ட மருத்துவமனை</p>
          <h1 className="mt-10 text-5xl leading-[0.95] sm:text-6xl">{translate(L, "lang.title")}</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">{translate(L, "lang.sub")}</p>
        </div>
        <div className="flex flex-col gap-3 md:pt-24" role="radiogroup" aria-label="Language / भाषा / மொழி">
          {LANGS.map((lg) => {
            const on = sel === lg.id;
            return (
              <button key={lg.id} role="radio" aria-checked={on} onClick={() => setSel(lg.id)}
                className={cn("flex min-h-20 items-center gap-4 rounded-md border-2 px-5 text-left transition-colors",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-foreground bg-background hover:bg-secondary")}>
                <span className="w-10 font-display text-3xl font-bold" aria-hidden>{lg.mark}</span>
                <span className="flex-1"><span className="block font-display text-2xl font-bold">{lg.native}</span>
                  <span className="font-mono text-xs opacity-80">{lg.label}</span></span>
                {on && <Check className="size-7" aria-hidden />}
              </button>
            );
          })}
          <Btn v="ink" size="lg" className="mt-4" disabled={!sel}
            onClick={() => { if (sel) { setPrefs({ lang: sel }); navigate({ to: "/home" }); } }}>
            {translate(L, "c.continue")} <ArrowRight className="size-6" aria-hidden />
          </Btn>
        </div>
      </div>
    </main>
  );
}
