import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, FileText, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthShellProps {
  badge: string;
  title: string;
  subtitle: string;
  mode: 'login' | 'signup';
  children: ReactNode;
  footer: ReactNode;
}

const previewMetrics = [
  { label: 'Signal lanes', value: '12', helper: 'Food, gut, lifestyle, context' },
  { label: 'Report mode', value: 'Ready', helper: 'Observed data first' },
  { label: 'Safety', value: 'Careful', helper: 'Non-diagnostic language' },
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
      <div className="pointer-events-none absolute inset-0 purple-grid opacity-45" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,24,0.24),rgba(7,10,24,0.92)_64%,rgba(7,10,24,1))]"
        aria-hidden="true"
      />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link to="/" className="motion-nav-link mb-5 inline-flex w-fit items-center rounded-2xl sm:mb-6" aria-label="GutWise home">
          <img
            src="/logos/gutwise-horizontal-dark.svg"
            alt="GutWise"
            className="h-[62px] w-auto sm:h-[72px]"
          />
        </Link>

        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(390px,0.7fr)] lg:gap-8">
          <aside className="motion-reveal hidden lg:block">
            <div className="signal-card signal-card-major motion-card rounded-[38px] p-7">
              <span className="signal-badge signal-badge-major mb-6">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Royal Signal
              </span>
              <h2 className="max-w-xl text-5xl font-semibold tracking-[-0.055em] text-[var(--color-text-primary)]">
                Health intelligence without diagnostic overreach
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-text-secondary)]">
                GutWise turns scattered logs into evidence-bounded patterns, then keeps those
                patterns readable for you and useful for a clinician.
              </p>

              <div className="motion-stagger mt-7 grid gap-3">
                {previewMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="motion-card rounded-[24px] border border-[rgba(202,190,255,0.14)] bg-white/[0.035] p-4"
                  >
                    <p className="data-kicker">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {metric.helper}
                    </p>
                  </div>
                ))}
              </div>

              <div className="motion-card mt-6 rounded-[28px] border border-[rgba(91,184,240,0.18)] bg-[rgba(91,184,240,0.06)] p-5">
                <div className="motion-card-icon mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(91,184,240,0.13)] text-[var(--gw-brand-200)]">
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

          <section className="motion-reveal stagger-1 mx-auto w-full max-w-md">
            <div className="surface-panel rounded-[30px] p-5 sm:rounded-[34px] sm:p-6">
              <span className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[rgba(197,168,255,0.24)] bg-[rgba(139,92,246,0.14)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.09em] text-[var(--gw-intelligence-100)] sm:text-xs sm:tracking-[0.12em]">
                <Brain className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="truncate">{badge}</span>
              </span>
              <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[var(--color-text-primary)] sm:text-4xl">
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
              <div className="motion-card mt-4 rounded-[28px] border border-[rgba(202,190,255,0.14)] bg-white/[0.035] p-4">
                <p className="data-kicker">First session flow</p>
                <div className="motion-stagger mt-4 space-y-3">
                  {onboardingSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="flex gap-3">
                        <div className="motion-card-icon mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.15)] text-[var(--gw-intelligence-200)]">
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
