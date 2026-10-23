import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PLACES } from "@/data/hospital";

const toPlaceJson = (p: (typeof PLACES)[number]) => ({
  id: p.id,
  name: p.name.en,
  type: p.type,
  floor: p.floor,
  landmark: p.lm.en,
});

export default defineTool({
  name: "list_places",
  title: "List hospital places",
  description:
    "List the demo hospital's places — entrances, counters, services, rooms, waiting halls and facilities — with floor and a plain-language landmark. Optionally filter by floor (0, 1 or 2).",
  inputSchema: {
    floor: z
      .number()
      .int()
      .min(0)
      .max(2)
      .optional()
      .describe("Floor to filter by: 0 (ground), 1 (first) or 2 (second). Omit for all floors."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ floor }) => {
    const places = floor === undefined ? PLACES : PLACES.filter((p) => p.floor === floor);
    return {
      content: [
        {
          type: "text",
          text: `${places.length} place${places.length === 1 ? "" : "s"}${floor === undefined ? "" : ` on floor ${floor}`}.`,
        },
      ],
      structuredContent: { places: places.map(toPlaceJson) },
    };
  },
});
