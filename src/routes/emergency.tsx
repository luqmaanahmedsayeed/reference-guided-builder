import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Phone, Siren } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Btn, PageTitle } from "@/components/kit";
import { raiseFlag } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/emergency")({
  head: pageHead("Emergency", "Urgent help at City District Hospital."),
  component: EmergencyPage,
});
function EmergencyPage() {
  const { t } = useT();
  const [sent, setSent] = useState(false);
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
        {t("emerg.title")}
      </PageTitle>
      <div className="flex flex-col gap-5">
        <div className="tile border-2 border-primary p-5">
          <div className="flex items-start gap-3">
            <Siren className="size-8 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-xl font-bold">{t("emerg.lead")}</p>
              <p className="mt-2 text-muted-foreground">{t("emerg.telNote")}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="tel:112"
            className="flex min-h-20 items-center gap-3 rounded-md bg-primary p-5 font-display text-lg font-bold text-primary-foreground"
          >
            <Phone aria-hidden />
            {t("emerg.call", { n: "112" })}
            <span className="ml-auto text-2xl">112</span>
          </a>
          <a
            href="tel:108"
            className="flex min-h-20 items-center gap-3 rounded-md border-2 border-foreground p-5 font-display text-lg font-bold"
          >
            <Phone aria-hidden />
            {t("emerg.call", { n: "108" })}
            <span className="ml-auto text-2xl">108</span>
          </a>
        </div>
        <div className="tile p-5">
          <h2 className="text-xl">{t("emerg.where")}</h2>
          <Link
            to="/find-place"
            search={{ to: "emergency" }}
            className="mt-4 inline-flex min-h-12 items-center gap-2 font-display font-bold text-primary"
          >
            <MapPin aria-hidden />
            {t("emerg.route")}
          </Link>
        </div>
        <div className="tile p-5">
          <h2 className="text-xl">{t("emerg.help")}</h2>
          <p className="mt-2 text-muted-foreground">{t("emerg.helpD")}</p>
          <Btn
            className="mt-4"
            onClick={() => {
              raiseFlag();
              setSent(true);
            }}
            disabled={sent}
          >
            {sent ? t("emerg.sent") : t("emerg.help")}
          </Btn>
        </div>
      </div>
    </AppShell>
  );
}
