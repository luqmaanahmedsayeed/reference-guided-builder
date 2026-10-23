import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageTitle } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/have-slip")({
  head: pageHead("I have my slip", "Enter your token to see your turn."),
  component: HaveSlipPage,
});

function HaveSlipPage() {
  const { t } = useT();
  return (
    <AppShell>
      <PageTitle>{t("have.title")}</PageTitle>
      <p className="text-muted-foreground">{t("c.loading")}</p>
    </AppShell>
  );
}
