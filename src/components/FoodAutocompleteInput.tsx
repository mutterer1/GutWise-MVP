import { useEffect, useRef, useState } from 'react';
import {
  searchFoodSuggestionsWithFallback,
  type FoodReferenceSuggestion,
} from '../services/referenceSearchService';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: FoodReferenceSuggestion) => void;
  onSubmit: () => void;
}

export default function FoodAutocompleteInput({
  value,
  onChange,
  onSelect,
  onSubmit,
}: Props) {
  const [suggestions, setSuggestions] = useState<FoodReferenceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      const results = await searchFoodSuggestionsWithFallback(value);
      if (cancelled) return;

      setSuggestions(results);
      setOpen(results.length > 0 && value.trim().length > 1);
      setActiveIndex(-1);
    }

    void runSearch();
    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex]);
      } else {
        setOpen(false);
        onSubmit();
      }
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleSelect(suggestion: FoodReferenceSuggestion) {
    onSelect(suggestion);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0 && value.trim().length > 0) {
            setOpen(true);
          }
        }}
        placeholder="Add food item..."
        autoComplete="off"
        className="input-base w-full"
      />

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-[240] mt-2 overflow-hidden rounded-[22px]"
          style={{
            background: 'rgba(10, 14, 32, 0.98)',
            border: '1px solid rgba(197,168,255,0.22)',
            boxShadow:
              '0 24px 64px rgba(0,0,0,0.52), 0 0 42px rgba(139,92,246,0.18)',
            maxHeight: '280px',
            overflowY: 'auto',
            backdropFilter: 'blur(18px)',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(suggestion);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                index === activeIndex ? 'bg-[rgba(139,92,246,0.16)]' : 'hover:bg-white/[0.055]'
              }`}
            >
              <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                {suggestion.name}
              </span>
              {(suggestion.estimatedCalories || suggestion.portionLabel || suggestion.detail) && (
                <span className="ml-3 shrink-0 font-mono text-xs text-[var(--color-text-tertiary)] tabular-nums">
                  {suggestion.estimatedCalories
                    ? `~${suggestion.estimatedCalories} cal`
                    : suggestion.detail}
                  {suggestion.estimatedCalories && suggestion.portionLabel ? ' | ' : ''}
                  {!suggestion.estimatedCalories &&
                  suggestion.detail &&
                  suggestion.portionLabel
                    ? ' | '
                    : ''}
                  {suggestion.portionLabel ?? ''}
                </span>
              )}
            </button>
          ))}

          {value.trim().length > 0 && (
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                setOpen(false);
                onSubmit();
              }}
              className="w-full flex items-center px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
              style={{ borderTop: '1px solid rgba(197,168,255,0.14)' }}
            >
              <span className="text-sm text-[var(--color-text-tertiary)]">
                Add &ldquo;{value.trim()}&rdquo; as custom food
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
