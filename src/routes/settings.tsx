import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageTitle } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/settings")({
  head: pageHead("Settings", "Language, text size and accessibility settings."),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useT();
  return (
    <AppShell>
      <PageTitle>{t("set.title")}</PageTitle>
      <p className="text-muted-foreground">{t("c.loading")}</p>
    </AppShell>
  );
}
