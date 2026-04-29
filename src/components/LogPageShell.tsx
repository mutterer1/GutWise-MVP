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
          className="clinical-chip motion-control mb-3 text-[var(--gw-intelligence-200)] hover:border-[rgba(197,168,255,0.22)] hover:bg-[rgba(139,92,246,0.08)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <section className="clinical-panel page-enter px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          <div className="relative">
            <div className="mb-4 border-b border-[var(--border-subtle)] pb-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <span className="clinical-chip clinical-chip-intelligence mb-3">
                    {icon}
                    {eyebrow}
                  </span>
                  <h1 className="clinical-page-title">{title}</h1>
                  <p className="clinical-page-subtitle mt-2">{subtitle}</p>
                </div>

                <div className="clinical-card hidden max-w-xs p-3 lg:block">
                  <p className="data-kicker">Capture standard</p>
                  <p className="mt-2 text-sm leading-5 text-[var(--color-text-secondary)]">
                    Log the primary event first. Add optional context only when it improves the
                    entry.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <SuccessToast message={message} visible={toastVisible} onDismiss={onDismissToast} />
            </div>

            {error && (
              <div className="mb-5 rounded-[var(--gw-radius-card)] border border-[rgba(255,161,182,0.28)] bg-[rgba(255,161,182,0.09)] px-4 py-3 text-sm text-[var(--color-danger)]">
                {error}
              </div>
            )}

            <div className="space-y-4">{children}</div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
