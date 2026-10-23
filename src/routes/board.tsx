import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageTitle } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/board")({
  head: pageHead("Waiting-room board", "Now-serving display for the waiting room."),
  component: BoardPage,
});

function BoardPage() {
  const { t } = useT();
  return (
    <AppShell staff wide>
      <PageTitle>{t("board.title")}</PageTitle>
      <p className="text-muted-foreground">{t("c.loading")}</p>
    </AppShell>
  );
}
