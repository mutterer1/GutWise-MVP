import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  Pencil,
  Save,
  Sparkles,
  Waves,
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
import { BRISTOL_SCALE } from '../constants/domain';

interface BMFormData {
  id?: string;
  logged_at: string;
  bristol_type: number;
  urgency: number;
  pain_level: number;
  difficulty_level: number;
  amount: 'small' | 'medium' | 'large';
  incomplete_evacuation: boolean;
  blood_present: boolean;
  mucus_present: boolean;
  notes: string;
}

const bmConfig = {
  table: 'bm_logs',
  logType: 'bm' as const,
  defaultValues: {
    bristol_type: 4,
    urgency: 1,
    pain_level: 1,
    difficulty_level: 1,
    amount: 'medium' as const,
    incomplete_evacuation: false,
    blood_present: false,
    mucus_present: false,
    notes: '',
  },
  buildInsertPayload: (formData: BMFormData, userId: string) => ({
    user_id: userId,
    logged_at: formData.logged_at,
    bristol_type: formData.bristol_type,
    urgency: Math.round(formData.urgency),
    pain_level: Math.round(formData.pain_level),
    difficulty_level: Math.round(formData.difficulty_level),
    amount: formData.amount,
    incomplete_evacuation: formData.incomplete_evacuation,
    blood_present: formData.blood_present,
    mucus_present: formData.mucus_present,
    notes: formData.notes || null,
  }),
  buildUpdatePayload: (formData: BMFormData) => ({
    logged_at: formData.logged_at,
    bristol_type: formData.bristol_type,
    urgency: Math.round(formData.urgency),
    pain_level: Math.round(formData.pain_level),
    difficulty_level: Math.round(formData.difficulty_level),
    amount: formData.amount,
    incomplete_evacuation: formData.incomplete_evacuation,
    blood_present: formData.blood_present,
    mucus_present: formData.mucus_present,
    notes: formData.notes || null,
  }),
};

function hasNonDefaultDetails(formData: BMFormData): boolean {
  return (
    formData.urgency > 1 ||
    formData.pain_level > 1 ||
    formData.difficulty_level > 1 ||
    formData.incomplete_evacuation ||
    formData.blood_present ||
    formData.mucus_present ||
    formData.notes.trim().length > 0
  );
}

function getBristolSignal(type: number) {
  if (type === 4) return 'Reference pattern';
  if (type >= 3 && type <= 5) return 'Typical range';
  if (type <= 2) return 'Constipation signal';
  return 'Loose stool signal';
}

export default function BMLog() {
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
  } = useLogCrud<BMFormData>(bmConfig);

  useEffect(() => {
    if (editingId && hasNonDefaultDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId, formData]);

  useEffect(() => {
    if (!editingId && !hasNonDefaultDetails(formData)) {
      setShowDetails(false);
    }
  }, [editingId, formData]);

  const handleReset = () => {
    resetForm();
    setShowDetails(false);
  };

  const selectedBristol = BRISTOL_SCALE.find((item) => item.value === formData.bristol_type);
  const redFlagCount = [
    formData.incomplete_evacuation,
    formData.blood_present,
    formData.mucus_present,
  ].filter(Boolean).length;

  const filteredHistory = history.filter((log) =>
    matchesLogHistoryQuery(
      buildLogHistorySearchText(
        log.logged_at,
        log.bristol_type,
        log.amount,
        log.urgency,
        log.pain_level,
        log.difficulty_level,
        log.incomplete_evacuation ? 'incomplete evacuation incomplete' : '',
        log.blood_present ? 'blood present blood' : '',
        log.mucus_present ? 'mucus present mucus' : '',
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);

  return (
    <LogPageShell
      title="Bowel Signal Capture"
      subtitle="Capture the bowel event quickly, then add urgency, pain, difficulty, and flags only when the signal needs more clinical context."
      eyebrow="Gut Output Capture"
      icon={<Waves className="h-3.5 w-3.5" />}
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
          {editingId && (
            <EditingBanner onCancel={handleReset} label="Editing bowel entry" />
          )}

          <div className="grid gap-5 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="log-input-shell p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="signal-badge signal-badge-major mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Stool Scale Console
                  </span>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    What was the closest match?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Start with Bristol type and amount. This gives the insight engine a clean
                    output signal before optional details are added.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] px-4 py-3">
                  <p className="data-kicker">Current read</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {getBristolSignal(formData.bristol_type)}
                  </p>
                </div>
              </div>

              <div className="-mx-1 overflow-x-auto px-1 pb-2">
                <div className="grid min-w-[720px] grid-cols-7 gap-3">
                  {BRISTOL_SCALE.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, bristol_type: item.value })}
                      className={[
                        'group flex min-h-[178px] flex-col items-center justify-start rounded-[24px] border px-3 py-4 text-center transition-smooth',
                        formData.bristol_type === item.value
                          ? 'border-[rgba(197,168,255,0.34)] bg-[rgba(139,92,246,0.16)] shadow-[0_0_32px_rgba(139,92,246,0.16)]'
                          : 'border-white/10 bg-white/[0.026] hover:border-[rgba(197,168,255,0.22)] hover:bg-white/[0.045]',
                      ].join(' ')}
                    >
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.055] font-mono text-3xl font-bold text-[var(--color-text-primary)] transition-smooth group-hover:scale-[1.04]">
                        {item.value}
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gw-intelligence-300)]">
                        Type {item.value}
                      </p>
                      <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-secondary)]">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="data-kicker">Amount</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Keep this simple unless the event was unusual.
                    </p>
                  </div>
                  <span className="signal-badge signal-badge-daily capitalize">
                    {formData.amount}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({ ...formData, amount: size })}
                      className={[
                        'rounded-[22px] border px-4 py-5 text-center text-sm font-semibold capitalize transition-smooth',
                        formData.amount === size
                          ? 'border-[rgba(197,168,255,0.32)] bg-[rgba(139,92,246,0.14)] text-[var(--gw-intelligence-200)]'
                          : 'border-white/10 bg-white/[0.026] text-[var(--color-text-secondary)] hover:border-[rgba(197,168,255,0.2)] hover:bg-white/[0.045]',
                      ].join(' ')}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <aside className="signal-card signal-card-major h-fit p-5 sm:p-6 xl:sticky xl:top-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="data-kicker">Bowel Signal</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    Bristol Type {formData.bristol_type}
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
                  <SummaryMetric label="Amount" value={formData.amount} />
                  <SummaryMetric label="Flags" value={`${redFlagCount}`} />
                </div>

                <div className="rounded-2xl border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
                  <p className="data-kicker">Scale meaning</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {selectedBristol?.desc ?? 'Choose the closest Bristol type.'}
                  </p>
                </div>

                <Button type="submit" disabled={saving} size="lg" className="w-full">
                  <Save className="mr-2 inline h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Bowel Signal'}
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
                  Optional clinical detail
                </span>
                <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
                  urgency, pain, difficulty, flags, notes
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
                <div className="grid gap-5 md:grid-cols-3">
                  <SliderField
                    label="Urgency"
                    value={formData.urgency}
                    onChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
                    low="Low"
                    high="High"
                  />

                  <SliderField
                    label="Pain"
                    value={formData.pain_level}
                    onChange={(value) => setFormData((prev) => ({ ...prev, pain_level: value }))}
                    low="None"
                    high="Severe"
                  />

                  <SliderField
                    label="Difficulty"
                    value={formData.difficulty_level}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, difficulty_level: value }))
                    }
                    low="Easy"
                    high="Hard"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <ToggleField
                    label="Incomplete Evacuation"
                    active={formData.incomplete_evacuation}
                    onToggle={() =>
                      setFormData((prev) => ({
                        ...prev,
                        incomplete_evacuation: !prev.incomplete_evacuation,
                      }))
                    }
                  />

                  <ToggleField
                    label="Blood Present"
                    active={formData.blood_present}
                    onToggle={() =>
                      setFormData((prev) => ({ ...prev, blood_present: !prev.blood_present }))
                    }
                  />

                  <ToggleField
                    label="Mucus Present"
                    active={formData.mucus_present}
                    onToggle={() =>
                      setFormData((prev) => ({ ...prev, mucus_present: !prev.mucus_present }))
                    }
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="field-label mb-2 block">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    rows={4}
                    placeholder="Any context worth remembering..."
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
              category="bm"
              icon={<Activity className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search Bristol type, amount, flags, notes..."
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
                              <div className="mt-1 text-xs capitalize text-[var(--color-text-tertiary)]">
                                Bristol Type {log.bristol_type} | {log.amount}
                              </div>
                            </div>

                            <LogHistoryActions
                              onUseAsTemplate={() =>
                                handleUseAsTemplate(log as BMFormData & { id: string })
                              }
                              onSaveAsRoutine={() =>
                                handleSaveAsRoutine(log as BMFormData & { id: string })
                              }
                              onEdit={() => handleEdit(log as BMFormData & { id: string })}
                              onDelete={() => handleDelete(log.id!)}
                            />
                          </div>

                          <div className="grid gap-3 text-sm sm:grid-cols-3">
                            <MetricChip label="Urgency" value={`${Number(log.urgency).toFixed(1)}/10`} />
                            <MetricChip label="Pain" value={`${Number(log.pain_level).toFixed(1)}/10`} />
                            <MetricChip
                              label="Difficulty"
                              value={`${Number(log.difficulty_level).toFixed(1)}/10`}
                            />
                          </div>

                          {(log.incomplete_evacuation || log.blood_present || log.mucus_present) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {log.incomplete_evacuation && <Badge label="Incomplete" />}
                              {log.blood_present && <Badge label="Blood" />}
                              {log.mucus_present && <Badge label="Mucus" />}
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
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
      <label className="field-label mb-2 block">
        {label}:{' '}
        <span className="font-semibold text-[var(--gw-intelligence-200)]">{value.toFixed(1)}</span>
      </label>

      <input
        type="range"
        min="1"
        max="10"
        step="0.1"
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--gw-intelligence-400)]"
      />

      <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function ToggleField({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[24px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] p-4">
      <span className="text-sm font-semibold text-[var(--color-text-secondary)]">{label}</span>

      <button
        type="button"
        onClick={onToggle}
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-smooth',
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
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-2 text-[2.25rem] capitalize">{value}</p>
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
