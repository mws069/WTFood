import { Logo } from "./logo";

// App icon artwork: the white logo on brand blue, drawn as SVG so no image
// files are needed. Used by app/icon.tsx and app/apple-icon.tsx.
// The logo keeps a wide margin so Android's round "maskable" crop doesn't cut it.
export function AppIcon({ size }: { size: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1677ff",
      }}
    >
      <Logo size={Math.round(size * 0.58)} color="#ffffff" />
    </div>
  );
}
