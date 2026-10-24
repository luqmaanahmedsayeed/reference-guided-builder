import { defineMcp } from "@lovable.dev/mcp-js";
import listDepartments from "./tools/list-departments";
import listPlaces from "./tools/list-places";
import findRoute from "./tools/find-route";

export default defineMcp({
  name: "reference-guided-builder",
  title: "Reference-Guided Builder",
  version: "0.1.0",
  instructions:
    "Read-only tools for the OPD Saathi demo hospital. Use list_departments for OPD departments and doctors, list_places for locations and landmarks, and find_route for directions between two places. All data is public demo data; no authentication is required.",
  tools: [listDepartments, listPlaces, findRoute],
});
