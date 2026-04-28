import { useEffect, useState } from 'react';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  Moon,
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
  groupLogHistoryByDay,
  matchesLogHistoryQuery,
} from '../utils/logHistoryDisplay';
import { formatDateTime } from '../utils/dateFormatters';

interface SleepFormData {
  logged_at: string;
  sleep_start: string;
  sleep_end: string;
  quality: number;
  interruptions: number;
  felt_rested: boolean;
  notes: string;
  duration_minutes?: number;
}

function calculateDurationMinutes(startValue: string, endValue: string): number | null {
  if (!startValue || !endValue) return null;

  const start = new Date(startValue);
  const end = new Date(endValue);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) return null;
  return Math.round(diff / (1000 * 60));
}

function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '0h 0m';

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
}

function hasSleepDetails(formData: SleepFormData): boolean {
  return formData.interruptions > 0 || formData.felt_rested || formData.notes.trim().length > 0;
}

export default function SleepLog() {
  const [showDetails, setShowDetails] = useState(false);
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
    resetForm,
  } = useLogCrud<SleepFormData>({
    table: 'sleep_logs' as const,
    logType: 'sleep' as const,
    defaultValues: {
      sleep_start: '' as const,
      sleep_end: '' as const,
      quality: 5,
      interruptions: 0,
      felt_rested: false,
      notes: '' as const,
    },
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      sleep_start: data.sleep_start,
      sleep_end: data.sleep_end,
      quality: data.quality,
      interruptions: data.interruptions,
      felt_rested: data.felt_rested,
      notes: data.notes || null,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      sleep_start: data.sleep_start,
      sleep_end: data.sleep_end,
      quality: data.quality,
      interruptions: data.interruptions,
      felt_rested: data.felt_rested,
      notes: data.notes || null,
    }),
    mapTemplateToForm: (log, defaultFormData) => ({
      logged_at: defaultFormData.logged_at,
      sleep_start: '',
      sleep_end: '',
      quality: log.quality,
      interruptions: log.interruptions,
      felt_rested: log.felt_rested,
      notes: log.notes ?? '',
    }),
  });

  useEffect(() => {
    if (editingId && hasSleepDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId, formData]);

  const durationMinutes = calculateDurationMinutes(formData.sleep_start, formData.sleep_end);
  const sleepWindowComplete = Boolean(formData.sleep_start && formData.sleep_end);
  const sleepWindowInvalid = sleepWindowComplete && durationMinutes === null;

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.sleep_start || !formData.sleep_end) return;
    if (durationMinutes === null) return;

    await handleSubmit(event);
  };

  const handleReset = () => {
    resetForm();
    setShowDetails(false);
  };

  const filteredHistory = history.filter((log) =>
    matchesLogHistoryQuery(
      buildLogHistorySearchText(
        log.logged_at,
        log.sleep_start,
        log.sleep_end,
        log.duration_minutes,
        log.quality,
        log.interruptions,
        log.felt_rested ? 'rested refreshed' : 'not rested tired',
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(
    filteredHistory,
    (log) => log.sleep_start || log.logged_at
  );

  return (
    <LogPageShell
      title="Sleep Recovery Capture"
      subtitle="Capture sleep window, quality, interruptions, and subjective recovery so rest can be compared against gut symptoms, stress, hydration, food, and medication timing."
      eyebrow="Recovery Intelligence Capture"
      icon={<Moon className="h-3.5 w-3.5" />}
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
        <form onSubmit={handleFormSubmit} className="space-y-5">
          {editingId && <EditingBanner label="Editing sleep entry" onCancel={handleReset} />}

          <div className="grid gap-5 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="log-input-shell p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="signal-badge signal-badge-major mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sleep Window Console
                  </span>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    When did recovery happen?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Log the sleep window first, then rate quality. Optional details capture whether
                    the sleep actually restored you.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] px-4 py-3">
                  <p className="data-kicker">Calculated duration</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {formatDuration(durationMinutes)}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <label
                  htmlFor="sleep_start"
                  className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-4 sm:p-5"
                >
                  <span className="field-label mb-2 flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Bedtime
                  </span>
                  <input
                    type="datetime-local"
                    id="sleep_start"
                    value={formData.sleep_start}
                    onChange={(event) =>
                      setFormData({ ...formData, sleep_start: event.target.value })
                    }
                    className="input-base w-full"
                    required
                  />
                </label>

                <label
                  htmlFor="sleep_end"
                  className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-4 sm:p-5"
                >
                  <span className="field-label mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Wake Time
                  </span>
                  <input
                    type="datetime-local"
                    id="sleep_end"
                    value={formData.sleep_end}
                    onChange={(event) =>
                      setFormData({ ...formData, sleep_end: event.target.value })
                    }
                    className="input-base w-full"
                    required
                  />
                </label>
              </div>

              {sleepWindowInvalid && (
                <div className="mt-4 rounded-[20px] border border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.09)] px-4 py-3 text-sm text-[var(--color-danger)]">
                  Wake time must be after bedtime before this entry can be saved.
                </div>
              )}

              <div className="mt-5 rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 sm:p-5">
                <SliderField
                  label="Sleep Quality"
                  value={formData.quality}
                  max={10}
                  low="Poor"
                  high="Excellent"
                  onChange={(value) => setFormData({ ...formData, quality: value })}
                />
              </div>
            </section>

            <aside className="signal-card signal-card-major h-fit p-5 sm:p-6 xl:sticky xl:top-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Recovery Signal</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    {formatDuration(durationMinutes)}
                  </h2>
                </div>
                <div className="insight-orb">
                  <Gauge className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
                  <p className="data-kicker">Logged At</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Sleep entries use the bedtime and wake time as their primary window. The
                    standard log timestamp remains available in the record for ordering.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <SummaryMetric label="Quality" value={`${formData.quality}/10`} />
                  <SummaryMetric label="Interruptions" value={`${formData.interruptions}`} />
                </div>

                <div className="rounded-2xl border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
                  <p className="data-kicker">Rested read</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {formData.felt_rested
                      ? 'You marked this sleep as restorative.'
                      : 'Rested status is not marked yet.'}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={saving || !formData.sleep_start || !formData.sleep_end || sleepWindowInvalid}
                  size="lg"
                  className="w-full"
                >
                  <Save className="mr-2 inline h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Sleep Signal'}
                </Button>

                {editingId && (
                  <Button type="button" variant="secondary" size="lg" onClick={handleReset}>
                    Cancel
                  </Button>
                )}
              </div>
            </aside>
          </div>

          <section className="rounded-[28px] border border-[rgba(197,168,255,0.14)] bg-white/[0.026] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between gap-4 py-1 text-left transition-smooth hover:text-[var(--color-text-primary)]"
            >
              <span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Optional recovery detail
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  interruptions, rested status, notes
                </span>
              </span>

              {showDetails ? (
                <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </button>

            {showDetails && (
              <div className="mt-5 grid gap-6 border-t border-white/8 pt-5 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="space-y-4">
                  <label
                    htmlFor="interruptions"
                    className="block rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4"
                  >
                    <span className="field-label mb-2 block">Number of Interruptions</span>
                    <input
                      type="number"
                      id="interruptions"
                      value={formData.interruptions}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          interruptions: parseInt(event.target.value, 10) || 0,
                        })
                      }
                      className="input-base w-full"
                      min="0"
                      required
                    />
                  </label>

                  <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                          Felt Rested Upon Waking
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                          Subjective recovery often explains symptom patterns better than duration
                          alone.
                        </p>
                      </div>
                      <ToggleSwitch
                        active={formData.felt_rested}
                        onToggle={() =>
                          setFormData({ ...formData, felt_rested: !formData.felt_rested })
                        }
                      />
                    </div>
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
                    className="input-base min-h-[168px] w-full resize-none"
                    rows={6}
                    placeholder="Dreams, sleep environment, late meals, symptoms, awakenings, or medication timing..."
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
              category="sleep"
              icon={<Moon className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search sleep quality, duration, notes..."
              />

              {filteredHistory.length === 0 ? (
                <LogHistoryNoMatches query={historyQuery} onClear={() => setHistoryQuery('')} />
              ) : (
                <div className="space-y-5">
                  {groupedHistory.map((group) => (
                    <LogHistoryGroup key={group.key} label={group.label} count={group.entries.length}>
                      {group.entries.map((log) => {
                        const duration =
                          typeof log.duration_minutes === 'number'
                            ? formatDuration(log.duration_minutes)
                            : formatDuration(calculateDurationMinutes(log.sleep_start, log.sleep_end));

                        return (
                          <div
                            key={log.id}
                            className="rounded-[24px] border border-[rgba(197,168,255,0.13)] bg-white/[0.035] p-4 transition-smooth hover:border-[rgba(197,168,255,0.22)] hover:bg-white/[0.05]"
                          >
                            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                                  {formatDateTime(log.sleep_start)} to {formatDateTime(log.sleep_end)}
                                </div>
                                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                                  Duration: {duration}
                                </div>
                              </div>
                              <LogHistoryActions
                                onUseAsTemplate={() =>
                                  handleUseAsTemplate(log as SleepFormData & { id: string })
                                }
                                onSaveAsRoutine={() =>
                                  handleSaveAsRoutine(log as SleepFormData & { id: string })
                                }
                                onEdit={() => handleEdit(log as SleepFormData & { id: string })}
                                onDelete={() => handleDelete(log.id!)}
                              />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <MetricChip label="Quality" value={`${log.quality}/10`} />
                              <MetricChip label="Interruptions" value={`${log.interruptions}`} />
                              <MetricChip label="Rested" value={log.felt_rested ? 'Yes' : 'No'} />
                            </div>

                            {log.notes && (
                              <div className="mt-3 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                                {log.notes}
                              </div>
                            )}
                          </div>
                        );
                      })}
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

function SliderField({
  label,
  value,
  max,
  low,
  high,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  low: string;
  high: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="field-label mb-2 block">
        {label}:{' '}
        <span className="font-semibold text-[var(--gw-intelligence-200)]">
          {value}/{max}
        </span>
      </label>
      <input
        type="range"
        min="1"
        max={max}
        step="1"
        value={value}
        onChange={(event) => onChange(parseInt(event.target.value, 10))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--gw-intelligence-400)]"
      />
      <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function ToggleSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-smooth',
        active ? 'bg-[var(--gw-intelligence-500)]' : 'bg-white/12',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
          active ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="metric-label">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {value}
      </p>
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
