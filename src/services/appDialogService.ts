export const APP_DIALOG_REQUEST_EVENT = 'gutwise:app-dialog-request';

type DialogTone = 'default' | 'danger';

interface DialogOptionsBase {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
}

export interface ConfirmationDialogRequest extends DialogOptionsBase {
  id: string;
  kind: 'confirm';
  resolve: (value: boolean) => void;
}

export interface TextInputDialogRequest extends DialogOptionsBase {
  id: string;
  kind: 'text';
  defaultValue?: string;
  inputLabel?: string;
  placeholder?: string;
  required?: boolean;
  resolve: (value: string | null) => void;
}

export type AppDialogRequest = ConfirmationDialogRequest | TextInputDialogRequest;

type ConfirmationDialogOptions = DialogOptionsBase;

interface TextInputDialogOptions extends DialogOptionsBase {
  defaultValue?: string;
  inputLabel?: string;
  placeholder?: string;
  required?: boolean;
}

let dialogCounter = 0;

function nextDialogId(): string {
  dialogCounter += 1;
  return `dialog-${Date.now()}-${dialogCounter}`;
}

function canDispatchDialog(): boolean {
  return typeof window !== 'undefined' && typeof window.dispatchEvent === 'function';
}

export function requestConfirmation(options: ConfirmationDialogOptions): Promise<boolean> {
  if (!canDispatchDialog()) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const request: ConfirmationDialogRequest = {
      id: nextDialogId(),
      kind: 'confirm',
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      tone: options.tone,
      resolve,
    };

    window.dispatchEvent(
      new CustomEvent<AppDialogRequest>(APP_DIALOG_REQUEST_EVENT, {
        detail: request,
      })
    );
  });
}

export function requestTextInput(options: TextInputDialogOptions): Promise<string | null> {
  if (!canDispatchDialog()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const request: TextInputDialogRequest = {
      id: nextDialogId(),
      kind: 'text',
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      tone: options.tone,
      defaultValue: options.defaultValue,
      inputLabel: options.inputLabel,
      placeholder: options.placeholder,
      required: options.required,
      resolve,
    };

    window.dispatchEvent(
      new CustomEvent<AppDialogRequest>(APP_DIALOG_REQUEST_EVENT, {
        detail: request,
      })
    );
  });
}