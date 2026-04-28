import { Calendar, Clock3, Sparkles } from 'lucide-react';
import Button from '../Button';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

function getRangeDayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

function formatRangeSummary(startDate: string, endDate: string): string {
  const dayCount = getRangeDayCount(startDate, endDate);
  return `${dayCount} day${dayCount === 1 ? '' : 's'} selected`;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangeSelectorProps) {
  const handlePresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    onDateRangeChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const dayCount = getRangeDayCount(startDate, endDate);

  return (
    <section className="signal-card signal-card-daily rounded-[30px] p-5 sm:p-6 print:border-0 print:bg-transparent print:p-0">
      <div className="grid gap-5 border-b border-[rgba(197,168,255,0.12)] pb-5 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[rgba(197,168,255,0.2)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-300)]">
              <Calendar className="h-5 w-5" />
            </div>

            <div>
              <span className="signal-badge signal-badge-major mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Report Period
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
                Set the clinical review window
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                This period controls the summary, evidence sections, review flags, and exported
                report output below.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[22px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
              <Clock3 className="h-3.5 w-3.5 text-[var(--gw-intelligence-300)]" />
              Window
            </div>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              {formatRangeSummary(startDate, endDate)}
            </p>
          </div>

          <div className="rounded-[22px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
              View type
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              {dayCount >= 30 ? 'Longitudinal review' : 'Short-window review'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <DateInput
          label="Start Date"
          value={startDate}
          onChange={(value) => onDateRangeChange(value, endDate)}
        />
        <DateInput
          label="End Date"
          value={endDate}
          onChange={(value) => onDateRangeChange(startDate, value)}
        />
      </div>

      <div className="mt-5 border-t border-[rgba(197,168,255,0.12)] pt-5 print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-text-tertiary)]">Quick review ranges</p>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePresetRange(7)}>
              Last 7 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetRange(30)}>
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetRange(90)}>
              Last 90 Days
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-base w-full"
      />
    </label>
  );
}
