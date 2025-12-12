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
    const { action, schoolId, response, questionIndex } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch school info if provided
    let schoolInfo = "";
    if (schoolId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: school } = await supabase
        .from("schools")
        .select("*")
        .eq("id", schoolId)
        .single();

      if (school) {
        schoolInfo = `The student is preparing for an interview at ${school.name} (${school.city}, ${school.state}). ${school.competitiveness ? `This is a ${school.competitiveness} school.` : ""}`;
      }
    }

    if (action === "generate_questions") {
      console.log("Generating interview questions...");

      const systemPrompt = `You are an expert high school admissions interview coach. Generate 5 realistic interview questions that a student might encounter during a high school admissions interview.

${schoolInfo}

Create a mix of:
- Personal background questions
- Academic interest questions  
- "Why this school?" questions
- Character and values questions
- Future goals questions

Return a JSON object with this structure:
{
  "questions": [
    {
      "id": 1,
      "question": "The interview question",
      "category": "Personal/Academic/School Fit/Character/Goals",
      "tips": "Brief tip for answering this question well"
    }
  ]
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
            { role: "user", content: "Generate interview questions for me." }
          ],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("AI service error");
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse questions");
      
      const questions = JSON.parse(jsonMatch[0]);
      
      return new Response(
        JSON.stringify({ questions: questions.questions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "evaluate_response") {
      console.log("Evaluating interview response...");

      const systemPrompt = `You are an expert high school admissions interview coach evaluating a student's interview response.

${schoolInfo}

Provide constructive, age-appropriate feedback that helps the student improve. Be encouraging while offering specific suggestions.

Evaluate on:
1. Clarity (1-10): How clear and well-organized was the response?
2. Confidence (1-10): Does the response convey confidence and authenticity?
3. Content (1-10): Is the content relevant, specific, and compelling?
4. Structure (1-10): Does the answer have a good beginning, middle, and end?

Return a JSON object:
{
  "scores": {
    "clarity": number,
    "confidence": number,
    "content": number,
    "structure": number,
    "overall": number
  },
  "feedback": {
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "examplePhrase": "A suggested phrase or approach they could use"
  },
  "summary": "A brief, encouraging summary of the feedback"
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
            { role: "user", content: `Please evaluate this interview response:\n\n"${response}"` }
          ],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("AI service error");
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse feedback");
      
      const feedback = JSON.parse(jsonMatch[0]);
      
      return new Response(
        JSON.stringify({ feedback }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Interview Coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
