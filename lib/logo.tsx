// WTFood logo: a bowl with chopsticks. Placeholder until we have a real logo.
export function Logo({ size = 48, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M40 6 L26 33" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M49 9 L32 33" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M9 31 H55 A23 23 0 0 1 9 31 Z" fill={color} />
      <rect x="24" y="53" width="16" height="5" rx="2.5" fill={color} />
    </svg>
  );
}
