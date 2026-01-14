import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GradeEnhancement {
  category: string;
  grade: string;
  confidence: number;
  description: string;
  highlights: string[];
  sources: string[];
}

interface EnhancedSchoolData {
  schoolName: string;
  overallDescription: string;
  gradeEnhancements: GradeEnhancement[];
  keyStrengths: string[];
  areasForImprovement: string[];
  notablePrograms: string[];
  reputation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schoolId, schoolName, currentGrades } = await req.json();
    
    if (!schoolName) {
      throw new Error('School name is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert researcher on US private and boarding schools. Your task is to provide accurate, well-researched information about schools based on publicly available data from sources like:
- Niche.com school ratings
- PrepReview.com
- BoardingSchoolReview.com
- The Schools official websites
- US News & World Report
- Peterson's Guide

You should cross-reference multiple sources mentally and provide balanced, accurate assessments.

IMPORTANT: 
- Be factual and objective
- If you're not confident about specific data, indicate lower confidence
- Focus on well-documented strengths and programs
- Provide specific, verifiable information when possible`;

    const gradeCategories = [
      { key: 'academics', label: 'Academics', description: 'Academic rigor, curriculum quality, AP/honors courses, college prep' },
      { key: 'sports', label: 'Athletics', description: 'Athletic programs, facilities, competitive success, variety of sports' },
      { key: 'arts', label: 'Arts', description: 'Visual arts, music, theater, dance, creative programs' },
      { key: 'clubs', label: 'Extracurriculars', description: 'Clubs, student organizations, leadership opportunities' },
      { key: 'diversity', label: 'Diversity', description: 'Student body diversity, international students, inclusive culture' },
      { key: 'college_prep', label: 'College Preparation', description: 'College counseling, placement rates, college matriculation' },
      { key: 'campus', label: 'Campus', description: 'Campus beauty, size, location, environment' },
      { key: 'facilities', label: 'Facilities', description: 'Buildings, technology, labs, sports facilities, libraries' },
      { key: 'faculty', label: 'Faculty', description: 'Teacher credentials, student-teacher ratio, support' },
      { key: 'dorms', label: 'Residential Life', description: 'Dorm quality, residential programs, community' },
    ];

    const currentGradesInfo = currentGrades 
      ? `\n\nCurrent grades we have on file:\n${Object.entries(currentGrades)
          .filter(([_, grade]) => grade && grade !== 'N/A')
          .map(([cat, grade]) => `- ${cat}: ${grade}`)
          .join('\n')}`
      : '';

    const userPrompt = `Research and provide enhanced grade information for: ${schoolName}

${currentGradesInfo}

Based on publicly available information from school rating websites, official school data, and educational publications, provide:

1. An overall description of the school (2-3 sentences)
2. For each grade category, provide:
   - A recommended grade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F)
   - Confidence level (0-100) - how confident you are in this grade
   - A brief description (1-2 sentences) explaining the grade
   - 1-3 specific highlights or facts
   - Note any sources this is based on (e.g., "Niche.com", "school website")
3. Key strengths (3-5 points)
4. Areas for improvement (1-3 points, be diplomatic)
5. Notable programs or achievements
6. Overall reputation summary (1 sentence)

Be accurate and cite what you know. If you're uncertain, indicate lower confidence.`;

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
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_school_grades",
              description: "Provide enhanced grade information for a school",
              parameters: {
                type: "object",
                properties: {
                  schoolName: { type: "string" },
                  overallDescription: { type: "string" },
                  gradeEnhancements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
                        confidence: { type: "number", minimum: 0, maximum: 100 },
                        description: { type: "string" },
                        highlights: { type: "array", items: { type: "string" } },
                        sources: { type: "array", items: { type: "string" } }
                      },
                      required: ["category", "grade", "confidence", "description", "highlights", "sources"]
                    }
                  },
                  keyStrengths: { type: "array", items: { type: "string" } },
                  areasForImprovement: { type: "array", items: { type: "string" } },
                  notablePrograms: { type: "array", items: { type: "string" } },
                  reputation: { type: "string" }
                },
                required: ["schoolName", "overallDescription", "gradeEnhancements", "keyStrengths", "areasForImprovement", "notablePrograms", "reputation"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_school_grades" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'provide_school_grades') {
      throw new Error('Failed to get structured response from AI');
    }

    const enhancedData: EnhancedSchoolData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      success: true,
      schoolId,
      data: enhancedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in enhance-school-grades function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
