import { useCallback, useEffect, useRef } from 'react';
import { Brain, Layers, ShieldCheck, TrendingUp, X } from 'lucide-react';

interface GutIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  showHintDismiss?: boolean;
  onDismissHint?: () => void;
}

const SIGNAL_ITEMS = [
  { label: 'Bowel movements & Bristol scale' },
  { label: 'Food, meals & caffeine intake' },
  { label: 'Hydration levels' },
  { label: 'Sleep quality & duration' },
  { label: 'Stress & mood signals' },
  { label: 'Symptoms & severity' },
  { label: 'Medication & adherence' },
  { label: 'Exercise & movement' },
  { label: 'Optional medical context' },
];

export default function GutIntelligenceModal({
  isOpen,
  onClose,
  showHintDismiss,
  onDismissHint,
}: GutIntelligenceModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute('disabled'));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement;
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose, getFocusableElements]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gut-intelligence-modal-title"
      aria-describedby="gut-intelligence-modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-all duration-300"
    >
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="animate-overlay-in absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <div
        ref={modalRef}
        className="intelligence-console animate-modal-in relative flex w-full max-w-lg flex-col rounded-[32px]"
        style={{ maxHeight: 'min(90vh, 680px)' }}
      >
        <div className="relative flex flex-shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[rgba(197,168,255,0.24)] bg-[rgba(139,92,246,0.18)] text-[var(--gw-intelligence-200)]">
              <Brain className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="gut-intelligence-modal-title"
                className="font-sora text-base font-semibold leading-tight text-[var(--color-text-primary)]"
              >
                How GutWise intelligence works
              </h2>
              <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                Pattern detection, not diagnosis
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            className="motion-icon-button mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[var(--color-text-tertiary)] transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="mb-5 space-y-3">
            <p id="gut-intelligence-modal-description" className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              GutWise combines signals from bowel movements, food, hydration, sleep, stress,
              symptoms, medication, exercise, and optional medical context to detect structured
              patterns across your health history.
            </p>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Rather than analyzing isolated events, the intelligence layer ranks meaningful
              correlations over time and surfaces observational insights presented as
              clinician-friendly summaries.
            </p>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              This is pattern detection, not diagnosis. GutWise identifies recurring relationships
              in your personal data and presents them with appropriate confidence and context.
            </p>
          </div>

          <div className="motion-card mb-5 rounded-2xl border border-[rgba(202,190,255,0.12)] bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--gw-brand-300)]" aria-hidden="true" />
              <span className="data-kicker">Signals analyzed</span>
            </div>
            <div className="motion-stagger grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {SIGNAL_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--gw-intelligence-400)]" />
                  <span className="text-xs text-[var(--color-text-tertiary)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="motion-card space-y-3 rounded-2xl border border-[rgba(202,190,255,0.1)] bg-white/[0.025] p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--gw-brand-300)]" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                Insights emerge from patterns over days and weeks. More consistent logging gives
                GutWise better evidence to compare.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--gw-brand-300)]" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                Pattern language stays bounded: evidence, confidence, and missing context remain
                visible.
              </p>
            </div>
          </div>

          {showHintDismiss && onDismissHint && (
            <div className="mt-5 flex justify-center border-t border-white/5 pt-4">
              <button
                onClick={onDismissHint}
                className="motion-nav-link inline-flex rounded px-1 text-xs text-[var(--color-text-tertiary)] transition-colors duration-200 hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-discovery-500"
              >
                Hide this hint next time
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
