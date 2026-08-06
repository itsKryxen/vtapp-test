import Link from 'next/link';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import { getMembership, isSupabaseConfigured } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-x py-40 text-center text-sm text-slate-400">
        Supabase is not configured. Add your keys to <code>.env.local</code> first.
      </div>
    );
  }

  const membership = await getMembership();
  if (!membership) redirect('/login');
  if (membership.role !== 'admin') redirect('/dashboard');

  return (
    <div className="container-x pb-24 pt-24 sm:pt-28">
      <div className="panel mb-8 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-mono text-[11px] font-semibold text-brand-500">CORE TEAM · ADMIN</p>
          <h1 className="font-display text-xl font-light text-white">V-TAPP 2026 control room</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs font-medium text-slate-400 hover:text-white">
            Review queue
          </Link>
          <Link href="/admin/clubs" className="text-xs font-medium text-slate-400 hover:text-white">
            Clubs &amp; IDs
          </Link>
          <Link href="/admin/sponsors" className="text-xs font-medium text-slate-400 hover:text-white">
            Sponsors
          </Link>
          <Link href="/admin/team" className="text-xs font-medium text-slate-400 hover:text-white">
            Team
          </Link>
          <Link href="/dashboard" className="text-xs font-medium text-slate-400 hover:text-white">
            Dashboard
          </Link>
          <SignOutButton />
        </div>
      </div>

      {children}
    </div>
  );
}
