import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DocumentManager } from "@/components/DocumentManager";
import { DocumentUpload } from "@/components/DocumentUpload";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Upload, FolderOpen, CheckCircle2,
  Clock, AlertCircle, Filter
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
type FilterType = "all" | "transcripts" | "essays" | "recommendations" | "test-scores" | "other";

const CATEGORIES: { key: FilterType; label: string; icon: React.ElementType; color: string }[] = [
  { key: "all",             label: "All Documents",   icon: FolderOpen,   color: "bg-slate-100 text-slate-700"      },
  { key: "transcripts",     label: "Transcripts",     icon: FileText,     color: "bg-blue-100 text-blue-700"        },
  { key: "essays",          label: "Essays",          icon: FileText,     color: "bg-purple-100 text-purple-700"    },
  { key: "recommendations", label: "Recs",            icon: FileText,     color: "bg-green-100 text-green-700"      },
  { key: "test-scores",     label: "Test Scores",     icon: FileText,     color: "bg-amber-100 text-amber-700"      },
  { key: "other",           label: "Other",           icon: FileText,     color: "bg-muted text-muted-foreground"   },
];

const STATUS_ITEMS = [
  { icon: CheckCircle2, label: "Uploaded",    color: "text-green-500", count: 0 },
  { icon: Clock,        label: "Pending",     color: "text-amber-500", count: 0 },
  { icon: AlertCircle,  label: "Missing",     color: "text-red-500",   count: 0 },
];

/* ─── Component ─────────────────────────────────────────────── */
export default function Documents() {
  const { user, loading } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showUpload, setShowUpload]     = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />

      {/* ── Page Header ── */}
      <section className="border-b border-border bg-card/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Badge className="mb-2 bg-accent text-accent-foreground border-0">
                <FolderOpen className="h-3 w-3 mr-1.5" />
                Document Vault
              </Badge>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                My Documents
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Centralize all your application materials — transcripts, essays, recommendations, and test scores.
              </p>
            </div>
            <Button
              onClick={() => setShowUpload((v) => !v)}
              className="bg-secondary hover:bg-secondary/90 text-white gap-2 shadow-md shadow-secondary/20 shrink-0"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>

          {/* ── Status strip ── */}
          <div className="flex gap-6 mt-6">
            {STATUS_ITEMS.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upload panel (toggle) ── */}
      {showUpload && (
        <section className="border-b border-border bg-muted/40 py-6 animate-fade-in-down">
          <div className="container mx-auto px-4 max-w-2xl">
            <DocumentUpload />
          </div>
        </section>
      )}

      {/* ── Main content ── */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Category sidebar ── */}
            <aside className="lg:w-52 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" /> Categories
              </p>
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {CATEGORIES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      activeFilter === key
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* ── Document grid ── */}
            <div className="flex-1 min-w-0">
              <DocumentManager />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
