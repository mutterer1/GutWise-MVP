import type { ReactNode } from 'react';
import { Copy, Pencil, Pin, Search, Trash2, X } from 'lucide-react';

interface LogHistoryToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
  placeholder?: string;
}

export function LogHistoryToolbar({
  query,
  onQueryChange,
  totalCount,
  filteredCount,
  placeholder = 'Search history...',
}: LogHistoryToolbarProps) {
  return (
    <div className="clinical-card p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="data-kicker">
            History tools
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Showing {filteredCount} of {totalCount} saved entries
          </p>
        </div>

        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="clinical-chip self-start text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] sm:self-auto"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="input-base w-full pl-10"
        />
      </label>
    </div>
  );
}

interface LogHistoryGroupProps {
  label: string;
  count: number;
  children: ReactNode;
}

export function LogHistoryGroup({ label, count, children }: LogHistoryGroupProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h3 className="data-kicker">
          {label}
        </h3>
        <span className="clinical-chip min-h-7 px-2.5 text-[11px] text-[var(--color-text-tertiary)]">
          {count} {count === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

interface LogHistoryActionsProps {
  onUseAsTemplate?: () => void;
  templateLabel?: string;
  onSaveAsRoutine?: () => void;
  routineLabel?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function LogHistoryActions({
  onUseAsTemplate,
  templateLabel = 'Use template',
  onSaveAsRoutine,
  routineLabel = 'Save routine',
  onEdit,
  onDelete,
}: LogHistoryActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {onUseAsTemplate && (
        <button
          type="button"
          onClick={onUseAsTemplate}
          aria-label={`${templateLabel}: load this entry as a new unsaved log`}
          className="clinical-chip clinical-chip-intelligence text-[var(--gw-brand-300)] transition-smooth hover:border-[rgba(143,128,246,0.24)] hover:bg-[rgba(143,128,246,0.1)]"
        >
          <Copy className="h-3.5 w-3.5" />
          {templateLabel}
        </button>
      )}

      {onSaveAsRoutine && (
        <button
          type="button"
          onClick={onSaveAsRoutine}
          aria-label={`${routineLabel}: pin this saved entry as a dashboard routine`}
          className="clinical-chip clinical-chip-accent text-[var(--color-accent-primary)] transition-smooth hover:border-[rgba(84,160,255,0.26)] hover:bg-[rgba(84,160,255,0.1)]"
        >
          <Pin className="h-3.5 w-3.5" />
          {routineLabel}
        </button>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="clinical-chip clinical-chip-accent text-[var(--color-accent-primary)] transition-smooth hover:border-[rgba(84,160,255,0.26)] hover:bg-[rgba(84,160,255,0.1)]"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="clinical-chip text-[var(--color-danger)] transition-smooth hover:border-[rgba(255,120,120,0.26)] hover:bg-[rgba(255,120,120,0.1)]"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}

interface LogHistoryNoMatchesProps {
  query: string;
  onClear: () => void;
}

export function LogHistoryNoMatches({ query, onClear }: LogHistoryNoMatchesProps) {
  return (
    <div className="clinical-card px-5 py-8 text-center">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">No matching entries</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
        No saved history matched "{query}". Clear the search to return to the full timeline.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="clinical-chip mt-4 text-[var(--color-text-secondary)] transition-smooth hover:text-[var(--color-text-primary)]"
      >
        Clear search
      </button>
    </div>
  );
}
