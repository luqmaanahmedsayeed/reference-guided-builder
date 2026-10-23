import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageTitle } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/staff")({
  head: pageHead("Staff dashboard", "Demo staff view of the OPD queue."),
  component: StaffPage,
});

function StaffPage() {
  const { t } = useT();
  return (
    <AppShell staff wide>
      <PageTitle>{t("staff.title")}</PageTitle>
      <p className="text-muted-foreground">{t("c.loading")}</p>
    </AppShell>
  );
}
