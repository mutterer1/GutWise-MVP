import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import GutIntelligenceModal from '../components/GutIntelligenceModal';
import BadgeOnboardingHint from '../components/BadgeOnboardingHint';
import {
  Activity,
  ArrowRight,
  Brain,
  ClipboardCheck,
  Database,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Waves,
} from 'lucide-react';

const HINT_DISMISSED_KEY = 'gutwise_badge_hint_dismissed';

const signalLanes = [
  {
    icon: Waves,
    label: 'Gut rhythm',
    value: 'Bowel + symptoms',
    helper: 'Bristol, urgency, pain, mucus, blood, notes',
  },
  {
    icon: Activity,
    label: 'Lifestyle layer',
    value: 'Food + recovery',
    helper: 'Meals, hydration, sleep, stress, movement',
  },
  {
    icon: Database,
    label: 'Context layer',
    value: 'Meds + history',
    helper: 'Medication, cycle, allergies, diagnoses, documents',
  },
];

const workflowSteps = [
  {
    icon: ClipboardCheck,
    title: 'Log the day without losing nuance',
    text: 'Fast structured entries keep enough detail for later analysis without turning every check-in into a chore.',
  },
  {
    icon: Brain,
    title: 'Rank patterns across connected signals',
    text: 'GutWise compares timing, repeatability, severity, and context before surfacing a possible relationship.',
  },
  {
    icon: FileText,
    title: 'Bring cleaner evidence to care conversations',
    text: 'Reports lead with observed data, review flags, and patient notes instead of vague symptom recall.',
  },
];

const trustSignals = [
  { icon: ShieldCheck, text: 'Non-diagnostic by design' },
  { icon: Lock, text: 'Private health workspace' },
  { icon: Stethoscope, text: 'Clinician-friendly reporting' },
];

export default function Landing() {
  const [intelligenceModalOpen, setIntelligenceModalOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(
    () => !localStorage.getItem(HINT_DISMISSED_KEY)
  );

  const handleDismissHint = () => {
    localStorage.setItem(HINT_DISMISSED_KEY, 'true');
    setHintVisible(false);
  };

  return (
    <div className="page-shell min-h-screen text-[var(--color-text-primary)]">
      <Header />

      <main id="main-content" tabIndex={-1} className="pt-16 sm:pt-20">
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 purple-grid opacity-40" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,24,0.08),rgba(7,10,24,0.72)_68%,rgba(7,10,24,0.95))]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(197,168,255,0.52)] to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <div className="motion-reveal relative mb-6 inline-block">
                <button
                  type="button"
                  onClick={() => setIntelligenceModalOpen(true)}
                  aria-haspopup="dialog"
                  aria-label="Learn how GutWise intelligence works"
                  className="motion-control group inline-flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-full border border-[rgba(197,168,255,0.24)] bg-[rgba(139,92,246,0.14)] px-4 py-2 text-sm font-semibold text-[var(--gw-intelligence-100)] transition-smooth hover:border-[rgba(197,168,255,0.42)] hover:bg-[rgba(139,92,246,0.2)]"
                >
                  <Sparkles className="motion-control-icon h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
                  AI-powered gut intelligence
                </button>
                <BadgeOnboardingHint visible={hintVisible} />
              </div>

              <h1 className="motion-reveal stagger-1 text-[clamp(3.2rem,14vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-[var(--color-text-primary)]">
                GutWise
              </h1>
              <p className="motion-reveal stagger-2 mt-5 max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl sm:leading-9">
                Non-diagnostic health intelligence that cross-references bowel movements, food,
                hydration, symptoms, stress, sleep, exercise, medication, cycle context, medical
                history, and documents into personalized patterns and clinician-friendly reports.
              </p>

              <div className="motion-reveal stagger-3 mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start free
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Sign in
                  </Button>
                </Link>
              </div>

              <div className="motion-stagger mt-6 flex flex-wrap justify-center gap-2">
                {trustSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <span
                      key={signal.text}
                      className="motion-card inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[rgba(202,190,255,0.12)] bg-white/[0.035] px-2.5 text-[11px] font-semibold text-[var(--color-text-secondary)] sm:min-h-9 sm:gap-2 sm:px-3 sm:text-xs"
                    >
                      <Icon className="h-4 w-4 text-[var(--gw-brand-300)]" aria-hidden="true" />
                      {signal.text}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="motion-stagger mt-8 grid gap-3 sm:mt-10 md:grid-cols-3">
              {signalLanes.map((lane) => {
                const Icon = lane.icon;
                return (
                  <div
                    key={lane.label}
                    className="surface-panel-soft motion-card rounded-[24px] p-4 sm:rounded-[28px] sm:p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="motion-card-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.16)] text-[var(--gw-intelligence-200)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="data-kicker">{lane.label}</span>
                    </div>
                    <p className="text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                      {lane.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {lane.helper}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
            <div>
              <span className="signal-badge signal-badge-major mb-5">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                From logs to useful context
              </span>
              <h2 className="text-4xl font-semibold tracking-[-0.055em] text-[var(--color-text-primary)] sm:text-5xl">
                Built for pattern quality, not generic tracking
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
                GutWise treats daily entries as connected evidence. The experience keeps logging
                fast, but the analysis layer stays careful about confidence, missing context, and
                report language.
              </p>
            </div>

            <div className="motion-stagger grid gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="surface-card motion-card rounded-[28px] p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="motion-card-icon flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.16)] text-[var(--gw-intelligence-200)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="data-kicker">Step {index + 1}</p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[rgba(202,190,255,0.12)] bg-white/[0.025]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
            <div>
              <span className="signal-badge signal-badge-daily mb-4">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Clinically careful output
              </span>
              <h2 className="text-3xl font-semibold tracking-[-0.045em] text-[var(--color-text-primary)]">
                Start with your own data. Leave diagnosis to care teams.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Reports emphasize observations, trends, review flags, and patient notes so health
                conversations start with clearer evidence.
              </p>
            </div>

            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Create workspace
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>

        <footer className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 border-t border-[rgba(202,190,255,0.12)] pt-6 text-sm text-[var(--color-text-tertiary)] sm:flex-row sm:items-center sm:justify-between">
            <p>GutWise health intelligence for personal insight and clinician-friendly reporting.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="motion-nav-link inline-flex hover:text-[var(--color-text-secondary)]">
                Privacy
              </Link>
              <Link to="/disclaimer" className="motion-nav-link inline-flex hover:text-[var(--color-text-secondary)]">
                Medical Disclaimer
              </Link>
            </div>
          </div>
        </footer>
      </main>

      <GutIntelligenceModal
        isOpen={intelligenceModalOpen}
        onClose={() => setIntelligenceModalOpen(false)}
        showHintDismiss={hintVisible}
        onDismissHint={handleDismissHint}
      />
    </div>
  );
}
