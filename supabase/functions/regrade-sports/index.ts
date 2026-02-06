import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Convert letter grade to numeric value
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

// Convert numeric value back to letter grade
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

// Parse win-loss record to get win percentage
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

// Calculate sports grade based on programs data
function calculateSportsGrade(programs: SportProgram[]): { grade: string; score: number; breakdown: object } {
  if (!programs || programs.length === 0) {
    return { grade: 'N/A', score: 0, breakdown: { reason: 'No sports programs data' } };
  }

  let totalScore = 0;
  let weightedCount = 0;

  // Accumulate bonuses across all programs, then cap
  let nationalRankBonus = 0;
  let stateRankBonus = 0;
  let championshipBonus = 0;
  let recordAdjustment = 0;
  let programVarietyBonus = 0;

  const programScores: { sport: string; score: number; factors: string[] }[] = [];

  for (const program of programs) {
    const levelWeight = program.level === 'Varsity' ? 1.5 : program.level === 'JV' ? 1.0 : 0.7;
    const baseScore = gradeToNumber(program.grade || 'C');
    let programScore = baseScore;
    const factors: string[] = [`Base grade: ${program.grade || 'C'}`];

    // National ranking - ONLY reward truly elite rankings
    if (program.nationalRanking && program.nationalRanking > 0) {
      if (program.nationalRanking <= 10) {
        nationalRankBonus += 0.8;
        factors.push(`National Top 10: #${program.nationalRanking}`);
      } else if (program.nationalRanking <= 25) {
        nationalRankBonus += 0.5;
        factors.push(`National Top 25: #${program.nationalRanking}`);
      } else if (program.nationalRanking <= 50) {
        nationalRankBonus += 0.3;
        factors.push(`National Top 50: #${program.nationalRanking}`);
      } else if (program.nationalRanking <= 100) {
        nationalRankBonus += 0.1;
        factors.push(`National Top 100: #${program.nationalRanking}`);
      }
      // Rankings > 100 = no bonus (not noteworthy)
      // Rankings > 500 = slight penalty for indicating weak program
      if (program.nationalRanking > 500) {
        recordAdjustment -= 0.05;
        factors.push(`Low national rank: #${program.nationalRanking}`);
      }
    }

    // State ranking - ONLY reward truly competitive rankings
    if (program.stateRanking && program.stateRanking > 0) {
      if (program.stateRanking <= 3) {
        stateRankBonus += 0.5;
        factors.push(`State Top 3: #${program.stateRanking}`);
      } else if (program.stateRanking <= 10) {
        stateRankBonus += 0.3;
        factors.push(`State Top 10: #${program.stateRanking}`);
      } else if (program.stateRanking <= 25) {
        stateRankBonus += 0.15;
        factors.push(`State Top 25: #${program.stateRanking}`);
      } else if (program.stateRanking <= 50) {
        stateRankBonus += 0.05;
        factors.push(`State Top 50: #${program.stateRanking}`);
      }
      // Rankings > 50 = no bonus
      // Rankings > 200 = slight penalty
      if (program.stateRanking > 200) {
        recordAdjustment -= 0.03;
        factors.push(`Low state rank: #${program.stateRanking}`);
      }
    }

    // Win-loss record impact
    if (program.record) {
      const parsed = parseRecord(program.record);
      if (parsed && parsed.totalGames >= 3) {
        if (parsed.winPct >= 0.85) {
          programScore += 0.5;
          factors.push(`Dominant: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
        } else if (parsed.winPct >= 0.7) {
          programScore += 0.3;
          factors.push(`Strong: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
        } else if (parsed.winPct >= 0.55) {
          programScore += 0.1;
          factors.push(`Winning: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
        } else if (parsed.winPct >= 0.4) {
          // Slightly below .500 - minor penalty
          programScore -= 0.1;
          factors.push(`Below .500: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
        } else if (parsed.winPct >= 0.2) {
          programScore -= 0.3;
          factors.push(`Struggling: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
        } else {
          programScore -= 0.5;
          factors.push(`Very weak: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
        }
      }
    }

    // Championship bonus (per program)
    if (program.championships && program.championships.length > 0) {
      const champBonus = Math.min(program.championships.length * 0.2, 0.5);
      championshipBonus += champBonus;
      factors.push(`Championships: ${program.championships.length}`);
    }

    programScores.push({
      sport: `${program.sport} (${program.gender})`,
      score: Math.round(programScore * 100) / 100,
      factors
    });

    totalScore += programScore * levelWeight;
    weightedCount += levelWeight;
  }

  // Program variety bonus - more sports = slightly better athletics program
  if (programs.length >= 20) {
    programVarietyBonus = 0.2;
  } else if (programs.length >= 15) {
    programVarietyBonus = 0.15;
  } else if (programs.length >= 10) {
    programVarietyBonus = 0.1;
  }

  // Calculate base average
  const avgScore = weightedCount > 0 ? totalScore / weightedCount : 2.0;

  // Cap individual bonus categories before summing
  const cappedNational = Math.min(nationalRankBonus, 0.8);
  const cappedState = Math.min(stateRankBonus, 0.5);
  const cappedChampionship = Math.min(championshipBonus, 0.4);
  const cappedRecord = Math.max(-0.5, Math.min(0.3, recordAdjustment));
  
  const totalBonus = Math.min(
    cappedNational + cappedState + cappedChampionship + cappedRecord + programVarietyBonus,
    1.3 // Max total bonus
  );

  const finalScore = Math.max(0, Math.min(4.3, avgScore + totalBonus));
  const finalGrade = numberToGrade(finalScore);

  return {
    grade: finalGrade,
    score: Math.round(finalScore * 100) / 100,
    breakdown: {
      programCount: programs.length,
      avgProgramScore: Math.round(avgScore * 100) / 100,
      nationalRankBonus: Math.round(cappedNational * 100) / 100,
      stateRankBonus: Math.round(cappedState * 100) / 100,
      championshipBonus: Math.round(cappedChampionship * 100) / 100,
      recordAdjustment: Math.round(cappedRecord * 100) / 100,
      programVarietyBonus,
      totalBonus: Math.round(totalBonus * 100) / 100,
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

    // Get schools with enhanced sports data
    let query = supabase
      .from('enhanced_school_grades')
      .select('school_id, sports_programs');
    
    if (schoolIds && schoolIds.length > 0) {
      query = query.in('school_id', schoolIds);
    }
    
    const { data: enhanced, error: enhancedError } = await query;
    
    if (enhancedError) {
      throw new Error(`Failed to fetch enhanced data: ${enhancedError.message}`);
    }

    // Filter to only records that actually have sports programs
    const withSports = (enhanced || []).filter(e => {
      const programs = e.sports_programs as SportProgram[] | null;
      return programs && Array.isArray(programs) && programs.length > 0;
    });

    if (withSports.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No schools with sports data to regrade',
        total: 0, changed: 0, upgrades: 0, downgrades: 0,
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current school data
    const schoolIdList = withSports.map(e => e.school_id);
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name, sports_grade')
      .in('id', schoolIdList);
    
    const schoolMap = new Map(schools?.map(s => [s.id, s]) || []);

    const results: { 
      schoolId: string; 
      schoolName: string; 
      oldGrade: string | null; 
      newGrade: string; 
      score: number;
      changed: boolean;
      breakdown: object;
    }[] = [];

    for (const record of withSports) {
      const programs = (record.sports_programs as SportProgram[]) || [];
      const school = schoolMap.get(record.school_id);
      if (!school) continue;
      
      const { grade, score, breakdown } = calculateSportsGrade(programs);
      if (grade === 'N/A') continue;
      
      const changed = school.sports_grade !== grade;
      
      results.push({
        schoolId: record.school_id,
        schoolName: school.name,
        oldGrade: school.sports_grade,
        newGrade: grade,
        score,
        changed,
        breakdown
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
      success: true,
      dryRun,
      message: dryRun 
        ? `Would update ${changedCount} schools (${upgrades} upgrades, ${downgrades} downgrades)`
        : `Updated ${changedCount} schools (${upgrades} upgrades, ${downgrades} downgrades)`,
      total: results.length,
      changed: changedCount,
      upgrades,
      downgrades,
      results: results.sort((a, b) => b.score - a.score)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in regrade-sports function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
