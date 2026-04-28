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
    <div className="mb-lg flex w-fit gap-1 rounded-2xl border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.36)] p-1">
      <button
        type="button"
        onClick={onShowNew}
        className={`flex items-center rounded-xl px-4 py-2 text-body-sm font-semibold transition-smooth ${
          !showHistory
            ? 'border border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.16)] text-[var(--gw-intelligence-200)] shadow-[0_0_22px_rgba(139,92,246,0.14)]'
            : 'text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]'
        }`}
      >
        {newIcon}
        {newLabel}
      </button>
      <button
        type="button"
        onClick={onShowHistory}
        className={`flex items-center rounded-xl px-4 py-2 text-body-sm font-semibold transition-smooth ${
          showHistory
            ? 'border border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.16)] text-[var(--gw-intelligence-200)] shadow-[0_0_22px_rgba(139,92,246,0.14)]'
            : 'text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]'
        }`}
      >
        {historyIcon}
        {historyLabel}
      </button>
    </div>
  );
}
