import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "remove_saved_school",
  title: "Remove a saved school",
  description: "Remove a school from the signed-in user's saved list.",
  inputSchema: { school_id: z.string().uuid().describe("School id to remove.") },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  handler: async ({ school_id }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { error } = await supabase
      .from("saved_schools")
      .delete()
      .eq("user_id", ctx.getUserId())
      .eq("school_id", school_id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Removed school ${school_id} from saved list.` }] };
  },
});
