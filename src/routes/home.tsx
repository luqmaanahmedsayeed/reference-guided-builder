import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardPlus, Ticket, MapPin, Siren, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/kit";
import { useT } from "@/lib/i18n";
import { setPrefs, usePrefs } from "@/lib/store";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";
import { Assistant } from "@/components/Assistant";

export const Route = createFileRoute("/home")({
  head: pageHead("Home", "Register, check your turn, find a place or get emergency help at City District Hospital."),
  component: HomePage,
});

function setAssistedMode(on: boolean) {
  if (typeof on !== "boolean") throw new Error("Expected true or false.");
  setPrefs(on ? { assisted: true, avoidStairs: true } : { assisted: false });
}

function HomePage() {
  const { t } = useT();
  const prefs = usePrefs();

  useWebMCP({
    name: "set_assisted_mode",
    description: "Turn assisted mode on or off. Assisted mode enlarges text, reads screens aloud and prefers step-free routes.",
    inputSchema: {
      type: "object",
      properties: {
        on: { type: "boolean", description: "True to turn assisted mode on, false to turn it off." },
      },
      required: ["on"],
    },
    execute: ({ on }: { on: boolean }) =>
      runWebMCPTool("set_assisted_mode", () => {
        setAssistedMode(on);
        return on ? "Assisted mode is on." : "Assisted mode is off.";
      }),
  });
  const tiles = [
    { to: "/register", icon: ClipboardPlus, k: "nav.register", d: "home.registerD", red: true },
    { to: "/have-slip", icon: Ticket, k: "nav.slip", d: "home.slipD" },
    { to: "/find-place", icon: MapPin, k: "nav.place", d: "home.placeD" },
    { to: "/emergency", icon: Siren, k: "nav.emergency", d: "home.emergD", alert: true },
  ] as const;
  return (
    <AppShell>
      <p className="eyebrow">{t("app.hospital")}</p>
      <h1 className="mt-1 text-4xl leading-tight sm:text-5xl">{t("home.welcome")}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t("app.tagline")}</p>
      <p className="mt-4 border-l-4 border-primary pl-3 text-base">{t("home.opd")}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {tiles.map((x) => (
          <Link key={x.to} to={x.to}
            className={cn("group flex min-h-36 flex-col justify-between rounded-md border-2 p-5 transition-colors",
              "red" in x ? "border-primary bg-primary text-primary-foreground hover:bg-primary-dark" : "alert" in x ? "border-primary bg-background hover:bg-secondary" : "border-foreground bg-background hover:bg-secondary")}>
            <x.icon className={cn("size-10", "alert" in x && "text-primary")} aria-hidden />
            <span className="mt-4">
              <span className="flex items-center justify-between font-display text-2xl font-bold">{t(x.k)} <ArrowRight className="size-6" aria-hidden /></span>
              <span className={cn("block text-base", "red" in x ? "opacity-90" : "text-muted-foreground")}>{t(x.d)}</span>
            </span>
          </Link>
        ))}
      </div>
      <Assistant />
      <div className="mt-8 border-y border-border">
        <Switch checked={prefs.assisted} label={t("assist.label")} desc={t("assist.desc")}
          onChange={setAssistedMode} />
      </div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-display text-sm font-bold">
        <Link to="/settings" className="underline underline-offset-4">{t("nav.settings")}</Link>
        <Link to="/staff" className="text-muted-foreground underline underline-offset-4">{t("home.staff")}</Link>
      </div>
    </AppShell>
  );
}
