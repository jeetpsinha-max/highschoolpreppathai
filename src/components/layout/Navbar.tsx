import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Search, Sparkles, User, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
const navLinks = [{
  href: "/schools",
  label: "Find Schools",
  icon: Search
}, {
  href: "/ai-tools",
  label: "AI Tools",
  icon: Sparkles
}, {
  href: "/about",
  label: "About"
}, {
  href: "/contact",
  label: "Contact"
}];
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const location = useLocation();
  const {
    user,
    signOut
  } = useAuth();
  useEffect(() => {
    if (user) {
      checkUserRole();
    } else {
      setIsParent(false);
    }
  }, [user]);
  const checkUserRole = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'parent').maybeSingle();
    setIsParent(!!data);
  };
  const dashboardLink = isParent ? '/parent-dashboard' : '/dashboard';
  return <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md group-hover:shadow-lg transition-shadow">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Highschool PrepPath AI<span className="text-secondary">Path</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => <Link key={link.href} to={link.href} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", location.pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                {link.label}
              </Link>)}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? <>
                <Link to={dashboardLink}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    {isParent ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {isParent ? 'Parent Dashboard' : 'Dashboard'}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </> : <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="sm">Get Started</Button>
                </Link>
              </>}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map(link => <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)} className={cn("px-4 py-3 rounded-lg text-sm font-medium transition-colors", location.pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                  {link.label}
                </Link>)}
              <div className="pt-4 mt-2 border-t flex flex-col gap-2">
                {user ? <>
                    <Link to={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {isParent ? 'Parent Dashboard' : 'Dashboard'}
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}>
                      Sign Out
                    </Button>
                  </> : <>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="hero" className="w-full">Get Started</Button>
                    </Link>
                  </>}
              </div>
            </div>
          </div>}
      </div>
    </nav>;
}