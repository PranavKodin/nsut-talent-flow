import type { Society } from "@/lib/societies";

export function SocietyLogo({
  society,
  size = 64,
  className = "",
}: {
  society: Pick<Society, "slug" | "name" | "short" | "accent" | "logoUrl">;
  size?: number;
  className?: string;
}) {
  if (society.logoUrl) {
    return (
      <img
        src={society.logoUrl}
        alt={`${society.name} logo`}
        width={size}
        height={size}
        className={`rounded-2xl object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  const initials = society.short || society.name.slice(0, 2).toUpperCase();
  const fontSize = size * 0.4;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`${society.name} logo`}
    >
      <rect width="64" height="64" rx="16" fill={society.accent} />
      <rect x="2" y="2" width="60" height="60" rx="14" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <text
        x="32"
        y="34"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="oklch(0.14 0.045 300)"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="Unbounded, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}
