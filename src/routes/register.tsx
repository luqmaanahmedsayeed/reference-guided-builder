import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Siren, User, UserRound, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Btn, DeptGrid, MicButton, ReadBtn } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { createToken, usePrefs } from "@/lib/store";
import { speak } from "@/lib/browser";
import { deptById, type DeptId } from "@/data/departments";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";
import type { Key } from "@/i18n/en";

export const Route = createFileRoute("/register")({
  head: pageHead("Register", "Guided OPD registration in five short steps."),
  component: RegisterPage,
});

export type Draft = { name: string; age: string; gender: string; mobile: string; dept?: DeptId };
const EMPTY: Draft = { name: "", age: "", gender: "", mobile: "" };
const DKEY = "opd.draft";

export function validate(step: number, d: Draft): Key | null {
  if (step === 0 && !d.name.trim()) return "reg.nameE";
  if (step === 1) { const a = Number(d.age); if (d.age === "" || !Number.isInteger(a) || a < 0 || a > 120) return "reg.ageE"; }
  if (step === 2 && !d.gender) return "reg.genderE";
  if (step === 3 && d.mobile && !/^\d{10}$/.test(d.mobile)) return "reg.mobileE";
  if (step === 4 && !d.dept) return "reg.deptE";
  return null;
}

export function DangerPanel() {
  const { t } = useT();
  return (
    <section className="rounded-md border-2 border-primary p-4" aria-labelledby="danger-h">
      <h2 id="danger-h" className="flex items-center gap-2 text-xl text-primary"><AlertTriangle className="size-6" aria-hidden />{t("danger.title")}</h2>
      <ul className="mt-2 grid gap-x-4 sm:grid-cols-2 list-disc pl-5 text-base">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <li key={i}>{t(`danger.${i}` as Key)}</li>)}
      </ul>
      <p className="mt-3 font-bold">{t("danger.go")}</p>
      <Link to="/emergency" className="mt-3 inline-flex min-h-14 items-center gap-2 rounded-md bg-primary px-5 font-display font-bold text-primary-foreground hover:bg-primary-dark">
        <Siren className="size-5" aria-hidden />{t("danger.btn")}
      </Link>
    </section>
  );
}

const QUESTIONS: [Key, Key][] = [["reg.name", "reg.nameH"], ["reg.age", "reg.ageH"], ["reg.gender", "reg.gender"], ["reg.mobile", "reg.mobileH"], ["reg.dept", "reg.deptH"]];

function RegisterPage() {
  const { t, l, lang } = useT();
  const prefs = usePrefs();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(EMPTY);
  const [err, setErr] = useState<Key | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { const raw = sessionStorage.getItem(DKEY); if (raw) { const x = JSON.parse(raw); setD({ ...EMPTY, ...x.d }); setStep(x.step ?? 0); } } catch { /* ignore */ } }, []);
  useEffect(() => { try { sessionStorage.setItem(DKEY, JSON.stringify({ d, step })); } catch { /* ignore */ } }, [d, step]);
  useEffect(() => { inputRef.current?.focus(); setErr(null); if (prefs.read && step < 5) speak(`${t(QUESTIONS[step][0])}. ${t(QUESTIONS[step][1])}`, lang); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (p: Partial<Draft>) => { setD((x) => ({ ...x, ...p })); setErr(null); };
  const next = () => { const e = validate(step, d); if (e) { setErr(e); return; } setStep((s) => s + 1); };
  const submit = () => {
    if (lock.current) return; lock.current = true; setBusy(true);
    const token = createToken({ name: d.name.trim(), age: Number(d.age), gender: d.gender, mobile: d.mobile || undefined, dept: d.dept! });
    sessionStorage.removeItem(DKEY);
    navigate({ to: "/slip/$token", params: { token } });
  };

  const field = (key: "name" | "age" | "mobile", type: string, ph: string) => (
    <div className="flex gap-2">
      <input ref={inputRef} id="answer" type={type} inputMode={key === "name" ? "text" : "numeric"} value={d[key]} placeholder={ph}
        onChange={(e) => set({ [key]: key === "name" ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, key === "age" ? 3 : 10) })}
        onKeyDown={(e) => e.key === "Enter" && next()}
        aria-invalid={!!err} aria-describedby="hint err"
        className="min-h-14 w-full min-w-0 rounded-md border-2 border-input bg-background px-4 text-lg" />
      <MicButton onText={(s) => set({ [key]: key === "name" ? s.split(" ")[0] : s.replace(/\D/g, "") })} />
    </div>
  );

  const genders = [["male", "g.male", User], ["female", "g.female", UserRound], ["other", "g.other", Users]] as const;
  const dept = d.dept ? deptById(d.dept) : undefined;

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="eyebrow">{t("reg.title")}</p>
        <p className="font-mono text-sm">{t("reg.step", { n: Math.min(step + 1, 5), total: 5 })}</p>
      </div>
      <div className="mb-6 h-2 w-full bg-muted" aria-hidden><div className="h-2 bg-primary transition-all" style={{ width: `${(Math.min(step + 1, 5) / 5) * 100}%` }} /></div>
      {prefs.assisted && <p className="mb-4 rounded-md bg-secondary p-3 font-bold">{t("assist.on")}</p>}

      {step < 5 ? (
        <section aria-labelledby="q">
          <h1 id="q" className={cn("text-3xl sm:text-4xl", prefs.assisted && "text-4xl")}>{t(QUESTIONS[step][0])}</h1>
          {step !== 2 && <p id="hint" className="mt-2 text-muted-foreground">{step === 3 && <span className="eyebrow mr-2">{t("c.optional")}</span>}{t(QUESTIONS[step][1])}</p>}
          <div className="mt-6">
            {step === 0 && <label htmlFor="answer" className="sr-only">{t("reg.fName")}</label>}
            {step === 0 && field("name", "text", "Lakshmi")}
            {step === 1 && field("age", "text", "45")}
            {step === 2 && (
              <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label={t("reg.gender")}>
                {genders.map(([v, k, I]) => (
                  <button key={v} role="radio" aria-checked={d.gender === v} onClick={() => set({ gender: v })}
                    className={cn("tile flex min-h-28 flex-col items-center justify-center gap-2 p-3 font-display font-bold", d.gender === v ? "border-2 border-primary bg-secondary text-primary" : "hover:bg-secondary")}>
                    <I className="size-9" aria-hidden />{t(k)}
                  </button>
                ))}
              </div>
            )}
            {step === 3 && field("mobile", "tel", "98XXXXXXXX")}
            {step === 4 && <DeptGrid value={d.dept} onChange={(x) => set({ dept: x })} onNotSure={() => navigate({ to: "/find-place", search: { to: "help" } })} />}
          </div>
          <p id="err" role="alert" className="mt-3 min-h-6 font-bold text-destructive">{err ? t(err) : ""}</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Btn v="outline" onClick={() => (step === 0 ? navigate({ to: "/home" }) : setStep(step - 1))}><ArrowLeft className="size-5" aria-hidden />{t("c.back")}</Btn>
            <Btn onClick={next}>{step === 3 && !d.mobile ? t("reg.skip") : t("c.continue")}<ArrowRight className="size-5" aria-hidden /></Btn>
          </div>
          <div className="mt-4"><ReadBtn text={`${t(QUESTIONS[step][0])}. ${t(QUESTIONS[step][1])}`} /></div>
          {step === 0 && <div className="mt-8"><DangerPanel /></div>}
        </section>
      ) : (
        <section aria-labelledby="rv">
          <h1 id="rv" className="text-3xl sm:text-4xl">{t("reg.review")}</h1>
          <p className="mt-2 text-muted-foreground">{t("reg.reviewH")}</p>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {([["reg.fName", d.name, 0], ["reg.fAge", d.age, 1], ["reg.fGender", d.gender ? t(`g.${d.gender}` as Key) : "", 2], ["reg.fMobile", d.mobile || t("reg.none"), 3], ["reg.fDept", dept ? l(dept.name) : "", 4]] as const).map(([k, v, s]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><dt className="eyebrow">{t(k)}</dt><dd className="font-display text-xl font-bold">{v}</dd></div>
                <Btn v="quiet" size="sm" onClick={() => setStep(s)} aria-label={`${t("c.edit")} ${t(k)}`}>{t("c.edit")}</Btn>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Btn v="outline" onClick={() => setStep(4)}><ArrowLeft className="size-5" aria-hidden />{t("c.back")}</Btn>
            <Btn onClick={submit} disabled={busy}>{busy ? t("reg.creating") : t("reg.confirm")}</Btn>
          </div>
        </section>
      )}
    </AppShell>
  );
}
