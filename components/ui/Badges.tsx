import type { Severity } from "@/lib/types";

export function ConfidenceBadge({ value }: { value: number }) {
  const tone =
    value >= 85
      ? "bg-accent-soft text-accent"
      : value >= 60
        ? "bg-warn-soft text-warn"
        : "bg-danger-soft text-danger";
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10.5px] font-medium ${tone}`}
      title="Model confidence"
    >
      {value}%
    </span>
  );
}

const SEVERITY_TONES: Record<Severity, string> = {
  low: "bg-info-soft text-info",
  medium: "bg-warn-soft text-warn",
  high: "bg-danger-soft text-danger",
  critical: "bg-danger text-bg",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${SEVERITY_TONES[severity]}`}
    >
      {severity}
    </span>
  );
}

export function ComplexityChip({
  value,
  tone = "neutral",
}: {
  value: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const cls =
    tone === "good"
      ? "bg-accent-soft text-accent"
      : tone === "bad"
        ? "bg-warn-soft text-warn"
        : "bg-raised text-ink";
  return (
    <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>
      {value}
    </span>
  );
}
