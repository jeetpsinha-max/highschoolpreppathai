import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Info,
  Star,
  ExternalLink,
  TrendingUp,
  Award
} from 'lucide-react';
import { useEnhancedGrades, type EnhancedSchoolData, type GradeEnhancement } from '@/hooks/useEnhancedGrades';
import { getGradeColor } from '@/lib/grading';
import type { School } from '@/types/school';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface EnhancedGradesPanelProps {
  school: School;
}

const categoryIcons: Record<string, string> = {
  academics: '📚',
  sports: '🏆',
  arts: '🎨',
  clubs: '🎯',
  diversity: '🌍',
  college_prep: '🎓',
  campus: '🏛️',
  facilities: '🔧',
  faculty: '👨‍🏫',
  dorms: '🛏️',
};

function GradeEnhancementCard({ enhancement }: { enhancement: GradeEnhancement }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{categoryIcons[enhancement.category.toLowerCase()] || '📊'}</span>
              <div className="text-left">
                <div className="font-medium capitalize">{enhancement.category.replace('_', ' ')}</div>
                <div className="text-xs text-muted-foreground">
                  Confidence: <span className={getConfidenceColor(enhancement.confidence)}>
                    {getConfidenceLabel(enhancement.confidence)} ({enhancement.confidence}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getGradeColor(enhancement.grade)}>
                {enhancement.grade}
              </Badge>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3 space-y-3">
          <Separator />
          
          <p className="text-sm text-muted-foreground">{enhancement.description}</p>
          
          {enhancement.highlights.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Highlights</div>
              <ul className="space-y-1">
                {enhancement.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {enhancement.sources.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {enhancement.sources.map((source, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {source}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Progress value={enhancement.confidence} className="h-1 flex-1" />
            <span>{enhancement.confidence}% confident</span>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function EnhancedGradesPanel({ school }: EnhancedGradesPanelProps) {
  const { enhancedData, isLoading, error, fetchEnhancedGrades } = useEnhancedGrades();

  const handleEnhance = () => {
    const currentGrades = {
      academics: school.academics_grade,
      sports: school.sports_grade,
      arts: school.arts_grade,
      clubs: school.clubs_grade,
      diversity: school.diversity_grade,
      college_prep: school.college_prep_grade,
      campus: school.campus_grade,
      facilities: school.facilities_grade,
      faculty: school.faculty_grade,
      dorms: school.dorms_grade,
    };
    
    fetchEnhancedGrades(school.id, school.name, currentGrades);
  };

  if (!enhancedData) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Enhanced Grade Analysis
          </CardTitle>
          <CardDescription>
            Get AI-powered insights with cross-referenced data from multiple sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleEnhance} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing school data...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enhance Grades with AI
              </>
            )}
          </Button>
          
          {error && (
            <div className="mt-3 p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
          
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              This feature uses AI to research and cross-reference grade data from sources like 
              Niche, PrepReview, and official school information.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Enhanced Grade Analysis
        </CardTitle>
        <CardDescription>
          AI-enhanced data cross-referenced from multiple sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Description */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm">{enhancedData.overallDescription}</p>
        </div>

        {/* Key Strengths */}
        {enhancedData.keyStrengths.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Key Strengths
            </h4>
            <ul className="space-y-1">
              {enhancedData.keyStrengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notable Programs */}
        {enhancedData.notablePrograms.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Notable Programs
            </h4>
            <div className="flex flex-wrap gap-2">
              {enhancedData.notablePrograms.map((program, i) => (
                <Badge key={i} variant="secondary">{program}</Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Grade Enhancements */}
        <div>
          <h4 className="font-semibold mb-3">Detailed Grade Analysis</h4>
          <div className="space-y-2">
            {enhancedData.gradeEnhancements.map((enhancement, i) => (
              <GradeEnhancementCard key={i} enhancement={enhancement} />
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        {enhancedData.areasForImprovement.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Areas for Growth</h4>
              <ul className="space-y-1">
                {enhancedData.areasForImprovement.map((area, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-xs mt-1">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Reputation */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-xs font-medium text-primary mb-1">Overall Reputation</div>
          <p className="text-sm">{enhancedData.reputation}</p>
        </div>

        <Button 
          variant="outline" 
          onClick={handleEnhance} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Refresh Analysis
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
