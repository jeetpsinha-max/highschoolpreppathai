import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

const SELECT =
  "id,name,city,state,type,boarding,admission_type,tuition,acceptance_rate,enrollment,overall_grade,overall_score,website";

export default defineTool({
  name: "search_schools",
  title: "Search schools",
  description:
    "Search the high school directory by name, city, state, type, boarding status, and max tuition.",
  inputSchema: {
    query: z.string().trim().optional().describe("Text to match against the school name."),
    state: z.string().trim().length(2).optional().describe("Two-letter US state code, e.g. NY."),
    city: z.string().trim().optional().describe("City name."),
    type: z.string().trim().optional().describe("School type, e.g. Private, Magnet, Boarding."),
    boarding: z.boolean().optional().describe("Only boarding schools when true."),
    maxTuition: z.number().positive().optional().describe("Maximum annual tuition in USD."),
    limit: z.number().int().min(1).max(50).default(10).describe("Max results to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, state, city, type, boarding, maxTuition, limit }) => {
    const supabase = supabaseAnon();
    let q = supabase.from("schools").select(SELECT);
    if (query) q = q.ilike("name", `%${query}%`);
    if (state) q = q.ilike("state", state);
    if (city) q = q.ilike("city", `%${city}%`);
    if (type) q = q.ilike("type", `%${type}%`);
    if (typeof boarding === "boolean") q = q.eq("boarding", boarding);
    if (maxTuition) q = q.lte("tuition", maxTuition);
    const { data, error } = await q
      .order("overall_score", { ascending: false, nullsFirst: false })
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { schools: data ?? [] },
    };
  },
});
