/**
 * Loading primitives.
 *
 * Next's App Router renders the nearest `loading.tsx` the instant a navigation
 * starts and keeps it up until the server component finishes its database
 * reads. These are the pieces those files are built from.
 *
 * Two rules hold the set together:
 *
 *   1. A skeleton mirrors the shape of what is coming. The events grid loads
 *      into a grid of poster-shaped cards, the schedule into rows. Nothing
 *      jumps when the real content lands.
 *   2. Every loader states what it is doing in the mono voice the rest of the
 *      site uses. "RESOLVING EVENTS" reads as instrumentation, not a stall.
 *
 * All server components: no client JS ships for any of this.
 */

/* ------------------------------------------------------------- skeleton --- */

export function Skel({
  className = '',
  delay = 0,
}: {
  className?: string;
  /** 0 to 3, staggers the sweep so a grid ripples instead of strobing. */
  delay?: 0 | 1 | 2 | 3;
}) {
  return <div className={`skeleton ${delay ? `skeleton-delay-${delay}` : ''} ${className}`} />;
}

/** A run of text lines, last one short like a real paragraph. */
export function SkelText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skel
          key={i}
          delay={(i % 3) as 0 | 1 | 2}
          className={`h-3 ${i === lines - 1 ? 'w-2/5' : i % 2 ? 'w-11/12' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- header --- */

/** Stands in for PageHeader: index strip, rule, display heading, blurb. */
export function SkelPageHeader({ index, slug }: { index: string; slug: string }) {
  return (
    <header className="mb-12">
      <div className="flex items-center gap-4">
        <span className="tag-index shrink-0">[{index}]</span>
        <span className="mono-label shrink-0 text-slate-400">{slug}</span>
        <span className="h-px flex-1 bg-white/10" />
        <span className="mono-label shrink-0 text-brand-500">LOADING</span>
      </div>

      <Skel className="mt-6 h-12 w-2/3 max-w-md sm:h-16" />
      <SkelText lines={2} className="mt-6 max-w-2xl" />
    </header>
  );
}

/* --------------------------------------------------------------- status --- */

/**
 * The readout that tells you the page is talking to the database. A crimson
 * rule sweeps underneath on a loop, so a slow query looks deliberate.
 */
export function LoadStatus({ label }: { label: string }) {
  return (
    <div className="mt-14 flex flex-col items-center">
      <p className="font-mono text-[11px] uppercase tracking-label text-slate-400">
        {label}
        <span className="ml-1.5 inline-block h-3 w-1.5 translate-y-px bg-brand-600 animate-blink" />
      </p>

      <div className="mt-5 h-px w-48 overflow-hidden bg-white/10 sm:w-64">
        <div
          className="h-px w-full bg-brand-600"
          style={{ animation: 'loadRule 1.5s cubic-bezier(0.4,0,0.2,1) infinite' }}
        />
      </div>
    </div>
  );
}

/**
 * Centred loader for routes with no meaningful shape to mirror, and the shell
 * behind every route-level file: registration brackets, mark, status line.
 */
export function LoadPanel({ label = 'Resolving' }: { label?: string }) {
  return (
    <div className="panel brackets flex flex-col items-center px-8 py-24">
      <svg viewBox="0 0 200 200" className="h-20 w-20 text-white sm:h-24 sm:w-24" fill="none">
        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeOpacity="0.08" />
        <circle
          cx="100"
          cy="100"
          r="66"
          stroke="var(--brand)"
          strokeOpacity="0.35"
          strokeDasharray="2 8"
          className="bp-spin-rev"
          style={{ transformOrigin: '100px 100px' }}
        />
        <path
          d="M28 56 L172 56 L100 178 Z"
          pathLength={1}
          stroke="var(--brand)"
          strokeWidth="3"
          strokeLinejoin="round"
          className="bp-draw"
        />
        <path
          d="M60 74 L100 158 L140 74"
          pathLength={1}
          stroke="#e0685e"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="bp-draw"
          style={{ animationDelay: '0.35s' }}
        />
      </svg>

      <LoadStatus label={label} />
    </div>
  );
}

/* ---------------------------------------------------------------- cards --- */

/** Matches EventCard: dossier header, 4:5 poster, title and metadata grid. */
export function SkelEventCard({ delay = 0 }: { delay?: 0 | 1 | 2 | 3 }) {
  return (
    <div className="panel flex flex-col">
      <Skel delay={delay} className="h-11 w-full !border-0" />
      <Skel delay={delay} className="aspect-poster w-full !border-0" />
      <div className="flex flex-col gap-3 p-5">
        <Skel delay={delay} className="h-6 w-4/5" />
        <Skel delay={delay} className="h-3 w-3/5" />
        <Skel delay={delay} className="mt-3 h-14 w-full" />
      </div>
    </div>
  );
}

export function SkelEventGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkelEventCard key={i} delay={(i % 4) as 0 | 1 | 2 | 3} />
      ))}
    </div>
  );
}

/** A stack of horizontal rows: schedule, team, club directory. */
export function SkelRows({
  count = 6,
  height = 'h-20',
}: {
  count?: number;
  height?: string;
}) {
  return (
    <div className="grid gap-px border border-white/[0.08] bg-white/[0.08]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-5 bg-ink-950 p-5">
          <Skel delay={(i % 3) as 0 | 1 | 2} className={`w-14 shrink-0 ${height}`} />
          <div className="flex-1 space-y-2.5">
            <Skel delay={(i % 3) as 0 | 1 | 2} className="h-4 w-1/3" />
            <Skel delay={(i % 3) as 0 | 1 | 2} className="h-3 w-2/3" />
          </div>
          <Skel delay={(i % 3) as 0 | 1 | 2} className="hidden h-3 w-24 shrink-0 sm:block" />
        </div>
      ))}
    </div>
  );
}

/** A tiled wall: sponsors, club logos, merch. */
export function SkelTiles({
  count = 8,
  aspect = 'aspect-[3/2]',
  cols = 'sm:grid-cols-3 lg:grid-cols-4',
}: {
  count?: number;
  aspect?: string;
  cols?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skel key={i} delay={(i % 4) as 0 | 1 | 2 | 3} className={`w-full ${aspect}`} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- shell --- */

/** The wrapper every route-level loading.tsx uses, so padding never drifts. */
export function LoadShell({
  index,
  slug,
  children,
}: {
  index: string;
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36" role="status" aria-busy="true">
      <span className="sr-only">Loading</span>
      <SkelPageHeader index={index} slug={slug} />
      {children}
    </div>
  );
}
