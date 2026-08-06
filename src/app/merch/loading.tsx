import { LoadShell, LoadStatus, SkelTiles } from '@/components/Loading';

export default function Loading() {
  return (
    <LoadShell index="09" slug="MERCH">
      <SkelTiles count={6} aspect="aspect-poster" cols="sm:grid-cols-2 lg:grid-cols-3" />
      <LoadStatus label="Opening the drop" />
    </LoadShell>
  );
}
