'use client';

import { useEffect, useState } from 'react';

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

// Separate component for individual digit cell to enable smooth digit change transition
function DigitCell({ value, label, mounted }: { value: number; label: string; mounted: boolean }) {
  const formattedVal = mounted ? String(value).padStart(2, '0') : '00';

  return (
    <div className="vtapp-countdown-cell">
      <span className="vtapp-countdown-number">{formattedVal}</span>
      <span className="vtapp-countdown-label">{label}</span>
    </div>
  );
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

  // Timer interval
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [to]);

  const units = [
    { label: 'Days', value: t.days },
    { label: 'Hours', value: t.hours },
    { label: 'Minutes', value: t.minutes },
    { label: 'Seconds', value: t.seconds },
  ];

  return (
    <div className="vtapp-countdown-container">
      <div className="vtapp-countdown-panel">
        <div className="vtapp-countdown-grid">
          {units.map((unit) => (
            <DigitCell
              key={unit.label}
              value={unit.value}
              label={unit.label}
              mounted={mounted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
