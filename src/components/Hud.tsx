'use client';

import { useEffect, useState } from 'react';
import { FEST } from '@/lib/fest';

/**
 * Corner readouts. Purely decorative telemetry that makes a page read like an
 * instrument rather than a brochure: viewport size, a live UTC clock, and the
 * fest coordinates.
 *
 * Everything client-dependent renders as placeholder dashes on the server and
 * fills in after mount, so there is no hydration mismatch.
 */

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function HudClock() {
  const mounted = useMounted();
  const [utc, setUtc] = useState('--:--:--');

  useEffect(() => {
    const tick = () =>
      setUtc(
        new Date().toLocaleTimeString('en-GB', {
          timeZone: 'UTC',
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[10px] uppercase tracking-label text-slate-600">
      UTC {mounted ? utc : '--:--:--'}
      <span className="ml-1 inline-block h-2 w-1.5 translate-y-px bg-brand-600 animate-blink" />
    </span>
  );
}

export function HudViewport() {
  const mounted = useMounted();
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  return (
    <div className="space-y-1 font-mono text-[10px] uppercase tracking-label text-slate-600">
      <p>VIEWPORT: {mounted ? `${size.w}×${size.h}` : '----×----'}</p>
      <p>LAT 16.5062 · LON 80.6480</p>
      <p>BUILD: V-TAPP 2026</p>
    </div>
  );
}

/** Row of dot indicators, a purely graphic element from the reference. */
export function HudDots({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i % 3 === 0 ? 'bg-brand-600' : 'border border-white/25'
          }`}
        />
      ))}
    </div>
  );
}

/** Scattered crosshair ticks, positioned as a percentage of the parent. */
export function HudTicks({
  points = [
    [12, 22],
    [78, 16],
    [88, 62],
    [30, 78],
    [64, 40],
  ],
}: {
  points?: [number, number][];
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
      {points.map(([x, y], i) => (
        <span
          key={i}
          className="tick absolute text-brand-400"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}

export function HudDateStamp() {
  return (
    <span className="font-mono text-[10px] uppercase tracking-label text-slate-400">
      {FEST.dateLabel.toUpperCase()}
    </span>
  );
}
