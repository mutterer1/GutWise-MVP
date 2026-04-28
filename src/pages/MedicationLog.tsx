import { useEffect, useState } from 'react';
import {
  Activity,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  Pencil,
  Pill,
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
import MedicationAutocompleteInput from '../components/MedicationAutocompleteInput';
import { useLogCrud } from '../hooks/useLogCrud';
import { syncMedicationNormalizationForLog } from '../services/medicationNormalizationService';
import { type MedicationReferenceSuggestion } from '../services/referenceSearchService';
import {
  buildLogHistorySearchText,
  formatLogHistoryTime,
  groupLogHistoryByDay,
  matchesLogHistoryQuery,
} from '../utils/logHistoryDisplay';
import type { MedicationRegimenStatus } from '../types/intelligence';

interface MedicationFormData {
  logged_at: string;
  medication_name: string;
  dosage: string;
  medication_type: 'prescription' | 'otc' | 'supplement';
  route: string;
  reason_for_use: string;
  regimen_status: MedicationRegimenStatus;
  timing_context: string;
  taken_as_prescribed: boolean;
  side_effects: string[];
  notes: string;
}

const commonSideEffects = [
  'Drowsiness',
  'Nausea',
  'Dizziness',
  'Headache',
  'Dry Mouth',
  'Upset Stomach',
  'Fatigue',
  'None',
];

const routeOptions = ['oral', 'topical', 'nasal', 'inhaled', 'injection', 'rectal'] as const;

const regimenOptions: Array<{ value: MedicationRegimenStatus; label: string }> = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'one_time', label: 'One-Time' },
  { value: 'unknown', label: 'Unknown' },
];

const timingOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'bedtime', label: 'Bedtime' },
  { value: 'before_meal', label: 'Before Meal' },
  { value: 'with_food', label: 'With Food' },
  { value: 'after_meal', label: 'After Meal' },
] as const;

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatSnakeCase(value: string): string {
  return value.replace(/_/g, ' ');
}

function titleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function coerceMedicationType(
  value: MedicationReferenceSuggestion['medicationType']
): MedicationFormData['medication_type'] | null {
  if (value === 'prescription' || value === 'otc' || value === 'supplement') {
    return value;
  }
  return null;
}

function hasMedicationDetails(formData: MedicationFormData): boolean {
  return (
    formData.route.trim().length > 0 ||
    formData.reason_for_use.trim().length > 0 ||
    formData.regimen_status !== 'unknown' ||
    formData.timing_context.trim().length > 0 ||
    !formData.taken_as_prescribed ||
    formData.side_effects.length > 0 ||
    formData.notes.trim().length > 0
  );
}

export default function MedicationLog() {
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
  } = useLogCrud<MedicationFormData>({
    table: 'medication_logs' as const,
    logType: 'medication' as const,
    defaultValues: {
      medication_name: '' as const,
      dosage: '' as const,
      medication_type: 'prescription' as const,
      route: '' as const,
      reason_for_use: '' as const,
      regimen_status: 'unknown' as const,
      timing_context: '' as const,
      taken_as_prescribed: true,
      side_effects: [] as string[],
      notes: '' as const,
    },
    mapHistoryToForm: (log) => ({
      logged_at: log.logged_at,
      medication_name: log.medication_name ?? '',
      dosage: log.dosage ?? '',
      medication_type: log.medication_type ?? 'prescription',
      route: log.route ?? '',
      reason_for_use: log.reason_for_use ?? '',
      regimen_status: log.regimen_status ?? 'unknown',
      timing_context: log.timing_context ?? '',
      taken_as_prescribed: log.taken_as_prescribed ?? true,
      side_effects: log.side_effects ?? [],
      notes: log.notes ?? '',
    }),
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      medication_name: data.medication_name,
      dosage: data.dosage,
      medication_type: data.medication_type,
      route: normalizeOptionalText(data.route),
      reason_for_use: normalizeOptionalText(data.reason_for_use),
      regimen_status: data.regimen_status,
      timing_context: normalizeOptionalText(data.timing_context),
      taken_as_prescribed: data.taken_as_prescribed,
      side_effects: data.side_effects,
      notes: normalizeOptionalText(data.notes),
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      medication_name: data.medication_name,
      dosage: data.dosage,
      medication_type: data.medication_type,
      route: normalizeOptionalText(data.route),
      reason_for_use: normalizeOptionalText(data.reason_for_use),
      regimen_status: data.regimen_status,
      timing_context: normalizeOptionalText(data.timing_context),
      taken_as_prescribed: data.taken_as_prescribed,
      side_effects: data.side_effects,
      notes: normalizeOptionalText(data.notes),
    }),
    onAfterCreate: async ({ entryId, userId, formData: savedFormData }) => {
      await syncMedicationNormalizationForLog({
        medicationLogId: entryId,
        userId,
        formData: savedFormData,
      });
    },
    onAfterUpdate: async ({ entryId, userId, formData: savedFormData }) => {
      await syncMedicationNormalizationForLog({
        medicationLogId: entryId,
        userId,
        formData: savedFormData,
      });
    },
  });

  useEffect(() => {
    if (editingId && hasMedicationDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId, formData]);

  const selectMedicationSuggestion = (suggestion: MedicationReferenceSuggestion) => {
    setFormData({
      ...formData,
      medication_name: suggestion.name,
      medication_type: coerceMedicationType(suggestion.medicationType) ?? formData.medication_type,
      route: suggestion.route ?? formData.route,
    });
  };

  const toggleSideEffect = (effect: string) => {
    if (effect === 'None') {
      setFormData({ ...formData, side_effects: ['None'] });
      return;
    }

    const filtered = formData.side_effects.filter((item) => item !== 'None');

    setFormData({
      ...formData,
      side_effects: filtered.includes(effect)
        ? filtered.filter((item) => item !== effect)
        : [...filtered, effect],
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
        log.medication_name,
        log.dosage,
        log.medication_type,
        log.route,
        log.regimen_status,
        log.timing_context,
        log.taken_as_prescribed ? 'taken as prescribed adherent' : 'off plan',
        log.reason_for_use,
        log.side_effects,
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);
  const sideEffectCount = formData.side_effects.filter((effect) => effect !== 'None').length;
  const medicationTypeLabel =
    formData.medication_type === 'otc' ? 'OTC' : titleCase(formData.medication_type);

  return (
    <LogPageShell
      title="Medication Signal Capture"
      subtitle="Capture dose, adherence, route, timing, and side-effect context so medications can be compared against symptoms, bowel changes, sleep, and food patterns."
      eyebrow="Medication Intelligence Capture"
      icon={<Pill className="h-3.5 w-3.5" />}
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
          {editingId && <EditingBanner label="Editing medication entry" onCancel={handleReset} />}

          <div className="grid gap-5 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="log-input-shell p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="signal-badge signal-badge-major mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Medication Console
                  </span>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    What did you take?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Start with the product and dose. GutWise will keep the raw entry, search the
                    medication reference layer, and queue unknown names for review.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] px-4 py-3">
                  <p className="data-kicker">Reference status</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    Autocomplete linked
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-4 sm:p-5">
                <label htmlFor="medication_name" className="field-label mb-2 flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medication Name
                </label>
                <MedicationAutocompleteInput
                  id="medication_name"
                  value={formData.medication_name}
                  onChange={(value) => setFormData({ ...formData, medication_name: value })}
                  onSelect={selectMedicationSuggestion}
                />
                <p className="field-help mt-3">
                  Pick a reference match when available. Custom medications remain valid and can be
                  promoted through the review queue.
                </p>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 sm:p-5">
                  <label htmlFor="dosage" className="field-label mb-2 block">
                    Dosage
                  </label>
                  <input
                    type="text"
                    id="dosage"
                    value={formData.dosage}
                    onChange={(event) => setFormData({ ...formData, dosage: event.target.value })}
                    placeholder="e.g. 200mg, 1 tablet, 5ml"
                    className="input-base w-full"
                    required
                  />
                </div>

                <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 sm:p-5">
                  <div className="mb-4">
                    <p className="data-kicker">Medication type</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Keep prescribed, OTC, and supplements distinct for clinician reports.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['prescription', 'otc', 'supplement'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, medication_type: type })}
                        className={[
                          'rounded-[22px] border px-3 py-4 text-sm font-semibold transition-smooth',
                          formData.medication_type === type
                            ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                            : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                        ].join(' ')}
                      >
                        {type === 'otc' ? 'OTC' : titleCase(type)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside className="signal-card signal-card-major h-fit p-5 sm:p-6 xl:sticky xl:top-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Dose Signal</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    {formData.medication_name || 'Medication pending'}
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
                    Time Taken
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
                  <SummaryMetric label="Type" value={medicationTypeLabel} />
                  <SummaryMetric
                    label="Adherence"
                    value={formData.taken_as_prescribed ? 'On plan' : 'Off plan'}
                  />
                </div>

                <div className="rounded-2xl border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
                  <p className="data-kicker">Clinical context</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {formData.dosage || 'Dosage pending'}
                    {formData.route ? ` / ${titleCase(formData.route)}` : ' / route not set'}
                    {formData.timing_context
                      ? ` / ${titleCase(formatSnakeCase(formData.timing_context))}`
                      : ' / timing optional'}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={saving || !formData.medication_name || !formData.dosage}
                  size="lg"
                  className="w-full"
                >
                  <Save className="mr-2 inline h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Medication Signal'}
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
                  Optional medication detail
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  route, regimen, timing, reason, side effects, notes
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
                <div className="grid gap-5 lg:grid-cols-2">
                  <OptionGrid
                    label="Route"
                    description="Leave blank if the reference table already knows the route."
                    options={routeOptions.map((route) => ({ value: route, label: titleCase(route) }))}
                    value={formData.route}
                    onSelect={(route) =>
                      setFormData({ ...formData, route: formData.route === route ? '' : route })
                    }
                  />

                  <OptionGrid
                    label="Regimen Status"
                    description="Separate scheduled use from one-time or as-needed use."
                    options={regimenOptions}
                    value={formData.regimen_status}
                    onSelect={(regimen) =>
                      setFormData({
                        ...formData,
                        regimen_status: regimen as MedicationRegimenStatus,
                      })
                    }
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <OptionGrid
                    label="Timing Context"
                    description="Useful when food, reflux, sleep, or side effects may be time-linked."
                    options={timingOptions}
                    value={formData.timing_context}
                    onSelect={(timing) =>
                      setFormData({
                        ...formData,
                        timing_context:
                          formData.timing_context === timing ? '' : timing,
                      })
                    }
                  />

                  <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                          Taken as Prescribed
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                          Marks whether the dose matched the intended plan.
                        </p>
                      </div>

                      <ToggleSwitch
                        active={formData.taken_as_prescribed}
                        onToggle={() =>
                          setFormData({
                            ...formData,
                            taken_as_prescribed: !formData.taken_as_prescribed,
                          })
                        }
                      />
                    </div>

                    <label htmlFor="reason_for_use" className="field-label mb-2 block">
                      Reason for Use
                    </label>
                    <input
                      type="text"
                      id="reason_for_use"
                      value={formData.reason_for_use}
                      onChange={(event) =>
                        setFormData({ ...formData, reason_for_use: event.target.value })
                      }
                      placeholder="e.g. reflux flare, headache, maintenance"
                      className="input-base w-full"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="data-kicker">Side effects</p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Optional, but high-value for medication pattern analysis.
                      </p>
                    </div>
                    <span className="signal-badge signal-badge-daily">
                      {sideEffectCount} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {commonSideEffects.map((effect) => (
                      <button
                        key={effect}
                        type="button"
                        onClick={() => toggleSideEffect(effect)}
                        className={[
                          'rounded-[20px] border px-3 py-3 text-sm font-semibold transition-smooth',
                          formData.side_effects.includes(effect)
                            ? effect === 'None'
                              ? 'border-[rgba(197,168,255,0.26)] bg-[rgba(139,92,246,0.12)] text-[var(--gw-intelligence-200)]'
                              : 'border-[rgba(255,120,120,0.28)] bg-[rgba(255,120,120,0.10)] text-[var(--color-text-primary)]'
                            : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                        ].join(' ')}
                      >
                        {effect}
                      </button>
                    ))}
                  </div>
                </div>

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
                    placeholder="Effectiveness, side effects, missed timing, or context not captured above..."
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
              category="medication"
              icon={<Pill className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search medication, dosage, route, effects..."
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
                                {log.medication_name} / {log.dosage}
                              </div>
                            </div>
                            <LogHistoryActions
                              onUseAsTemplate={() =>
                                handleUseAsTemplate(log as MedicationFormData & { id: string })
                              }
                              onSaveAsRoutine={() =>
                                handleSaveAsRoutine(log as MedicationFormData & { id: string })
                              }
                              onEdit={() => handleEdit(log as MedicationFormData & { id: string })}
                              onDelete={() => handleDelete(log.id!)}
                            />
                          </div>

                          <div className="mb-3 grid gap-3 sm:grid-cols-3">
                            <MetricChip
                              label="Type"
                              value={
                                log.medication_type === 'otc'
                                  ? 'OTC'
                                  : titleCase(String(log.medication_type ?? 'unknown'))
                              }
                            />
                            <MetricChip
                              label="Regimen"
                              value={titleCase(formatSnakeCase(String(log.regimen_status ?? 'unknown')))}
                            />
                            <MetricChip
                              label="Adherence"
                              value={log.taken_as_prescribed ? 'On plan' : 'Off plan'}
                            />
                          </div>

                          <div className="mb-3 flex flex-wrap gap-2">
                            {log.route && <StatusBadge label={titleCase(log.route)} />}
                            {log.timing_context && (
                              <StatusBadge label={titleCase(formatSnakeCase(log.timing_context))} />
                            )}
                            {log.reason_for_use && <StatusBadge label={log.reason_for_use} />}
                          </div>

                          {log.side_effects && log.side_effects.length > 0 && (
                            <div className="mb-3">
                              <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                                Side Effects
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {log.side_effects.map((effect: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className={[
                                      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                                      effect === 'None'
                                        ? 'border-[rgba(197,168,255,0.2)] bg-[rgba(139,92,246,0.1)] text-[var(--gw-intelligence-300)]'
                                        : 'border-[rgba(255,120,120,0.22)] bg-[rgba(255,120,120,0.10)] text-[var(--color-danger)]',
                                    ].join(' ')}
                                  >
                                    {effect}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {log.notes && (
                            <div className="rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
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

function OptionGrid({
  label,
  description,
  options,
  value,
  onSelect,
}: {
  label: string;
  description: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
      <div className="mb-4">
        <p className="data-kicker">{label}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={[
              'rounded-[18px] border px-3 py-3 text-sm font-semibold transition-smooth',
              value === option.value
                ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
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

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.1)] px-3 py-1 text-xs font-semibold text-[var(--gw-intelligence-300)]">
      {label}
    </span>
  );
}
