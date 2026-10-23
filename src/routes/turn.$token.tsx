import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BellRing, MapPin, MessageSquare, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Btn, btn } from "@/components/kit";
import { NotFoundToken } from "./slip.$token";
import { useT, fmtTime } from "@/lib/i18n";
import { clearAlerted, deptQueue, doctorDelay, etaFor, findEntry, markAlerted, peopleAhead, serving, useQueue } from "@/lib/store";
import { beep } from "@/lib/browser";
import { deptById } from "@/data/departments";
import { placeById } from "@/data/hospital";
import { pageHead } from "@/lib/head";
import type { Key } from "@/i18n/en";

export const Route = createFileRoute("/turn/$token")({
  head: pageHead("My turn", "Live queue position, waiting time and doctor status."),
  component: TurnPage,
});

function TurnPage() {
  const { token } = Route.useParams();
  const { t, l } = useT();
  const s = useQueue();
  const [now, setNow] = useState(() => Date.now());
  const [perm, setPerm] = useState<string>("default");
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); setPerm("Notification" in window ? Notification.permission : "unsupported"); return () => clearInterval(i); }, []);
  const e = findEntry(s, token);
  const ahead = e ? peopleAhead(s, token) : 0;
  const dept = e ? deptById(e.dept)! : null;
  const room = dept ? placeById(dept.placeId)! : null;
  const floor = room ? t(`floor.${room.floor}` as Key) : "";
  const alerted = s.alerted.includes(token);
  const show3 = !!e && e.status === "waiting" && ahead <= 3 && ahead > 0;

  // Fire once per token when crossing into 3-ahead.
  useEffect(() => {
    if (!e || !dept || e.status !== "waiting" || ahead !== 3 || alerted) return;
    markAlerted(token);
    beep(880, 300); setTimeout(() => beep(660, 300), 350);
    navigator.vibrate?.([300, 150, 300]);
    if ("Notification" in window && Notification.permission === "granted") new Notification("OPD Saathi", { body: t("turn.alert3", { room: dept.room }) });
  }, [ahead, alerted, e?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!e || !dept || !room) return <AppShell><NotFoundToken /></AppShell>;
  const cur = serving(s, e.dept);
  const ds = s.depts[e.dept];
  const delay = doctorDelay(s, e.dept, now);
  const docText = ds.doctor === "available" || (ds.doctor === "break" && delay === 0) ? t("ds.available") : ds.doctor === "break" ? t("ds.break", { time: fmtTime(ds.breakUntil!) }) : t("ds.late", { n: ds.lateBy });
  const q = deptQueue(s, e.dept).slice(0, Math.max(ahead + 3, 5));

  return (
    <AppShell>
      <p className="eyebrow">{t("turn.title")} · {l(dept.name)}</p>
      <p className="token-type text-6xl">{token}</p>

      <div aria-live="polite">
        {e.status === "serving" && (
          <div className="mt-5 rounded-md bg-primary p-5 text-primary-foreground">
            <p className="flex items-center gap-2 font-display text-3xl font-bold"><BellRing className="size-8" aria-hidden />{t("turn.called", { room: dept.room })}</p>
            <Link to="/find-place" search={{ to: dept.placeId }} className={btn({ v: "ink", className: "mt-4" })}><MapPin className="size-5" aria-hidden />{t("turn.route", { room: dept.room })}</Link>
          </div>
        )}
        {show3 && (
          <div className="mt-5 rounded-md border-4 border-primary p-5">
            <p className="flex items-center gap-2 font-display text-2xl font-bold text-primary"><BellRing className="size-7 shrink-0" aria-hidden />{t("turn.alert3", { room: dept.room })}</p>
            <div className="mt-4 rounded-md bg-secondary p-3">
              <p className="eyebrow flex items-center gap-1"><MessageSquare className="size-4" aria-hidden />{t("turn.sms")}</p>
              <p className="mt-1 font-mono text-sm">{t("turn.smsText", { token, room: dept.room, floor })}</p>
            </div>
          </div>
        )}
        {e.status === "done" && <p className="mt-5 flex items-center gap-2 rounded-md bg-secondary p-5 font-display text-xl font-bold"><CheckCircle2 className="size-7 text-ok" aria-hidden />{t("turn.done")}</p>}
        {e.status === "noshow" && <p className="mt-5 rounded-md border-2 border-primary p-5 font-display text-xl font-bold">{t("turn.noshow")}</p>}
      </div>

      {(e.status === "waiting") && (
        <div className="mt-6 grid gap-px overflow-hidden rounded-md border-2 border-foreground bg-foreground sm:grid-cols-2">
          <div className="bg-background p-4"><p className="eyebrow">{t("turn.place")}</p><p className="font-display text-3xl font-bold">{ahead === 0 ? t("turn.ahead0") : ahead === 1 ? t("turn.ahead1") : t("turn.ahead", { n: ahead })}</p></div>
          <div className="bg-background p-4"><p className="eyebrow">{t("turn.wait")}</p><p className="font-display text-3xl font-bold">{t("c.about", { n: etaFor(s, token, now) })}</p></div>
          <div className="bg-background p-4"><p className="eyebrow">{t("turn.serving")}</p><p className="token-type text-3xl">{cur?.token ?? "—"}</p></div>
          <div className="bg-background p-4"><p className="eyebrow">{t("turn.doctor")} · {dept.doctor}</p><p className="font-display text-xl font-bold">{docText}</p></div>
        </div>
      )}

      <ol className="mt-6 border-l-2 border-foreground pl-4" aria-label={t("turn.place")}>
        {q.map((x) => (
          <li key={x.token} className={x.token === token ? "py-1 font-bold text-primary" : "py-1"}>
            <span className="token-type mr-3">{x.token}</span><span className="text-sm">{x.status === "serving" ? t("turn.serving") : x.token === token ? "← " + t("turn.title") : ""}</span>
          </li>
        ))}
      </ol>

      {e.status === "waiting" && (
        <div className="mt-6 tile bg-secondary p-4"><p className="eyebrow">{t("turn.next")}</p><p className="mt-1">{t("turn.nextWait")}</p></div>
      )}
      <Link to="/find-place" search={{ to: dept.placeId }} className={btn({ size: "lg", className: "mt-4 w-full" })}><MapPin className="size-5" aria-hidden />{t("turn.route", { room: dept.room })}</Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {perm === "granted" ? <p className="text-sm">{t("turn.enabled")}</p> : perm === "default" ? (
          <Btn v="outline" size="sm" onClick={async () => setPerm(await Notification.requestPermission())}>{t("turn.enable")}</Btn>
        ) : <p className="text-sm text-muted-foreground">{t("turn.blocked")}</p>}
        {alerted && <Btn v="ghost" size="sm" onClick={() => clearAlerted(token)}>{t("turn.resetAlert")}</Btn>}
      </div>
      <p className="eyebrow mt-4">{t("turn.updated", { time: fmtTime(s.updatedAt) })}</p>
    </AppShell>
  );
}
