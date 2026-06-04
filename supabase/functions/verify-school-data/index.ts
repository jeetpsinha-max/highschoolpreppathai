import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Fields we attempt to verify against the web.
type VerifiableField =
  | "tuition"
  | "acceptance_rate"
  | "enrollment"
  | "founded_year"
  | "website"
  | "city"
  | "state"
  | "type"
  | "boarding";

interface SchoolRow {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  website: string | null;
  type: string | null;
  boarding: boolean | null;
  tuition: number | null;
  acceptance_rate: number | null;
  enrollment: number | null;
  founded_year: number | null;
}

interface ExtractedField {
  value: string | number | boolean | null;
  source: string | null;
  source_url: string | null;
  confidence: number; // 0-100
}

type Extracted = Partial<Record<VerifiableField, ExtractedField>> & {
  summary?: string;
};

// ---------- Firecrawl helpers ----------

async function firecrawlSearch(
  query: string,
  apiKey: string,
  limit = 4,
): Promise<{ url: string; title: string; markdown: string }[]> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
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
        markdown: String(r.markdown ?? r.description ?? "").slice(0, 4000),
      }))
      .filter((r: { markdown: string }) => r.markdown.length > 0);
  } catch (e) {
    console.error("Firecrawl search error", e);
    return [];
  }
}

async function firecrawlScrape(
  url: string,
  apiKey: string,
): Promise<{ url: string; title: string; markdown: string } | null> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    if (!res.ok) {
      console.error("Firecrawl scrape failed", res.status);
      return null;
    }
    const data = await res.json();
    const md = data?.data?.markdown ?? data?.markdown ?? "";
    if (!md) return null;
    return {
      url,
      title: data?.data?.metadata?.title ?? data?.metadata?.title ?? url,
      markdown: String(md).slice(0, 5000),
    };
  } catch (e) {
    console.error("Firecrawl scrape error", e);
    return null;
  }
}

// ---------- AI extraction ----------

async function extractWithAI(
  school: SchoolRow,
  sources: { url: string; title: string; markdown: string }[],
  apiKey: string,
): Promise<Extracted> {
  const context = sources
    .map((s, i) => `### Source ${i + 1}: ${s.title}\nURL: ${s.url}\n${s.markdown}`)
    .join("\n\n");

  const systemPrompt =
    "You are a meticulous data-verification analyst for a US private/boarding high school directory. " +
    "You are given web sources scraped from school websites, Niche, US News, Wikipedia and similar. " +
    "Extract ONLY facts that are explicitly supported by the provided sources. " +
    "Cross-reference across sources. If multiple sources agree, raise confidence. " +
    "If a value is NOT found in the sources, return null for that field and confidence 0 — never guess. " +
    "All content must be appropriate for middle/high school students.";

  const userPrompt =
    `Verify the directory data for this school using the sources below.\n\n` +
    `School on file: ${school.name}` +
    `${school.city ? `, ${school.city}` : ""}${school.state ? `, ${school.state}` : ""}\n` +
    `Current values on file (may be inaccurate):\n` +
    `- tuition: ${school.tuition ?? "unknown"}\n` +
    `- acceptance_rate: ${school.acceptance_rate ?? "unknown"}\n` +
    `- enrollment: ${school.enrollment ?? "unknown"}\n` +
    `- founded_year: ${school.founded_year ?? "unknown"}\n` +
    `- website: ${school.website ?? "unknown"}\n` +
    `- type: ${school.type ?? "unknown"}\n` +
    `- boarding: ${school.boarding ?? "unknown"}\n\n` +
    `For each field, provide the verified value, the source name, the source URL it came from, ` +
    `and a confidence 0-100. tuition = annual USD integer (boarding tuition if boarding). ` +
    `acceptance_rate = decimal between 0 and 1 (e.g. 0.18 for 18%). enrollment = integer total students. ` +
    `founded_year = 4-digit year. Only include fields you can actually support from the sources.\n\n` +
    `=== SOURCES ===\n${context || "(no sources retrieved)"}`;

  const fieldSchema = {
    type: "object",
    properties: {
      value: { type: ["string", "number", "boolean", "null"] },
      source: { type: ["string", "null"] },
      source_url: { type: ["string", "null"] },
      confidence: { type: "number", minimum: 0, maximum: 100 },
    },
    required: ["value", "confidence"],
  };

  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
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
            name: "report_verified_data",
            description: "Report verified school data with per-field sources and confidence.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "1-2 sentence note on what was verified." },
                tuition: fieldSchema,
                acceptance_rate: fieldSchema,
                enrollment: fieldSchema,
                founded_year: fieldSchema,
                website: fieldSchema,
                city: fieldSchema,
                state: fieldSchema,
                type: fieldSchema,
                boarding: fieldSchema,
              },
              required: ["summary"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_verified_data" } },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("CREDITS_EXHAUSTED");
    throw new Error(`AI error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("No structured AI response");
  return JSON.parse(toolCall.function.arguments) as Extracted;
}

// ---------- value normalisation / comparison ----------

function coerce(field: VerifiableField, raw: unknown): string | number | boolean | null {
  if (raw === null || raw === undefined || raw === "") return null;
  switch (field) {
    case "tuition":
    case "enrollment":
    case "founded_year": {
      const n = typeof raw === "number" ? raw : parseInt(String(raw).replace(/[^0-9]/g, ""), 10);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    case "acceptance_rate": {
      // Stored as a percentage number (e.g. 13 means 13%).
      let n = typeof raw === "number" ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(n)) return null;
      if (n > 0 && n <= 1) n = n * 100; // AI returned a decimal -> percent
      return n > 0 && n <= 100 ? Math.round(n * 10) / 10 : null;
    }
    case "boarding": {
      if (typeof raw === "boolean") return raw;
      const s = String(raw).toLowerCase();
      if (["true", "yes", "boarding"].includes(s)) return true;
      if (["false", "no", "day"].includes(s)) return false;
      return null;
    }
    case "website": {
      let s = String(raw).trim();
      if (!s) return null;
      if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
      return s;
    }
    default:
      return String(raw).trim() || null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { schoolId, minConfidence = 60 } = await req.json();
    if (!schoolId) throw new Error("schoolId is required");

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
      .select("id,name,city,state,website,type,boarding,tuition,acceptance_rate,enrollment,founded_year")
      .eq("id", schoolId)
      .single();
    if (schoolErr || !school) throw new Error("School not found");

    const s = school as SchoolRow;
    const locality = [s.city, s.state].filter(Boolean).join(", ");

    // 1. Gather web sources.
    const sources: { url: string; title: string; markdown: string }[] = [];

    if (s.website) {
      const scraped = await firecrawlScrape(s.website, FIRECRAWL_API_KEY);
      if (scraped) sources.push(scraped);
    }

    const searchResults = await firecrawlSearch(
      `${s.name} ${locality} private school tuition acceptance rate enrollment founded`,
      FIRECRAWL_API_KEY,
      4,
    );
    for (const r of searchResults) {
      if (!sources.some((x) => x.url === r.url)) sources.push(r);
    }

    // 2. Extract + cross-reference with AI.
    const extracted = await extractWithAI(s, sources, LOVABLE_API_KEY);

    // 3. Build update + provenance + audit.
    const fields: VerifiableField[] = [
      "tuition", "acceptance_rate", "enrollment", "founded_year",
      "website", "city", "state", "type", "boarding",
    ];

    const update: Record<string, unknown> = {};
    const fieldSources: Record<string, unknown> = {};
    const auditRows: Record<string, unknown>[] = [];
    const confidences: number[] = [];
    let verifiedCount = 0;

    for (const f of fields) {
      const ef = extracted[f];
      if (!ef) continue;
      const value = coerce(f, ef.value);
      const confidence = Math.max(0, Math.min(100, Number(ef.confidence) || 0));
      if (value === null) continue;

      confidences.push(confidence);

      // Record provenance for any field the web confirmed above threshold.
      if (confidence >= minConfidence) {
        verifiedCount++;
        fieldSources[f] = {
          value,
          source: ef.source ?? null,
          source_url: ef.source_url ?? null,
          confidence,
          verified_at: new Date().toISOString(),
        };

        const current = (s as Record<string, unknown>)[f] ?? null;
        const changed = String(current ?? "") !== String(value ?? "");
        if (changed) update[f] = value;

        auditRows.push({
          school_id: s.id,
          field: f,
          old_value: current === null ? null : String(current),
          new_value: String(value),
          source: ef.source ?? null,
          source_url: ef.source_url ?? null,
          confidence,
          changed,
        });
      }
    }

    const avgConfidence = confidences.length
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 0;

    const status =
      verifiedCount >= 4 ? "web_verified"
        : verifiedCount >= 1 ? "partially_verified"
        : "unverified";

    update.field_sources = fieldSources;
    update.data_confidence = avgConfidence;
    update.verification_status = status;
    update.last_verified_at = new Date().toISOString();
    update.verification_notes = extracted.summary ?? null;

    const { error: updErr } = await supabase.from("schools").update(update).eq("id", s.id);
    if (updErr) throw new Error(`Failed to update school: ${updErr.message}`);

    if (auditRows.length) {
      const { error: auditErr } = await supabase.from("school_data_audit").insert(auditRows);
      if (auditErr) console.error("Audit insert failed", auditErr.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        schoolId: s.id,
        status,
        verifiedFields: verifiedCount,
        changedFields: Object.keys(update).filter((k) =>
          fields.includes(k as VerifiableField)
        ),
        dataConfidence: avgConfidence,
        sourcesUsed: sources.map((x) => x.url),
        summary: extracted.summary ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("verify-school-data error:", message);
    const status = message === "RATE_LIMIT" ? 429 : message === "CREDITS_EXHAUSTED" ? 402 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
