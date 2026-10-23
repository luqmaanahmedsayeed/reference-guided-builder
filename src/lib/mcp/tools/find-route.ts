import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { placeById } from "@/data/hospital";
import { shortestPath, routeSteps } from "@/lib/route";

export default defineTool({
  name: "find_route",
  title: "Find a route inside the hospital",
  description:
    "Find the shortest walking route between two places in the demo hospital. Use list_places to get place IDs. Set avoidStairs for a step-free route using the lift and ramp.",
  inputSchema: {
    from: z.string().min(1).describe("Starting place ID, e.g. \"entrance\"."),
    to: z.string().min(1).describe("Destination place ID, e.g. \"room3\" or \"pharmacy\"."),
    avoidStairs: z
      .boolean()
      .optional()
      .describe("When true, the route uses the lift and ramp instead of stairs."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ from, to, avoidStairs }) => {
    const fromPlace = placeById(from);
    const toPlace = placeById(to);
    if (!fromPlace) throw new ToolError(`Unknown starting place "${from}". Use list_places to get place IDs.`);
    if (!toPlace) throw new ToolError(`Unknown destination "${to}". Use list_places to get place IDs.`);
    const result = shortestPath(from, to, avoidStairs ?? false);
    if (!result) throw new ToolError("No route found between those places.");
    const steps = routeSteps(result.path).map((s) => ({
      kind: s.kind,
      place: s.place ? (placeById(s.place)?.name.en ?? s.place) : undefined,
      floor: s.floor,
    }));
    return {
      content: [
        {
          type: "text",
          text: `Route from ${fromPlace.name.en} to ${toPlace.name.en}: about ${result.dist} metres, ${steps.length} steps${avoidStairs ? ", step-free" : ""}.`,
        },
      ],
      structuredContent: {
        from: toPlaceJson(fromPlace),
        to: toPlaceJson(toPlace),
        avoidStairs: avoidStairs ?? false,
        distanceMetres: result.dist,
        steps,
      },
    };
  },
});

const toPlaceJson = (p: NonNullable<ReturnType<typeof placeById>>) => ({
  id: p.id,
  name: p.name.en,
  floor: p.floor,
  landmark: p.lm.en,
});
