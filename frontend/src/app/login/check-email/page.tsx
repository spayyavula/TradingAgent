import Link from "next/link";

export const metadata = {
  title: "Check your email — TradingAgents",
};

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="px-6 lg:px-10 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-7 rounded-xl bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] grid place-items-center text-white text-[13px] font-semibold tracking-tight">
            T
          </div>
          <span className="text-label text-[15px] font-semibold tracking-tight">
            TradingAgents
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[400px] surface-card p-8 text-center">
          <div className="mx-auto size-12 rounded-2xl bg-[color-mix(in_oklch,var(--tint)_18%,transparent)] grid place-items-center text-[var(--tint)] mb-5">
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-label">
            Check your inbox
          </h1>
          <p className="mt-3 text-[14px] text-label-secondary leading-relaxed">
            We sent you a sign-in link. Click it to finish signing in. The link
            expires in 24 hours.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center px-4 rounded-full text-[13.5px] font-medium text-label border border-[var(--separator-strong)] hover:bg-[color-mix(in_oklch,var(--separator)_30%,var(--bg-elevated))] transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
