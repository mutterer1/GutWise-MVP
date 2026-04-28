import { ShieldCheck, FileSearch, BrainCircuit } from 'lucide-react';

type TrustExplainerVariant = 'insights' | 'reports' | 'documents';

interface TrustExplainerProps {
  variant?: TrustExplainerVariant;
  className?: string;
}

interface TrustExplainerContent {
  title: string;
  subtitle: string;
  points: string[];
  note: string;
}

const content: Record<TrustExplainerVariant, TrustExplainerContent> = {
  insights: {
    title: 'How GutWise labels intelligence',
    subtitle:
      'GutWise ranks patterns by repeated overlap, evidence quality, data completeness, and whether reviewed nutrition or structured ingredients strengthen the signal.',
    points: [
      'Each insight labels whether it is supported by reviewed nutrition, structured ingredients, mixed evidence, fallback heuristics, or generic logs.',
      'Confidence improves when the same signal appears across multiple days with better food coverage and more complete context.',
    ],
    note: 'GutWise is a pattern-finding aid. It does not diagnose conditions or replace clinical judgment.',
  },
  reports: {
    title: 'How to use this report',
    subtitle: 'Use the report as a structured conversation aid for clinical review.',
    points: [
      'Observed data appears first, followed by plain-language interpretation.',
      'Treat the report as a timeline and discussion tool, not a conclusion.',
    ],
    note: 'GutWise does not diagnose conditions or replace professional care.',
  },
  documents: {
    title: 'How document review works',
    subtitle: 'Uploaded records stay separate until you choose which details to activate.',
    points: [
      'Uploading creates a review record, not an automatic medical interpretation.',
      'Only reviewed and approved details can become active medical context.',
    ],
    note: 'You stay in control of what GutWise uses to personalize patterns.',
  },
};

export default function TrustExplainer({
  variant = 'insights',
  className = '',
}: TrustExplainerProps) {
  const selected = content[variant];
  const Icon =
    variant === 'documents' ? FileSearch : variant === 'reports' ? ShieldCheck : BrainCircuit;

  return (
    <section className={`signal-card signal-card-daily rounded-[30px] p-5 sm:p-6 ${className}`}>
      <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-300)]">
            <Icon className="h-5 w-5" />
          </div>

          <p className="data-kicker">Trust Frame</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
            {selected.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {selected.subtitle}
          </p>
        </div>

        <div className="space-y-3">
          {selected.points.map((point, index) => (
            <div
              key={point}
              className="rounded-[22px] border border-[rgba(197,168,255,0.13)] bg-white/[0.035] px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(139,92,246,0.16)] text-xs font-semibold text-[var(--gw-intelligence-300)]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{point}</p>
              </div>
            </div>
          ))}

          <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.28)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gw-intelligence-300)]">
              Important
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {selected.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
