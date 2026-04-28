import Link from "next/link";

export const metadata = {
  title: "A trading desk of AI analysts",
  description:
    "A multi-agent LLM framework that mirrors a real trading firm: analysts, researchers, trader, risk team, and portfolio manager — collaborating on every decision.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full">
      <NavBar />
      <Hero />
      <Features />
      <Architecture />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function NavBar() {
  return (
    <header className="sticky top-0 z-40 chrome-blur">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-14 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center gap-2.5"
        >
          <div className="size-7 rounded-xl bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6]" />
        </Link>
        <nav className="flex items-center gap-1.5">
          <a
            href="#features"
            className="hidden sm:inline-flex h-9 items-center px-3 rounded-lg text-[13.5px] text-label-secondary hover:text-label transition-colors"
          >
            Features
          </a>
          <a
            href="#architecture"
            className="hidden sm:inline-flex h-9 items-center px-3 rounded-lg text-[13.5px] text-label-secondary hover:text-label transition-colors"
          >
            Architecture
          </a>
          <a
            href="https://arxiv.org/abs/2412.20138"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex h-9 items-center px-3 rounded-lg text-[13.5px] text-label-secondary hover:text-label transition-colors"
          >
            Paper
          </a>
          <Link
            href="/dashboard"
            className="ml-1 inline-flex h-9 items-center px-4 rounded-full text-[13.5px] font-medium text-white bg-[var(--tint)] hover:opacity-90 transition-opacity"
          >
            Open dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--tint) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--separator)] bg-[var(--bg-elevated)] px-3 py-1 text-[12px] text-label-secondary mb-6">
          <span className="size-1.5 rounded-full bg-[var(--color-accent-green)]" />
          v0.2.4 — structured agents, checkpoint resume, multi-provider
        </div>
        <h1 className="mx-auto max-w-4xl text-[40px] sm:text-[56px] lg:text-[68px] font-semibold tracking-tight leading-[1.05] text-label">
          A trading desk of AI analysts,
          <br />
          <span className="bg-gradient-to-br from-[#0a84ff] to-[#bf5af2] bg-clip-text text-transparent">
            not a single model.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[17px] sm:text-[19px] leading-relaxed text-label-secondary">
          Fundamental, sentiment, news, and technical analysts — plus a
          research, risk, and portfolio team — collaborate on every decision,
          with persistent memory carrying lessons forward.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center px-6 rounded-full text-[15px] font-medium text-white bg-[var(--tint)] hover:opacity-90 transition-opacity"
          >
            Get started
            <svg
              viewBox="0 0 20 20"
              className="ml-2 size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8 5l5 5-5 5" />
            </svg>
          </Link>
          <a
            href="https://github.com/TauricResearch/TradingAgents"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center px-6 rounded-full text-[15px] font-medium text-label border border-[var(--separator-strong)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <GitHubIcon className="mr-2 size-[18px]" />
            View on GitHub
          </a>
        </div>
        <p className="mt-5 text-[12.5px] text-label-tertiary">
          Open source · Apache 2.0 · Research-only · Not financial advice
        </p>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      title: "A team, not a model",
      body: "Specialized analyst, researcher, trader, and risk-management agents collaborate through structured debates — bull vs. bear, conservative vs. aggressive — before any decision is made.",
      icon: TeamIcon,
      tone: "blue",
    },
    {
      title: "Memory that compounds",
      body: "Every closed decision feeds back: realised return vs. SPY, a one-paragraph reflection, and lessons injected into the next run's portfolio-manager prompt.",
      icon: MemoryIcon,
      tone: "purple",
    },
    {
      title: "Resume from any crash",
      body: "LangGraph checkpoint after every node. A killed run picks up at the last successful step instead of paying for the analysis again.",
      icon: ResumeIcon,
      tone: "green",
    },
    {
      title: "Provider-agnostic",
      body: "OpenAI, Anthropic, Google, xAI, DeepSeek, Qwen, GLM, OpenRouter, Azure, and local Ollama — swap providers in one config line.",
      icon: PluggableIcon,
      tone: "orange",
    },
    {
      title: "Structured, auditable output",
      body: "Research Manager, Trader, and Portfolio Manager emit typed verdicts on a five-tier rating scale — no fragile JSON-from-prose parsing.",
      icon: AuditIcon,
      tone: "indigo",
    },
    {
      title: "Run it your way",
      body: "Interactive CLI for hands-on use. FastAPI + Next.js dashboard for a UI. Docker compose for everything-in-a-box.",
      icon: SurfaceIcon,
      tone: "red",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
      <div className="text-center mb-14">
        <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--tint)]">
          Why this approach
        </p>
        <h2 className="mt-3 text-[32px] sm:text-[40px] font-semibold tracking-tight text-label max-w-2xl mx-auto leading-tight">
          The work a real desk does — without the headcount.
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(({ title, body, icon: Icon, tone }) => (
          <div key={title} className="surface-card p-6 flex flex-col gap-3">
            <div
              className="size-10 rounded-xl grid place-items-center"
              style={{
                background: `color-mix(in oklch, var(--color-accent-${tone}) 18%, transparent)`,
                color: `var(--color-accent-${tone})`,
              }}
            >
              <Icon className="size-[20px]" />
            </div>
            <h3 className="text-[17px] font-semibold tracking-tight text-label">
              {title}
            </h3>
            <p className="text-[14px] leading-relaxed text-label-secondary">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Architecture() {
  const stages = [
    {
      label: "Analysts",
      detail: "Fundamentals · Sentiment · News · Technical",
      tone: "blue",
    },
    {
      label: "Researchers",
      detail: "Bull vs. Bear debate to balance the view",
      tone: "purple",
    },
    {
      label: "Trader",
      detail: "Composes reports into a sized proposal",
      tone: "indigo",
    },
    {
      label: "Risk team",
      detail: "Volatility, liquidity, and exposure checks",
      tone: "orange",
    },
    {
      label: "Portfolio Manager",
      detail: "Final approve / reject — to the simulated exchange",
      tone: "green",
    },
  ];
  return (
    <section
      id="architecture"
      className="bg-[var(--bg-grouped)] border-y border-[var(--separator)]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
        <div className="text-center mb-12">
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--tint)]">
            How a decision is made
          </p>
          <h2 className="mt-3 text-[32px] sm:text-[40px] font-semibold tracking-tight text-label max-w-2xl mx-auto leading-tight">
            Five stages. One auditable trade.
          </h2>
        </div>
        <ol className="grid gap-3 lg:grid-cols-5">
          {stages.map((s, i) => (
            <li
              key={s.label}
              className="surface-card p-5 flex flex-col gap-3 relative"
            >
              <div className="flex items-center justify-between">
                <div
                  className="size-7 rounded-full grid place-items-center text-[12px] font-semibold"
                  style={{
                    background: `color-mix(in oklch, var(--color-accent-${s.tone}) 20%, transparent)`,
                    color: `var(--color-accent-${s.tone})`,
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-label-quaternary">
                  Stage
                </span>
              </div>
              <h3 className="text-[16px] font-semibold tracking-tight text-label">
                {s.label}
              </h3>
              <p className="text-[13px] leading-relaxed text-label-secondary">
                {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24">
      <div
        className="surface-card p-10 sm:p-14 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, color-mix(in oklch, var(--color-accent-blue) 12%, var(--bg-elevated)), color-mix(in oklch, var(--color-accent-purple) 10%, var(--bg-elevated)))",
        }}
      >
        <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-tight text-label">
          Run your first analysis in under five minutes.
        </h2>
        <p className="mt-4 text-[15.5px] text-label-secondary max-w-xl mx-auto leading-relaxed">
          Drop in your provider key, pick a ticker, and watch the firm
          deliberate.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center px-7 rounded-full text-[15px] font-medium text-white bg-[var(--tint)] hover:opacity-90 transition-opacity"
          >
            Open dashboard
            <svg
              viewBox="0 0 20 20"
              className="ml-2 size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8 5l5 5-5 5" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--separator)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6]" />
          <span className="text-[13px] text-label-secondary">
            Multi-agent LLM trading framework
          </span>
        </div>
        <div className="flex items-center gap-5 text-[13px] text-label-tertiary">
          <a
            href="https://github.com/TauricResearch/TradingAgents"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-label transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://arxiv.org/abs/2412.20138"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-label transition-colors"
          >
            arXiv
          </a>
          <a
            href="https://discord.com/invite/hk9PGKShPK"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-label transition-colors"
          >
            Discord
          </a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.93 10.93 0 015.75 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function TeamIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 19c.7-3 3.2-5 6-5s5.3 2 6 5" />
      <path d="M14.5 19c.4-1.7 1.7-3 3.5-3s3.1 1.3 3.5 3" />
    </svg>
  );
}

function MemoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 6h16v12H4z" />
      <path d="M8 3v3M16 3v3M8 18v3M16 18v3M3 9h3M3 13h3M18 9h3M18 13h3" />
    </svg>
  );
}

function ResumeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 11-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}

function PluggableIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 7V3M15 7V3M7 7h10v6a5 5 0 01-10 0z" />
      <path d="M12 18v3" />
    </svg>
  );
}

function AuditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SurfaceIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
