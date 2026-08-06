import { LoadPanel } from '@/components/Loading';

/**
 * Root fallback. Any route without a closer loading.tsx uses this, so a new
 * page added later still gets a loading state without anyone remembering to
 * wire one up.
 */
export default function Loading() {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <LoadPanel label="Resolving page" />
    </div>
  );
}
