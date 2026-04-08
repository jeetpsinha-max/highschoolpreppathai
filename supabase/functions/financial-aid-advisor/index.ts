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
    const { familyInfo, schoolNames, questions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const prompt = `You are an expert private school financial aid advisor. Based on the following information, provide detailed, actionable financial aid guidance.

Family Information:
${familyInfo}

${schoolNames?.length ? `Target Schools: ${schoolNames.join(', ')}` : ''}
${questions ? `Specific Questions: ${questions}` : ''}

Provide comprehensive advice covering:
1. **Estimated Aid Eligibility** - Based on the information provided, estimate likely aid ranges
2. **Scholarship Opportunities** - Specific merit-based and need-based scholarships to pursue
3. **Application Strategy** - How to maximize financial aid offers
4. **Key Deadlines** - Typical financial aid deadlines and when to apply
5. **Negotiation Tips** - How to appeal or negotiate aid packages
6. **Alternative Funding** - External scholarships, payment plans, and other options
7. **Documents Needed** - What financial documents to prepare

Be specific, practical, and encouraging. Format with clear headers and bullet points.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a knowledgeable private school financial aid advisor. Give specific, actionable advice. Be encouraging but realistic.' },
          { role: 'user', content: prompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited, please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
