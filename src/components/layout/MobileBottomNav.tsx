import { NavLink } from "react-router-dom";
import { Search, Trophy, Sparkles, LayoutDashboard, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { href: "/", label: "Home", icon: Home, end: true },
  { href: "/schools", label: "Schools", icon: Search },
  { href: "/sports-rankings", label: "Sports", icon: Trophy },
  { href: "/ai-tools", label: "AI", icon: Sparkles },
];

/**
 * Mobile-only bottom navigation. Hidden on md+ screens.
 * Adds bottom padding to body via spacer in pages, or rely on pb-20 on main containers.
 */
export function MobileBottomNav() {
  const { user } = useAuth();
  const [isParent, setIsParent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsParent(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setIsParent(!!data?.some((r) => r.role === "parent"));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const dashboardHref = isParent ? "/parent-dashboard" : "/dashboard";

  const navItems = user
    ? [...items, { href: dashboardHref, label: "Me", icon: LayoutDashboard }]
    : items;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      aria-label="Bottom navigation"
    >
      <div className={cn("grid", user ? "grid-cols-5" : "grid-cols-4")}>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={(item as any).end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors min-h-[56px]",
                isActive
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate max-w-full">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
