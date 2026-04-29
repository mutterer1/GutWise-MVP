export const ABSENCE_TYPES = [
  'symptoms',
  'stress',
  'pain',
  'exercise',
  'hydration',
  'bowel_movement',
  'sleep',
  'medication',
] as const;

export type AbsenceType = (typeof ABSENCE_TYPES)[number];

export interface DailyAbsenceConfirmationRow {
  id: string;
  user_id: string;
  absence_date: string;
  absence_type: AbsenceType;
  confirmed_at: string;
  notes: string | null;
  source: 'daily_mark_none' | 'system' | 'import';
  created_at?: string;
  updated_at?: string;
}

export interface DailyAbsenceConfirmationInput {
  user_id: string;
  absence_date: string;
  absence_type: AbsenceType;
  confirmed_at?: string;
  notes?: string | null;
  source?: DailyAbsenceConfirmationRow['source'];
}
