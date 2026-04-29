import { AlertCircle, FileSearch, ShieldCheck } from 'lucide-react';
import type {
  ExplanationInsightItem,
  ExplanationSignalSourceKind,
  RankedExplanationBundle,
} from '../../types/explanationBundle';
import type { CandidateEvidenceGapSummary } from '../../lib/insightCandidates/runRankedInsightPipeline';

interface PatternEvidenceSectionProps {
  bundle: RankedExplanationBundle;
  missingLogTypes: string[];
  evidenceGapSummaries: CandidateEvidenceGapSummary[];
}

const signalSourceConfig: Record<
  ExplanationSignalSourceKind,
  {
    label: string;
    badgeClass: string;
    accentClass: string;
  }
> = {
  reviewed_nutrition: {
    label: 'Reviewed nutrition',
    badgeClass:
      'border-[rgba(56,189,122,0.22)] bg-[rgba(56,189,122,0.10)] text-emerald-300 print:border-gray-300 print:bg-gray-100 print:text-gray-700',
    accentClass: 'text-emerald-300 print:text-gray-700',
  },
  structured_ingredients: {
    label: 'Structured ingredients',
    badgeClass:
      'border-[rgba(91,184,240,0.24)] bg-[rgba(91,184,240,0.10)] text-[var(--gw-brand-300)] print:border-gray-300 print:bg-gray-100 print:text-gray-700',
    accentClass: 'text-[var(--gw-brand-300)] print:text-gray-700',
  },
  mixed_structured_and_nutrition: {
    label: 'Mixed evidence',
    badgeClass:
      'border-[rgba(197,168,255,0.24)] bg-[rgba(139,92,246,0.12)] text-[var(--gw-intelligence-300)] print:border-gray-300 print:bg-gray-100 print:text-gray-700',
    accentClass: 'text-[var(--gw-intelligence-300)] print:text-gray-700',
  },
  fallback_heuristic: {
    label: 'Heuristic fallback',
    badgeClass:
      'border-[rgba(255,170,92,0.24)] bg-[rgba(255,170,92,0.10)] text-[#FFC26A] print:border-gray-300 print:bg-gray-100 print:text-gray-700',
    accentClass: 'text-[#FFC26A] print:text-gray-700',
  },
  generic_logs: {
    label: 'Structured logs',
    badgeClass:
      'border-[rgba(197,168,255,0.16)] bg-white/[0.035] text-[var(--color-text-secondary)] print:border-gray-300 print:bg-gray-100 print:text-gray-700',
    accentClass: 'text-[var(--color-text-secondary)] print:text-gray-700',
  },
};

const statusLabels: Record<string, string> = {
  reliable: 'Consistent pattern',
  emerging: 'Pattern building',
  exploratory: 'Tentative pattern',
  insufficient: 'Not enough data yet',
};

function formatPercent(value: number | null): string {
  if (value === null) return 'N/A';
  return `${Math.round(value * 100)}%`;
}

function formatLift(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(1)}x`;
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

function formatCategoryLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
}

function buildSourceCaution(item: ExplanationInsightItem): string | null {
  const source = item.signal_source;

  if (source.kind === 'fallback_heuristic') {
    return 'This finding still relies more on fallback heuristics than on reviewed nutrition or structured ingredient coverage.';
  }

  if (source.nutrition_coverage_ratio !== null && source.nutrition_coverage_ratio < 0.65) {
    return 'Reviewed nutrition coverage is still partial for this finding.';
  }

  if (
    source.structured_food_coverage_ratio !== null &&
    source.structured_food_coverage_ratio < 0.65
  ) {
    return 'Structured ingredient coverage is still partial for this finding.';
  }

  return null;
}

function summarizeSourceMix(items: ExplanationInsightItem[]): Array<{
  kind: ExplanationSignalSourceKind;
  count: number;
}> {
  const counts = new Map<ExplanationSignalSourceKind, number>();

  for (const item of items) {
    counts.set(item.signal_source.kind, (counts.get(item.signal_source.kind) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([kind, count]) => ({ kind, count }))
    .sort((left, right) => right.count - left.count);
}

function PatternEvidenceCard({ item }: { item: ExplanationInsightItem }) {
  const sourceMeta = signalSourceConfig[item.signal_source.kind];
  const sourceCaution = buildSourceCaution(item);
  const triggerSummary = item.trigger_factors.map(formatFactorLabel).join(', ');
  const outcomeSummary = item.target_outcomes.map(formatFactorLabel).join(', ');
  const title = formatSubtypeFallback(item.subtype);
  const relationshipSummary =
    triggerSummary.length > 0 && outcomeSummary.length > 0
      ? { trigger: triggerSummary, outcome: outcomeSummary }
      : null;

  return (
    <article className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-5 print:border-gray-300 print:bg-white">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${sourceMeta.badgeClass}`}>
              {sourceMeta.label}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)] print:text-gray-500">
              {statusLabels[item.status] ?? item.status}
            </span>
          </div>
          <h4 className="text-base font-semibold leading-7 tracking-[-0.025em] text-[var(--color-text-primary)] print:text-gray-900">
            {title}
          </h4>
        </div>

        <span className="rounded-full border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)] print:border-gray-300 print:bg-gray-100 print:text-gray-700">
          {formatCategoryLabel(item.category)}
        </span>
      </div>

      {relationshipSummary && (
        <div className="rounded-[22px] border border-[rgba(197,168,255,0.12)] bg-[rgba(7,10,24,0.26)] px-4 py-3 print:border-gray-200 print:bg-gray-50">
          <p className="text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-700">
            <span className="font-semibold text-[var(--color-text-primary)] print:text-gray-900">
              {relationshipSummary.trigger}
            </span>
            <span className="mx-2 text-[var(--gw-intelligence-300)] print:text-gray-500">to</span>
            <span>{relationshipSummary.outcome}</span>
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Support count" value={String(item.evidence.support_count)} />
        <Stat label="Exposure count" value={String(item.evidence.exposure_count)} />
        <Stat label="Lift" value={formatLift(item.evidence.lift)} />
        <Stat label="Contradiction" value={formatPercent(item.evidence.contradiction.ratio)} />
      </div>

      <div className="mt-4 rounded-[22px] border border-[rgba(197,168,255,0.14)] bg-[rgba(139,92,246,0.08)] px-4 py-3 print:border-gray-200 print:bg-gray-50">
        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${sourceMeta.accentClass}`}>
          Evidence basis
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-700">
          {item.signal_source.summary}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Nutrition coverage"
          value={formatPercent(item.signal_source.nutrition_coverage_ratio)}
        />
        <Stat
          label="Nutrition confidence"
          value={formatPercent(item.signal_source.nutrition_confidence)}
        />
        <Stat
          label="Ingredient coverage"
          value={formatPercent(item.signal_source.structured_food_coverage_ratio)}
        />
        <Stat
          label="Ingredient confidence"
          value={formatPercent(item.signal_source.ingredient_signal_confidence)}
        />
      </div>

      {item.medical_context_annotations.length > 0 && (
        <div className="mt-4 rounded-[22px] border border-[rgba(91,184,240,0.18)] bg-[rgba(91,184,240,0.08)] px-4 py-3 print:border-gray-200 print:bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gw-brand-300)] print:text-gray-700">
            Medical context
          </p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-text-secondary)] print:text-gray-700">
            {item.medical_context_annotations.join(' / ')}
          </p>
        </div>
      )}

      {sourceCaution && (
        <div className="mt-4 rounded-[22px] border border-[rgba(255,170,92,0.2)] bg-[rgba(255,170,92,0.08)] px-4 py-3 print:border-gray-200 print:bg-gray-50">
          <p className="text-xs leading-5 text-[#FFC26A] print:text-gray-700">{sourceCaution}</p>
        </div>
      )}

      {item.ranking_reasons.length > 0 && (
        <p className="mt-4 text-xs leading-5 text-[var(--color-text-tertiary)] print:text-gray-500">
          Ranking context: {item.ranking_reasons.join(' / ')}
        </p>
      )}
    </article>
  );
}

export default function PatternEvidenceSection({
  bundle,
  missingLogTypes,
  evidenceGapSummaries,
}: PatternEvidenceSectionProps) {
  const items = bundle.items;
  const sourceMix = summarizeSourceMix(items);

  return (
    <section className="clinical-card mb-5 p-5 print:border-gray-300 print:bg-white print:p-6">
      <div className="mb-5 border-b border-[rgba(197,168,255,0.12)] pb-4 print:border-gray-200">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gw-intelligence-300)] print:text-gray-500">
          Pattern Evidence
        </p>
        <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] print:text-gray-900">
          Ranked insight trust framing
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-600">
          These report patterns use the same ranked insight pipeline as the live Insights screen and
          carry explicit provenance about reviewed nutrition, structured ingredients, or heuristic
          fallback.
        </p>
      </div>

      {items.length > 0 ? (
        <>
          <div className="mb-5 rounded-[24px] border border-[rgba(197,168,255,0.16)] bg-[rgba(139,92,246,0.08)] p-4 print:border-gray-200 print:bg-gray-50">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--gw-intelligence-300)] print:text-gray-700" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--gw-intelligence-200)] print:text-gray-900">
                  Report trust standard
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-700">
                  GutWise should say when a finding is backed by reviewed nutrition, when it is
                  backed by structured ingredient matching, and when it is still leaning on fallback
                  heuristics. These cards carry that framing directly into print and PDF export.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2.5">
            {sourceMix.map((entry) => {
              const meta = signalSourceConfig[entry.kind];
              return (
                <div
                  key={entry.kind}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${meta.badgeClass}`}
                >
                  {entry.count} {meta.label.toLowerCase()}
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <PatternEvidenceCard key={item.insight_key} item={item} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4 print:border-gray-200 print:bg-gray-50">
          <div className="flex items-start gap-3">
            <FileSearch className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-text-tertiary)] print:text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] print:text-gray-900">
                No ranked patterns were strong enough to include here
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-700">
                This report window did not produce enough repeated overlap for a provenance-aware
                ranked pattern summary.
              </p>

              {missingLogTypes.length > 0 && (
                <p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)] print:text-gray-500">
                  Missing context that would help most:{' '}
                  {missingLogTypes.map(formatFactorLabel).join(', ')}
                </p>
              )}

              {evidenceGapSummaries.length > 0 && (
                <div className="mt-3 space-y-2">
                  {evidenceGapSummaries.slice(0, 2).map((summary) => (
                    <div
                      key={summary.insight_key}
                      className="rounded-[18px] border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.08)] px-3 py-2 print:border-gray-200 print:bg-white"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#FFC26A] print:text-gray-600" />
                        <p className="text-xs leading-5 text-[#FFC26A] print:text-gray-700">
                          {summary.reasons[0] ??
                            'More repeated overlap is needed in this report window.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-[22px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-4 py-3 print:border-gray-200 print:bg-gray-50">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--gw-intelligence-300)] print:text-gray-600" />
          <p className="text-xs leading-5 text-[var(--color-text-secondary)] print:text-gray-700">
            Report exports should preserve the difference between reviewed evidence and fallback
            heuristics. That helps keep the clinical conversation grounded in what GutWise actually
            knows versus what it is still inferring.
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[rgba(197,168,255,0.12)] bg-white/[0.035] px-3 py-2 print:border-gray-200 print:bg-gray-50">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] print:text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)] print:text-gray-900">
        {value}
      </p>
    </div>
  );
}
