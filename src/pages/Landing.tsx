import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import GutIntelligenceModal from '../components/GutIntelligenceModal';
import {
  Activity,
  ArrowRight,
  Brain,
  ClipboardCheck,
  Database,
  FileText,
  Lock,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Waves,
} from 'lucide-react';

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
    title: 'Record the day without losing context',
    text: 'Fast structured entries keep enough detail for later review without turning every check-in into a chore.',
  },
  {
    icon: Brain,
    title: 'Review patterns with evidence limits',
    text: 'GutWise compares timing, repeatability, severity, and context before surfacing a possible relationship.',
  },
  {
    icon: FileText,
    title: 'Share cleaner visit context',
    text: 'Reports lead with observed data, review flags, and patient notes instead of vague symptom recall.',
  },
];

const trustSignals = [
  { icon: ShieldCheck, text: 'Non-diagnostic outputs' },
  { icon: Lock, text: 'Private account workspace' },
  { icon: Stethoscope, text: 'Clinician-ready reports' },
];

export default function Landing() {
  const [intelligenceModalOpen, setIntelligenceModalOpen] = useState(false);

  return (
    <div className="page-shell min-h-screen text-[var(--color-text-primary)]">
      <Header />

      <main id="main-content" tabIndex={-1} className="pt-16 sm:pt-[72px]">
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 purple-grid opacity-25" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,24,0.18),rgba(7,10,24,0.74)_70%,rgba(7,10,24,0.96))]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(197,168,255,0.22)] to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <div className="relative mb-6 inline-block">
                <button
                  type="button"
                  onClick={() => setIntelligenceModalOpen(true)}
                  aria-haspopup="dialog"
                  aria-label="Learn how GutWise pattern review works"
                  className="clinical-chip clinical-chip-intelligence motion-control group cursor-pointer select-none px-3.5 py-1.5"
                >
                  <Brain className="motion-control-icon h-4 w-4" aria-hidden="true" />
                  Evidence-bounded pattern review
                </button>
              </div>

              <h1 className="text-[clamp(3.1rem,11vw,6.4rem)] font-semibold leading-[0.96] tracking-[var(--gw-letter-spacing-tight)] text-[var(--color-text-primary)]">
                GutWise
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg sm:leading-8">
                A private, non-diagnostic workspace that turns bowel, symptom, food, hydration,
                sleep, stress, medication, cycle, and medical-context logs into careful personal
                pattern summaries and clinician-ready reports.
              </p>

              <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create account
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Log in
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {trustSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <span
                      key={signal.text}
                      className="clinical-chip motion-card min-h-8 px-2.5 text-[11px] sm:min-h-9 sm:px-3 sm:text-xs"
                    >
                      <Icon className="h-4 w-4 text-[var(--gw-brand-300)]" aria-hidden="true" />
                      {signal.text}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:mt-10 md:grid-cols-3">
              {signalLanes.map((lane) => {
                const Icon = lane.icon;
                return (
                  <div
                    key={lane.label}
                    className="clinical-card motion-card p-4 sm:p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="motion-card-icon flex h-11 w-11 items-center justify-center rounded-[var(--gw-radius-lg)] bg-[rgba(139,92,246,0.1)] text-[var(--gw-intelligence-200)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="data-kicker">{lane.label}</span>
                    </div>
                    <p className="text-xl font-semibold tracking-[var(--gw-letter-spacing-snug)] text-[var(--color-text-primary)]">
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
                From logs to visit-ready context
              </span>
              <h2 className="text-3xl font-semibold tracking-[var(--gw-letter-spacing-tight)] text-[var(--color-text-primary)] sm:text-4xl">
                Structured logs, cautious interpretation
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
                GutWise treats daily entries as connected evidence. The experience keeps logging
                fast, while the review layer stays careful about confidence, missing context, and
                report language.
              </p>
            </div>

            <div className="grid gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="clinical-card motion-card p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="motion-card-icon flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[var(--gw-radius-lg)] bg-[rgba(139,92,246,0.1)] text-[var(--gw-intelligence-200)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="data-kicker">Step {index + 1}</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-[var(--gw-letter-spacing-snug)] text-[var(--color-text-primary)] sm:text-2xl">
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
              <h2 className="text-3xl font-semibold tracking-[var(--gw-letter-spacing-tight)] text-[var(--color-text-primary)]">
                Start with your own data. Leave diagnosis to care teams.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Reports emphasize observations, trends, review flags, and patient notes so health
                conversations start with clearer evidence.
              </p>
            </div>

            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Create private workspace
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
      />
    </div>
  );
}
