import type { ReactNode } from "react";
import type { Rating, DecisionStatus } from "@/lib/api";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="chrome-blur sticky top-0 z-10 px-6 lg:px-10 py-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-label">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] text-label-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "positive" | "negative" | "warning";
}) {
  const valueColor =
    tone === "positive"
      ? "text-[var(--color-accent-green)]"
      : tone === "negative"
      ? "text-[var(--color-accent-red)]"
      : tone === "warning"
      ? "text-[var(--color-accent-orange)]"
      : "text-label";
  return (
    <div className="surface-tile p-5">
      <div className="text-[12px] uppercase tracking-wider text-label-tertiary font-medium">
        {label}
      </div>
      <div className={`mt-3 text-[34px] font-semibold tracking-tight ${valueColor}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-[12px] text-label-secondary">{hint}</div>}
    </div>
  );
}

const ratingStyles: Record<Rating, { fg: string; bg: string }> = {
  "Strong Buy": {
    fg: "text-[#0a84ff]",
    bg: "bg-[color-mix(in_oklch,#0a84ff_14%,transparent)]",
  },
  Buy: {
    fg: "text-[#30d158]",
    bg: "bg-[color-mix(in_oklch,#30d158_14%,transparent)]",
  },
  Hold: {
    fg: "text-[#ff9f0a]",
    bg: "bg-[color-mix(in_oklch,#ff9f0a_14%,transparent)]",
  },
  Sell: {
    fg: "text-[#ff453a]",
    bg: "bg-[color-mix(in_oklch,#ff453a_14%,transparent)]",
  },
  "Strong Sell": {
    fg: "text-[#ff3b30]",
    bg: "bg-[color-mix(in_oklch,#ff3b30_18%,transparent)]",
  },
};

export function RatingBadge({ rating }: { rating: Rating }) {
  const style = ratingStyles[rating] ?? ratingStyles.Hold;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-tight ${style.fg} ${style.bg}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-90" />
      {rating}
    </span>
  );
}

const statusStyles: Record<DecisionStatus, string> = {
  pending: "text-label-tertiary",
  win: "text-[var(--color-accent-green)]",
  loss: "text-[var(--color-accent-red)]",
  flat: "text-label-secondary",
};

export function StatusPill({ status }: { status: DecisionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-[var(--separator)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="surface-card p-10 grid place-items-center text-center">
      <div className="size-12 rounded-full bg-[color-mix(in_oklch,var(--separator)_70%,transparent)] grid place-items-center mb-3">
        <svg viewBox="0 0 24 24" className="size-6 text-label-tertiary" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-[16px] font-semibold text-label">{title}</div>
      {description && <div className="mt-1 text-[13px] text-label-secondary max-w-sm">{description}</div>}
    </div>
  );
}
