import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FDC_API_BASE = "https://api.nal.usda.gov/fdc/v1";
const PROVIDER_KEY = "usda_fdc";
const VERSION_LABEL = "fdc-api-current";
const DEFAULT_SEARCH_PAGE_SIZE = 25;
const DETAIL_LOOKUP_LIMIT = 12;

type SupabaseClient = ReturnType<typeof createClient>;

interface FoodIngestionRequest {
  query?: string;
  fdcId?: string | number;
  pageSize?: number;
  dataTypes?: string[];
  foodReferenceId?: string | null;
}

interface FdcFoodNutrient {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  value?: number;
  amount?: number;
  nutrient?: {
    id?: number;
    name?: string;
    number?: string;
    unitName?: string;
  };
}

interface FdcFood {
  fdcId?: number;
  description?: string;
  dataType?: string;
  brandOwner?: string;
  brandName?: string;
  foodCategory?: string;
  foodCategoryDescription?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  publishedDate?: string;
  foodNutrients?: FdcFoodNutrient[];
  score?: number;
}

interface FoodSourceRecordInsert {
  food_reference_id: string | null;
  source_id: string;
  source_version_id: string | null;
  provider_key: string;
  provider_food_id: string;
  canonical_name: string;
  display_name: string;
  brand_name: string | null;
  food_category: string | null;
  serving_label: string | null;
  serving_amount: number | null;
  serving_unit: string | null;
  calories_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  ingredient_text: string | null;
  ingredient_names: string[];
  default_signals: string[];
  provider_payload: Record<string, unknown>;
  match_confidence: number | null;
  review_status: "cached";
  retrieved_at: string;
}

interface RankedFdcFood {
  food: FdcFood;
  score: number;
  confidence: number;
  reasons: string[];
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function clampLimit(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 10;
  return Math.max(1, Math.min(Math.round(value), 25));
}

function searchLimit(value: unknown): number {
  return Math.max(DEFAULT_SEARCH_PAGE_SIZE, clampLimit(value));
}

function clampConfidence(value: number): number {
  return Math.max(0.2, Math.min(Math.round(value * 100) / 100, 0.98));
}

function queryTokens(value: string): string[] {
  return [...new Set(
    normalizeLookupKey(value)
      .split(" ")
      .filter((token) => token.length > 1)
      .filter((token) => !["and", "the", "with", "without", "fresh", "plain"].includes(token)),
  )];
}

function parseIngredientNames(ingredientText: string | null): string[] {
  if (!ingredientText) return [];

  return [...new Set(
    ingredientText
      .split(/[,;()]/)
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length >= 2 && part.length <= 80)
      .slice(0, 40),
  )];
}

function deriveSignals(food: FdcFood, ingredientNames: string[]): string[] {
  const text = [
    food.description,
    food.foodCategory,
    food.foodCategoryDescription,
    food.ingredients,
    ...ingredientNames,
  ]
    .filter((part): part is string => typeof part === "string")
    .join(" ")
    .toLowerCase();

  const signals = new Set<string>();
  if (/\b(milk|cheese|cream|butter|yogurt|lactose|whey|casein)\b/.test(text)) signals.add("dairy");
  if (/\b(wheat|gluten|barley|rye|malt|flour|bread|pasta)\b/.test(text)) signals.add("gluten");
  if (/\b(onion|garlic|shallot|leek|beans|lentils|chickpea|inulin)\b/.test(text)) signals.add("high_fodmap");
  if (/\b(sorbitol|xylitol|maltitol|mannitol|erythritol|sucralose|aspartame|acesulfame)\b/.test(text)) signals.add("artificial_sweetener");
  if (/\b(fried|cream|butter|oil|mayonnaise|bacon|sausage)\b/.test(text)) signals.add("high_fat");
  if (/\b(chili|jalapeno|cayenne|hot sauce|spicy)\b/.test(text)) signals.add("spicy");
  if (/\b(coffee|caffeine|espresso|cola|energy drink|tea)\b/.test(text)) signals.add("caffeine_food");
  if (/\b(beer|wine|liquor|alcohol)\b/.test(text)) signals.add("alcohol");
  if (/\b(oats|beans|lentils|bran|whole grain|vegetable|fruit|fiber)\b/.test(text)) signals.add("fiber_dense");

  return [...signals].sort();
}

function foodText(food: FdcFood): string {
  return normalizeLookupKey([
    food.description,
    food.foodCategory,
    food.foodCategoryDescription,
    food.ingredients,
  ]
    .filter((part): part is string => typeof part === "string")
    .join(" "));
}

function hasAnyToken(text: string, tokens: string[]): boolean {
  return tokens.some((token) => new RegExp(`\\b${token}\\b`, "i").test(text));
}

function hasPackageIntent(query: string): boolean {
  const normalized = normalizeLookupKey(query);
  return /\b(brand|bar|cereal|chips|cracker|cookie|cookies|shake|protein powder|soda|drink|yogurt|frozen|canned|box|bottle|package|packaged)\b/.test(normalized);
}

function hasCulinaryModifierIntent(query: string): boolean {
  const normalized = normalizeLookupKey(query);
  return /\b(seasoning|spice|spices|sauce|marinade|rub|dressing|gravy|mix|powder|flavor|flavored)\b/.test(normalized);
}

function isBranded(food: FdcFood): boolean {
  return food.dataType === "Branded" || Boolean(cleanText(food.brandName) ?? cleanText(food.brandOwner));
}

function macroCompleteness(food: FdcFood): number {
  return [
    nutrientValue(food, [1008], [/energy/]),
    nutrientValue(food, [1003], [/protein/]),
    nutrientValue(food, [1004], [/total lipid|total fat/]),
    nutrientValue(food, [1005], [/carbohydrate/]),
  ].filter((value) => value !== null).length;
}

function dataTypeScore(food: FdcFood, packagedIntent: boolean): { score: number; reason: string } {
  switch (food.dataType) {
    case "Foundation":
      return { score: 32, reason: "foundation-source" };
    case "SR Legacy":
      return { score: 28, reason: "sr-legacy-source" };
    case "Survey (FNDDS)":
      return { score: 22, reason: "survey-source" };
    case "Branded":
      return {
        score: packagedIntent ? 8 : -18,
        reason: packagedIntent ? "branded-allowed" : "branded-downranked-for-generic-query",
      };
    default:
      return { score: 0, reason: "unknown-data-type" };
  }
}

function scoreFdcFood(food: FdcFood, query: string): RankedFdcFood {
  const tokens = queryTokens(query);
  const normalizedQuery = normalizeLookupKey(query);
  const description = normalizeLookupKey(food.description ?? "");
  const text = foodText(food);
  const packagedIntent = hasPackageIntent(query);
  const modifierIntent = hasCulinaryModifierIntent(query);
  const reasons: string[] = [];
  let score = 0;

  const sourceScore = dataTypeScore(food, packagedIntent);
  score += sourceScore.score;
  reasons.push(sourceScore.reason);

  const matchedTokens = tokens.filter((token) => new RegExp(`\\b${token}\\b`, "i").test(description));
  const missingTokens = tokens.filter((token) => !new RegExp(`\\b${token}\\b`, "i").test(text));

  if (description === normalizedQuery) {
    score += 44;
    reasons.push("exact-description-match");
  } else if (description.startsWith(`${normalizedQuery} `) || description.includes(` ${normalizedQuery} `)) {
    score += 26;
    reasons.push("description-phrase-match");
  }

  if (tokens.length > 0) {
    score += Math.round((matchedTokens.length / tokens.length) * 36);
    if (missingTokens.length > 0) {
      score -= missingTokens.length * 24;
      reasons.push("query-token-missing");
    } else {
      reasons.push("all-query-tokens-present");
    }
  }

  const macros = macroCompleteness(food);
  score += macros * 9;
  if (macros >= 4) reasons.push("complete-core-macros");
  if (macros <= 1) {
    score -= 14;
    reasons.push("sparse-core-macros");
  }

  if (readNumber(food.servingSize) !== null || cleanText(food.householdServingFullText)) {
    score += 6;
    reasons.push("serving-data-present");
  }

  if (isBranded(food) && !packagedIntent) {
    score -= 12;
    reasons.push("brand-present-for-generic-query");
  }

  const culinaryModifierTokens = [
    "seasoning",
    "spice",
    "spices",
    "sauce",
    "marinade",
    "rub",
    "dressing",
    "gravy",
    "mix",
    "powder",
    "flavor",
    "flavored",
  ];
  if (!modifierIntent && hasAnyToken(text, culinaryModifierTokens)) {
    score -= 42;
    reasons.push("culinary-modifier-mismatch");
  }

  const additiveTokens = ["salt", "sugar", "garlic", "onion", "pepper", "extract"];
  const ingredientNames = parseIngredientNames(cleanText(food.ingredients));
  if (!packagedIntent && ingredientNames.length >= 4 && hasAnyToken(ingredientNames.join(" "), additiveTokens)) {
    score -= 16;
    reasons.push("ingredient-list-suggests-prepared-product");
  }

  const confidence = clampConfidence(0.45 + score / 140);
  return { food, score, confidence, reasons };
}

function rankFdcFoods(foods: FdcFood[], query: string): RankedFdcFood[] {
  const byId = new Map<string, RankedFdcFood>();
  for (const food of foods) {
    if (food.fdcId === undefined) continue;
    const ranked = scoreFdcFood(food, query);
    const key = String(food.fdcId);
    const existing = byId.get(key);
    if (!existing || ranked.score > existing.score) {
      byId.set(key, ranked);
    }
  }

  return [...byId.values()].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return (left.food.description ?? "").localeCompare(right.food.description ?? "");
  });
}

function nutrientValue(food: FdcFood, ids: number[], namePatterns: RegExp[]): number | null {
  const nutrients = food.foodNutrients ?? [];

  for (const nutrient of nutrients) {
    const id = nutrient.nutrientId ?? nutrient.nutrient?.id;
    if (typeof id === "number" && ids.includes(id)) {
      return readNumber(nutrient.value ?? nutrient.amount);
    }
  }

  for (const nutrient of nutrients) {
    const name = `${nutrient.nutrientName ?? nutrient.nutrient?.name ?? ""}`.toLowerCase();
    if (namePatterns.some((pattern) => pattern.test(name))) {
      return readNumber(nutrient.value ?? nutrient.amount);
    }
  }

  return null;
}

function fdcFoodToRecord(
  food: FdcFood,
  sourceId: string,
  sourceVersionId: string | null,
  foodReferenceId: string | null,
  match: RankedFdcFood | null = null,
): FoodSourceRecordInsert | null {
  const providerFoodId = food.fdcId !== undefined ? String(food.fdcId) : null;
  const displayName = cleanText(food.description);
  if (!providerFoodId || !displayName) return null;

  const ingredientText = cleanText(food.ingredients);
  const ingredientNames = parseIngredientNames(ingredientText);
  const servingAmount = readNumber(food.servingSize);
  const servingUnit = cleanText(food.servingSizeUnit);
  const householdServing = cleanText(food.householdServingFullText);
  const servingLabel =
    householdServing ??
    (servingAmount !== null && servingUnit ? `${servingAmount} ${servingUnit}` : null);

  return {
    food_reference_id: foodReferenceId,
    source_id: sourceId,
    source_version_id: sourceVersionId,
    provider_key: PROVIDER_KEY,
    provider_food_id: providerFoodId,
    canonical_name: normalizeLookupKey(displayName),
    display_name: displayName,
    brand_name: cleanText(food.brandName) ?? cleanText(food.brandOwner),
    food_category: cleanText(food.foodCategory) ?? cleanText(food.foodCategoryDescription) ?? cleanText(food.dataType),
    serving_label: servingLabel,
    serving_amount: servingAmount,
    serving_unit: servingUnit,
    calories_kcal: nutrientValue(food, [1008], [/energy/]),
    protein_g: nutrientValue(food, [1003], [/protein/]),
    fat_g: nutrientValue(food, [1004], [/total lipid|total fat/]),
    carbs_g: nutrientValue(food, [1005], [/carbohydrate/]),
    fiber_g: nutrientValue(food, [1079], [/fiber/]),
    sugar_g: nutrientValue(food, [2000], [/sugars?|total sugar/]),
    sodium_mg: nutrientValue(food, [1093], [/sodium/]),
    ingredient_text: ingredientText,
    ingredient_names: ingredientNames,
    default_signals: deriveSignals(food, ingredientNames),
    provider_payload: {
      ...(food as Record<string, unknown>),
      gutwise_match: match
        ? {
          score: match.score,
          confidence: match.confidence,
          reasons: match.reasons,
        }
        : null,
    },
    match_confidence: match?.confidence ?? (typeof food.score === "number" ? clampConfidence(food.score) : 0.82),
    review_status: "cached",
    retrieved_at: new Date().toISOString(),
  };
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

async function fetchSource(client: SupabaseClient): Promise<{ id: string }> {
  const { data, error } = await client
    .from("reference_sources")
    .select("id")
    .eq("provider_key", PROVIDER_KEY)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("USDA FDC source row not found. Apply the evidence backbone migration first.");
  return data as { id: string };
}

async function upsertSourceVersion(
  client: SupabaseClient,
  sourceId: string,
): Promise<{ id: string }> {
  const { data, error } = await client
    .from("reference_source_versions")
    .upsert(
      {
        source_id: sourceId,
        version_label: VERSION_LABEL,
        retrieved_at: new Date().toISOString(),
        metadata: {
          endpoint_family: "FoodData Central API",
          version_note: "FDC API does not expose a release version in search responses.",
        },
      },
      { onConflict: "source_id,version_label" },
    )
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Unable to create USDA FDC source version.");
  return data as { id: string };
}

async function fetchFdcFoodById(fdcId: string, apiKey: string): Promise<FdcFood> {
  const url = `${FDC_API_BASE}/food/${encodeURIComponent(fdcId)}?api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FoodData Central detail lookup failed with status ${response.status}.`);
  }
  return await response.json() as FdcFood;
}

async function searchFdcFoods(request: FoodIngestionRequest, apiKey: string): Promise<FdcFood[]> {
  const query = cleanText(request.query);
  if (!query) return [];

  const url = `${FDC_API_BASE}/foods/search?api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      pageSize: searchLimit(request.pageSize),
      dataType: request.dataTypes?.length
        ? request.dataTypes
        : ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"],
    }),
  });

  if (!response.ok) {
    throw new Error(`FoodData Central search failed with status ${response.status}.`);
  }

  const data = await response.json() as { foods?: FdcFood[] };
  return data.foods ?? [];
}

async function searchAndRankFdcFoods(request: FoodIngestionRequest, apiKey: string): Promise<RankedFdcFood[]> {
  const query = cleanText(request.query);
  if (!query) return [];

  const searchResults = await searchFdcFoods(request, apiKey);
  const preliminary = rankFdcFoods(searchResults, query).slice(0, DETAIL_LOOKUP_LIMIT);
  const detailedFoods = await Promise.all(
    preliminary.map(async (ranked) => {
      const fdcId = ranked.food.fdcId;
      if (fdcId === undefined) return ranked.food;

      try {
        return await fetchFdcFoodById(String(fdcId), apiKey);
      } catch {
        return ranked.food;
      }
    }),
  );

  return rankFdcFoods(detailedFoods, query).slice(0, clampLimit(request.pageSize));
}

async function saveFoodSourceRecord(
  client: SupabaseClient,
  record: FoodSourceRecordInsert,
): Promise<Record<string, unknown>> {
  const { data: existing, error: existingError } = await client
    .from("food_source_records")
    .select("id")
    .eq("provider_key", record.provider_key)
    .eq("provider_food_id", record.provider_food_id)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { data, error } = await client
      .from("food_source_records")
      .update({
        ...record,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Food source record update returned no row.");
    return data as Record<string, unknown>;
  }

  const { data, error } = await client
    .from("food_source_records")
    .insert(record)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Food source record insert returned no row.");
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
    const apiKey = Deno.env.get("USDA_FDC_API_KEY") ?? Deno.env.get("FDC_API_KEY");
    if (!apiKey) {
      return jsonResponse(
        { success: false, error: "USDA_FDC_API_KEY is not configured for FoodData Central ingestion." },
        500,
      );
    }

    const request = await req.json() as FoodIngestionRequest;
    if (!cleanText(request.query) && request.fdcId === undefined) {
      return jsonResponse({ success: false, error: "Provide query or fdcId." }, 400);
    }

    const client = await requireAuthenticatedClient(req);
    const source = await fetchSource(client);
    const sourceVersion = await upsertSourceVersion(client, source.id);

    let rankedFoods: RankedFdcFood[] = [];
    if (request.fdcId !== undefined) {
      const food = await fetchFdcFoodById(String(request.fdcId), apiKey);
      rankedFoods = [{
        food,
        score: 100,
        confidence: 0.98,
        reasons: ["direct-fdc-id-lookup"],
      }];
    } else {
      rankedFoods = await searchAndRankFdcFoods(request, apiKey);
    }

    const records: Record<string, unknown>[] = [];
    for (const rankedFood of rankedFoods) {
      const record = fdcFoodToRecord(
        rankedFood.food,
        source.id,
        sourceVersion.id,
        request.foodReferenceId ?? null,
        rankedFood,
      );
      if (!record) continue;
      records.push(await saveFoodSourceRecord(client, record));
    }

    return jsonResponse({
      success: true,
      provider_key: PROVIDER_KEY,
      source_version_id: sourceVersion.id,
      records,
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Food source ingestion failed.",
    }, 500);
  }
});
