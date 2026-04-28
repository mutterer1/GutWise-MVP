import { useState, type ComponentType, type ReactNode } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { Insight } from '../utils/insightEngine';

interface InsightCardProps {
  insight: Insight;
}

type ConfidenceLevel = Insight['confidence_level'];
type InsightType = Insight['insight_type'];

const confidenceConfig: Record<
  ConfidenceLevel,
  {
    accent: string;
    badge: string;
    icon: ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  low: {
    accent: 'border-[rgba(197,168,255,0.14)]',
    badge: 'border-[rgba(197,168,255,0.16)] bg-white/[0.04] text-[var(--color-text-tertiary)]',
    icon: AlertCircle,
    label: 'Low confidence',
  },
  medium: {
    accent: 'border-[rgba(197,168,255,0.24)]',
    badge:
      'border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.10)] text-[var(--gw-intelligence-300)]',
    icon: TrendingUp,
    label: 'Medium confidence',
  },
  high: {
    accent: 'border-[rgba(197,168,255,0.34)]',
    badge:
      'border-[rgba(197,168,255,0.28)] bg-[rgba(139,92,246,0.16)] text-[var(--gw-intelligence-200)]',
    icon: Lightbulb,
    label: 'High confidence',
  },
};

function getInsightTypeLabel(type: InsightType): string {
  const labels: Record<InsightType, string> = {
    sleep_symptom: 'Sleep & Symptoms',
    stress_urgency: 'Stress Response',
    hydration_consistency: 'Hydration Pattern',
    food_symptom: 'Food & Symptoms',
    temporal_pattern: 'Timing Pattern',
  };

  return labels[type];
}

function getSuggestedNextStep(type: InsightType): string {
  const suggestions: Record<InsightType, string> = {
    sleep_symptom:
      'Try improving sleep consistency for several days and watch whether symptom severity changes.',
    stress_urgency:
      'Track stressful periods closely and compare whether urgency improves when stress is lower.',
    hydration_consistency:
      'Increase hydration earlier in the day and monitor whether stool consistency becomes more comfortable.',
    food_symptom:
      'Try reducing or spacing out this food category for a few meals and compare symptom patterns.',
    temporal_pattern:
      'Use this timing pattern to plan meals, hydration, and routines more intentionally.',
  };

  return suggestions[type];
}

function formatObservedDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
}

function getEvidenceSummary(insight: Insight): string {
  const parts: string[] = [];

  if (insight.evidence.frequency) {
    parts.push(insight.evidence.frequency);
  }

  if (insight.evidence.correlation) {
    parts.push(insight.evidence.correlation);
  }

  if (parts.length === 0) {
    return 'This observation is based on repeated signals in your logs, but the supporting detail is limited.';
  }

  return parts.join(' ');
}

function getUncertaintyStatement(insight: Insight): string {
  if (insight.confidence_level === 'high') {
    return 'This pattern showed up repeatedly in your logs, but it still reflects correlation rather than diagnosis.';
  }

  if (insight.confidence_level === 'medium') {
    return 'This pattern is worth watching, but more overlap across future logs would make it more reliable.';
  }

  return 'This is an early signal with limited support and may change as more data comes in.';
}

export default function InsightCard({ insight }: InsightCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const config = confidenceConfig[insight.confidence_level];
  const ConfidenceIcon = config.icon;

  const observedDates = insight.evidence.dates ?? [];
  const lastObserved =
    observedDates.length > 0 ? observedDates[observedDates.length - 1] : insight.last_detected_at;

  return (
    <article
      className={`group relative overflow-hidden rounded-[30px] border bg-[rgba(10,13,31,0.72)] p-5 shadow-[0_18px_60px_rgba(5,8,22,0.26)] transition-smooth hover:-translate-y-0.5 hover:bg-[rgba(13,16,38,0.82)] ${config.accent}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(197,168,255,0.55)] to-transparent opacity-70" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[rgba(139,92,246,0.14)] blur-3xl transition-smooth group-hover:bg-[rgba(139,92,246,0.2)]" />

      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-[var(--gw-intelligence-300)]">
            <ConfidenceIcon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              {getInsightTypeLabel(insight.insight_type)}
            </span>
          </div>

          <h3 className="text-lg font-semibold leading-snug tracking-[-0.03em] text-[var(--color-text-primary)]">
            {insight.summary}
          </h3>
        </div>

        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${config.badge}`}>
          {config.label}
        </span>
      </div>

      <div className="relative space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile
            label="Occurrences"
            value={`${insight.occurrence_count} ${
              insight.occurrence_count === 1 ? 'match' : 'matches'
            }`}
          />

          <InfoTile
            label="Last observed"
            value={formatObservedDate(lastObserved)}
            icon={<CalendarDays className="h-4 w-4 text-[var(--gw-intelligence-300)]" />}
          />
        </div>

        <div className="rounded-[22px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035]">
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
                Evidence summary, observed dates, and uncertainty
              </p>
            </div>
            {detailsOpen ? (
              <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
            )}
          </button>

          {detailsOpen && (
            <div className="space-y-4 border-t border-white/8 px-4 py-4">
              <DetailBlock label="Evidence summary" value={getEvidenceSummary(insight)} />
              <DetailBlock label="Uncertainty" value={getUncertaintyStatement(insight)} />

              {observedDates.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                    Observed on
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {observedDates.slice(0, 6).map((date, index) => (
                      <span
                        key={`${date}-${index}`}
                        className="rounded-full border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]"
                      >
                        {formatObservedDate(date)}
                      </span>
                    ))}

                    {observedDates.length > 6 && (
                      <span className="rounded-full border border-white/8 bg-white/[0.025] px-2.5 py-1 text-xs text-[var(--color-text-tertiary)]">
                        +{observedDates.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-[rgba(139,92,246,0.09)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--gw-intelligence-300)]" />
            <h4 className="text-sm font-semibold text-[var(--gw-intelligence-200)]">
              Suggested next step
            </h4>
          </div>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            {getSuggestedNextStep(insight.insight_type)}
          </p>
        </div>

        <div className="border-t border-white/8 pt-3">
          <p className="flex items-center gap-2 text-xs leading-5 text-[var(--color-text-tertiary)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--gw-intelligence-300)]" />
            Confidence reflects repetition, overlap, and supporting detail in your logs.
          </p>
        </div>
      </div>
    </article>
  );
}

function InfoTile({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[rgba(197,168,255,0.12)] bg-white/[0.035] p-4">
      <div className="mb-1 flex items-center gap-2 text-[var(--color-text-tertiary)]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{value}</p>
    </div>
  );
}
