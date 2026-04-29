import { useEffect, useState, useCallback, type ReactNode } from 'react';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import RankedCandidateCard from '../components/insights/RankedCandidateCard';
import TrustExplainer from '../components/TrustExplainer';
import {
  Activity,
  AlertCircle,
  Brain,
  Database,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateAllInsights, saveInsights, getUserInsights, type Insight } from '../utils/insightEngine';
import { useRankedInsights } from '../hooks/useRankedInsights';
import type { ExplanationInsightItem } from '../types/explanationBundle';
import type { LLMPerItemExplanation } from '../types/llmExplanationOutput';

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLogTypeLabel(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b(bm|gi)\b/gi, (match) => match.toUpperCase())
    .replace(/^\w/, (char) => char.toUpperCase());
}

type InsightSource =
  | 'ranked_loading'
  | 'ranked_primary'
  | 'ranked_empty'
  | 'legacy_error_fallback';

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    insights: rankedInsights,
    loading: rankedLoading,
    error: rankedError,
    firstRunCompleted: rankedFirstRunCompleted,
    explanationResult,
    explanationLoading,
    explanationError,
    explanationOrigin,
    generateExplanations,
  } = useRankedInsights();

  const explanationMap = useCallback((): Map<string, LLMPerItemExplanation> => {
    const map = new Map<string, LLMPerItemExplanation>();
    if (explanationResult?.success && explanationResult.explanation_output) {
      for (const item of explanationResult.explanation_output.explanations) {
        map.set(item.insight_key, item);
      }
    }
    return map;
  }, [explanationResult]);

  const loadInsights = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getUserInsights(user.id);
      setInsights(data);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleGenerateInsights = async () => {
    if (!user) return;

    try {
      setGenerating(true);
      setError(null);
      const newInsights = await generateAllInsights(user.id);

      if (newInsights.length > 0) {
        await saveInsights(newInsights);
        await loadInsights();
      } else {
        setError(
          'Not enough data to generate insights yet. Keep logging daily activities to unlock meaningful patterns.'
        );
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to analyze your latest data. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const rankedCandidates = rankedInsights?.candidates ?? [];
  const evidenceGapSummaries = rankedInsights?.evidence_gap_summaries ?? [];
  const missingLogTypes = rankedInsights?.missing_log_types ?? [];
  const rankedSettled = rankedFirstRunCompleted && !rankedLoading;
  const hasRankedCandidates = rankedCandidates.length > 0;

  const isLegacyErrorFallback = rankedSettled && !!rankedError;
  const isRankedEmpty = rankedSettled && !rankedError && !hasRankedCandidates;
  const isRankedPrimary = rankedSettled && !rankedError && hasRankedCandidates;

  const insightSource: InsightSource = rankedLoading
    ? 'ranked_loading'
    : isRankedPrimary
      ? 'ranked_primary'
      : isRankedEmpty
        ? 'ranked_empty'
        : 'legacy_error_fallback';

  useEffect(() => {
    if (user && isLegacyErrorFallback) {
      loadInsights();
    }
  }, [user, isLegacyErrorFallback, loadInsights]);

  const validation = explanationResult?.validation ?? null;
  const isSafeToUse = validation?.is_safe_to_use === true;
  const validationStatus = validation?.status ?? null;

  const distinctWarningFlags =
    validationStatus === 'valid_with_warnings'
      ? [...new Set((validation?.flags ?? []).map((flag) => flag.type))]
      : [];

  const exMap: Map<string, LLMPerItemExplanation> = isSafeToUse
    ? explanationMap()
    : new Map<string, LLMPerItemExplanation>();
  const bundleItemMap = new Map<string, ExplanationInsightItem>();
  for (const item of rankedInsights?.explanationBundle.items ?? []) {
    bundleItemMap.set(item.insight_key, item);
  }

  const analysisWindowLabel =
    rankedInsights?.analyzed_from && rankedInsights?.analyzed_to
      ? `${formatShortDate(rankedInsights.analyzed_from)} - ${formatShortDate(
          rankedInsights.analyzed_to
        )}`
      : 'Window building';
  const strongSignalCount = rankedCandidates.filter(
    (candidate) => candidate.priority_tier === 'high'
  ).length;
  const totalEvidenceGapCount = evidenceGapSummaries.reduce(
    (count, summary) => count + summary.reasons.length,
    0
  );

  return (
    <MainLayout>
      <div
        className="relative min-h-screen overflow-hidden pb-12"
        data-insight-source={insightSource}
        data-explanation-origin={explanationOrigin}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[34rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,92,246,0.14)_0%,rgba(91,184,240,0.06)_38%,transparent_78%)]" />
        <div className="pointer-events-none absolute right-[-10rem] top-36 h-80 w-80 rounded-full bg-[rgba(197,168,255,0.07)] blur-3xl" />
        <div className="pointer-events-none absolute left-[-8rem] top-[28rem] h-72 w-72 rounded-full bg-[rgba(91,184,240,0.05)] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl space-y-6">
          <section className="page-enter relative overflow-hidden rounded-[38px] border border-[rgba(197,168,255,0.14)] bg-[linear-gradient(135deg,rgba(13,16,38,0.92),rgba(28,21,54,0.82))] p-5 shadow-[0_24px_64px_rgba(6,8,24,0.3)] sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(197,168,255,0.65)] to-transparent" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[rgba(139,92,246,0.12)] blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
              <div>
                <span className="signal-badge signal-badge-major mb-5">
                  <Brain className="h-3.5 w-3.5" />
                  Health Intelligence Console
                </span>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
                  Find the patterns hiding between your logs
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)]">
                  GutWise compares bowel movements, food, hydration, symptoms, stress, sleep,
                  movement, medication, cycle context, and medical history to surface clinician-safe
                  pattern intelligence.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <HeroPill icon={<ShieldCheck className="h-4 w-4" />} label="Non-diagnostic" />
                  <HeroPill icon={<Database className="h-4 w-4" />} label="Evidence weighted" />
                  <HeroPill icon={<Target className="h-4 w-4" />} label="Context aware" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <HeroMetric label="Patterns" value={`${rankedCandidates.length}`} helper="Ranked signals" />
                <HeroMetric label="Strong" value={`${strongSignalCount}`} helper="High-priority signals" />
                <HeroMetric
                  label="Window"
                  value={`${rankedInsights?.input_day_count ?? 0}d`}
                  helper={analysisWindowLabel}
                />
                <HeroMetric
                  label="Profile"
                  value={rankedInsights?.medical_context_applied ? 'Applied' : 'Neutral'}
                  helper="Medical context layer"
                />
              </div>
            </div>

            {isLegacyErrorFallback && (
              <div className="relative mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-4 py-4">
                <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                  Ranked analysis is unavailable, so GutWise can refresh legacy observations.
                </p>
                <Button onClick={handleGenerateInsights} disabled={generating} className="shrink-0">
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Refresh Insights
                    </>
                  )}
                </Button>
              </div>
            )}
          </section>

          {error && <AlertPanel tone="danger" message={error} />}

          {rankedLoading && <LoadingConsole />}

          {isRankedPrimary && (
            <section className="space-y-5">
              <div className="surface-panel rounded-[34px] p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2.5">
                      <h2 className="text-3xl font-semibold tracking-[-0.045em] text-[var(--color-text-primary)]">
                        Ranked Pattern Signals
                      </h2>
                      {explanationOrigin !== 'none' && !explanationError && (
                        <span className="signal-badge signal-badge-major">AI explained</span>
                      )}
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                      {rankedInsights?.input_day_count ?? 0} days analyzed
                      {rankedInsights?.analyzed_from && rankedInsights?.analyzed_to
                        ? ` / ${formatShortDate(rankedInsights.analyzed_from)} - ${formatShortDate(
                            rankedInsights.analyzed_to
                          )}`
                        : ''}
                      {rankedInsights?.medical_context_applied
                        ? ' / Personalized with active medical context'
                        : ' / No active medical-context adjustment'}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                    {explanationError && (
                      <div className="flex items-center gap-2 rounded-full border border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.08)] px-3 py-2 text-sm text-[var(--color-danger)]">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Could not generate explanations</span>
                      </div>
                    )}

                    <button
                      onClick={generateExplanations}
                      disabled={explanationLoading}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(197,168,255,0.24)] bg-[rgba(139,92,246,0.12)] px-4 py-2 text-sm font-semibold text-[var(--gw-intelligence-200)] transition-smooth hover:bg-[rgba(139,92,246,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {explanationLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Explaining...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          {explanationOrigin === 'none'
                            ? 'Explain Patterns'
                            : 'Refresh Explanations'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {validationStatus === 'invalid' && (
                <AlertPanel
                  tone="danger"
                  message="AI explanations could not be verified and will not be shown. Your ranked patterns are still displayed below."
                />
              )}

              {validationStatus === 'valid_with_warnings' && distinctWarningFlags.length > 0 && (
                <AlertPanel
                  tone="warning"
                  message={`Some explanations may be incomplete. ${distinctWarningFlags.length} validation warning type(s) were detected.`}
                />
              )}

              <TrustExplainer variant="insights" />

              {(evidenceGapSummaries.length > 0 || missingLogTypes.length > 0) && (
                <EvidenceGapPanel
                  missingLogTypes={missingLogTypes}
                  evidenceGapSummaries={evidenceGapSummaries}
                  totalEvidenceGapCount={totalEvidenceGapCount}
                />
              )}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {rankedCandidates.map((candidate, index) => (
                  <RankedCandidateCard
                    key={candidate.insight_key}
                    candidate={candidate}
                    bundleItem={bundleItemMap.get(candidate.insight_key)}
                    explanation={exMap.get(candidate.insight_key)}
                    rank={index + 1}
                  />
                ))}
              </div>
            </section>
          )}

          {isRankedEmpty && (
            <section className="space-y-5">
              <TrustExplainer variant="insights" />
              <EmptyRankedState
                missingLogTypes={missingLogTypes}
                evidenceGapSummaries={evidenceGapSummaries}
              />
            </section>
          )}

          {isLegacyErrorFallback && (
            <section className="space-y-5">
              <AlertPanel
                tone="info"
                title="Ranked pattern analysis encountered a problem"
                message="GutWise could not complete ranked analysis right now. Showing available saved observations from your logs instead."
              />

              {loading ? (
                <LoadingConsole label="Loading your saved observations..." />
              ) : insights.length === 0 ? (
                <LegacyEmptyState
                  generating={generating}
                  onGenerate={handleGenerateInsights}
                />
              ) : (
                <>
                  <div className="surface-panel rounded-[28px] px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-tertiary)]">
                      <span>
                        {insights.length}{' '}
                        {insights.length === 1 ? 'observation' : 'observations'} found
                      </span>
                      <span className="text-white/10">/</span>
                      <span>Based on repeated signals in your logs</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {insights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function HeroPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(197,168,255,0.16)] bg-white/[0.045] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
      <span className="text-[var(--gw-intelligence-300)]">{icon}</span>
      {label}
    </span>
  );
}

function HeroMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-[rgba(197,168,255,0.16)] bg-white/[0.045] p-4 backdrop-blur">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-2 text-[2.15rem]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}

function AlertPanel({
  tone,
  message,
  title,
}: {
  tone: 'danger' | 'warning' | 'info';
  message: string;
  title?: string;
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.08)] text-[var(--color-danger)]'
      : tone === 'warning'
        ? 'border-[rgba(255,170,92,0.24)] bg-[rgba(255,170,92,0.08)] text-[#FFC26A]'
        : 'border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.08)] text-[var(--gw-intelligence-300)]';

  return (
    <div className={`flex items-start gap-3 rounded-[24px] border p-4 ${toneClass}`}>
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>
        {title && <p className="text-sm font-semibold">{title}</p>}
        <p className="text-sm leading-6">{message}</p>
      </div>
    </div>
  );
}

function LoadingConsole({ label = 'Looking for patterns in your data...' }: { label?: string }) {
  return (
    <div className="surface-panel flex h-80 flex-col items-center justify-center gap-4 rounded-[34px]">
      <div className="insight-orb">
        <Loader2 className="h-5 w-5 animate-spin text-white" />
      </div>
      <p className="text-sm text-[var(--color-text-tertiary)]">{label}</p>
    </div>
  );
}

function EvidenceGapPanel({
  missingLogTypes,
  evidenceGapSummaries,
  totalEvidenceGapCount,
}: {
  missingLogTypes: string[];
  evidenceGapSummaries: Array<{
    insight_key: string;
    category: string;
    subtype: string;
    reasons: string[];
    supporting_log_types: string[];
    missing_log_types: string[];
  }>;
  totalEvidenceGapCount: number;
}) {
  return (
    <section className="rounded-[32px] border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.07)] p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.10)] text-[#FFC26A]">
            <Activity className="h-5 w-5" />
          </div>
          <p className="data-kicker text-[#FFC26A]">Evidence gaps</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
            Stronger logging will sharpen future insights
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            GutWise filtered weaker candidates and kept the better-supported signals. These gaps
            show what would improve the next ranked pass.
          </p>
          <p className="mt-4 text-sm font-semibold text-[#FFC26A]">
            {totalEvidenceGapCount} gap note{totalEvidenceGapCount === 1 ? '' : 's'} detected
          </p>
        </div>

        <div className="space-y-4">
          {missingLogTypes.length > 0 && (
            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#FFC26A]">
                Most useful missing log types
              </p>
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                {missingLogTypes.slice(0, 6).map(formatLogTypeLabel).join(', ')}
              </p>
            </div>
          )}

          {evidenceGapSummaries.slice(0, 3).map((summary) => (
            <div
              key={summary.insight_key}
              className="rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-4"
            >
              <p className="text-sm font-semibold leading-6 text-[var(--color-text-primary)]">
                {summary.reasons[0] ?? 'This candidate needs more repeated overlap.'}
              </p>
              {summary.missing_log_types.length > 0 && (
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Helpful next logs: {summary.missing_log_types.map(formatLogTypeLabel).join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyRankedState({
  missingLogTypes,
  evidenceGapSummaries,
}: {
  missingLogTypes: string[];
  evidenceGapSummaries: Array<{
    insight_key: string;
    category: string;
    subtype: string;
    reasons: string[];
    supporting_log_types: string[];
    missing_log_types: string[];
  }>;
}) {
  return (
    <section className="surface-panel rounded-[36px] px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="insight-orb mx-auto mb-6">
        <Brain className="h-5 w-5 text-white" />
      </div>

      <div className="mx-auto max-w-[760px]">
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
          No reliable patterns detected yet
        </h3>

        <p className="mx-auto mt-4 max-w-[46rem] text-sm leading-7 text-[var(--color-text-secondary)]">
          GutWise does not have enough repeated overlap in your recent logs to show a strong
          pattern. This is the correct behavior; weak evidence should not be dressed up as insight.
        </p>

        {missingLogTypes.length > 0 ? (
          <p className="mx-auto mt-4 max-w-[44rem] text-sm leading-7 text-[var(--color-text-secondary)]">
            The most useful missing context right now is:{' '}
            {missingLogTypes.slice(0, 6).map(formatLogTypeLabel).join(', ')}.
          </p>
        ) : (
          <p className="mx-auto mt-4 max-w-[44rem] text-sm leading-7 text-[var(--color-text-secondary)]">
            The strongest starting combination is stool, symptoms, meals, hydration, sleep, and
            stress logged on the same days.
          </p>
        )}

        {evidenceGapSummaries.length > 0 && (
          <div className="mx-auto mt-6 max-w-[760px] rounded-[26px] border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.07)] px-5 py-5 text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#FFC26A]">
              What is missing
            </p>
            <div className="space-y-3">
              {evidenceGapSummaries.slice(0, 3).map((summary) => (
                <p
                  key={summary.insight_key}
                  className="text-sm leading-7 text-[var(--color-text-secondary)]"
                >
                  {summary.reasons[0]}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LegacyEmptyState({
  generating,
  onGenerate,
}: {
  generating: boolean;
  onGenerate: () => void;
}) {
  return (
    <section className="surface-panel rounded-[36px] px-6 py-12 text-center sm:px-10 sm:py-14">
      <div className="insight-orb mx-auto mb-6">
        <Brain className="h-5 w-5 text-white" />
      </div>

      <div className="mx-auto max-w-md">
        <h3 className="mb-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
          No saved observations available
        </h3>

        <p className="mb-4 text-sm leading-7 text-[var(--color-text-secondary)]">
          Ranked pattern analysis ran into a problem and there are no previously saved observations
          to fall back on.
        </p>

        <p className="mb-8 text-xs leading-6 text-[var(--color-text-tertiary)]">
          Continue logging and try refreshing insights. If the problem persists, check back later.
        </p>
      </div>

      <Button onClick={onGenerate} disabled={generating}>
        {generating ? 'Analyzing...' : 'Try Again'}
      </Button>
    </section>
  );
}
