import { LoadStatus, Skel, SkelPageHeader, SkelRows } from '@/components/Loading';

/** Tickets sits closer to the top of the page than the public routes. */
export default function Loading() {
  return (
    <div className="container-x pb-24 pt-16" role="status" aria-busy="true">
      <span className="sr-only">Loading tickets</span>
      <SkelPageHeader index="10" slug="TICKETS" />

      <div className="panel mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-3">
          <Skel className="h-5 w-40" />
          <Skel className="h-3 w-64" />
        </div>
        <Skel delay={1} className="h-11 w-full sm:w-36" />
      </div>

      <SkelRows count={5} height="h-14" />
      <LoadStatus label="Pricing tickets" />
    </div>
  );
}
