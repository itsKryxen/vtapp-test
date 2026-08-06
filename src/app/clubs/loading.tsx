import { LoadShell, LoadStatus, Skel, SkelTiles } from '@/components/Loading';

export default function Loading() {
  return (
    <LoadShell index="05" slug="CLUBS">
      <Skel className="mb-8 h-11 w-full max-w-sm" />
      <SkelTiles count={12} aspect="aspect-[4/3]" cols="sm:grid-cols-3 lg:grid-cols-5" />
      <LoadStatus label="Resolving clubs" />
    </LoadShell>
  );
}
