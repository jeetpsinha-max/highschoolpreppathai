import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SaveSchoolButton } from "@/components/SaveSchoolButton";
import { getGradeColor, getOverallGradeColor, calculateOverallGrade } from "@/lib/grading";
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
} from "lucide-react";

// Get campus image - prefer DB image_url, fallback to curated Unsplash
function getCampusImageUrl(school: School & { image_url?: string | null }): string {
  if (school.image_url) return school.image_url;
  // Fallback: deterministic Unsplash image based on school name hash
  const seed = school.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const ids = [
    "1562774053-44a2aca2fb49", "1541339907198-e08756dedf3f", "1523050854058-8df90110c9f1",
    "1580537659466-0a9bfa916a54", "1607237138185-eedd9c632b0b", "1592280771190-3e2e4d571952",
    "1498243691581-b145c3f54a5a", "1519452635265-7b1fbfd1e4e0", "1564981797816-1043664bf78d",
    "1571260899304-425eee4c7efc", "1559136555-9303baea8ebd", "1574958269340-fa927503f3dd",
    "1509062522246-3755977927d7", "1562516710-724a0a39ff9a", "1544531586-fde5298cdd40",
    "1497366216548-37526070297c", "1541829070764-84a7d30dd3f3", "1551836022-d5d88e9218df",
    "1580582932707-520aed937b7b", "1576495199011-eb94736d05d4",
  ];
  return `https://images.unsplash.com/photo-${ids[seed % ids.length]}?auto=format&fit=crop&w=600&h=300&q=60`;
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
            <a href={school.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="px-3">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
