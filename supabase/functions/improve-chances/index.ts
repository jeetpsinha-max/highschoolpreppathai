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
    const { schoolId, studentProfile } = await req.json();
    
    if (!schoolId) {
      return new Response(
        JSON.stringify({ error: "School ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch school info
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("*")
      .eq("id", schoolId)
      .single();

    if (schoolError || !school) {
      return new Response(
        JSON.stringify({ error: "School not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating improvement plan for: ${school.name}`);

    const systemPrompt = `You are an expert high school admissions counselor providing strategic guidance for a student applying to a specific school.

School Information:
- Name: ${school.name}
- Location: ${school.city}, ${school.state}
- Type: ${school.type || "Private"}
- Competitiveness: ${school.competitiveness || "Unknown"}
- Size: ${school.size || "Unknown"}
- Boarding: ${school.boarding ? "Yes" : "No"}
- Additional Notes: ${school.notes || "None"}

${studentProfile ? `Student Profile: ${studentProfile}` : ""}

Create a comprehensive, actionable improvement plan. Be specific, encouraging, and age-appropriate (for middle/high school students).

Return a JSON object with this structure:
{
  "schoolInsights": {
    "whatTheyValue": ["value1", "value2", "value3"],
    "typicalAcceptedStudent": "Description of typical accepted student profile",
    "standoutFactors": ["factor1", "factor2", "factor3"]
  },
  "academicRecommendations": {
    "coursesToTake": ["course1", "course2"],
    "subjectsToStrengthen": ["subject1", "subject2"],
    "testPrepTips": "Tips for SSAT or other tests"
  },
  "extracurricularRecommendations": {
    "activitiesToConsider": [
      { "activity": "Activity name", "reason": "Why this helps" }
    ],
    "leadershipOpportunities": ["opportunity1", "opportunity2"],
    "communityInvolvement": "Suggestions for community service"
  },
  "applicationStrategy": {
    "essayTopics": ["topic1", "topic2", "topic3"],
    "interviewTips": ["tip1", "tip2", "tip3"],
    "lettersOfRecommendation": "Advice on who to ask and what to highlight"
  },
  "timeline": [
    { "timeframe": "6+ months before", "tasks": ["task1", "task2"] },
    { "timeframe": "3-6 months before", "tasks": ["task1", "task2"] },
    { "timeframe": "1-3 months before", "tasks": ["task1", "task2"] },
    { "timeframe": "Final month", "tasks": ["task1", "task2"] }
  ],
  "summary": "A brief, encouraging summary of the overall strategy"
}

Return ONLY valid JSON.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please create an improvement plan for applying to ${school.name}.` }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response
    let plan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    return new Response(
      JSON.stringify({ plan, school: { name: school.name, city: school.city, state: school.state } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Improve Chances error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
