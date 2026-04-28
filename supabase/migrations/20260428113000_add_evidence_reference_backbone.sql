/*
  # Evidence and reference-source backbone

  Adds source/version/claim tables plus provider-record caches for food and
  medication references. This keeps evidence provenance separate from user
  logs, lets external sources be versioned, and gives future USDA/RxNorm/
  DailyMed ingestion a durable landing zone before data is promoted into the
  live reference tables.
*/

CREATE TABLE IF NOT EXISTS reference_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text NOT NULL UNIQUE,
  provider_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'nutrition_database',
    'food_ingredient_database',
    'medication_vocabulary',
    'drug_label_database',
    'peer_reviewed_literature',
    'institutional_guidance',
    'user_review',
    'internal_seed'
  )),
  source_url text,
  access_model text NOT NULL DEFAULT 'unknown' CHECK (access_model IN (
    'free_api_key',
    'free_no_key',
    'open_dataset',
    'manual_review',
    'unknown'
  )),
  update_cadence text,
  last_checked_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reference_source_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES reference_sources(id) ON DELETE CASCADE,
  version_label text NOT NULL,
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  effective_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reference_source_versions_unique UNIQUE (source_id, version_label)
);

CREATE TABLE IF NOT EXISTS science_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_key text NOT NULL UNIQUE,
  domain text NOT NULL CHECK (domain IN (
    'stool_science',
    'hydration_science',
    'food_trigger',
    'medication_side_effect',
    'menstrual_cycle',
    'sleep',
    'stress',
    'exercise',
    'medical_context',
    'reporting'
  )),
  claim_type text NOT NULL CHECK (claim_type IN (
    'association',
    'mechanism',
    'definition',
    'safety_flag',
    'reference_range',
    'clinical_context'
  )),
  claim_text text NOT NULL,
  evidence_grade text NOT NULL DEFAULT 'ungraded' CHECK (evidence_grade IN (
    'high',
    'moderate',
    'low',
    'emerging',
    'institutional',
    'ungraded'
  )),
  source_id uuid REFERENCES reference_sources(id) ON DELETE SET NULL,
  source_version_id uuid REFERENCES reference_source_versions(id) ON DELETE SET NULL,
  source_url text,
  reviewed_at timestamptz,
  review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN (
    'draft',
    'ready_for_use',
    'needs_review',
    'deprecated'
  )),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reference_claim_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES science_claims(id) ON DELETE CASCADE,
  entity_kind text NOT NULL CHECK (entity_kind IN (
    'ingredient',
    'ingredient_signal',
    'food',
    'food_category',
    'medication',
    'medication_family',
    'symptom',
    'stool_marker',
    'hydration_marker',
    'cycle_marker',
    'sleep_marker',
    'stress_marker',
    'exercise_marker',
    'report_section'
  )),
  entity_key text NOT NULL,
  relationship text NOT NULL DEFAULT 'supports' CHECK (relationship IN (
    'supports',
    'defines',
    'cautions',
    'contradicts',
    'contextualizes'
  )),
  confidence numeric CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reference_claim_links_unique UNIQUE (claim_id, entity_kind, entity_key, relationship)
);

CREATE TABLE IF NOT EXISTS food_source_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_reference_id uuid REFERENCES food_reference_items(id) ON DELETE SET NULL,
  source_id uuid NOT NULL REFERENCES reference_sources(id) ON DELETE RESTRICT,
  source_version_id uuid REFERENCES reference_source_versions(id) ON DELETE SET NULL,
  provider_key text NOT NULL,
  provider_food_id text,
  canonical_name text NOT NULL,
  display_name text NOT NULL,
  brand_name text,
  food_category text,
  serving_label text,
  serving_amount numeric,
  serving_unit text,
  calories_kcal numeric,
  protein_g numeric,
  fat_g numeric,
  carbs_g numeric,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  ingredient_text text,
  ingredient_names text[] NOT NULL DEFAULT '{}',
  default_signals text[] NOT NULL DEFAULT '{}',
  provider_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  match_confidence numeric CHECK (match_confidence IS NULL OR (match_confidence >= 0 AND match_confidence <= 1)),
  review_status text NOT NULL DEFAULT 'cached' CHECK (review_status IN (
    'cached',
    'candidate',
    'reviewed',
    'promoted',
    'rejected'
  )),
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medication_source_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_reference_id uuid REFERENCES medication_reference_items(id) ON DELETE SET NULL,
  source_id uuid NOT NULL REFERENCES reference_sources(id) ON DELETE RESTRICT,
  source_version_id uuid REFERENCES reference_source_versions(id) ON DELETE SET NULL,
  provider_key text NOT NULL,
  provider_medication_id text,
  rxnorm_code text,
  set_id text,
  generic_name text,
  display_name text NOT NULL,
  brand_names text[] NOT NULL DEFAULT '{}',
  active_ingredients text[] NOT NULL DEFAULT '{}',
  medication_class text,
  medication_family text,
  route text,
  dosage_form text,
  strength_label text,
  medication_type text CHECK (medication_type IN ('prescription', 'otc', 'supplement', 'unknown')),
  gut_relevance text CHECK (gut_relevance IN ('primary', 'secondary', 'indirect', 'unknown')),
  common_gut_effects text[] NOT NULL DEFAULT '{}',
  interaction_flags text[] NOT NULL DEFAULT '{}',
  adverse_reactions text[] NOT NULL DEFAULT '{}',
  label_sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  match_confidence numeric CHECK (match_confidence IS NULL OR (match_confidence >= 0 AND match_confidence <= 1)),
  review_status text NOT NULL DEFAULT 'cached' CHECK (review_status IN (
    'cached',
    'candidate',
    'reviewed',
    'promoted',
    'rejected'
  )),
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reference_sources_provider_key
  ON reference_sources(provider_key);

CREATE INDEX IF NOT EXISTS idx_science_claims_domain_status
  ON science_claims(domain, review_status);

CREATE INDEX IF NOT EXISTS idx_reference_claim_links_entity
  ON reference_claim_links(entity_kind, entity_key);

CREATE INDEX IF NOT EXISTS idx_food_source_records_lookup
  ON food_source_records(provider_key, canonical_name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_food_source_records_provider_id_unique
  ON food_source_records(provider_key, provider_food_id)
  WHERE provider_food_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_food_source_records_reference
  ON food_source_records(food_reference_id);

CREATE INDEX IF NOT EXISTS idx_medication_source_records_lookup
  ON medication_source_records(provider_key, display_name);

CREATE INDEX IF NOT EXISTS idx_medication_source_records_rxnorm
  ON medication_source_records(rxnorm_code)
  WHERE rxnorm_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_medication_source_records_provider_id_unique
  ON medication_source_records(provider_key, provider_medication_id)
  WHERE provider_medication_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_medication_source_records_reference
  ON medication_source_records(medication_reference_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ingredient_reference_items'
      AND column_name = 'primary_source_id'
  ) THEN
    ALTER TABLE ingredient_reference_items
      ADD COLUMN primary_source_id uuid REFERENCES reference_sources(id) ON DELETE SET NULL,
      ADD COLUMN primary_source_version_id uuid REFERENCES reference_source_versions(id) ON DELETE SET NULL,
      ADD COLUMN evidence_review_status text NOT NULL DEFAULT 'unreviewed' CHECK (
        evidence_review_status IN ('unreviewed', 'review_ready', 'reviewed', 'deprecated')
      ),
      ADD COLUMN source_last_verified_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'food_reference_items'
      AND column_name = 'primary_source_id'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN primary_source_id uuid REFERENCES reference_sources(id) ON DELETE SET NULL,
      ADD COLUMN primary_source_version_id uuid REFERENCES reference_source_versions(id) ON DELETE SET NULL,
      ADD COLUMN evidence_review_status text NOT NULL DEFAULT 'unreviewed' CHECK (
        evidence_review_status IN ('unreviewed', 'review_ready', 'reviewed', 'deprecated')
      ),
      ADD COLUMN source_last_verified_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medication_reference_items'
      AND column_name = 'primary_source_id'
  ) THEN
    ALTER TABLE medication_reference_items
      ADD COLUMN primary_source_id uuid REFERENCES reference_sources(id) ON DELETE SET NULL,
      ADD COLUMN primary_source_version_id uuid REFERENCES reference_source_versions(id) ON DELETE SET NULL,
      ADD COLUMN evidence_review_status text NOT NULL DEFAULT 'unreviewed' CHECK (
        evidence_review_status IN ('unreviewed', 'review_ready', 'reviewed', 'deprecated')
      ),
      ADD COLUMN source_last_verified_at timestamptz;
  END IF;
END $$;

INSERT INTO reference_sources (
  provider_key,
  provider_name,
  source_type,
  source_url,
  access_model,
  update_cadence,
  notes
) VALUES
  (
    'usda_fdc',
    'USDA FoodData Central',
    'nutrition_database',
    'https://fdc.nal.usda.gov/',
    'free_api_key',
    'provider-managed',
    'Primary nutrition source for U.S. food records, nutrients, and serving metadata.'
  ),
  (
    'open_food_facts',
    'Open Food Facts',
    'food_ingredient_database',
    'https://world.openfoodfacts.org/',
    'free_no_key',
    'community-managed',
    'Secondary source for packaged-food ingredient lists and brand context.'
  ),
  (
    'rxnorm',
    'RxNorm / RxNav',
    'medication_vocabulary',
    'https://lhncbc.nlm.nih.gov/RxNav/',
    'free_no_key',
    'provider-managed',
    'Medication normalization source for RxCUIs, generic/brand identity, dose forms, and strengths.'
  ),
  (
    'dailymed',
    'DailyMed',
    'drug_label_database',
    'https://dailymed.nlm.nih.gov/',
    'free_no_key',
    'provider-managed',
    'Structured drug-label source for adverse reactions and label context.'
  ),
  (
    'openfda_drug_label',
    'openFDA Drug Labeling',
    'drug_label_database',
    'https://open.fda.gov/apis/drug/label/',
    'free_api_key',
    'provider-managed',
    'Searchable FDA drug labeling source; useful as a secondary label lookup.'
  ),
  (
    'gutwise_user_review',
    'GutWise User Review',
    'user_review',
    NULL,
    'manual_review',
    'as-reviewed',
    'Human-reviewed records promoted from user logging and reference review queues.'
  ),
  (
    'gutwise_seed',
    'GutWise Seed Knowledge',
    'internal_seed',
    NULL,
    'manual_review',
    'as-reviewed',
    'Internal seed records used before authoritative enrichment is available.'
  )
ON CONFLICT (provider_key) DO UPDATE SET
  provider_name = EXCLUDED.provider_name,
  source_type = EXCLUDED.source_type,
  source_url = EXCLUDED.source_url,
  access_model = EXCLUDED.access_model,
  update_cadence = EXCLUDED.update_cadence,
  notes = EXCLUDED.notes,
  updated_at = now();

ALTER TABLE reference_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_source_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE science_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_claim_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_source_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_source_records ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  target_table_name text;
  target_policy_name text;
BEGIN
  FOREACH target_table_name IN ARRAY ARRAY[
    'reference_sources',
    'reference_source_versions',
    'science_claims',
    'reference_claim_links',
    'food_source_records',
    'medication_source_records'
  ]
  LOOP
    target_policy_name := 'Authenticated users can read ' || target_table_name;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = target_table_name
        AND policyname = target_policy_name
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (true)',
        target_policy_name,
        target_table_name
      );
    END IF;
  END LOOP;
END $$;

COMMENT ON TABLE reference_sources IS
  'Authoritative and internal sources used by GutWise reference data and science claims.';

COMMENT ON TABLE science_claims IS
  'Evidence claims that can be linked to ingredients, medications, symptoms, report sections, and future Education content.';

COMMENT ON TABLE reference_claim_links IS
  'Links science claims to reference entities without hard-coding evidence into log analyzers.';

COMMENT ON TABLE food_source_records IS
  'Cached provider food records before or after promotion into food_reference_items.';

COMMENT ON TABLE medication_source_records IS
  'Cached provider medication records before or after promotion into medication_reference_items.';
