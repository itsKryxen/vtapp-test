import Link from 'next/link';
import Countdown from '@/components/Countdown';
import InteractiveTechCore from '@/components/InteractiveTechCore';

export default function HeroIdentity({ countdownTo }: { countdownTo: string }) {
  return (
    <div className="tech-hero hero-cursor-field">
      <div className="container-x tech-hero-shell">
        <div className="tech-hero-copy">
          <h1 className="tech-hero-title tech-hero-brand-title hero-enter-copy">
            V-TAPP <em>2026</em>
          </h1>
          <p className="tech-hero-description tech-hero-tagline hero-enter-copy">
            The Pinnacle of Innovation and Creativity.
          </p>
          <div className="tech-hero-actions hero-enter-copy">
            <Link href="/tickets" className="btn-primary">Register now <span aria-hidden="true">→</span></Link>
            <Link href="/events" className="btn-ghost">Explore events</Link>
          </div>

        </div>

        <div className="tech-hero-core hero-enter-center">
          <InteractiveTechCore />
        </div>

        <div className="tech-hero-meta hero-enter-countdown" aria-labelledby="countdown-title">
          <div className="tech-hero-meta-copy">
            <p className="mono-label text-brand-400">Registration open</p>
            <h2 id="countdown-title">11–12 September 2026</h2>
            <span>VIT-AP University · Amaravati</span>
          </div>
          <Countdown to={countdownTo} variant="timeline" />
        </div>
      </div>
    </div>
  );
}
