import { PLACES, CORRIDOR_Y } from "@/data/hospital";
import { graphNodes } from "@/lib/route";
import { useT } from "@/lib/i18n";
import type { Key } from "@/i18n/en";

const FLOOR_IMAGES = ["/maps/ground-floor.webp", "/maps/first-floor.webp", "/maps/second-floor.webp"] as const;

export function FloorMap({ floor, path, from, to }: { floor: number; path: string[]; from: string; to?: string }) {
  const { t, l } = useT();
  const places = PLACES.filter((p) => p.floor === floor);
  const xs = places.filter((p) => !p.attach).map((p) => p.x);
  const pts = path.map((id) => graphNodes.get(id)).filter((n): n is NonNullable<typeof n> => Boolean(n && n.floor === floor));
  const floorName = t(`floor.${floor}` as Key);
  const minX = Math.min(...xs) - 25;
  const width = Math.max(...xs) - Math.min(...xs) + 50;
  return (
    <figure className="tile overflow-hidden bg-secondary p-2">
      <div className="relative overflow-hidden border border-border bg-background">
        <img src={FLOOR_IMAGES[floor as 0 | 1 | 2]} alt={`${floorName} hospital floor plan`} className="block h-auto w-full" />
        <svg viewBox="0 0 400 275" preserveAspectRatio="none" role="img" aria-label={t("map.label", { floor: floorName })} className="absolute inset-0 h-full w-full">
          <rect x={minX} y={CORRIDOR_Y - 14} width={width} height={28} fill="transparent" />
          {places.map((p) => {
            const w = p.type === "waiting" ? 62 : p.attach ? 70 : 56; const h = p.attach ? 22 : 44;
            const isFrom = p.id === from, isTo = p.id === to;
            return <g key={p.id} aria-label={l(p.name)}>
              {(isFrom || isTo) && <circle cx={p.x} cy={p.y} r={isTo ? 7 : 6} fill={isTo ? "var(--color-primary)" : "var(--color-ink)"} stroke="var(--color-background)" strokeWidth={2} />}
              <title>{l(p.name)}</title>
            </g>;
          })}
          {pts.length > 1 && <polyline points={pts.map((n) => `${n.x},${n.y}`).join(" ")} fill="none" stroke="var(--color-primary)" strokeWidth={4} strokeLinejoin="round" strokeDasharray="8 4" vectorEffect="non-scaling-stroke" />}
          {pts.map((n, i) => (i === 0 || i === pts.length - 1) && <circle key={n.id + i} cx={n.x} cy={n.y} r={5} fill={i === 0 ? "var(--color-ink)" : "var(--color-primary)"} stroke="var(--color-background)" strokeWidth={2} vectorEffect="non-scaling-stroke" />)}
        </svg>
      </div>
      <figcaption className="flex flex-wrap gap-4 px-2 pt-2 font-mono text-xs">
        <span className="flex items-center gap-1"><span className="inline-block size-3 bg-ink" />{t("legend.you")}</span>
        <span className="flex items-center gap-1"><span className="inline-block size-3 bg-primary" />{t("legend.dest")}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-1 w-5 bg-primary" />{t("legend.path")}</span>
        <span className="ml-auto">Floor plan credit: <a href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ground%20floor-iojs9wwOcK8N3kMlqnzIsc3yN6NlQD.webp" target="_blank" rel="noreferrer" className="underline underline-offset-4">ground</a>, <a href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1st%20floor-tgpcLY3INw3jn7j0ZX3tGn9PAQoZAl.webp" target="_blank" rel="noreferrer" className="underline underline-offset-4">first</a>, <a href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2nd%20floor-lJYeTE7u2bWjpNV7RhOYoOtXRbdajz.webp" target="_blank" rel="noreferrer" className="underline underline-offset-4">second</a></span>
      </figcaption>
    </figure>
  );
}
