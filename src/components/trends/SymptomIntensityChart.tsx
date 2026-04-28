import type { SymptomTrend } from '../../hooks/useTrendsData';
import {
  ChartEmptyState,
  formatTrendDate,
  TREND_CHART_COLORS,
  TrendAnnotationRail,
  TrendChartFrame,
} from './TrendChartFrame';

interface SymptomIntensityChartProps {
  data: SymptomTrend[];
}

const symptomColors: Record<string, string> = {
  bloating: TREND_CHART_COLORS.primary,
  cramping: TREND_CHART_COLORS.rose,
  nausea: TREND_CHART_COLORS.success,
  fatigue: TREND_CHART_COLORS.warning,
  headache: TREND_CHART_COLORS.major,
  diarrhea: TREND_CHART_COLORS.danger,
  constipation: TREND_CHART_COLORS.blue,
  default: TREND_CHART_COLORS.muted,
};

function getSymptomColor(symptom: string): string {
  return symptomColors[symptom.toLowerCase()] ?? symptomColors.default;
}

export default function SymptomIntensityChart({ data }: SymptomIntensityChartProps) {
  if (data.length === 0) {
    return (
      <TrendChartFrame
        kicker="Symptom Signals"
        title="Symptom Intensity Over Time"
        description="Average symptom severity by day and symptom type."
      >
        <ChartEmptyState message="No symptom data is available for this period." />
      </TrendChartFrame>
    );
  }

  const symptomTypes = Array.from(new Set(data.map((item) => item.symptomType)));
  const dates = Array.from(new Set(data.map((item) => item.date))).sort();
  const labelCadence = Math.max(1, Math.ceil(dates.length / 8));

  const symptomDataMap = new Map<string, Map<string, number>>();
  data.forEach((item) => {
    if (!symptomDataMap.has(item.symptomType)) {
      symptomDataMap.set(item.symptomType, new Map());
    }
    symptomDataMap.get(item.symptomType)!.set(item.date, item.avgSeverity);
  });

  const avgSeverity =
    data.reduce((sum, item) => sum + item.avgSeverity, 0) / Math.max(data.length, 1);
  const peak = data.reduce(
    (currentPeak, item) => (item.avgSeverity > currentPeak.avgSeverity ? item : currentPeak),
    data[0]
  );
  const highSeverityRecords = data.filter((item) => item.avgSeverity >= 7).length;
  const mostFrequentSymptom = symptomTypes
    .map((symptom) => ({
      symptom,
      days: symptomDataMap.get(symptom)?.size ?? 0,
    }))
    .sort((left, right) => right.days - left.days)[0];

  return (
    <TrendChartFrame
      kicker="Symptom Signals"
      title="Symptom Heatmap"
      description="A pressure map makes repeated symptom timing easier to scan than overlapping lines."
      metric={avgSeverity.toFixed(1)}
      metricLabel="Avg severity"
      legend={symptomTypes.map((symptom) => ({
        label: symptom,
        color: getSymptomColor(symptom),
        variant: 'dot',
      }))}
      insight={`Peak signal: ${peak.symptomType} at ${peak.avgSeverity.toFixed(1)}/10 on ${formatTrendDate(peak.date)}.`}
    >
      <div className="chart-plot-area overflow-x-auto px-4 py-5">
        <div className="min-w-[720px] space-y-3">
          {symptomTypes.map((symptom) => {
            const color = getSymptomColor(symptom);
            const symptomData = symptomDataMap.get(symptom)!;
            const average =
              Array.from(symptomData.values()).reduce((sum, value) => sum + value, 0) /
              Math.max(symptomData.size, 1);

            return (
              <div
                key={symptom}
                className="grid grid-cols-[128px_minmax(0,1fr)_64px] items-center gap-3"
              >
                <div>
                  <p className="text-sm font-semibold capitalize text-[var(--color-text-primary)]">
                    {symptom}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">
                    Avg {average.toFixed(1)}
                  </p>
                </div>

                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(12px, 1fr))` }}>
                  {dates.map((date) => {
                    const severity = symptomData.get(date) ?? 0;
                    const active = severity > 0;

                    return (
                      <div
                        key={`${symptom}-${date}`}
                        className="group relative h-10 rounded-[12px] border border-white/8 bg-white/[0.025]"
                      >
                        <div
                          className="absolute inset-0 transition-smooth group-hover:opacity-100"
                          style={{
                            background: active
                              ? `radial-gradient(circle at 50% 22%, rgba(255,255,255,0.28), transparent 24%), ${color}`
                              : 'rgba(255,255,255,0.02)',
                            opacity: active ? Math.max(0.22, severity / 10) : 1,
                          }}
                        />

                        {severity >= 7 && (
                          <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/45" />
                        )}

                        <div className="chart-tooltip absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-2xl px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="font-semibold capitalize">{symptom}</p>
                          <p className="text-[var(--color-text-secondary)]">
                            {formatTrendDate(date)}: {severity ? severity.toFixed(1) : '0.0'}/10
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {Math.max(...Array.from(symptomData.values())).toFixed(1)}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">Peak</p>
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-[128px_minmax(0,1fr)_64px] items-center gap-3 pt-1">
            <span />
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(12px, 1fr))` }}>
              {dates.map((date, index) => (
                <span key={date} className="chart-axis-label text-center">
                  {index % labelCadence === 0 ? formatTrendDate(date) : ''}
                </span>
              ))}
            </div>
            <span />
          </div>
        </div>

        <TrendAnnotationRail
          annotations={[
            {
              label: 'Peak Pressure',
              value: `${peak.avgSeverity.toFixed(1)}/10`,
              helper: `${peak.symptomType} peaked on ${formatTrendDate(peak.date)}.`,
              tone: peak.avgSeverity >= 7 ? 'rose' : 'daily',
            },
            {
              label: 'High-Severity Cells',
              value: String(highSeverityRecords),
              helper: 'Cells at 7/10 or higher deserve comparison against food, sleep, stress, and hydration.',
              tone: highSeverityRecords > 0 ? 'warning' : 'success',
            },
            {
              label: 'Most Repeated',
              value: mostFrequentSymptom?.symptom ?? 'Open',
              helper: `${mostFrequentSymptom?.days ?? 0} day${mostFrequentSymptom?.days === 1 ? '' : 's'} with this symptom recorded.`,
              tone: 'major',
            },
          ]}
        />
      </div>
    </TrendChartFrame>
  );
}
