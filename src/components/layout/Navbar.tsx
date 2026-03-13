import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Search, Sparkles, User, LogOut, Users, Shield, Trophy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const mainLinks = [
  { href: "/schools", label: "Schools", icon: Search },
  { href: "/sports-rankings", label: "Rankings", icon: Trophy },
  { href: "/ai-tools", label: "AI Tools", icon: Sparkles },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      checkUserRoles();
    } else {
      setIsParent(false);
      setIsAdmin(false);
    }
  }, [user]);

  const checkUserRoles = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (data) {
      setIsParent(data.some((r) => r.role === "parent"));
      setIsAdmin(data.some((r) => r.role === "admin"));
    }
  };

  const dashboardLink = isParent ? "/parent-dashboard" : "/dashboard";
  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-primary/98 backdrop-blur-lg shadow-lg border-b border-secondary/10"
          : "bg-primary border-b border-primary-foreground/10"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shadow-gold group-hover:shadow-glow transition-shadow duration-300">
              <GraduationCap className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold text-primary-foreground tracking-tight">
                PrepPath
              </span>
              <span className="text-[10px] font-medium text-secondary tracking-[0.2em] uppercase">
                AI Admissions
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "text-secondary bg-secondary/10"
                    : "text-primary-foreground/70 hover:text-secondary hover:bg-secondary/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin/status">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-secondary hover:text-secondary hover:bg-secondary/10"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to={dashboardLink}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    {isParent ? (
                      <Users className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                    {isParent ? "Parent" : "Dashboard"}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="gap-1.5 text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="secondary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/10 animate-fade-in">
            <div className="flex flex-col gap-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-secondary/10 text-secondary"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-primary-foreground/10 flex flex-col gap-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin/status"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 text-secondary"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Link
                      to={dashboardLink}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="secondary" className="w-full">
                        {isParent ? "Parent Dashboard" : "Dashboard"}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="text-primary-foreground/50 hover:text-primary-foreground"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full text-primary-foreground/70"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="secondary" className="w-full">
                        Get Started
                      </Button>
                    </Link>
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
