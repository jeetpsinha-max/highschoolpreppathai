import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSavedSchools, useSaveSchool, useUnsaveSchool } from "@/hooks/useSavedSchools";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SaveSchoolButtonProps {
  schoolId: string;
  variant?: "icon" | "full";
  className?: string;
}

export function SaveSchoolButton({ schoolId, variant = "icon", className }: SaveSchoolButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: savedSchools } = useSavedSchools();
  const saveSchool = useSaveSchool();
  const unsaveSchool = useUnsaveSchool();

  const isSaved = savedSchools?.some((s) => s.school_id === schoolId) ?? false;
  const isLoading = saveSchool.isPending || unsaveSchool.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/auth");
      return;
    }

    if (isSaved) {
      unsaveSchool.mutate(schoolId);
    } else {
      saveSchool.mutate({ schoolId });
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isLoading}
        className={cn("h-8 w-8", className)}
        title={isSaved ? "Remove from saved" : "Save school"}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isSaved ? "secondary" : "outline"}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      <Heart
        className={cn(
          "mr-2 h-4 w-4",
          isSaved ? "fill-red-500 text-red-500" : ""
        )}
      />
      {isSaved ? "Saved" : "Save School"}
    </Button>
  );
}
