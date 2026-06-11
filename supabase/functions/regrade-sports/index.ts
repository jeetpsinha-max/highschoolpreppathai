import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin, AuthError } from "../_shared/adminAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SportProgram {
  sport: string;
  gender: string;
  grade: string;
  level?: string;
  season?: string;
  record?: string;
  stateRanking?: number;
  nationalRanking?: number;
  championships?: string[];
  highlights?: string[];
}

function gradeToNumber(grade: string): number {
  const gradeMap: Record<string, number> = {
    'A+': 4.3, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };
  return gradeMap[grade] ?? 2.0;
}

function numberToGrade(num: number): string {
  if (num >= 4.15) return 'A+';
  if (num >= 3.85) return 'A';
  if (num >= 3.5) return 'A-';
  if (num >= 3.15) return 'B+';
  if (num >= 2.85) return 'B';
  if (num >= 2.5) return 'B-';
  if (num >= 2.15) return 'C+';
  if (num >= 1.85) return 'C';
  if (num >= 1.5) return 'C-';
  if (num >= 1.15) return 'D+';
  if (num >= 0.85) return 'D';
  if (num >= 0.5) return 'D-';
  return 'F';
}

function parseRecord(record: string): { wins: number; losses: number; ties: number; winPct: number; totalGames: number } | null {
  if (!record) return null;
  const match = record.match(/(\d+)-(\d+)(?:-(\d+))?/);
  if (!match) return null;
  const wins = parseInt(match[1], 10);
  const losses = parseInt(match[2], 10);
  const ties = match[3] ? parseInt(match[3], 10) : 0;
  const totalGames = wins + losses + ties;
  if (totalGames === 0) return null;
  const winPct = (wins + ties * 0.5) / totalGames;
  return { wins, losses, ties, winPct, totalGames };
}

// Improved grading: Varsity-only, better weighting, more accurate composite
function calculateSportsGrade(allPrograms: SportProgram[]): { grade: string; score: number; breakdown: object } {
  // Filter to Varsity only
  const programs = allPrograms.filter(p => !p.level || p.level === 'Varsity');
  
  if (!programs || programs.length === 0) {
    return { grade: 'N/A', score: 0, breakdown: { reason: 'No varsity sports programs' } };
  }

  // 1. PROGRAM QUALITY (60% weight) - Average grade of all varsity programs
  const programScores: { sport: string; score: number; factors: string[] }[] = [];
  let totalProgramScore = 0;

  for (const program of programs) {
    const baseScore = gradeToNumber(program.grade || 'C');
    let adjustedScore = baseScore;
    const factors: string[] = [`Base: ${program.grade || 'C'} (${baseScore.toFixed(1)})`];

    // Record adjustment (moderate impact)
    if (program.record) {
      const parsed = parseRecord(program.record);
      if (parsed && parsed.totalGames >= 3) {
        if (parsed.winPct >= 0.85) {
          adjustedScore += 0.4;
          factors.push(`Elite record: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
        } else if (parsed.winPct >= 0.7) {
          adjustedScore += 0.2;
          factors.push(`Strong record: ${program.record}`);
        } else if (parsed.winPct >= 0.5) {
          // Neutral - no adjustment
        } else if (parsed.winPct >= 0.3) {
          adjustedScore -= 0.15;
          factors.push(`Losing record: ${program.record}`);
        } else {
          adjustedScore -= 0.3;
          factors.push(`Poor record: ${program.record}`);
        }
      }
    }

    // Clamp individual program score
    adjustedScore = Math.max(0, Math.min(4.3, adjustedScore));
    totalProgramScore += adjustedScore;

    programScores.push({
      sport: `${program.sport} (${program.gender})`,
      score: Math.round(adjustedScore * 100) / 100,
      factors
    });
  }

  const avgProgramScore = totalProgramScore / programs.length;

  // 2. COMPETITIVE EXCELLENCE (25% weight) - Rankings and championships
  let competitiveScore = 0;
  let competitiveFactors: string[] = [];

  // Count elite programs
  const nationalTop25 = programs.filter(p => p.nationalRanking && p.nationalRanking <= 25).length;
  const nationalTop100 = programs.filter(p => p.nationalRanking && p.nationalRanking <= 100).length;
  const stateTop10 = programs.filter(p => p.stateRanking && p.stateRanking <= 10).length;
  const stateTop25 = programs.filter(p => p.stateRanking && p.stateRanking <= 25).length;
  const totalChampionships = programs.reduce((sum, p) => sum + (p.championships?.length || 0), 0);

  // National rankings (strongest signal)
  if (nationalTop25 >= 3) { competitiveScore += 4.3; competitiveFactors.push(`${nationalTop25} nationally ranked top-25 programs`); }
  else if (nationalTop25 >= 1) { competitiveScore += 3.5; competitiveFactors.push(`${nationalTop25} nationally ranked top-25`); }
  else if (nationalTop100 >= 3) { competitiveScore += 3.0; competitiveFactors.push(`${nationalTop100} nationally ranked top-100`); }
  else if (nationalTop100 >= 1) { competitiveScore += 2.5; competitiveFactors.push(`${nationalTop100} nationally ranked`); }

  // State rankings
  if (stateTop10 >= 5) { competitiveScore += 4.0; competitiveFactors.push(`${stateTop10} state top-10 programs`); }
  else if (stateTop10 >= 3) { competitiveScore += 3.3; competitiveFactors.push(`${stateTop10} state top-10`); }
  else if (stateTop10 >= 1) { competitiveScore += 2.5; competitiveFactors.push(`${stateTop10} state top-10`); }
  else if (stateTop25 >= 3) { competitiveScore += 2.0; competitiveFactors.push(`${stateTop25} state top-25`); }
  else if (stateTop25 >= 1) { competitiveScore += 1.5; competitiveFactors.push(`${stateTop25} state top-25`); }
  else { competitiveScore += 1.0; competitiveFactors.push('No ranked programs'); }

  // Championships bonus
  if (totalChampionships >= 5) { competitiveScore += 0.5; competitiveFactors.push(`${totalChampionships} championships`); }
  else if (totalChampionships >= 2) { competitiveScore += 0.3; competitiveFactors.push(`${totalChampionships} championships`); }
  else if (totalChampionships >= 1) { competitiveScore += 0.15; }

  // Average and cap the competitive components
  competitiveScore = Math.min(4.3, competitiveScore / (competitiveFactors.length > 0 ? 1 : 1));
  // If no rankings data at all, use program quality as proxy
  if (nationalTop100 === 0 && stateTop25 === 0) {
    competitiveScore = avgProgramScore * 0.8; // Slightly discount when no ranking data
    competitiveFactors = ['No ranking data - estimated from program grades'];
  }

  // 3. PROGRAM BREADTH (15% weight) - Variety of sports offered
  let breadthScore: number;
  const uniqueSports = new Set(programs.map(p => p.sport)).size;
  const hasBoysAndGirls = programs.some(p => p.gender === 'Boys') && programs.some(p => p.gender === 'Girls');
  const seasonCoverage = new Set(programs.map(p => p.season)).size;

  if (uniqueSports >= 15 && hasBoysAndGirls && seasonCoverage >= 3) {
    breadthScore = 4.3;
  } else if (uniqueSports >= 12 && hasBoysAndGirls) {
    breadthScore = 3.7;
  } else if (uniqueSports >= 8) {
    breadthScore = 3.0;
  } else if (uniqueSports >= 5) {
    breadthScore = 2.3;
  } else {
    breadthScore = 1.5;
  }

  // 4. COMPOSITE SCORE with weights
  const QUALITY_WEIGHT = 0.60;
  const COMPETITIVE_WEIGHT = 0.25;
  const BREADTH_WEIGHT = 0.15;

  const compositeScore = 
    (avgProgramScore * QUALITY_WEIGHT) + 
    (competitiveScore * COMPETITIVE_WEIGHT) + 
    (breadthScore * BREADTH_WEIGHT);

  const finalScore = Math.max(0, Math.min(4.3, compositeScore));
  const finalGrade = numberToGrade(finalScore);

  return {
    grade: finalGrade,
    score: Math.round(finalScore * 100) / 100,
    breakdown: {
      varsityProgramCount: programs.length,
      uniqueSports,
      qualityScore: Math.round(avgProgramScore * 100) / 100,
      competitiveScore: Math.round(competitiveScore * 100) / 100,
      breadthScore: Math.round(breadthScore * 100) / 100,
      weights: { quality: QUALITY_WEIGHT, competitive: COMPETITIVE_WEIGHT, breadth: BREADTH_WEIGHT },
      nationalTop25,
      nationalTop100,
      stateTop10,
      stateTop25,
      totalChampionships,
      competitiveFactors,
      topPrograms: programScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schoolIds, dryRun = false } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from('enhanced_school_grades')
      .select('school_id, sports_programs');
    
    if (schoolIds && schoolIds.length > 0) {
      query = query.in('school_id', schoolIds);
    }
    
    const { data: enhanced, error: enhancedError } = await query;
    if (enhancedError) throw new Error(`Failed to fetch enhanced data: ${enhancedError.message}`);

    const withSports = (enhanced || []).filter(e => {
      const programs = e.sports_programs as SportProgram[] | null;
      return programs && Array.isArray(programs) && programs.length > 0;
    });

    if (withSports.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, message: 'No schools with sports data to regrade',
        total: 0, changed: 0, upgrades: 0, downgrades: 0, results: []
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const schoolIdList = withSports.map(e => e.school_id);
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name, sports_grade')
      .in('id', schoolIdList);
    
    const schoolMap = new Map(schools?.map(s => [s.id, s]) || []);

    const results: { 
      schoolId: string; schoolName: string; oldGrade: string | null; 
      newGrade: string; score: number; changed: boolean; breakdown: object;
    }[] = [];

    for (const record of withSports) {
      const programs = (record.sports_programs as SportProgram[]) || [];
      const school = schoolMap.get(record.school_id);
      if (!school) continue;
      
      const { grade, score, breakdown } = calculateSportsGrade(programs);
      if (grade === 'N/A') continue;
      
      const changed = school.sports_grade !== grade;
      results.push({
        schoolId: record.school_id, schoolName: school.name,
        oldGrade: school.sports_grade, newGrade: grade, score, changed, breakdown
      });

      if (!dryRun && changed) {
        const { error: updateError } = await supabase
          .from('schools')
          .update({ sports_grade: grade, updated_at: new Date().toISOString() })
          .eq('id', record.school_id);
        
        if (updateError) {
          console.error(`Failed to update ${school.name}:`, updateError.message);
        } else {
          console.log(`Updated ${school.name}: ${school.sports_grade} -> ${grade} (score: ${score})`);
        }
      }
    }

    const changedCount = results.filter(r => r.changed).length;
    const upgrades = results.filter(r => r.changed && gradeToNumber(r.newGrade) > gradeToNumber(r.oldGrade || 'F')).length;
    const downgrades = results.filter(r => r.changed && gradeToNumber(r.newGrade) < gradeToNumber(r.oldGrade || 'F')).length;

    console.log(`Regrade complete: ${results.length} schools, ${changedCount} changed (${upgrades} up, ${downgrades} down)`);

    return new Response(JSON.stringify({
      success: true, dryRun,
      message: dryRun 
        ? `Would update ${changedCount} schools (${upgrades} upgrades, ${downgrades} downgrades)`
        : `Updated ${changedCount} schools (${upgrades} upgrades, ${downgrades} downgrades)`,
      total: results.length, changed: changedCount, upgrades, downgrades,
      results: results.sort((a, b) => b.score - a.score)
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    console.error('Error in regrade-sports function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
