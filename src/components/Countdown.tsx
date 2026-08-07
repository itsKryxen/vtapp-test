'use client';

import { useEffect, useState, useRef } from 'react';

const STATUS_PHRASES = [
  'Initializing Innovation...',
  'Preparing Workshops...',
  'Loading Hackathons...',
  'Synchronizing Event Modules...',
  'Launching VTAPP 2026...',
];

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
    totalMs: ms,
  };
}

// Separate component for individual digit cell to enable smooth digit change transition
function DigitCell({ value, label, mounted }: { value: number; label: string; mounted: boolean }) {
  const formattedVal = mounted ? String(value).padStart(2, '0') : '00';
  const prevValRef = useRef(formattedVal);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (prevValRef.current !== formattedVal) {
      prevValRef.current = formattedVal;
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 250);
      return () => clearTimeout(timer);
    }
  }, [formattedVal]);

  return (
    <div className="vtapp-countdown-cell">
      <span className={`vtapp-countdown-number ${isFlipping ? 'vtapp-countdown-digit-flip' : ''}`}>
        {formattedVal}
      </span>
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
  const [statusIndex, setStatusIndex] = useState(0);
  const [statusFade, setStatusFade] = useState(true);

  // Timer interval
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [to]);

  // Cycling status phrases with fade transition
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusFade(false); // Fade out
      setTimeout(() => {
        setStatusIndex((prev) => (prev + 1) % STATUS_PHRASES.length);
        setStatusFade(true); // Fade in
      }, 300);
    }, 5000);

    return () => clearInterval(statusInterval);
  }, []);

  // Calculate mission progress percentage
  // Assuming a total campaign timeframe of ~240 days leading to launch
  const totalDaysSpan = 240;
  const daysLeft = t.days;
  const progressPercent = Math.min(
    98,
    Math.max(12, Math.round(((totalDaysSpan - daysLeft) / totalDaysSpan) * 100))
  );

  const units = [
    { label: 'Days', value: t.days },
    { label: 'Hours', value: t.hours },
    { label: 'Minutes', value: t.minutes },
    { label: 'Seconds', value: t.seconds },
  ];

  return (
    <div className="vtapp-countdown-container">
      {/* Dynamic Status Text Above Timer */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--cd-status-text)] animate-pulse" aria-hidden="true" />
        <span
          className="font-mono text-xs uppercase tracking-widest font-semibold text-[var(--cd-status-text)] transition-opacity duration-300 min-h-[1.25rem] flex items-center"
          style={{ opacity: statusFade ? 1 : 0 }}
        >
          {STATUS_PHRASES[statusIndex]}
        </span>
      </div>

      {/* Countdown Panel Box */}
      <div className="vtapp-countdown-panel">
        {/* Micro scan line sweep */}
        <div className="vtapp-countdown-scanline" aria-hidden="true" />

        {/* 4-Column Grid with Internal Separators */}
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

      {/* Mission Progress Bar Directly Below */}
      <div className="vtapp-countdown-progress-wrapper">
        <div className="vtapp-countdown-progress-header">
          <div className="flex items-center gap-2">
            <span className="text-[10px]" aria-hidden="true">❖</span>
            <span>Mission Progress</span>
          </div>
          <span>{mounted ? `${progressPercent}%` : '82%'}</span>
        </div>
        <div className="vtapp-countdown-progress-track">
          <div
            className="vtapp-countdown-progress-bar"
            style={{ width: mounted ? `${progressPercent}%` : '82%' }}
          >
            <div className="vtapp-countdown-progress-shine" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
