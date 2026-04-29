import { supabase } from '../lib/supabase';
import type {
  FoodSourceRecordRow,
  MedicationSourceRecordRow,
} from '../types/referenceEvidence';

export interface FoodSourceIngestionRequest {
  query?: string;
  fdcId?: string | number;
  pageSize?: number;
  dataTypes?: string[];
  foodReferenceId?: string | null;
}

export interface FoodSourceIngestionResponse {
  success: boolean;
  provider_key: 'usda_fdc';
  source_version_id: string | null;
  records: FoodSourceRecordRow[];
  error?: string;
}

export interface MedicationSourceIngestionRequest {
  name?: string;
  rxnormCode?: string;
  includeDailyMed?: boolean;
  pageSize?: number;
  medicationReferenceId?: string | null;
}

export interface MedicationSourceIngestionResponse {
  success: boolean;
  rxnorm_version: string | null;
  rxnorm_records: MedicationSourceRecordRow[];
  dailymed_records: MedicationSourceRecordRow[];
  records: MedicationSourceRecordRow[];
  error?: string;
}

function assertFunctionSuccess<T extends { success: boolean; error?: string }>(
  data: T | null,
  fallbackMessage: string
): T {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  if (!data.success) {
    throw new Error(data.error ?? fallbackMessage);
  }

  return data;
}

export async function ingestFoodSourceRecords(
  request: FoodSourceIngestionRequest
): Promise<FoodSourceIngestionResponse> {
  const { data, error } = await supabase.functions.invoke<FoodSourceIngestionResponse>(
    'ingest-food-source-records',
    { body: request }
  );

  if (error) throw error;
  return assertFunctionSuccess(data, 'Food source ingestion failed.');
}

export async function ingestMedicationSourceRecords(
  request: MedicationSourceIngestionRequest
): Promise<MedicationSourceIngestionResponse> {
  const { data, error } = await supabase.functions.invoke<MedicationSourceIngestionResponse>(
    'ingest-medication-source-records',
    { body: request }
  );

  if (error) throw error;
  return assertFunctionSuccess(data, 'Medication source ingestion failed.');
}
