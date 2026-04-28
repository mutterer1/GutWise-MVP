import { AlertTriangle, CheckCircle, FileText, ShieldCheck } from 'lucide-react';
import type { ClinicalAlert } from '../../utils/clinicalReportQueries';

interface ExecutiveSummaryProps {
  dateRange: string;
  dayCount: number;
  totalBMs: number;
  avgPerDay: number;
  avgPerWeek: number;
  criticalAlerts: ClinicalAlert[];
  primaryConcerns: string[];
}

export default function ExecutiveSummary({
  dateRange,
  dayCount,
  totalBMs,
  avgPerDay,
  avgPerWeek,
  criticalAlerts,
  primaryConcerns,
}: ExecutiveSummaryProps) {
  const hasFlags = criticalAlerts.length > 0 || primaryConcerns.length > 0;
  const totalFlagged = criticalAlerts.length + primaryConcerns.length;

  return (
    <section className="mb-5 overflow-hidden rounded-[34px] border border-[rgba(197,168,255,0.18)] bg-[rgba(10,13,31,0.72)] p-5 shadow-[0_18px_60px_rgba(5,8,22,0.22)] print:border-gray-300 print:bg-white print:p-6">
      <div className="mb-6 border-b border-[rgba(197,168,255,0.12)] pb-5 print:border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="signal-badge signal-badge-major mb-3 print:border-gray-300 print:bg-gray-100 print:text-gray-700">
              <FileText className="h-3.5 w-3.5" />
              Report Overview
            </span>
            <h2 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-[var(--color-text-primary)] print:text-gray-900">
              {dateRange}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-tertiary)] print:text-gray-600">
              {dayCount}-day patient-reported review period
            </p>
          </div>

          <div
            className={[
              'inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold',
              !hasFlags
                ? 'border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.12)] text-[var(--gw-intelligence-200)] print:border-gray-300 print:bg-gray-100 print:text-gray-700'
                : criticalAlerts.length > 0
                  ? 'border-[rgba(255,120,120,0.28)] bg-[rgba(255,120,120,0.10)] text-[var(--color-danger)] print:border-gray-300 print:bg-gray-100 print:text-gray-700'
                  : 'border-[rgba(255,170,92,0.24)] bg-[rgba(255,170,92,0.08)] text-[#FFC26A] print:border-gray-300 print:bg-gray-100 print:text-gray-700',
            ].join(' ')}
          >
            {!hasFlags ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                <span>No major review flags</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>
                  {totalFlagged} item{totalFlagged !== 1 ? 's' : ''} to review
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryMetric
          label="Total Stool Logs"
          value={String(totalBMs)}
          helper="patient-reported entries"
        />
        <SummaryMetric
          label="Average Per Day"
          value={avgPerDay.toFixed(1)}
          helper="bowel movements per day"
        />
        <SummaryMetric
          label="Average Per Week"
          value={avgPerWeek.toFixed(1)}
          helper="bowel movements per week"
        />
      </div>

      <div className="mb-5 rounded-[24px] border border-[rgba(197,168,255,0.16)] bg-[rgba(139,92,246,0.08)] p-4 print:border-gray-200 print:bg-gray-50">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--gw-intelligence-300)] print:text-gray-700" />
          <div>
            <p className="text-sm font-semibold text-[var(--gw-intelligence-200)] print:text-gray-900">
              Observed data first
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-700">
              This report summarizes what was logged during the selected period. Pattern summaries
              below are intended to support clinical discussion, not to provide a diagnosis.
            </p>
          </div>
        </div>
      </div>

      {criticalAlerts.length > 0 && (
        <div className="mb-5 rounded-[24px] border border-[rgba(255,120,120,0.28)] bg-[rgba(255,120,120,0.10)] p-4 print:border-gray-300 print:bg-white">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-danger)] print:text-gray-700" />
            <div className="flex-1">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-danger)] print:text-gray-900">
                Review flags
              </h3>
              <ul className="space-y-2">
                {criticalAlerts.map((alert, index) => (
                  <li
                    key={`${alert.message}-${index}`}
                    className="flex items-start gap-2 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-700"
                  >
                    <span className="mt-0.5 inline-block flex-shrink-0 rounded-full border border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.10)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-danger)] print:border-gray-300 print:bg-gray-100 print:text-gray-700">
                      {alert.severity}
                    </span>
                    <span>{alert.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {primaryConcerns.length > 0 ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] print:text-gray-500">
            Repeated Patterns Worth Discussing
          </h3>
          <ol className="space-y-2.5">
            {primaryConcerns.map((concern, index) => (
              <li
                key={`${concern}-${index}`}
                className="flex items-start gap-3 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-700"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.12)] text-xs font-bold text-[var(--gw-intelligence-300)] print:border-gray-300 print:bg-gray-100 print:text-gray-700">
                  {index + 1}
                </span>
                <span>{concern}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-[24px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 print:border-gray-200 print:bg-gray-50">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--gw-intelligence-300)] print:text-gray-700" />
          <p className="text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-700">
            No major repeated patterns were highlighted in this summary period. Continue logging for
            stronger comparisons over time.
          </p>
        </div>
      )}
    </section>
  );
}

function SummaryMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4 print:border-gray-200 print:bg-gray-50">
      <p className="metric-label print:text-gray-500">{label}</p>
      <p className="metric-value mt-2 text-[2.25rem] print:text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)] print:text-gray-500">{helper}</p>
    </div>
  );
}
