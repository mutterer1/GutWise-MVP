import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Brain,
  CreditCard,
  FileUp,
  Globe,
  HeartPulse,
  HelpCircle,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';

interface SettingsSection {
  title: string;
  icon: LucideIcon;
  description: string;
  path: string;
  tag: string;
}

interface SettingsGroup {
  eyebrow: string;
  title: string;
  description: string;
  tone: 'brand' | 'trust' | 'intelligence';
  sections: SettingsSection[];
}

const settingsGroups: SettingsGroup[] = [
  {
    eyebrow: 'Daily Operation',
    title: 'Account basics',
    description: 'Identity, preferences, and communication behavior for the signed-in workspace.',
    tone: 'brand',
    sections: [
      {
        title: 'Profile',
        icon: User,
        description: 'Manage personal information and baseline profile details.',
        path: '/settings/profile',
        tag: 'Identity',
      },
      {
        title: 'Notifications',
        icon: Bell,
        description: 'Control how and when GutWise sends updates.',
        path: '/settings/notifications',
        tag: 'Signals',
      },
      {
        title: 'Preferences',
        icon: Globe,
        description: 'Customize app behavior, units, density, and motion preferences.',
        path: '/settings/preferences',
        tag: 'Experience',
      },
    ],
  },
  {
    eyebrow: 'Protected Systems',
    title: 'Trust and data controls',
    description: 'Privacy, billing, and account-level data actions that deserve separation.',
    tone: 'trust',
    sections: [
      {
        title: 'Privacy & Security',
        icon: Lock,
        description: 'Manage login, privacy posture, consent, and access controls.',
        path: '/settings/privacy-security',
        tag: 'Security',
      },
      {
        title: 'Billing',
        icon: CreditCard,
        description: 'View subscription status and payment controls.',
        path: '/settings/billing',
        tag: 'Account',
      },
      {
        title: 'Data Management',
        icon: Shield,
        description: 'Export, back up, or remove health records intentionally.',
        path: '/settings/data-management',
        tag: 'Records',
      },
    ],
  },
  {
    eyebrow: 'Source Of Truth',
    title: 'Knowledge operations',
    description: 'Review gates that decide what GutWise can use as trusted context.',
    tone: 'intelligence',
    sections: [
      {
        title: 'Medical Context',
        icon: HeartPulse,
        description: 'Confirm medical history, allergies, diagnoses, and intolerances.',
        path: '/settings/medical-context',
        tag: 'Context',
      },
      {
        title: 'Document Intake & Review',
        icon: FileUp,
        description: 'Upload medical documents and review extracted candidate facts.',
        path: '/settings/document-intake',
        tag: 'Evidence',
      },
      {
        title: 'Reference Review Queue',
        icon: ShieldCheck,
        description: 'Promote custom foods and medications into the live reference library.',
        path: '/settings/reference-review',
        tag: 'Library',
      },
    ],
  },
];

const operationCards = [
  {
    title: 'Reference library queue',
    description: 'Foods and medications from real logs are reviewed before becoming autocomplete and normalization truth.',
    path: '/settings/reference-review',
    icon: ShieldCheck,
    label: 'Promotion Gate',
  },
  {
    title: 'Medical context layer',
    description: 'Confirmed health facts become the context layer used by reports and ranked insight reasoning.',
    path: '/settings/medical-context',
    icon: HeartPulse,
    label: 'Clinical Context',
  },
  {
    title: 'Document intake review',
    description: 'Uploaded records are converted into reviewable facts instead of silently entering analysis.',
    path: '/settings/document-intake',
    icon: FileUp,
    label: 'Evidence Intake',
  },
];

const toneStyles = {
  brand: {
    icon: 'bg-[rgba(91,184,240,0.13)] text-[var(--gw-brand-200)]',
    rail: 'from-[rgba(91,184,240,0.28)] via-[rgba(139,92,246,0.14)] to-transparent',
  },
  trust: {
    icon: 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)]',
    rail: 'from-[rgba(202,190,255,0.2)] via-[rgba(255,255,255,0.05)] to-transparent',
  },
  intelligence: {
    icon: 'bg-[rgba(139,92,246,0.18)] text-[var(--gw-intelligence-200)]',
    rail: 'from-[rgba(192,132,252,0.34)] via-[rgba(139,92,246,0.18)] to-transparent',
  },
};

export default function Settings() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-enter signal-card signal-card-major rounded-[38px] p-5 sm:p-6 lg:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <span className="signal-badge signal-badge-major mb-5">
                <Brain className="h-3.5 w-3.5" />
                GutWise Control Center
              </span>
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle mt-3">
                Manage the account controls, privacy gates, and source-of-truth systems that shape
                GutWise analysis across logs, reports, and clinician-ready exports.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <ControlMetric label="Context" value="Medical" helper="Confirmed health facts" />
                <ControlMetric label="References" value="Food + Meds" helper="Review before promotion" />
                <ControlMetric label="Privacy" value="Account" helper="Protected controls" />
              </div>
            </div>

            <div className="surface-panel-soft rounded-[30px] p-5">
              <div className="insight-orb mb-5">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <p className="text-base font-semibold text-[var(--color-text-primary)]">
                Source-of-truth discipline
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                High-impact intelligence inputs stay reviewable here before they influence
                autocomplete, normalization, report language, or ranked insights.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {operationCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.title}
                type="button"
                onClick={() => navigate(card.path)}
                className="group signal-card signal-card-daily rounded-[32px] p-5 text-left transition-smooth hover:-translate-y-1 hover:border-[rgba(216,199,255,0.42)] sm:p-6"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.18)] text-[var(--gw-intelligence-100)] shadow-[var(--gw-glow-intelligence-soft)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="signal-badge signal-badge-daily">{card.label}</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {card.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gw-intelligence-200)]">
                  Open workspace
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          {settingsGroups.map((group) => {
            const styles = toneStyles[group.tone];

            return (
              <div key={group.title} className="surface-panel rounded-[34px] p-5 sm:p-6">
                <div className={`mb-5 h-1.5 rounded-full bg-gradient-to-r ${styles.rail}`} />
                <span className="data-kicker">{group.eyebrow}</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                  {group.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {group.description}
                </p>

                <div className="mt-6 space-y-3">
                  {group.sections.map((section) => {
                    const Icon = section.icon;

                    return (
                      <button
                        key={section.title}
                        type="button"
                        onClick={() => navigate(section.path)}
                        className="group w-full rounded-[24px] border border-white/8 bg-white/[0.025] p-4 text-left transition-smooth hover:-translate-y-0.5 hover:border-[rgba(202,190,255,0.22)] hover:bg-white/[0.045]"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-base font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                                {section.title}
                              </h3>
                              <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                                {section.tag}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                              {section.description}
                            </p>
                          </div>
                          <ArrowRight className="mt-3 h-4 w-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--gw-intelligence-200)]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="surface-panel-soft rounded-[30px] p-5 sm:p-6">
            <div className="flex h-full flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(91,184,240,0.12)] text-[var(--gw-brand-200)]">
                  <HelpCircle className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    Need help before changing a control?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Keep support and documentation available near sensitive controls without mixing
                    them into destructive actions.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">
                  Contact Support
                </Button>
                <Button variant="ghost" size="sm">
                  View Docs
                </Button>
              </div>
            </div>
          </div>

          <div className="surface-caution rounded-[30px] p-5 sm:p-6">
            <span className="badge-caution mb-4 inline-flex">Review First</span>
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
              High-impact account actions stay separate
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Billing, privacy, exports, and deletion controls have downstream effects on records
              access and should never compete visually with routine preferences.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <span className="data-kicker">Account Actions</span>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
              Temporary and irreversible account actions
            </h2>
            <p className="page-subtitle mt-2">
              Destructive controls remain visually isolated from the rest of the settings console.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="surface-caution rounded-[28px] border-[rgba(250,194,74,0.2)] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Pause Your Account
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Temporarily disable account activity without deleting historical data.
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="sm:shrink-0">
                  Pause
                </Button>
              </div>
            </div>

            <div className="surface-panel-quiet rounded-[28px] border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.055)] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Delete Account
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="sm:shrink-0 text-[var(--color-danger)]">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function ControlMetric({
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
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}
