"use client";

export function scoreColor(value: number): string {
  if (value >= 75) return "var(--color-accent)";
  if (value >= 50) return "var(--color-warn)";
  return "var(--color-danger)";
}

export default function ScoreGauge({
  label,
  value,
  size = 74,
}: {
  label: string;
  value: number;
  size?: number;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const color = scoreColor(clamped);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (clamped / 100) * c}
            style={{ transition: "stroke-dashoffset 700ms ease, stroke 400ms" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold"
          style={{ color }}
        >
          {Math.round(clamped)}
        </span>
      </div>
      <span className="text-center text-[11px] leading-tight text-mute">
        {label}
      </span>
    </div>
  );
}
