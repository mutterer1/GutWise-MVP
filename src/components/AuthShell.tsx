import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, FileText, ShieldCheck } from 'lucide-react';

interface AuthShellProps {
  badge: string;
  title: string;
  subtitle: string;
  mode: 'login' | 'signup';
  children: ReactNode;
  footer: ReactNode;
}

const previewMetrics = [
  { label: 'Signal types', value: '12', helper: 'Food, gut, lifestyle, context' },
  { label: 'Reports', value: 'Observed', helper: 'Patient notes and review flags' },
  { label: 'Language', value: 'Careful', helper: 'Non-diagnostic by design' },
];

const onboardingSteps = [
  {
    icon: Activity,
    title: 'Capture a daily signal',
    text: 'Start with bowel movement, food, hydration, symptoms, or a guided check-in.',
  },
  {
    icon: Brain,
    title: 'Build personal context',
    text: 'GutWise cross-references sleep, stress, medication, cycle, history, and documents.',
  },
  {
    icon: FileText,
    title: 'Prepare a cleaner visit',
    text: 'Export clinician-friendly observations without turning patterns into diagnoses.',
  },
];

export default function AuthShell({
  badge,
  title,
  subtitle,
  mode,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="page-shell min-h-screen overflow-hidden text-[var(--color-text-primary)]">
      <div className="pointer-events-none absolute inset-0 purple-grid opacity-20" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,24,0.42),rgba(7,10,24,0.9)_68%,rgba(7,10,24,1))]"
        aria-hidden="true"
      />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link to="/" className="motion-nav-link mb-5 inline-flex w-fit items-center rounded-2xl sm:mb-6" aria-label="GutWise home">
          <img
            src="/logos/gutwise-horizontal-dark.svg"
            alt="GutWise"
            className="h-[48px] w-auto sm:h-[56px]"
          />
        </Link>

        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(390px,0.7fr)] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="clinical-panel motion-card p-7">
              <span className="clinical-chip clinical-chip-intelligence mb-6">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Secure health workspace
              </span>
              <h2 className="max-w-xl text-4xl font-semibold tracking-[var(--gw-letter-spacing-tight)] text-[var(--color-text-primary)]">
                Private health records with evidence-bounded pattern review
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-text-secondary)]">
                GutWise turns scattered logs into careful observations, then keeps those patterns
                readable for you and useful for a clinician.
              </p>

              <div className="mt-7 grid gap-3">
                {previewMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="clinical-card motion-card p-4"
                  >
                    <p className="data-kicker">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[var(--gw-letter-spacing-snug)] text-[var(--color-text-primary)]">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {metric.helper}
                    </p>
                  </div>
                ))}
              </div>

              <div className="clinical-card motion-card mt-6 border-[rgba(91,184,240,0.14)] bg-[rgba(91,184,240,0.045)] p-5">
                <div className="motion-card-icon mb-3 flex h-11 w-11 items-center justify-center rounded-[var(--gw-radius-lg)] bg-[rgba(91,184,240,0.1)] text-[var(--gw-brand-200)]">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Clinically careful by default
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  The product frames patterns as observations and keeps medical decisions with the
                  patient and clinician.
                </p>
              </div>
            </div>
          </aside>

          <section className="mx-auto w-full max-w-md">
            <div className="clinical-panel p-5 sm:p-6">
              <span className="clinical-chip clinical-chip-intelligence mb-5 max-w-full">
                <Brain className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="truncate">{badge}</span>
              </span>
              <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-[var(--gw-letter-spacing-tight)] text-[var(--color-text-primary)] sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {subtitle}
                </p>
              </div>

              {children}

              <div className="mt-6 border-t border-[rgba(202,190,255,0.12)] pt-5">
                {footer}
              </div>
            </div>

            {mode === 'signup' && (
              <div className="clinical-card motion-card mt-4 p-4">
                <p className="data-kicker">First session flow</p>
                <div className="mt-4 space-y-3">
                  {onboardingSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="flex gap-3">
                        <div className="motion-card-icon mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--gw-radius-md)] bg-[rgba(139,92,246,0.1)] text-[var(--gw-intelligence-200)]">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
