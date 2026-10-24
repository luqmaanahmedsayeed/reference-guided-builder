import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, LocateFixed, MapPin, Search, Volume2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Btn, PageTitle, Switch } from "@/components/kit";
import { FloorMap } from "@/components/FloorMap";
import { PLACES, placeById } from "@/data/hospital";
import { shortestPath, routeSteps } from "@/lib/route";
import { useT } from "@/lib/i18n";
import { setPrefs, usePrefs } from "@/lib/store";
import { speak } from "@/lib/browser";
import { pageHead } from "@/lib/head";
import type { Key } from "@/i18n/en";

export const Route = createFileRoute("/find-place")({
  validateSearch: (s: Record<string, unknown>) => ({
    to: typeof s.to === "string" ? s.to : undefined,
  }),
  head: pageHead("Find a place", "Directions to rooms and services at City District Hospital."),
  component: FindPlacePage,
});

function FindPlacePage() {
  const { t, l, lang } = useT();
  const { to } = Route.useSearch();
  const prefs = usePrefs();
  const [from, setFrom] = useState("entrance");
  const [destination, setDestination] = useState(to && placeById(to) ? to : "help");
  const [floor, setFloor] = useState(0);
  const [query, setQuery] = useState("");
  const result = useMemo(
    () => shortestPath(from, destination, prefs.avoidStairs),
    [from, destination, prefs.avoidStairs],
  );
  const steps = result ? routeSteps(result.path) : [];
  const places = PLACES.filter((p) => p.name[lang].toLowerCase().includes(query.toLowerCase()));
  const describe = (step: (typeof steps)[number]) => {
    const place = step.place ? placeById(step.place) : undefined;
    if (step.kind === "start")
      return t("step.start", { place: place ? l(place.name) : (step.place ?? "") });
    if (step.kind === "walk")
      return t("step.walk", { place: place ? l(place.name) : "", lm: place ? l(place.lm) : "" });
    if (step.kind === "lift") return t("step.lift", { floor: t(`floor.${step.floor}` as Key) });
    if (step.kind === "stairs") return t("step.stairs", { floor: t(`floor.${step.floor}` as Key) });
    if (step.kind === "ramp") return t("step.ramp");
    if (step.kind === "same") return t("step.same", { place: place ? l(place.name) : "" });
    return t("step.arrive", { place: place ? l(place.name) : "", lm: place ? l(place.lm) : "" });
  };
  return (
    <AppShell>
      <PageTitle
        eyebrow={t("place.title")}
        aside={
          <Link to="/home" className="inline-flex items-center gap-2 font-display font-bold">
            <ArrowLeft aria-hidden />
            {t("c.back")}
          </Link>
        }
      >
        {t("place.title")}
      </PageTitle>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <section className="flex flex-col gap-4">
          <div className="tile p-4">
            <label className="eyebrow" htmlFor="place-search">
              {t("place.search")}
            </label>
            <div className="mt-2 flex items-center gap-2 border-2 border-foreground px-3">
              <Search aria-hidden />
              <input
                id="place-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-12 w-full bg-transparent outline-none"
                placeholder={t("place.search")}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 font-display font-bold">
              {t("place.from")}
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="min-h-12 border-2 border-foreground bg-background px-3"
              >
                <option value="entrance">{l(placeById("entrance")!.name)}</option>
                <option value="help">{l(placeById("help")!.name)}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 font-display font-bold">
              {t("place.to")}
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="min-h-12 border-2 border-foreground bg-background px-3"
              >
                <option value="">{t("place.choose")}</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {l(p.name)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2].map((f) => (
              <Btn
                key={f}
                v={floor === f ? "primary" : "outline"}
                size="sm"
                onClick={() => setFloor(f)}
              >
                {t(`floor.${f}` as Key)}
              </Btn>
            ))}
          </div>
          <FloorMap floor={floor} path={result?.path ?? []} from={from} to={destination} />
        </section>
        <aside className="flex flex-col gap-4">
          <div className="tile p-4">
            <Switch
              checked={prefs.avoidStairs}
              onChange={(avoidStairs) => setPrefs({ avoidStairs })}
              label={t("set.stairs")}
              desc={t("set.stairsD")}
            />
          </div>
          <div className="tile p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl">{t("place.steps")}</h2>
              {result && (
                <Btn v="quiet" size="sm" onClick={() => speak(steps.map(describe).join(" "), lang)}>
                  <Volume2 aria-hidden />
                  {t("place.listen")}
                </Btn>
              )}
            </div>
            {result ? (
              <ol className="mt-4 flex flex-col gap-3">
                {steps.map((step, i) => (
                  <li
                    key={`${step.kind}-${i}`}
                    className="flex gap-3 border-l-2 border-primary pl-3"
                  >
                    <span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span>{describe(step)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-muted-foreground">{t("place.noRoute")}</p>
            )}{" "}
            {result && (
              <p className="mt-4 font-mono text-sm">{t("place.dist", { n: result.dist })}</p>
            )}
          </div>
          <div className="tile border-2 border-primary p-5">
            <h2 className="text-xl">{t("place.lostTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{t("place.lostShow")}</p>
            <Link
              to="/find-place"
              search={{ to: "help" }}
              className="mt-4 inline-flex min-h-12 items-center gap-2 font-display font-bold text-primary"
            >
              <LocateFixed aria-hidden />
              {t("place.askStaff")}
            </Link>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
