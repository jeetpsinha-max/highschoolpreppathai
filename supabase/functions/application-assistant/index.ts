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
    const { type, content, schoolName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompts: Record<string, string> = {
      brainstorm: `Help a student brainstorm essay ideas for their school application${schoolName ? ` to ${schoolName}` : ''}. 
        
The student's interests/background: ${content}

Provide:
1. 5 unique essay topic ideas with brief descriptions
2. Key themes to explore
3. Personal angles to consider
4. Tips for making it memorable

Keep suggestions age-appropriate and authentic to a middle/high school student's voice.`,

      improve: `Review and improve this application essay draft${schoolName ? ` for ${schoolName}` : ''}:

"${content}"

Provide:
1. Overall assessment (strengths and areas for improvement)
2. Specific line-by-line suggestions
3. A revised version that maintains the student's voice
4. Tips for the student to apply to future writing

Keep feedback constructive, encouraging, and age-appropriate.`,

      activities: `Help organize and present this student's activities and achievements for their application${schoolName ? ` to ${schoolName}` : ''}:

Activities/achievements: ${content}

Provide:
1. Organized activity list with categories (Academic, Arts, Sports, Community Service, Leadership, etc.)
2. Suggested descriptions that highlight impact and growth
3. Tips for presenting activities effectively
4. Potential activities to highlight based on school focus
5. Any gaps to address before applying

Format as a polished activity list ready for applications.`,

      email: `Help write a professional inquiry email${schoolName ? ` to ${schoolName}` : ''}.

Context: ${content}

Provide:
1. A polished, professional email draft
2. Subject line options
3. Tips for follow-up
4. What to avoid

Keep the tone respectful, age-appropriate, and professional.`,

      parent_summary: `Create a parent-friendly summary of the application process and progress${schoolName ? ` for ${schoolName}` : ''}.

Student details: ${content}

Provide:
1. Clear timeline of application milestones
2. What's been completed vs. what's pending
3. How parents can help
4. Key dates to remember
5. Questions parents might want to ask

Keep it informative but not overwhelming.`,

      chat: `You are a helpful essay feedback assistant for a student applying to private schools${schoolName ? `, specifically ${schoolName}` : ''}.

The student is asking a question about their essay or application materials:
"${content}"

Provide a helpful, encouraging response that:
1. Directly answers their question
2. Gives specific, actionable advice
3. Maintains a supportive, mentoring tone
4. Is appropriate for middle/high school students

Keep your response conversational but informative.`
    };

    const systemPrompt = `You are an expert private school admissions counselor helping students with their applications. 
Your guidance is:
- Age-appropriate and supportive
- Authentic (helping students find their voice, not writing for them)
- Practical and actionable
- Encouraging while being honest

Always maintain a warm, mentoring tone appropriate for middle and high school students.`;

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
          { role: 'user', content: prompts[type] || prompts.brainstorm }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(JSON.stringify({ result, type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in application-assistant function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
