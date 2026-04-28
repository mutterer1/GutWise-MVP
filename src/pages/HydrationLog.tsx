import { useState } from 'react';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplet,
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
import {
  type HydrationUnit,
  mlToOz,
  ozToMl,
  formatHydrationAmount,
  getUnitLabel,
  getStoredHydrationUnit,
  setStoredHydrationUnit,
  QUICK_AMOUNTS_ML,
  QUICK_AMOUNTS_OZ,
} from '../utils/hydrationUnits';
import {
  BEVERAGE_TYPES,
  type HydrationBeverageCategory,
  type HydrationBeverageDefinition,
} from '../constants/domain';
import { hydrateLogWithDerivedFields } from '../utils/hydrationClassification';

interface HydrationFormData {
  logged_at: string;
  beverage_type: string;
  beverage_category: HydrationBeverageCategory;
  amount_ml: number;
  caffeine_content: boolean;
  caffeine_mg: number;
  effective_hydration_ml: number;
  water_goal_contribution_ml: number;
  electrolyte_present: boolean;
  alcohol_present: boolean;
  notes: string;
}

function getBeverageDefinition(type: string): HydrationBeverageDefinition {
  return (
    BEVERAGE_TYPES.find((item) => item.value === type) ??
    BEVERAGE_TYPES.find((item) => item.category === 'other') ??
    BEVERAGE_TYPES[0]
  );
}

function buildHydrationFormData(
  overrides: Partial<HydrationFormData> = {}
): Omit<HydrationFormData, 'logged_at'> {
  const baseDefinition = getBeverageDefinition(overrides.beverage_type ?? 'Water');
  const baseAmount = overrides.amount_ml ?? baseDefinition.ml;
  const baseCaffeineContent =
    overrides.caffeine_content ?? (overrides.caffeine_mg ?? baseDefinition.defaultCaffeineMg) > 0;

  const derived = hydrateLogWithDerivedFields({
    beverage_type: overrides.beverage_type ?? baseDefinition.value,
    beverage_category: overrides.beverage_category ?? baseDefinition.category,
    amount_ml: baseAmount,
    caffeine_content: baseCaffeineContent,
    caffeine_mg: overrides.caffeine_mg,
    electrolyte_present: overrides.electrolyte_present,
    alcohol_present: overrides.alcohol_present,
  });

  return {
    beverage_type: derived.beverage_type,
    beverage_category: derived.beverage_category,
    amount_ml: derived.amount_ml,
    caffeine_content: baseCaffeineContent,
    caffeine_mg: derived.caffeine_mg,
    effective_hydration_ml: overrides.effective_hydration_ml ?? derived.effective_hydration_ml,
    water_goal_contribution_ml:
      overrides.water_goal_contribution_ml ?? derived.water_goal_contribution_ml,
    electrolyte_present: overrides.electrolyte_present ?? derived.electrolyte_present,
    alcohol_present: overrides.alcohol_present ?? derived.alcohol_present,
    notes: overrides.notes ?? '',
  };
}

export default function HydrationLog() {
  const [unit, setUnit] = useState<HydrationUnit>(getStoredHydrationUnit);
  const [showModifiers, setShowModifiers] = useState(false);
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
  } = useLogCrud<HydrationFormData>({
    table: 'hydration_logs' as const,
    logType: 'hydration' as const,
    defaultValues: buildHydrationFormData(),
    buildInsertPayload: (data, userId) => {
      const normalized = hydrateLogWithDerivedFields(data);
      return {
        user_id: userId,
        logged_at: data.logged_at,
        beverage_type: normalized.beverage_type,
        beverage_category: normalized.beverage_category,
        amount_ml: normalized.amount_ml,
        caffeine_content: data.caffeine_content,
        caffeine_mg: normalized.caffeine_mg,
        effective_hydration_ml: normalized.effective_hydration_ml,
        water_goal_contribution_ml: normalized.water_goal_contribution_ml,
        electrolyte_present: normalized.electrolyte_present,
        alcohol_present: normalized.alcohol_present,
        notes: data.notes || null,
      };
    },
    buildUpdatePayload: (data) => {
      const normalized = hydrateLogWithDerivedFields(data);
      return {
        logged_at: data.logged_at,
        beverage_type: normalized.beverage_type,
        beverage_category: normalized.beverage_category,
        amount_ml: normalized.amount_ml,
        caffeine_content: data.caffeine_content,
        caffeine_mg: normalized.caffeine_mg,
        effective_hydration_ml: normalized.effective_hydration_ml,
        water_goal_contribution_ml: normalized.water_goal_contribution_ml,
        electrolyte_present: normalized.electrolyte_present,
        alcohol_present: normalized.alcohol_present,
        notes: data.notes || null,
      };
    },
    mapHistoryToForm: (log) => ({
      logged_at: log.logged_at,
      ...buildHydrationFormData(log),
    }),
  });

  const applyHydrationChanges = (patch: Partial<HydrationFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch };
      const normalized = hydrateLogWithDerivedFields(next);
      return {
        ...next,
        beverage_category: normalized.beverage_category,
        caffeine_mg: normalized.caffeine_mg,
        effective_hydration_ml: normalized.effective_hydration_ml,
        water_goal_contribution_ml: normalized.water_goal_contribution_ml,
        electrolyte_present: normalized.electrolyte_present,
        alcohol_present: normalized.alcohol_present,
      };
    });
  };

  const displayValue = unit === 'imperial' ? mlToOz(formData.amount_ml) : formData.amount_ml;
  const unitLabel = getUnitLabel(unit);
  const quickAmounts = unit === 'imperial' ? QUICK_AMOUNTS_OZ : QUICK_AMOUNTS_ML;
  const selectedBeverage = getBeverageDefinition(formData.beverage_type);

  const handleUnitToggle = (nextUnit: HydrationUnit) => {
    setUnit(nextUnit);
    setStoredHydrationUnit(nextUnit);
  };

  const handleBeverageTypeChange = (type: string) => {
    const beverage = getBeverageDefinition(type);
    const hasCaffeine = beverage.defaultCaffeineMg > 0;

    applyHydrationChanges({
      beverage_type: beverage.value,
      beverage_category: beverage.category,
      amount_ml: beverage.ml,
      caffeine_content: hasCaffeine,
      caffeine_mg: beverage.defaultCaffeineMg,
      electrolyte_present: beverage.electrolytePresent,
      alcohol_present: beverage.alcoholPresent,
    });
  };

  const handleQuickAmount = (amount: number) => {
    const ml = unit === 'imperial' ? ozToMl(amount) : amount;
    applyHydrationChanges({ amount_ml: ml });
  };

  const handleCustomAmount = (raw: string) => {
    const parsed = parseFloat(raw) || 0;
    const ml = unit === 'imperial' ? ozToMl(parsed) : Math.round(parsed);
    applyHydrationChanges({ amount_ml: ml });
  };

  const handleCaffeineToggle = () => {
    const nextCaffeineContent = !formData.caffeine_content;

    applyHydrationChanges({
      caffeine_content: nextCaffeineContent,
      caffeine_mg: nextCaffeineContent
        ? Math.max(formData.caffeine_mg, selectedBeverage.defaultCaffeineMg, 25)
        : 0,
    });
  };

  const handleCaffeineMgChange = (raw: string) => {
    const parsed = Math.max(0, parseInt(raw, 10) || 0);
    applyHydrationChanges({
      caffeine_content: parsed > 0,
      caffeine_mg: parsed,
    });
  };

  const isQuickSelected = (amount: number) => {
    const ml = unit === 'imperial' ? ozToMl(amount) : amount;
    return formData.amount_ml === ml;
  };

  const handleReset = () => {
    resetForm();
    setShowModifiers(false);
  };

  const hydrationModelLabel =
    formData.water_goal_contribution_ml > 0
      ? 'Counts toward water goal'
      : formData.alcohol_present
        ? 'Tracked separately from hydration'
        : 'Counts as total fluid, not water goal';

  const filteredHistory = history.filter((log) =>
    matchesLogHistoryQuery(
      buildLogHistorySearchText(
        log.logged_at,
        log.beverage_type,
        log.beverage_category,
        formatHydrationAmount(log.amount_ml, unit),
        log.caffeine_mg,
        log.electrolyte_present ? 'electrolyte electrolytes' : '',
        log.alcohol_present ? 'alcohol' : '',
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);

  return (
    <LogPageShell
      title="Hydration Signal Capture"
      subtitle="Separate water-goal progress, total fluids, caffeine, electrolytes, and alcohol so hydration context can feed the insight engine accurately."
      eyebrow="Hydration Intelligence Capture"
      icon={<Droplet className="h-3.5 w-3.5" />}
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
          {editingId && <EditingBanner label="Editing hydration entry" onCancel={handleReset} />}

          <div className="grid gap-5 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="log-input-shell p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="signal-badge signal-badge-major mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Hydration Console
                  </span>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    What did you drink?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Pick beverage type and amount first. GutWise will classify the entry into water
                    goal credit, effective hydration, caffeine, electrolyte, or alcohol context.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] px-4 py-3">
                  <p className="data-kicker">Current model</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {hydrationModelLabel}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-4 sm:p-5">
                <div className="mb-4">
                  <p className="data-kicker">Beverage Type</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Each beverage carries a hydration interpretation.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {BEVERAGE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleBeverageTypeChange(type.value)}
                      className={[
                        'group rounded-[22px] border p-4 text-left transition-smooth',
                        formData.beverage_type === type.value
                          ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                          : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                      ].join(' ')}
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.055] text-[var(--gw-intelligence-300)] transition-smooth group-hover:scale-[1.04]">
                        <Droplet className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {type.label}
                      </p>
                      <p className="mt-1 text-xs capitalize text-[var(--color-text-tertiary)]">
                        {type.category === 'water'
                          ? 'Water goal'
                          : type.category === 'electrolyte'
                            ? 'Electrolyte'
                            : type.category}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="data-kicker">Amount</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Use a quick amount or enter a custom value.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-1">
                    {(['metric', 'imperial'] as HydrationUnit[]).map((nextUnit) => (
                      <button
                        key={nextUnit}
                        type="button"
                        onClick={() => handleUnitToggle(nextUnit)}
                        className={[
                          'rounded-full px-3 py-1 text-xs font-semibold transition-smooth',
                          unit === nextUnit
                            ? 'bg-[rgba(139,92,246,0.2)] text-[var(--gw-intelligence-200)]'
                            : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
                        ].join(' ')}
                      >
                        {nextUnit === 'metric' ? 'mL / L' : 'oz / gal'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-5 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmount(amount)}
                      className={[
                        'rounded-[20px] border p-3 transition-smooth',
                        isQuickSelected(amount)
                          ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)]'
                          : 'border-white/10 bg-white/[0.026] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                      ].join(' ')}
                    >
                      <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {amount}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">{unitLabel}</div>
                    </button>
                  ))}
                </div>

                <label htmlFor="amount_display" className="field-label mb-2 block">
                  Custom Amount ({unitLabel})
                </label>
                <input
                  type="number"
                  id="amount_display"
                  value={displayValue}
                  onChange={(event) => handleCustomAmount(event.target.value)}
                  className="input-base w-full"
                  min="0.1"
                  step={unit === 'imperial' ? '0.1' : '1'}
                  required
                />
              </div>
            </section>

            <aside className="signal-card signal-card-major h-fit p-5 sm:p-6 xl:sticky xl:top-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Fluid Signal</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    {formatHydrationAmount(formData.amount_ml, unit)}
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
                  <SummaryMetric
                    label="Effective"
                    value={formatHydrationAmount(formData.effective_hydration_ml, unit)}
                  />
                  <SummaryMetric
                    label="Water Credit"
                    value={formatHydrationAmount(formData.water_goal_contribution_ml, unit)}
                  />
                </div>

                <div className="rounded-2xl border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
                  <p className="data-kicker">Classification</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {formData.beverage_type}
                    {formData.caffeine_mg > 0 ? ` | ${formData.caffeine_mg} mg caffeine` : ' | caffeine-free'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.electrolyte_present && <StatusBadge label="Electrolytes" />}
                    {formData.alcohol_present && <StatusBadge label="Alcohol separate" />}
                    {!formData.electrolyte_present && !formData.alcohol_present && (
                      <StatusBadge label={`Category: ${formData.beverage_category}`} />
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={saving} size="lg" className="w-full">
                  <Save className="mr-2 inline h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Hydration Signal'}
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
              onClick={() => setShowModifiers(!showModifiers)}
              className="flex w-full items-center justify-between gap-4 py-1 text-left transition-smooth hover:text-[var(--color-text-primary)]"
            >
              <span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Optional hydration modifiers
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  caffeine override, notes
                </span>
              </span>

              {showModifiers ? (
                <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </button>

            {showModifiers && (
              <div className="mt-5 grid gap-6 border-t border-white/8 pt-5 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        Contains Caffeine
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                        Track caffeine separately from hydration.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCaffeineToggle}
                      className={[
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-smooth',
                        formData.caffeine_content ? 'bg-[var(--gw-intelligence-500)]' : 'bg-white/12',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                          formData.caffeine_content ? 'translate-x-6' : 'translate-x-1',
                        ].join(' ')}
                      />
                    </button>
                  </div>

                  <label htmlFor="caffeine_mg" className="field-label mb-2 block">
                    Caffeine Amount (mg)
                  </label>
                  <input
                    type="number"
                    id="caffeine_mg"
                    value={formData.caffeine_mg}
                    onChange={(event) => handleCaffeineMgChange(event.target.value)}
                    className="input-base w-full"
                    min="0"
                    step="1"
                  />
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
                    className="input-base min-h-[138px] w-full resize-none"
                    rows={5}
                    placeholder="Context, brand, timing, or anything you want to remember..."
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
              category="hydration"
              icon={<Droplet className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search beverage, category, caffeine, notes..."
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
                                {log.beverage_type} | {formatHydrationAmount(log.amount_ml, unit)}
                                {typeof log.caffeine_mg === 'number' && log.caffeine_mg > 0
                                  ? ` | ${log.caffeine_mg} mg caffeine`
                                  : ''}
                              </div>
                            </div>
                            <LogHistoryActions
                              onUseAsTemplate={() =>
                                handleUseAsTemplate(log as HydrationFormData & { id: string })
                              }
                              onSaveAsRoutine={() =>
                                handleSaveAsRoutine(log as HydrationFormData & { id: string })
                              }
                              onEdit={() => handleEdit(log as HydrationFormData & { id: string })}
                              onDelete={() => handleDelete(log.id!)}
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <MetricChip
                              label="Category"
                              value={String(log.beverage_category ?? 'other')}
                            />
                            <MetricChip
                              label="Effective Hydration"
                              value={formatHydrationAmount(
                                log.effective_hydration_ml ?? log.amount_ml,
                                unit
                              )}
                            />
                            <MetricChip
                              label="Water Goal Credit"
                              value={formatHydrationAmount(
                                log.water_goal_contribution_ml ?? 0,
                                unit
                              )}
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

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.1)] px-3 py-1 text-xs font-semibold text-[var(--gw-intelligence-300)]">
      {label}
    </span>
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
