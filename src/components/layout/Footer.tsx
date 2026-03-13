import { Link } from "react-router-dom";
import { GraduationCap, Mail, ArrowRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="section-dark">
      {/* Gold accent line at top */}
      <div className="h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand - wider column */}
          <div className="md:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary shadow-gold">
                <GraduationCap className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-bold text-primary-foreground">
                  PrepPath
                </span>
                <span className="text-[10px] font-medium text-secondary tracking-[0.2em] uppercase">
                  AI Admissions
                </span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
              AI-powered tools to discover, match, and apply to the nation's top
              private, boarding, and selective high schools.
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h4 className="font-display font-semibold text-sm text-secondary mb-4 tracking-wide uppercase">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/schools", label: "Find Schools" },
                { to: "/sports-rankings", label: "Rankings" },
                { to: "/about", label: "About Us" },
                { to: "/beta", label: "Beta Program" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/50 hover:text-secondary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Tools */}
          <div className="md:col-span-3">
            <h4 className="font-display font-semibold text-sm text-secondary mb-4 tracking-wide uppercase">
              AI Tools
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/ai-tools/school-matcher", label: "School Matcher" },
                { to: "/ai-tools/interview", label: "Interview Coach" },
                { to: "/ai-tools/ssat", label: "SSAT Practice" },
                { to: "/ai-tools/assistant", label: "Application Assistant" },
                { to: "/ai-tools/improve", label: "Improve Chances" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/50 hover:text-secondary transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="font-display font-semibold text-sm text-secondary mb-4 tracking-wide uppercase">
              Contact
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:jeetpsinha@gmail.com"
                className="flex items-center gap-2 text-primary-foreground/50 hover:text-secondary transition-colors"
              >
                <Mail className="h-4 w-4" />
                jeetpsinha@gmail.com
              </a>
            </div>

            {/* CTA */}
            <div className="mt-8 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-xs text-primary-foreground/60 mb-3">
                Ready to find your path?
              </p>
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-gold-light transition-colors"
              >
                Get Started Free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/30">
            © {currentYear} PrepPath AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-primary-foreground/30">
            <Link
              to="/privacy"
              className="hover:text-secondary transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-secondary transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
