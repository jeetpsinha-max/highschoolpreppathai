import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin, AuthError } from "../_shared/adminAuth.ts";
import {
  gradePopulation,
  GRADING_VERSION,
  GRADE_OPTIONS,
  type GradableSchool,
} from "../_shared/gradingModel.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    // Preview by default — writing 1,700 rows should be a deliberate act.
    const apply: boolean = body.apply === true;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // The curve is relative to the whole population, so every row is needed.
    const rows: (GradableSchool & { id: string })[] = [];
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("schools")
        .select(
          "id,name,boarding,acceptance_rate,academics_grade,college_prep_grade,faculty_grade," +
            "facilities_grade,campus_grade,sports_grade,arts_grade,clubs_grade," +
            "diversity_grade,dorms_grade",
        )
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) throw new Error(error.message);
      rows.push(...((data ?? []) as (GradableSchool & { id: string })[]));
      if (!data || data.length < pageSize) break;
    }

    const { graded, ungraded } = gradePopulation(rows);

    // Resulting letter distribution, for sanity-checking the curve.
    const distribution: Record<string, number> = {};
    for (const g of GRADE_OPTIONS) distribution[g] = 0;
    for (const g of graded) distribution[g.overall_grade]++;

    const scores = graded.map((g) => g.overall_score).sort((a, b) => a - b);
    const stats = scores.length
      ? {
          min: scores[0],
          median: scores[Math.floor(scores.length / 2)],
          max: scores[scores.length - 1],
          meanCoverage:
            Math.round(
              (graded.reduce((s, g) => s + g.grade_coverage, 0) / graded.length) * 1000,
            ) / 1000,
        }
      : null;

    if (!apply) {
      return new Response(
        JSON.stringify({
          success: true,
          mode: "preview",
          version: GRADING_VERSION,
          totalSchools: rows.length,
          gradedCount: graded.length,
          ungradedCount: ungraded.length,
          distribution,
          stats,
          sample: graded.slice(0, 15),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---------- persist ----------
    const graded_at = new Date().toISOString();
    let updated = 0;
    const errors: { id: string; error: string }[] = [];

    // Chunked so a single failure can't lose the whole run.
    const chunkSize = 100;
    for (let i = 0; i < graded.length; i += chunkSize) {
      const chunk = graded.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (g) => {
          const { error } = await supabase
            .from("schools")
            .update({
              overall_score: g.overall_score,
              overall_grade: g.overall_grade,
              grade_percentile: g.grade_percentile,
              grade_coverage: g.grade_coverage,
              graded_at,
              grading_version: GRADING_VERSION,
            })
            .eq("id", g.id);
          if (error) errors.push({ id: g.id, error: error.message });
          else updated++;
        }),
      );
    }

    // Schools with no usable inputs are explicitly marked as ungraded.
    if (ungraded.length > 0) {
      for (let i = 0; i < ungraded.length; i += 200) {
        const { error } = await supabase
          .from("schools")
          .update({
            overall_score: null,
            overall_grade: null,
            grade_percentile: null,
            grade_coverage: 0,
            graded_at,
            grading_version: GRADING_VERSION,
          })
          .in("id", ungraded.slice(i, i + 200));
        if (error) console.error("clearing ungraded failed:", error.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode: "apply",
        version: GRADING_VERSION,
        updated,
        ungraded: ungraded.length,
        distribution,
        stats,
        errors: errors.slice(0, 20),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("recompute-grades error:", message);
    const status = error instanceof AuthError ? error.status : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
