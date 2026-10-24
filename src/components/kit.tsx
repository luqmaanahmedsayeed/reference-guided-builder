import { cva, type VariantProps } from "class-variance-authority";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Mic, Volume2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { speak, speechRecognitionCtor, LOCALE } from "@/lib/browser";
import { DEPARTMENTS, type DeptId } from "@/data/departments";
import { Stethoscope, Baby, Heart, Bone, Ear, Eye, Hand, CircleHelp } from "lucide-react";
import { toast } from "sonner";

export const btn = cva(
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-md px-5 py-3 text-base font-bold font-display transition-colors disabled:cursor-not-allowed disabled:opacity-45 text-center",
  {
    variants: {
      v: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-dark active:bg-primary-dark",
        ink: "bg-ink text-ink-foreground hover:bg-ink/85",
        outline: "border-2 border-foreground bg-background text-foreground hover:bg-secondary",
        ghost: "text-foreground hover:bg-secondary",
        quiet: "border border-border bg-secondary text-foreground hover:bg-muted",
      },
      size: { md: "", sm: "min-h-11 px-3 py-2 text-sm", lg: "min-h-16 text-lg px-6" },
    },
    defaultVariants: { v: "primary", size: "md" },
  },
);
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof btn>;
export function Btn({ v, size, className, ...p }: BtnProps) {
  return <button className={cn(btn({ v, size }), className)} {...p} />;
}

export const DEPT_ICON: Record<DeptId | "HELP", typeof Stethoscope> = {
  MED: Stethoscope, CHD: Baby, WOM: Heart, ORT: Bone, ENT: Ear, EYE: Eye, SKN: Hand, HELP: CircleHelp,
};

export function DeptGrid({ value, onChange, onNotSure, compact }: { value?: DeptId; onChange: (d: DeptId) => void; onNotSure?: () => void; compact?: boolean }) {
  const { t, l, lang } = useT();
  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2")} role="radiogroup" aria-label={t("reg.dept")}>
      {DEPARTMENTS.map((d) => {
        const I = DEPT_ICON[d.id]; const on = value === d.id;
        return (
          <button key={d.id} role="radio" aria-checked={on} onClick={() => onChange(d.id)}
            className={cn("tile flex min-h-16 items-start gap-3 p-4 text-left transition-colors", on ? "border-2 border-primary bg-secondary" : "hover:bg-secondary")}>
            <I className={cn("mt-0.5 size-7 shrink-0", on ? "text-primary" : "")} aria-hidden />
            <span className="min-w-0">
              <span className="flex items-center gap-2 font-display font-bold">{l(d.name)}<button type="button" className="rounded p-1 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" aria-label={`${t("read.btn")}: ${l(d.name)}`} onClick={(e) => { e.stopPropagation(); speak(l(d.name), lang); }}><Volume2 className="size-4" aria-hidden /></button></span>
              {!compact && <span className="block text-sm text-muted-foreground">{l(d.desc)}</span>}
            </span>
          </button>
        );
      })}
      {onNotSure && (
        <button onClick={onNotSure} className="tile flex min-h-16 items-start gap-3 border-dashed border-2 p-4 text-left hover:bg-secondary">
          <CircleHelp className="mt-0.5 size-7 shrink-0 text-primary" aria-hidden />
          <span><span className="block font-display font-bold">{t("reg.notSure")}</span>
            <span className="block text-sm text-muted-foreground">{t("reg.notSureD")}</span></span>
        </button>
      )}
    </div>
  );
}

export function MicButton({ onText }: { onText: (s: string) => void }) {
  const { t, lang } = useT();
  const [on, setOn] = useState(false);
  const Ctor = typeof window !== "undefined" ? speechRecognitionCtor() : null;
  const start = () => {
    if (!Ctor) { toast(t("mic.unsupported")); return; }
    const r = new Ctor(); r.lang = LOCALE[lang]; r.interimResults = false;
    r.onresult = (e: any) => onText(e.results[0][0].transcript.trim());
    r.onerror = (e: any) => { setOn(false); toast(e.error === "not-allowed" ? t("mic.denied") : t("mic.unsupported")); };
    r.onend = () => setOn(false);
    try { r.start(); setOn(true); } catch { toast(t("mic.unsupported")); }
  };
  return (
    <Btn type="button" v={on ? "primary" : "outline"} onClick={start} aria-label={on ? t("mic.listening") : t("mic.start")} title={Ctor ? t("mic.start") : t("mic.unsupported")} className="w-14 shrink-0 px-0">
      <Mic className="size-6" aria-hidden />
    </Btn>
  );
}

export function ReadBtn({ text, label }: { text: string; label?: string }) {
  const { t, lang } = useT();
  const [reading, setReading] = useState(false);
  const toggle = () => {
    if (reading) { window.speechSynthesis?.cancel(); setReading(false); return; }
    if (!speak(text, lang)) { toast(t("read.none")); return; }
    setReading(true);
    const done = () => setReading(false);
    window.speechSynthesis?.addEventListener("end", done, { once: true });
    window.speechSynthesis?.addEventListener("error", done, { once: true });
  };
  return <Btn type="button" v="quiet" size="sm" onClick={toggle} aria-label={reading ? t("read.stop") : (label ?? t("read.btn"))}>
    {reading ? <Square className="size-5" aria-hidden /> : <Volume2 className="size-5" aria-hidden />} {reading ? t("read.stop") : (label ?? t("read.btn"))}
  </Btn>;
}

export function Switch({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  const { t } = useT();
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left">
      <span className="min-w-0"><span className="block font-display font-bold">{label}</span>
        {desc && <span className="block text-sm text-muted-foreground">{desc}</span>}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="eyebrow">{checked ? t("c.on") : t("c.off")}</span>
        <span className={cn("relative h-8 w-14 rounded-full border-2 border-foreground transition-colors", checked ? "bg-primary" : "bg-background")}>
          <span className={cn("absolute top-0.5 size-6 rounded-full transition-all", checked ? "left-6 bg-primary-foreground" : "left-0.5 bg-foreground")} />
        </span>
      </span>
    </button>
  );
}

export function PageTitle({ eyebrow, children, aside }: { eyebrow?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-4">
      <div className="min-w-0">{eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}<h1 className="text-3xl sm:text-4xl">{children}</h1></div>
      {aside}
    </div>
  );
}
