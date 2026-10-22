import { buildGraph, placeById } from "@/data/hospital";

const G = buildGraph();
export const graphNodes = G.nodes;

/** Dijkstra shortest path. When avoidStairs, stair edges are removed before searching. */
export function shortestPath(from: string, to: string, avoidStairs: boolean): { path: string[]; dist: number } | null {
  if (!G.adj.has(from) || !G.adj.has(to)) return null;
  const dist = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, string>();
  const done = new Set<string>();
  while (true) {
    let u: string | null = null; let best = Infinity;
    for (const [k, v] of dist) if (!done.has(k) && v < best) { best = v; u = k; }
    if (u === null) return null;
    if (u === to) break;
    done.add(u);
    for (const e of G.adj.get(u)!) {
      if (avoidStairs && e.stairs) continue;
      const nd = best + e.d;
      if (nd < (dist.get(e.to) ?? Infinity)) { dist.set(e.to, nd); prev.set(e.to, u); }
    }
  }
  const path = [to];
  while (path[0] !== from) path.unshift(prev.get(path[0])!);
  return { path, dist: Math.round(dist.get(to)!) };
}

export type Step = { kind: "start" | "walk" | "lift" | "stairs" | "ramp" | "arrive" | "same"; place?: string; floor?: number };

export function routeSteps(path: string[]): Step[] {
  if (path.length === 1) return [{ kind: "same", place: path[0] }];
  const steps: Step[] = [{ kind: "start", place: path[0] }];
  for (let i = 1; i < path.length - 1; i++) {
    const pl = placeById(path[i]); if (!pl) continue;
    const next = graphNodes.get(path[i + 1])!;
    if ((pl.type === "lift" || pl.type === "stairs") && next.floor !== pl.floor) {
      steps.push({ kind: "walk", place: pl.id });
      steps.push({ kind: pl.type, floor: next.floor });
      while (i + 1 < path.length - 1 && placeById(path[i + 1])?.type === pl.type) i++;
    } else if (pl.type === "ramp") steps.push({ kind: "ramp" });
  }
  steps.push({ kind: "arrive", place: path[path.length - 1] });
  return steps;
}
