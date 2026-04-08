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
    const { letterType, context, schoolName, recipientName, studentName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const typePrompts: Record<string, string> = {
      recommendation_request: `Write a polished letter from a parent requesting a recommendation letter for their child ${studentName || 'the student'} applying to ${schoolName || 'a private school'}.

Recipient: ${recipientName || 'the teacher/mentor'}
Context: ${context}

Include:
- Warm, professional opening
- Specific reasons this person is ideal to write the recommendation
- Key qualities/achievements to highlight
- Timeline and deadline information
- Offer to provide additional information
- Gracious closing`,

      thank_you: `Write a heartfelt thank-you letter from a parent after ${context || 'a school visit/interview'} at ${schoolName || 'the school'}.

${recipientName ? `To: ${recipientName}` : ''}
${studentName ? `Regarding: ${studentName}` : ''}

Include:
- Specific details from the interaction
- What impressed the family most
- Reiteration of interest
- Professional but warm tone`,

      follow_up: `Write a professional follow-up letter from a parent to ${schoolName || 'the school'} regarding ${context || 'the application status'}.

${recipientName ? `To: ${recipientName}` : ''}
${studentName ? `Regarding: ${studentName}` : ''}

Include:
- Reference to previous interaction
- Updated information or achievements
- Continued interest
- Polite inquiry about next steps`,

      appeal: `Write a respectful financial aid appeal letter to ${schoolName || 'the school'}.

Context: ${context}
${studentName ? `Student: ${studentName}` : ''}

Include:
- Appreciation for the offer received
- Changed circumstances or additional information
- Specific request with reasoning
- Family's commitment to the school
- Professional, non-demanding tone`,
    };

    const prompt = typePrompts[letterType] || typePrompts.thank_you;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are an expert at writing polished, professional letters for parents navigating the private school admissions process. Your letters are warm but professional, specific but not overly long, and always strike the right tone.' },
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
