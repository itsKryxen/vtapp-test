import Link from 'next/link';
import { redirect } from 'next/navigation';
import ClubProfileForm from './ClubProfileForm';
import { getMembership } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ClubProfilePage() {
  const membership = await getMembership();
  if (!membership) redirect('/login');

  if (!membership.club) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-xl font-bold">No club attached to this account</h1>
        <p className="mt-2 text-sm text-slate-400">
          Admin accounts don&apos;t have a club profile. Sign in with a club account.
        </p>
        <Link href="/dashboard" className="btn-ghost mt-6">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">
          ← My events
        </Link>
        <h1 className="mt-2 display-md">Club profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-mono text-brand-400">{membership.club.id}</span> ·{' '}
          {membership.club.name}
        </p>
        <p className="mt-2 max-w-2xl text-xs text-slate-500">
          Your club ID and club name are set by the core team and can&apos;t be changed here.
          Everything else is yours to edit.
        </p>
      </div>

      <ClubProfileForm club={membership.club} />
    </>
  );
}
