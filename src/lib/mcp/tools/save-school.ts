import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "save_school",
  title: "Save a school",
  description: "Add a school to the signed-in user's saved list, optionally with a category.",
  inputSchema: {
    school_id: z.string().uuid().describe("School id to save."),
    category: z
      .string()
      .trim()
      .optional()
      .describe("Optional list category, e.g. reach, target, safety."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  handler: async ({ school_id, category }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("saved_schools")
      .insert({ user_id: ctx.getUserId(), school_id, category: category ?? null })
      .select("id,school_id,category")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { saved: data },
    };
  },
});
