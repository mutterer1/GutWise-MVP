import { supabase } from '../lib/supabase';
import type {
  AbsenceType,
  DailyAbsenceConfirmationInput,
  DailyAbsenceConfirmationRow,
} from '../types/absenceConfirmations';

export async function upsertDailyAbsenceConfirmations(
  input: {
    userId: string;
    absenceDate: string;
    absenceTypes: AbsenceType[];
    confirmedAt?: string;
    notes?: string | null;
  }
): Promise<DailyAbsenceConfirmationRow[]> {
  const rows: DailyAbsenceConfirmationInput[] = [...new Set(input.absenceTypes)].map(
    (absenceType) => ({
      user_id: input.userId,
      absence_date: input.absenceDate,
      absence_type: absenceType,
      confirmed_at: input.confirmedAt,
      notes: input.notes ?? null,
      source: 'daily_mark_none',
    })
  );

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('daily_absence_confirmations')
    .upsert(rows, {
      onConflict: 'user_id,absence_date,absence_type',
    })
    .select('*');

  if (error) {
    throw new Error(`Unable to save none confirmations: ${error.message}`);
  }

  return (data ?? []) as DailyAbsenceConfirmationRow[];
}

export async function fetchDailyAbsenceConfirmations(
  userId: string,
  options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}
): Promise<DailyAbsenceConfirmationRow[]> {
  let query = supabase
    .from('daily_absence_confirmations')
    .select('*')
    .eq('user_id', userId)
    .order('absence_date', { ascending: false })
    .order('confirmed_at', { ascending: false });

  if (options.startDate) {
    query = query.gte('absence_date', options.startDate);
  }

  if (options.endDate) {
    query = query.lte('absence_date', options.endDate);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load none confirmations: ${error.message}`);
  }

  return (data ?? []) as DailyAbsenceConfirmationRow[];
}
