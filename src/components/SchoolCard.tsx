import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SaveSchoolButton } from "@/components/SaveSchoolButton";
import { getGradeColor, getOverallGradeColor, calculateOverallGrade } from "@/lib/grading";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { scoreSchoolForUser } from "@/lib/personalization";
import type { School } from "@/types/school";
import {
  MapPin,
  ExternalLink,
  GraduationCap,
  Home,
  Users,
  Trophy,
  BookOpen,
  Palette,
  UsersRound,
  Globe,
  Building2,
  Wrench,
  BedDouble,
  Star,
  DollarSign,
  Percent,
  ShieldCheck,
} from "lucide-react";

// Get campus image - prefer DB image_url, fallback to a pretty SVG initials card
function getInitials(name: string): string {
  const words = name.replace(/\b(The|of|and|at)\b/gi, "").trim().split(/\s+/);
  return words.slice(0, 3).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

function getInitialsPlaceholder(school: School): string {
  // Two brand-flavoured palettes, picked deterministically per school
  const palettes = [
    { from: "hsl(213, 56%, 23%)", to: "hsl(173, 54%, 39%)" }, // primary → teal
    { from: "hsl(173, 54%, 35%)", to: "hsl(213, 56%, 30%)" }, // teal → primary
    { from: "hsl(213, 56%, 18%)", to: "hsl(173, 54%, 45%)" },
    { from: "hsl(213, 45%, 30%)", to: "hsl(173, 60%, 35%)" },
  ];
  const seed = school.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const p = palettes[seed % palettes.length];
  const initials = getInitials(school.name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 300'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${p.from}'/>
        <stop offset='1' stop-color='${p.to}'/>
      </linearGradient>
    </defs>
    <rect width='600' height='300' fill='url(#g)'/>
    <circle cx='100' cy='240' r='120' fill='rgba(255,255,255,0.06)'/>
    <circle cx='520' cy='80' r='80' fill='rgba(255,255,255,0.08)'/>
    <text x='50%' y='50%' font-family='Poppins, system-ui, sans-serif' font-size='110' font-weight='700' fill='rgba(255,255,255,0.95)' text-anchor='middle' dominant-baseline='central' letter-spacing='4'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getCampusImageUrl(school: School & { image_url?: string | null }): string {
  if (school.image_url) return school.image_url;
  return getInitialsPlaceholder(school);
}

function getCompetitivenessColor(level: string | null) {
  switch (level) {
    case "Highly Selective":
      return "competitive";
    case "Selective":
      return "teal";
    default:
      return "secondary";
  }
}

const gradeCategories = [
  { label: "Acad", key: "academics_grade", icon: BookOpen },
  { label: "Sports", key: "sports_grade", icon: Trophy },
  { label: "Arts", key: "arts_grade", icon: Palette },
  { label: "Clubs", key: "clubs_grade", icon: UsersRound },
  { label: "Faculty", key: "faculty_grade", icon: Star },
  { label: "Campus", key: "campus_grade", icon: Building2 },
  { label: "Col Prep", key: "college_prep_grade", icon: GraduationCap },
  { label: "Diversity", key: "diversity_grade", icon: Globe },
  { label: "Facilities", key: "facilities_grade", icon: Wrench },
  { label: "Dorms", key: "dorms_grade", icon: BedDouble },
] as const;

interface SchoolCardProps {
  school: School;
}

export function SchoolCard({ school }: SchoolCardProps) {
  const overallGrade = calculateOverallGrade(school);
  const imageUrl = getCampusImageUrl(school);
  const { preferences } = useUserPreferences();
  const match = scoreSchoolForUser(school, preferences);

  // Filter to only show grades that exist
  const visibleGrades = gradeCategories.filter(
    (cat) => (school as any)[cat.key]
  );

  return (
    <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md">
      {/* Campus Image Header */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${school.name} campus`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            // Fallback to gradient if image fails
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.parentElement!.classList.add("bg-gradient-to-br", "from-primary/80", "to-secondary/80");
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Overall Grade Badge - top right */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute top-3 right-3 flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg shadow-lg border-2 border-white/30 backdrop-blur-sm ${getOverallGradeColor(overallGrade)}`}
            >
              {overallGrade}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Overall Rating</p>
          </TooltipContent>
        </Tooltip>

        {/* Save button - top left */}
        <div className="absolute top-3 left-3">
          <SaveSchoolButton schoolId={school.id} />
        </div>

        {/* For You badge - centered top */}
        {match.isMatch && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-secondary/95 text-secondary-foreground text-[10px] font-semibold px-2 py-1 rounded-full shadow-md backdrop-blur-sm cursor-default">
                <Star className="h-3 w-3 fill-current" />
                For You
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium mb-1">Why this matches you:</p>
              <ul className="text-xs space-y-0.5">
                {match.reasons.slice(0, 3).map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}

        {/* School Name & Location - bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-md">
            {school.name}
          </h3>
          <div className="flex items-center gap-1.5 text-white/90 text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {school.city}, {school.state}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Tags Row */}
        <div className="flex flex-wrap gap-1.5">
          {school.competitiveness && (
            <Badge variant={getCompetitivenessColor(school.competitiveness)} className="text-[10px]">
              {school.competitiveness}
            </Badge>
          )}
          {school.boarding && (
            <Badge variant="boarding" className="text-[10px]">
              <Home className="h-2.5 w-2.5 mr-0.5" />
              Boarding
            </Badge>
          )}
          {school.size && (
            <Badge variant="outline" className="text-[10px]">
              <Users className="h-2.5 w-2.5 mr-0.5" />
              {school.size}
            </Badge>
          )}
          {school.type && (
            <Badge variant="outline" className="text-[10px]">
              {school.type}
            </Badge>
          )}
          {school.notes?.includes("girls") && (
            <Badge variant="girls-only" className="text-[10px]">Girls</Badge>
          )}
          {school.notes?.includes("boys") && (
            <Badge variant="outline" className="text-[10px]">Boys</Badge>
          )}
          {school.notes?.includes("Catholic") && (
            <Badge variant="religious" className="text-[10px]">Catholic</Badge>
          )}
          {school.notes?.includes("Quaker") && (
            <Badge variant="religious" className="text-[10px]">Quaker</Badge>
          )}
          {school.notes?.includes("Jesuit") && (
            <Badge variant="religious" className="text-[10px]">Jesuit</Badge>
          )}
          {school.notes?.includes("STEM") && (
            <Badge variant="secondary" className="text-[10px]">STEM</Badge>
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {school.tuition != null && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {school.tuition === 0 ? "Free" : `${(school.tuition / 1000).toFixed(0)}k/yr`}
            </span>
          )}
          {school.acceptance_rate != null && (
            <span className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              {Math.round(school.acceptance_rate)}% accept
            </span>
          )}
          {school.enrollment != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {school.enrollment.toLocaleString()}
            </span>
          )}
          {(school.verification_status === "web_verified" ||
            school.verification_status === "partially_verified") && (
            <span className="flex items-center gap-1 text-primary ml-auto" title="Cross-referenced with the web">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>


        {/* Grade Grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {visibleGrades.slice(0, 10).map(({ label, key, icon: Icon }) => {
            const grade = (school as any)[key] as string | null;
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-default">
                    <div
                      className={`text-[10px] font-bold rounded-md px-1 py-1 ${getGradeColor(grade)}`}
                    >
                      {grade || "-"}
                    </div>
                    <div className="text-[8px] text-muted-foreground mt-0.5 truncate leading-tight">
                      {label}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {label}: {grade || "N/A"}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <Link to={`/schools/${school.id}`} className="flex-1">
            <Button variant="default" className="w-full" size="sm">
              View Profile
            </Button>
          </Link>
          {school.website && (
            <a
              href={school.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${school.name} website (opens in a new tab)`}
            >
              <Button variant="outline" size="sm" className="px-3" aria-label={`Visit ${school.name} website`}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
