'use client';

import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import BlueprintMark from '@/components/BlueprintMark';
import Countdown from '@/components/Countdown';
import { LogoMark } from '@/components/Logo';

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

  return (
    <div
      ref={sectionRef}
      className="container-x hero-cursor-field relative grid min-h-[calc(100svh-88px)] items-center gap-8 py-14 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-10"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      <div className="flex w-full flex-col border-b border-white/10 pb-12 lg:min-h-[calc(100svh-12rem)] lg:justify-center lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
        <div className="hero-identity-lockup flex items-center justify-center gap-4 sm:gap-8 lg:justify-start">
          <div className="hero-identity-logo shrink-0">
            <LogoMark size={144} className="h-20 w-20 sm:h-32 sm:w-32 lg:h-36 lg:w-36" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-mono text-[clamp(2.15rem,12vw,3rem)] font-black uppercase leading-[0.82] tracking-[-0.075em] text-white lg:text-[clamp(3rem,5.6vw,7rem)]">
              V-TAPP<span className="text-brand-500">26</span>
            </p>
          </div>
        </div>

        <div className="mt-7 flex justify-center lg:justify-start">
          <p className="hero-edition-badge inline-flex font-mono text-[clamp(1.05rem,2vw,1.7rem)] uppercase tracking-[0.2em] text-white sm:tracking-[0.27em]" aria-label="7th Edition">
            <span className="hero-edition-slot" aria-hidden="true">
              <span className="hero-edition-typewriter">7th Edition</span>
            </span>
          </p>
        </div>

        <div className="mt-12 w-full sm:mt-14" aria-labelledby="countdown-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-label text-brand-500">Launch timeline</p>
              <h1 id="countdown-title" className="mt-2 text-xl font-light uppercase tracking-wide text-white sm:text-2xl">
                11 September 2026
              </h1>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-label text-slate-500">VIT-AP University</p>
          </div>
          <Countdown to={countdownTo} variant="timeline" />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="hero-blueprint-wrap w-full max-w-[600px]">
          <BlueprintMark className="h-auto w-full text-white" />
        </div>
      </div>
    </div>
  );
}
