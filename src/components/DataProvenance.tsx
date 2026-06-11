import { School, FieldSource } from "@/types/school";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShieldCheck, ShieldAlert, Sparkles, ExternalLink, Info } from "lucide-react";

function formatVerified(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_META: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline"; Icon: typeof ShieldCheck }
> = {
  web_verified: { label: "Web-verified", variant: "default", Icon: ShieldCheck },
  partially_verified: { label: "Partially verified", variant: "secondary", Icon: ShieldAlert },
  unverified: { label: "Unverified", variant: "outline", Icon: ShieldAlert },
  ai_estimated: { label: "AI-estimated", variant: "outline", Icon: Sparkles },
};

/** Compact badge for cards/headers showing how data was verified. */
export function DataVerificationBadge({ school, className }: { school: School; className?: string }) {
  const status = school.verification_status || "ai_estimated";
  const meta = STATUS_META[status] ?? STATUS_META.ai_estimated;
  const verified = formatVerified(school.last_verified_at);
  const { Icon } = meta;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={meta.variant} className={`gap-1 cursor-help ${className ?? ""}`}>
            <Icon className="h-3 w-3" />
            {meta.label}
            {typeof school.data_confidence === "number" && school.data_confidence > 0 && (
              <span className="opacity-80">· {Math.round(school.data_confidence)}%</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">
            {status === "web_verified" || status === "partially_verified"
              ? "Key facts cross-referenced against live web sources."
              : "Estimated by AI — not yet cross-referenced with the web."}
          </p>
          {verified && <p className="text-xs mt-1 opacity-80">Last verified {verified}</p>}
          {school.verification_notes && (
            <p className="text-xs mt-1 opacity-80">{school.verification_notes}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface StatDef {
  key: keyof School;
  label: string;
  format: (v: number) => string;
}

const STATS: StatDef[] = [
  { key: "tuition", label: "Tuition / year", format: (v) => `$${v.toLocaleString()}` },
  { key: "acceptance_rate", label: "Acceptance rate", format: (v) => `${Math.round(v)}%` },
  { key: "enrollment", label: "Enrollment", format: (v) => v.toLocaleString() },
  { key: "founded_year", label: "Founded", format: (v) => String(v) },
];

function SourceTooltip({ source }: { source?: FieldSource }) {
  if (!source) {
    return (
      <span className="inline-flex items-center text-[10px] text-muted-foreground gap-0.5">
        <Sparkles className="h-3 w-3" /> AI estimate
      </span>
    );
  }
  const verified = formatVerified(source.verified_at);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center text-[10px] text-primary gap-0.5 cursor-help">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs font-medium">Source: {source.source || "web"}</p>
          {source.source_url && (
            <a
              href={source.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline inline-flex items-center gap-1 mt-0.5 break-all"
            >
              {source.source_url.replace(/^https?:\/\//, "").slice(0, 48)}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          )}
          <p className="text-xs mt-1 opacity-80">
            Confidence {Math.round(Number(source.confidence) || 0)}%{verified ? ` · ${verified}` : ""}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Grid of key stats with per-field provenance. */
export function VerifiedStatsGrid({ school }: { school: School }) {
  const sources = school.field_sources ?? {};
  const available = STATS.filter((s) => school[s.key] != null);
  if (available.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Info className="h-4 w-4" />
          Key Stats
        </div>
        <DataVerificationBadge school={school} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {available.map((s) => {
          const value = school[s.key] as number;
          const source = sources[s.key as string];
          return (
            <div key={String(s.key)} className="p-4 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
              <div className="font-semibold text-lg">{s.format(value)}</div>
              <div className="mt-1">
                <SourceTooltip source={source} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
