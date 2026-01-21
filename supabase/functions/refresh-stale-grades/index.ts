import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find grades older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: staleGrades, error: fetchError } = await supabase
      .from('enhanced_school_grades')
      .select('school_id')
      .lt('updated_at', sevenDaysAgo);

    if (fetchError) {
      throw new Error(`Failed to fetch stale grades: ${fetchError.message}`);
    }

    if (!staleGrades || staleGrades.length === 0) {
      console.log('No stale grades found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No stale grades to refresh',
        refreshed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${staleGrades.length} stale grade records to refresh`);

    // Get school details for stale grades
    const schoolIds = staleGrades.map(g => g.school_id);
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .in('id', schoolIds);

    if (schoolsError) {
      throw new Error(`Failed to fetch schools: ${schoolsError.message}`);
    }

    let refreshed = 0;
    let errors: string[] = [];

    // Process in batches of 3 to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(async (school) => {
          const currentGrades = {
            academics: school.academics_grade,
            arts: school.arts_grade,
            athletics: school.sports_grade,
            clubs: school.clubs_grade,
            diversity: school.diversity_grade,
            collegePrep: school.college_prep_grade,
            campus: school.campus_grade,
            facilities: school.facilities_grade,
            faculty: school.faculty_grade,
            dorms: school.dorms_grade,
          };

          // Call the enhance-school-grades function with forceRefresh
          const response = await fetch(`${supabaseUrl}/functions/v1/enhance-school-grades`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              schoolId: school.id,
              schoolName: school.name,
              currentGrades,
              forceRefresh: true
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to refresh ${school.name}: ${errorText}`);
          }

          return school.name;
        })
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          refreshed++;
          console.log(`Refreshed grades for: ${result.value}`);
        } else {
          errors.push(batch[idx].name);
          console.error(`Error refreshing ${batch[idx].name}:`, result.reason);
        }
      });

      // Small delay between batches
      if (i + batchSize < schools.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Refresh complete. Refreshed: ${refreshed}, Errors: ${errors.length}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Refreshed ${refreshed} stale grade records`,
      refreshed,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in refresh-stale-grades:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
