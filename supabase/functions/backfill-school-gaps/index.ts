import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin, AuthError } from "../_shared/adminAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface SchoolRow {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  website: string | null;
  type: string | null;
  boarding: boolean | null;
  image_url: string | null;
  notes: string | null;
  field_sources: Record<string, unknown> | null;
}

// ---------- Firecrawl helpers ----------

async function firecrawlSearch(
  query: string,
  apiKey: string,
  limit = 5,
): Promise<{ url: string; title: string }[]> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) {
      console.error("Firecrawl search failed", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    const results = data?.data?.web ?? data?.data ?? data?.web ?? [];
    return (Array.isArray(results) ? results : [])
      .map((r: Record<string, unknown>) => ({
        url: String(r.url ?? ""),
        title: String(r.title ?? ""),
      }))
      .filter((r: { url: string }) => r.url.startsWith("http"));
  } catch (e) {
    console.error("Firecrawl search error", e);
    return [];
  }
}

interface ScrapeResult {
  url: string;
  title: string;
  markdown: string;
  summary: string | null;
  ogImage: string | null;
  logo: string | null;
}

async function firecrawlScrape(url: string, apiKey: string): Promise<ScrapeResult | null> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        formats: ["markdown", "summary", "branding"],
        onlyMainContent: true,
      }),
    });
    if (!res.ok) {
      console.error("Firecrawl scrape failed", res.status);
      return null;
    }
    const data = await res.json();
    const root = data?.data ?? data;
    const branding = root?.branding ?? {};
    const images = branding?.images ?? {};
    return {
      url,
      title: root?.metadata?.title ?? url,
      markdown: String(root?.markdown ?? "").slice(0, 5000),
      summary: root?.summary ? String(root.summary).slice(0, 1200) : null,
      ogImage: images?.ogImage ? String(images.ogImage) : null,
      logo: images?.logo ?? branding?.logo ? String(images?.logo ?? branding?.logo) : null,
    };
  } catch (e) {
    console.error("Firecrawl scrape error", e);
    return null;
  }
}

function isValidImageUrl(u: string | null): u is string {
  if (!u) return false;
  if (!/^https?:\/\//i.test(u)) return false;
  // Avoid tiny tracking pixels / data URIs
  if (u.startsWith("data:")) return false;
  return true;
}

function normalizeWebsite(u: string): string {
  let s = u.trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s.replace(/\/$/, "");
}

// ---------- AI description ----------

async function generateDescription(
  school: SchoolRow,
  source: ScrapeResult,
  apiKey: string,
): Promise<{ description: string; confidence: number } | null> {
  const systemPrompt =
    "You write short, factual directory descriptions for a US private/boarding high school finder used by middle and high school students and their parents. " +
    "Write ONLY from the provided source content — never invent facts. " +
    "Keep it strictly age-appropriate (no adult themes). Be neutral and informative.";

  const userPrompt =
    `Write a concise 2-3 sentence description for "${school.name}"` +
    `${school.city ? ` in ${school.city}` : ""}${school.state ? `, ${school.state}` : ""}.\n` +
    `Mention what kind of school it is, notable academic/athletic/arts focus, and setting if stated. ` +
    `Use only facts found in the source below. If the source has too little to support a real description, return confidence 0.\n\n` +
    `=== SOURCE: ${source.title} (${source.url}) ===\n` +
    `${source.summary ?? source.markdown}`;

  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_description",
            description: "Report a sourced school description.",
            parameters: {
              type: "object",
              properties: {
                description: { type: "string", description: "2-3 sentence factual description, or empty if unsupported." },
                confidence: { type: "number", description: "0-100 confidence the description is supported by the source." },
              },
              required: ["description", "confidence"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_description" } },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("CREDITS_EXHAUSTED");
    throw new Error(`AI error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return null;
  const parsed = JSON.parse(toolCall.function.arguments) as { description?: string; confidence?: number };
  const description = (parsed.description ?? "").trim();
  const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 0));
  if (!description) return null;
  return { description, confidence };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    await requireAdmin(req);
    const { schoolId, minConfidence = 60, target } = await req.json();
    if (!schoolId) throw new Error("schoolId is required");
    // When a specific target field is requested, only that field is written.
    const onlyField: string | null =
      target === "image_url" || target === "website" || target === "notes" ? target : null;

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: school, error: schoolErr } = await supabase
      .from("schools")
      .select("id,name,city,state,website,type,boarding,image_url,notes,field_sources")
      .eq("id", schoolId)
      .single();
    if (schoolErr || !school) throw new Error("School not found");

    const s = school as SchoolRow;
    const locality = [s.city, s.state].filter(Boolean).join(", ");

    const needsWebsite = !s.website || s.website.trim() === "";
    const needsImage = !s.image_url || s.image_url.trim() === "";
    const needsNotes = !s.notes || s.notes.trim() === "";

    // Which fields we are allowed to write (respecting an optional target).
    const wantWebsite = !onlyField || onlyField === "website";
    const wantImage = !onlyField || onlyField === "image_url";
    const wantNotes = !onlyField || onlyField === "notes";

    const filledFields: string[] = [];

    const hasTargetGap =
      (needsWebsite && wantWebsite) ||
      (needsImage && wantImage) ||
      (needsNotes && wantNotes);

    if (!hasTargetGap) {
      return new Response(
        JSON.stringify({ success: true, schoolId: s.id, status: "complete", filledFields: [], message: "No gaps to fill" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1. Resolve official website if missing.
    let website = s.website ? normalizeWebsite(s.website) : null;
    let websiteSource: string | null = null;
    if (needsWebsite) {
      const results = await firecrawlSearch(
        `${s.name} ${locality} private school official website`,
        FIRECRAWL_API_KEY,
        5,
      );
      // Prefer a result that is clearly the school's own site (not niche/usnews/wikipedia).
      const aggregators = ["niche.com", "usnews.com", "wikipedia.org", "greatschools.org", "facebook.com", "linkedin.com", "boardingschoolreview.com", "privateschoolreview.com"];
      const own = results.find((r) => !aggregators.some((a) => r.url.includes(a)));
      const pick = own ?? results[0];
      if (pick) {
        website = normalizeWebsite(pick.url);
        websiteSource = pick.url;
      }
    }

    // 2. Scrape the best available page for image + description content.
    let scraped: ScrapeResult | null = null;
    if (website) {
      scraped = await firecrawlScrape(website, FIRECRAWL_API_KEY);
    }
    if (!scraped && ((needsImage && wantImage) || (needsNotes && wantNotes))) {
      // Fall back to a search result page if direct site scrape failed.
      const results = await firecrawlSearch(`${s.name} ${locality} private school`, FIRECRAWL_API_KEY, 3);
      for (const r of results) {
        scraped = await firecrawlScrape(r.url, FIRECRAWL_API_KEY);
        if (scraped) break;
      }
    }

    const update: Record<string, unknown> = {};
    const fieldSources: Record<string, unknown> = {
      ...(s.field_sources && typeof s.field_sources === "object" ? s.field_sources : {}),
    };
    const auditRows: Record<string, unknown>[] = [];
    const nowIso = new Date().toISOString();

    // Website
    if (needsWebsite && wantWebsite && website && websiteSource) {
      update.website = website;
      fieldSources.website = {
        value: website,
        source: "Web search",
        source_url: websiteSource,
        confidence: 80,
        verified_at: nowIso,
      };
      auditRows.push({
        school_id: s.id, field: "website", old_value: null, new_value: website,
        source: "Web search", source_url: websiteSource, confidence: 80, changed: true,
      });
      filledFields.push("website");
    }

    // Image
    if (needsImage && wantImage && scraped) {
      const imageCandidate = isValidImageUrl(scraped.ogImage)
        ? scraped.ogImage
        : isValidImageUrl(scraped.logo)
          ? scraped.logo
          : null;
      if (imageCandidate) {
        update.image_url = imageCandidate;
        fieldSources.image_url = {
          value: imageCandidate,
          source: scraped.title,
          source_url: scraped.url,
          confidence: 75,
          verified_at: nowIso,
        };
        auditRows.push({
          school_id: s.id, field: "image_url", old_value: null, new_value: imageCandidate,
          source: scraped.title, source_url: scraped.url, confidence: 75, changed: true,
        });
        filledFields.push("image_url");
      }
    }

    // Notes / description
    if (needsNotes && wantNotes && scraped) {
      const desc = await generateDescription(s, scraped, LOVABLE_API_KEY);
      if (desc && desc.confidence >= minConfidence) {
        update.notes = desc.description;
        fieldSources.notes = {
          value: desc.description,
          source: scraped.title,
          source_url: scraped.url,
          confidence: desc.confidence,
          verified_at: nowIso,
        };
        auditRows.push({
          school_id: s.id, field: "notes", old_value: null, new_value: desc.description,
          source: scraped.title, source_url: scraped.url, confidence: desc.confidence, changed: true,
        });
        filledFields.push("notes");
      }
    }

    if (filledFields.length > 0) {
      update.field_sources = fieldSources;
      update.last_verified_at = nowIso;
      const { error: updErr } = await supabase.from("schools").update(update).eq("id", s.id);
      if (updErr) throw new Error(`Failed to update school: ${updErr.message}`);

      if (auditRows.length) {
        const { error: auditErr } = await supabase.from("school_data_audit").insert(auditRows);
        if (auditErr) console.error("Audit insert failed", auditErr.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        schoolId: s.id,
        status: filledFields.length ? "filled" : "no_data_found",
        filledFields,
        sourceUrl: scraped?.url ?? websiteSource ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("backfill-school-gaps error:", message);
    const status = error instanceof AuthError
      ? error.status
      : message === "RATE_LIMIT" ? 429 : message === "CREDITS_EXHAUSTED" ? 402 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
