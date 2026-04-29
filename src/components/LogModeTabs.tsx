interface LogModeTabsProps {
  showHistory: boolean;
  onShowNew: () => void;
  onShowHistory: () => void;
  newIcon?: React.ReactNode;
  historyIcon?: React.ReactNode;
  newLabel?: string;
  historyLabel?: string;
}

export default function LogModeTabs({
  showHistory,
  onShowNew,
  onShowHistory,
  newIcon,
  historyIcon,
  newLabel = 'New Entry',
  historyLabel = 'History',
}: LogModeTabsProps) {
  return (
    <div
      className="mb-5 flex w-full flex-col gap-1 rounded-[var(--gw-radius-lg)] border border-[rgba(197,168,255,0.12)] bg-[rgba(7,10,24,0.28)] p-1 sm:w-fit sm:flex-row"
      role="group"
      aria-label="Log view"
    >
      <button
        type="button"
        onClick={onShowNew}
        aria-pressed={!showHistory}
        className={`flex min-h-10 items-center justify-center rounded-[var(--gw-radius-md)] px-4 py-2 text-body-sm font-semibold transition-smooth ${
          !showHistory
            ? 'border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.1)] text-[var(--gw-intelligence-200)]'
            : 'text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]'
        }`}
      >
        {newIcon}
        {newLabel}
      </button>
      <button
        type="button"
        onClick={onShowHistory}
        aria-pressed={showHistory}
        className={`flex min-h-10 items-center justify-center rounded-[var(--gw-radius-md)] px-4 py-2 text-body-sm font-semibold transition-smooth ${
          showHistory
            ? 'border border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.1)] text-[var(--gw-intelligence-200)]'
            : 'text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]'
        }`}
      >
        {historyIcon}
        {historyLabel}
      </button>
    </div>
  );
}
