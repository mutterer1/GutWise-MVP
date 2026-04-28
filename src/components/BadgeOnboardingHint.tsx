interface BadgeOnboardingHintProps {
  visible: boolean;
}

export default function BadgeOnboardingHint({ visible }: BadgeOnboardingHintProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 select-none flex-col items-center"
      style={{ bottom: 'calc(100% + 6px)', zIndex: 10 }}
      aria-hidden="true"
    >
      <div
        className="hint-pulse mb-0.5 whitespace-nowrap rounded-full border border-[rgba(197,168,255,0.28)] bg-[rgba(139,92,246,0.13)] px-3 py-1.5 text-xs font-semibold text-[var(--gw-intelligence-200)] backdrop-blur-md"
      >
        See how intelligence works
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '6px solid rgba(124, 92, 255, 0.35)',
        }}
      />
    </div>
  );
}
