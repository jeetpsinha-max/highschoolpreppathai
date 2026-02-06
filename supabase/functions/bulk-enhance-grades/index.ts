import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GradeEnhancement {
  category: string;
  grade: string;
  confidence: number;
  description: string;
  highlights: string[];
  sources: string[];
}

interface SportProgram {
  sport: string;
  gender: 'Boys' | 'Girls' | 'Coed';
  grade: string;
  level: 'Varsity' | 'JV' | 'Club' | 'Recreational';
  season: 'Fall' | 'Winter' | 'Spring' | 'Year-round';
  highlights: string[];
  record?: string;
  stateRanking?: number;
  nationalRanking?: number;
  conference?: string;
  championships?: string[];
}

interface EnhancedSchoolData {
  schoolName: string;
  overallDescription: string;
  gradeEnhancements: GradeEnhancement[];
  keyStrengths: string[];
  areasForImprovement: string[];
  notablePrograms: string[];
  reputation: string;
  sportsPrograms: SportProgram[];
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enhanceSchoolWithAI(
  schoolName: string, 
  currentGrades: Record<string, string | null>,
  apiKey: string,
  maxRetries = 3
): Promise<EnhancedSchoolData> {
  const systemPrompt = `You are an expert researcher on US private and boarding schools. Provide accurate, well-researched information based on sources like Niche.com, PrepReview, BoardingSchoolReview, MaxPreps (for sports), official websites, and US News. Be factual and indicate confidence levels.

For SPORTS PROGRAMS specifically, research:
- What varsity, JV, and club sports the school offers
- Which sports the school is particularly known for
- Recent athletic achievements or championships
- Conference affiliations and competitive level
- Team records from MaxPreps when available
- State and national rankings from MaxPreps

IMPORTANT: For rankings, only include rankings if the school is genuinely competitive (e.g., top 50 in state). Do NOT include rankings like #500+ as those indicate non-competitive programs.`;

  const currentGradesInfo = Object.entries(currentGrades)
    .filter(([_, grade]) => grade && grade !== 'N/A')
    .map(([cat, grade]) => `- ${cat}: ${grade}`)
    .join('\n');

  const userPrompt = `Research ${schoolName}. Current grades:\n${currentGradesInfo}\n\nProvide: overall description, grade enhancements with confidence, key strengths, areas for improvement, notable programs, reputation, and ALL sports programs with records, rankings, and championships.

For sports, list every sport offered with grade (A+ to F based on competitiveness), level, season, record, and any notable rankings or championships. Typical private schools offer 15-25+ sports.`;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const backoffMs = Math.pow(3, attempt) * 30000;
        console.log(`Retry ${attempt + 1}/${maxRetries} for ${schoolName} after ${backoffMs/1000}s`);
        await sleep(backoffMs);
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_school_grades",
                description: "Provide enhanced grade information for a school including all sports programs",
                parameters: {
                  type: "object",
                  properties: {
                    schoolName: { type: "string" },
                    overallDescription: { type: "string" },
                    gradeEnhancements: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: { type: "string" },
                          grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                          confidence: { type: "number", minimum: 0, maximum: 100 },
                          description: { type: "string" },
                          highlights: { type: "array", items: { type: "string" } },
                          sources: { type: "array", items: { type: "string" } }
                        },
                        required: ["category", "grade", "confidence", "description", "highlights", "sources"]
                      }
                    },
                    keyStrengths: { type: "array", items: { type: "string" } },
                    areasForImprovement: { type: "array", items: { type: "string" } },
                    notablePrograms: { type: "array", items: { type: "string" } },
                    reputation: { type: "string" },
                    sportsPrograms: {
                      type: "array",
                      description: "All sports programs offered at the school",
                      items: {
                        type: "object",
                        properties: {
                          sport: { type: "string" },
                          gender: { type: "string", enum: ["Boys", "Girls", "Coed"] },
                          grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                          level: { type: "string", enum: ["Varsity", "JV", "Club", "Recreational"] },
                          season: { type: "string", enum: ["Fall", "Winter", "Spring", "Year-round"] },
                          highlights: { type: "array", items: { type: "string" } },
                          record: { type: "string", description: "Win-loss record e.g. '15-2'" },
                          stateRanking: { type: "number", description: "State ranking if top 50" },
                          nationalRanking: { type: "number", description: "National ranking if top 100" },
                          conference: { type: "string" },
                          championships: { type: "array", items: { type: "string" } }
                        },
                        required: ["sport", "gender", "grade", "level", "season", "highlights"]
                      }
                    }
                  },
                  required: ["schoolName", "overallDescription", "gradeEnhancements", "keyStrengths", "areasForImprovement", "notablePrograms", "reputation", "sportsPrograms"]
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "provide_school_grades" } }
        }),
      });

      if (response.status === 429) {
        lastError = new Error('Rate limited');
        continue;
      }

      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        throw new Error('Failed to get structured response from AI');
      }

      return JSON.parse(toolCall.function.arguments);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (error instanceof Error && !error.message.includes('Rate') && !error.message.includes('429')) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schoolIds, delayMs = 10000 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get schools to enhance
    let query = supabase.from('schools').select('*');
    
    if (schoolIds && schoolIds.length > 0) {
      query = query.in('id', schoolIds);
    }
    
    const { data: schools, error: schoolsError } = await query;
    
    if (schoolsError) {
      throw new Error(`Failed to fetch schools: ${schoolsError.message}`);
    }

    if (!schools || schools.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No schools to enhance',
        processed: 0, errors: 0, skipped: 0, total: 0, results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get already cached schools (less than 30 days old)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from('enhanced_school_grades')
      .select('school_id')
      .gt('updated_at', thirtyDaysAgo);
    
    const cachedIds = new Set(cached?.map(c => c.school_id) || []);
    
    // Filter to only uncached schools
    const schoolsToEnhance = schools.filter(s => !cachedIds.has(s.id));
    
    console.log(`Processing ${schoolsToEnhance.length} schools (${cachedIds.size} already cached)`);

    const results: { schoolId: string; schoolName: string; status: 'success' | 'error'; error?: string }[] = [];
    
    for (let i = 0; i < schoolsToEnhance.length; i++) {
      const school = schoolsToEnhance[i];
      console.log(`Processing ${i + 1}/${schoolsToEnhance.length}: ${school.name}`);
      
      try {
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

        const enhancedData = await enhanceSchoolWithAI(school.name, currentGrades, LOVABLE_API_KEY);

        const avgConfidence = enhancedData.gradeEnhancements.length > 0
          ? enhancedData.gradeEnhancements.reduce((sum, e) => sum + e.confidence, 0) / enhancedData.gradeEnhancements.length
          : null;

        const allSources = [...new Set(enhancedData.gradeEnhancements.flatMap(e => e.sources))];

        await supabase
          .from('enhanced_school_grades')
          .upsert({
            school_id: school.id,
            overall_description: enhancedData.overallDescription,
            grade_enhancements: enhancedData.gradeEnhancements,
            key_strengths: enhancedData.keyStrengths,
            areas_for_improvement: enhancedData.areasForImprovement,
            notable_programs: enhancedData.notablePrograms,
            reputation: enhancedData.reputation,
            sports_programs: enhancedData.sportsPrograms || [],
            sources_used: allSources,
            confidence_avg: avgConfidence,
            updated_at: new Date().toISOString()
          }, { onConflict: 'school_id' });

        results.push({ schoolId: school.id, schoolName: school.name, status: 'success' });
        console.log(`✓ Enhanced ${school.name} (${enhancedData.sportsPrograms?.length || 0} sports)`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ Error enhancing ${school.name}:`, message);
        results.push({ schoolId: school.id, schoolName: school.name, status: 'error', error: message });
      }

      if (i < schoolsToEnhance.length - 1) {
        await sleep(delayMs);
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = cachedIds.size;

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${successCount} schools successfully, ${errorCount} errors, ${skippedCount} already cached`,
      processed: successCount,
      errors: errorCount,
      skipped: skippedCount,
      total: schools.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in bulk-enhance-grades function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
