import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  MapPin,
  Pencil,
  Save,
  Sparkles,
} from 'lucide-react';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import {
  LogHistoryActions,
  LogHistoryGroup,
  LogHistoryNoMatches,
  LogHistoryToolbar,
} from '../components/LogHistoryTools';
import { useLogCrud } from '../hooks/useLogCrud';
import {
  buildLogHistorySearchText,
  formatLogHistoryTime,
  groupLogHistoryByDay,
  matchesLogHistoryQuery,
} from '../utils/logHistoryDisplay';

interface SymptomsFormData {
  id?: string;
  logged_at: string;
  symptom_type: string;
  severity: number;
  duration_minutes: number;
  location: string;
  triggers: string[];
  notes: string;
}

const commonSymptoms = [
  'Abdominal Pain',
  'Bloating',
  'Nausea',
  'Cramping',
  'Gas',
  'Headache',
  'Fatigue',
  'Dizziness',
];

const commonTriggers = [
  'Food',
  'Stress',
  'Lack of Sleep',
  'Exercise',
  'Weather',
  'Medication',
  'Dehydration',
];

function hasContextDetails(formData: SymptomsFormData) {
  return (
    formData.location.trim().length > 0 ||
    formData.triggers.length > 0 ||
    formData.notes.trim().length > 0
  );
}

function getSeverityLabel(severity: number) {
  if (severity <= 3) return 'Mild signal';
  if (severity <= 6) return 'Moderate signal';
  if (severity <= 8) return 'High signal';
  return 'Major signal';
}

export default function SymptomsLog() {
  const [customSymptom, setCustomSymptom] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');

  const {
    formData,
    setFormData,
    history,
    showHistory,
    setShowHistory,
    editingId,
    saving,
    message,
    toastVisible,
    error,
    dismissToast,
    handleSubmit,
    handleEdit,
    handleUseAsTemplate,
    handleSaveAsRoutine,
    handleDelete,
    resetForm: baseResetForm,
  } = useLogCrud<SymptomsFormData>({
    table: 'symptom_logs',
    logType: 'symptoms',
    defaultValues: {
      symptom_type: '',
      severity: 5,
      duration_minutes: 30,
      location: '',
      triggers: [],
      notes: '',
    },
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      symptom_type: data.symptom_type,
      severity: data.severity,
      duration_minutes: data.duration_minutes,
      location: data.location,
      triggers: data.triggers,
      notes: data.notes,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      symptom_type: data.symptom_type,
      severity: data.severity,
      duration_minutes: data.duration_minutes,
      location: data.location,
      triggers: data.triggers,
      notes: data.notes,
    }),
  });

  useEffect(() => {
    if (editingId && hasContextDetails(formData)) {
      setShowContext(true);
    }
  }, [editingId, formData]);

  const resetForm = () => {
    baseResetForm();
    setCustomSymptom('');
    setShowContext(false);
  };

  const toggleTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.includes(trigger)
        ? formData.triggers.filter((item) => item !== trigger)
        : [...formData.triggers, trigger],
    });
  };

  const filteredHistory = history.filter((log) =>
    matchesLogHistoryQuery(
      buildLogHistorySearchText(
        log.logged_at,
        log.symptom_type,
        log.severity,
        log.duration_minutes,
        log.location,
        log.triggers,
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);

  return (
    <LogPageShell
      title="Symptom Signal Capture"
      subtitle="Capture the symptom and intensity first. Add location, triggers, and notes only when they help explain the pattern."
      eyebrow="Symptom Intelligence Capture"
      icon={<AlertCircle className="h-3.5 w-3.5" />}
      maxWidth="7xl"
      message={message}
      toastVisible={toastVisible}
      onDismissToast={dismissToast}
      error={error}
    >
      <LogModeTabs
        showHistory={showHistory}
        onShowNew={() => setShowHistory(false)}
        onShowHistory={() => setShowHistory(true)}
        newIcon={<Activity className="mr-2 h-4 w-4" />}
        historyIcon={<Clock className="mr-2 h-4 w-4" />}
        newLabel={editingId ? 'Edit Entry' : 'New Entry'}
      />

      {!showHistory ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {editingId && <EditingBanner label="Editing symptom entry" onCancel={resetForm} />}

          <div className="grid gap-5 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="log-input-shell p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="signal-badge signal-badge-major mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Symptom Console
                  </span>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    What changed in your body?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Pick the closest symptom, then grade intensity and duration. This creates a
                    clean event for correlations with food, hydration, bowel output, sleep, and
                    medication.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] px-4 py-3">
                  <p className="data-kicker">Current signal</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {formData.symptom_type || 'No symptom selected'}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="data-kicker">Symptom Type</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Choose the closest match or enter a custom symptom.
                    </p>
                  </div>
                  {formData.symptom_type && (
                    <span className="signal-badge signal-badge-daily">
                      Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => setFormData({ ...formData, symptom_type: symptom })}
                      className={[
                        'rounded-[22px] border px-3 py-4 text-sm font-semibold transition-smooth',
                        formData.symptom_type === symptom
                          ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                          : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                      ].join(' ')}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={(event) => setCustomSymptom(event.target.value)}
                    placeholder="Or enter a custom symptom..."
                    className="input-base flex-1"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (!customSymptom.trim()) return;
                      setFormData({ ...formData, symptom_type: customSymptom.trim() });
                      setCustomSymptom('');
                    }}
                  >
                    Set
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 sm:p-5">
                  <label className="field-label mb-2 block">
                    Severity:{' '}
                    <span className="font-semibold text-[var(--gw-intelligence-200)]">
                      {formData.severity}/10
                    </span>
                  </label>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formData.severity}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        severity: parseInt(event.target.value, 10),
                      })
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--gw-intelligence-400)]"
                  />

                  <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>

                <label className="rounded-[28px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4 sm:p-5">
                  <span className="field-label mb-2 block">Duration (minutes)</span>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        duration_minutes: Math.max(1, parseInt(event.target.value, 10) || 1),
                      })
                    }
                    className="input-base w-full"
                    min="1"
                    required
                  />
                </label>
              </div>
            </section>

            <aside className="signal-card signal-card-major h-fit p-5 sm:p-6 xl:sticky xl:top-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Symptom Signal</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    {getSeverityLabel(formData.severity)}
                  </h2>
                </div>
                <div className="insight-orb">
                  <Gauge className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="logged_at" className="block">
                  <span className="field-label mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Logged At
                  </span>
                  <input
                    type="datetime-local"
                    id="logged_at"
                    value={formData.logged_at}
                    onChange={(event) =>
                      setFormData({ ...formData, logged_at: event.target.value })
                    }
                    className="input-base w-full"
                    required
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <SummaryMetric label="Severity" value={`${formData.severity}/10`} />
                  <SummaryMetric label="Duration" value={`${formData.duration_minutes}m`} />
                </div>

                <div className="rounded-2xl border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
                  <p className="data-kicker">Context standard</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Add triggers when they are plausible, not just available. GutWise needs signal,
                    not noise.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={saving || !formData.symptom_type}
                  size="lg"
                  className="w-full"
                >
                  <Save className="mr-2 inline h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Symptom Signal'}
                </Button>

                {editingId && (
                  <Button type="button" variant="secondary" size="lg" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </aside>
          </div>

          <section className="rounded-[28px] border border-[rgba(197,168,255,0.14)] bg-white/[0.026] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => setShowContext(!showContext)}
              className="flex w-full items-center justify-between gap-4 py-1 text-left transition-smooth hover:text-[var(--color-text-primary)]"
            >
              <span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Optional symptom context
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  location, triggers, notes
                </span>
              </span>

              {showContext ? (
                <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </button>

            {showContext && (
              <div className="mt-5 space-y-6 border-t border-white/8 pt-5">
                <label htmlFor="location" className="block">
                  <span className="field-label mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </span>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                    placeholder="e.g. Lower abdomen, head, left side..."
                    className="input-base w-full"
                  />
                </label>

                <div>
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <label className="field-label block">Potential Triggers</label>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      Select only likely context.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {commonTriggers.map((trigger) => (
                      <button
                        key={trigger}
                        type="button"
                        onClick={() => toggleTrigger(trigger)}
                        className={[
                          'rounded-[20px] border px-3 py-3 text-sm font-semibold transition-smooth',
                          formData.triggers.includes(trigger)
                            ? 'border-[rgba(197,168,255,0.26)] bg-[rgba(139,92,246,0.12)] text-[var(--gw-intelligence-300)]'
                            : 'border-white/10 bg-white/[0.026] text-[var(--color-text-tertiary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045] hover:text-[var(--color-text-secondary)]',
                        ].join(' ')}
                      >
                        {trigger}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="field-label mb-2 block">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                    rows={4}
                    placeholder="Additional observations..."
                    className="input-base min-h-[112px] w-full resize-none"
                  />
                </div>
              </div>
            )}
          </section>
        </form>
      ) : (
        <section className="surface-panel rounded-[32px] p-5 sm:p-6">
          {history.length === 0 ? (
            <EmptyState
              category="symptoms"
              icon={<AlertCircle className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search symptoms, triggers, notes..."
              />

              {filteredHistory.length === 0 ? (
                <LogHistoryNoMatches query={historyQuery} onClear={() => setHistoryQuery('')} />
              ) : (
                <div className="space-y-5">
                  {groupedHistory.map((group) => (
                    <LogHistoryGroup key={group.key} label={group.label} count={group.entries.length}>
                      {group.entries.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-[24px] border border-[rgba(197,168,255,0.13)] bg-white/[0.035] p-4 transition-smooth hover:border-[rgba(197,168,255,0.22)] hover:bg-white/[0.05]"
                        >
                          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                                {formatLogHistoryTime(log.logged_at)}
                              </div>
                              <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                                {log.symptom_type}
                              </div>
                            </div>

                            <LogHistoryActions
                              onUseAsTemplate={() =>
                                handleUseAsTemplate(log as SymptomsFormData & { id: string })
                              }
                              onSaveAsRoutine={() =>
                                handleSaveAsRoutine(log as SymptomsFormData & { id: string })
                              }
                              onEdit={() => handleEdit(log as SymptomsFormData & { id: string })}
                              onDelete={() => handleDelete(log.id!)}
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <MetricChip label="Severity" value={`${log.severity}/10`} />
                            <MetricChip label="Duration" value={`${log.duration_minutes} min`} />
                          </div>

                          {log.location && (
                            <div className="mt-3 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                              <span className="font-semibold text-[var(--color-text-primary)]">
                                Location:
                              </span>{' '}
                              {log.location}
                            </div>
                          )}

                          {log.triggers?.length > 0 && (
                            <div className="mt-3">
                              <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                                Triggers
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {log.triggers.map((trigger, idx) => (
                                  <Badge key={`${trigger}-${idx}`} label={trigger} />
                                ))}
                              </div>
                            </div>
                          )}

                          {log.notes && (
                            <div className="mt-3 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                              {log.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </LogHistoryGroup>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </LogPageShell>
  );
}

function EditingBanner({ label, onCancel }: { label: string; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[rgba(91,184,240,0.22)] bg-[rgba(91,184,240,0.09)] px-4 py-3.5">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--gw-brand-300)]">
        <Pencil className="h-4 w-4" />
        <span>{label}</span>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-text-primary)]"
      >
        Cancel
      </button>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-2 text-[2.25rem]">{value}</p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <div className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.1)] px-2.5 py-1 text-xs font-semibold text-[var(--gw-intelligence-300)]">
      <AlertCircle className="mr-1 h-3 w-3" />
      {label}
    </span>
  );
}
