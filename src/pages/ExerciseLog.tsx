import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Gauge,
  Pencil,
  Save,
  Sparkles,
  Zap,
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

interface ExerciseFormData {
  logged_at: string;
  exercise_type: string;
  duration_minutes: number;
  intensity_level: number;
  perceived_exertion: number | null;
  indoor_outdoor: string | null;
  notes: string;
}

const exerciseTypes = [
  'Walking',
  'Running',
  'Cycling',
  'Swimming',
  'Yoga',
  'Strength Training',
  'HIIT',
  'Pilates',
  'Dancing',
  'Hiking',
  'Sports',
  'Stretching',
];

const intensityLabels: Record<number, string> = {
  1: 'Very Light',
  2: 'Light',
  3: 'Moderate',
  4: 'Vigorous',
  5: 'Maximum',
};

function hasExerciseDetails(formData: ExerciseFormData): boolean {
  return (
    formData.perceived_exertion !== null ||
    Boolean(formData.indoor_outdoor) ||
    formData.notes.trim().length > 0
  );
}

export default function ExerciseLog() {
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
  } = useLogCrud<ExerciseFormData>({
    table: 'exercise_logs',
    logType: 'exercise',
    defaultValues: {
      exercise_type: '',
      duration_minutes: 30,
      intensity_level: 3,
      perceived_exertion: null,
      indoor_outdoor: null,
      notes: '',
    },
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      exercise_type: data.exercise_type,
      duration_minutes: data.duration_minutes,
      intensity_level: data.intensity_level,
      perceived_exertion: data.perceived_exertion,
      indoor_outdoor: data.indoor_outdoor || null,
      notes: data.notes || null,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      exercise_type: data.exercise_type,
      duration_minutes: data.duration_minutes,
      intensity_level: data.intensity_level,
      perceived_exertion: data.perceived_exertion,
      indoor_outdoor: data.indoor_outdoor || null,
      notes: data.notes || null,
    }),
  });

  useEffect(() => {
    if (editingId && hasExerciseDetails(formData)) {
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
        log.exercise_type,
        log.duration_minutes,
        log.intensity_level,
        intensityLabels[log.intensity_level],
        log.perceived_exertion,
        log.indoor_outdoor,
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);
  const selectedPreset = exerciseTypes.includes(formData.exercise_type);

  return (
    <LogPageShell
      title="Movement Signal Capture"
      subtitle="Capture activity, duration, intensity, exertion, and environment so movement can be compared against digestion, stress, sleep, symptoms, and recovery."
      eyebrow="Movement Intelligence Capture"
      icon={<Dumbbell className="h-3.5 w-3.5" />}
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
        newIcon={<Dumbbell className="mr-2 h-4 w-4" />}
        historyIcon={<Clock className="mr-2 h-4 w-4" />}
        newLabel={editingId ? 'Edit Entry' : 'New Entry'}
      />

      {!showHistory ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {editingId && <EditingBanner label="Editing movement entry" onCancel={handleReset} />}

          <div className="grid gap-5 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="log-input-shell p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="signal-badge signal-badge-major mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Movement Console
                  </span>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    What movement happened?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Pick the activity, duration, and intensity. Use optional exertion and location
                    when the movement may explain symptom or recovery shifts.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] px-4 py-3">
                  <p className="data-kicker">Session read</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {intensityLabels[formData.intensity_level]}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-4 sm:p-5">
                <div className="mb-4">
                  <p className="data-kicker">Exercise Type</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Choose a common movement pattern or use a custom label.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {exerciseTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, exercise_type: type })}
                      className={[
                        'rounded-[20px] border px-3 py-3 text-sm font-semibold transition-smooth',
                        formData.exercise_type === type
                          ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                          : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                      ].join(' ')}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {!selectedPreset && (
                  <input
                    type="text"
                    placeholder="Or type a custom activity..."
                    value={formData.exercise_type}
                    onChange={(event) =>
                      setFormData({ ...formData, exercise_type: event.target.value })
                    }
                    className="input-base mt-4 w-full"
                  />
                )}

                {selectedPreset && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, exercise_type: '' })}
                    className="mt-3 text-xs font-semibold text-[var(--gw-intelligence-300)] transition-smooth hover:text-[var(--color-text-primary)]"
                  >
                    Use custom type instead
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
                <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 sm:p-5">
                  <label htmlFor="duration" className="field-label mb-2 block">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    min="0"
                    max="600"
                    value={formData.duration_minutes}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        duration_minutes: parseInt(event.target.value, 10) || 0,
                      })
                    }
                    className="input-base w-full"
                    required
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[15, 30, 45, 60, 90].map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setFormData({ ...formData, duration_minutes: minutes })}
                        className={[
                          'rounded-full px-3 py-1 text-xs font-semibold transition-smooth',
                          formData.duration_minutes === minutes
                            ? 'bg-[rgba(139,92,246,0.22)] text-[var(--gw-intelligence-200)]'
                            : 'border border-white/10 bg-white/[0.03] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
                        ].join(' ')}
                      >
                        {minutes}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 sm:p-5">
                  <SliderField
                    label="Intensity"
                    value={formData.intensity_level}
                    max={5}
                    low="Very Light"
                    high="Maximum"
                    readout={intensityLabels[formData.intensity_level]}
                    onChange={(value) => setFormData({ ...formData, intensity_level: value })}
                  />
                </div>
              </div>
            </section>

            <aside className="signal-card signal-card-major h-fit p-5 sm:p-6 xl:sticky xl:top-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Movement Signal</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    {formData.exercise_type || 'Activity pending'}
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
                  <SummaryMetric label="Duration" value={`${formData.duration_minutes}m`} />
                  <SummaryMetric label="Intensity" value={`${formData.intensity_level}/5`} />
                </div>

                <div className="rounded-2xl border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
                  <p className="data-kicker">Session context</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {intensityLabels[formData.intensity_level]}
                    {formData.perceived_exertion
                      ? ` / RPE ${formData.perceived_exertion}/10`
                      : ' / RPE optional'}
                    {formData.indoor_outdoor ? ` / ${formData.indoor_outdoor}` : ' / location optional'}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={saving || !formData.exercise_type}
                  size="lg"
                  className="w-full"
                >
                  <Save className="mr-2 inline h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Movement Signal'}
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
                  Optional movement detail
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  exertion, indoor/outdoor, notes
                </span>
              </span>

              {showDetails ? (
                <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </button>

            {showDetails && (
              <div className="mt-5 grid gap-6 border-t border-white/8 pt-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-5">
                  <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
                    <SliderField
                      label="Perceived Exertion"
                      value={formData.perceived_exertion ?? 5}
                      max={10}
                      low="Easy"
                      high="Max Effort"
                      readout={
                        formData.perceived_exertion === null
                          ? 'Not set'
                          : `${formData.perceived_exertion}/10`
                      }
                      onChange={(value) =>
                        setFormData({ ...formData, perceived_exertion: value })
                      }
                    />
                    {formData.perceived_exertion !== null && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, perceived_exertion: null })}
                        className="mt-3 text-xs font-semibold text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-text-primary)]"
                      >
                        Clear perceived exertion
                      </button>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
                    <div className="mb-3">
                      <p className="data-kicker">Location</p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Optional environment marker.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(['indoor', 'outdoor'] as const).map((location) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              indoor_outdoor:
                                formData.indoor_outdoor === location ? null : location,
                            })
                          }
                          className={[
                            'rounded-[20px] border p-3 text-sm font-semibold capitalize transition-smooth',
                            formData.indoor_outdoor === location
                              ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                              : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                          ].join(' ')}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="field-label mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                    className="input-base min-h-[196px] w-full resize-none"
                    rows={7}
                    placeholder="How did the workout feel, what changed afterward, or what might connect to symptoms?"
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
              category="exercise"
              icon={<Dumbbell className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search exercise, intensity, location, notes..."
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
                                {log.exercise_type} / {log.duration_minutes} min / Intensity{' '}
                                {log.intensity_level}/5
                              </div>
                            </div>
                            <LogHistoryActions
                              onUseAsTemplate={() =>
                                handleUseAsTemplate(log as ExerciseFormData & { id: string })
                              }
                              onSaveAsRoutine={() =>
                                handleSaveAsRoutine(log as ExerciseFormData & { id: string })
                              }
                              onEdit={() => handleEdit(log as ExerciseFormData & { id: string })}
                              onDelete={() => handleDelete(log.id!)}
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <MetricChip
                              label="Intensity"
                              value={intensityLabels[log.intensity_level] || `${log.intensity_level}/5`}
                            />
                            <MetricChip
                              label="RPE"
                              value={
                                log.perceived_exertion != null
                                  ? `${log.perceived_exertion}/10`
                                  : 'Not set'
                              }
                            />
                            <MetricChip
                              label="Location"
                              value={log.indoor_outdoor ? String(log.indoor_outdoor) : 'Not set'}
                            />
                          </div>

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

function SliderField({
  label,
  value,
  max,
  low,
  high,
  readout,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  low: string;
  high: string;
  readout: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="field-label mb-2 block">
        {label}: <span className="font-semibold text-[var(--gw-intelligence-200)]">{readout}</span>
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
      <div className="mt-1 text-sm font-semibold capitalize text-[var(--color-text-primary)]">
        {value}
      </div>
    </div>
  );
}
