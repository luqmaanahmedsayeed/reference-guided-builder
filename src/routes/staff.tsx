import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, RotateCcw, Siren, UserRound, UserRoundCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Btn, PageTitle } from "@/components/kit";
import { DEPARTMENTS, type DeptId } from "@/data/departments";
import {
  ackFlag,
  addSample20,
  callNext,
  completeConsult,
  deptQueue,
  markNoShow,
  moveToEnd,
  resetDemo,
  setDoctor,
  useQueue,
} from "@/lib/store";
import { useT, fmtTime } from "@/lib/i18n";
import { pageHead } from "@/lib/head";
import { StaffGate } from "@/components/StaffGate";
export const Route = createFileRoute("/staff")({
  head: pageHead("Staff dashboard", "Demo staff view of the OPD queue."),
  component: StaffPage,
});
function StaffPage() {
  const { t, l } = useT();
  const s = useQueue();
  const [dept, setDept] = useState<DeptId>("MED");
  const queue = deptQueue(s, dept);
  const current = queue.find((e) => e.status === "serving");
  const waiting = queue.filter((e) => e.status === "waiting");
  const unacked = s.flags.filter((f) => !f.ack);
  const d = DEPARTMENTS.find((x) => x.id === dept)!;
  return (
    <StaffGate>
      <AppShell staff wide>
      <PageTitle
        eyebrow={t("staff.title")}
        aside={
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value as DeptId)}
            className="min-h-12 border-2 border-foreground bg-background px-3"
          >
            {DEPARTMENTS.map((x) => (
              <option key={x.id} value={x.id}>
                {l(x.name)}
              </option>
            ))}
          </select>
        }
      >
        {t("staff.title")}
      </PageTitle>
      <div className="flex flex-col gap-5">
        <div className="tile border-2 border-foreground p-4">
          <p className="text-sm text-muted-foreground">{t("staff.warn")}</p>
        </div>
        {unacked.length > 0 && (
          <div className="tile border-2 border-primary p-5">
            <div className="flex items-center gap-3">
              <Siren className="text-primary" aria-hidden />
              <h2 className="text-xl">{t("staff.urgent")}</h2>
            </div>
            {unacked.map((f) => (
              <div
                key={f.id}
                className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"
              >
                <span>{t("staff.flagAt", { time: fmtTime(f.at) })}</span>
                <Btn size="sm" v="outline" onClick={() => ackFlag(f.id)}>
                  <Check aria-hidden />
                  {t("staff.ack")}
                </Btn>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="tile p-5">
            <p className="eyebrow">{t("turn.serving")}</p>
            <p className="token-type mt-2 text-5xl">{current?.token ?? "—"}</p>
            <p className="mt-2">{current?.name ?? t("staff.queueEmpty")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn size="sm" onClick={() => callNext(dept)}>
                <UserRoundCheck aria-hidden />
                {t("staff.call")}
              </Btn>
              <Btn size="sm" v="outline" disabled={!current} onClick={() => completeConsult(dept)}>
                {t("staff.complete")}
              </Btn>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <select
                aria-label={t("staff.status")}
                value={s.depts[dept].doctor}
                onChange={(e) =>
                  setDoctor(
                    dept,
                    e.target.value as "available" | "break" | "late",
                    e.target.value === "break" ? 15 : e.target.value === "late" ? 10 : 0,
                  )
                }
                className="min-h-11 border-2 border-foreground bg-background px-2"
              >
                <option value="available">{t("ds.available")}</option>
                <option value="break">{t("staff.break15")}</option>
                <option value="late">{t("staff.late10")}</option>
              </select>
            </div>
          </div>
          <div className="tile p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl">{t("staff.waiting")}</h2>
              <span className="font-mono">{waiting.length}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {waiting.length ? (
                waiting.map((e) => (
                  <div
                    key={e.token}
                    className="flex flex-wrap items-center gap-3 border-t border-border py-3"
                  >
                    <span className="w-24 font-mono font-bold">{e.token}</span>
                    <span className="min-w-32 flex-1">{e.name}</span>
                    <Btn size="sm" v="quiet" onClick={() => moveToEnd(e.token)}>
                      {t("staff.end")}
                    </Btn>
                    <Btn size="sm" v="outline" onClick={() => markNoShow(e.token)}>
                      {t("staff.noshow")}
                    </Btn>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">{t("staff.queueEmpty")}</p>
              )}
            </div>
          </div>
        </div>
        <div className="tile p-5">
          <h2 className="text-xl">{t("staff.demo")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn size="sm" v="outline" onClick={() => addSample20()}>
              <UserRound aria-hidden />
              {t("staff.add20")}
            </Btn>
            <Btn
              size="sm"
              v="outline"
              onClick={() => {
                if (window.confirm(t("staff.resetQ"))) resetDemo();
              }}
            >
              <RotateCcw aria-hidden />
              {t("staff.reset")}
            </Btn>
          </div>
        </div>
      </div>
      </AppShell>
    </StaffGate>
  );
}
