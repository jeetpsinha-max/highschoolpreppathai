import { useSchools } from "@/hooks/useSchools";
import { MapPin, GraduationCap } from "lucide-react";

export function SchoolTicker() {
  const { data: schools, isLoading } = useSchools();

  if (isLoading || !schools?.length) {
    return null;
  }

  const featuredSchools = schools.slice(0, 20);
  const tickerItems = [...featuredSchools, ...featuredSchools];

  return (
    <div className="relative overflow-hidden bg-primary py-3 border-y border-secondary/10">
      <div className="animate-ticker flex gap-6 whitespace-nowrap">
        {tickerItems.map((school, index) => (
          <div
            key={`${school.id}-${index}`}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-primary-foreground/5 border border-primary-foreground/10"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/15 text-secondary">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm text-primary-foreground">
                {school.name}
              </span>
              <span className="text-xs text-primary-foreground/40 flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                {school.city}, {school.state}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
