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
    const { currentGrade, targetSchools, applicationYear, priorities, completedItems } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const prompt = `Create a detailed, personalized admissions timeline plan.

Student Details:
- Current Grade: ${currentGrade || 'Not specified'}
- Target Application Year: ${applicationYear || 'Next cycle'}
${targetSchools?.length ? `- Target Schools: ${targetSchools.join(', ')}` : ''}
${priorities ? `- Key Priorities: ${priorities}` : ''}
${completedItems?.length ? `- Already Completed: ${completedItems.join(', ')}` : ''}

Create a month-by-month timeline from NOW through the application deadline that includes:

1. **Immediate Actions (This Week)**
2. **Monthly Milestones** - For each month:
   - Testing prep (SSAT/ISEE)
   - School research & visits
   - Application components (essays, recommendations, activities list)
   - Extracurricular development
   - Interview preparation
   - Financial aid deadlines
3. **Critical Deadlines** - Key dates not to miss
4. **Weekly Habits** - Ongoing activities to maintain
5. **Stress Management Tips** - How to stay balanced
6. **Parent Action Items** - What parents should handle vs. student tasks

Be specific with timing. Account for the current date and work backwards from typical January application deadlines. Flag anything that's time-sensitive or approaching soon.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are an expert private school admissions timeline planner. Create actionable, realistic timelines that reduce stress and maximize preparation. Today\'s date is ' + new Date().toISOString().split('T')[0] + '.' },
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
