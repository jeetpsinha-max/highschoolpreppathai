import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all schools from database
    const { data: schools, error: schoolsError } = await supabase
      .from("schools")
      .select("*");

    if (schoolsError) {
      console.error("Error fetching schools:", schoolsError);
      throw new Error("Failed to fetch schools");
    }

    console.log(`Fetched ${schools?.length || 0} schools for matching`);

    const systemPrompt = `You are an expert private school admissions counselor helping students find the best-fit schools. 
Analyze the student's preferences and match them with schools from the provided database.

For each school you recommend, explain WHY it's a good fit based on the student's specific preferences.

Categorize your recommendations into:
- REACH schools (more selective, aspirational choices)
- TARGET schools (good match for the student's profile)
- SAFETY schools (likely admission based on profile)

Be specific about which features of each school align with the student's preferences.`;

    const userPrompt = `Student Preferences:
- Academic Interests: ${preferences.academicInterests || "Not specified"}
- Extracurricular Interests: ${preferences.extracurriculars || "Not specified"}
- Preferred Location/States: ${preferences.preferredStates?.join(", ") || "Any"}
- Boarding Preference: ${preferences.boardingPreference || "No preference"}
- School Size Preference: ${preferences.sizePreference || "No preference"}
- Competitiveness Level: ${preferences.competitivenessLevel || "Any"}
- Special Programs: ${preferences.specialPrograms || "Not specified"}
- Budget Considerations: ${preferences.budgetNotes || "Not specified"}
- Additional Notes: ${preferences.additionalNotes || "None"}

Available Schools Database (${schools?.length || 0} schools):
${JSON.stringify(schools?.slice(0, 100).map(s => ({
  id: s.id,
  name: s.name,
  city: s.city,
  state: s.state,
  type: s.type,
  boarding: s.boarding,
  competitiveness: s.competitiveness,
  size: s.size,
  notes: s.notes
})), null, 2)}

Based on the student's preferences and the available schools, provide:
1. 3-5 REACH schools with explanations
2. 4-6 TARGET schools with explanations  
3. 2-4 SAFETY schools with explanations

Format your response as JSON with this structure:
{
  "reach": [{"id": "school-uuid", "name": "School Name", "reason": "Why this is a good fit"}],
  "target": [{"id": "school-uuid", "name": "School Name", "reason": "Why this is a good fit"}],
  "safety": [{"id": "school-uuid", "name": "School Name", "reason": "Why this is a good fit"}],
  "summary": "Brief overall assessment of the student's school search"
}`;

    console.log("Calling Lovable AI for school matching...");

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
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log("AI response received:", content?.substring(0, 200));

    let matchResults;
    try {
      matchResults = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      throw new Error("Failed to parse AI recommendations");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results: matchResults,
      schoolCount: schools?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("School matcher error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
