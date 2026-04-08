import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schoolName, schoolInfo, studentInterests, visitDate, userMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const prompt = `Create a comprehensive school visit preparation guide for ${schoolName}.

${schoolInfo ? `School Details: ${JSON.stringify(schoolInfo)}` : ''}
${studentInterests ? `Student Interests: ${studentInterests}` : ''}
${visitDate ? `Visit Date: ${visitDate}` : ''}
Perspective: ${userMode === 'parent' ? 'Parent' : 'Student'}

Generate:
1. **Pre-Visit Research Checklist** - What to look up before going
2. **Questions to Ask** (categorized):
   - For Admissions Officers
   - For Current Students
   - For Teachers/Faculty
   - ${userMode === 'parent' ? 'For Other Parents' : 'For Club/Team Leaders'}
3. **Things to Observe** - What to pay attention to during the visit
   - Campus atmosphere and culture
   - Student interactions and engagement
   - Facilities condition and resources
   - Safety and accessibility
4. **Red Flags to Watch For** - Warning signs to be aware of
5. **Post-Visit Reflection Questions** - What to think about after
6. **Follow-Up Action Items** - Thank-you notes, next steps
${studentInterests ? `7. **Personalized Focus Areas** - Based on interests in ${studentInterests}` : ''}

Be specific to this school type and provide actionable, practical advice.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are an expert private school admissions consultant helping families prepare for school visits. Be thorough, practical, and encouraging.' },
          { role: 'user', content: prompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limited.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'Credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI API error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
