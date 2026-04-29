import { Activity, AlertCircle, ArrowRight, Brain, TrendingUp, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatternInsightsWidgetProps {
  bmCount: number;
  symptomsCount: number;
  stressLevel: number | null;
  hydrationPercentage: number;
  loading: boolean;
}

type InsightType = 'positive' | 'suggestion' | 'neutral';
type InsightConfidence = 'high' | 'medium' | 'low';

interface Insight {
  icon: LucideIcon;
  title: string;
  message: string;
  type: InsightType;
  confidence: InsightConfidence;
}

function getSignalCount(
  bmCount: number,
  hydrationPercentage: number,
  stressLevel: number | null
): number {
  let count = 0;
  if (bmCount > 0) count++;
  if (hydrationPercentage > 0) count++;
  if (stressLevel !== null) count++;
  return count;
}

function getProgressState(signalCount: number) {
  if (signalCount === 0) {
    return {
      label: 'Awaiting inputs',
      headline: "Today's picture is still taking shape.",
      body: 'A few core entries - bowel movement, water intake, and stress - help GutWise summarize today without overreaching.',
      cta: "Start with today's first entry",
    };
  }
  if (signalCount === 1) {
    return {
      label: 'Entry received',
      headline: 'Your daily picture is starting to form.',
      body: "One input is logged. A few more entries will make today's observations more useful.",
      cta: "Keep building today's snapshot",
    };
  }
  if (signalCount === 2) {
    return {
      label: 'Inputs building',
      headline: 'Observations are getting closer.',
      body: "Two inputs are logged. One more area gives today's summary better context.",
      cta: "Complete today's picture",
    };
  }
  return {
    label: 'Pattern ready',
    headline: "Today's picture is taking shape.",
    body: null,
    cta: null,
  };
}

function generateInsights(
  bmCount: number,
  symptomsCount: number,
  stressLevel: number | null,
  hydrationPercentage: number
): Insight[] {
  const insights: Insight[] = [];

  if (hydrationPercentage >= 100) {
    insights.push({
      icon: Activity,
      title: 'Water goal reached',
      message: 'Water-goal credit is complete for today. Compare this with stool form and symptoms over time.',
      type: 'positive',
      confidence: 'high',
    });
  } else if (hydrationPercentage < 50 && hydrationPercentage > 0) {
    insights.push({
      icon: TrendingUp,
      title: 'Water goal opportunity',
      message: 'Water-goal progress is below target. More hydration context may make today easier to interpret.',
      type: 'suggestion',
      confidence: 'medium',
    });
  }

  if (symptomsCount === 0 && bmCount > 0) {
    insights.push({
      icon: Activity,
      title: 'No symptoms reported',
      message: "No symptoms were logged alongside today's bowel entries.",
      type: 'positive',
      confidence: 'medium',
    });
  }

  if (bmCount >= 1 && bmCount <= 3) {
    insights.push({
      icon: TrendingUp,
      title: 'Typical frequency range',
      message: "Today's bowel movement count is within a commonly typical range, based on logged entries only.",
      type: 'positive',
      confidence: 'medium',
    });
  }

  if (stressLevel !== null && stressLevel <= 4) {
    insights.push({
      icon: Brain,
      title: 'Lower stress logged',
      message: 'Stress was logged in a lower range today. Compare this with symptoms and urgency before drawing conclusions.',
      type: 'positive',
      confidence: 'medium',
    });
  } else if (stressLevel !== null && stressLevel >= 7) {
    insights.push({
      icon: AlertCircle,
      title: 'Higher stress today',
      message: 'Higher stress was logged today. Compare it with urgency, stool form, and symptoms before treating it as a pattern.',
      type: 'suggestion',
      confidence: 'high',
    });
  }

  return insights.slice(0, 3);
}

function SignalDots({ count, total = 3 }: { count: number; total?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={
            i < count
              ? 'h-2 w-2 rounded-full bg-[var(--gw-intelligence-300)]'
              : 'h-1.5 w-1.5 rounded-full bg-white/10'
          }
        />
      ))}
    </div>
  );
}

function InsightRow({ insight, index }: { insight: Insight; index: number }) {
  const Icon = insight.icon;

  const rowStyle =
    insight.type === 'positive'
      ? 'border-[rgba(91,184,240,0.18)] bg-[rgba(91,184,240,0.055)]'
      : insight.type === 'suggestion'
        ? 'border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.085)]'
        : 'border-[rgba(197,168,255,0.16)] bg-[rgba(139,92,246,0.055)]';

  const iconStyle =
    insight.type === 'positive'
      ? 'bg-[rgba(91,184,240,0.14)] text-[var(--gw-brand-300)]'
      : 'bg-[rgba(139,92,246,0.16)] text-[var(--gw-intelligence-300)]';

  return (
    <div
      className={`animate-card-up rounded-2xl border px-4 py-3.5 transition-all ${rowStyle}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconStyle}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold leading-snug text-[var(--color-text-primary)]">
              {insight.title}
            </p>
            {insight.confidence === 'high' && insight.type !== 'neutral' && (
              <span className="flex-shrink-0 rounded border border-[rgba(197,168,255,0.2)] bg-[rgba(139,92,246,0.12)] px-1.5 py-px text-[10px] font-medium leading-4 text-[var(--gw-intelligence-300)]">
                Strong
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PatternInsightsWidget({
  bmCount,
  symptomsCount,
  stressLevel,
  hydrationPercentage,
  loading,
}: PatternInsightsWidgetProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="clinical-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-white/10" />
              <div className="h-3 w-52 rounded bg-white/10" />
            </div>
          </div>
          <div className="space-y-2.5 pt-1">
            {[1, 2].map((i) => (
              <div key={i} className="h-[72px] rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const signalCount = getSignalCount(bmCount, hydrationPercentage, stressLevel);
  const progressState = getProgressState(signalCount);
  const insights = generateInsights(bmCount, symptomsCount, stressLevel, hydrationPercentage);
  const hasInsights = insights.length > 0;
  const hasHighConfidence = insights.some((i) => i.confidence === 'high');
  const hasMediumConfidence = insights.some((i) => i.confidence === 'medium');
  const emphasisClass = hasHighConfidence
    ? 'clinical-priority-card'
    : hasMediumConfidence
      ? 'clinical-priority-card'
      : '';

  return (
    <div className={`clinical-card p-6 transition-all ${emphasisClass}`}>
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 rounded-xl p-2.5"
              style={{
                background: 'rgba(139,92,246,0.14)',
              }}
            >
              <Brain className="h-5 w-5 text-[var(--gw-intelligence-300)]" />
            </div>
            <div>
              <h3 className="text-h4 font-sora font-semibold leading-tight text-[var(--color-text-primary)]">
                Today&apos;s observations
              </h3>
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                {hasInsights
                  ? "Observations based on today's logged entries"
                  : "Observations appear as today's context builds"}
              </p>
            </div>
          </div>

          <div className="ml-3 flex flex-shrink-0 flex-col items-end gap-0.5 pt-0">
            <SignalDots count={signalCount} total={3} />
            <span className="text-[10px] font-medium tracking-wide text-[var(--gw-intelligence-300)]">
              {progressState.label}
            </span>
          </div>
        </div>

        {hasInsights ? (
          <div className="space-y-2.5">
            {insights.map((insight, index) => (
              <InsightRow key={index} insight={insight} index={index} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl px-5 py-5"
            style={{
              background:
                'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.03) 60%, transparent 100%)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(139,92,246,0.14)',
                }}
              >
                <Activity className="text-[var(--gw-intelligence-300)]" style={{ width: '17px', height: '17px' }} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1.5 text-body-sm font-semibold leading-snug text-[var(--color-text-primary)]">
                  {progressState.headline}
                </p>

                {progressState.body && (
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {progressState.body}
                  </p>
                )}

                {progressState.cta && (
                  <button
                    onClick={() => navigate('/bm-log')}
                    className="group mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--gw-intelligence-300)] transition-colors hover:text-[var(--gw-intelligence-200)]"
                  >
                    <span className="underline-offset-2 group-hover:underline">
                      {progressState.cta}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <Activity className="h-3 w-3 flex-shrink-0 text-[var(--gw-intelligence-300)]" />
          <p className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">
            {hasInsights
              ? 'Logging across more categories strengthens pattern detection.'
              : "The more complete today's picture, the more useful the observations become."}
          </p>
        </div>
      </div>
    </div>
  );
}
