import { useEffect, useState } from "react";

export function Aurora() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.3 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="blob h-[38rem] w-[38rem]"
        style={{
          background: "oklch(0.65 0.2 300)",
          left: `${pos.x * 18 - 8}%`,
          top: `${pos.y * 14 - 10}%`,
          transition: "left 1.2s ease-out, top 1.2s ease-out",
        }}
      />
      <div
        className="blob h-[32rem] w-[32rem]"
        style={{
          background: "oklch(0.58 0.2 300)",
          right: `${10 - pos.x * 12}%`,
          top: "22%",
          animationDelay: "-6s",
          transition: "right 1.4s ease-out",
        }}
      />
      <div
        className="blob h-[30rem] w-[30rem]"
        style={{
          background: "oklch(0.8 0.14 305)",
          left: "28%",
          bottom: `${-10 + pos.y * 8}%`,
          animationDelay: "-11s",
          transition: "bottom 1.4s ease-out",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(var(--glass-border) 1px, transparent 1px), linear-gradient(90deg, var(--glass-border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 75%)",
        }}
      />
    </div>
  );
}
