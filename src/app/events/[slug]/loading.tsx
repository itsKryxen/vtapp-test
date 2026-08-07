import { LoadStatus, Skel, SkelText } from '@/components/Loading';

/**
 * Mirrors the event page: poster on the left, title and fact grid on the right.
 */
export default function Loading() {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36" role="status" aria-busy="true">
      <span className="sr-only">Loading event</span>

      <div className="flex items-center gap-4">
        <span className="tag-index shrink-0">[03]</span>
        <span className="mono-label shrink-0 text-slate-400">EVENT</span>
        <span className="h-px flex-1 bg-white/10" />
        <span className="mono-label shrink-0 text-brand-500">LOADING</span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Skel className="aspect-poster w-full" />

        <div>
          <Skel delay={1} className="h-3 w-28" />
          <Skel delay={1} className="mt-5 h-12 w-4/5 sm:h-16" />
          <SkelText lines={4} className="mt-7 max-w-2xl" />

          {/* fact grid */}
          <div className="mt-10 grid gap-px border border-white/30 bg-white/[0.08] sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-ink-950 p-5">
                <Skel delay={(i % 3) as 0 | 1 | 2} className="h-10 w-10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skel delay={(i % 3) as 0 | 1 | 2} className="h-2.5 w-16" />
                  <Skel delay={(i % 3) as 0 | 1 | 2} className="h-3.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>

          <Skel delay={2} className="mt-8 h-11 w-44" />
        </div>
      </div>

      <LoadStatus label="Fetching event" />
    </div>
  );
}
