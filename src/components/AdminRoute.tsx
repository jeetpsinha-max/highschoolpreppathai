import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Gate a route behind the `admin` role. Unauthenticated users are sent to /auth,
 * authenticated non-admins are sent to their dashboard.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading } = useUserRole();
  const location = useLocation();

  if (authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasRole("admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
