import { useEffect, useState } from "react";

export function LoadingScreen({ minMs = 1500 }: { minMs?: number }) {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const a = setTimeout(() => setFading(true), minMs);
    const b = setTimeout(() => setGone(true), minMs + 650);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [minMs]);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background transition-all duration-700"
      style={{ opacity: fading ? 0 : 1, filter: fading ? "blur(14px)" : "none" }}
    >
      <div className="relative flex flex-col items-center">
        <div className="relative h-28 w-28">
          <span className="absolute inset-0 animate-[spin_2.4s_linear_infinite] rounded-full border-2 border-primary/25 border-t-primary" />
          <span className="absolute inset-3 animate-[spin_1.6s_linear_infinite_reverse] rounded-full border-2 border-accent/20 border-b-accent" />
          <span className="glass-strong absolute inset-7 flex items-center justify-center rounded-full">
            <span className="font-display text-gradient text-xl font-bold">NS</span>
          </span>
        </div>
        <p className="font-display mt-7 text-sm tracking-[0.42em] text-muted-foreground uppercase">
          NSUT Societies
        </p>
        <div className="mt-4 h-[3px] w-44 overflow-hidden rounded-full bg-secondary">
          <span className="bg-gradient-hero block h-full w-1/3 animate-[loadbar_1.3s_ease-in-out_infinite] rounded-full" />
        </div>
      </div>
    </div>
  );
}
