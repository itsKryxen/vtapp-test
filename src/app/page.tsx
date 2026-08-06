import AndhraPradeshBinaryMap from '@/components/AndhraPradeshBinaryMap';
import HeroIdentity from '@/components/HeroIdentity';
import SponsorStrip from '@/components/SponsorStrip';
import { getSponsors } from '@/lib/data';

const COUNTDOWN_TARGET = '2026-09-11T00:00:00+05:30';

export default async function HomePage() {
  const sponsors = await getSponsors();

  return (
    <>
      <section className="scanlines relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgb(var(--em-500)/.1),transparent_36%)]" />
        <HeroIdentity countdownTo={COUNTDOWN_TARGET} />
      </section>

      <SponsorStrip initialSponsors={sponsors} />

      <AndhraPradeshBinaryMap />
    </>
  );
}
