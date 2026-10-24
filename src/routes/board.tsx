import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Siren } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTitle } from "@/components/kit";
import { DEPARTMENTS } from "@/data/departments";
import { deptQueue, useQueue } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/board")({
  head: pageHead("Waiting-room board", "Now-serving display for the waiting room."),
  component: BoardPage,
});
function BoardPage() {
  const { t, l } = useT();
  const s = useQueue();
  const urgent = s.flags.some((f) => !f.ack);
  return (
    <AppShell staff wide>
      <PageTitle
        aside={
          <Link to="/staff" className="inline-flex items-center gap-2 font-display font-bold">
            <ArrowLeft aria-hidden />
            {t("c.back")}
          </Link>
        }
      >
        {t("board.title")}
      </PageTitle>
      {urgent && (
        <div className="mb-5 flex items-center gap-3 bg-primary p-4 text-lg font-bold text-primary-foreground">
          <Siren aria-hidden />
          {t("board.urgent")}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((d) => {
          const q = deptQueue(s, d.id);
          const now = q.find((e) => e.status === "serving");
          const next = q.find((e) => e.status === "waiting");
          return (
            <article key={d.id} className="tile p-5">
              <p className="eyebrow">{l(d.name)}</p>
              <p className="mt-3 font-mono text-5xl font-bold text-primary">{now?.token ?? "—"}</p>
              <p className="mt-3 text-sm text-muted-foreground">{t("board.now")}</p>
              <div className="mt-4 border-t-2 border-foreground pt-3">
                <span className="font-display font-bold">{t("board.next")}: </span>
                <span className="font-mono text-xl">{next?.token ?? "—"}</span>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
