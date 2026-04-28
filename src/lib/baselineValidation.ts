import type { UserDailyFeatures } from '../types/dailyFeatures';
import type { UserBaselineSet } from '../types/baselines';
import { computeUserBaselines, computeUserBaselinesForWindow } from './baselines';
import { createDemoDailyFeature } from './insightCandidates/demoDailyFeatureDefaults';

function makeSampleDay(overrides: Partial<UserDailyFeatures> & { date: string }): UserDailyFeatures {
  return createDemoDailyFeature(overrides.date, {
    event_count: 8,
    logging_completeness_score: 0.85,
    last_bm_hour: 17,
    hydration_event_count: 6,
    stress_avg: 4,
    stress_peak: 5,
    medication_event_count: 1,
    medications_taken: ['Probiotic'],
    medication_families: ['probiotic'],
    medication_gut_effects: [],
    ...overrides,
  });
}

export function baselineValidationDemo(): {
  features: UserDailyFeatures[];
  baseline: UserBaselineSet | null;
  windowedBaseline: UserBaselineSet | null;
} {
  const features: UserDailyFeatures[] = [
    makeSampleDay({
      date: '2026-03-10',
      bm_count: 1,
      avg_bristol: 3,
      hydration_total_ml: 1500,
      hydration_raw_total_ml: 1850,
      hydration_water_goal_ml: 900,
      hydration_caffeine_mg: 120,
      stress_avg: 3,
      stress_peak: 4,
      sleep_duration_minutes: 360,
      sleep_quality: 3,
      symptom_burden_score: 2,
      max_symptom_severity: 2,
    }),
    makeSampleDay({
      date: '2026-03-11',
      bm_count: 2,
      avg_bristol: 4,
      hydration_total_ml: 2200,
      hydration_raw_total_ml: 2500,
      hydration_water_goal_ml: 1800,
      hydration_caffeine_mg: 60,
      stress_avg: 5,
      stress_peak: 7,
      sleep_duration_minutes: 450,
      sleep_quality: 4,
      symptom_burden_score: 4,
      max_symptom_severity: 4,
      late_meal: true,
    }),
    makeSampleDay({
      date: '2026-03-12',
      bm_count: 3,
      avg_bristol: 5,
      hydration_total_ml: 1800,
      hydration_raw_total_ml: 2100,
      hydration_water_goal_ml: 700,
      hydration_caffeine_mg: 95,
      stress_avg: 4,
      stress_peak: 5,
      sleep_duration_minutes: 400,
      sleep_quality: 3,
      symptom_burden_score: 6,
      max_symptom_severity: 5,
      urgency_event_count: 2,
      alcohol_beverage_count: 1,
    }),
    makeSampleDay({
      date: '2026-03-13',
      bm_count: 2,
      avg_bristol: 4,
      hydration_total_ml: 2500,
      hydration_raw_total_ml: 2500,
      hydration_water_goal_ml: 2200,
      hydration_caffeine_mg: 0,
      stress_avg: 2,
      stress_peak: 3,
      sleep_duration_minutes: 480,
      sleep_quality: 5,
      symptom_burden_score: 1,
      max_symptom_severity: 1,
      caffeine_beverage_count: 0,
    }),
    makeSampleDay({
      date: '2026-03-14',
      bm_count: 2,
      avg_bristol: 4,
      hydration_total_ml: 2000,
      hydration_raw_total_ml: 2400,
      hydration_water_goal_ml: 1500,
      hydration_caffeine_mg: 140,
      stress_avg: 4,
      stress_peak: 6,
      sleep_duration_minutes: null,
      sleep_quality: null,
      symptom_burden_score: 3,
      max_symptom_severity: 3,
      late_meal: true,
    }),
    makeSampleDay({
      date: '2026-03-15',
      bm_count: 1,
      avg_bristol: 3,
      hydration_total_ml: 1600,
      hydration_raw_total_ml: 1900,
      hydration_water_goal_ml: 1000,
      hydration_caffeine_mg: 70,
      stress_avg: null,
      stress_peak: null,
      sleep_duration_minutes: 390,
      sleep_quality: 3,
      symptom_burden_score: 5,
      max_symptom_severity: 4,
      logging_completeness_score: null,
    }),
    makeSampleDay({
      date: '2026-03-16',
      bm_count: 2,
      avg_bristol: 4,
      hydration_total_ml: 2100,
      hydration_raw_total_ml: 2550,
      hydration_water_goal_ml: 1700,
      hydration_caffeine_mg: 110,
      stress_avg: 6,
      stress_peak: 8,
      sleep_duration_minutes: 420,
      sleep_quality: 4,
      symptom_burden_score: 7,
      max_symptom_severity: 6,
      urgency_event_count: 1,
    }),
  ];

  const baseline = computeUserBaselines(features);
  const windowedBaseline = computeUserBaselinesForWindow(features, { windowDays: 5 });

  return { features, baseline, windowedBaseline };
}

export function baselineEmptyDemo(): UserBaselineSet | null {
  return computeUserBaselines([]);
}
