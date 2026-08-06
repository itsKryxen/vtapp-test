import Link from 'next/link';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import { getMembership, isSupabaseConfigured } from '@/lib/data';
import { BRAND, schoolAccent } from '@/lib/schools';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-x py-40">
        <div className="panel mx-auto max-w-lg p-8 text-center">
          <h1 className="text-xl font-bold">Supabase is not configured</h1>
          <p className="mt-2 text-sm text-slate-400">
            Copy <code className="bg-white/10 px-1.5 py-0.5 font-mono text-xs">.env.example</code>{' '}
            to <code className="bg-white/10 px-1.5 py-0.5 font-mono text-xs">.env.local</code>,
            fill in your project URL and keys, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const membership = await getMembership();
  if (!membership) redirect('/login');

  const club = membership.club;
  const accent = club ? schoolAccent(club.school) : BRAND;

  return (
    <div className="container-x pb-24 pt-24 sm:pt-28">
      <div className="panel mb-8 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold" style={{ color: accent }}>
            {membership.role === 'admin' ? 'CORE TEAM · ADMIN' : club?.id}
          </p>
          <h1 className="truncate font-display text-xl font-light text-white">
            {club?.name ?? 'V-TAPP Core Team'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs font-medium text-slate-400 hover:text-white">
            My events
          </Link>
          {membership.club_id && (
            <Link
              href="/dashboard/profile"
              className="text-xs font-medium text-slate-400 hover:text-white"
            >
              Club profile
            </Link>
          )}
          {membership.role === 'admin' && (
            <Link href="/admin" className="text-xs font-medium text-brand-400 hover:underline">
              Admin panel
            </Link>
          )}
          <Link href="/dashboard/events/new" className="btn-primary !px-4 !py-2 text-xs">
            + New event
          </Link>
          <SignOutButton />
        </div>
      </div>

      {children}
    </div>
  );
}
