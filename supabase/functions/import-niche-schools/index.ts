import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin, AuthError } from "../_shared/adminAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NicheSchoolData {
  name: string;
  city: string;
  state: string;
  type: string;
  boarding: boolean;
  competitiveness: string;
  size: string;
  website: string | null;
  overallGrade: string;
  academicsGrade: string;
  sportsGrade: string;
  artsGrade: string;
  clubsGrade: string;
  diversityGrade: string;
  collegePrepGrade: string;
}

async function researchNicheSchools(
  state: string,
  limit: number,
  apiKey: string
): Promise<NicheSchoolData[]> {
  const systemPrompt = `You are an expert researcher on US private and boarding schools. Your task is to provide accurate data about high schools that would appear on Niche.com for a given state.

You should research and return data about private, boarding, and selective public/charter high schools. Focus on:
- Well-known private day schools
- Boarding schools
- Selective magnet/charter schools
- Catholic and religious-affiliated schools
- Independent schools

For each school, provide grades based on what Niche.com would typically rate them (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F).

Be accurate and factual. Only include real schools that exist.`;

  const userPrompt = `Research and list ${limit} high schools (private, boarding, magnet, charter, religious) in ${state} that would appear on Niche.com.

For each school provide:
1. Full official name
2. City
3. State abbreviation
4. Type (Private, Boarding, Selective Public/Charter, Magnet, Catholic, Jesuit, Quaker, etc.)
5. Whether it offers boarding (true/false)
6. Competitiveness level (Highly Selective, Selective, Moderately Selective, Less Selective)
7. Size (Small: <400, Medium: 400-1000, Large: >1000 students)
8. Website URL if known
9. Overall Niche grade
10. Academics grade
11. Sports grade
12. Arts grade
13. Clubs grade
14. Diversity grade
15. College Prep grade

Focus on well-known, established schools. Include a mix of:
- Top private day schools
- Boarding schools (if any in state)
- Catholic/Jesuit/religious schools
- Selective public magnet/charter schools
- Arts-focused schools
- STEM-focused schools`;

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
            name: "provide_niche_schools",
            description: "Provide a list of schools with their Niche-style data",
            parameters: {
              type: "object",
              properties: {
                schools: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      type: { type: "string" },
                      boarding: { type: "boolean" },
                      competitiveness: { type: "string", enum: ["Highly Selective", "Selective", "Moderately Selective", "Less Selective"] },
                      size: { type: "string", enum: ["Small", "Medium", "Large"] },
                      website: { type: "string" },
                      overallGrade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                      academicsGrade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                      sportsGrade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                      artsGrade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                      clubsGrade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                      diversityGrade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                      collegePrepGrade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] }
                    },
                    required: ["name", "city", "state", "type", "boarding", "competitiveness", "size", "overallGrade", "academicsGrade"]
                  }
                }
              },
              required: ["schools"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "provide_niche_schools" } }
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
  if (!toolCall || toolCall.function.name !== 'provide_niche_schools') {
    throw new Error('Failed to get structured response from AI');
  }

  const result = JSON.parse(toolCall.function.arguments);
  return result.schools || [];
}

function normalizeSchoolName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/school|academy|highschool|preparatory|prep|the/g, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state, limit = 25 } = await req.json();
    
    if (!state) {
      throw new Error('State is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get existing schools to check for duplicates
    const { data: existingSchools } = await supabase
      .from('schools')
      .select('id, name, city, state');

    const existingSet = new Set(
      (existingSchools || []).map(s => 
        `${normalizeSchoolName(s.name)}-${s.city?.toLowerCase()}-${s.state?.toLowerCase()}`
      )
    );

    console.log(`Found ${existingSchools?.length || 0} existing schools`);

    // Research schools from Niche
    const nicheSchools = await researchNicheSchools(state, limit, LOVABLE_API_KEY);
    console.log(`AI returned ${nicheSchools.length} schools for ${state}`);

    // Filter duplicates and prepare for insert
    const newSchools: any[] = [];
    const duplicates: string[] = [];

    for (const school of nicheSchools) {
      const key = `${normalizeSchoolName(school.name)}-${school.city?.toLowerCase()}-${school.state?.toLowerCase()}`;
      
      if (existingSet.has(key)) {
        duplicates.push(school.name);
        continue;
      }

      newSchools.push({
        name: school.name,
        city: school.city,
        state: school.state,
        type: school.type,
        boarding: school.boarding,
        competitiveness: school.competitiveness,
        size: school.size,
        website: school.website || null,
        admission_type: 'Private',
        academics_grade: school.academicsGrade,
        sports_grade: school.sportsGrade || null,
        arts_grade: school.artsGrade || null,
        clubs_grade: school.clubsGrade || null,
        diversity_grade: school.diversityGrade || null,
        college_prep_grade: school.collegePrepGrade || null
      });

      // Add to existing set to prevent duplicates within same batch
      existingSet.add(key);
    }

    // Insert new schools
    let inserted = 0;
    if (newSchools.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('schools')
        .insert(newSchools)
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      inserted = insertedData?.length || 0;
    }

    return new Response(JSON.stringify({
      success: true,
      state,
      found: nicheSchools.length,
      inserted,
      duplicatesSkipped: duplicates.length,
      duplicateNames: duplicates,
      newSchools: newSchools.map(s => s.name)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in import-niche-schools function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
