import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageTitle } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/emergency")({
  head: pageHead("Emergency", "Urgent help at City District Hospital."),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { t } = useT();
  return (
    <AppShell>
      <PageTitle>{t("emerg.title")}</PageTitle>
      <p className="text-lg">{t("emerg.lead")}</p>
    </AppShell>
  );
}
