import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageTitle } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/find-place")({
  validateSearch: (s: Record<string, unknown>) => ({ to: typeof s.to === "string" ? s.to : undefined }),
  head: pageHead("Find a place", "Directions to rooms and services at City District Hospital."),
  component: FindPlacePage,
});

function FindPlacePage() {
  const { t } = useT();
  return (
    <AppShell>
      <PageTitle>{t("place.title")}</PageTitle>
      <p className="text-muted-foreground">{t("c.loading")}</p>
    </AppShell>
  );
}
