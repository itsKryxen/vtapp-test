import TeamManager from './TeamManager';
import { createClient } from '@/lib/supabase/server';
import type { TeamMember } from '@/lib/team';

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .order('department', { ascending: true })
    .order('sort_order', { ascending: true });

  return (
    <>
      <div className="mb-6">
        <h1 className="display-md">Team</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Add the core team with photos and roles. Members are grouped by department on the public
          page. Hidden members stay in this list but disappear from the site.
        </p>
      </div>

      <TeamManager members={(data ?? []) as TeamMember[]} />
    </>
  );
}
