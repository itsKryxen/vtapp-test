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

export default function Countdown({ to }: { to: string }) {
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
