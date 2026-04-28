import { supabase } from '../lib/supabase';
import type {
  EvidenceGrade,
  FoodSourceRecordRow,
  MedicationSourceRecordRow,
  ReferenceClaimEntityKind,
  ReferenceClaimLinkRow,
  ReferenceClaimRelationship,
  ReferenceSourceRow,
  ReferenceSourceVersionRow,
  ScienceClaimDomain,
  ScienceClaimReviewStatus,
  ScienceClaimRow,
  SourceRecordReviewStatus,
} from '../types/referenceEvidence';

export const REFERENCE_SOURCE_KEYS = {
  USDA_FDC: 'usda_fdc',
  OPEN_FOOD_FACTS: 'open_food_facts',
  RXNORM: 'rxnorm',
  DAILYMED: 'dailymed',
  OPENFDA_DRUG_LABEL: 'openfda_drug_label',
  GUTWISE_USER_REVIEW: 'gutwise_user_review',
  GUTWISE_SEED: 'gutwise_seed',
} as const;

export type ReferenceSourceKey =
  (typeof REFERENCE_SOURCE_KEYS)[keyof typeof REFERENCE_SOURCE_KEYS];

export interface ScienceClaimFilters {
  domain?: ScienceClaimDomain;
  reviewStatus?: ScienceClaimReviewStatus;
  claimKeys?: string[];
}

export interface EntityClaimLookup {
  entityKind: ReferenceClaimEntityKind;
  entityKey: string;
  relationship?: ReferenceClaimRelationship;
}

export interface SourceRecordLookup {
  providerKey?: ReferenceSourceKey | string;
  search?: string;
  reviewStatus?: SourceRecordReviewStatus;
  limit?: number;
}

export interface FoodSourceRecordLookup extends SourceRecordLookup {
  foodReferenceId?: string;
}

export interface MedicationSourceRecordLookup extends SourceRecordLookup {
  medicationReferenceId?: string;
  rxnormCode?: string;
}

function cleanSearchText(value: string): string {
  return value.replace(/[%_]/g, '').trim();
}

function applyLimit(limit?: number): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return 25;
  return Math.max(1, Math.min(Math.round(limit), 100));
}

export function formatEvidenceGrade(grade: EvidenceGrade): string {
  const labels: Record<EvidenceGrade, string> = {
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    emerging: 'Emerging',
    institutional: 'Institutional',
    ungraded: 'Ungraded',
  };

  return labels[grade];
}

export function buildSourceCitationLabel(
  source: Pick<ReferenceSourceRow, 'provider_name' | 'source_url'>,
  version?: Pick<ReferenceSourceVersionRow, 'version_label' | 'retrieved_at'> | null
): string {
  const versionLabel = version?.version_label ? `, ${version.version_label}` : '';
  const retrievedLabel = version?.retrieved_at
    ? `, retrieved ${new Date(version.retrieved_at).toLocaleDateString()}`
    : '';

  return `${source.provider_name}${versionLabel}${retrievedLabel}`;
}

export async function fetchReferenceSources(): Promise<ReferenceSourceRow[]> {
  const { data, error } = await supabase
    .from('reference_sources')
    .select('*')
    .eq('active', true)
    .order('provider_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ReferenceSourceRow[];
}

export async function fetchReferenceSourceByKey(
  providerKey: ReferenceSourceKey | string
): Promise<ReferenceSourceRow | null> {
  const { data, error } = await supabase
    .from('reference_sources')
    .select('*')
    .eq('provider_key', providerKey)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ReferenceSourceRow | null;
}

export async function fetchLatestSourceVersion(
  sourceId: string
): Promise<ReferenceSourceVersionRow | null> {
  const { data, error } = await supabase
    .from('reference_source_versions')
    .select('*')
    .eq('source_id', sourceId)
    .order('retrieved_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ReferenceSourceVersionRow | null;
}

export async function fetchScienceClaims(
  filters: ScienceClaimFilters = {}
): Promise<ScienceClaimRow[]> {
  let query = supabase
    .from('science_claims')
    .select('*')
    .order('reviewed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (filters.domain) {
    query = query.eq('domain', filters.domain);
  }

  if (filters.reviewStatus) {
    query = query.eq('review_status', filters.reviewStatus);
  }

  if (filters.claimKeys && filters.claimKeys.length > 0) {
    query = query.in('claim_key', filters.claimKeys);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ScienceClaimRow[];
}

export async function fetchClaimLinksForEntity(
  lookup: EntityClaimLookup
): Promise<ReferenceClaimLinkRow[]> {
  let query = supabase
    .from('reference_claim_links')
    .select('*')
    .eq('entity_kind', lookup.entityKind)
    .eq('entity_key', lookup.entityKey)
    .order('confidence', { ascending: false, nullsFirst: false });

  if (lookup.relationship) {
    query = query.eq('relationship', lookup.relationship);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ReferenceClaimLinkRow[];
}

export async function fetchScienceClaimsForEntity(
  lookup: EntityClaimLookup
): Promise<{ links: ReferenceClaimLinkRow[]; claims: ScienceClaimRow[] }> {
  const links = await fetchClaimLinksForEntity(lookup);
  const claimIds = [...new Set(links.map((link) => link.claim_id))];

  if (claimIds.length === 0) {
    return { links, claims: [] };
  }

  const { data, error } = await supabase
    .from('science_claims')
    .select('*')
    .in('id', claimIds);

  if (error) throw error;
  return { links, claims: (data ?? []) as ScienceClaimRow[] };
}

export async function fetchFoodSourceRecords(
  lookup: FoodSourceRecordLookup = {}
): Promise<FoodSourceRecordRow[]> {
  let query = supabase
    .from('food_source_records')
    .select('*')
    .order('match_confidence', { ascending: false, nullsFirst: false })
    .order('retrieved_at', { ascending: false })
    .limit(applyLimit(lookup.limit));

  if (lookup.providerKey) {
    query = query.eq('provider_key', lookup.providerKey);
  }

  if (lookup.foodReferenceId) {
    query = query.eq('food_reference_id', lookup.foodReferenceId);
  }

  if (lookup.reviewStatus) {
    query = query.eq('review_status', lookup.reviewStatus);
  }

  const search = lookup.search ? cleanSearchText(lookup.search) : '';
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,canonical_name.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FoodSourceRecordRow[];
}

export async function fetchMedicationSourceRecords(
  lookup: MedicationSourceRecordLookup = {}
): Promise<MedicationSourceRecordRow[]> {
  let query = supabase
    .from('medication_source_records')
    .select('*')
    .order('match_confidence', { ascending: false, nullsFirst: false })
    .order('retrieved_at', { ascending: false })
    .limit(applyLimit(lookup.limit));

  if (lookup.providerKey) {
    query = query.eq('provider_key', lookup.providerKey);
  }

  if (lookup.medicationReferenceId) {
    query = query.eq('medication_reference_id', lookup.medicationReferenceId);
  }

  if (lookup.rxnormCode) {
    query = query.eq('rxnorm_code', lookup.rxnormCode);
  }

  if (lookup.reviewStatus) {
    query = query.eq('review_status', lookup.reviewStatus);
  }

  const search = lookup.search ? cleanSearchText(lookup.search) : '';
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,generic_name.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MedicationSourceRecordRow[];
}
