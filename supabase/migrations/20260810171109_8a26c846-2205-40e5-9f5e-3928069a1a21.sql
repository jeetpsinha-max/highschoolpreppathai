-- Trigger-only: fires as the table owner on auth.users INSERT, so no role
-- ever needs to invoke it directly.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- RLS helper + parent linking: signed-in users only, never anonymous visitors.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.link_parent_to_student(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_parent_to_student(text) TO authenticated, service_role;