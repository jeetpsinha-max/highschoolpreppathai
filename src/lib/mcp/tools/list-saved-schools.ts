import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_saved_schools",
  title: "List saved schools",
  description: "List the schools the signed-in user has saved to their list.",
  inputSchema: {
    category: z.string().trim().optional().describe("Filter by list category, e.g. reach, target, safety."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("saved_schools")
      .select("id,category,created_at,schools(id,name,city,state,type,tuition,overall_grade)")
      .eq("user_id", ctx.getUserId());
    if (category) q = q.eq("category", category);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { saved: data ?? [] },
    };
  },
});
