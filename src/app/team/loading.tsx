import { LoadShell, LoadStatus, Skel, SkelTiles } from '@/components/Loading';

export default function Loading() {
  return (
    <LoadShell index="07" slug="TEAM">
      <div className="space-y-14">
        {Array.from({ length: 2 }).map((_, s) => (
          <section key={s}>
            <div className="mb-6 flex items-center gap-4">
              <Skel delay={(s % 2) as 0 | 1} className="h-3 w-32" />
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <SkelTiles count={4} aspect="aspect-square" cols="sm:grid-cols-3 lg:grid-cols-4" />
          </section>
        ))}
      </div>

      <LoadStatus label="Resolving core team" />
    </LoadShell>
  );
}
