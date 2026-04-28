import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainLayout from './MainLayout';
import SuccessToast from './SuccessToast';

interface LogPageShellProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  icon?: ReactNode;
  maxWidth?: '3xl' | '5xl' | '6xl' | '7xl';
  message: string;
  toastVisible: boolean;
  onDismissToast: () => void;
  error: string;
  children: ReactNode;
}

export default function LogPageShell({
  title,
  subtitle,
  eyebrow = 'Structured Entry',
  icon,
  maxWidth = '3xl',
  message,
  toastVisible,
  onDismissToast,
  error,
  children,
}: LogPageShellProps) {
  const navigate = useNavigate();
  const maxWidthClass = {
    '3xl': 'max-w-3xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  }[maxWidth];

  return (
    <MainLayout>
      <div className={`mx-auto w-full ${maxWidthClass}`}>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(197,168,255,0.16)] bg-[rgba(139,92,246,0.07)] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gw-intelligence-300)] transition-smooth hover:border-[rgba(197,168,255,0.3)] hover:bg-[rgba(139,92,246,0.12)] hover:text-[var(--gw-intelligence-200)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <section className="intelligence-console page-enter px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute right-[-9rem] top-[-10rem] h-72 w-72 rounded-full bg-[rgba(139,92,246,0.16)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-12rem] left-[-10rem] h-80 w-80 rounded-full bg-[rgba(91,184,240,0.08)] blur-3xl" />

          <div className="relative">
            <div className="page-header mb-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <span className="signal-badge signal-badge-daily mb-4">
                    {icon}
                    {eyebrow}
                  </span>
                  <h1 className="page-title">{title}</h1>
                  <p className="page-subtitle mt-3 max-w-2xl">{subtitle}</p>
                </div>

                <div className="hidden max-w-xs rounded-[26px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 lg:block">
                  <p className="data-kicker">Capture standard</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Log the primary event first. Add optional context only when it improves the
                    signal.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <SuccessToast message={message} visible={toastVisible} onDismiss={onDismissToast} />
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[rgba(255,161,182,0.28)] bg-[rgba(255,161,182,0.09)] px-4 py-3 text-sm text-[var(--color-danger)]">
                {error}
              </div>
            )}

            <div className="space-y-5">{children}</div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
