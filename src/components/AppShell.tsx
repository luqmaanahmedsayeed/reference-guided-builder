import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, ClipboardPlus, Ticket, MapPin, Settings, Siren, LayoutDashboard, MonitorPlay, UserPlus } from "lucide-react";
import { useT, LANGS } from "@/lib/i18n";
import { setPrefs, usePrefs, type Lang } from "@/lib/store";
import { useHydrated } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const PATIENT = [
  { to: "/home", icon: Home, k: "nav.home" },
  { to: "/register", icon: ClipboardPlus, k: "nav.register" },
  { to: "/have-slip", icon: Ticket, k: "nav.slip" },
  { to: "/find-place", icon: MapPin, k: "nav.place" },
  { to: "/settings", icon: Settings, k: "nav.settings" },
] as const;
const STAFF = [
  { to: "/staff", icon: LayoutDashboard, k: "nav.staff" },
  { to: "/counter", icon: UserPlus, k: "nav.counter" },
  { to: "/board", icon: MonitorPlay, k: "nav.board" },
] as const;

export function AppShell({ children, staff, wide }: { children: ReactNode; staff?: boolean; wide?: boolean }) {
  const { t, lang } = useT();
  const prefs = usePrefs();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => { if (hydrated && !prefs.lang && !staff) navigate({ to: "/" }); }, [hydrated, prefs.lang, staff, navigate]);
  const nav = staff ? STAFF : PATIENT;
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:p-3">Skip</a>
      <p className="no-print bg-ink px-4 py-1.5 text-center font-mono text-xs text-ink-foreground">{t("app.demo")}</p>
      <header className="no-print sticky top-0 z-30 border-b-2 border-foreground bg-background">
        <div className={cn("mx-auto flex items-center gap-3 px-4 py-2", wide ? "max-w-7xl" : "max-w-5xl")}>
          <Link to="/home" className="min-w-0 font-display leading-none">
            <span className="block text-xl font-bold">OPD <span className="text-primary">Saathi</span></span>
            <span className="eyebrow hidden sm:block">{t("app.hospital")}</span>
          </Link>
          <nav aria-label="Main" className="ml-4 hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 font-display text-sm font-bold hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}>{t(n.k)}</Link>
            ))}
          </nav>
          <label className="ml-auto flex items-center">
            <span className="sr-only">{t("nav.lang")}</span>
            <select value={lang} onChange={(e) => setPrefs({ lang: e.target.value as Lang })}
              className="h-11 rounded-md border-2 border-foreground bg-background px-2 font-display text-sm font-bold">
              {LANGS.map((l) => <option key={l.id} value={l.id}>{l.native}</option>)}
            </select>
          </label>
          <Link to="/emergency" className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-3 font-display text-sm font-bold text-primary-foreground hover:bg-primary-dark">
            <Siren className="size-5" aria-hidden /><span>{t("nav.emergency")}</span>
          </Link>
        </div>
      </header>
      <main id="main" className={cn("mx-auto w-full flex-1 px-4 py-6 pb-28 md:pb-10", wide ? "max-w-7xl" : "max-w-3xl")}>{children}</main>
      <nav aria-label="Bottom" className="no-print fixed inset-x-0 bottom-0 z-30 grid border-t-2 border-foreground bg-background md:hidden"
        style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0,1fr))` }}>
        {nav.map((n) => {
          const on = pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={cn("flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-center font-display text-[0.65rem] font-bold leading-tight", on && "text-primary")}>
              <n.icon className="size-6" aria-hidden /><span className="line-clamp-2">{t(n.k)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Applies accessibility preferences to <html>. Mounted once in root. */
export function PrefsEffect() {
  const p = usePrefs();
  useEffect(() => {
    const h = document.documentElement;
    h.dataset.size = String(p.size);
    h.classList.toggle("hc", p.contrast);
    h.classList.toggle("assisted", p.assisted);
    h.lang = p.lang ?? "en";
  }, [p]);
  return null;
}
