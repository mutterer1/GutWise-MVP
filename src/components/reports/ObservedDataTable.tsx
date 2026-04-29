interface ObservedDataRow {
  label: string;
  value: string;
  note?: string;
}

interface ObservedDataTableProps {
  rows: ObservedDataRow[];
  title?: string;
  subtitle?: string;
}

export default function ObservedDataTable({
  rows,
  title = 'Observed Data Summary',
  subtitle = 'A compact summary of the patient-reported data included in this report.',
}: ObservedDataTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="clinical-card mb-5 p-5 print:border-gray-300 print:bg-white print:p-6">
      <div className="mb-5 border-b border-[rgba(197,168,255,0.12)] pb-4 print:border-gray-200">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gw-intelligence-300)] print:text-gray-500">
          Observed Data Summary
        </p>
        <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] print:text-gray-900">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-600">
          {subtitle}
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[rgba(197,168,255,0.14)] print:border-gray-200">
        <div className="grid grid-cols-[1.25fr_0.75fr_1fr] bg-[rgba(139,92,246,0.10)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] print:bg-gray-100 print:text-gray-600">
          <div>Metric</div>
          <div>Value</div>
          <div>Note</div>
        </div>
        <div className="divide-y divide-[rgba(197,168,255,0.10)] print:divide-gray-200">
          {rows.map((row) => (
            <div
              key={`${row.label}-${row.value}`}
              className="grid grid-cols-[1.25fr_0.75fr_1fr] px-4 py-3 text-sm transition-smooth hover:bg-white/[0.025] print:hover:bg-transparent"
            >
              <div className="pr-3 font-semibold text-[var(--color-text-primary)] print:text-gray-900">
                {row.label}
              </div>
              <div className="pr-3 font-semibold text-[var(--gw-intelligence-200)] print:text-gray-900">
                {row.value}
              </div>
              <div className="text-[var(--color-text-secondary)] print:text-gray-600">
                {row.note ?? '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
