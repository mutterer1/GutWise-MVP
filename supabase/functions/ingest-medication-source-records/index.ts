import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";
const DAILYMED_BASE = "https://dailymed.nlm.nih.gov/dailymed/services/v2";
const RXNORM_PROVIDER_KEY = "rxnorm";
const DAILYMED_PROVIDER_KEY = "dailymed";
const DAILYMED_VERSION_LABEL = "dailymed-v2-current";

type SupabaseClient = ReturnType<typeof createClient>;

interface MedicationIngestionRequest {
  name?: string;
  rxnormCode?: string;
  includeDailyMed?: boolean;
  pageSize?: number;
  medicationReferenceId?: string | null;
}

interface RxNormConcept {
  rxcui?: string;
  name?: string;
  synonym?: string;
  tty?: string;
  psn?: string;
}

interface DailyMedSpl {
  setid?: string;
  spl_version?: string;
  title?: string;
  published_date?: string;
}

interface MedicationSourceRecordInsert {
  medication_reference_id: string | null;
  source_id: string;
  source_version_id: string | null;
  provider_key: string;
  provider_medication_id: string;
  rxnorm_code: string | null;
  set_id: string | null;
  generic_name: string | null;
  display_name: string;
  brand_names: string[];
  active_ingredients: string[];
  medication_class: string | null;
  medication_family: string | null;
  route: string | null;
  dosage_form: string | null;
  strength_label: string | null;
  medication_type: "prescription" | "otc" | "supplement" | "unknown";
  gut_relevance: "primary" | "secondary" | "indirect" | "unknown";
  common_gut_effects: string[];
  interaction_flags: string[];
  adverse_reactions: string[];
  label_sections: Record<string, unknown>;
  provider_payload: Record<string, unknown>;
  match_confidence: number | null;
  review_status: "cached";
  retrieved_at: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function clampLimit(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 8;
  return Math.max(1, Math.min(Math.round(value), 20));
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function parseBrandName(name: string): string[] {
  const matches = [...name.matchAll(/\[([^\]]+)\]/g)];
  return dedupe(matches.map((match) => match[1]));
}

function stripBrand(name: string): string {
  return name.replace(/\[[^\]]+\]/g, "").trim();
}

function parseStrengthLabel(name: string): string | null {
  const matches = stripBrand(name).match(/\b\d+(?:\.\d+)?\s*(?:MG|MCG|G|ML|UNT|UNIT|MEQ|%)\b(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:MG|MCG|G|ML|UNT|UNIT|MEQ|%))?/i);
  return matches?.[0] ?? null;
}

function parseGenericName(name: string): string | null {
  const withoutBrand = stripBrand(name);
  const beforeDose = withoutBrand.split(/\b\d+(?:\.\d+)?\s*(?:MG|MCG|G|ML|UNT|UNIT|MEQ|%)\b/i)[0]?.trim();
  if (beforeDose) return beforeDose;
  return withoutBrand.split(/\b(oral|tablet|capsule|solution|suspension|injection)\b/i)[0]?.trim() ?? null;
}

function parseDosageForm(name: string): string | null {
  const lower = name.toLowerCase();
  const forms = ["tablet", "capsule", "solution", "suspension", "injection", "powder", "cream", "ointment", "gel", "patch", "spray"];
  return forms.find((form) => lower.includes(form)) ?? null;
}

function parseRoute(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes("oral")) return "oral";
  if (lower.includes("injection") || lower.includes("injectable")) return "injection";
  if (lower.includes("topical") || lower.includes("cream") || lower.includes("ointment") || lower.includes("gel")) return "topical";
  if (lower.includes("nasal")) return "nasal";
  if (lower.includes("inhalation") || lower.includes("inhaler")) return "inhaled";
  if (lower.includes("rectal")) return "rectal";
  return null;
}

function parseActiveIngredients(name: string): string[] {
  const generic = parseGenericName(name);
  if (!generic) return [];
  return dedupe(generic.split(/\s*\/\s*|\s+\+\s+/));
}

function inferMedicationFamily(name: string): string | null {
  const lower = name.toLowerCase();
  if (/\bomeprazole|pantoprazole|esomeprazole|lansoprazole\b/.test(lower)) return "ppi";
  if (/\bfamotidine|cimetidine\b/.test(lower)) return "h2_blocker";
  if (/\bamoxicillin|azithromycin|doxycycline|ciprofloxacin|metronidazole\b/.test(lower)) return "antibiotic";
  if (/\bloperamide\b/.test(lower)) return "antidiarrheal";
  if (/\bpolyethylene glycol|senna|bisacodyl\b/.test(lower)) return "laxative";
  if (/\bibuprofen|naproxen|diclofenac\b/.test(lower)) return "nsaid";
  if (/\bmetformin\b/.test(lower)) return "metformin";
  if (/\bsertraline|fluoxetine|escitalopram|citalopram\b/.test(lower)) return "ssri";
  return null;
}

function inferGutEffects(name: string, adverseReactions: string[]): string[] {
  const lower = `${name} ${adverseReactions.join(" ")}`.toLowerCase();
  const effects = new Set<string>();
  if (lower.includes("nausea")) effects.add("nausea");
  if (lower.includes("diarrhea")) effects.add("diarrhea");
  if (lower.includes("constipation")) effects.add("constipation");
  if (lower.includes("abdominal pain")) effects.add("abdominal pain");
  if (lower.includes("vomiting")) effects.add("vomiting");
  if (lower.includes("dyspepsia") || lower.includes("reflux")) effects.add("reflux or dyspepsia");
  return [...effects].sort();
}

function inferInteractionFlags(name: string): string[] {
  const family = inferMedicationFamily(name);
  const map: Record<string, string[]> = {
    ppi: ["acid_suppression"],
    h2_blocker: ["acid_suppression"],
    antibiotic: ["microbiome_shift"],
    antidiarrheal: ["motility_slowing"],
    laxative: ["motility_acceleration"],
    nsaid: ["stomach_irritation", "upper_gi_bleeding_risk"],
    metformin: ["gi_upset"],
    ssri: ["nausea_tendency"],
  };
  return family ? map[family] ?? [] : [];
}

function collectStrings(value: unknown, output: string[] = []): string[] {
  if (typeof value === "string") {
    const trimmed = value.replace(/\s+/g, " ").trim();
    if (trimmed.length > 0 && trimmed.length <= 2000) output.push(trimmed);
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, output);
    return output;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, output);
  }

  return output;
}

function extractAdverseReactions(payload: unknown): string[] {
  const text = collectStrings(payload).join(" ").toLowerCase();
  const reactions = [
    "nausea",
    "diarrhea",
    "constipation",
    "vomiting",
    "abdominal pain",
    "dyspepsia",
    "flatulence",
    "gastritis",
    "gastrointestinal bleeding",
    "dry mouth",
    "bloating",
  ];

  return reactions.filter((reaction) => text.includes(reaction));
}

function trimPayload(payload: unknown): Record<string, unknown> {
  const strings = collectStrings(payload).slice(0, 40);
  return { text_excerpt: strings };
}

async function requireAuthenticatedClient(req: Request): Promise<SupabaseClient> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase Edge Function environment is not configured.");
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await authClient.auth.getUser();
  if (error || !data.user) {
    throw new Error("Unauthorized.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

async function fetchSource(client: SupabaseClient, providerKey: string): Promise<{ id: string }> {
  const { data, error } = await client
    .from("reference_sources")
    .select("id")
    .eq("provider_key", providerKey)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`${providerKey} source row not found. Apply the evidence backbone migration first.`);
  return data as { id: string };
}

async function upsertSourceVersion(
  client: SupabaseClient,
  sourceId: string,
  versionLabel: string,
  metadata: Record<string, unknown>,
): Promise<{ id: string }> {
  const { data, error } = await client
    .from("reference_source_versions")
    .upsert(
      {
        source_id: sourceId,
        version_label: versionLabel,
        retrieved_at: new Date().toISOString(),
        metadata,
      },
      { onConflict: "source_id,version_label" },
    )
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`Unable to create source version ${versionLabel}.`);
  return data as { id: string };
}

async function fetchRxNormVersion(): Promise<{ version: string; apiVersion: string | null }> {
  const response = await fetch(`${RXNORM_BASE}/version.json`);
  if (!response.ok) throw new Error(`RxNorm version lookup failed with status ${response.status}.`);
  const data = await response.json() as { version?: string; apiVersion?: string };
  return {
    version: data.version ?? "rxnorm-current",
    apiVersion: data.apiVersion ?? null,
  };
}

async function fetchRxNormConcepts(request: MedicationIngestionRequest): Promise<RxNormConcept[]> {
  const limit = clampLimit(request.pageSize);

  if (cleanText(request.rxnormCode)) {
    const rxcui = cleanText(request.rxnormCode)!;
    const response = await fetch(`${RXNORM_BASE}/rxcui/${encodeURIComponent(rxcui)}/properties.json`);
    if (!response.ok) throw new Error(`RxNorm properties lookup failed with status ${response.status}.`);
    const data = await response.json() as { properties?: RxNormConcept };
    return data.properties ? [data.properties] : [];
  }

  const name = cleanText(request.name);
  if (!name) return [];

  const params = new URLSearchParams({ name, expand: "psn" });
  const response = await fetch(`${RXNORM_BASE}/drugs.json?${params.toString()}`);
  if (!response.ok) throw new Error(`RxNorm drug lookup failed with status ${response.status}.`);

  const data = await response.json() as {
    drugGroup?: {
      conceptGroup?: Array<{
        tty?: string;
        conceptProperties?: RxNormConcept[];
      }>;
    };
  };

  const preferredTtys = new Set(["SCD", "SBD", "GPCK", "BPCK"]);
  const concepts = (data.drugGroup?.conceptGroup ?? [])
    .flatMap((group) =>
      (group.conceptProperties ?? []).map((concept) => ({
        ...concept,
        tty: concept.tty ?? group.tty,
      }))
    )
    .filter((concept) => concept.rxcui && concept.name)
    .sort((left, right) => {
      const leftPreferred = preferredTtys.has(left.tty ?? "") ? 0 : 1;
      const rightPreferred = preferredTtys.has(right.tty ?? "") ? 0 : 1;
      if (leftPreferred !== rightPreferred) return leftPreferred - rightPreferred;
      return (left.name ?? "").localeCompare(right.name ?? "");
    });

  const seen = new Set<string>();
  return concepts.filter((concept) => {
    if (!concept.rxcui || seen.has(concept.rxcui)) return false;
    seen.add(concept.rxcui);
    return true;
  }).slice(0, limit);
}

async function fetchDailyMedForRxcui(rxcui: string): Promise<{
  spl: DailyMedSpl | null;
  detail: unknown | null;
  adverseReactions: string[];
}> {
  const params = new URLSearchParams({ rxcui, pagesize: "1", page: "1" });
  const response = await fetch(`${DAILYMED_BASE}/spls.json?${params.toString()}`);
  if (!response.ok) {
    return { spl: null, detail: null, adverseReactions: [] };
  }

  const searchPayload = await response.json() as { data?: DailyMedSpl[] };
  const spl = searchPayload.data?.[0] ?? null;
  const setId = cleanText(spl?.setid);
  if (!setId) return { spl, detail: searchPayload, adverseReactions: [] };

  const detailResponse = await fetch(`${DAILYMED_BASE}/spls/${encodeURIComponent(setId)}.json`);
  const detail = detailResponse.ok ? await detailResponse.json() : null;

  return {
    spl,
    detail,
    adverseReactions: extractAdverseReactions(detail ?? searchPayload),
  };
}

function buildRxNormRecord(
  concept: RxNormConcept,
  sourceId: string,
  sourceVersionId: string | null,
  medicationReferenceId: string | null,
): MedicationSourceRecordInsert | null {
  const rxcui = cleanText(concept.rxcui);
  const displayName = cleanText(concept.psn) ?? cleanText(concept.name) ?? cleanText(concept.synonym);
  if (!rxcui || !displayName) return null;

  return {
    medication_reference_id: medicationReferenceId,
    source_id: sourceId,
    source_version_id: sourceVersionId,
    provider_key: RXNORM_PROVIDER_KEY,
    provider_medication_id: rxcui,
    rxnorm_code: rxcui,
    set_id: null,
    generic_name: parseGenericName(displayName),
    display_name: displayName,
    brand_names: parseBrandName(displayName),
    active_ingredients: parseActiveIngredients(displayName),
    medication_class: null,
    medication_family: inferMedicationFamily(displayName),
    route: parseRoute(displayName),
    dosage_form: parseDosageForm(displayName),
    strength_label: parseStrengthLabel(displayName),
    medication_type: "unknown",
    gut_relevance: inferMedicationFamily(displayName) ? "secondary" : "unknown",
    common_gut_effects: [],
    interaction_flags: inferInteractionFlags(displayName),
    adverse_reactions: [],
    label_sections: {},
    provider_payload: concept as Record<string, unknown>,
    match_confidence: 0.9,
    review_status: "cached",
    retrieved_at: new Date().toISOString(),
  };
}

function buildDailyMedRecord(
  concept: RxNormConcept,
  dailymed: { spl: DailyMedSpl | null; detail: unknown | null; adverseReactions: string[] },
  sourceId: string,
  sourceVersionId: string | null,
  medicationReferenceId: string | null,
): MedicationSourceRecordInsert | null {
  const setId = cleanText(dailymed.spl?.setid);
  const rxcui = cleanText(concept.rxcui);
  const fallbackName = cleanText(concept.psn) ?? cleanText(concept.name) ?? cleanText(concept.synonym);
  const displayName = cleanText(dailymed.spl?.title) ?? fallbackName;
  if (!setId || !displayName) return null;

  const commonGutEffects = inferGutEffects(displayName, dailymed.adverseReactions);

  return {
    medication_reference_id: medicationReferenceId,
    source_id: sourceId,
    source_version_id: sourceVersionId,
    provider_key: DAILYMED_PROVIDER_KEY,
    provider_medication_id: setId,
    rxnorm_code: rxcui,
    set_id: setId,
    generic_name: parseGenericName(displayName),
    display_name: displayName,
    brand_names: parseBrandName(displayName),
    active_ingredients: parseActiveIngredients(displayName),
    medication_class: null,
    medication_family: inferMedicationFamily(displayName),
    route: parseRoute(displayName),
    dosage_form: parseDosageForm(displayName),
    strength_label: parseStrengthLabel(displayName),
    medication_type: "unknown",
    gut_relevance: commonGutEffects.length > 0 ? "secondary" : "unknown",
    common_gut_effects: commonGutEffects,
    interaction_flags: inferInteractionFlags(displayName),
    adverse_reactions: dailymed.adverseReactions,
    label_sections: {
      set_id: setId,
      spl_version: dailymed.spl?.spl_version ?? null,
      published_date: dailymed.spl?.published_date ?? null,
      title: dailymed.spl?.title ?? null,
      adverse_reactions: dailymed.adverseReactions,
    },
    provider_payload: {
      spl: dailymed.spl,
      detail_excerpt: trimPayload(dailymed.detail),
    },
    match_confidence: 0.82,
    review_status: "cached",
    retrieved_at: new Date().toISOString(),
  };
}

async function saveMedicationSourceRecord(
  client: SupabaseClient,
  record: MedicationSourceRecordInsert,
): Promise<Record<string, unknown>> {
  const { data: existing, error: existingError } = await client
    .from("medication_source_records")
    .select("id")
    .eq("provider_key", record.provider_key)
    .eq("provider_medication_id", record.provider_medication_id)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { data, error } = await client
      .from("medication_source_records")
      .update({
        ...record,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Medication source record update returned no row.");
    return data as Record<string, unknown>;
  }

  const { data, error } = await client
    .from("medication_source_records")
    .insert(record)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Medication source record insert returned no row.");
  return data as Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const request = await req.json() as MedicationIngestionRequest;
    if (!cleanText(request.name) && !cleanText(request.rxnormCode)) {
      return jsonResponse({ success: false, error: "Provide name or rxnormCode." }, 400);
    }

    const client = await requireAuthenticatedClient(req);
    const rxnormSource = await fetchSource(client, RXNORM_PROVIDER_KEY);
    const dailymedSource = await fetchSource(client, DAILYMED_PROVIDER_KEY);
    const rxnormVersion = await fetchRxNormVersion();
    const rxnormSourceVersion = await upsertSourceVersion(client, rxnormSource.id, rxnormVersion.version, {
      endpoint_family: "RxNorm API",
      api_version: rxnormVersion.apiVersion,
    });
    const dailymedSourceVersion = await upsertSourceVersion(client, dailymedSource.id, DAILYMED_VERSION_LABEL, {
      endpoint_family: "DailyMed REST API v2",
    });

    const concepts = await fetchRxNormConcepts(request);
    const rxnormRecords: Record<string, unknown>[] = [];
    const dailymedRecords: Record<string, unknown>[] = [];

    for (const concept of concepts) {
      const rxnormRecord = buildRxNormRecord(
        concept,
        rxnormSource.id,
        rxnormSourceVersion.id,
        request.medicationReferenceId ?? null,
      );
      if (rxnormRecord) {
        rxnormRecords.push(await saveMedicationSourceRecord(client, rxnormRecord));
      }

      if (request.includeDailyMed !== false && cleanText(concept.rxcui)) {
        const dailymed = await fetchDailyMedForRxcui(cleanText(concept.rxcui)!);
        const dailymedRecord = buildDailyMedRecord(
          concept,
          dailymed,
          dailymedSource.id,
          dailymedSourceVersion.id,
          request.medicationReferenceId ?? null,
        );
        if (dailymedRecord) {
          dailymedRecords.push(await saveMedicationSourceRecord(client, dailymedRecord));
        }
      }
    }

    return jsonResponse({
      success: true,
      rxnorm_version: rxnormVersion.version,
      rxnorm_records: rxnormRecords,
      dailymed_records: dailymedRecords,
      records: [...rxnormRecords, ...dailymedRecords],
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Medication source ingestion failed.",
    }, 500);
  }
});
