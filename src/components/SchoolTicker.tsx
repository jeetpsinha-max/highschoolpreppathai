import { useSchools } from "@/hooks/useSchools";
import { MapPin, GraduationCap } from "lucide-react";

export function SchoolTicker() {
  const { data: schools, isLoading } = useSchools();

  if (isLoading || !schools?.length) {
    return null;
  }

  // Take a subset of schools for the ticker
  const featuredSchools = schools.slice(0, 20);
  // Duplicate for seamless loop
  const tickerItems = [...featuredSchools, ...featuredSchools];

  return (
    <div className="relative overflow-hidden bg-primary/5 py-4 border-y border-border/50">
      <div className="animate-ticker flex gap-8 whitespace-nowrap">
        {tickerItems.map((school, index) => (
          <div
            key={`${school.id}-${index}`}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-background/80 border border-border/50 shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm text-foreground">{school.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {school.city}, {school.state}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
