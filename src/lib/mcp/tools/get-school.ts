import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_school",
  title: "Get school profile",
  description:
    "Fetch the full profile for one school by its id, including grades, stats, and verification status.",
  inputSchema: { id: z.string().uuid().describe("School id.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data)
      return { content: [{ type: "text", text: `No school found with id ${id}` }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { school: data },
    };
  },
});
