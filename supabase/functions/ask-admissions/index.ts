import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SchoolInfo {
  name: string;
  city: string;
  state: string;
  type: string | null;
  competitiveness: string | null;
  size: string | null;
  boarding: boolean | null;
  notes: string | null;
  website: string | null;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, school, userMode, conversationHistory } = await req.json() as {
      message: string;
      school: SchoolInfo;
      userMode: "student" | "parent";
      conversationHistory: ConversationMessage[];
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build comprehensive school context
    const schoolContext = `
School Name: ${school.name}
Location: ${school.city}, ${school.state}
Type: ${school.type || "Private"}
Competitiveness: ${school.competitiveness || "Not specified"}
Size: ${school.size || "Not specified"}
Boarding: ${school.boarding ? "Yes, offers boarding programs" : "Day school (no boarding)"}
Additional Notes: ${school.notes || "None"}
Website: ${school.website || "Not available"}
    `.trim();

    // Customize system prompt based on user mode
    const modeContext = userMode === "student" 
      ? `The user is a STUDENT interested in this school. Focus on:
- Student life, social atmosphere, and campus culture
- Clubs, activities, and extracurricular opportunities
- Academic experience, class sizes, and student autonomy
- What makes daily life unique at this school
- Student perspectives on homework, stress, and balance
- Sports, arts, and other student interests
Use a friendly, relatable tone appropriate for middle/high school students.`
      : `The user is a PARENT researching this school. Focus on:
- Safety, supervision, and student welfare policies
- Transportation options and logistics
- Costs, financial aid, and payment structures
- Communication between school and parents
- Academic outcomes and college placement
- Support services and resources for students
Use a professional, informative tone that addresses parent concerns.`;

    const systemPrompt = `You are an expert admissions advisor AI for ${school.name}, a private school in ${school.city}, ${school.state}. You have deep knowledge about this school and the independent school admissions process.

${modeContext}

SCHOOL INFORMATION:
${schoolContext}

CAPABILITIES:
1. **Policy Lookups**: Answer questions about school policies, requirements, and procedures
2. **Admissions Guidance**: Help with timeline calculations, deadline management, and application requirements
3. **Comparison Insights**: When asked, compare aspects of this school with general knowledge of peer schools
4. **Student/Campus Life**: Provide insights about daily life, culture, and community

GUIDELINES:
- Be specific to ${school.name} when you have relevant information
- If you don't have specific information, provide general guidance for schools of similar type (${school.competitiveness || "private"}, ${school.size || "medium"} size, ${school.boarding ? "boarding" : "day"} school)
- Always be helpful and encouraging while being honest about limitations
- Keep responses concise but thorough (2-3 paragraphs max unless more detail is requested)
- When appropriate, suggest follow-up questions or next steps
- Reference the school's website (${school.website || "their official website"}) for official information

Remember: You're helping families navigate an important decision. Be warm, knowledgeable, and supportive.`;

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    console.log(`Ask Admissions: Processing query for ${school.name} in ${userMode} mode`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    console.log(`Ask Admissions: Successfully generated response for ${school.name}`);

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ask-admissions function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
