import type {
  MedicationGutRelevance,
  MedicationReferenceType,
} from './intelligence';

export type ReferenceSourceType =
  | 'nutrition_database'
  | 'food_ingredient_database'
  | 'medication_vocabulary'
  | 'drug_label_database'
  | 'peer_reviewed_literature'
  | 'institutional_guidance'
  | 'user_review'
  | 'internal_seed';

export type ReferenceAccessModel =
  | 'free_api_key'
  | 'free_no_key'
  | 'open_dataset'
  | 'manual_review'
  | 'unknown';

export type ScienceClaimDomain =
  | 'stool_science'
  | 'hydration_science'
  | 'food_trigger'
  | 'medication_side_effect'
  | 'menstrual_cycle'
  | 'sleep'
  | 'stress'
  | 'exercise'
  | 'medical_context'
  | 'reporting';

export type ScienceClaimType =
  | 'association'
  | 'mechanism'
  | 'definition'
  | 'safety_flag'
  | 'reference_range'
  | 'clinical_context';

export type EvidenceGrade =
  | 'high'
  | 'moderate'
  | 'low'
  | 'emerging'
  | 'institutional'
  | 'ungraded';

export type ScienceClaimReviewStatus =
  | 'draft'
  | 'ready_for_use'
  | 'needs_review'
  | 'deprecated';

export type ReferenceClaimEntityKind =
  | 'ingredient'
  | 'ingredient_signal'
  | 'food'
  | 'food_category'
  | 'medication'
  | 'medication_family'
  | 'symptom'
  | 'stool_marker'
  | 'hydration_marker'
  | 'cycle_marker'
  | 'sleep_marker'
  | 'stress_marker'
  | 'exercise_marker'
  | 'report_section';

export type ReferenceClaimRelationship =
  | 'supports'
  | 'defines'
  | 'cautions'
  | 'contradicts'
  | 'contextualizes';

export type SourceRecordReviewStatus =
  | 'cached'
  | 'candidate'
  | 'reviewed'
  | 'promoted'
  | 'rejected';

export interface ReferenceSourceRow {
  id: string;
  provider_key: string;
  provider_name: string;
  source_type: ReferenceSourceType;
  source_url: string | null;
  access_model: ReferenceAccessModel;
  update_cadence: string | null;
  last_checked_at: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferenceSourceVersionRow {
  id: string;
  source_id: string;
  version_label: string;
  retrieved_at: string;
  effective_date: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ScienceClaimRow {
  id: string;
  claim_key: string;
  domain: ScienceClaimDomain;
  claim_type: ScienceClaimType;
  claim_text: string;
  evidence_grade: EvidenceGrade;
  source_id: string | null;
  source_version_id: string | null;
  source_url: string | null;
  reviewed_at: string | null;
  review_status: ScienceClaimReviewStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferenceClaimLinkRow {
  id: string;
  claim_id: string;
  entity_kind: ReferenceClaimEntityKind;
  entity_key: string;
  relationship: ReferenceClaimRelationship;
  confidence: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodSourceRecordRow {
  id: string;
  food_reference_id: string | null;
  source_id: string;
  source_version_id: string | null;
  provider_key: string;
  provider_food_id: string | null;
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
  review_status: SourceRecordReviewStatus;
  retrieved_at: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationSourceRecordRow {
  id: string;
  medication_reference_id: string | null;
  source_id: string;
  source_version_id: string | null;
  provider_key: string;
  provider_medication_id: string | null;
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
  medication_type: MedicationReferenceType | null;
  gut_relevance: MedicationGutRelevance | null;
  common_gut_effects: string[];
  interaction_flags: string[];
  adverse_reactions: string[];
  label_sections: Record<string, unknown>;
  provider_payload: Record<string, unknown>;
  match_confidence: number | null;
  review_status: SourceRecordReviewStatus;
  retrieved_at: string;
  created_at: string;
  updated_at: string;
}
