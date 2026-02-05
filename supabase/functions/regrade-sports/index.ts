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
   return gradeMap[grade] ?? 2.0; // Default to C if unknown
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
 function parseRecord(record: string): { wins: number; losses: number; ties: number; winPct: number } | null {
   if (!record) return null;
   
   // Match patterns like "18-8", "9-4-1", "12-10 (2022-2023)"
   const match = record.match(/(\d+)-(\d+)(?:-(\d+))?/);
   if (!match) return null;
   
   const wins = parseInt(match[1], 10);
   const losses = parseInt(match[2], 10);
   const ties = match[3] ? parseInt(match[3], 10) : 0;
   const total = wins + losses + ties;
   
   if (total === 0) return null;
   
   // Ties count as half a win
   const winPct = (wins + ties * 0.5) / total;
   return { wins, losses, ties, winPct };
 }
 
 // Calculate sports grade based on programs data
 function calculateSportsGrade(programs: SportProgram[]): { grade: string; score: number; breakdown: object } {
   if (!programs || programs.length === 0) {
     return { grade: 'N/A', score: 0, breakdown: { reason: 'No sports programs data' } };
   }
   
   let totalScore = 0;
   let weightedCount = 0;
   
   // Ranking bonuses
   let nationalRankBonus = 0;
   let stateRankBonus = 0;
   let championshipBonus = 0;
   let recordBonus = 0;
   
   const programScores: { sport: string; score: number; factors: string[] }[] = [];
   
   for (const program of programs) {
     // Only count varsity programs more heavily
     const levelWeight = program.level === 'Varsity' ? 1.5 : 1.0;
     
     // Base score from program grade
     const baseScore = gradeToNumber(program.grade || 'C');
     let programScore = baseScore;
     const factors: string[] = [`Base grade: ${program.grade || 'C'}`];
     
     // National ranking bonus (huge boost for being nationally ranked)
     if (program.nationalRanking) {
       if (program.nationalRanking <= 10) {
         nationalRankBonus += 1.0;
         factors.push(`National Top 10: #${program.nationalRanking}`);
       } else if (program.nationalRanking <= 25) {
         nationalRankBonus += 0.7;
         factors.push(`National Top 25: #${program.nationalRanking}`);
       } else if (program.nationalRanking <= 50) {
         nationalRankBonus += 0.4;
         factors.push(`National Top 50: #${program.nationalRanking}`);
       } else if (program.nationalRanking <= 100) {
         nationalRankBonus += 0.2;
         factors.push(`National Top 100: #${program.nationalRanking}`);
       }
     }
     
     // State ranking bonus
     if (program.stateRanking) {
       if (program.stateRanking <= 5) {
         stateRankBonus += 0.5;
         factors.push(`State Top 5: #${program.stateRanking}`);
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
     }
     
     // Win-loss record bonus
     if (program.record) {
       const parsed = parseRecord(program.record);
       if (parsed) {
         // Bonus based on win percentage
         if (parsed.winPct >= 0.8) {
           programScore += 0.4;
           factors.push(`Elite record: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
         } else if (parsed.winPct >= 0.65) {
           programScore += 0.2;
           factors.push(`Strong record: ${program.record} (${Math.round(parsed.winPct * 100)}%)`);
         } else if (parsed.winPct >= 0.5) {
           programScore += 0.1;
           factors.push(`Winning record: ${program.record}`);
         } else if (parsed.winPct < 0.35) {
           programScore -= 0.2;
           factors.push(`Struggling: ${program.record}`);
         }
         recordBonus += (parsed.winPct - 0.5) * 0.3; // Cumulative record impact
       }
     }
     
     // Championship bonus
     if (program.championships && program.championships.length > 0) {
       championshipBonus += program.championships.length * 0.15;
       factors.push(`Championships: ${program.championships.length}`);
     }
     
     programScores.push({
       sport: `${program.sport} (${program.gender})`,
       score: programScore,
       factors
     });
     
     totalScore += programScore * levelWeight;
     weightedCount += levelWeight;
   }
   
   // Calculate base average
   const avgScore = weightedCount > 0 ? totalScore / weightedCount : 2.0;
   
   // Apply bonuses (capped to prevent going above A+)
   const bonuses = Math.min(
     nationalRankBonus + stateRankBonus + championshipBonus + Math.max(-0.3, Math.min(0.3, recordBonus)),
     1.0 // Max 1.0 bonus
   );
   
   const finalScore = Math.min(4.3, avgScore + bonuses);
   const finalGrade = numberToGrade(finalScore);
   
   return {
     grade: finalGrade,
     score: Math.round(finalScore * 100) / 100,
     breakdown: {
       programCount: programs.length,
       avgProgramScore: Math.round(avgScore * 100) / 100,
       nationalRankBonus: Math.round(nationalRankBonus * 100) / 100,
       stateRankBonus: Math.round(stateRankBonus * 100) / 100,
       championshipBonus: Math.round(championshipBonus * 100) / 100,
       recordBonus: Math.round(recordBonus * 100) / 100,
       totalBonus: Math.round(bonuses * 100) / 100,
       topPrograms: programScores.slice(0, 5)
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
 
     if (!enhanced || enhanced.length === 0) {
       return new Response(JSON.stringify({ 
         success: true, 
         message: 'No schools with sports data to regrade',
         updated: 0 
       }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     // Get current school data for comparison
     const schoolIdList = enhanced.map(e => e.school_id);
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
 
     for (const record of enhanced) {
       const programs = (record.sports_programs as SportProgram[]) || [];
       const school = schoolMap.get(record.school_id);
       
       if (!school) continue;
       
       const { grade, score, breakdown } = calculateSportsGrade(programs);
       
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
 
       // Update school if not dry run and grade changed
       if (!dryRun && changed && grade !== 'N/A') {
         const { error: updateError } = await supabase
           .from('schools')
           .update({ sports_grade: grade, updated_at: new Date().toISOString() })
           .eq('id', record.school_id);
         
         if (updateError) {
           console.error(`Failed to update ${school.name}:`, updateError.message);
         } else {
           console.log(`Updated ${school.name}: ${school.sports_grade} -> ${grade}`);
         }
       }
     }
 
     const changedCount = results.filter(r => r.changed).length;
     const upgrades = results.filter(r => r.changed && gradeToNumber(r.newGrade) > gradeToNumber(r.oldGrade || 'F')).length;
     const downgrades = results.filter(r => r.changed && gradeToNumber(r.newGrade) < gradeToNumber(r.oldGrade || 'F')).length;
 
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