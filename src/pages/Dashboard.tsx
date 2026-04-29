import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Droplet,
  Dumbbell,
  Frown,
  Gauge,
  Heart,
  Moon,
  Pill,
  Plus,
  ShieldCheck,
  TrendingUp,
  Utensils,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../contexts/AuthContext';
import { useAutoGenerateInsights } from '../hooks/useAutoGenerateInsights';
import TodaySummaryWidget from '../components/dashboard/TodaySummaryWidget';
import BMCountWidget from '../components/dashboard/BMCountWidget';
import BristolScaleWidget from '../components/dashboard/BristolScaleWidget';
import SymptomSnapshotWidget from '../components/dashboard/SymptomSnapshotWidget';
import HydrationWidget from '../components/dashboard/HydrationWidget';
import MedicationWidget from '../components/dashboard/MedicationWidget';
import PatternInsightsWidget from '../components/dashboard/PatternInsightsWidget';
import PinnedRoutinesWidget from '../components/dashboard/PinnedRoutinesWidget';
import QuickLogAgainWidget from '../components/dashboard/QuickLogAgainWidget';
import SignalRibbonBackground from '../components/dashboard/SignalRibbonBackground';
import type { DashboardMetrics } from '../types/dashboard';

interface QuickAction {
  label: string;
  shortLabel: string;
  path: string;
  icon: LucideIcon;
  tier: 'primary' | 'secondary';
  sublabelKey?: string;
}

interface SignalDomain {
  label: string;
  detail: string;
  value: string;
  path: string;
  icon: LucideIcon;
  logged: boolean;
  priority: 'core' | 'context';
}

const quickActions: QuickAction[] = [
  {
    label: 'Bowel Movement',
    shortLabel: 'BM',
    path: '/bm-log',
    icon: Waves,
    tier: 'primary',
    sublabelKey: 'todayBMCount',
  },
  {
    label: 'Symptoms',
    shortLabel: 'Symptoms',
    path: '/symptoms-log',
    icon: AlertCircle,
    tier: 'primary',
    sublabelKey: 'todaySymptoms',
  },
  {
    label: 'Food',
    shortLabel: 'Food',
    path: '/food-log',
    icon: Utensils,
    tier: 'primary',
    sublabelKey: 'todayFood',
  },
  {
    label: 'Hydration',
    shortLabel: 'Hydration',
    path: '/hydration-log',
    icon: Droplet,
    tier: 'primary',
    sublabelKey: 'todayHydration',
  },
  {
    label: 'Sleep',
    shortLabel: 'Sleep',
    path: '/sleep-log',
    icon: Moon,
    tier: 'secondary',
  },
  {
    label: 'Stress',
    shortLabel: 'Stress',
    path: '/stress-log',
    icon: Frown,
    tier: 'secondary',
  },
  {
    label: 'Exercise',
    shortLabel: 'Exercise',
    path: '/exercise-log',
    icon: Dumbbell,
    tier: 'secondary',
  },
  {
    label: 'Medication',
    shortLabel: 'Meds',
    path: '/medication-log',
    icon: Pill,
    tier: 'secondary',
  },
  {
    label: 'Cycle',
    shortLabel: 'Cycle',
    path: '/menstrual-cycle-log',
    icon: Heart,
    tier: 'secondary',
  },
];

const primaryActions = quickActions.filter((action) => action.tier === 'primary');
const secondaryActions = quickActions.filter((action) => action.tier === 'secondary');

function getPrimarySublabel(action: QuickAction, metrics: DashboardMetrics): string | null {
  switch (action.sublabelKey) {
    case 'todayBMCount':
      return metrics.todayBMCount > 0 ? `${metrics.todayBMCount} today` : 'Missing';
    case 'todaySymptoms':
      return metrics.todaySymptoms.length > 0 ? `${metrics.todaySymptoms.length} logged` : 'Missing';
    case 'todayFood': {
      const total = metrics.todayFood.meals + metrics.todayFood.snacks;
      return total > 0 ? `${total} entries` : 'Missing';
    }
    case 'todayHydration':
      return metrics.todayHydration.entries > 0 ? `${metrics.todayHydration.entries} logs` : 'Missing';
    default:
      return null;
  }
}

function getReadinessLabel(readiness: number) {
  if (readiness === 0) return 'Initializing';
  if (readiness < 50) return 'Context building';
  if (readiness < 80) return 'Analysis ready';
  if (readiness < 100) return 'High context';
  return 'Complete coverage';
}

function getReadinessMessage(readiness: number) {
  if (readiness === 0) return "Start with one entry to activate today's snapshot.";
  if (readiness < 50) return 'Add more core domains before trusting daily patterns.';
  if (readiness < 80) return 'Enough context exists for early pattern review.';
  if (readiness < 100) return 'Today has strong coverage. One missing input can sharpen it.';
  return 'Core coverage is complete. Review insights or keep logging context.';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { metrics, loading, error } = useDashboardData();
  const { profile } = useAuth();

  useAutoGenerateInsights();

  const userName = profile?.full_name || '';

  const sleepHours = metrics.lastSleep?.duration_minutes
    ? Math.round(metrics.lastSleep.duration_minutes / 60)
    : null;

  const hydrationPercentage =
    metrics.todayHydration.target_ml > 0
      ? (metrics.todayHydration.water_goal_ml / metrics.todayHydration.target_ml) * 100
      : 0;

  const hydrationDisplay = Math.round(Math.min(Math.max(hydrationPercentage, 0), 999));
  const totalFood = metrics.todayFood.meals + metrics.todayFood.snacks;

  const signalDomains: SignalDomain[] = [
    {
      label: 'Bowel',
      detail: 'Gut output',
      value: metrics.todayBMCount > 0 ? `${metrics.todayBMCount}` : '--',
      path: '/bm-log',
      icon: Waves,
      logged: metrics.todayBMCount > 0,
      priority: 'core',
    },
    {
      label: 'Food',
      detail: 'Intake context',
      value: totalFood > 0 ? `${totalFood}` : '--',
      path: '/food-log',
      icon: Utensils,
      logged: totalFood > 0,
      priority: 'core',
    },
    {
      label: 'Hydration',
      detail: 'Water goal',
      value: `${hydrationDisplay}%`,
      path: '/hydration-log',
      icon: Droplet,
      logged: metrics.todayHydration.entries > 0,
      priority: 'core',
    },
    {
      label: 'Symptoms',
      detail: 'Reported changes',
      value: metrics.todaySymptoms.length > 0 ? `${metrics.todaySymptoms.length}` : '--',
      path: '/symptoms-log',
      icon: AlertCircle,
      logged: metrics.todaySymptoms.length > 0,
      priority: 'core',
    },
    {
      label: 'Sleep',
      detail: 'Recovery layer',
      value: sleepHours !== null ? `${sleepHours}h` : '--',
      path: '/sleep-log',
      icon: Moon,
      logged: sleepHours !== null,
      priority: 'core',
    },
    {
      label: 'Stress',
      detail: 'Nervous system',
      value: metrics.todayStress.average_level !== null ? `${metrics.todayStress.average_level}/10` : '--',
      path: '/stress-log',
      icon: Frown,
      logged: metrics.todayStress.average_level !== null,
      priority: 'context',
    },
    {
      label: 'Medication',
      detail: 'Treatment context',
      value: metrics.recentMedications.length > 0 ? `${metrics.recentMedications.length}` : '--',
      path: '/medication-log',
      icon: Pill,
      logged: metrics.recentMedications.length > 0,
      priority: 'context',
    },
  ];

  const coreDomains = signalDomains.filter((domain) => domain.priority === 'core');
  const capturedCoreSignals = coreDomains.filter((domain) => domain.logged).length;
  const contextSignals = signalDomains.filter((domain) => domain.priority === 'context');
  const capturedContextSignals = contextSignals.filter((domain) => domain.logged).length;
  const readiness = Math.round((capturedCoreSignals / coreDomains.length) * 100);
  const readinessLabel = getReadinessLabel(readiness);
  const missingCoreSignal = coreDomains.find((domain) => !domain.logged);
  const nextAction = missingCoreSignal
    ? {
        title: `Add ${missingCoreSignal.label.toLowerCase()} entry`,
        body: `${missingCoreSignal.detail} is the clearest missing input for today.`,
        path: missingCoreSignal.path,
      }
    : {
        title: "Review today's patterns",
        body: 'Core coverage is complete. Move into insights or add supporting context.',
        path: '/insights',
      };

  const readinessArc = `${Math.max(8, readiness) * 3.6}deg`;

  return (
    <MainLayout>
      <div className="relative pb-10">
        <SignalRibbonBackground />

        <div className="relative z-[1] mx-auto w-full max-w-7xl space-y-6">
          {error && (
            <div className="rounded-2xl border border-[rgba(255,161,182,0.28)] bg-[rgba(255,161,182,0.09)] px-4 py-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          )}

          <section className="page-enter clinical-panel p-5 sm:p-6 lg:p-7">
            <div className="relative grid gap-5 xl:grid-cols-[1.38fr_0.82fr]">
              <div className="flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="clinical-chip clinical-chip-intelligence">
                      <Activity className="h-3.5 w-3.5" />
                      Today dashboard
                    </span>
                    <span className="clinical-chip">
                      {capturedCoreSignals}/{coreDomains.length} core inputs
                    </span>
                  </div>

                  <div className="max-w-4xl">
                    <h1
                      className="page-title text-[clamp(2.45rem,5.2vw,4.85rem)]"
                      aria-label="Your health intelligence hub."
                    >
                      <span aria-hidden="true" className="block">
                        Your health
                      </span>
                      <span
                        aria-hidden="true"
                        className="inline-flex items-baseline whitespace-nowrap"
                      >
                        <span>intelli</span>
                        <img
                          src="/logos/gutwise-icon-dark.svg"
                          alt=""
                          className="ml-[0.014em] mr-[0.014em] inline-block h-[0.60em] w-[0.60em] -translate-y-[0.005em] object-contain"
                        />
                        <span>ence</span>
                      </span>
                      <span aria-hidden="true" className="block">
                        hub.
                      </span>
                    </h1>
                    <p className="page-subtitle mt-4 max-w-3xl">
                      GutWise brings today&apos;s bowel, food, hydration, symptom, sleep, stress,
                      and medication entries into one clinical tracking view.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                  <div className="clinical-card clinical-priority-card p-5 sm:p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="data-kicker">Next best action</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
                          {nextAction.title}
                        </h2>
                      </div>
                      <div className="insight-orb animate-major-signal">
                        <ArrowRight className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                      {nextAction.body}
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button onClick={() => navigate(nextAction.path)} size="sm">
                        Act on it
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => navigate('/daily-check-in')}>
                        Daily Check-In
                      </Button>
                    </div>
                  </div>

                  <div className="clinical-card p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-300)]">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="data-kicker">Coverage posture</p>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {readinessLabel}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                      {getReadinessMessage(readiness)}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <p className="metric-label">Context inputs</p>
                        <p className="metric-value mt-2 text-[2.35rem]">
                          {capturedContextSignals}/{contextSignals.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <p className="metric-label">Water goal</p>
                        <p className="metric-value mt-2 text-[2.35rem]">{hydrationDisplay}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="clinical-card flex flex-col justify-between gap-6 p-5 sm:p-6">
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="data-kicker">Today&apos;s readiness</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
                        {readinessLabel}
                      </h2>
                    </div>
                    <Gauge className="h-5 w-5 text-[var(--gw-intelligence-300)]" />
                  </div>

                  <div className="mx-auto grid h-56 w-56 place-items-center rounded-full p-3 daily-signal-glow">
                    <div
                      className="grid h-full w-full place-items-center rounded-full p-[1px]"
                      style={{
                        background: `conic-gradient(from 220deg, #c084fc 0deg, #7c3aed ${readinessArc}, rgba(202,190,255,0.1) ${readinessArc} 360deg)`,
                      }}
                    >
                      <div className="grid h-full w-full place-items-center rounded-full bg-[rgba(7,10,24,0.88)]">
                        <div className="text-center">
                          <p className="font-mono text-[3.5rem] font-bold leading-none tracking-[-0.08em] text-[var(--color-text-primary)]">
                            {readiness}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gw-intelligence-300)]">
                            percent
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {signalDomains.map((domain) => {
                      const Icon = domain.icon;
                      return (
                        <button
                          key={domain.label}
                          type="button"
                          onClick={() => navigate(domain.path)}
                          className={[
                            'group flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition-smooth',
                            domain.logged
                              ? 'border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.075)]'
                              : 'border-white/10 bg-white/[0.025] hover:border-[rgba(197,168,255,0.22)] hover:bg-white/[0.045]',
                          ].join(' ')}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span
                              className={[
                                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl transition-smooth',
                                domain.logged
                                  ? 'bg-[rgba(139,92,246,0.22)] text-[var(--gw-intelligence-200)]'
                                  : 'bg-white/[0.05] text-[var(--color-text-tertiary)] group-hover:text-[var(--gw-intelligence-300)]',
                              ].join(' ')}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-[var(--color-text-primary)]">
                                {domain.label}
                              </span>
                              <span className="block text-xs text-[var(--color-text-tertiary)]">
                                {domain.detail}
                              </span>
                            </span>
                          </span>
                          <span className="font-mono text-sm font-semibold text-[var(--gw-intelligence-200)]">
                            {domain.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <TodaySummaryWidget
            bmCount={metrics.todayBMCount}
            mealsCount={metrics.todayFood.meals}
            snacksCount={metrics.todayFood.snacks}
            hydrationMl={metrics.todayHydration.water_goal_ml}
            sleepHours={sleepHours}
            symptomsCount={metrics.todaySymptoms.length}
            loading={loading}
            userName={userName}
          />

          <section className="card-enter grid gap-4 xl:grid-cols-[0.95fr_1.45fr]">
            <div className="clinical-card p-5 sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.16)] text-[var(--gw-intelligence-300)]">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="data-kicker">Recommended flow</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
                    One-pass daily check-in
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Use this when you want pattern quality across symptoms, meals, hydration, sleep,
                    stress, medication, exercise, and cycle context.
                  </p>
                </div>
              </div>

              <Button onClick={() => navigate('/daily-check-in')} className="w-full sm:w-auto">
                Open Daily Check-In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="clinical-card p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <span className="clinical-chip mb-3">
                    <Plus className="h-3.5 w-3.5" />
                    Quick log
                  </span>
                  <h2 className="text-2xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
                    Log one entry without breaking flow.
                  </h2>
                </div>
                <Activity className="hidden h-5 w-5 text-[var(--gw-intelligence-300)] sm:block" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {primaryActions.map((action) => {
                  const Icon = action.icon;
                  const sublabel = getPrimarySublabel(action, metrics);
                  const isMissing = sublabel === 'Missing';

                  return (
                    <button
                      key={action.path}
                      type="button"
                      onClick={() => navigate(action.path)}
                      className={[
                        'group rounded-[24px] border p-4 text-left transition-smooth',
                        isMissing
                          ? 'border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.09)] hover:border-[rgba(197,168,255,0.36)]'
                          : 'border-[rgba(91,184,240,0.18)] bg-[rgba(91,184,240,0.06)] hover:border-[rgba(91,184,240,0.3)]',
                      ].join(' ')}
                    >
                      <div className="flex min-h-[158px] flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.055] text-[var(--gw-intelligence-300)] transition-smooth group-hover:scale-[1.04]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={[
                              'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]',
                              isMissing
                                ? 'bg-[rgba(139,92,246,0.18)] text-[var(--gw-intelligence-200)]'
                                : 'bg-[rgba(91,184,240,0.14)] text-[var(--gw-brand-200)]',
                            ].join(' ')}
                          >
                            {!loading && sublabel ? sublabel : 'Ready'}
                          </span>
                        </div>

                        <div>
                          <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                            {action.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
                            {isMissing ? 'Capture missing input' : 'Add another entry'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {secondaryActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.path}
                      type="button"
                      onClick={() => navigate(action.path)}
                      className="group rounded-2xl border border-white/10 bg-white/[0.026] px-3 py-4 text-center transition-smooth hover:border-[rgba(197,168,255,0.22)] hover:bg-white/[0.045]"
                    >
                      <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.05] text-[var(--color-text-tertiary)] transition-smooth group-hover:text-[var(--gw-intelligence-300)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {action.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <PinnedRoutinesWidget />

          <QuickLogAgainWidget />

          <section className="space-y-4">
            <div className="page-header pb-1">
              <div>
                <span className="clinical-chip mb-3">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Measured detail
                </span>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                  Today&apos;s data layer
                </h2>
                <p className="page-subtitle mt-2">
                  The dashboard summarizes the day. These modules preserve the measured detail
                  behind bowel, hydration, symptom, and medication context.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BMCountWidget count={metrics.todayBMCount} loading={loading} />

              <BristolScaleWidget
                averageScale={metrics.averageBristolScale}
                count={metrics.todayBMCount}
                loading={loading}
              />

              <SymptomSnapshotWidget symptoms={metrics.todaySymptoms} loading={loading} />

              <HydrationWidget
                totalFluidsMl={metrics.todayHydration.total_fluids_ml}
                effectiveHydrationMl={metrics.todayHydration.effective_hydration_ml}
                waterGoalMl={metrics.todayHydration.water_goal_ml}
                targetMl={metrics.todayHydration.target_ml}
                entries={metrics.todayHydration.entries}
                caffeinatedEntries={metrics.todayHydration.caffeinated_entries}
                alcoholEntries={metrics.todayHydration.alcohol_entries}
                loading={loading}
              />

              <div className="md:col-span-2">
                <MedicationWidget medications={metrics.recentMedications} loading={loading} />
              </div>
            </div>
          </section>

          <section className="card-enter">
            <PatternInsightsWidget
              bmCount={metrics.todayBMCount}
              symptomsCount={metrics.todaySymptoms.length}
              stressLevel={metrics.todayStress.average_level}
              hydrationPercentage={hydrationPercentage}
              loading={loading}
            />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
