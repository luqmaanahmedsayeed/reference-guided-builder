import { defineTool } from "@lovable.dev/mcp-js";
import { DEPARTMENTS, OPD_HOURS } from "@/data/departments";

const toDeptJson = (d: (typeof DEPARTMENTS)[number]) => ({
  id: d.id,
  name: d.name.en,
  description: d.desc.en,
  room: d.room,
  doctor: d.doctor,
  avgMinutesPerPatient: d.avgMin,
  seats: d.seats,
});

export default defineTool({
  name: "list_departments",
  title: "List OPD departments",
  description:
    "List the outpatient departments of the demo hospital, with the doctor on duty, room number, average minutes per patient, and OPD hours.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: `${DEPARTMENTS.length} OPD departments. OPD hours ${OPD_HOURS.start}–${OPD_HOURS.end}.`,
      },
    ],
    structuredContent: {
      opdHours: { start: OPD_HOURS.start, end: OPD_HOURS.end },
      departments: DEPARTMENTS.map(toDeptJson),
    },
  }),
});
