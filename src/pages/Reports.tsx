import { useState, useEffect, type ReactNode } from 'react';
import {
  AlertCircle,
  Brain,
  Database,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import TrustExplainer from '../components/TrustExplainer';
import { useAuth } from '../contexts/AuthContext';
import DateRangeSelector from '../components/reports/DateRangeSelector';
import ExecutiveSummary from '../components/reports/ExecutiveSummary';
import BMAnalyticsSection from '../components/reports/BMAnalyticsSection';
import BristolDistributionSection from '../components/reports/BristolDistributionSection';
import SymptomProgressionSection from '../components/reports/SymptomProgressionSection';
import HealthMarkersSection from '../components/reports/HealthMarkersSection';
import TriggerPatternsSection from '../components/reports/TriggerPatternsSection';
import MedicationCorrelationSection from '../components/reports/MedicationCorrelationSection';
import ClinicalAlertsSection from '../components/reports/ClinicalAlertsSection';
import ObservedDataTable from '../components/reports/ObservedDataTable';
import PatternEvidenceSection from '../components/reports/PatternEvidenceSection';
import PatientNotesSection, {
  type PatientNoteValues,
} from '../components/reports/PatientNotesSection';
import {
  fetchReportInsightSummary,
  type ReportInsightSummary,
} from '../services/reportInsightsService';
import {
  fetchBMAnalytics,
  fetchBristolDistribution,
  fetchSymptomTrends,
  fetchHealthMarkerCorrelation,
  fetchTriggerPatterns,
  fetchMedicationCorrelation,
  generateClinicalAlerts,
  type BMAnalytics,
  type BristolDistribution,
  type SymptomTrend,
  type HealthMarkerCorrelation,
  type TriggerPattern,
  type MedicationCorrelation,
  type ClinicalAlert,
} from '../utils/clinicalReportQueries';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [bmAnalytics, setBmAnalytics] = useState<BMAnalytics | null>(null);
  const [bristolDistribution, setBristolDistribution] = useState<BristolDistribution[]>([]);
  const [symptomTrends, setSymptomTrends] = useState<SymptomTrend[]>([]);
  const [healthMarkers, setHealthMarkers] = useState<HealthMarkerCorrelation[]>([]);
  const [triggerPatterns, setTriggerPatterns] = useState<TriggerPattern[]>([]);
  const [medicationCorrelations, setMedicationCorrelations] = useState<MedicationCorrelation[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);
  const [reportInsights, setReportInsights] = useState<ReportInsightSummary | null>(null);
  const [patientNotes, setPatientNotes] = useState<PatientNoteValues>({
    whatChangedRecently: '',
    whatWorriesMeMost: '',
    whatIWantToAskMyDoctor: '',
  });

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, startDate, endDate]);

  const loadReportData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const dateRange = { startDate, endDate };

      const [
        analytics,
        distribution,
        trends,
        markers,
        triggers,
        medications,
        alerts,
        rankedPatternSummary,
      ] = await Promise.all([
        fetchBMAnalytics(user.id, dateRange),
        fetchBristolDistribution(user.id, dateRange),
        fetchSymptomTrends(user.id, dateRange),
        fetchHealthMarkerCorrelation(user.id, dateRange),
        fetchTriggerPatterns(user.id, dateRange),
        fetchMedicationCorrelation(user.id, dateRange),
        generateClinicalAlerts(user.id, dateRange),
        fetchReportInsightSummary(user.id, dateRange).catch((reportInsightError) => {
          console.error('Error loading ranked report insights:', reportInsightError);
          return null;
        }),
      ]);

      setBmAnalytics(analytics);
      setBristolDistribution(distribution);
      setSymptomTrends(trends);
      setHealthMarkers(markers);
      setTriggerPatterns(triggers);
      setMedicationCorrelations(medications);
      setClinicalAlerts(alerts);
      setReportInsights(rankedPatternSummary);
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatDateRange = () => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  const getDayCount = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getPrimaryConcerns = (): string[] => {
    const concerns: string[] = [];

    if (bmAnalytics) {
      if (bmAnalytics.averagePerDay > 6) {
        concerns.push(
          `Frequent bowel movements were recorded (${bmAnalytics.averagePerDay.toFixed(1)}/day) during this period`
        );
      } else if (bmAnalytics.averagePerDay < 1) {
        concerns.push(
          `Bowel movements were less frequent than usual (${bmAnalytics.averagePerDay.toFixed(1)}/day) during this period`
        );
      }
    }

    const normalBristol = bristolDistribution.filter((item) => item.type === 3 || item.type === 4);
    const normalPercentage = normalBristol.reduce((sum, item) => sum + item.percentage, 0);
    if (bristolDistribution.length > 0 && normalPercentage < 40) {
      concerns.push(
        `Only ${normalPercentage.toFixed(0)}% of logged stool entries fell in the middle Bristol range`
      );
    }

    const worseningSymptoms = symptomTrends.filter((trend) => {
      const symptomData = symptomTrends
        .filter((item) => item.symptomType === trend.symptomType)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (symptomData.length < 2) return false;
      const first = symptomData[0].avgSeverity;
      const last = symptomData[symptomData.length - 1].avgSeverity;
      return last - first > 1;
    });

    if (worseningSymptoms.length > 0) {
      const uniqueSymptoms = Array.from(new Set(worseningSymptoms.map((item) => item.symptomType)));
      concerns.push(`Symptoms trended upward over time for: ${uniqueSymptoms.join(', ')}`);
    }

    if (triggerPatterns.length > 0) {
      const highRiskTriggers = triggerPatterns.filter((trigger) => trigger.correlationStrength > 0.6);
      if (highRiskTriggers.length > 0) {
        concerns.push(
          `Repeated food-related patterns appeared around: ${highRiskTriggers
            .map((trigger) => trigger.trigger)
            .slice(0, 3)
            .join(', ')}`
        );
      }
    }

    return concerns;
  };

  const primaryConcerns = getPrimaryConcerns();
  const reviewFlagCount = clinicalAlerts.length + primaryConcerns.length;
  const dayCount = getDayCount();
  const reportReady = Boolean(bmAnalytics);
  const rankedPatternCount = reportInsights?.explanationBundle.items.length ?? 0;
  const missingLogTypeCount = reportInsights?.missing_log_types.length ?? 0;

  const observedDataRows = bmAnalytics
    ? [
        {
          label: 'Tracked period',
          value: `${dayCount} days`,
          note: formatDateRange(),
        },
        {
          label: 'Total stool logs',
          value: String(bmAnalytics.totalCount),
          note: 'Patient-reported',
        },
        {
          label: 'Average bowel movements per day',
          value: bmAnalytics.averagePerDay.toFixed(1),
          note: 'Observed average',
        },
        {
          label: 'Average bowel movements per week',
          value: bmAnalytics.averagePerWeek.toFixed(1),
          note: 'Observed average',
        },
        {
          label: 'Review flags',
          value: String(clinicalAlerts.length),
          note: clinicalAlerts.length > 0 ? 'See flags below' : 'None in this range',
        },
        {
          label: 'Repeated patterns highlighted',
          value: String(primaryConcerns.length),
          note: primaryConcerns.length > 0 ? 'Summarized below' : 'None highlighted',
        },
      ]
    : [];

  return (
    <MainLayout>
      <div className="relative min-h-screen overflow-hidden pb-12 print:bg-white print:pb-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[26rem] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(139,92,246,0.09)_0%,rgba(91,184,240,0.035)_42%,transparent_76%)] print:hidden" />

        <div className="relative z-10 mx-auto max-w-7xl print:p-8">
          <section className="page-enter clinical-panel mb-6 p-5 sm:p-6 lg:p-7 print:hidden">
            <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <span className="clinical-chip clinical-chip-intelligence mb-4">
                  <FileText className="h-3.5 w-3.5" />
                  Clinical report
                </span>
                <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-4xl lg:text-5xl">
                  Build a clinical summary
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
                  Build a non-diagnostic summary that leads with observed data, highlights review
                  flags, preserves pattern evidence, and gives you a focused appointment narrative.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <HeroPill icon={<ShieldCheck className="h-4 w-4" />} label="Non-diagnostic" />
                  <HeroPill icon={<Database className="h-4 w-4" />} label="Observed data first" />
                  <HeroPill icon={<Brain className="h-4 w-4" />} label="Pattern evidence" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <HeroMetric label="Coverage" value={`${dayCount}d`} helper={formatDateRange()} />
                <HeroMetric
                  label="Review Items"
                  value={`${reviewFlagCount}`}
                  helper={reviewFlagCount > 0 ? 'Clinician discussion prompts' : 'No major flags'}
                />
                <HeroMetric
                  label="Patterns"
                  value={`${rankedPatternCount}`}
                  helper="Ranked evidence cards"
                />
                <HeroMetric
                  label="Readiness"
                  value={reportReady ? 'Ready' : 'Needs logs'}
                  helper={missingLogTypeCount > 0 ? `${missingLogTypeCount} context gaps` : 'Exportable summary'}
                />
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={handlePrint}
                className="flex items-center gap-2 text-sm"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button onClick={handleExportPDF} className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </section>

          <div className="mb-6 print:hidden">
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          <div className="mb-6 print:hidden">
            <TrustExplainer variant="reports" />
          </div>

          <div className="mb-8 hidden print:block">
            <div className="mb-6 border-b-2 border-gray-900 pb-5">
              <div className="mb-1 flex items-center gap-3">
                <FileText className="h-7 w-7 text-gray-900" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Digestive Health Summary Report
                </h1>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Patient-reported data - for clinical review purposes only
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Generated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {' | '}Coverage: {formatDateRange()} ({dayCount} days)
              </p>
            </div>
          </div>

          {loading && (
            <section className="clinical-card flex h-80 flex-col items-center justify-center gap-4">
              <div className="insight-orb">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
              <p className="text-sm text-[var(--color-text-tertiary)]">Compiling report data...</p>
            </section>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-[24px] border border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.08)] p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-danger)]" />
              <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
            </div>
          )}

          {!loading && !error && !bmAnalytics && (
            <section className="clinical-card px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="insight-orb mx-auto mb-6">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <p className="mb-2 text-xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
                No reportable data found
              </p>
              <p className="mx-auto max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">
                Reports need at least one bowel movement log inside the selected range. Adjust the
                dates or continue logging to generate a clinical summary.
              </p>
            </section>
          )}

          {!loading && !error && bmAnalytics && (
            <>
              <section className="mb-5 grid gap-4 print:hidden lg:grid-cols-[1.1fr_0.9fr]">
                <div className="clinical-card p-5">
                  <span className="clinical-chip clinical-chip-intelligence mb-4">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Briefing Standard
                  </span>
                  <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                    Lead with observed data, then use review flags, ranked evidence, and patient
                    notes to guide a focused clinical conversation. GutWise summarizes
                    patient-reported logs and does not diagnose conditions.
                  </p>
                </div>

                <div className="clinical-card p-5">
                  <p className="data-kicker">Generated</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Export output uses the selected date range and preserves clinical disclaimer
                    language.
                  </p>
                </div>
              </section>

              <SectionGroupLabel label="Summary" accent />

              <ExecutiveSummary
                dateRange={formatDateRange()}
                dayCount={dayCount}
                totalBMs={bmAnalytics.totalCount}
                avgPerDay={bmAnalytics.averagePerDay}
                avgPerWeek={bmAnalytics.averagePerWeek}
                criticalAlerts={clinicalAlerts.filter(
                  (alert) => alert.severity === 'critical' || alert.severity === 'high'
                )}
                primaryConcerns={primaryConcerns}
              />

              <ObservedDataTable rows={observedDataRows} />

              <ClinicalAlertsSection alerts={clinicalAlerts} />

              {reportInsights && (
                <PatternEvidenceSection
                  bundle={reportInsights.explanationBundle}
                  missingLogTypes={reportInsights.missing_log_types}
                  evidenceGapSummaries={reportInsights.evidence_gap_summaries}
                />
              )}

              <SectionGroupLabel label="Supporting Detail" />

              <BMAnalyticsSection analytics={bmAnalytics} />
              <BristolDistributionSection distribution={bristolDistribution} />
              <SymptomProgressionSection trends={symptomTrends} />
              <HealthMarkersSection correlations={healthMarkers} />
              <TriggerPatternsSection triggers={triggerPatterns} />
              <MedicationCorrelationSection correlations={medicationCorrelations} />

              <SectionGroupLabel label="Patient Perspective" />

              <PatientNotesSection value={patientNotes} onChange={setPatientNotes} />

              <section className="clinical-card mt-6 p-5 print:mt-10 print:border-gray-300 print:bg-white print:p-6">
                <div className="mb-5 flex items-center gap-2 border-b border-[rgba(197,168,255,0.12)] pb-4 print:border-gray-200">
                  <MessageSquare className="h-4 w-4 text-[var(--gw-intelligence-300)] print:text-gray-700" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gw-intelligence-300)] print:text-gray-500">
                    Appointment Prep
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AppointmentPrepCard
                    title="Start with change over time"
                    body="Review what changed across the selected period before narrowing into one-off symptoms or meals."
                  />
                  <AppointmentPrepCard
                    title="Confirm the highest-priority concern"
                    body="Use your notes section to make sure the most disruptive symptom or question is addressed first."
                  />
                  <AppointmentPrepCard
                    title="Validate likely triggers"
                    body="Treat food or medication correlations as patterns to investigate, not direct proof of cause."
                  />
                  <AppointmentPrepCard
                    title="Decide the next logging window"
                    body="If the picture is still unclear, keep logging through the next 2-4 weeks to strengthen comparisons."
                  />
                </div>
              </section>

              <div className="mt-4 rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-4 py-3 print:mt-6 print:border-gray-200 print:bg-gray-50">
                <p className="text-xs leading-5 text-[var(--color-text-secondary)] print:text-gray-700">
                  Patient-reported summary for clinical discussion only. This report does not
                  provide diagnosis or treatment recommendations.
                </p>
              </div>

              <div className="mt-6 pb-4 text-center text-xs text-[var(--color-text-tertiary)] print:mt-10 print:text-gray-500">
                <p>End of report | {formatDateRange()}</p>
              </div>
            </>
          )}
        </div>

        <style>{`
          @media print {
            body {
              background: white;
            }

            .print\\:hidden {
              display: none !important;
            }

            .print\\:block {
              display: block !important;
            }

            .print\\:p-8 {
              padding: 2rem !important;
            }

            .print\\:mt-10 {
              margin-top: 2.5rem !important;
            }

            .print\\:mt-6 {
              margin-top: 1.5rem !important;
            }

            @page {
              margin: 0.75in;
              size: letter;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .page-break {
              page-break-before: always;
            }
          }
        `}</style>
      </div>
    </MainLayout>
  );
}

function HeroPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="clinical-chip">
      <span className="text-[var(--gw-intelligence-300)]">{icon}</span>
      {label}
    </span>
  );
}

function HeroMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="clinical-card p-4">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-2 text-[2.15rem]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}

function SectionGroupLabel({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-3 px-0.5 print:hidden">
      <span
        className={`flex-shrink-0 text-xs font-semibold uppercase tracking-[0.18em] ${
          accent ? 'text-[var(--gw-intelligence-300)]' : 'text-[var(--color-text-tertiary)]'
        }`}
      >
        {label}
      </span>
      <div
        className={`h-px flex-1 ${
          accent ? 'bg-[rgba(197,168,255,0.28)]' : 'bg-[rgba(197,168,255,0.12)]'
        }`}
      />
    </div>
  );
}

function AppointmentPrepCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4 print:border-gray-200 print:bg-gray-50">
      <p className="mb-1 text-sm font-semibold text-[var(--color-text-primary)] print:text-gray-900">
        {title}
      </p>
      <p className="text-xs leading-5 text-[var(--color-text-secondary)] print:text-gray-700">
        {body}
      </p>
    </div>
  );
}
