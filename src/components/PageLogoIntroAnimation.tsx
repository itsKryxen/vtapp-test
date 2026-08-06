'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LogoLockup } from '@/components/Logo';

type AnimationStage = 'init' | 'rush' | 'settle' | 'expand' | 'done';

export default function PageLogoIntroAnimation() {
  const pathname = usePathname();
  const [stage, setStage] = useState<AnimationStage>('done');
  const [currentPath, setCurrentPath] = useState<string>('');
  const prevPathRef = useRef<string>('');

  // Check if current route should bypass animation (dashboard & admin)
  const isExcluded = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  useEffect(() => {
    // If route is excluded or reduced motion is preferred, skip animation
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isExcluded || reducedMotion) {
      setStage('done');
      return;
    }

    // Trigger animation when pathname changes or on initial mount
    prevPathRef.current = pathname;
    setCurrentPath(pathname);
    setStage('init');

    const t1 = setTimeout(() => setStage('rush'), 50);
    const t2 = setTimeout(() => setStage('settle'), 650);
    const t3 = setTimeout(() => setStage('expand'), 1200);
    const t4 = setTimeout(() => setStage('done'), 1850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname, isExcluded]);

  if (stage === 'done' || isExcluded) return null;

  // Format a friendly status label based on current pathname
  const getStatusLabel = (path: string) => {
    if (path === '/login') return 'Initializing V-TAPP Portal…';
    if (path.startsWith('/events')) return 'Loading V-TAPP Events…';
    if (path.startsWith('/schedule')) return 'Loading Fest Schedule…';
    if (path.startsWith('/clubs')) return 'Loading Partner Clubs…';
    if (path.startsWith('/sponsors')) return 'Loading Fest Sponsors…';
    if (path.startsWith('/team')) return 'Loading Core Team…';
    if (path.startsWith('/merch')) return 'Loading Official Merch…';
    if (path.startsWith('/about')) return 'Loading About V-TAPP…';
    return 'Entering V-TAPP 2026…';
  };

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl transition-opacity duration-700 ease-out pointer-events-none ${
        stage === 'expand' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/25 via-slate-950/85 to-slate-950 pointer-events-none" />

      {/* Speed / Motion Streak while rushing */}
      <div
        className={`absolute h-1 bg-gradient-to-r from-transparent via-brand-500 to-amber-400 blur-sm transition-all duration-500 ease-out pointer-events-none ${
          stage === 'rush'
            ? 'w-[85vw] right-0 opacity-100'
            : stage === 'settle'
            ? 'w-[220px] opacity-40 blur-md'
            : 'w-0 opacity-0'
        }`}
      />

      {/* Shockwave Radial Wave on Expand */}
      {stage === 'expand' && (
        <div className="absolute rounded-full border-2 border-brand-500/80 animate-ping w-[320px] h-[320px] pointer-events-none" />
      )}

      {/* Rushing & Expanding Logo Container */}
      <div
        className="relative z-10 flex flex-col items-center justify-center transition-all ease-out"
        style={{
          transitionDuration:
            stage === 'init' || stage === 'rush'
              ? '600ms'
              : stage === 'settle'
              ? '450ms'
              : '650ms',
          transitionTimingFunction:
            stage === 'rush'
              ? 'cubic-bezier(0.1, 0.9, 0.2, 1.05)'
              : stage === 'expand'
              ? 'cubic-bezier(0.4, 0, 0.2, 1)'
              : 'ease-out',
          transform:
            stage === 'init'
              ? 'translate3d(120vw, 0, 0) scale(0.6)'
              : stage === 'rush'
              ? 'translate3d(0, 0, 0) scale(1.15)'
              : stage === 'settle'
              ? 'translate3d(0, 0, 0) scale(1.0)'
              : 'translate3d(0, 0, 0) scale(3.4)',
          opacity:
            stage === 'init'
              ? 0
              : stage === 'expand'
              ? 0
              : 1,
          filter:
            stage === 'settle'
              ? 'drop-shadow(0 0 40px rgba(224, 104, 94, 0.85))'
              : stage === 'rush'
              ? 'drop-shadow(0 0 55px rgba(179, 40, 33, 0.9))'
              : 'none',
        }}
      >
        <LogoLockup width={380} priority className="h-auto w-[250px] sm:w-[320px]" />
        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
            {getStatusLabel(currentPath)}
          </span>
        </div>
      </div>
    </div>
  );
}
