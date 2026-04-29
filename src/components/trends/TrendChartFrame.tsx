import type { ReactNode } from 'react';
import { Activity } from 'lucide-react';

export const TREND_CHART_COLORS = {
  primary: '#a78bfa',
  major: '#7c3aed',
  blue: '#5bb8f0',
  rose: '#f06f9b',
  success: '#34d399',
  warning: '#f6a81c',
  danger: '#fb718d',
  amber: '#fac24a',
  grid: 'rgba(202, 190, 255, 0.07)',
  axis: 'rgba(216, 213, 232, 0.5)',
  muted: 'rgba(216, 213, 232, 0.64)',
};

export interface TrendLegendItem {
  label: string;
  color: string;
  variant?: 'line' | 'dash' | 'dot' | 'bar';
}

export interface TrendAnnotation {
  label: string;
  value: string;
  helper: string;
  tone?: 'major' | 'daily' | 'rose' | 'blue' | 'success' | 'warning';
}

interface TrendChartFrameProps {
  title: string;
  kicker: string;
  description?: string;
  metric?: string;
  metricLabel?: string;
  insight?: string;
  legend?: TrendLegendItem[];
  children: ReactNode;
  className?: string;
}

export function TrendChartFrame({
  title,
  kicker,
  description,
  metric,
  metricLabel,
  insight,
  legend = [],
  children,
  className = '',
}: TrendChartFrameProps) {
  return (
    <section className={`chart-shell p-5 sm:p-6 ${className}`}>
      <div className="relative z-[1] space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <span className="clinical-chip mb-3">
              <Activity className="h-3.5 w-3.5" />
              {kicker}
            </span>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
              {title}
            </h3>
            {description && (
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {description}
              </p>
            )}
          </div>

          {metric && (
            <div className="rounded-[24px] border border-[rgba(216,199,255,0.16)] bg-white/[0.04] px-4 py-3 lg:min-w-[150px]">
              <p className="data-kicker">{metricLabel ?? 'Current read'}</p>
              <p className="metric-value mt-2 text-[2rem]">{metric}</p>
            </div>
          )}
        </div>

        <div>{children}</div>

        {(legend.length > 0 || insight) && (
          <div className="flex flex-col gap-3 border-t border-[rgba(202,190,255,0.12)] pt-4 lg:flex-row lg:items-center lg:justify-between">
            {legend.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {legend.map((item) => (
                  <ChartLegendChip key={item.label} item={item} />
                ))}
              </div>
            )}

            {insight && (
              <div className="flex items-start gap-2 rounded-[20px] border border-[rgba(216,199,255,0.14)] bg-[rgba(139,92,246,0.09)] px-3 py-2 text-xs leading-5 text-[var(--color-text-secondary)] lg:max-w-[420px] lg:rounded-full">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[rgba(139,92,246,0.16)]">
                  <Activity className="h-3.5 w-3.5 text-[var(--gw-intelligence-200)]" />
                </span>
                <span>{insight}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ChartLegendChip({ item }: { item: TrendLegendItem }) {
  const marker =
    item.variant === 'dot' ? (
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: item.color }}
      />
    ) : item.variant === 'dash' ? (
      <span
        className="h-0 w-8 border-t-2 border-dashed"
        style={{ borderColor: item.color }}
      />
    ) : item.variant === 'bar' ? (
      <span
        className="h-3.5 w-2 rounded-full"
        style={{ backgroundColor: item.color }}
      />
    ) : (
      <span
        className="h-0.5 w-8 rounded-full"
        style={{ backgroundColor: item.color }}
      />
    );

  return (
    <span className="chart-legend-chip">
      {marker}
      {item.label}
    </span>
  );
}

export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[var(--gw-radius-card)] border border-[var(--border-subtle)] bg-white/[0.02] px-5 text-center">
      <div className="insight-orb">
        <Activity className="h-5 w-5 text-white" />
      </div>
      <p className="max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">{message}</p>
    </div>
  );
}

export function TrendAnnotationRail({
  annotations,
  layout = 'grid',
}: {
  annotations: TrendAnnotation[];
  layout?: 'grid' | 'stacked-horizontal';
}) {
  if (annotations.length === 0) return null;

  return (
    <div
      className={
        layout === 'stacked-horizontal'
          ? 'grid gap-3'
          : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
      }
    >
      {annotations.map((annotation) => (
        <TrendAnnotationCard
          key={`${annotation.label}-${annotation.value}`}
          annotation={annotation}
          layout={layout}
        />
      ))}
    </div>
  );
}

function TrendAnnotationCard({
  annotation,
  layout,
}: {
  annotation: TrendAnnotation;
  layout: 'grid' | 'stacked-horizontal';
}) {
  const tone = annotation.tone ?? 'daily';
  const toneClassName = {
    major: 'border-[rgba(192,132,252,0.26)] bg-[rgba(124,58,237,0.12)]',
    daily: 'border-[rgba(216,199,255,0.18)] bg-[rgba(139,92,246,0.09)]',
    rose: 'border-[rgba(240,111,155,0.22)] bg-[rgba(240,111,155,0.09)]',
    blue: 'border-[rgba(91,184,240,0.22)] bg-[rgba(91,184,240,0.08)]',
    success: 'border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.08)]',
    warning: 'border-[rgba(246,168,28,0.22)] bg-[rgba(246,168,28,0.08)]',
  }[tone];

  if (layout === 'stacked-horizontal') {
    return (
      <div
        className={`flex flex-col gap-3 rounded-[22px] border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${toneClassName}`}
      >
        <div className="min-w-[120px]">
          <p className="data-kicker">{annotation.label}</p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
            {annotation.value}
          </p>
        </div>
        <p className="text-xs leading-5 text-[var(--color-text-tertiary)] sm:max-w-[360px] sm:text-right">
          {annotation.helper}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${toneClassName}`}>
      <p className="data-kicker">{annotation.label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {annotation.value}
      </p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
        {annotation.helper}
      </p>
    </div>
  );
}

export function formatTrendDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
