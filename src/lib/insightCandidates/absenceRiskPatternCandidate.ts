import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate, CandidateEvidence } from '../../types/insightCandidates';
import { computeRecencyWeight } from './sharedCandidateUtils';

const INSIGHT_KEY = 'daily_absence_confirmation_compound_risk';
const MIN_STREAK_DAYS = 2;

function isAbsenceRiskDay(day: UserDailyFeatures): boolean {
  return (
    day.no_sleep_confirmed ||
    day.no_hydration_confirmed ||
    day.no_bowel_movement_confirmed
  );
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function describeAbsenceTypes(day: UserDailyFeatures): string[] {
  const types: string[] = [];
  if (day.no_sleep_confirmed) types.push('no sleep');
  if (day.no_hydration_confirmed) types.push('no hydration');
  if (day.no_bowel_movement_confirmed) types.push('no bowel movement');
  return types;
}

function longestAbsenceRiskStreak(days: UserDailyFeatures[]): UserDailyFeatures[] {
  let current: UserDailyFeatures[] = [];
  let longest: UserDailyFeatures[] = [];

  for (const day of days) {
    if (!isAbsenceRiskDay(day)) {
      current = [];
      continue;
    }

    const previous = current[current.length - 1];
    if (!previous || addDays(previous.date, 1) === day.date) {
      current = [...current, day];
    } else {
      current = [day];
    }

    if (current.length > longest.length) {
      longest = current;
    }
  }

  return longest;
}

export function analyzeAbsenceRiskPatternCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  const orderedDays = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const daysWithConfirmations = orderedDays.filter(
    (day) => day.absence_confirmation_count > 0
  );

  if (daysWithConfirmations.length === 0) return null;

  const riskDays = orderedDays.filter(isAbsenceRiskDay);
  const longestStreak = longestAbsenceRiskStreak(orderedDays);

  if (longestStreak.length < MIN_STREAK_DAYS) return null;

  const riskDates = riskDays.map((day) => day.date);
  const baselineDates = orderedDays
    .filter((day) => !isAbsenceRiskDay(day))
    .map((day) => day.date);
  const analysisStartDate = orderedDays[0].date;
  const analysisEndDate = orderedDays[orderedDays.length - 1].date;
  const recencyWeight = computeRecencyWeight(riskDates, analysisEndDate);
  const uniqueRiskLabels = [
    ...new Set(riskDays.flatMap(describeAbsenceTypes)),
  ];

  const evidence: CandidateEvidence = {
    support_count: longestStreak.length,
    exposure_count: riskDays.length,
    contradiction_count: 0,
    baseline_rate: null,
    exposed_rate: null,
    lift: null,
    sample_dates: longestStreak.map((day) => day.date),
    contrast_count: baselineDates.length,
    eligible_day_count: orderedDays.length,
    exposed_day_count: riskDays.length,
    baseline_day_count: baselineDates.length,
    contradiction_rate: 0,
    recency_weight: recencyWeight,
    evidence_quality: longestStreak.length >= 3 ? 'moderate' : 'low',
    supporting_log_types: ['daily_absence_confirmations'],
    exposed_dates: riskDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement:
      'This is an explicit absence-safety flag, not a causal diagnosis.',
    notes: [
      `Longest confirmed absence streak: ${longestStreak.length} days.`,
      `Confirmed risk context: ${uniqueRiskLabels.join(', ')}.`,
      'Repeated no sleep, no hydration, or no bowel movement confirmations should be treated as health context for downstream analysis.',
    ],
    statistics: {
      longest_absence_streak_days: longestStreak.length,
      absence_risk_types: uniqueRiskLabels,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'multifactor',
    subtype: 'absence_risk_pattern',
    trigger_factors: [
      'no_sleep_confirmed',
      'no_hydration_confirmed',
      'no_bowel_movement_confirmed',
    ],
    target_outcomes: ['overall_health_context'],
    status: longestStreak.length >= 3 ? 'emerging' : 'exploratory',
    confidence_score: longestStreak.length >= 3 ? 0.45 : 0.34,
    data_sufficiency: longestStreak.length >= 3 ? 'adequate' : 'partial',
    evidence,
    created_from_start_date: analysisStartDate,
    created_from_end_date: analysisEndDate,
  };
}
