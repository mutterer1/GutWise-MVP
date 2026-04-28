import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import {
  APP_DIALOG_REQUEST_EVENT,
  type AppDialogRequest,
} from '../services/appDialogService';

function getCancelLabel(request: AppDialogRequest): string {
  return request.cancelLabel ?? 'Cancel';
}

function getConfirmLabel(request: AppDialogRequest): string {
  if (request.confirmLabel) return request.confirmLabel;
  return request.kind === 'confirm' ? 'Confirm' : 'Save';
}

export default function GlobalDialogHost() {
  const [request, setRequest] = useState<AppDialogRequest | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestRef = useRef<AppDialogRequest | null>(null);

  const resolveAndClose = useCallback(
    (value: boolean | string | null) => {
      const activeRequest = requestRef.current ?? request;
      if (!activeRequest) return;

      if (activeRequest.kind === 'confirm') {
        activeRequest.resolve(Boolean(value));
      } else {
        activeRequest.resolve(typeof value === 'string' ? value : null);
      }

      requestRef.current = null;
      setRequest(null);
      setInputValue('');
      setValidationMessage('');
    },
    [request]
  );

  const handleCancel = useCallback(() => {
    resolveAndClose(request?.kind === 'confirm' ? false : null);
  }, [request?.kind, resolveAndClose]);

  const handleConfirm = useCallback(() => {
    if (!request) return;

    if (request.kind === 'text') {
      const nextValue = inputValue.trim();

      if (request.required !== false && !nextValue) {
        setValidationMessage('Enter a name before continuing.');
        return;
      }

      resolveAndClose(nextValue);
      return;
    }

    resolveAndClose(true);
  }, [inputValue, request, resolveAndClose]);

  useEffect(() => {
    const listener = (event: Event) => {
      const dialogEvent = event as CustomEvent<AppDialogRequest>;
      const nextRequest = dialogEvent.detail;
      const currentRequest = requestRef.current;

      if (currentRequest) {
        if (currentRequest.kind === 'confirm') {
          currentRequest.resolve(false);
        } else {
          currentRequest.resolve(null);
        }
      }

      requestRef.current = nextRequest;
      setRequest(nextRequest);
      setInputValue(nextRequest.kind === 'text' ? nextRequest.defaultValue ?? '' : '');
      setValidationMessage('');
    };

    window.addEventListener(APP_DIALOG_REQUEST_EVENT, listener);

    return () => {
      window.removeEventListener(APP_DIALOG_REQUEST_EVENT, listener);
    };
  }, []);

  useEffect(() => {
    if (!request) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleCancel, request]);

  useEffect(() => {
    if (request?.kind !== 'text') return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);

    return () => window.clearTimeout(focusTimer);
  }, [request]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleConfirm();
  };

  if (!request) return null;

  const isDanger = request.tone === 'danger';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(6,10,24,0.74)] px-4 py-6 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleCancel();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg overflow-hidden rounded-[32px] border border-white/12 bg-[var(--color-surface)] shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${request.id}-title`}
        aria-describedby={request.message ? `${request.id}-description` : undefined}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isDanger
                  ? 'bg-[rgba(255,120,120,0.12)] text-[var(--color-danger)]'
                  : 'bg-[rgba(143,128,246,0.12)] text-[var(--gw-brand-300)]'
              }`}
            >
              {isDanger ? <AlertTriangle className="h-5 w-5" /> : <Check className="h-5 w-5" />}
            </div>

            <div>
              <h2
                id={`${request.id}-title`}
                className="text-xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]"
              >
                {request.title}
              </h2>
              {request.message && (
                <p
                  id={`${request.id}-description`}
                  className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]"
                >
                  {request.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:text-[var(--color-text-primary)]"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {request.kind === 'text' && (
          <div className="px-5 py-5 sm:px-6">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                {request.inputLabel ?? 'Name'}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  setValidationMessage('');
                }}
                placeholder={request.placeholder}
                className="input-base w-full"
              />
            </label>

            {validationMessage && (
              <p className="mt-2 text-sm text-[var(--color-danger)]">{validationMessage}</p>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-white/8 bg-black/[0.08] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-[var(--color-text-secondary)] transition-smooth hover:border-white/16 hover:text-[var(--color-text-primary)]"
          >
            {getCancelLabel(request)}
          </button>

          <button
            type="submit"
            className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition-smooth ${
              isDanger
                ? 'border border-[rgba(255,120,120,0.38)] bg-[rgba(255,120,120,0.82)] hover:bg-[rgba(255,120,120,0.94)]'
                : 'btn-primary'
            }`}
          >
            {getConfirmLabel(request)}
          </button>
        </div>
      </form>
    </div>
  );
}