import { Link } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-display text-xl font-bold">
                Prep<span className="text-secondary">Path</span>
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/80 max-w-xs">
              Helping students discover their perfect high school match with AI-powered tools and comprehensive school data.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/schools" className="hover:text-secondary transition-colors">Find Schools</Link></li>
              <li><Link to="/sports-rankings" className="hover:text-secondary transition-colors">Sports Rankings</Link></li>
              <li><Link to="/ai-tools" className="hover:text-secondary transition-colors">AI Tools</Link></li>
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* AI Tools */}
          <div>
            <h4 className="font-display font-semibold mb-4">AI Tools</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/ai-tools/school-matcher" className="hover:text-secondary transition-colors">School Matcher</Link></li>
              <li><Link to="/ai-tools/interview" className="hover:text-secondary transition-colors">Interview Coach</Link></li>
              <li><Link to="/ai-tools/ssat" className="hover:text-secondary transition-colors">SSAT Practice</Link></li>
              <li><Link to="/ai-tools/assistant" className="hover:text-secondary transition-colors">Application Assistant</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Get in touch</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li>
                <Link to="/contact" className="hover:text-secondary transition-colors">Contact us</Link>
              </li>
              <li>
                <Link to="/pilot" className="hover:text-secondary transition-colors">Join the pilot</Link>
              </li>
              <li>
                <Link to="/beta" className="hover:text-secondary transition-colors">Beta for schools</Link>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:jeetpsinha@gmail.com" className="hover:text-secondary transition-colors break-all">
                  jeetpsinha@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} PrepPath AI. All rights reserved.</p>
          <p className="text-xs">Built with care for students &amp; families.</p>
        </div>
      </div>
    </footer>
  );
}
