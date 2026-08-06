import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-32 text-center">
      <div>
        <p className="font-display text-7xl font-extralight tracking-tightest text-white sm:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-bold">This page is not on the map</h1>
        <p className="mt-2 text-sm text-slate-400">
          The event may have been unpublished, or the link is wrong.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/events" className="btn-ghost">
            Browse events
          </Link>
        </div>
      </div>
    </div>
  );
}
