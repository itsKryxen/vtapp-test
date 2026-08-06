'use client';

import { useRef, useEffect, type PointerEvent as ReactPointerEvent } from 'react';
import BlueprintMark from '@/components/BlueprintMark';
import Countdown from '@/components/Countdown';
import { LogoMark } from '@/components/Logo';
import HeroCanvasLayer from '@/components/HeroCanvasLayer';
import HeroRings from '@/components/HeroRings';
import HeroOrbitIcons from '@/components/HeroOrbitIcons';

/*
 * HeroIdentity  — premium command-center hero
 *
 * Depth layers (back → front):
 *  0. hero-bg-ambient       ambient radial glow
 *  1. hero-hex-layer        subtle hex/grid texture
 *  2. hero-canvas-layer     particles + neural-net + radar (canvas)
 *  3. hero-rings-svg        5 rotating SVG rings
 *  4. hero-core-halo        pulsing crimson halo
 *  5. orbit-container       11 orbiting event icons
 *  6. BlueprintMark SVG     center object
 *  7. hero-scan-h           horizontal scan sweep
 *
 * Layout is UNCHANGED — only animation layers are added.
 */

export default function HeroIdentity({ countdownTo }: { countdownTo: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const frameRef   = useRef(0);

  /* ── smooth parallax reset on pointer leave ── */
  const reset = () => {
    const s = sectionRef.current;
    if (!s) return;
    s.style.setProperty('--identity-x',      '0px');
    s.style.setProperty('--identity-y',      '0px');
    s.style.setProperty('--logo-x',          '0px');
    s.style.setProperty('--logo-y',          '0px');
    s.style.setProperty('--logo-rotate',     '0deg');
    s.style.setProperty('--blueprint-x',     '0px');
    s.style.setProperty('--blueprint-y',     '0px');
    s.style.setProperty('--blueprint-rotate','0deg');
  };

  /* ── mouse parallax (rAF-throttled) ── */
  const handlePointerMove = (ev: ReactPointerEvent<HTMLDivElement>) => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    const s = sectionRef.current;
    if (!s) return;
    const rect = s.getBoundingClientRect();
    const x = (ev.clientX - rect.left)  / rect.width  * 2 - 1;
    const y = (ev.clientY - rect.top)   / rect.height * 2 - 1;

    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      s.style.setProperty('--identity-x',       `${(x * 9).toFixed(2)}px`);
      s.style.setProperty('--identity-y',       `${(y * 6).toFixed(2)}px`);
      s.style.setProperty('--logo-x',           `${(x * 15).toFixed(2)}px`);
      s.style.setProperty('--logo-y',           `${(y * 11).toFixed(2)}px`);
      s.style.setProperty('--logo-rotate',      `${(x * 2.4).toFixed(2)}deg`);
      s.style.setProperty('--blueprint-x',      `${(-x * 17).toFixed(2)}px`);
      s.style.setProperty('--blueprint-y',      `${(-y * 11).toFixed(2)}px`);
      s.style.setProperty('--blueprint-rotate', `${(-x * 1.2).toFixed(2)}deg`);
      frameRef.current = 0;
    });
  };

  /* ── scan flash: toggles .hero--scanning every 10 seconds ── */
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
      className="container-x hero-cursor-field relative grid min-h-[calc(100svh-88px)] items-center gap-8 py-14 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-10"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {/* ── DEPTH LAYER 0 – ambient radial glow ── */}
      <div className="hero-bg-ambient" aria-hidden="true" />

      {/* ── DEPTH LAYER 1 – hex/grid texture ── */}
      <div className="hero-hex-layer" aria-hidden="true" />

      {/* ── VERTICAL scan line (original, kept) ── */}
      <div className="hero-scan-line" aria-hidden="true" />

      {/* ════════════════════════════════════════
          LEFT COLUMN — identity + countdown
          ════════════════════════════════════════ */}
      <div className="flex w-full flex-col border-b border-white/10 pb-12 lg:min-h-[calc(100svh-12rem)] lg:justify-center lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">

        {/* Logo + wordmark lockup */}
        <div className="hero-identity-lockup hero-enter-lockup flex items-center justify-center gap-4 sm:gap-8 lg:justify-start">
          <div className="hero-identity-logo shrink-0">
            <LogoMark size={144} className="h-20 w-20 sm:h-32 sm:w-32 lg:h-36 lg:w-36" />
          </div>
          <div className="min-w-0 text-left">
            <p className="hero-text-breathe font-mono text-[clamp(2.15rem,12vw,3rem)] font-black uppercase leading-[0.82] tracking-[-0.075em] text-white lg:text-[clamp(3rem,5.6vw,7rem)]">
              V-TAPP<span className="text-brand-500">26</span>
            </p>
          </div>
        </div>

        {/* Edition badge */}
        <div className="hero-enter-badge mt-7 flex justify-center lg:justify-start">
          <p
            className="hero-edition-badge inline-flex font-mono text-[clamp(1.05rem,2vw,1.7rem)] uppercase tracking-[0.2em] text-white sm:tracking-[0.27em]"
            aria-label="7th Edition"
          >
            <span className="hero-edition-slot" aria-hidden="true">
              <span className="hero-edition-typewriter">7th Edition</span>
            </span>
          </p>
        </div>

        {/* Countdown */}
        <div className="hero-enter-countdown mt-12 w-full sm:mt-14" aria-labelledby="countdown-title">
          <div className="hero-hud-float-2 mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-label text-brand-500">Launch timeline</p>
              <h1
                id="countdown-title"
                className="hero-text-breathe-2 mt-2 text-xl font-light uppercase tracking-wide text-white sm:text-2xl"
              >
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

      {/* ════════════════════════════════════════
          RIGHT COLUMN — blueprint + animation scene
          ════════════════════════════════════════ */}
      <div className="flex items-center justify-center">
        <div className="hero-blueprint-scene hero-enter-center hero-blueprint-wrap w-full max-w-[600px]">

          {/* LAYER 2 – ambient center glow */}
          <div className="hero-center-glow" aria-hidden="true" />

          {/* LAYER 2b – secondary core halo (syncs with logo glow) */}
          <div className="hero-core-halo" aria-hidden="true" />

          {/* LAYER 2 – canvas: particles + neural network + radar */}
          <div className="hero-enter-network">
            <HeroCanvasLayer />
          </div>

          {/* LAYER 3 – SVG rotating rings */}
          <div className="hero-enter-rings">
            <HeroRings />
          </div>

          {/* LAYER 5 – orbiting event-category icons */}
          <div className="hero-enter-orbits">
            <HeroOrbitIcons />
          </div>

          {/* LAYER 6 – center blueprint mark (the energy core visual) */}
          <BlueprintMark className="h-auto w-full text-white" />

          {/* LAYER 7 – horizontal scan sweep (inside scene so it clips correctly) */}
          <div className="hero-scan-h" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
