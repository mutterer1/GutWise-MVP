import { useEffect, useState } from 'react';
import {
  Activity,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Frown,
  Gauge,
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

interface StressFormData {
  logged_at: string;
  stress_level: number;
  triggers: string[];
  coping_methods: string[];
  physical_symptoms: string[];
  notes: string;
}

const commonTriggers = [
  'Work',
  'Relationships',
  'Finances',
  'Health',
  'Family',
  'Deadlines',
  'Social Events',
  'Traffic',
];

const commonCopingMethods = [
  'Deep Breathing',
  'Exercise',
  'Meditation',
  'Talk to Someone',
  'Music',
  'Walk',
  'Journaling',
  'Rest',
];

const commonPhysicalSymptoms = [
  'Headache',
  'Tension',
  'Rapid Heartbeat',
  'Fatigue',
  'Stomach Issues',
  'Sweating',
  'Muscle Pain',
  'Sleep Issues',
];

const toggleItem = (array: string[], item: string) =>
  array.includes(item) ? array.filter((entry) => entry !== item) : [...array, item];

function getStressLabel(level: number): string {
  if (level <= 3) return 'Regulated';
  if (level <= 6) return 'Elevated';
  if (level <= 8) return 'High load';
  return 'Overloaded';
}

function hasStressDetails(formData: StressFormData): boolean {
  return (
    formData.triggers.length > 0 ||
    formData.coping_methods.length > 0 ||
    formData.physical_symptoms.length > 0 ||
    formData.notes.trim().length > 0
  );
}

export default function StressLog() {
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
  } = useLogCrud<StressFormData>({
    table: 'stress_logs' as const,
    logType: 'stress' as const,
    defaultValues: {
      stress_level: 5,
      triggers: [] as string[],
      coping_methods: [] as string[],
      physical_symptoms: [] as string[],
      notes: '' as const,
    },
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      stress_level: data.stress_level,
      triggers: data.triggers,
      coping_methods: data.coping_methods,
      physical_symptoms: data.physical_symptoms,
      notes: data.notes,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      stress_level: data.stress_level,
      triggers: data.triggers,
      coping_methods: data.coping_methods,
      physical_symptoms: data.physical_symptoms,
      notes: data.notes,
    }),
  });

  useEffect(() => {
    if (editingId && hasStressDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId, formData]);

  const handleReset = () => {
    resetForm();
    setShowDetails(false);
  };

  const filteredHistory = history.filter((log) =>
    matchesLogHistoryQuery(
      buildLogHistorySearchText(
        log.logged_at,
        log.stress_level,
        log.triggers,
        log.coping_methods,
        log.physical_symptoms,
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);
  const stressLabel = getStressLabel(formData.stress_level);

  return (
    <LogPageShell
      title="Stress Signal Capture"
      subtitle="Capture the stress load first, then add triggers, regulation methods, and physical spillover only when they make the signal more useful."
      eyebrow="Nervous System Intelligence Capture"
      icon={<Frown className="h-3.5 w-3.5" />}
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
          {editingId && <EditingBanner label="Editing stress entry" onCancel={handleReset} />}

          <div className="grid gap-5 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="log-input-shell p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="signal-badge signal-badge-major mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Stress Console
                  </span>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    How heavy is the load?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Start with the felt stress level. Add cause and regulation details only when
                    they clarify a gut, sleep, symptom, or medication pattern.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] px-4 py-3">
                  <p className="data-kicker">Current posture</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {stressLabel}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-5 sm:p-6">
                <div className="mb-6 grid gap-4 lg:grid-cols-[0.68fr_0.32fr] lg:items-end">
                  <div>
                    <p className="data-kicker">Stress Level</p>
                    <h3 className="mt-2 text-5xl font-semibold tracking-[-0.06em] text-[var(--gw-intelligence-200)]">
                      {formData.stress_level}/10
                    </h3>
                  </div>
                  <div className="rounded-[22px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                      Read
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                      {stressLabel}
                    </p>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.stress_level}
                  onChange={(event) =>
                    setFormData({ ...formData, stress_level: parseInt(event.target.value, 10) })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--gw-intelligence-400)]"
                />
                <div className="mt-3 flex justify-between text-xs text-[var(--color-text-tertiary)]">
                  <span>Calm</span>
                  <span>Overwhelmed</span>
                </div>
              </div>
            </section>

            <aside className="signal-card signal-card-major h-fit p-5 sm:p-6 xl:sticky xl:top-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Stress Signal</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    {stressLabel}
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
                  <SummaryMetric label="Triggers" value={`${formData.triggers.length}`} />
                  <SummaryMetric label="Coping" value={`${formData.coping_methods.length}`} />
                </div>

                <div className="rounded-2xl border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
                  <p className="data-kicker">Body spillover</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {formData.physical_symptoms.length > 0
                      ? `${formData.physical_symptoms.length} physical symptom markers selected.`
                      : 'No physical spillover markers selected.'}
                  </p>
                </div>

                <Button type="submit" disabled={saving} size="lg" className="w-full">
                  <Save className="mr-2 inline h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Stress Signal'}
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
                  Optional stress detail
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  triggers, coping methods, physical symptoms, notes
                </span>
              </span>

              {showDetails ? (
                <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </button>

            {showDetails && (
              <div className="mt-5 space-y-6 border-t border-white/8 pt-5">
                <ChipSection
                  label="Triggers"
                  description="Potential source of the load."
                  options={commonTriggers}
                  selected={formData.triggers}
                  onToggle={(trigger) =>
                    setFormData({
                      ...formData,
                      triggers: toggleItem(formData.triggers, trigger),
                    })
                  }
                />

                <ChipSection
                  label="Coping Methods Used"
                  description="Regulation attempts matter even when the stress level stayed high."
                  options={commonCopingMethods}
                  selected={formData.coping_methods}
                  onToggle={(method) =>
                    setFormData({
                      ...formData,
                      coping_methods: toggleItem(formData.coping_methods, method),
                    })
                  }
                />

                <ChipSection
                  label="Physical Symptoms"
                  description="Track stress showing up in the body."
                  options={commonPhysicalSymptoms}
                  selected={formData.physical_symptoms}
                  onToggle={(symptom) =>
                    setFormData({
                      ...formData,
                      physical_symptoms: toggleItem(formData.physical_symptoms, symptom),
                    })
                  }
                />

                <div>
                  <label htmlFor="notes" className="field-label mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                    className="input-base min-h-[124px] w-full resize-none"
                    rows={4}
                    placeholder="Context, intensity shift, what helped, what worsened it..."
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
              category="stress"
              icon={<Frown className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search stress, triggers, coping, notes..."
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
                                Stress Level: {log.stress_level}/10 / {getStressLabel(log.stress_level)}
                              </div>
                            </div>
                            <LogHistoryActions
                              onUseAsTemplate={() =>
                                handleUseAsTemplate(log as StressFormData & { id: string })
                              }
                              onSaveAsRoutine={() =>
                                handleSaveAsRoutine(log as StressFormData & { id: string })
                              }
                              onEdit={() => handleEdit(log as StressFormData & { id: string })}
                              onDelete={() => handleDelete(log.id!)}
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <MetricChip label="Triggers" value={`${log.triggers?.length ?? 0}`} />
                            <MetricChip
                              label="Coping"
                              value={`${log.coping_methods?.length ?? 0}`}
                            />
                            <MetricChip
                              label="Physical"
                              value={`${log.physical_symptoms?.length ?? 0}`}
                            />
                          </div>

                          <HistoryBadgeGroup title="Triggers" values={log.triggers} />
                          <HistoryBadgeGroup title="Coping Methods" values={log.coping_methods} />
                          <HistoryBadgeGroup
                            title="Physical Symptoms"
                            values={log.physical_symptoms}
                          />

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

function ChipSection({
  label,
  description,
  options,
  selected,
  onToggle,
}: {
  label: string;
  description: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="data-kicker">{label}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <span className="signal-badge signal-badge-daily">{selected.length} selected</span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={[
              'rounded-[20px] border px-3 py-3 text-sm font-semibold transition-smooth',
              selected.includes(option)
                ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
            ].join(' ')}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-2 text-[2rem]">{value}</p>
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

function HistoryBadgeGroup({ title, values }: { title: string; values?: string[] }) {
  if (!values || values.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="inline-flex items-center rounded-full border border-[rgba(197,168,255,0.2)] bg-[rgba(139,92,246,0.1)] px-2.5 py-1 text-xs font-semibold text-[var(--gw-intelligence-300)]"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
