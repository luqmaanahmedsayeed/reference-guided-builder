import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageTitle } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/counter")({
  head: pageHead("Registration counter", "Register a visitor who has no smartphone."),
  component: CounterPage,
});

function CounterPage() {
  const { t } = useT();
  return (
    <AppShell staff>
      <PageTitle>{t("counter.title")}</PageTitle>
      <p className="text-muted-foreground">{t("c.loading")}</p>
    </AppShell>
  );
}
