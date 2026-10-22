// App icon artwork, drawn in code (no image files), used by app/icon.tsx and
// app/apple-icon.tsx: a glowing blue gradient, scan-frame corners around the
// bowl with chopsticks, and a small gradient "AI" badge.
// Everything important stays in the middle ~70 %, so Android's round
// "maskable" crop doesn't cut it.
export function AppIcon({ size }: { size: number }) {
  const u = size / 100; // 1 unit = 1 % of the icon
  const corner = (rotate: number) => (
    <svg width={18 * u} height={18 * u} viewBox="0 0 18 18" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M2 16V6a4 4 0 0 1 4-4h10" stroke="white" strokeOpacity="0.9" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    </svg>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(150deg, #5cb0ff 0%, #1677ff 48%, #0b47c9 100%)",
      }}
    >
      {/* soft light from the top left and a cool glow at the bottom right */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "radial-gradient(circle at 22% 18%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "radial-gradient(circle at 85% 90%, rgba(120,90,255,0.55) 0%, rgba(120,90,255,0) 45%)",
        }}
      />

      {/* scan frame */}
      <div style={{ position: "absolute", left: 20 * u, top: 17 * u, display: "flex" }}>{corner(0)}</div>
      <div style={{ position: "absolute", right: 20 * u, top: 17 * u, display: "flex" }}>{corner(90)}</div>
      <div style={{ position: "absolute", right: 20 * u, bottom: 27 * u, display: "flex" }}>{corner(180)}</div>
      <div style={{ position: "absolute", left: 20 * u, bottom: 27 * u, display: "flex" }}>{corner(270)}</div>

      {/* bowl with chopsticks */}
      <svg
        width={44 * u}
        height={44 * u}
        viewBox="0 0 64 64"
        style={{ position: "absolute", left: 28 * u, top: 23 * u }}
      >
        <path d="M40 6 L26 33" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M49 9 L32 33" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M9 31 H55 A23 23 0 0 1 9 31 Z" fill="white" />
        <rect x="24" y="53" width="16" height="5" rx="2.5" fill="white" />
      </svg>

      {/* "AI" badge */}
      <div
        style={{
          position: "absolute",
          bottom: 14 * u,
          left: 36 * u,
          width: 28 * u,
          height: 12 * u,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6 * u,
          background: "linear-gradient(90deg, #39e0ff 0%, #7a5cff 100%)",
          color: "white",
          fontSize: 8.5 * u,
          fontWeight: 800,
          letterSpacing: 0.5 * u,
        }}
      >
        AI
      </div>
    </div>
  );
}
