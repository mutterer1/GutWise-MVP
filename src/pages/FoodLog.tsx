import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  Pencil,
  Save,
  Tag,
  Utensils,
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
import FoodAutocompleteInput from '../components/FoodAutocompleteInput';
import { useLogCrud } from '../hooks/useLogCrud';
import { replaceFoodLogItemsForLog } from '../services/foodLogNormalizationService';
import { type FoodReferenceSuggestion } from '../services/referenceSearchService';
import {
  buildLogHistorySearchText,
  formatLogHistoryTime,
  groupLogHistoryByDay,
  matchesLogHistoryQuery,
} from '../utils/logHistoryDisplay';

interface FoodItem {
  name: string;
  estimated_calories?: number;
}

interface FoodFormData {
  id?: string;
  logged_at: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: FoodItem[];
  portion_size: string;
  tags: string[];
  notes: string;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
] as const;

const portionSizes = ['Small', 'Medium', 'Large', 'Extra Large'];

const digestiveTags = [
  'Dairy',
  'Gluten',
  'Spicy',
  'Fried',
  'High Fiber',
  'Low Fiber',
  'Caffeine',
  'Sugar',
  'Artificial Sweetener',
  'High Fat',
  'FODMAP',
  'Alcohol',
] as const;

function hasNonDefaultDetails(formData: FoodFormData): boolean {
  return (
    formData.portion_size !== 'Medium' ||
    formData.tags.length > 0 ||
    formData.notes.trim().length > 0
  );
}

function getMealSignalLabel(itemCount: number, tagCount: number, hasNotes: boolean) {
  if (itemCount === 0) return 'Awaiting intake';
  if (itemCount > 0 && (tagCount > 0 || hasNotes)) return 'Context rich';
  if (itemCount > 1) return 'Meal captured';
  return 'Basic entry';
}

export default function FoodLog() {
  const [searchParams] = useSearchParams();
  const [foodItemInput, setFoodItemInput] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');

  const getMealTypeFromParam = (): FoodFormData['meal_type'] => {
    const mealParam = searchParams.get('meal');
    if (
      mealParam === 'breakfast' ||
      mealParam === 'lunch' ||
      mealParam === 'dinner' ||
      mealParam === 'snack'
    ) {
      return mealParam;
    }
    return 'lunch';
  };

  const initialMealType = getMealTypeFromParam();

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
  } = useLogCrud<FoodFormData>({
    table: 'food_logs',
    logType: 'food',
    defaultValues: {
      meal_type: initialMealType,
      food_items: [],
      portion_size: 'Medium',
      tags: [],
      notes: '',
    },
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      meal_type: data.meal_type,
      food_items: data.food_items,
      portion_size: data.portion_size,
      tags: data.tags,
      notes: data.notes || null,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      meal_type: data.meal_type,
      food_items: data.food_items,
      portion_size: data.portion_size,
      tags: data.tags,
      notes: data.notes || null,
    }),
    onAfterCreate: async ({ entryId, userId, formData: savedFormData }) => {
      await replaceFoodLogItemsForLog({
        userId,
        foodLogId: entryId,
        foodItems: savedFormData.food_items,
        tags: savedFormData.tags,
        portionSize: savedFormData.portion_size,
      });
    },
    onAfterUpdate: async ({ entryId, userId, formData: savedFormData }) => {
      await replaceFoodLogItemsForLog({
        userId,
        foodLogId: entryId,
        foodItems: savedFormData.food_items,
        tags: savedFormData.tags,
        portionSize: savedFormData.portion_size,
      });
    },
  });

  useEffect(() => {
    if (editingId && hasNonDefaultDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId, formData]);

  const resetForm = () => {
    baseResetForm();
    setFoodItemInput('');
    setShowDetails(false);
  };

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleSubmit(event);
    setFoodItemInput('');
  };

  const addFoodItem = () => {
    if (!foodItemInput.trim()) return;

    setFormData({
      ...formData,
      food_items: [...formData.food_items, { name: foodItemInput.trim() }],
    });

    setFoodItemInput('');
  };

  const selectSuggestion = (suggestion: FoodReferenceSuggestion) => {
    setFormData({
      ...formData,
      food_items: [
        ...formData.food_items,
        {
          name: suggestion.name,
          ...(typeof suggestion.estimatedCalories === 'number' && {
            estimated_calories: suggestion.estimatedCalories,
          }),
        },
      ],
    });
    setFoodItemInput('');
  };

  const removeFoodItem = (index: number) => {
    setFormData({
      ...formData,
      food_items: formData.food_items.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const toggleTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter((item) => item !== tag)
        : [...formData.tags, tag],
    });
  };

  const totalEstimatedCalories = formData.food_items.reduce(
    (sum, item) => sum + (item.estimated_calories || 0),
    0
  );

  const mealSignalLabel = getMealSignalLabel(
    formData.food_items.length,
    formData.tags.length,
    formData.notes.trim().length > 0
  );

  const filteredHistory = history.filter((log) =>
    matchesLogHistoryQuery(
      buildLogHistorySearchText(
        log.logged_at,
        log.meal_type,
        log.portion_size,
        log.food_items,
        log.tags,
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);

  return (
    <LogPageShell
      title="Food Log"
      subtitle="Capture what you ate first. GutWise can enrich reference matches and queue unknown foods for review without forcing every detail up front."
      eyebrow="Food entry"
      icon={<Utensils className="h-3.5 w-3.5" />}
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
          {editingId && (
            <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[rgba(91,184,240,0.22)] bg-[rgba(91,184,240,0.09)] px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--gw-brand-300)]">
                <Pencil className="h-4 w-4" />
                <span>Editing food entry</span>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="log-workflow-grid">
            <section className="log-primary-panel">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="clinical-chip clinical-chip-intelligence mb-3">
                    <Activity className="h-3.5 w-3.5" />
                    Food details
                  </span>
                  <h2 className="log-section-title">
                    What did you eat?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Add the main meal components. Known reference foods can bring calorie context;
                    unknown foods can be reviewed later instead of blocking fast logging.
                  </p>
                </div>

                <div className="log-readout">
                  <p className="data-kicker">Current entry</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {mealSignalLabel}
                  </p>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, meal_type: type.value })}
                    className={[
                      'log-option-card group',
                      formData.meal_type === type.value
                        ? 'border-[rgba(197,168,255,0.28)] bg-[rgba(139,92,246,0.12)]'
                        : 'border-white/10 bg-white/[0.026] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                    ].join(' ')}
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.055] text-[var(--gw-intelligence-300)] transition-smooth group-hover:scale-[1.04]">
                      <Utensils className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {type.label}
                    </p>
                    <p className="mt-1 text-xs capitalize text-[var(--color-text-tertiary)]">
                      {formData.meal_type === type.value ? 'Selected' : 'Set meal type'}
                    </p>
                  </button>
                ))}
              </div>

              <div className="log-section-card">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="data-kicker">Food items</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Search reference foods or add a custom item.
                    </p>
                  </div>
                  <span className="clinical-chip">
                    {formData.food_items.length} item{formData.food_items.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="relative z-[20] mb-4 flex flex-col gap-2 sm:flex-row">
                  <FoodAutocompleteInput
                    value={foodItemInput}
                    onChange={setFoodItemInput}
                    onSelect={selectSuggestion}
                    onSubmit={addFoodItem}
                  />
                  <Button type="button" variant="secondary" onClick={addFoodItem}>
                    Add
                  </Button>
                </div>

                {formData.food_items.length > 0 ? (
                  <div className="space-y-2">
                    {formData.food_items.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-[20px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {item.name}
                          </span>

                          {item.estimated_calories !== undefined && item.estimated_calories > 0 && (
                            <span className="rounded-full border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.1)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--gw-intelligence-300)]">
                              ~{item.estimated_calories} cal
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          className="text-sm text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-danger)]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-signal-state px-5 py-8 text-center">
                    <Utensils className="mx-auto h-8 w-8 text-[var(--gw-intelligence-300)]" />
                    <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
                      No food item yet
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
                      Add at least one food item to save the entry and trigger reference
                      normalization.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <aside className="log-summary-panel">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Meal summary</p>
                  <h2 className="log-summary-title capitalize">
                    {formData.meal_type}
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
                  <div className="log-summary-note">
                    <p className="metric-label">Items</p>
                    <p className="metric-value mt-2 text-[2.25rem]">
                      {formData.food_items.length}
                    </p>
                  </div>
                  <div className="log-summary-note">
                    <p className="metric-label">Est. Calories</p>
                    <p className="metric-value mt-2 text-[2.25rem]">
                      {totalEstimatedCalories > 0 ? totalEstimatedCalories : '--'}
                    </p>
                  </div>
                </div>

                <div className="log-summary-note">
                  <p className="data-kicker">Reference behavior</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Matched foods can carry estimates forward. Custom foods that do not match the
                    reference table are queued for review after save.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={saving || formData.food_items.length === 0}
                    size="lg"
                    className="w-full"
                  >
                    <Save className="mr-2 inline h-4 w-4" />
                    {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save entry'}
                  </Button>

                  {editingId && (
                    <Button type="button" variant="secondary" size="lg" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
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
                  Optional enrichment details
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  portion, markers, notes
                </span>
              </span>

              {showDetails ? (
                <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </button>

            {showDetails && (
              <div className="log-disclosure-content grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
                <div>
                  <label className="field-label mb-3 block">Portion Size</label>
                  <div className="grid grid-cols-2 gap-3">
                    {portionSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, portion_size: size })}
                        className={[
                          'log-option-button',
                          formData.portion_size === size
                            ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                            : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                        ].join(' ')}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <label className="field-label block">Optional Digestive Markers</label>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      Use only when it improves the entry.
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {digestiveTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={[
                          'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-smooth',
                          formData.tags.includes(tag)
                            ? 'border-[rgba(197,168,255,0.26)] bg-[rgba(139,92,246,0.12)] text-[var(--gw-intelligence-300)]'
                            : 'border-white/10 bg-white/[0.026] text-[var(--color-text-tertiary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045] hover:text-[var(--color-text-secondary)]',
                        ].join(' ')}
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="xl:col-span-2">
                  <label htmlFor="notes" className="field-label mb-2 block">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                    rows={4}
                    placeholder="Restaurant, craving, mood, preparation, suspected reaction..."
                    className="input-base min-h-[112px] w-full resize-none"
                  />
                </div>
              </div>
            )}
          </section>
        </form>
      ) : (
        <section className="log-history-panel">
          {history.length === 0 ? (
            <EmptyState
              category="food"
              icon={<Utensils className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="clinical-chip mb-3">
                    <Clock className="h-3.5 w-3.5" />
                    Food Timeline
                  </span>
                  <h2 className="text-2xl font-semibold tracking-[-0.035em] text-[var(--color-text-primary)]">
                    Reuse or inspect previous meals
                  </h2>
                </div>
                <span className="clinical-chip clinical-chip-intelligence">
                  {history.length} saved
                </span>
              </div>

              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search meals, foods, tags, notes..."
              />

              {filteredHistory.length === 0 ? (
                <LogHistoryNoMatches query={historyQuery} onClear={() => setHistoryQuery('')} />
              ) : (
                <div className="space-y-5">
                  {groupedHistory.map((group) => (
                    <LogHistoryGroup key={group.key} label={group.label} count={group.entries.length}>
                      {group.entries.map((log) => {
                        const logCalories = (log.food_items || []).reduce(
                          (sum, item) => sum + (item.estimated_calories || 0),
                          0
                        );

                        return (
                          <div
                            key={log.id}
                            className="log-section-card transition-smooth hover:border-[rgba(197,168,255,0.22)] hover:bg-white/[0.05]"
                          >
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                                  {formatLogHistoryTime(log.logged_at)}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs capitalize text-[var(--color-text-tertiary)]">
                                  <span>{log.meal_type}</span>
                                  <span>|</span>
                                  <span>{log.portion_size}</span>
                                  {logCalories > 0 && (
                                    <>
                                      <span>|</span>
                                      <span>{logCalories} cal</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <LogHistoryActions
                                onUseAsTemplate={() =>
                                  handleUseAsTemplate(log as FoodFormData & { id: string })
                                }
                                onSaveAsRoutine={() =>
                                  handleSaveAsRoutine(log as FoodFormData & { id: string })
                                }
                                onEdit={() => handleEdit(log as FoodFormData & { id: string })}
                                onDelete={() => handleDelete(log.id!)}
                              />
                            </div>

                            {log.food_items?.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                {log.food_items.map((item, idx) => (
                                  <span
                                    key={`${item.name}-${idx}`}
                                    className="inline-flex items-center rounded-full border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.1)] px-2.5 py-1 text-xs font-semibold text-[var(--gw-intelligence-300)]"
                                  >
                                    {item.name}
                                    {item.estimated_calories ? (
                                      <span className="ml-1 font-mono text-[var(--color-text-tertiary)]">
                                        ~{item.estimated_calories}
                                      </span>
                                    ) : null}
                                  </span>
                                ))}
                              </div>
                            )}

                            {log.tags?.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                {log.tags.map((tag, idx) => (
                                  <span
                                    key={`${tag}-${idx}`}
                                    className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]"
                                  >
                                    <Tag className="mr-1 h-3 w-3 text-[var(--color-text-tertiary)]" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {log.notes && (
                              <div className="rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
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
