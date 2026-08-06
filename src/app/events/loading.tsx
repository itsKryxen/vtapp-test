import { LoadShell, LoadStatus, Skel, SkelEventGrid } from '@/components/Loading';

export default function Loading() {
  return (
    <LoadShell index="03" slug="EVENTS">
      {/* filter bar */}
      <div className="panel mb-10 flex flex-wrap items-center gap-3 p-5">
        <Skel className="h-9 w-full sm:w-64" />
        <Skel delay={1} className="h-9 w-28" />
        <Skel delay={2} className="h-9 w-28" />
        <Skel delay={3} className="ml-auto hidden h-3 w-24 sm:block" />
      </div>

      <SkelEventGrid count={8} />
      <LoadStatus label="Indexing events" />
    </LoadShell>
  );
}
