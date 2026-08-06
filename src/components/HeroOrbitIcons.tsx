'use client';

import { useState } from 'react';

/*
 * HeroOrbitIcons
 * ─────────────────────────────────────────────────────────────
 * 11 event-category icons orbit the BlueprintMark on 3 rings.
 * Each icon:
 *   • follows a circular orbital path (CSS transform trick)
 *   • floats ± 1px independently
 *   • breathes glow
 *   • on hover → orbit pauses, scales 1.1, intensifies glow
 *
 * No layout change – this is an absolute overlay inside the
 * existing hero-blueprint-scene (position: relative).
 * ─────────────────────────────────────────────────────────────
 */

/* Simplified icon path data (from Icon3D dataset) */
const PATHS: Record<string, string[]> = {
  technical: [
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    'M19.07 14.55a1.55 1.55 0 0 0 .3 1.72l.06.06a1.88 1.88 0 1 1-2.66 2.66l-.06-.06a1.55 1.55 0 0 0-1.72-.3 1.55 1.55 0 0 0-.94 1.43v.17a1.88 1.88 0 1 1-3.77 0v-.09a1.55 1.55 0 0 0-1.01-1.42 1.55 1.55 0 0 0-1.72.3l-.06.06a1.88 1.88 0 1 1-2.66-2.66l.06-.06A1.55 1.55 0 0 0 4.9 15a1.55 1.55 0 0 0-1.43-.94H3.3a1.88 1.88 0 1 1 0-3.77h.08a1.55 1.55 0 0 0 1.43-1.01 1.55 1.55 0 0 0-.3-1.72l-.06-.06A1.88 1.88 0 1 1 7.1 4.84l.06.06a1.55 1.55 0 0 0 1.72.3h.08A1.55 1.55 0 0 0 9.9 3.77v-.17a1.88 1.88 0 1 1 3.77 0v.09a1.55 1.55 0 0 0 .94 1.43 1.55 1.55 0 0 0 1.72-.3l.06-.06a1.88 1.88 0 1 1 2.66 2.66l-.06.06a1.55 1.55 0 0 0-.3 1.72v.08a1.55 1.55 0 0 0 1.43.94h.17a1.88 1.88 0 1 1 0 3.77h-.09a1.55 1.55 0 0 0-1.43.94Z',
  ],
  coding: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
  robotics: [
    'M5 9.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18v-7A1.5 1.5 0 0 1 5 9.5Z',
    'M12 9.5V6M12 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    'M8.5 13.5h.01M15.5 13.5h.01M9.5 16.5h5',
  ],
  gaming: [
    'M17 5.5H7a4 4 0 0 0-3.97 3.5c-.4 2.9-.6 4.6-.66 5.2A3.8 3.8 0 0 0 6.1 18.5c1.24 0 2.4-.6 3.12-1.6l.55-.77h4.46l.55.77a3.85 3.85 0 0 0 6.85-3.53c-.06-.6-.26-2.3-.66-5.2A4 4 0 0 0 17 5.5Z',
    'M6.5 10.5v3M5 12h3M15.5 11.5h.01M18 13.5h.01',
  ],
  design: [
    'M12 21.5a9.5 9.5 0 1 1 9.5-9.5c0 1.9-1.4 2.9-2.9 2.9h-1.9a1.9 1.9 0 0 0 0 3.8c0 1.4-1.4 2.8-4.7 2.8Z',
    'M7.5 10.5h.01M10.5 7h.01M15 7.5h.01',
  ],
  workshop: [
    'M14.6 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.6-3.6a5.8 5.8 0 0 1-7.68 7.68l-6.6 6.6a2.05 2.05 0 0 1-2.9-2.9l6.6-6.6A5.8 5.8 0 0 1 18.2 2.8l-3.6 3.6Z',
  ],
  cultural: [
    'M11 17.5V5.8l9-1.8v11.5',
    'M8 20.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M17 18.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  ],
  literary: [
    'M4 19.2A2.3 2.3 0 0 1 6.3 17H20',
    'M6.3 2.5H20v19H6.3A2.3 2.3 0 0 1 4 19.2V4.8a2.3 2.3 0 0 1 2.3-2.3Z',
    'M8.5 7h7',
  ],
  business: [
    'M3.5 3.5v17h17',
    'm7.5 15 3.5-3.6 2.6 2.6 5.4-5.5',
    'M15.5 8h3.5v3.5',
  ],
  sports: [
    'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z',
    'M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z',
    'M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z',
  ],
  lecture: [
    'M2.5 3.5h19',
    'M20.5 3.5v10.6a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9V3.5',
    'm7.5 21 4.5-5 4.5 5',
  ],
};

interface Config {
  key: string;
  label: string;
  r: number;       // orbit radius in px (assumes max-w-600px container)
  dur: number;     // orbit period in seconds
  dir: 'cw' | 'ccw';
  delay: number;   // animation-delay in seconds (negative = start mid-cycle)
  glowDur: number;
  glowDelay: number;
  floatDelay: number;
}

const CONFIGS: Config[] = [
  /* ── inner ring r=148 ── */
  { key: 'technical',  label: 'Technical',     r: 148, dur: 22,  dir: 'cw',  delay: 0,    glowDur: 4.2, glowDelay: 0.5,  floatDelay: 0   },
  { key: 'coding',     label: 'Coding',         r: 148, dur: 18,  dir: 'cw',  delay: -4.5, glowDur: 3.8, glowDelay: 2.1,  floatDelay: 1.2 },
  { key: 'gaming',     label: 'Gaming',         r: 148, dur: 24,  dir: 'cw',  delay: -9,   glowDur: 5.1, glowDelay: 0.8,  floatDelay: 2.4 },
  { key: 'design',     label: 'Design',         r: 148, dur: 20,  dir: 'cw',  delay: -13.5,glowDur: 3.5, glowDelay: 3.2,  floatDelay: 3.6 },
  /* ── middle ring r=200 ── */
  { key: 'robotics',   label: 'Robotics',       r: 200, dur: 32,  dir: 'ccw', delay: -6,   glowDur: 4.8, glowDelay: 1.4,  floatDelay: 0.8 },
  { key: 'sports',     label: 'Sports',         r: 200, dur: 38,  dir: 'ccw', delay: -19,  glowDur: 6.2, glowDelay: 4.1,  floatDelay: 2.2 },
  { key: 'cultural',   label: 'Cultural',       r: 200, dur: 28,  dir: 'ccw', delay: -24,  glowDur: 4.4, glowDelay: 2.8,  floatDelay: 1.6 },
  /* ── outer ring r=248 ── */
  { key: 'workshop',   label: 'Workshop',       r: 248, dur: 45,  dir: 'cw',  delay: -10,  glowDur: 5.6, glowDelay: 3.7,  floatDelay: 0.4 },
  { key: 'business',   label: 'Business',       r: 248, dur: 52,  dir: 'cw',  delay: -26,  glowDur: 4.1, glowDelay: 1.2,  floatDelay: 1.8 },
  { key: 'literary',   label: 'Literary',       r: 248, dur: 41,  dir: 'ccw', delay: -33,  glowDur: 6.8, glowDelay: 4.5,  floatDelay: 2.9 },
  { key: 'lecture',    label: 'Guest Lecture',  r: 248, dur: 58,  dir: 'ccw', delay: -15,  glowDur: 3.9, glowDelay: 0.3,  floatDelay: 3.3 },
];

export default function HeroOrbitIcons() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="orbit-container" aria-hidden="true">
      {CONFIGS.map((cfg) => {
        const isHovered = hovered === cfg.key;
        const iconPaths = PATHS[cfg.key] ?? [];

        return (
          <div
            key={cfg.key}
            className={`orbit-icon orbit-icon--${cfg.dir}${isHovered ? ' orbit-icon--paused' : ''}`}
            style={{
              '--r': `${cfg.r}px`,
              '--d': `${cfg.dur}s`,
              '--delay': `${cfg.delay}s`,
              '--glow-dur': `${cfg.glowDur}s`,
              '--glow-delay': `${cfg.glowDelay}s`,
              '--float-delay': `${cfg.floatDelay}s`,
            } as React.CSSProperties}
            onMouseEnter={() => setHovered(cfg.key)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* inner box – independent transform so scale doesn't fight orbit */}
            <div className={`orbit-icon-chip${isHovered ? ' orbit-icon-chip--hovered' : ''}`}>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="orbit-icon-svg"
                style={{ '--glow-dur': `${cfg.glowDur}s`, '--glow-delay': `${cfg.glowDelay}s` } as React.CSSProperties}
              >
                {iconPaths.map((d, i) => <path key={i} d={d} />)}
              </svg>
              <span className="orbit-icon-label">{cfg.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
