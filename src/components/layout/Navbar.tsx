import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Menu, X, Search, Sparkles,
  User, LogOut, Users, Shield, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { href: "/schools",        label: "Find Schools",    icon: Search  },
  { href: "/sports-rankings",label: "Sports Rankings", icon: Trophy  },
  { href: "/ai-tools",       label: "AI Tools",        icon: Sparkles },
  { href: "/about",          label: "About"                          },
  { href: "/contact",        label: "Contact"                        },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [isParent,       setIsParent]         = useState(false);
  const [isAdmin,        setIsAdmin]          = useState(false);
  const [scrolled,       setScrolled]         = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  /* ── Scroll-aware transparency ──────────────────────────── */
  const isHeroPage = location.pathname === "/";

  useEffect(() => {
    if (!isHeroPage) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHeroPage]);

  /* ── Role check ─────────────────────────────────────────── */
  useEffect(() => {
    if (user) { checkUserRoles(); }
    else { setIsParent(false); setIsAdmin(false); }
  }, [user]);

  const checkUserRoles = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (data) {
      setIsParent(data.some((r) => r.role === "parent"));
      setIsAdmin(data.some((r)  => r.role === "admin"));
    }
  };

  const dashboardLink = isParent ? "/parent-dashboard" : "/dashboard";

  /* ── Derived styles ─────────────────────────────────────── */
  const navBase = cn(
    "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
    scrolled || !isHeroPage
      ? "border-b bg-card/95 backdrop-blur-md shadow-sm"
      : "border-b border-transparent bg-transparent"
  );

  const linkColor = cn(
    "text-sm font-medium transition-colors duration-200",
    scrolled || !isHeroPage
      ? "text-muted-foreground hover:text-foreground"
      : "text-white/75 hover:text-white"
  );

  const logoColor = scrolled || !isHeroPage ? "text-primary" : "text-white";

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <nav className={navBase}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link
            to="/"
            className={cn("flex items-center gap-2 font-display font-bold text-xl shrink-0 transition-colors duration-300", logoColor)}
          >
            <GraduationCap className="h-6 w-6" />
            <span>PrepPath</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  linkColor,
                  "relative px-3 py-1.5 rounded-lg",
                  isActive(href) && "text-foreground font-semibold"
                )}
              >
                {label}
                {/* Active underline */}
                {isActive(href) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-secondary animate-scale-in" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Link to="/admin/status"><Shield className="h-3.5 w-3.5" />Admin</Link>
                  </Button>
                )}
                <Button asChild size="sm" variant="ghost" className={cn("gap-1.5", !scrolled && isHeroPage && "text-white hover:bg-white/10")}>
                  <Link to={dashboardLink}>
                    <User className="h-4 w-4" />
                    {isParent ? "Parent" : "Dashboard"}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={signOut}
                  className={cn("gap-1.5", !scrolled && isHeroPage && "text-white hover:bg-white/10")}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className={cn(!scrolled && isHeroPage && "text-white hover:bg-white/10")}
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90 text-white shadow-md shadow-secondary/25"
                >
                  <Link to="/auth">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              scrolled || !isHeroPage ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/98 backdrop-blur-md pb-4 animate-fade-in-down">
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </Link>
              ))}

              <div className="border-t border-border mt-2 pt-3 px-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                      <Link to={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-4 w-4" />{isParent ? "Parent Dashboard" : "Dashboard"}
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
                      <LogOut className="h-4 w-4" />Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-white">
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started Free</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}