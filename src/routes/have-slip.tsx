import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, QrCode, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Btn, PageTitle } from "@/components/kit";
import { findEntry, normalizeToken, useQueue } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/have-slip")({
  head: pageHead("I have my slip", "Enter your token to see your turn."),
  component: HaveSlipPage,
});
function HaveSlipPage() {
  const { t } = useT();
  const s = useQueue();
  const navigate = useNavigate();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = normalizeToken(raw);
    if (!token) {
      setError(t("have.invalid"));
      return;
    }
    if (!findEntry(s, token)) {
      setError(t("have.unknown", { token }));
      return;
    }
    navigate({ to: "/turn/$token", params: { token } });
  };
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
        {t("have.title")}
      </PageTitle>
      <div className="mx-auto max-w-xl">
        <form onSubmit={submit} className="tile p-5">
          <label htmlFor="token" className="font-display text-lg font-bold">
            {t("have.label")}
          </label>
          <p className="mt-1 text-sm text-muted-foreground">{t("have.ph")}</p>
          <input
            id="token"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setError("");
            }}
            className="mt-4 min-h-14 w-full border-2 border-foreground bg-background px-4 font-mono text-xl uppercase"
            placeholder="MED-042"
            autoComplete="off"
          />
          {error && (
            <p role="alert" className="mt-3 font-bold text-primary">
              {error}
            </p>
          )}
          <Btn type="submit" className="mt-4 w-full">
            <Search aria-hidden />
            {t("have.find")}
          </Btn>
        </form>
        <div className="mt-5 tile p-5">
          <div className="flex items-start gap-3">
            <QrCode className="size-7 text-primary" aria-hidden />
            <div>
              <h2 className="text-xl">{t("have.scan")}</h2>
              <p className="mt-2 text-muted-foreground">{t("have.denied")}</p>
              <p className="mt-3 text-sm">
                {t("have.or")}: {t("have.label")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
