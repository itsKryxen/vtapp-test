import SponsorManager from './SponsorManager';
import { createClient } from '@/lib/supabase/server';
import type { Sponsor } from '@/lib/sponsors';

export const dynamic = 'force-dynamic';

export default async function AdminSponsorsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('sponsors')
    .select('*')
    .order('tier', { ascending: true })
    .order('sort_order', { ascending: true });

  return (
    <>
      <div className="mb-6">
        <h1 className="display-md">Sponsors</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Add a sponsor, upload the logo, pick a tier. Higher tiers get larger logos on the public
          page. Hidden sponsors stay in the list but disappear from the site.
        </p>
      </div>

      <SponsorManager sponsors={(data ?? []) as Sponsor[]} />
    </>
  );
}
