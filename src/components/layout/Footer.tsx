import { Link } from "react-router-dom";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
export function Footer() {
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-display text-xl font-bold">
                Prep<span className="text-secondary">Path</span>
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Helping students discover their perfect high school match with AI-powered tools and comprehensive school data.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/schools" className="hover:text-secondary transition-colors">
                  Find Schools
                </Link>
              </li>
              <li>
                <Link to="/ai-tools" className="hover:text-secondary transition-colors">
                  AI Tools
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/beta" className="hover:text-secondary transition-colors">
                  Beta for Schools
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Tools */}
          <div>
            <h4 className="font-display font-semibold mb-4">AI Tools</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/ai-tools/matcher" className="hover:text-secondary transition-colors">
                  School Matcher
                </Link>
              </li>
              <li>
                <Link to="/ai-tools/interview" className="hover:text-secondary transition-colors">
                  Interview Coach
                </Link>
              </li>
              <li>
                <Link to="/ai-tools/ssat" className="hover:text-secondary transition-colors">
                  SSAT Practice
                </Link>
              </li>
              <li>
                <Link to="/ai-tools/application" className="hover:text-secondary transition-colors">
                  Application Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:hello@preppath.com" className="hover:text-secondary transition-colors">
              </a>
              </li>
              
              
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} High School PrepPath. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>;
}