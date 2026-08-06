import IssueClubForm from './IssueClubForm';
import BulkImportClubs from './BulkImportClubs';
import { createClient } from '@/lib/supabase/server';
import { SCHOOLS, schoolAccent } from '@/lib/schools';
import type { Club } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminClubsPage() {
  const supabase = createClient();
  const { data } = await supabase.from('clubs').select('*').order('id', { ascending: true });
  const clubs = (data ?? []) as Club[];

  const nextIndexBySchool: Record<string, number> = {};
  for (const s of SCHOOLS) {
    const max = clubs.filter((c) => c.school === s.code).reduce((m, c) => Math.max(m, c.club_index), 0);
    nextIndexBySchool[s.code] = max + 1;
  }

  const { count: eventCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Clubs registered" value={clubs.length} />
        <Stat label="Active" value={clubs.filter((c) => c.is_active).length} />
        <Stat label="Events in system" value={eventCount ?? 0} />
      </div>

      <IssueClubForm nextIndexBySchool={nextIndexBySchool} />

      <BulkImportClubs />

      <section className="mt-10">
        <h2 className="mb-4 font-display display-md">All clubs</h2>

        {clubs.length === 0 ? (
          <div className="panel p-12 text-center text-sm text-slate-400">
            No clubs yet. Issue the first ID above.
          </div>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Club ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Login email</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clubs.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: schoolAccent(c.school) }}>
                        {c.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{c.name}</td>
                    <td className="px-4 py-3 text-slate-400">{c.school}</td>
                    <td className="px-4 py-3 text-slate-400">{c.contact_email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          c.is_active
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel px-4 py-4">
      <p className="font-display display-md text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{label}</p>
    </div>
  );
}
