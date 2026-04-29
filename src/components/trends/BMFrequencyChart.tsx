import type { BMFrequencyData } from '../../hooks/useTrendsData';
import {
  ChartEmptyState,
  formatTrendDate,
  TREND_CHART_COLORS,
  TrendAnnotationRail,
  TrendChartFrame,
} from './TrendChartFrame';

interface BMFrequencyChartProps {
  data: BMFrequencyData[];
}

export default function BMFrequencyChart({ data }: BMFrequencyChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const avgFrequency = data.length > 0 ? totalCount / data.length : 0;

  if (data.length === 0 || totalCount === 0) {
    return (
      <TrendChartFrame
        kicker="Bowel Rhythm"
        title="Daily Frequency Trend"
        description="Bowel movement cadence across the selected date range."
      >
        <ChartEmptyState message="No bowel movement frequency data is available for this period." />
      </TrendChartFrame>
    );
  }

  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const activeDays = data.filter((item) => item.count > 0).length;
  const labelCadence = Math.max(1, Math.ceil(data.length / 7));
  const averageLinePosition = 100 - Math.min((avgFrequency / maxCount) * 100, 100);
  const peakDay = data.reduce(
    (currentPeak, item) => (item.count > currentPeak.count ? item : currentPeak),
    data[0]
  );
  const quietDays = data.filter((item) => item.count === 0).length;

  return (
    <TrendChartFrame
      kicker="Bowel Rhythm"
      title="Rhythm Pulse Map"
      description="Daily bowel movement cadence as a pulse strip with an average rhythm line."
      metric={avgFrequency.toFixed(1)}
      metricLabel="Avg per day"
      legend={[
        { label: 'Daily pulse', color: TREND_CHART_COLORS.primary, variant: 'bar' },
        { label: 'Average rhythm', color: TREND_CHART_COLORS.rose, variant: 'dash' },
      ]}
      insight={`${activeDays} active day${activeDays === 1 ? '' : 's'} in this window. Compare gaps and spikes against stool form before interpreting a change.`}
    >
      <div className="chart-plot-area h-[302px] px-3 pb-12 pt-7">
        <div className="absolute inset-x-4 bottom-12 top-7">
          <div
            className="absolute left-0 right-0 z-[1] border-t border-dashed border-[var(--gw-rose-300)]"
            style={{ top: `${averageLinePosition}%` }}
          >
            <span className="chart-tooltip absolute -right-1 -top-4 rounded-full px-2 py-1 text-[10px] font-semibold text-white">
              Avg {avgFrequency.toFixed(1)}
            </span>
          </div>

          <div className="flex h-full items-end justify-between gap-1.5">
            {data.map((item, index) => {
              const heightPercent = (item.count / maxCount) * 100;
              const dateLabel = formatTrendDate(item.date);
              const inactive = item.count === 0;

              return (
                <div
                  key={item.date}
                  className="group relative flex h-full flex-1 flex-col justify-end"
                >
                  <div
                    className={[
                      'relative min-h-[6px] w-full overflow-hidden rounded-t-[18px] transition-smooth',
                      inactive
                        ? 'bg-white/[0.06]'
                        : 'bg-[linear-gradient(180deg,var(--gw-intelligence-200),var(--gw-intelligence-600))]',
                    ].join(' ')}
                    style={{ height: `${inactive ? 5 : Math.max(heightPercent, 8)}%` }}
                  >
                    {!inactive && (
                      <span className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/35" />
                    )}
                  </div>

                  {!inactive && (
                    <div
                      className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--gw-rose-300)]"
                      style={{ bottom: `${Math.max(heightPercent, 8)}%` }}
                    />
                  )}

                  <div className="chart-tooltip absolute bottom-[calc(100%+14px)] left-1/2 z-10 -translate-x-1/2 rounded-2xl px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="font-semibold">{dateLabel}</p>
                    <p className="text-[var(--color-text-secondary)]">
                      {item.count} BM{item.count === 1 ? '' : 's'}
                    </p>
                  </div>

                  <span className="chart-axis-label absolute -bottom-9 left-1/2 min-w-12 -translate-x-1/2 text-center">
                    {index % labelCadence === 0 ? dateLabel : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-3 flex gap-1">
          {data.map((item) => (
            <span
              key={`rail-${item.date}`}
              className={[
                'h-1.5 flex-1 rounded-full',
                item.count > 0 ? 'bg-[var(--gw-intelligence-300)]' : 'bg-white/[0.08]',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      <TrendAnnotationRail
        annotations={[
          {
            label: 'Peak Day',
            value: `${peakDay.count} BM${peakDay.count === 1 ? '' : 's'}`,
            helper: `${formatTrendDate(peakDay.date)} carried the highest frequency in this window.`,
            tone: peakDay.count > avgFrequency + 1 ? 'major' : 'daily',
          },
          {
            label: 'Quiet Span',
            value: `${quietDays} day${quietDays === 1 ? '' : 's'}`,
            helper:
              quietDays > 0
                ? 'Zero-frequency days are useful when compared with food, hydration, and stress logs.'
                : 'No zero-frequency days in this selected window.',
            tone: quietDays > 0 ? 'blue' : 'success',
          },
        ]}
      />
    </TrendChartFrame>
  );
}
