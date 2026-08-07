'use client';

import Image from 'next/image';
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import BlueprintMark from '@/components/BlueprintMark';
import Countdown from '@/components/Countdown';
import HeroCanvasLayer from '@/components/HeroCanvasLayer';
import HeroWordmark from '@/components/HeroWordmark';
import HeroEditionBadge from '@/components/HeroEditionBadge';
import HeroRings from '@/components/HeroRings';
import HeroOrbitIcons from '@/components/HeroOrbitIcons';
// the hero carries the VT mark, the same one the browser tab shows. The blue
// circuit wordmark it replaced said V-TAPP a second time, next to the type
// that already says it.
import heroMark from '../../public/vtapp-mark-transparent.png';

/*
 * HeroIdentity — command-center hero.
 *
 * Depth layers (back → front):
 *  0. hero-bg-ambient       ambient radial glow
 *  1. hero-hex-layer        subtle hex/grid texture
 *  2. hero-canvas-layer     particles + neural-net + radar (canvas)
 *  3. hero-rings-svg        rotating SVG rings
 *  4. hero-core-halo        pulsing crimson halo
 *  5. orbit-container       orbiting event icons
 *  6. BlueprintMark SVG     center object
 *  7. hero-scan-h           horizontal scan sweep
 *
 * Below xl the whole scene collapses into a full-bleed background behind the
 * identity column (see .hero-blueprint-layer in globals.css); from xl up it is
 * the right-hand grid column again.
 */

export default function HeroIdentity({ countdownTo }: { countdownTo: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  const reset = () => {
    const section = sectionRef.current;
    if (!section) return;
    section.style.setProperty('--identity-x', '0px');
    section.style.setProperty('--identity-y', '0px');
    section.style.setProperty('--logo-x', '0px');
    section.style.setProperty('--logo-y', '0px');
    section.style.setProperty('--logo-rotate', '0deg');
    section.style.setProperty('--blueprint-x', '0px');
    section.style.setProperty('--blueprint-y', '0px');
    section.style.setProperty('--blueprint-rotate', '0deg');
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
    const y = (event.clientY - rect.top) / rect.height * 2 - 1;

    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      section.style.setProperty('--identity-x', `${(x * 9).toFixed(2)}px`);
      section.style.setProperty('--identity-y', `${(y * 6).toFixed(2)}px`);
      section.style.setProperty('--logo-x', `${(x * 15).toFixed(2)}px`);
      section.style.setProperty('--logo-y', `${(y * 11).toFixed(2)}px`);
      section.style.setProperty('--logo-rotate', `${(x * 2.4).toFixed(2)}deg`);
      section.style.setProperty('--blueprint-x', `${(-x * 17).toFixed(2)}px`);
      section.style.setProperty('--blueprint-y', `${(-y * 11).toFixed(2)}px`);
      section.style.setProperty('--blueprint-rotate', `${(-x * 1.2).toFixed(2)}deg`);
      frameRef.current = 0;
    });
  };

  /* scan flash: toggles .hero--scanning every 10 seconds */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: ReturnType<typeof setTimeout>;
    let flashTimer: ReturnType<typeof setTimeout>;

    function fireScan() {
      sectionRef.current?.classList.add('hero--scanning');
      flashTimer = setTimeout(() => {
        sectionRef.current?.classList.remove('hero--scanning');
      }, 2000);
      timer = setTimeout(fireScan, 10000);
    }

    // first scan after 4 seconds (entrance sequence has settled)
    timer = setTimeout(fireScan, 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(flashTimer);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="container-x hero-cursor-field relative grid min-h-[calc(100svh-88px)] items-center gap-8 py-14 md:py-20 xl:grid-cols-[1.08fr_.92fr] xl:gap-10"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {/* DEPTH LAYER 0 – ambient radial glow */}
      <div className="hero-bg-ambient" aria-hidden="true" />

      {/* DEPTH LAYER 1 – hex/grid texture */}
      <div className="hero-hex-layer" aria-hidden="true" />

      {/* vertical scan line */}
      <div className="hero-scan-line" aria-hidden="true" />

      <div className="relative z-20 flex w-full flex-col pb-12 xl:min-h-[calc(100svh-12rem)] xl:justify-center xl:pb-0 xl:pr-12">
        {/* w-fit keeps the group as wide as the logo + wordmark, so the edition
         * badge below can centre on the lockup rather than on the column. */}
        <div className="mx-auto w-fit max-w-full xl:mx-0">
          <div className="hero-identity-lockup hero-enter-lockup flex items-center gap-3 sm:gap-6 2xl:gap-8">
            <div className="hero-identity-logo shrink-0">
              <Image
                src={heroMark}
                alt=""
                width={144}
                height={144}
                priority
                className="h-16 w-16 object-contain sm:h-32 sm:w-32 2xl:h-36 2xl:w-36"
              />
            </div>
            <div className="min-w-0 text-left">
              <HeroWordmark className="font-wordmark text-[clamp(1.75rem,8.4vw,3.1rem)] font-black uppercase leading-[0.9] tracking-[-0.01em] text-white xl:text-[clamp(2.85rem,3.6vw,4.25rem)]" />
            </div>
          </div>

          <div className="hero-enter-badge mt-7 flex justify-center">
            <HeroEditionBadge />
          </div>
        </div>

        <div className="hero-enter-countdown mt-12 w-full sm:mt-14" aria-labelledby="countdown-title">
          <div className="hero-hud-float-2 mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-label text-brand-500">Launch timeline</p>
              <h1 id="countdown-title" className="hero-text-breathe-2 mt-2 text-xl font-light uppercase tracking-wide text-white sm:text-2xl">
                11 September 2026
              </h1>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-label text-slate-500">VIT-AP University</p>
          </div>
          <div className="hero-countdown-panel">
            <Countdown to={countdownTo} variant="timeline" />
          </div>
        </div>
      </div>

      {/* animation scene — background layer below xl, right column from xl up */}
      <div className="hero-blueprint-layer flex items-center justify-center">
        <div className="hero-blueprint-scene hero-enter-center hero-blueprint-wrap w-full max-w-[600px]">
          {/* ambient center glow */}
          <div className="hero-center-glow" aria-hidden="true" />

          {/* secondary core halo (syncs with logo glow) */}
          <div className="hero-core-halo" aria-hidden="true" />

          {/* canvas: particles + neural network + radar */}
          <div className="hero-enter-network">
            <HeroCanvasLayer />
          </div>

          {/* rotating SVG rings */}
          <div className="hero-enter-rings">
            <HeroRings />
          </div>

          {/* orbiting event-category icons */}
          <div className="hero-enter-orbits">
            <HeroOrbitIcons />
          </div>

          {/* center blueprint mark */}
          <BlueprintMark className="h-auto w-full text-white" />

          {/* horizontal scan sweep (inside the scene so it clips correctly) */}
          <div className="hero-scan-h" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
