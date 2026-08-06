import { LoadShell, LoadStatus, Skel, SkelTiles } from '@/components/Loading';

export default function Loading() {
  return (
    <LoadShell index="06" slug="SPONSORS">
      <div className="space-y-14">
        <section>
          <Skel className="mb-6 h-8 w-40" />
          <SkelTiles count={1} aspect="aspect-[5/2]" cols="sm:grid-cols-1" />
        </section>

        <section>
          <Skel delay={1} className="mb-6 h-7 w-28" />
          <SkelTiles count={6} aspect="aspect-[3/2]" cols="sm:grid-cols-3 lg:grid-cols-4" />
        </section>
      </div>

      <LoadStatus label="Resolving partners" />
    </LoadShell>
  );
}
