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
    const { section, difficulty } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const sectionPrompts: Record<string, string> = {
      verbal: `Generate 5 SSAT verbal reasoning questions for ${difficulty || 'middle'} level students. Include synonyms and analogies.`,
      quantitative: `Generate 5 SSAT quantitative/math questions for ${difficulty || 'middle'} level students. Include arithmetic, algebra basics, and geometry.`,
      reading: `Generate 5 SSAT reading comprehension questions for ${difficulty || 'middle'} level students. Include a short passage (150-200 words) and questions about main idea, inference, and vocabulary in context.`,
    };

    const systemPrompt = `You are an expert SSAT test prep tutor. Generate practice questions that match the actual SSAT format and difficulty.

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "passage": "Only include for reading section, otherwise null",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["A) option", "B) option", "C) option", "D) option", "E) option"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this is correct"
    }
  ]
}

Make questions age-appropriate and educational. Each question must have exactly 5 options (A-E) and clear explanations.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sectionPrompts[section] || sectionPrompts.verbal }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from AI response');
    }
    
    const questions = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in ssat-practice function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
