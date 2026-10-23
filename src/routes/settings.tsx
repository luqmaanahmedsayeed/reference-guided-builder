import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTitle, Switch } from "@/components/kit";
import { LANGS, useT } from "@/lib/i18n";
import { setPrefs, usePrefs, type Lang } from "@/lib/store";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/settings")({
  head: pageHead("Settings", "Language, text size and accessibility settings."),
  component: SettingsPage,
});
function SettingsPage() {
  const { t } = useT();
  const prefs = usePrefs();
  return (
    <AppShell>
      <PageTitle
        aside={
          <Link to="/home" className="inline-flex items-center gap-2 font-display font-bold">
            <ArrowLeft aria-hidden />
            {t("c.back")}
          </Link>
        }
      >
        {t("set.title")}
      </PageTitle>
      <div className="flex flex-col gap-5">
        <section className="tile p-5">
          <h2 className="text-xl">{t("set.lang")}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setPrefs({ lang: l.id })}
                aria-pressed={prefs.lang === l.id}
                className={`min-h-14 border-2 px-4 text-left font-display font-bold ${prefs.lang === l.id ? "border-primary bg-secondary" : "border-foreground"}`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </section>
        <section className="tile p-5">
          <h2 className="text-xl">{t("set.size")}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {([0, 1, 2] as const).map((size) => (
              <button
                key={size}
                onClick={() => setPrefs({ size })}
                aria-pressed={prefs.size === size}
                className={`min-h-14 border-2 px-4 text-left font-display font-bold ${prefs.size === size ? "border-primary bg-secondary" : "border-foreground"}`}
              >
                {t(`size.${size}` as "size.0" | "size.1" | "size.2")}
              </button>
            ))}
          </div>
        </section>
        <section className="tile divide-y divide-border p-5">
          <Switch
            checked={prefs.contrast}
            onChange={(contrast) => setPrefs({ contrast })}
            label={t("set.contrast")}
            desc={t("set.contrastD")}
          />
          <Switch
            checked={prefs.read}
            onChange={(read) => setPrefs({ read })}
            label={t("set.read")}
            desc={t("set.readD")}
          />
          <Switch
            checked={prefs.avoidStairs}
            onChange={(avoidStairs) => setPrefs({ avoidStairs })}
            label={t("set.stairs")}
            desc={t("set.stairsD")}
          />
        </section>
        <p className="text-sm text-muted-foreground">{t("set.saved")}</p>
      </div>
    </AppShell>
  );
}
