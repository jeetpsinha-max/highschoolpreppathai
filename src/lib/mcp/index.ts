import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchSchoolsTool from "./tools/search-schools";
import getSchoolTool from "./tools/get-school";
import listSavedSchoolsTool from "./tools/list-saved-schools";
import saveSchoolTool from "./tools/save-school";
import removeSavedSchoolTool from "./tools/remove-saved-school";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "preppath-ai",
  title: "PrepPath AI",
  version: "0.1.0",
  instructions:
    "Tools for PrepPath AI, a high school discovery and application platform. Use `search_schools` and `get_school` to explore the school directory, and `list_saved_schools`, `save_school`, and `remove_saved_school` to manage the signed-in user's school list.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchSchoolsTool,
    getSchoolTool,
    listSavedSchoolsTool,
    saveSchoolTool,
    removeSavedSchoolTool,
  ],
});
