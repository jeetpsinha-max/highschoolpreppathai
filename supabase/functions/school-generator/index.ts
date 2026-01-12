import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    
    if (!description || description.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Please provide a detailed description of your ideal school (at least 10 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("School Generator: Processing description:", description.substring(0, 100));

    // Fetch all schools from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: schools, error: dbError } = await supabase
      .from("schools")
      .select("*");

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to fetch schools from database");
    }

    console.log(`Fetched ${schools?.length || 0} schools from database`);

    // Create school summary for AI including grades
    const schoolSummary = schools?.map(s => ({
      id: s.id,
      name: s.name,
      state: s.state,
      city: s.city,
      boarding: s.boarding,
      competitiveness: s.competitiveness,
      size: s.size,
      type: s.type,
      notes: s.notes,
      grades: {
        academics: s.academics_grade,
        sports: s.sports_grade,
        arts: s.arts_grade,
        clubs: s.clubs_grade,
        diversity: s.diversity_grade,
        college_prep: s.college_prep_grade,
        campus: s.campus_grade,
        facilities: s.facilities_grade,
        faculty: s.faculty_grade,
        dorms: s.dorms_grade
      }
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert high school admissions counselor. A student has described their ideal school.

Each school in the database has grades (A+ to F) across multiple categories:
- academics: Academic rigor, curriculum quality, and college preparation
- sports: Athletic programs, facilities, and competitive success
- arts: Visual arts, music, theater, and creative programs
- clubs: Extracurricular activities, student organizations, and clubs
- diversity: Student body diversity and inclusive culture
- college_prep: College counseling, placement rates, and preparation
- campus: Campus beauty, size, and overall environment
- facilities: Buildings, technology, labs, and infrastructure
- faculty: Teacher quality, experience, and student support
- dorms: Residential life quality (for boarding schools)

Your tasks:
1. Create a detailed "Ideal School Profile" based on their description - this should synthesize what they're looking for into key characteristics
2. Find the 10 schools from the database that best match this profile, using the grades to inform your decisions
3. For each match, explain specifically why it matches AND reference the relevant grades

IMPORTANT GUIDELINES:
- Be encouraging and age-appropriate (for middle/high school students)
- Consider all aspects: academics, culture, location, size, competitiveness, AND grades
- Use grades to justify your matches (e.g., "With an A in academics and A- in arts...")
- Rank matches from best to good fit
- Be specific about why each school matches

Available schools database:
${JSON.stringify(schoolSummary, null, 2)}

Return a JSON object with this exact structure:
{
  "idealProfile": {
    "summary": "A 2-3 sentence summary of what they're looking for",
    "keyCharacteristics": ["characteristic1", "characteristic2", ...],
    "academicFocus": "description of academic priorities",
    "cultureFit": "description of ideal culture/environment",
    "locationPreferences": "geographic preferences",
    "sizeAndStructure": "size and structure preferences"
  },
  "matches": [
    {
      "id": "school-uuid",
      "name": "School Name",
      "matchScore": 95,
      "matchReason": "2-3 sentence explanation of why this school matches (reference grades)",
      "highlights": ["highlight1", "highlight2", "highlight3"],
      "grades": {"academics": "A", "sports": "B+", "arts": "A-", ...}
    }
  ]
}

Return ONLY valid JSON, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is my description of my ideal school:\n\n${description}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI service error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI Response received, parsing...");

    // Parse JSON from response
    let results;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content.substring(0, 500));
      throw new Error("Failed to parse AI response");
    }

    console.log("Successfully generated school profile and matches");

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("School Generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
