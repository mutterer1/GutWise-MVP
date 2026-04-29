import type { BristolDistribution } from '../../hooks/useTrendsData';
import {
  ChartEmptyState,
  TREND_CHART_COLORS,
  TrendAnnotationRail,
  TrendChartFrame,
} from './TrendChartFrame';

interface BristolDistributionChartProps {
  data: BristolDistribution[];
}

const bristolLabels: Record<number, string> = {
  1: 'Separate hard lumps',
  2: 'Lumpy and sausage-like',
  3: 'Sausage with cracks',
  4: 'Smooth, soft sausage',
  5: 'Soft blobs with clear edges',
  6: 'Mushy consistency',
  7: 'Liquid consistency',
};

const bristolColors: Record<number, string> = {
  1: '#6d28d9',
  2: '#7c3aed',
  3: '#a78bfa',
  4: '#c5a8ff',
  5: '#f06f9b',
  6: '#fb7cab',
  7: '#fb718d',
};

function getRangeLabel(type: number): string {
  if (type <= 2) return 'harder';
  if (type <= 4) return 'target';
  return 'looser';
}

export default function BristolDistributionChart({ data }: BristolDistributionChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const idealCount = data
    .filter((item) => item.type === 3 || item.type === 4)
    .reduce((sum, item) => sum + item.count, 0);
  const idealPercentage = totalCount > 0 ? Math.round((idealCount / totalCount) * 100) : 0;
  const peakPercentage = Math.max(...data.map((item) => item.percentage), 1);
  const dominantType = data.reduce(
    (currentPeak, item) => (item.count > currentPeak.count ? item : currentPeak),
    data[0]
  );
  const edgeCount = data
    .filter((item) => item.type <= 2 || item.type >= 6)
    .reduce((sum, item) => sum + item.count, 0);
  const edgePercentage = totalCount > 0 ? Math.round((edgeCount / totalCount) * 100) : 0;

  if (totalCount === 0) {
    return (
      <TrendChartFrame
        kicker="Stool Form"
        title="Bristol Scale Distribution"
        description="Distribution of recorded stool-form types in the selected period."
      >
        <ChartEmptyState message="No Bristol Scale data is available for this period." />
      </TrendChartFrame>
    );
  }

  return (
    <TrendChartFrame
      kicker="Stool Form"
      title="Bristol Constellation"
      description="A form-distribution constellation that highlights where your stool records cluster."
      metric={`${idealPercentage}%`}
      metricLabel="Type 3-4"
      legend={[
        { label: 'Harder range', color: TREND_CHART_COLORS.major, variant: 'dot' },
        { label: 'Target range', color: TREND_CHART_COLORS.primary, variant: 'dot' },
        { label: 'Looser range', color: TREND_CHART_COLORS.rose, variant: 'dot' },
      ]}
      insight="The useful signal is the cluster shape. A balanced middle cluster is different from a split hard-and-loose pattern."
    >
      <div className="chart-plot-area px-4 py-5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(92px,1fr))] gap-3">
          {data.map((item) => {
            const isIdeal = item.type === 3 || item.type === 4;
            const size = 40 + Math.round((item.percentage / peakPercentage) * 34);

            return (
              <div
                key={item.type}
                className={[
                  'group relative flex min-h-[148px] flex-col items-center justify-center gap-3 rounded-[22px] border px-2.5 py-3 text-center transition-smooth',
                  isIdeal
                    ? 'border-[rgba(216,199,255,0.28)] bg-[rgba(139,92,246,0.12)]'
                    : 'border-[rgba(202,190,255,0.1)] bg-white/[0.025]',
                ].join(' ')}
                role="group"
                aria-label={`Bristol Type ${item.type}: ${item.count} entries, ${item.percentage}%`}
              >
                <span className="data-kicker">Type {item.type}</span>

                <div
                  className="relative grid place-items-center rounded-full border border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `radial-gradient(circle at 35% 25%, rgba(255,255,255,0.42), transparent 28%), ${bristolColors[item.type]}`,
                    boxShadow: `0 0 ${item.percentage > 0 ? 36 : 12}px ${bristolColors[item.type]}66`,
                  }}
                >
                  <span className="text-sm font-semibold text-white">{item.percentage}%</span>
                  {item.percentage > 0 && <span className="data-ping absolute inset-0 rounded-full border border-white/25" />}
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-primary)]">
                  {getRangeLabel(item.type)}
                </p>

                <div className="chart-tooltip absolute left-1/2 top-1/2 z-10 w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="font-semibold">Type {item.type}</p>
                  <p className="text-[var(--color-text-secondary)]">{bristolLabels[item.type]}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 overflow-hidden rounded-full border border-[rgba(202,190,255,0.12)] bg-black/[0.18] p-1">
          <div className="flex h-5 overflow-hidden rounded-full">
            {data.map((item) => (
              <div
                key={`segment-${item.type}`}
                className="h-full transition-all"
                style={{
                  width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%`,
                  backgroundColor: bristolColors[item.type],
                }}
                title={`Type ${item.type}: ${item.percentage}%`}
              />
            ))}
          </div>
        </div>

        <TrendAnnotationRail
          layout="stacked-horizontal"
          annotations={[
            {
              label: 'Dominant Form',
              value: `Type ${dominantType.type}`,
              helper: `${dominantType.percentage}% of entries cluster around ${bristolLabels[dominantType.type].toLowerCase()}.`,
              tone:
                dominantType.type === 3 || dominantType.type === 4
                  ? 'success'
                  : dominantType.type <= 2
                    ? 'major'
                    : 'rose',
            },
            {
              label: 'Edge Share',
              value: `${edgePercentage}%`,
              helper: 'Types 1-2 and 6-7 are edge-range records worth comparing against urgency and hydration.',
              tone: edgePercentage >= 35 ? 'warning' : 'daily',
            },
          ]}
        />
      </div>
    </TrendChartFrame>
  );
}
