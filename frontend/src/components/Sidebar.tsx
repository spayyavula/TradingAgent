"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  disabled?: boolean;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: GridIcon },
  { href: "/analyze", label: "New analysis", icon: SparkleIcon },
  { href: "/history", label: "Decisions", icon: ListIcon },
  { href: "/tickers", label: "Tickers", icon: TickerIcon },
  { href: "/broker", label: "Broker", icon: BrokerIcon },
];

const HIDE_ON = ["/", "/login"];

export function Sidebar({ userBadge }: { userBadge?: ReactNode }) {
  const pathname = usePathname();
  if (
    pathname &&
    (HIDE_ON.includes(pathname) || pathname.startsWith("/login/"))
  ) {
    return null;
  }
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col chrome-blur sticky top-0 h-screen px-3 py-5 gap-1">
      <div className="px-3 pb-4 flex items-center gap-2">
        <div className="size-8 rounded-xl bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] grid place-items-center text-white text-[15px] font-semibold tracking-tight">
          T
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-label text-[15px] font-semibold tracking-tight">TradingAgents</span>
          <span className="text-label-tertiary text-[11px]">Multi-agent dashboard</span>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {items.map(({ href, label, icon: Icon, disabled }) => {
          const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
          if (disabled) {
            return (
              <span
                key={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-label-tertiary cursor-not-allowed"
              >
                <Icon className="size-[18px]" />
                <span>{label}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-label-quaternary">
                  Soon
                </span>
              </span>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-colors ${
                active
                  ? "bg-[color-mix(in_oklch,var(--tint)_14%,transparent)] text-[var(--tint)] font-medium"
                  : "text-label-secondary hover:text-label hover:bg-[color-mix(in_oklch,var(--separator)_60%,transparent)]"
              }`}
            >
              <Icon className="size-[18px]" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-3 flex flex-col gap-2.5">
        {userBadge}
        <div className="rounded-xl border border-[var(--separator)] p-3 text-[11px] text-label-tertiary leading-relaxed">
          Local-only · Dark-mode native · PWA installable
        </div>
      </div>
    </aside>
  );
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
      <path d="M6 5h11M6 10h11M6 15h11" />
      <circle cx="3.5" cy="5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="15" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TickerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 14l4-5 3 3 7-8" />
      <path d="M14 4h3v3" />
    </svg>
  );
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 3v3M10 14v3M3 10h3M14 10h3M5.5 5.5l2 2M12.5 12.5l2 2M14.5 5.5l-2 2M7.5 12.5l-2 2" />
    </svg>
  );
}

function BrokerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 8h14M5 8v8h10V8M7 8V5a3 3 0 016 0v3" />
    </svg>
  );
}
