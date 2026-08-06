import { LoadStatus, Skel, SkelRows } from '@/components/Loading';

/** Review queue: a count strip, then the submissions waiting on a decision. */
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading review queue</span>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Skel className="h-8 w-44" />
        <Skel delay={1} className="h-3 w-28" />
      </div>

      <SkelRows count={5} height="h-16" />
      <LoadStatus label="Loading review queue" />
    </div>
  );
}
