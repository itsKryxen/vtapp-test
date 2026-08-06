import { LoadShell, LoadStatus, Skel, SkelRows } from '@/components/Loading';

export default function Loading() {
  return (
    <LoadShell index="04" slug="SCHEDULE">
      {/* the two day tabs */}
      <div className="mb-8 flex gap-3">
        <Skel className="h-10 w-36" />
        <Skel delay={1} className="h-10 w-36" />
      </div>

      <SkelRows count={7} height="h-12" />
      <LoadStatus label="Building running order" />
    </LoadShell>
  );
}
