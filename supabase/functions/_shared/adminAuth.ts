import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Thrown when the caller is not an authenticated admin. Carries an HTTP status. */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Verify the request comes from an authenticated user with the `admin` role.
 *
 * These functions run with `verify_jwt = false` and use the service-role key,
 * so they MUST gate destructive/expensive work themselves. We read the caller's
 * JWT from the Authorization header, resolve the user with the anon client, then
 * confirm the `admin` role via the service-role client (bypassing RLS safely).
 *
 * @returns the authenticated admin user's id.
 * @throws {AuthError} 401 when unauthenticated, 403 when not an admin.
 */
export async function requireAdmin(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new AuthError("Missing authorization token", 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userData?.user) {
    throw new AuthError("Invalid or expired session", 401);
  }

  const userId = userData.user.id;
  const admin = createClient(url, serviceKey);
  const { data: roleRow, error: roleErr } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleErr) throw new AuthError("Failed to verify permissions", 500);
  if (!roleRow) throw new AuthError("Admin access required", 403);

  return userId;
}
