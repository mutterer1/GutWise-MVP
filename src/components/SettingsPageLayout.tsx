import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';
import MainLayout from './MainLayout';

interface SettingsPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function SettingsPageLayout({
  title,
  description,
  children,
}: SettingsPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(202,190,255,0.16)] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] transition-smooth hover:border-[rgba(202,190,255,0.28)] hover:bg-white/[0.05] hover:text-[var(--color-text-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </button>

        <section className="signal-card signal-card-major page-enter rounded-[36px] px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div className="max-w-3xl">
              <span className="signal-badge signal-badge-major mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Settings Control Plane
              </span>
              <h1 className="page-title">{title}</h1>
              <p className="page-subtitle mt-2">{description}</p>
            </div>

            <div className="surface-panel-soft hidden rounded-[28px] px-4 py-4 lg:block">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.18)] text-[var(--gw-intelligence-200)]">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Private by design
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                Settings changes stay anchored to your account, data controls, and review gates.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-5 space-y-5">{children}</div>
      </div>
    </MainLayout>
  );
}
