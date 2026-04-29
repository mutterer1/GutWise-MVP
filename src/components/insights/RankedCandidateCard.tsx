import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Database,
  ShieldCheck,
} from 'lucide-react';
import type { MedicalContextAnnotatedCandidate } from '../../types/insightCandidates';
import type {
  ExplanationInsightItem,
  ExplanationSignalSourceKind,
  ExplanationSignalSourceSummary,
} from '../../types/explanationBundle';
import type { LLMPerItemExplanation } from '../../types/llmExplanationOutput';

interface RankedCandidateCardProps {
  candidate: MedicalContextAnnotatedCandidate;
  bundleItem?: ExplanationInsightItem;
  explanation?: LLMPerItemExplanation;
  rank: number;
}

type PatternType = 'same_day' | 'episodic' | 'recurring';

function getPatternType(subtype: string, category: string): PatternType {
  if (subtype.includes('flare') || subtype.includes('recovery') || subtype.includes('episode')) {
    return 'episodic';
  }

  if (
    category === 'cycle' ||
    subtype.includes('rolling') ||
    subtype.includes('persistence') ||
    subtype.includes('recurrent') ||
    subtype.includes('phase')
  ) {
    return 'recurring';
  }

  return 'same_day';
}

const patternTypeConfig: Record<PatternType, { label: string; description: string }> = {
  same_day: {
    label: 'Same-day association',
    description: 'Overlap detected inside the same logging day.',
  },
  episodic: {
    label: 'Episode pattern',
    description: 'Pattern appears across a flare or recovery window.',
  },
  recurring: {
    label: 'Recurring pattern',
    description: 'Repeated pattern across a longer cycle or rolling window.',
  },
};

const tierFrame: Record<string, string> = {
  high: 'border-[rgba(197,168,255,0.26)] shadow-[0_16px_42px_rgba(104,70,230,0.09)]',
  medium: 'border-[rgba(197,168,255,0.18)] shadow-[var(--gw-shadow-dark-xs)]',
  low: 'border-[rgba(197,168,255,0.12)] shadow-[var(--gw-shadow-dark-xs)]',
};

const tierLabel: Record<string, string> = {
  high: 'High-priority pattern',
  medium: 'Moderate pattern',
  low: 'Early pattern',
};

const subtypeLabels: Record<string, string> = {
  sleep_symptom: 'Poor sleep linked to next-day symptoms',
  poor_sleep_next_day_symptom_burden: 'Poor sleep linked to next-day symptoms',

  stress_urgency: 'High stress linked to bowel urgency',
  high_stress_same_day_urgency: 'High stress linked to bowel urgency',
  stress_high_day_symptom_burden: 'Stress peaks associated with higher symptom load',
  high_stress_day_symptom_burden: 'Stress peaks associated with higher symptom load',

  hydration_stool_consistency: 'Low hydration linked to stool consistency changes',
  low_hydration_next_day_hard_stool: 'Low hydration linked to harder stool the next day',
  hydration_low_same_day_symptom_burden: 'Low hydration associated with worse symptoms',
  low_hydration_same_day_symptom_burden: 'Low hydration associated with worse symptoms',

  food_caffeine_same_day_symptom_burden: 'Caffeine intake linked to same-day symptoms',
  caffeine_same_day_symptom_burden: 'Caffeine intake linked to same-day symptoms',
  food_gut_trigger_load_same_day_symptom_burden:
    'Known ingredient triggers associated with same-day symptoms',
  food_late_meal_next_day_bm_shift: 'Late eating associated with next-day bowel changes',
  late_meal_next_day_bm_shift: 'Late eating associated with next-day bowel changes',
  food_meal_regularity_symptom_burden: 'Irregular meal timing linked to worse symptoms',
  low_meal_regularity_symptom_burden: 'Irregular meal timing linked to worse symptoms',

  bm_urgency_rolling_elevation: 'Sustained elevation in bowel urgency',
  flare_symptom_burden_episode: 'Identifiable symptom flare episode',
  flare_recovery_pattern: 'Recovery pattern following a flare period',

  cycle_phase_bm_shift: 'Cycle phase associated with bowel changes',
  cycle_phase_symptom_shift: 'Cycle phase associated with symptom changes',
  cycle_phase_recurrent_symptom_burden: 'Recurring symptoms across menstrual phases',

  exercise_movement_bm_regularity: 'Regular movement linked to bowel regularity',
  low_movement_bm_regularity: 'Lower movement linked to bowel irregularity',
  exercise_low_movement_symptom_burden: 'Low activity associated with higher symptom load',
  low_movement_symptom_burden: 'Low activity associated with higher symptom load',

  medication_any_bm_shift: 'GI-relevant medication timing linked to bowel changes',
  medication_any_symptom_burden: 'GI-relevant medication timing associated with symptom patterns',

  multifactor_stress_sleep_hydration_risk: 'Combined stress, poor sleep, and low hydration',
  compound_risk_day: 'Combined stress, poor sleep, and low hydration',
  absence_risk_pattern: 'Repeated absence confirmations need attention',

  symptom_type_persistence: 'Persistent recurring symptom type detected',
};

const statusConfig: Record<
  string,
  { label: string; dotClass: string; textClass: string; tentative?: boolean }
> = {
  reliable: {
    label: 'Consistent pattern',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-300',
  },
  emerging: {
    label: 'Pattern building',
    dotClass: 'bg-[var(--gw-intelligence-300)]',
    textClass: 'text-[var(--gw-intelligence-300)]',
  },
  exploratory: {
    label: 'Tentative pattern',
    dotClass: 'bg-[var(--color-text-tertiary)]',
    textClass: 'text-[var(--color-text-tertiary)]',
    tentative: true,
  },
  insufficient: {
    label: 'Not enough data yet',
    dotClass: 'bg-[var(--color-text-tertiary)]',
    textClass: 'text-[var(--color-text-tertiary)]',
    tentative: true,
  },
};

const categoryLabels: Record<string, string> = {
  sleep: 'Sleep',
  stress: 'Stress',
  hydration: 'Hydration',
  food: 'Food',
  gut: 'Gut',
  symptom: 'Symptom',
  routine: 'Routine',
  cycle: 'Menstrual cycle',
  exercise: 'Exercise',
  medication: 'Medication',
  multifactor: 'Multi-factor',
  protective: 'Protective',
  recovery: 'Recovery',
};

const evidenceQualityLabels: Record<string, string> = {
  high: 'High evidence quality',
  moderate: 'Moderate evidence quality',
  low: 'Early evidence',
  very_low: 'Very limited evidence',
};

const signalSourceLabel: Record<ExplanationSignalSourceKind, string> = {
  reviewed_nutrition: 'Reviewed nutrition',
  structured_ingredients: 'Structured ingredients',
  mixed_structured_and_nutrition: 'Mixed evidence',
  fallback_heuristic: 'Heuristic fallback',
  generic_logs: 'Structured logs',
};

function getWindowDays(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function formatFactorLabel(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b(bm|gi)\b/gi, (match) => match.toUpperCase())
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatSubtypeFallback(raw: string): string {
  const spaced = raw.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value * 100)}%`;
}

function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value * 100)}%`;
}

function formatDateRange(start: string, end: string): string {
  return `${new Date(start).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${new Date(end).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
}

function formatLift(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${Number(value).toFixed(value >= 10 ? 0 : 1)}x`;
}

function buildSignalSourceCaution(source: ExplanationSignalSourceSummary): string | null {
  if (source.kind === 'fallback_heuristic') {
    return 'This card is still relying mostly on fallback heuristics because reviewed nutrition or structured ingredient coverage is limited.';
  }

  if (
    source.nutrition_coverage_ratio !== null &&
    source.structured_food_coverage_ratio !== null &&
    source.nutrition_coverage_ratio < 0.65 &&
    source.structured_food_coverage_ratio < 0.65
  ) {
    return 'Structured coverage is still partial here. Accepting more reviewed foods with nutrition and ingredient detail would strengthen this pattern.';
  }

  if (source.nutrition_confidence !== null && source.nutrition_confidence < 0.6) {
    return 'Reviewed nutrition is present here, but the nutrition confidence is still limited.';
  }

  if (
    source.ingredient_signal_confidence !== null &&
    source.ingredient_signal_confidence < 0.6
  ) {
    return 'Structured ingredients are present here, but ingredient confidence is still limited.';
  }

  return null;
}

export default function RankedCandidateCard({
  candidate,
  bundleItem,
  explanation,
  rank,
}: RankedCandidateCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(rank <= 2);

  const patternType = getPatternType(candidate.subtype, candidate.category);
  const patternMeta = patternTypeConfig[patternType];
  const status = statusConfig[candidate.status] ?? statusConfig.exploratory;
  const categoryLabel = categoryLabels[candidate.category] ?? candidate.category;
  const title = subtypeLabels[candidate.subtype] ?? formatSubtypeFallback(candidate.subtype);
  const windowDays = getWindowDays(
    candidate.created_from_start_date,
    candidate.created_from_end_date
  );
  const supportDays = candidate.evidence.sample_dates.length;
  const triggerLabels = candidate.trigger_factors.map(formatFactorLabel);
  const outcomeLabels = candidate.target_outcomes.map(formatFactorLabel);
  const evidenceQuality = candidate.evidence.evidence_quality ?? 'very_low';
  const supportingLogTypes = candidate.evidence.supporting_log_types ?? [];
  const missingLogTypes = candidate.evidence.missing_log_types ?? [];
  const evidenceGaps = candidate.evidence.evidence_gaps ?? [];
  const contradictionRate = candidate.evidence.contradiction_rate;
  const medicalContextApplied = candidate.medical_context_modifier_applied;
  const signalSource = bundleItem?.signal_source ?? null;
  const signalSourceCaution = signalSource ? buildSignalSourceCaution(signalSource) : null;

  return (
    <article
      className={`group relative overflow-hidden rounded-[34px] border bg-[rgba(10,13,31,0.76)] p-5 transition-smooth hover:bg-[rgba(12,15,36,0.84)] ${
        tierFrame[candidate.priority_tier] ?? tierFrame.low
      }`}
    >
      {candidate.priority_tier === 'high' && (
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(197,168,255,0.45)] to-transparent" />
      )}

      <div className="relative mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(197,168,255,0.16)] bg-[rgba(139,92,246,0.12)] font-mono text-sm font-bold text-[var(--gw-intelligence-200)] shadow-[0_0_16px_rgba(139,92,246,0.08)]">
            {String(rank).padStart(2, '0')}
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="clinical-chip clinical-chip-intelligence">{patternMeta.label}</span>
              <span className="clinical-chip">{categoryLabel}</span>
              {signalSource && (
                <span className="rounded-full border border-[rgba(197,168,255,0.18)] bg-white/[0.035] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                  {signalSourceLabel[signalSource.kind]}
                </span>
              )}
            </div>

            <h3 className="text-xl font-semibold leading-snug tracking-[-0.035em] text-[var(--color-text-primary)]">
              {title}
            </h3>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.12)] px-3 py-1 text-xs font-semibold text-[var(--gw-intelligence-300)]">
          {tierLabel[candidate.priority_tier] ?? 'Early pattern'}
        </span>
      </div>

      <div className="relative mb-5 rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SignalPhrase label="Factor" values={triggerLabels} />
          <ArrowRight className="hidden h-5 w-5 shrink-0 text-[var(--gw-intelligence-300)] sm:block" />
          <SignalPhrase label="Outcome" values={outcomeLabels} />
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">
          {patternMeta.description}
        </p>
      </div>

      <div className="relative grid gap-3 sm:grid-cols-4">
        <Metric label="Confidence" value={formatScore(candidate.confidence_score)} />
        <Metric label="Support" value={`${candidate.evidence.support_count}`} />
        <Metric label="Lift" value={formatLift(candidate.evidence.lift)} />
        <Metric label="Window" value={`${windowDays}d`} />
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
          <span className={`font-semibold ${status.textClass}`}>{status.label}</span>
        </div>
        {supportDays > 0 && (
          <span>
            Seen on {supportDays} {supportDays === 1 ? 'day' : 'days'}
          </span>
        )}
        <span>{evidenceQualityLabels[evidenceQuality] ?? evidenceQuality}</span>
      </div>

      {status.tentative && (
        <p className="relative mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">
          This pattern is still building. More consistent overlap across your logs will help confirm
          or rule it out.
        </p>
      )}

      {signalSource && (
        <div className="relative mt-4 rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-[rgba(139,92,246,0.08)] px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-[var(--gw-intelligence-300)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gw-intelligence-300)]">
              Evidence basis / {signalSourceLabel[signalSource.kind]}
            </p>
          </div>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            {signalSource.summary}
          </p>
        </div>
      )}

      {candidate.medical_context_annotations.length > 0 && (
        <div className="relative mt-4 rounded-[22px] border border-[rgba(91,184,240,0.18)] bg-[rgba(91,184,240,0.08)] px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--gw-brand-300)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gw-brand-300)]">
              Medical context
            </p>
          </div>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            {candidate.medical_context_annotations.join(' / ')}
          </p>
        </div>
      )}

      <div className="relative mt-5 rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035]">
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Why this appeared
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
              Evidence window, support counts, comparison counts, and uncertainty
            </p>
          </div>
          {detailsOpen ? (
            <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          )}
        </button>

        {detailsOpen && (
          <div className="border-t border-white/8 px-4 py-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric
                label="Date window"
                value={formatDateRange(
                  candidate.created_from_start_date,
                  candidate.created_from_end_date
                )}
              />
              <Metric label="Exposure" value={String(candidate.evidence.exposure_count)} />
              <Metric label="Contrast" value={String(candidate.evidence.contrast_count ?? 0)} />
              <Metric label="Exposed rate" value={formatPercent(candidate.evidence.exposed_rate)} />
              <Metric label="Baseline rate" value={formatPercent(candidate.evidence.baseline_rate)} />
              <Metric label="Contradiction" value={formatPercent(contradictionRate)} />
              <Metric
                label="Medical context"
                value={medicalContextApplied ? 'Adjusted' : 'No adjustment'}
              />
              <Metric label="Data" value={candidate.data_sufficiency} />
              <Metric label="Priority" value={`${Math.round(candidate.priority_score)} pts`} />
            </div>

            {signalSource && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                  Source coverage
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric
                    label="Nutrition coverage"
                    value={formatPercent(signalSource.nutrition_coverage_ratio)}
                  />
                  <Metric
                    label="Nutrition confidence"
                    value={formatPercent(signalSource.nutrition_confidence)}
                  />
                  <Metric
                    label="Ingredient coverage"
                    value={formatPercent(signalSource.structured_food_coverage_ratio)}
                  />
                  <Metric
                    label="Ingredient confidence"
                    value={formatPercent(signalSource.ingredient_signal_confidence)}
                  />
                </div>

                {signalSourceCaution && (
                  <div className="mt-3 rounded-[20px] border border-[rgba(255,170,92,0.2)] bg-[rgba(255,170,92,0.08)] px-4 py-3">
                    <p className="text-xs leading-5 text-[#FFC26A]">
                      {signalSourceCaution}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DetailLine label="Supporting log types" values={supportingLogTypes} />
            <DetailLine label="Missing context that could strengthen this" values={missingLogTypes} />

            <div className="mt-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                Uncertainty
              </p>
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                {candidate.evidence.uncertainty_statement ??
                  'This pattern is based on repeated overlap in your logs, but it is still not a diagnosis.'}
              </p>
            </div>

            {evidenceGaps.length > 0 && (
              <div className="mt-5 rounded-[20px] border border-[rgba(255,170,92,0.2)] bg-[rgba(255,170,92,0.08)] px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#FFC26A]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FFC26A]">
                    Evidence gaps
                  </p>
                </div>
                <div className="space-y-2">
                  {evidenceGaps.map((gap) => (
                    <p
                      key={`${candidate.insight_key}-${gap.type}-${gap.message}`}
                      className="text-xs leading-5 text-[#FFC26A]"
                    >
                      {gap.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {candidate.ranking_reasons.length > 0 && (
              <div className="mt-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                  Ranking factors
                </p>
                <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">
                  {candidate.ranking_reasons.join(' / ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {explanation && (
        <div className="relative mt-5 space-y-4 border-t border-[rgba(197,168,255,0.14)] pt-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--gw-intelligence-300)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gw-intelligence-300)]">
              Pattern explanation
            </span>
          </div>

          <p className="text-sm leading-6 text-[var(--color-text-primary)]">{explanation.summary}</p>

          {explanation.evidence_statement && (
            <ExplanationBlock label="What we observed" value={explanation.evidence_statement} />
          )}

          {explanation.uncertainty_statement && (
            <ExplanationBlock label="Keep in mind" value={explanation.uncertainty_statement} />
          )}

          {explanation.caution_statement && (
            <div className="rounded-[20px] border border-[rgba(255,170,92,0.2)] bg-[rgba(255,170,92,0.08)] px-4 py-3">
              <p className="text-xs leading-5 text-[#FFC26A]">
                {explanation.caution_statement}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function SignalPhrase({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="text-sm font-semibold leading-6 text-[var(--color-text-primary)]">
        {values.length > 0 ? values.join(', ') : 'Not specified'}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[rgba(197,168,255,0.12)] bg-white/[0.035] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function DetailLine({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
        {values.map(formatFactorLabel).join(', ')}
      </p>
    </div>
  );
}

function ExplanationBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{value}</p>
    </div>
  );
}
