import type { SleepSymptomCorrelation } from '../../hooks/useTrendsData';
import {
  ChartEmptyState,
  formatTrendDate,
  TREND_CHART_COLORS,
  TrendAnnotationRail,
  TrendChartFrame,
} from './TrendChartFrame';

interface SleepSymptomChartProps {
  data: SleepSymptomCorrelation[];
}

export default function SleepSymptomChart({ data }: SleepSymptomChartProps) {
  const hasData = data.some((item) => item.sleepHours !== null || item.avgSymptomSeverity !== null);

  if (!hasData) {
    return (
      <TrendChartFrame
        kicker="Recovery Overlay"
        title="Sleep Quality vs Symptom Severity"
        description="Sleep duration and symptom severity on the same 0-10 visual scale."
      >
        <ChartEmptyState message="No sleep or symptom data is available for this period." />
      </TrendChartFrame>
    );
  }

  const dates = data.filter((item) => item.sleepHours !== null || item.avgSymptomSeverity !== null);
  const labelCadence = Math.max(1, Math.ceil(dates.length / 7));
  const loggedSleep = dates.filter((item) => item.sleepHours !== null);
  const avgSleep =
    loggedSleep.reduce((sum, item) => sum + (item.sleepHours ?? 0), 0) /
    Math.max(loggedSleep.length, 1);
  const shortSleepDays = dates.filter(
    (item) => item.sleepHours !== null && item.sleepHours < 6
  ).length;
  const mismatchDays = dates.filter(
    (item) =>
      item.sleepHours !== null &&
      item.sleepHours < 6 &&
      item.avgSymptomSeverity !== null &&
      item.avgSymptomSeverity >= 5
  ).length;
  const bestRecoveryDay = loggedSleep.reduce(
    (currentBest, item) => ((item.sleepHours ?? 0) > (currentBest.sleepHours ?? 0) ? item : currentBest),
    loggedSleep[0] ?? dates[0]
  );

  return (
    <TrendChartFrame
      kicker="Recovery Overlay"
      title="Recovery Mirror"
      description="Sleep rises above the centerline while symptom pressure falls below it."
      metric={loggedSleep.length > 0 ? `${avgSleep.toFixed(1)}h` : 'Open'}
      metricLabel="Avg sleep"
      legend={[
        { label: 'Sleep hours', color: TREND_CHART_COLORS.blue, variant: 'bar' },
        { label: 'Symptom pressure', color: TREND_CHART_COLORS.rose, variant: 'bar' },
      ]}
      insight="The clearest recovery signal is symptom pressure repeatedly rising after shorter or lower-quality sleep."
    >
      <div className="chart-plot-area h-[326px] px-3 pb-12 pt-8">
        <div className="absolute inset-x-4 top-1/2 z-[1] border-t border-dashed border-[rgba(216,199,255,0.28)]">
          <span className="chart-tooltip absolute -right-1 -top-4 rounded-full px-2 py-1 text-[10px] font-semibold text-white">
            Mirror line
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-12 top-8 flex justify-between gap-1.5">
          {dates.map((item, index) => {
            const dateLabel = formatTrendDate(item.date);
            const sleepHeight =
              item.sleepHours === null ? 0 : Math.min(item.sleepHours, 10) / 10 * 44;
            const symptomHeight =
              item.avgSymptomSeverity === null ? 0 : item.avgSymptomSeverity / 10 * 44;

            return (
              <div key={item.date} className="group relative h-full flex-1">
                {item.sleepHours !== null && (
                  <div
                    className="absolute bottom-1/2 left-[18%] right-[18%] rounded-t-[18px] bg-[linear-gradient(180deg,var(--gw-brand-200),var(--gw-brand-600))] shadow-[0_0_24px_rgba(91,184,240,0.24)] transition-smooth group-hover:shadow-[0_0_36px_rgba(91,184,240,0.38)]"
                    style={{ height: `${Math.max(sleepHeight, 5)}%` }}
                  />
                )}

                {item.avgSymptomSeverity !== null && (
                  <div
                    className="absolute left-[18%] right-[18%] top-1/2 rounded-b-[18px] bg-[linear-gradient(180deg,var(--gw-rose-400),var(--gw-rose-700))] shadow-[0_0_24px_rgba(240,111,155,0.24)] transition-smooth group-hover:shadow-[0_0_36px_rgba(240,111,155,0.36)]"
                    style={{ height: `${Math.max(symptomHeight, 5)}%` }}
                  />
                )}

                {item.sleepQuality !== null && (
                  <div
                    className="absolute left-1/2 z-[2] h-3 w-3 -translate-x-1/2 rounded-full border border-white/70 bg-[var(--gw-intelligence-200)] shadow-[0_0_18px_rgba(197,168,255,0.36)]"
                    style={{ bottom: `${50 + Math.min((item.sleepQuality / 10) * 40, 40)}%` }}
                  />
                )}

                <div className="chart-tooltip absolute bottom-[calc(100%+14px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-2xl px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="font-semibold">{dateLabel}</p>
                  <p className="text-[var(--color-text-secondary)]">
                    Sleep: {item.sleepHours !== null ? `${item.sleepHours.toFixed(1)}h` : 'none'}
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    Quality: {item.sleepQuality ?? 'N/A'}
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    Symptoms:{' '}
                    {item.avgSymptomSeverity !== null
                      ? `${item.avgSymptomSeverity.toFixed(1)}/10`
                      : 'none'}
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

      <TrendAnnotationRail
        annotations={[
          {
            label: 'Short-Sleep Days',
            value: String(shortSleepDays),
            helper: 'Days under 6 hours are useful recovery-context markers.',
            tone: shortSleepDays > 0 ? 'warning' : 'success',
          },
          {
            label: 'Mismatch Days',
            value: String(mismatchDays),
            helper: 'Short sleep with symptom pressure at 5/10 or higher may be worth reviewing.',
            tone: mismatchDays > 0 ? 'rose' : 'daily',
          },
          {
            label: 'Best Recovery',
            value:
              bestRecoveryDay.sleepHours !== null
                ? `${bestRecoveryDay.sleepHours.toFixed(1)}h`
                : 'Open',
            helper: `Highest sleep duration appeared on ${formatTrendDate(bestRecoveryDay.date)}.`,
            tone: 'blue',
          },
        ]}
      />
    </TrendChartFrame>
  );
}
