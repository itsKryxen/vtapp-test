import { LoadStatus, Skel, SkelRows } from '@/components/Loading';

/**
 * The dashboard layout already supplies its own chrome, so this fills the
 * content well only: the four status counters, then the event list.
 */
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading dashboard</span>

      <div className="mb-8 grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel px-4 py-4">
            <Skel delay={(i % 4) as 0 | 1 | 2 | 3} className="h-8 w-12" />
            <Skel delay={(i % 4) as 0 | 1 | 2 | 3} className="mt-3 h-2.5 w-20" />
          </div>
        ))}
      </div>

      <SkelRows count={4} height="h-12" />
      <LoadStatus label="Loading your events" />
    </div>
  );
}
