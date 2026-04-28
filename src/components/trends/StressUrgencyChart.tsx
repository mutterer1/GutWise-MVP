import type { StressUrgencyCorrelation } from '../../hooks/useTrendsData';
import {
  ChartEmptyState,
  formatTrendDate,
  TREND_CHART_COLORS,
  TrendAnnotationRail,
  TrendChartFrame,
} from './TrendChartFrame';

interface StressUrgencyChartProps {
  data: StressUrgencyCorrelation[];
}

export default function StressUrgencyChart({ data }: StressUrgencyChartProps) {
  const hasData = data.some((item) => item.avgStressLevel !== null || item.avgUrgency !== null);

  if (!hasData) {
    return (
      <TrendChartFrame
        kicker="Stress Overlay"
        title="Stress Level vs Bowel Urgency"
        description="Stress and urgency plotted together across the selected period."
      >
        <ChartEmptyState message="No stress or urgency data is available for this period." />
      </TrendChartFrame>
    );
  }

  const maxValue = 10;
  const chartHeight = 282;
  const denominator = Math.max(data.length - 1, 1);
  const highUrgencyEpisodes = data.reduce((sum, item) => sum + item.urgencyEpisodes, 0);
  const barWidth = Math.max(1.8, Math.min(5.8, 72 / Math.max(data.length, 1)));
  const coupledDays = data.filter(
    (item) =>
      item.avgStressLevel !== null &&
      item.avgStressLevel >= 6 &&
      item.avgUrgency !== null &&
      item.avgUrgency >= 4
  ).length;
  const peakStressDay = data
    .filter((item) => item.avgStressLevel !== null)
    .reduce(
      (currentPeak, item) =>
        (item.avgStressLevel ?? 0) > (currentPeak.avgStressLevel ?? 0) ? item : currentPeak,
      data.find((item) => item.avgStressLevel !== null) ?? data[0]
    );
  const peakUrgencyDay = data
    .filter((item) => item.avgUrgency !== null)
    .reduce(
      (currentPeak, item) =>
        (item.avgUrgency ?? 0) > (currentPeak.avgUrgency ?? 0) ? item : currentPeak,
      data.find((item) => item.avgUrgency !== null) ?? data[0]
    );
  const urgencyPoints = data
    .map((item, index) => {
      if (item.avgUrgency === null) return null;
      const x = (index / denominator) * 100;
      const y = chartHeight - (item.avgUrgency / maxValue) * chartHeight;
      return `${x},${y}`;
    })
    .filter((point): point is string => point !== null)
    .join(' ');

  return (
    <TrendChartFrame
      kicker="Stress Overlay"
      title="Stress Skyline"
      description="Stress load appears as vertical skyline towers with urgency traced across the horizon."
      metric={String(highUrgencyEpisodes)}
      metricLabel="Urgency events"
      legend={[
        { label: 'Stress skyline', color: TREND_CHART_COLORS.major, variant: 'bar' },
        { label: 'Urgency trace', color: TREND_CHART_COLORS.amber, variant: 'line' },
        { label: 'Event count', color: TREND_CHART_COLORS.rose, variant: 'dot' },
      ]}
      insight="A meaningful stress response signal is repeated co-movement between stress towers and urgency nodes."
    >
      <div className="chart-plot-area h-[340px] px-5 pb-12 pt-6">
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="stress-skyline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={TREND_CHART_COLORS.primary} stopOpacity="0.95" />
              <stop offset="100%" stopColor={TREND_CHART_COLORS.major} stopOpacity="0.38" />
            </linearGradient>
            <linearGradient id="stress-event-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={TREND_CHART_COLORS.rose} stopOpacity="0.24" />
              <stop offset="100%" stopColor={TREND_CHART_COLORS.amber} stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {Array.from({ length: 6 }).map((_, index) => {
            const y = (chartHeight / 5) * index;
            return (
              <line
                key={index}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke={TREND_CHART_COLORS.grid}
                strokeWidth="0.35"
              />
            );
          })}

          <rect
            x="0"
            y={chartHeight * 0.66}
            width="100"
            height={chartHeight * 0.34}
            fill="url(#stress-event-gradient)"
            opacity="0.55"
          />

          {data.map((item, index) => {
            const x = (index / denominator) * 100;
            const stressHeight =
              item.avgStressLevel === null ? 0 : (item.avgStressLevel / maxValue) * chartHeight;
            const y = chartHeight - stressHeight;

            return (
              <g key={`stress-${item.date}`}>
                {item.avgStressLevel !== null && (
                  <rect
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={stressHeight}
                    rx="1.2"
                    fill="url(#stress-skyline-gradient)"
                    opacity="0.82"
                  >
                    <title>{`${formatTrendDate(item.date)}: Stress ${item.avgStressLevel.toFixed(1)}/10`}</title>
                  </rect>
                )}
              </g>
            );
          })}

          {urgencyPoints && (
            <polyline
              points={urgencyPoints}
              fill="none"
              stroke={TREND_CHART_COLORS.amber}
              strokeWidth="0.95"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="animate-chart-trace"
            />
          )}

          {data.map((item, index) => {
            const x = (index / denominator) * 100;
            const urgencyY =
              item.avgUrgency === null
                ? null
                : chartHeight - (item.avgUrgency / maxValue) * chartHeight;

            return (
              <g key={`urgency-${item.date}`}>
                {urgencyY !== null && (
                  <circle
                    cx={x}
                    cy={urgencyY}
                    r={item.urgencyEpisodes > 0 ? 2.3 : 1.7}
                    fill={TREND_CHART_COLORS.amber}
                    stroke="rgba(255,255,255,0.78)"
                    strokeWidth="0.5"
                  >
                    <title>{`${formatTrendDate(item.date)}: Urgency ${item.avgUrgency?.toFixed(1)}/10`}</title>
                  </circle>
                )}

                {item.urgencyEpisodes > 0 && (
                  <circle
                    cx={x}
                    cy={chartHeight - 12}
                    r={Math.min(2 + item.urgencyEpisodes, 6)}
                    fill={TREND_CHART_COLORS.rose}
                    opacity="0.9"
                  >
                    <title>{`${formatTrendDate(item.date)}: ${item.urgencyEpisodes} high urgency event${item.urgencyEpisodes === 1 ? '' : 's'}`}</title>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-x-5 bottom-3 flex justify-between gap-1.5">
          {data.map((item, index) => (
            <span key={item.date} className="chart-axis-label min-w-0 flex-1 text-center">
              {index % Math.max(1, Math.ceil(data.length / 7)) === 0
                ? formatTrendDate(item.date)
                : ''}
            </span>
          ))}
        </div>
      </div>

      <TrendAnnotationRail
        annotations={[
          {
            label: 'Coupled Days',
            value: String(coupledDays),
            helper: 'Days where stress was 6/10+ and urgency was 4/10+ are stronger response markers.',
            tone: coupledDays > 0 ? 'major' : 'success',
          },
          {
            label: 'Peak Stress',
            value:
              peakStressDay.avgStressLevel !== null
                ? `${peakStressDay.avgStressLevel.toFixed(1)}/10`
                : 'Open',
            helper: `Highest stress read appeared on ${formatTrendDate(peakStressDay.date)}.`,
            tone: 'daily',
          },
          {
            label: 'Peak Urgency',
            value:
              peakUrgencyDay.avgUrgency !== null
                ? `${peakUrgencyDay.avgUrgency.toFixed(1)}/10`
                : 'Open',
            helper: `Highest urgency read appeared on ${formatTrendDate(peakUrgencyDay.date)}.`,
            tone: (peakUrgencyDay.avgUrgency ?? 0) >= 6 ? 'rose' : 'warning',
          },
        ]}
      />
    </TrendChartFrame>
  );
}
