import { PLACES, CORRIDOR_Y } from "@/data/hospital";
import { graphNodes } from "@/lib/route";
import { useT } from "@/lib/i18n";
import type { Key } from "@/i18n/en";

export function FloorMap({ floor, path, from, to }: { floor: number; path: string[]; from: string; to?: string }) {
  const { t, l } = useT();
  const places = PLACES.filter((p) => p.floor === floor);
  const xs = places.filter((p) => !p.attach).map((p) => p.x);
  const pts = path.map((id) => graphNodes.get(id)!).filter((n) => n.floor === floor);
  const floorName = t(`floor.${floor}` as Key);
  return (
    <figure className="tile overflow-hidden bg-secondary p-2">
      <svg viewBox="0 0 400 275" role="img" aria-label={t("map.label", { floor: floorName })} className="h-auto w-full">
        <rect x={Math.min(...xs) - 25} y={CORRIDOR_Y - 14} width={Math.max(...xs) - Math.min(...xs) + 50} height={28} fill="var(--color-muted)" />
        {places.map((p) => {
          const w = p.type === "waiting" ? 62 : p.attach ? 70 : 56; const h = p.attach ? 22 : 44;
          const isFrom = p.id === from, isTo = p.id === to;
          const fill = isTo ? "var(--color-primary)" : isFrom ? "var(--color-ink)" : p.type === "emergency" ? "var(--color-background)" : "var(--color-background)";
          const fg = isTo || isFrom ? "var(--color-primary-foreground)" : "var(--color-foreground)";
          return (
            <g key={p.id}>
              <rect x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} rx={3} fill={fill}
                stroke={p.type === "emergency" ? "var(--color-primary)" : "var(--color-foreground)"} strokeWidth={p.type === "emergency" ? 2 : 1} />
              <foreignObject x={p.x - w / 2} y={p.y - h / 2} width={w} height={h}>
                <div style={{ color: fg, fontSize: 6.5, lineHeight: 1.1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 2, fontFamily: "var(--font-display)", fontWeight: 700, overflow: "hidden" }}>
                  {l(p.name)}
                </div>
              </foreignObject>
            </g>
          );
        })}
        {pts.length > 1 && (
          <polyline points={pts.map((n) => `${n.x},${n.y}`).join(" ")} fill="none" stroke="var(--color-primary)" strokeWidth={4} strokeLinejoin="round" strokeDasharray="8 4" />
        )}
        {pts.map((n, i) => (i === 0 || i === pts.length - 1) && <circle key={n.id + i} cx={n.x} cy={n.y} r={5} fill="var(--color-primary)" stroke="var(--color-background)" strokeWidth={2} />)}
      </svg>
      <figcaption className="flex flex-wrap gap-4 px-2 pt-2 font-mono text-xs">
        <span className="flex items-center gap-1"><span className="inline-block size-3 bg-ink" />{t("legend.you")}</span>
        <span className="flex items-center gap-1"><span className="inline-block size-3 bg-primary" />{t("legend.dest")}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-1 w-5 bg-primary" />{t("legend.path")}</span>
      </figcaption>
    </figure>
  );
}
