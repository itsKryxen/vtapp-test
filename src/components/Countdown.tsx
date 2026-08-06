'use client';

import { useEffect, useState } from 'react';

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export default function Countdown({
  to,
  variant = 'cards',
}: {
  to: string;
  variant?: 'cards' | 'timeline';
}) {
  const target = new Date(to);
  const [t, setT] = useState(() => diff(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  const units = [
    { label: 'Days', value: t.days },
    { label: 'Hours', value: t.hours },
    { label: 'Minutes', value: t.minutes },
    { label: 'Seconds', value: t.seconds },
  ];

  if (variant === 'timeline') {
    return (
      <div className="relative grid grid-cols-2 border border-white/10 bg-ink-950 sm:grid-cols-4">
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-1/2 hidden h-px bg-gradient-to-r from-transparent via-brand-600 to-transparent sm:block" />
        {units.map((unit, index) => (
          <div
            key={unit.label}
            className="relative flex min-h-28 flex-col items-center justify-center border-b border-r border-white/10 px-3 py-5 even:border-r-0 [&:nth-child(n+3)]:border-b-0 sm:min-h-36 sm:border-b-0 sm:even:border-r sm:last:border-r-0"
          >
            <span className="relative z-10 bg-ink-950 px-3 font-display text-4xl tabular-nums text-white sm:text-5xl lg:text-6xl">
              {mounted ? String(unit.value).padStart(2, '0') : '––'}
            </span>
            <span className="relative z-10 mt-3 bg-ink-950 px-2 font-mono text-[9px] font-semibold uppercase tracking-label text-slate-500">
              {unit.label}
            </span>
            <span
              className={`absolute left-1/2 top-1/2 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border sm:block ${
                index === 0 ? 'border-brand-500 bg-brand-600' : 'border-white/25 bg-ink-950'
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 sm:gap-4">
      {units.map((u, i) => (
        <div
          key={u.label}
          className="panel flex min-w-[68px] flex-col items-center px-3 py-3 sm:min-w-[86px] sm:px-4 sm:py-4"
          style={{ transform: `rotateY(${(i - 1.5) * 4}deg)` }}
        >
          <span className="font-display display-md tabular-nums text-white sm:text-4xl">
            {mounted ? String(u.value).padStart(2, '0') : '––'}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
