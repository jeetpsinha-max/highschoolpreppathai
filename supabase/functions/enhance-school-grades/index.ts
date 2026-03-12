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
  gender: 'Boys' | 'Girls';
  grade: string;
  level: 'Varsity';
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

async function enhanceSchoolWithAI(
  schoolName: string, 
  currentGrades: Record<string, string | null> | undefined,
  apiKey: string
): Promise<EnhancedSchoolData> {
  const systemPrompt = `You are an expert researcher on US private and boarding schools. Your task is to provide accurate, well-researched information about schools based on publicly available data from sources like:
- Niche.com school ratings
- PrepReview.com
- BoardingSchoolReview.com
- MaxPreps (for sports data and athletics programs)
- The Schools official websites
- US News & World Report
- Peterson's Guide

You should cross-reference multiple sources mentally and provide balanced, accurate assessments.

For SPORTS PROGRAMS specifically, research:
- What varsity, JV, and club sports the school offers
- Which sports the school is particularly known for or competitive in
- Recent athletic achievements or championships
- Quality of coaching staff and athletic facilities
- Conference affiliations and competitive level

IMPORTANT: 
- Be factual and objective
- If you're not confident about specific data, indicate lower confidence
- Focus on well-documented strengths and programs
- Provide specific, verifiable information when possible
- For sports, list ALL sports you can identify that the school offers
- Include team records (e.g., "12-3", "8-2-1") when available from MaxPreps
- Include state and national rankings from MaxPreps when available
- Include conference affiliations and championship history`;

  const currentGradesInfo = currentGrades 
    ? `\n\nCurrent grades we have on file:\n${Object.entries(currentGrades)
        .filter(([_, grade]) => grade && grade !== 'N/A')
        .map(([cat, grade]) => `- ${cat}: ${grade}`)
        .join('\n')}`
    : '';

  const userPrompt = `Research and provide enhanced grade information for: ${schoolName}

${currentGradesInfo}

Based on publicly available information from school rating websites, official school data, MaxPreps, and educational publications, provide:

1. An overall description of the school (2-3 sentences)
2. For each grade category, provide:
   - A recommended grade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F)
   - Confidence level (0-100) - how confident you are in this grade
   - A brief description (1-2 sentences) explaining the grade
   - 1-3 specific highlights or facts
   - Note any sources this is based on (e.g., "Niche.com", "school website", "MaxPreps")
3. Key strengths (3-5 points)
4. Areas for improvement (1-3 points, be diplomatic)
5. Notable programs or achievements
6. Overall reputation summary (1 sentence)
7. SPORTS PROGRAMS - List ALL sports offered at this school with:
   - Sport name
   - Gender (Boys, Girls, or Coed)
   - Grade for that specific sport (A+ to F based on program quality, competitiveness, facilities)
   - Level (Varsity, JV, Club, or Recreational)
   - Season (Fall, Winter, Spring, or Year-round)
   - 1-2 highlights if the sport is notable (championships, strong program, etc.)
   - Record (current or most recent season, e.g., "15-2", "8-4-1")
   - State ranking (if available from MaxPreps, e.g., #5 in state)
   - National ranking (if available from MaxPreps)
   - Conference affiliation (e.g., "NEPSAC", "ISL", "PAISAA")
   - Championship history (recent titles, state championships)

Be accurate and cite what you know. If you're uncertain, indicate lower confidence. For sports, try to identify as many as possible - typical private schools offer 15-25+ sports.`;

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
            description: "Provide enhanced grade information for a school",
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
                  description: "List of all sports programs offered at the school with records and rankings",
                  items: {
                    type: "object",
                    properties: {
                      sport: { type: "string", description: "Name of the sport (e.g., Football, Soccer, Tennis)" },
                      gender: { type: "string", enum: ["Boys", "Girls", "Coed"] },
                      grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                      level: { type: "string", enum: ["Varsity", "JV", "Club", "Recreational"] },
                      season: { type: "string", enum: ["Fall", "Winter", "Spring", "Year-round"] },
                      highlights: { type: "array", items: { type: "string" }, description: "Notable achievements or facts about this sport program" },
                      record: { type: "string", description: "Current or recent season record (e.g., '15-2', '8-4-1')" },
                      stateRanking: { type: "number", description: "State ranking from MaxPreps if available" },
                      nationalRanking: { type: "number", description: "National ranking from MaxPreps if available" },
                      conference: { type: "string", description: "Conference affiliation (e.g., 'NEPSAC', 'ISL')" },
                      championships: { type: "array", items: { type: "string" }, description: "Recent championships or titles won" }
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

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted. Please add credits to continue.");
    }
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== 'provide_school_grades') {
    throw new Error('Failed to get structured response from AI');
  }

  return JSON.parse(toolCall.function.arguments);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schoolId, schoolName, currentGrades, forceRefresh } = await req.json();
    
    if (!schoolName) {
      throw new Error('School name is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first (unless force refresh)
    if (!forceRefresh && schoolId) {
      const { data: cached } = await supabase
        .from('enhanced_school_grades')
        .select('*')
        .eq('school_id', schoolId)
        .single();
      
      if (cached) {
        // Return cached data if less than 30 days old
        const updatedAt = new Date(cached.updated_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        if (updatedAt > thirtyDaysAgo) {
            return new Response(JSON.stringify({
              success: true,
              schoolId,
              cached: true,
              cachedAt: cached.updated_at,
              data: {
                schoolName,
                overallDescription: cached.overall_description,
                gradeEnhancements: cached.grade_enhancements,
                keyStrengths: cached.key_strengths,
                sportsPrograms: cached.sports_programs || [],
              areasForImprovement: cached.areas_for_improvement,
              notablePrograms: cached.notable_programs,
              reputation: cached.reputation
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Fetch fresh data from AI
    const enhancedData = await enhanceSchoolWithAI(schoolName, currentGrades, LOVABLE_API_KEY);

    // Calculate average confidence
    const avgConfidence = enhancedData.gradeEnhancements.length > 0
      ? enhancedData.gradeEnhancements.reduce((sum, e) => sum + e.confidence, 0) / enhancedData.gradeEnhancements.length
      : null;

    // Collect all sources
    const allSources = [...new Set(enhancedData.gradeEnhancements.flatMap(e => e.sources))];

    // Cache the result
    if (schoolId) {
      const { error: upsertError } = await supabase
        .from('enhanced_school_grades')
        .upsert({
          school_id: schoolId,
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

      if (upsertError) {
        console.error('Error caching enhanced grades:', upsertError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      schoolId,
      cached: false,
      data: enhancedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in enhance-school-grades function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
