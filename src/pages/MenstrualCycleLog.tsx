import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Droplet,
  Gauge,
  Heart,
  Pencil,
  Save,
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
import { useAuth } from '../contexts/AuthContext';
import { DEV_CYCLE_LOG_ACCESS } from '../lib/devFlags';

interface MenstrualFormData {
  id?: string;
  logged_at: string;
  cycle_start_date: string;
  cycle_day: number;
  estimated_cycle_length: number;
  flow_intensity: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  color: string;
  pain_level: number;
  tissue_passed: boolean;
  symptoms: string[];
  mood_notes: string;
  sleep_quality: number;
  energy_level: number;
  contraceptive_method: string;
  cervical_mucus_type: string;
  ovulation_indicators: string[];
  basal_temp: number | '';
  sexual_activity: boolean;
  notes: string;
}

const commonSymptoms = [
  'Cramps',
  'Bloating',
  'Headaches',
  'Mood Changes',
  'Breast Tenderness',
  'Fatigue',
  'Acne',
  'Food Cravings',
  'Back Pain',
  'Nausea',
  'Joint Pain',
  'None',
];

const ovulationIndicatorsList = [
  'Temperature Rise',
  'Cervical Mucus',
  'Ovulation Pain',
  'Luteal Phase',
  'Follicular Phase',
];

const flowOptions = [
  { value: 'none', label: 'None' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
] as const;

const colorOptions = ['Bright Red', 'Dark Red', 'Brown', 'Light Pink', 'Watery Red'];
const contraceptiveOptions = [
  'None',
  'Birth Control Pill',
  'IUD',
  'Implant',
  'Injection',
  'Condom',
  'Other',
];
const cervicalMucusOptions = ['Dry', 'Sticky', 'Creamy', 'Fertile (Egg White)', 'N/A'];

const buildPayload = (formData: MenstrualFormData, userId?: string) => ({
  ...(userId ? { user_id: userId } : {}),
  logged_at: formData.logged_at,
  cycle_start_date: formData.cycle_start_date,
  cycle_day: formData.cycle_day,
  estimated_cycle_length: formData.estimated_cycle_length,
  flow_intensity: formData.flow_intensity,
  color: formData.color,
  pain_level: formData.pain_level,
  tissue_passed: formData.tissue_passed,
  symptoms: formData.symptoms,
  mood_notes: formData.mood_notes || null,
  sleep_quality: formData.sleep_quality,
  energy_level: formData.energy_level,
  contraceptive_method: formData.contraceptive_method || null,
  cervical_mucus_type: formData.cervical_mucus_type || null,
  ovulation_indicators: formData.ovulation_indicators,
  basal_temp: formData.basal_temp !== '' ? formData.basal_temp : null,
  sexual_activity: formData.sexual_activity,
  notes: formData.notes || null,
});

const menstrualConfig = {
  table: 'menstrual_cycle_logs',
  logType: 'menstrual-cycle' as const,
  defaultValues: {
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_day: 1,
    estimated_cycle_length: 28,
    flow_intensity: 'medium' as const,
    color: 'Bright Red',
    pain_level: 0,
    tissue_passed: false,
    symptoms: [] as string[],
    mood_notes: '',
    sleep_quality: 7,
    energy_level: 7,
    contraceptive_method: 'None',
    cervical_mucus_type: 'N/A',
    ovulation_indicators: [] as string[],
    basal_temp: '' as number | '',
    sexual_activity: false,
    notes: '',
  },
  buildInsertPayload: (formData: MenstrualFormData, userId: string) => buildPayload(formData, userId),
  buildUpdatePayload: (formData: MenstrualFormData) => buildPayload(formData),
};

function titleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function hasCycleDetails(formData: MenstrualFormData): boolean {
  return (
    formData.tissue_passed ||
    formData.symptoms.length > 0 ||
    formData.mood_notes.trim().length > 0 ||
    formData.sleep_quality !== 7 ||
    formData.energy_level !== 7 ||
    formData.contraceptive_method !== 'None' ||
    formData.cervical_mucus_type !== 'N/A' ||
    formData.ovulation_indicators.length > 0 ||
    formData.basal_temp !== '' ||
    formData.sexual_activity ||
    formData.notes.trim().length > 0
  );
}

export default function MenstrualCycleLog() {
  const { profile } = useAuth();
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
  } = useLogCrud<MenstrualFormData>(menstrualConfig);

  useEffect(() => {
    if (formData.cycle_start_date) {
      const startDate = new Date(formData.cycle_start_date);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData((prev) => ({ ...prev, cycle_day: Math.max(1, diffDays) }));
    }
  }, [formData.cycle_start_date, setFormData]);

  useEffect(() => {
    if (editingId && hasCycleDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId, formData]);

  if (!DEV_CYCLE_LOG_ACCESS && profile?.gender === 'male') {
    return (
      <LogPageShell
        title="Cycle Log"
        subtitle=""
        eyebrow="Cycle entry"
        icon={<Heart className="h-3.5 w-3.5" />}
        maxWidth="7xl"
        message=""
        toastVisible={false}
        onDismissToast={() => {}}
        error=""
      >
        <section className="clinical-card p-6 sm:p-8">
          <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-10 text-center">
            <div className="insight-orb mb-5">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
              Cycle tracking is not part of your current profile.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              If this is incorrect, update your gender in Profile Settings.
            </p>
          </div>
        </section>
      </LogPageShell>
    );
  }

  const toggleSymptom = (symptom: string) => {
    if (symptom === 'None') {
      setFormData({ ...formData, symptoms: ['None'] });
      return;
    }

    const filtered = formData.symptoms.filter((item) => item !== 'None');
    setFormData({
      ...formData,
      symptoms: filtered.includes(symptom)
        ? filtered.filter((item) => item !== symptom)
        : [...filtered, symptom],
    });
  };

  const toggleOvulationIndicator = (indicator: string) => {
    setFormData({
      ...formData,
      ovulation_indicators: formData.ovulation_indicators.includes(indicator)
        ? formData.ovulation_indicators.filter((item) => item !== indicator)
        : [...formData.ovulation_indicators, indicator],
    });
  };

  const handleReset = () => {
    resetForm();
    setShowDetails(false);
  };

  const filteredHistory = history.filter((log) =>
    matchesLogHistoryQuery(
      buildLogHistorySearchText(
        log.logged_at,
        log.cycle_start_date,
        log.cycle_day,
        log.flow_intensity,
        log.color,
        log.pain_level,
        log.symptoms,
        log.mood_notes,
        log.ovulation_indicators,
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);

  return (
    <LogPageShell
      title="Cycle Log"
      subtitle="Capture cycle timing, flow, pain, symptoms, reproductive context, and recovery markers in one structured entry for longitudinal pattern analysis."
      eyebrow="Cycle entry"
      icon={<Heart className="h-3.5 w-3.5" />}
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
        newIcon={<Heart className="mr-2 h-4 w-4" />}
        historyIcon={<Clock className="mr-2 h-4 w-4" />}
        newLabel={editingId ? 'Edit Entry' : 'New Entry'}
      />

      {!showHistory ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {editingId && <EditingBanner label="Editing cycle entry" onCancel={handleReset} />}

          <div className="log-workflow-grid">
            <section className="log-primary-panel">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="clinical-chip clinical-chip-intelligence mb-3">
                    <Heart className="h-3.5 w-3.5" />
                    Cycle details
                  </span>
                  <h2 className="log-section-title">
                    What is today in the cycle?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Start with timing, flow, color, and pain. Optional reproductive and recovery
                    context can explain shifts in symptoms, bowel patterns, sleep, and appetite.
                  </p>
                </div>

                <div className="log-readout">
                  <p className="data-kicker">Cycle day</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    Day {formData.cycle_day}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <label
                  htmlFor="cycle_start_date"
                  className="log-section-card"
                >
                  <span className="field-label mb-2 flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    Cycle Start Date
                  </span>
                  <input
                    type="date"
                    id="cycle_start_date"
                    value={formData.cycle_start_date}
                    onChange={(event) =>
                      setFormData({ ...formData, cycle_start_date: event.target.value })
                    }
                    className="input-base w-full"
                    required
                  />
                </label>

                <label
                  htmlFor="logged_at"
                  className="log-section-card"
                >
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
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="log-section-card">
                  <span className="field-label mb-2 block">Cycle Day</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.cycle_day}
                    onChange={(event) =>
                      setFormData({ ...formData, cycle_day: parseInt(event.target.value, 10) || 1 })
                    }
                    className="input-base w-full"
                    required
                  />
                  <p className="field-help mt-2">Auto-calculated from start date, editable if needed.</p>
                </label>

                <label className="log-section-card">
                  <span className="field-label mb-2 block">Estimated Cycle Length</span>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    value={formData.estimated_cycle_length}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        estimated_cycle_length: parseInt(event.target.value, 10) || 28,
                      })
                    }
                    className="input-base w-full"
                  />
                </label>
              </div>

              <div className="mt-5 log-section-card">
                <div className="mb-4">
                  <p className="data-kicker">Flow Intensity</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Keep the primary flow marker consistent across entries.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  {flowOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, flow_intensity: option.value })
                      }
                      className={[
                        'log-option-button',
                        formData.flow_intensity === option.value
                          ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                          : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                      ].join(' ')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 log-section-card">
                <div className="mb-4">
                  <p className="data-kicker">Color</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    A visual marker that can matter for clinician-friendly history.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={[
                        'log-option-button',
                        formData.color === color
                          ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                          : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                      ].join(' ')}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 log-section-card">
                <SliderField
                  label="Pain Level"
                  value={formData.pain_level}
                  max={10}
                  low="None"
                  high="Severe"
                  onChange={(value) => setFormData({ ...formData, pain_level: value })}
                />
              </div>
            </section>

            <aside className="log-summary-panel">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Cycle summary</p>
                  <h2 className="log-summary-title">
                    Day {formData.cycle_day}
                  </h2>
                </div>
                <div className="insight-orb">
                  <Gauge className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <SummaryMetric label="Flow" value={titleCase(formData.flow_intensity)} />
                  <SummaryMetric label="Pain" value={`${formData.pain_level}/10`} />
                </div>

                <div className="log-summary-note">
                  <p className="data-kicker">Snapshot</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {formData.color} / {formData.estimated_cycle_length}-day estimate /{' '}
                    {formData.symptoms.length} symptom markers
                  </p>
                </div>

                <div className="log-summary-note">
                  <p className="data-kicker">Recovery overlay</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Sleep {formData.sleep_quality}/10 / Energy {formData.energy_level}/10
                  </p>
                </div>

                <Button type="submit" disabled={saving} size="lg" className="w-full">
                  <Save className="mr-2 inline h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save entry'}
                </Button>

                {editingId && (
                  <Button type="button" variant="secondary" size="lg" onClick={handleReset}>
                    Cancel
                  </Button>
                )}
              </div>
            </aside>
          </div>

          <section className="log-disclosure-panel">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between gap-4 py-1 text-left transition-smooth hover:text-[var(--color-text-primary)]"
            >
              <span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Optional cycle detail
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  symptoms, mood, recovery, reproductive markers, notes
                </span>
              </span>

              {showDetails ? (
                <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </button>

            {showDetails && (
              <div className="log-disclosure-content space-y-5">
                <ChipSection
                  label="Symptoms"
                  description="Use only markers that meaningfully describe this cycle day."
                  options={commonSymptoms}
                  selected={formData.symptoms}
                  onToggle={toggleSymptom}
                />

                <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="space-y-5">
                    <TogglePanel
                      label="Tissue/Clots Passed"
                      description="Mark if this was part of the event."
                      active={formData.tissue_passed}
                      onToggle={() =>
                        setFormData({ ...formData, tissue_passed: !formData.tissue_passed })
                      }
                    />

                    <TogglePanel
                      label="Sexual Activity"
                      description="Include only if relevant to cycle context."
                      active={formData.sexual_activity}
                      onToggle={() =>
                        setFormData({ ...formData, sexual_activity: !formData.sexual_activity })
                      }
                    />
                  </div>

                  <label className="block">
                    <span className="field-label mb-2 block">Mood Notes</span>
                    <input
                      type="text"
                      value={formData.mood_notes}
                      onChange={(event) =>
                        setFormData({ ...formData, mood_notes: event.target.value })
                      }
                      placeholder="e.g. irritable, emotional, anxious"
                      className="input-base w-full"
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="log-section-card">
                    <SliderField
                      label="Sleep Quality"
                      min={1}
                      value={formData.sleep_quality}
                      max={10}
                      low="Poor"
                      high="Excellent"
                      onChange={(value) => setFormData({ ...formData, sleep_quality: value })}
                    />
                  </div>

                  <div className="log-section-card">
                    <SliderField
                      label="Energy Level"
                      min={1}
                      value={formData.energy_level}
                      max={10}
                      low="Low"
                      high="High"
                      onChange={(value) => setFormData({ ...formData, energy_level: value })}
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectPanel
                    label="Contraceptive Method"
                    value={formData.contraceptive_method}
                    options={contraceptiveOptions}
                    onChange={(value) => setFormData({ ...formData, contraceptive_method: value })}
                  />

                  <SelectPanel
                    label="Cervical Mucus"
                    value={formData.cervical_mucus_type}
                    options={cervicalMucusOptions}
                    onChange={(value) => setFormData({ ...formData, cervical_mucus_type: value })}
                  />
                </div>

                <ChipSection
                  label="Ovulation Indicators"
                  description="Optional markers for cycle-phase interpretation."
                  options={ovulationIndicatorsList}
                  selected={formData.ovulation_indicators}
                  onToggle={toggleOvulationIndicator}
                />

                <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                  <label className="log-section-card">
                    <span className="field-label mb-2 block">Basal Body Temperature</span>
                    <input
                      type="number"
                      step="0.1"
                      min="96"
                      max="100"
                      value={formData.basal_temp}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          basal_temp: event.target.value ? parseFloat(event.target.value) : '',
                        })
                      }
                      placeholder="e.g. 97.8 F"
                      className="input-base w-full"
                    />
                  </label>

                  <label className="block">
                    <span className="field-label mb-2 block">Additional Notes</span>
                    <textarea
                      value={formData.notes}
                      onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                      className="input-base min-h-[132px] w-full resize-none"
                      rows={4}
                      placeholder="Any other observations, context, or clinician-relevant detail..."
                    />
                  </label>
                </div>
              </div>
            )}
          </section>
        </form>
      ) : (
        <section className="log-history-panel">
          {history.length === 0 ? (
            <EmptyState
              category="menstrual cycle"
              icon={<Heart className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search cycle day, flow, symptoms, notes..."
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
                          className="log-section-card transition-smooth hover:border-[rgba(197,168,255,0.22)] hover:bg-white/[0.05]"
                        >
                          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                                {formatLogHistoryTime(log.logged_at)}
                              </div>
                              <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                                Day {log.cycle_day} / {titleCase(String(log.flow_intensity))} flow
                              </div>
                            </div>
                            <LogHistoryActions
                              onUseAsTemplate={() =>
                                handleUseAsTemplate(log as MenstrualFormData & { id: string })
                              }
                              onSaveAsRoutine={() =>
                                handleSaveAsRoutine(log as MenstrualFormData & { id: string })
                              }
                              onEdit={() => handleEdit(log as MenstrualFormData & { id: string })}
                              onDelete={() => handleDelete(log.id!)}
                            />
                          </div>

                          <div className="mb-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                            <MetricChip label="Color" value={log.color} />
                            <MetricChip label="Pain" value={`${log.pain_level}/10`} />
                            <MetricChip label="Sleep" value={`${log.sleep_quality}/10`} />
                            <MetricChip label="Energy" value={`${log.energy_level}/10`} />
                          </div>

                          <HistoryBadgeGroup title="Symptoms" values={log.symptoms} />
                          <HistoryBadgeGroup
                            title="Ovulation Indicators"
                            values={log.ovulation_indicators}
                          />

                          {log.mood_notes && (
                            <div className="mt-3 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                              <span className="font-semibold text-[var(--color-text-primary)]">
                                Mood:
                              </span>{' '}
                              {log.mood_notes}
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

function SliderField({
  label,
  min = 0,
  value,
  max,
  low,
  high,
  onChange,
}: {
  label: string;
  min?: number;
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
        min={min}
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
    <div className="log-section-card">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="data-kicker">{label}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <span className="clinical-chip">{selected.length} selected</span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={[
              'log-option-button',
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

function TogglePanel({
  label,
  description,
  active,
  onToggle,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="log-section-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{label}</p>
          <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">{description}</p>
        </div>
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
      </div>
    </div>
  );
}

function SelectPanel({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block log-section-card">
      <span className="field-label mb-2 block">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="input-base w-full">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="log-summary-note">
      <p className="metric-label">{label}</p>
      <p className="mt-2 text-lg font-semibold capitalize tracking-[-0.03em] text-[var(--color-text-primary)]">
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
