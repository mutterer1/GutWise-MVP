import type { HydrationCorrelation } from '../../hooks/useTrendsData';
import {
  ChartEmptyState,
  formatTrendDate,
  TREND_CHART_COLORS,
  TrendAnnotationRail,
  TrendChartFrame,
} from './TrendChartFrame';

interface HydrationCorrelationChartProps {
  data: HydrationCorrelation[];
}

function getBristolColor(value: number | null): string {
  if (value === null) return 'rgba(216,213,232,0.5)';
  if (value <= 2) return TREND_CHART_COLORS.major;
  if (value <= 4) return TREND_CHART_COLORS.success;
  if (value <= 5) return TREND_CHART_COLORS.warning;
  return TREND_CHART_COLORS.danger;
}

export default function HydrationCorrelationChart({ data }: HydrationCorrelationChartProps) {
  const hasData = data.some(
    (item) =>
      item.totalHydration > 0 ||
      item.effectiveHydration > 0 ||
      item.totalFluids > 0 ||
      item.avgBristolScale !== null
  );

  if (!hasData) {
    return (
      <TrendChartFrame
        kicker="Hydration Overlay"
        title="Water Goal vs Stool Consistency"
        description="Water-goal progress with Bristol form markers."
      >
        <ChartEmptyState message="No water, fluid, or stool data is available for this period." />
      </TrendChartFrame>
    );
  }

  const maxFluid = Math.max(
    ...data.flatMap((item) => [item.totalHydration, item.effectiveHydration, item.totalFluids]),
    1
  );
  const labelCadence = Math.max(1, Math.ceil(data.length / 7));
  const hydratedDays = data.filter((item) => item.totalHydration > 0).length;
  const lowestEffectiveDay = data.reduce(
    (currentLowest, item) =>
      item.effectiveHydration < currentLowest.effectiveHydration ? item : currentLowest,
    data[0]
  );
  const caffeineDays = data.filter((item) => item.caffeineMg > 0).length;
  const bristolLinkedDays = data.filter((item) => item.avgBristolScale !== null).length;

  return (
    <TrendChartFrame
      kicker="Hydration Overlay"
      title="Hydration River"
      description="Fluid volume, effective hydration, water-goal credit, and Bristol markers in one river view."
      metric={String(hydratedDays)}
      metricLabel="Logged days"
      legend={[
        { label: 'Total fluids', color: 'rgba(91,184,240,0.34)', variant: 'bar' },
        { label: 'Effective hydration', color: TREND_CHART_COLORS.blue, variant: 'bar' },
        { label: 'Bristol marker', color: TREND_CHART_COLORS.success, variant: 'dot' },
      ]}
      insight="Hydration becomes more useful when total fluids, effective hydration, caffeine, and stool form are read together."
    >
      <div className="chart-plot-area h-[318px] px-3 pb-12 pt-8">
        <div className="absolute inset-x-4 bottom-12 top-8 flex items-end justify-between gap-1.5">
          {data.map((item, index) => {
            const totalHeight = (item.totalFluids / maxFluid) * 100;
            const effectiveHeight = (item.effectiveHydration / maxFluid) * 100;
            const goalHeight = (item.totalHydration / maxFluid) * 100;
            const dateLabel = formatTrendDate(item.date);
            const bristolColor = getBristolColor(item.avgBristolScale);
            const bristolPosition =
              item.avgBristolScale === null
                ? 0
                : 100 - Math.min((item.avgBristolScale / 7) * 100, 100);

            return (
              <div key={item.date} className="group relative flex h-full flex-1 flex-col justify-end">
                {item.avgBristolScale !== null && (
                  <div
                    className="absolute left-1/2 z-[2] h-4 w-4 -translate-x-1/2 rounded-full border border-white/70 shadow-[0_0_22px_rgba(255,255,255,0.16)]"
                    style={{ top: `${bristolPosition}%`, backgroundColor: bristolColor }}
                  />
                )}

                <div className="relative h-full w-full">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-[18px] bg-[rgba(91,184,240,0.18)]"
                    style={{ height: `${Math.max(totalHeight, item.totalFluids > 0 ? 4 : 0)}%` }}
                  />
                  <div
                    className="absolute bottom-0 left-[18%] right-[18%] rounded-t-[18px] bg-[linear-gradient(180deg,var(--gw-brand-200),var(--gw-brand-600))] shadow-[0_0_24px_rgba(91,184,240,0.26)]"
                    style={{ height: `${Math.max(effectiveHeight, item.effectiveHydration > 0 ? 4 : 0)}%` }}
                  />
                  <div
                    className="absolute bottom-0 left-[34%] right-[34%] rounded-t-[18px] bg-[var(--gw-intelligence-300)] shadow-[0_0_24px_rgba(197,168,255,0.24)]"
                    style={{ height: `${Math.max(goalHeight, item.totalHydration > 0 ? 4 : 0)}%` }}
                  />
                </div>

                <div className="chart-tooltip absolute bottom-[calc(100%+14px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-2xl px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="font-semibold">{dateLabel}</p>
                  <p className="text-[var(--color-text-secondary)]">
                    {item.totalFluids}ml total fluids
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    {item.effectiveHydration}ml effective
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    {item.totalHydration}ml water goal
                  </p>
                  {item.caffeineMg > 0 && (
                    <p className="text-[var(--color-text-secondary)]">
                      {item.caffeineMg}mg caffeine
                    </p>
                  )}
                  {item.avgBristolScale !== null && (
                    <p className="text-[var(--color-text-secondary)]">
                      Bristol {item.avgBristolScale.toFixed(1)}
                    </p>
                  )}
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
            label: 'Lowest Effective',
            value: `${lowestEffectiveDay.effectiveHydration}ml`,
            helper: `${formatTrendDate(lowestEffectiveDay.date)} had the lowest effective hydration in this view.`,
            tone: lowestEffectiveDay.effectiveHydration === 0 ? 'warning' : 'blue',
          },
          {
            label: 'Caffeine Context',
            value: `${caffeineDays} day${caffeineDays === 1 ? '' : 's'}`,
            helper: 'Caffeine days can change how total fluid intake translates into effective hydration.',
            tone: caffeineDays > 0 ? 'daily' : 'success',
          },
          {
            label: 'Form Linked',
            value: `${bristolLinkedDays} day${bristolLinkedDays === 1 ? '' : 's'}`,
            helper: 'Days with both hydration and Bristol context are stronger comparison points.',
            tone: bristolLinkedDays > 0 ? 'major' : 'blue',
          },
        ]}
      />
    </TrendChartFrame>
  );
}
