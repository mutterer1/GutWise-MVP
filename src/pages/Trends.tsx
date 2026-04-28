import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  Droplet,
  FileText,
  Frown,
  Gauge,
  Loader2,
  Moon,
  Sparkles,
  TrendingUp,
  Waves as Wave,
  Zap,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import { useTrendsData, type TimeRange } from '../hooks/useTrendsData';
import BMFrequencyChart from '../components/trends/BMFrequencyChart';
import BristolDistributionChart from '../components/trends/BristolDistributionChart';
import SymptomIntensityChart from '../components/trends/SymptomIntensityChart';
import HydrationCorrelationChart from '../components/trends/HydrationCorrelationChart';
import SleepSymptomChart from '../components/trends/SleepSymptomChart';
import StressUrgencyChart from '../components/trends/StressUrgencyChart';

const timeRanges: TimeRange[] = [
  { days: 7, label: '7 Days' },
  { days: 14, label: '14 Days' },
  { days: 30, label: '30 Days' },
];

const timeRangeMeta: Record<
  TimeRange['days'],
  {
    title: string;
    description: string;
  }
> = {
  7: {
    title: 'Short read',
    description: 'Best for immediate rhythm shifts and recent symptom pressure.',
  },
  14: {
    title: 'Pattern arc',
    description: 'Best for seeing whether a signal repeats beyond a one-off event.',
  },
  30: {
    title: 'Month scan',
    description: 'Best for clinician-prep context and slower-moving lifestyle overlays.',
  },
};

interface TrendSummaryStats {
  totalBMs: number;
  idealBristolCount: number;
  avgSymptomSeverity: number | null;
  waterGoalDays: number;
  symptomDays: number;
  sleepDays: number;
  stressDays: number;
  urgencyEvents: number;
  activeSignals: number;
  coverageScore: number;
}

interface SignalMapItem {
  label: string;
  value: string;
  helper: string;
  status: string;
  icon: LucideIcon;
  tone: 'major' | 'daily' | 'rose' | 'blue';
}

export default function Trends() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRanges[0]);
  const { data, loading, error } = useTrendsData(selectedRange);

  const summaryStats = useMemo<TrendSummaryStats>(() => {
    if (!data) {
      return {
        totalBMs: 0,
        idealBristolCount: 0,
        avgSymptomSeverity: null,
        waterGoalDays: 0,
        symptomDays: 0,
        sleepDays: 0,
        stressDays: 0,
        urgencyEvents: 0,
        activeSignals: 0,
        coverageScore: 0,
      };
    }

    const totalBMs = data.bmFrequency.reduce((sum, item) => sum + item.count, 0);
    const totalBristolRecords = data.bristolDistribution.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const idealBristolCount = data.bristolDistribution
      .filter((item) => item.type === 3 || item.type === 4)
      .reduce((sum, item) => sum + item.count, 0);
    const avgSymptomSeverity =
      data.symptomTrends.length > 0
        ? data.symptomTrends.reduce((sum, item) => sum + item.avgSeverity, 0) /
          data.symptomTrends.length
        : null;
    const waterGoalDays = data.hydrationCorrelation.filter(
      (item) => item.totalHydration > 0
    ).length;
    const symptomDays = new Set(data.symptomTrends.map((item) => item.date)).size;
    const sleepDays = data.sleepSymptomCorrelation.filter(
      (item) => item.sleepHours !== null
    ).length;
    const stressDays = data.stressUrgencyCorrelation.filter(
      (item) => item.avgStressLevel !== null
    ).length;
    const urgencyEvents = data.stressUrgencyCorrelation.reduce(
      (sum, item) => sum + item.urgencyEpisodes,
      0
    );
    const activeSignals = [
      totalBMs > 0,
      totalBristolRecords > 0,
      symptomDays > 0,
      waterGoalDays > 0,
      sleepDays > 0,
      stressDays > 0,
    ].filter(Boolean).length;

    return {
      totalBMs,
      idealBristolCount,
      avgSymptomSeverity,
      waterGoalDays,
      symptomDays,
      sleepDays,
      stressDays,
      urgencyEvents,
      activeSignals,
      coverageScore: Math.round((activeSignals / 6) * 100),
    };
  }, [data]);

  const signalMap = useMemo<SignalMapItem[]>(
    () => [
      {
        label: 'Gut rhythm',
        value: summaryStats.totalBMs > 0 ? 'Active' : 'Open',
        helper: `${summaryStats.totalBMs} bowel movement records`,
        status: 'Frequency lane',
        icon: Wave,
        tone: 'major',
      },
      {
        label: 'Form quality',
        value: summaryStats.idealBristolCount > 0 ? 'Target seen' : 'Needs form',
        helper: `${summaryStats.idealBristolCount} Type 3-4 records`,
        status: 'Bristol lane',
        icon: Gauge,
        tone: 'daily',
      },
      {
        label: 'Symptom pressure',
        value:
          summaryStats.avgSymptomSeverity === null
            ? 'Open'
            : summaryStats.avgSymptomSeverity >= 6
              ? 'High'
              : summaryStats.avgSymptomSeverity >= 3
                ? 'Moderate'
                : 'Low',
        helper:
          summaryStats.avgSymptomSeverity === null
            ? 'No symptom entries yet'
            : `${summaryStats.avgSymptomSeverity.toFixed(1)} avg severity`,
        status: `${summaryStats.symptomDays} logged days`,
        icon: Frown,
        tone: 'rose',
      },
      {
        label: 'Hydration context',
        value: summaryStats.waterGoalDays > 0 ? 'Linked' : 'Sparse',
        helper: `${summaryStats.waterGoalDays} water-goal days`,
        status: 'Context overlay',
        icon: Droplet,
        tone: 'blue',
      },
      {
        label: 'Recovery context',
        value: summaryStats.sleepDays > 0 ? 'Linked' : 'Sparse',
        helper: `${summaryStats.sleepDays} sleep-log days`,
        status: 'Sleep overlay',
        icon: Moon,
        tone: 'daily',
      },
      {
        label: 'Stress response',
        value: summaryStats.stressDays > 0 ? 'Linked' : 'Sparse',
        helper: `${summaryStats.urgencyEvents} urgency events`,
        status: `${summaryStats.stressDays} stress-log days`,
        icon: Zap,
        tone: 'major',
      },
    ],
    [summaryStats]
  );

  const handleExport = () => {
    if (!data) return;

    const exportData = {
      period: `${selectedRange.days} days`,
      exportedAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-trends-${selectedRange.days}days-${
      new Date().toISOString().split('T')[0]
    }.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-enter signal-card signal-card-major rounded-[40px] p-5 sm:p-6 lg:p-8">
          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-end">
            <div className="max-w-4xl">
              <span className="signal-badge signal-badge-major mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Trend Intelligence Console
              </span>
              <h1 className="page-title">Trends & Analytics</h1>
              <p className="page-subtitle mt-3">
                Read bowel rhythm, symptoms, hydration, sleep, and stress as connected signal lanes
                instead of isolated charts.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <HeroMetric
                  label="Signal Coverage"
                  value={`${summaryStats.coverageScore}%`}
                  helper={`${summaryStats.activeSignals}/6 lanes active`}
                />
                <HeroMetric
                  label="Window"
                  value={`${selectedRange.days}d`}
                  helper={timeRangeMeta[selectedRange.days].title}
                />
                <HeroMetric
                  label="Export State"
                  value={data ? 'Ready' : 'Waiting'}
                  helper="Clinician-prep data"
                />
              </div>
            </div>

            <div className="surface-panel-soft print:hidden rounded-[32px] p-5">
              <p className="data-kicker">Current Read</p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                {timeRangeMeta[selectedRange.days].title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {timeRangeMeta[selectedRange.days].description}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExport}
                  disabled={loading || !data}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>

                <Button size="sm" onClick={handlePrint} disabled={loading || !data}>
                  <FileText className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 print:hidden xl:grid-cols-[360px_minmax(0,1fr)]">
          <PeriodSelector selectedRange={selectedRange} onSelect={setSelectedRange} />
          <SignalMapPanel items={signalMap} />
        </section>

        {loading && (
          <section className="surface-panel rounded-[32px]">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--gw-intelligence-200)]" />
              <span className="ml-3 text-sm text-[var(--color-text-tertiary)]">
                Loading analytics data...
              </span>
            </div>
          </section>
        )}

        {error && (
          <section className="surface-panel rounded-[32px]">
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
            </div>
          </section>
        )}

        {data && !loading && (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={<Wave className="h-5 w-5 text-[var(--gw-intelligence-200)]" />}
                label="Bowel Movements"
                value={String(summaryStats.totalBMs)}
                helper={`Across ${selectedRange.label.toLowerCase()}`}
              />

              <SummaryCard
                icon={<TrendingUp className="h-5 w-5 text-[var(--gw-intelligence-200)]" />}
                label="Ideal Bristol Types"
                value={String(summaryStats.idealBristolCount)}
                helper="Type 3-4 entries"
              />

              <SummaryCard
                icon={<Frown className="h-5 w-5 text-[var(--gw-rose-300)]" />}
                label="Avg Symptom Severity"
                value={
                  summaryStats.avgSymptomSeverity !== null
                    ? summaryStats.avgSymptomSeverity.toFixed(1)
                    : '-'
                }
                helper="From tracked symptom entries"
              />

              <SummaryCard
                icon={<Droplet className="h-5 w-5 text-[var(--gw-brand-200)]" />}
                label="Water-Goal Days"
                value={String(summaryStats.waterGoalDays)}
                helper="Days with water-goal credit"
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="surface-panel-soft h-fit rounded-[32px] p-5 xl:sticky xl:top-6">
                <p className="data-kicker">Analysis Route</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                  Read in lanes
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Start with gut rhythm, then layer symptoms, hydration, recovery, and stress.
                  This keeps the trend page from becoming a pile of unrelated charts.
                </p>

                <div className="mt-5 space-y-3">
                  <RouteStep number="01" label="Gut rhythm" helper="Frequency and stool form" />
                  <RouteStep number="02" label="Pressure" helper="Symptom intensity over time" />
                  <RouteStep number="03" label="Context" helper="Hydration and sleep overlays" />
                  <RouteStep number="04" label="Response" helper="Stress and urgency coupling" />
                </div>
              </aside>

              <div className="space-y-7">
                <AnalysisLane
                  kicker="Lane 01"
                  title="Gut rhythm baseline"
                  description="Establish cadence and stool-form distribution before interpreting symptom movement."
                >
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="print:break-inside-avoid">
                      <BMFrequencyChart data={data.bmFrequency} />
                    </div>

                    <div className="print:break-inside-avoid">
                      <BristolDistributionChart data={data.bristolDistribution} />
                    </div>
                  </div>
                </AnalysisLane>

                <AnalysisLane
                  kicker="Lane 02"
                  title="Symptom pressure"
                  description="Use the symptom trace to identify whether discomfort is isolated or recurring."
                >
                  <div className="print:break-inside-avoid">
                    <SymptomIntensityChart data={data.symptomTrends} />
                  </div>
                </AnalysisLane>

                <AnalysisLane
                  kicker="Lane 03"
                  title="Context overlays"
                  description="Hydration and sleep do not diagnose cause, but they can explain why a signal changed."
                >
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="print:break-inside-avoid">
                      <HydrationCorrelationChart data={data.hydrationCorrelation} />
                    </div>

                    <div className="print:break-inside-avoid">
                      <SleepSymptomChart data={data.sleepSymptomCorrelation} />
                    </div>
                  </div>
                </AnalysisLane>

                <AnalysisLane
                  kicker="Lane 04"
                  title="Stress response"
                  description="Compare stress level, bowel urgency, and high-urgency counts as one response system."
                >
                  <div className="print:break-inside-avoid">
                    <StressUrgencyChart data={data.stressUrgencyCorrelation} />
                  </div>
                </AnalysisLane>
              </div>
            </section>

            <InterpretationGuide />
          </>
        )}
      </div>
    </MainLayout>
  );
}

function PeriodSelector({
  selectedRange,
  onSelect,
}: {
  selectedRange: TimeRange;
  onSelect: (range: TimeRange) => void;
}) {
  return (
    <section className="surface-panel-soft rounded-[32px] p-5">
      <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
        <Calendar className="h-5 w-5 text-[var(--gw-intelligence-200)]" />
        <span className="data-kicker">Time Period</span>
      </div>

      <div className="mt-5 space-y-3">
        {timeRanges.map((range) => {
          const selected = selectedRange.days === range.days;

          return (
            <button
              key={range.days}
              type="button"
              onClick={() => onSelect(range)}
              className={[
                'w-full rounded-[24px] border p-4 text-left transition-smooth',
                selected
                  ? 'border-[rgba(216,199,255,0.32)] bg-[rgba(139,92,246,0.16)] shadow-[var(--gw-glow-intelligence-soft)]'
                  : 'border-white/8 bg-white/[0.025] hover:border-[rgba(216,199,255,0.2)] hover:bg-white/[0.045]',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {range.label}
                </p>
                {selected && <span className="signal-badge signal-badge-daily">Active</span>}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">
                {timeRangeMeta[range.days].description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SignalMapPanel({ items }: { items: SignalMapItem[] }) {
  return (
    <section className="surface-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="signal-badge signal-badge-daily mb-3">
            <BarChart3 className="h-3.5 w-3.5" />
            Signal Map
          </span>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
            Connected trend lanes
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Each lane tells you whether GutWise has enough recent data to support useful visual
            comparison.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <SignalMapCard key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

function SignalMapCard({ item }: { item: SignalMapItem }) {
  const Icon = item.icon;
  const toneClassName = {
    major: 'bg-[rgba(124,58,237,0.18)] text-[var(--gw-intelligence-100)]',
    daily: 'bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]',
    rose: 'bg-[rgba(240,111,155,0.14)] text-[var(--gw-rose-200)]',
    blue: 'bg-[rgba(91,184,240,0.14)] text-[var(--gw-brand-200)]',
  }[item.tone];

  return (
    <div className="rounded-[24px] border border-[rgba(202,190,255,0.12)] bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClassName}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</p>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
              {item.status}
            </span>
          </div>
          <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
            {item.value}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{item.helper}</p>
        </div>
      </div>
    </div>
  );
}

function AnalysisLane({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="data-kicker">{kicker}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-text-primary)]">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function RouteStep({
  number,
  label,
  helper,
}: {
  number: string;
  label: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-[rgba(202,190,255,0.12)] bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <span className="signal-rank">{number}</span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function InterpretationGuide() {
  return (
    <section className="surface-panel rounded-[34px] p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <span className="signal-badge signal-badge-daily mb-4">
            <Activity className="h-3.5 w-3.5" />
            Reading Standard
          </span>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
            Interpret patterns without overclaiming
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            The trends page should help prepare better questions and summaries. It should not imply
            diagnosis from a chart alone.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <GuideCard
            label="Repeat"
            helper="Prioritize signals that recur across multiple days or cycles."
          />
          <GuideCard
            label="Layer"
            helper="Compare symptoms against sleep, hydration, stress, and stool form."
          />
          <GuideCard
            label="Export"
            helper="Use printed or exported summaries for clinician conversations."
          />
        </div>
      </div>
    </section>
  );
}

function GuideCard({ label, helper }: { label: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-[rgba(202,190,255,0.12)] bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(216,199,255,0.18)] bg-white/[0.04] px-4 py-4">
      <p className="data-kicker">{label}</p>
      <p className="metric-value mt-2 text-[2rem]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <section className="signal-card signal-card-daily print:break-inside-avoid rounded-[28px] p-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="data-kicker">{label}</p>
        </div>

        <div>
          <p className="metric-value mt-1 text-[2.25rem]">{value}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">{helper}</p>
        </div>
      </div>
    </section>
  );
}
