'use client';

import { useId } from 'react';

/**
 * Extruded SVG icon set, in the V-TAPP palette.
 *
 * The 3D read comes from three stacked passes of the same stroke path:
 *   1. an extrude layer in deep crimson, offset down-right
 *   2. the face, stroked with a crimson gradient
 *   3. a specular highlight, offset up-left at low opacity
 *
 * No filters, no blur, no raster assets, so it stays crisp at any size and
 * costs nothing to render. Gradient ids are per-instance (useId) so multiple
 * icons on one page never collide.
 */

type Paths = string[];

const ICONS: Record<string, Paths> = {
  /* ---------------- event categories ---------------- */
  technical: [
    'M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z',
    'M19.1 14.7a1.6 1.6 0 0 0 .33 1.77l.06.06a1.94 1.94 0 1 1-2.75 2.75l-.06-.06a1.6 1.6 0 0 0-1.77-.33 1.6 1.6 0 0 0-.98 1.48v.17a1.94 1.94 0 1 1-3.88 0v-.09a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.33l-.06.06a1.94 1.94 0 1 1-2.75-2.75l.06-.06a1.6 1.6 0 0 0 .33-1.77 1.6 1.6 0 0 0-1.48-.98h-.17a1.94 1.94 0 1 1 0-3.88h.09a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.33-1.77l-.06-.06a1.94 1.94 0 1 1 2.75-2.75l.06.06a1.6 1.6 0 0 0 1.77.33h.08a1.6 1.6 0 0 0 .98-1.48v-.17a1.94 1.94 0 1 1 3.88 0v.09a1.6 1.6 0 0 0 .98 1.47 1.6 1.6 0 0 0 1.77-.33l.06-.06a1.94 1.94 0 1 1 2.75 2.75l-.06.06a1.6 1.6 0 0 0-.33 1.77v.08a1.6 1.6 0 0 0 1.48.98h.17a1.94 1.94 0 1 1 0 3.88h-.09a1.6 1.6 0 0 0-1.47.98Z',
  ],
  coding: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
  robotics: [
    'M5 9.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18v-7A1.5 1.5 0 0 1 5 9.5Z',
    'M12 9.5V6',
    'M12 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    'M8.5 13.5h.01',
    'M15.5 13.5h.01',
    'M9.5 16.5h5',
  ],
  design: [
    'M12 21.5a9.5 9.5 0 1 1 9.5-9.5c0 1.9-1.4 2.9-2.9 2.9h-1.9a1.9 1.9 0 0 0 0 3.8c0 1.4-1.4 2.8-4.7 2.8Z',
    'M7.5 10.5h.01',
    'M10.5 7h.01',
    'M15 7.5h.01',
  ],
  gaming: [
    'M17 5.5H7a4 4 0 0 0-3.97 3.5c-.4 2.9-.6 4.6-.66 5.2A3.8 3.8 0 0 0 6.1 18.5c1.24 0 2.4-.6 3.12-1.6l.55-.77h4.46l.55.77a3.85 3.85 0 0 0 3.12 1.6 3.8 3.8 0 0 0 3.73-4.3c-.06-.6-.26-2.3-.66-5.2A4 4 0 0 0 17 5.5Z',
    'M6.5 10.5v3',
    'M5 12h3',
    'M15.5 11.5h.01',
    'M18 13.5h.01',
  ],
  workshop: [
    'M14.6 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.6-3.6a5.8 5.8 0 0 1-7.68 7.68l-6.6 6.6a2.05 2.05 0 0 1-2.9-2.9l6.6-6.6A5.8 5.8 0 0 1 18.2 2.8l-3.6 3.6Z',
  ],
  cultural: ['M11 17.5V5.8l9-1.8v11.5', 'M8 20.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M17 18.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  literary: [
    'M4 19.2A2.3 2.3 0 0 1 6.3 17H20',
    'M6.3 2.5H20v19H6.3A2.3 2.3 0 0 1 4 19.2V4.8a2.3 2.3 0 0 1 2.3-2.3Z',
    'M8.5 7h7',
  ],
  business: ['M3.5 3.5v17h17', 'm7.5 15 3.5-3.6 2.6 2.6 5.4-5.5', 'M15.5 8h3.5v3.5'],
  sports: [
    'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z',
    'M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z',
    'M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z',
  ],
  'guest-lecture': ['M2.5 3.5h19', 'M20.5 3.5v10.6a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9V3.5', 'm7.5 21 4.5-5 4.5 5'],

  /* ---------------- event detail facts ---------------- */
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7.2V12l3.2 2'],
  hourglass: [
    'M6.5 2.5h11', 'M6.5 21.5h11',
    'M6.5 2.5v3.7a5.5 5.5 0 0 0 5.5 5.5 5.5 5.5 0 0 0 5.5-5.5V2.5',
    'M6.5 21.5v-3.7a5.5 5.5 0 0 1 5.5-5.5 5.5 5.5 0 0 1 5.5 5.5v3.7',
  ],
  pin: ['M19.5 10.3c0 5.7-7.5 11.2-7.5 11.2s-7.5-5.5-7.5-11.2a7.5 7.5 0 0 1 15 0Z', 'M12 13.1a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z'],
  users: [
    'M15.5 20.5v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.2a3.7 3.7 0 0 0-3.7 3.7v1.8',
    'M9 11.5a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4Z',
    'M21.5 20.5v-1.8a3.7 3.7 0 0 0-2.8-3.58',
    'M15.5 4.32a3.7 3.7 0 0 1 0 7.16',
  ],
  ticket: [
    'M2.5 9.2a2.8 2.8 0 0 1 0 5.6v2.2a1.9 1.9 0 0 0 1.9 1.9h15.2a1.9 1.9 0 0 0 1.9-1.9v-2.2a2.8 2.8 0 0 1 0-5.6V7a1.9 1.9 0 0 0-1.9-1.9H4.4A1.9 1.9 0 0 0 2.5 7Z',
    'M13 5.1v13.8',
  ],
  seat: [
    'M19 9.5V6.4a1.9 1.9 0 0 0-1.9-1.9H6.9A1.9 1.9 0 0 0 5 6.4v3.1',
    'M3 11.4a1.9 1.9 0 0 1 3.8 0v2.9h10.4v-2.9a1.9 1.9 0 0 1 3.8 0v4.7a1.9 1.9 0 0 1-1.9 1.9H4.9A1.9 1.9 0 0 1 3 16.1Z',
    'M5.5 18v1.8', 'M18.5 18v1.8',
  ],
  trophy: [
    'M6.5 9.2H5a2.4 2.4 0 0 1 0-4.7h1.5',
    'M17.5 9.2H19a2.4 2.4 0 0 0 0-4.7h-1.5',
    'M4.5 21.5h15',
    'M10.2 14.8V17c0 .5-.4.9-.9 1.15-1.1.5-1.9 1.9-1.9 3.35',
    'M13.8 14.8V17c0 .5.4.9.9 1.15 1.1.5 1.9 1.9 1.9 3.35',
    'M17.5 2.5h-11v6.4a5.5 5.5 0 0 0 11 0Z',
  ],
  calendar: [
    'M5.4 4.8h13.2a1.9 1.9 0 0 1 1.9 1.9v12.1a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9V6.7a1.9 1.9 0 0 1 1.9-1.9Z',
    'M16 2.5v4.6', 'M8 2.5v4.6', 'M3.5 11.2h17',
  ],
  /* ---------------- navigation and footer ---------------- */
  agenda: [
    'M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19V6a1.5 1.5 0 0 1 1.5-1.5Z',
    'M16 2.5v4', 'M8 2.5v4', 'M3 9.5h18',
    'M7.5 13h4', 'M7.5 16.5h7',
  ],
  team: [
    'M9 11.6a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Z',
    'M2.5 20.5v-1.7a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v1.7',
    'M17 4.6a3.6 3.6 0 0 1 0 6.9',
    'M21.5 20.5v-1.7a4 4 0 0 0-3-3.85',
  ],
  award: [
    'M12 14.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z',
    'M12 11.6 9.7 12.9l.45-2.6-1.9-1.85 2.62-.38L12 5.7l1.13 2.37 2.62.38-1.9 1.85.45 2.6Z',
    'm8.4 14.1-1.9 7 5.5-3 5.5 3-1.9-7',
  ],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 16v-4.5', 'M12 8h.01'],
  mail: [
    'M4.4 4.8h15.2a1.9 1.9 0 0 1 1.9 1.9v10.6a1.9 1.9 0 0 1-1.9 1.9H4.4a1.9 1.9 0 0 1-1.9-1.9V6.7a1.9 1.9 0 0 1 1.9-1.9Z',
    'm2.9 6.4 9.1 6.2 9.1-6.2',
  ],
  phone: [
    'M15.5 3.5a5 5 0 0 1 5 5',
    'M14.5 7a2 2 0 0 1 2 2',
    'M20.5 16.9v2.6a1.7 1.7 0 0 1-1.86 1.7 16.9 16.9 0 0 1-7.35-2.62 16.6 16.6 0 0 1-5.1-5.1A16.9 16.9 0 0 1 3.57 5.1 1.7 1.7 0 0 1 5.26 3.2h2.6a1.7 1.7 0 0 1 1.7 1.46c.1.82.3 1.62.58 2.38a1.7 1.7 0 0 1-.38 1.8l-1.1 1.1a13.6 13.6 0 0 0 5.1 5.1l1.1-1.1a1.7 1.7 0 0 1 1.8-.38c.76.28 1.56.48 2.38.58a1.7 1.7 0 0 1 1.46 1.73Z',
  ],
  instagram: [
    'M7.4 2.9h9.2a4.5 4.5 0 0 1 4.5 4.5v9.2a4.5 4.5 0 0 1-4.5 4.5H7.4a4.5 4.5 0 0 1-4.5-4.5V7.4a4.5 4.5 0 0 1 4.5-4.5Z',
    'M15.6 11.4a3.6 3.6 0 1 1-7.1 1.06 3.6 3.6 0 0 1 7.1-1.06Z',
    'M17.1 6.9h.01',
  ],
  facebook: ['M17.5 2.5h-2.7a4.6 4.6 0 0 0-4.6 4.6v2.7H7.5v3.6h2.7v7.2h3.6v-7.2h2.7l.9-3.6h-3.6V7.1a.9.9 0 0 1 .9-.9h2.7Z'],
  campus: [
    'M3 21.5h18',
    'M4.5 21.5V9.8L12 5l7.5 4.8v11.7',
    'M9.5 21.5v-5.4h5v5.4',
    'M12 2.5v2.5',
  ],
  arrowRight: ['M4.5 12h15', 'm13 5.5 6.5 6.5-6.5 6.5'],

};

export type Icon3DName = keyof typeof ICONS;

interface Props {
  name: string;
  size?: number;
  className?: string;
  /** Override the face colour. Defaults to the crimson gradient. */
  accent?: string;
  /** Turn off the extrude for tiny sizes where it just muddies the shape. */
  flat?: boolean;
}

export default function Icon3D({ name, size = 24, className = '', accent, flat = false }: Props) {
  const uid = useId().replace(/:/g, '');
  const paths = ICONS[name];
  if (!paths) return null;

  const faceId = `f${uid}`;
  const depth = size >= 20 ? 0.85 : 0.6;
  const strokeWidth = size >= 32 ? 1.5 : 1.7;

  const shared = {
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={faceId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent ?? 'var(--brand-light)'} />
          <stop offset="55%" stopColor={accent ?? 'var(--brand-bright)'} />
          <stop offset="100%" stopColor={accent ?? 'var(--brand)'} />
        </linearGradient>
      </defs>

      {/* 1. extrude */}
      {!flat && (
        <g transform={`translate(${depth} ${depth * 1.25})`} opacity={0.55}>
          {paths.map((d, i) => (
            <path key={`e${i}`} d={d} stroke="var(--icon-extrude)" {...shared} />
          ))}
        </g>
      )}

      {/* 2. face */}
      <g>
        {paths.map((d, i) => (
          <path key={`f${i}`} d={d} stroke={`url(#${faceId})`} {...shared} />
        ))}
      </g>

      {/* 3. specular highlight */}
      {!flat && (
        <g transform={`translate(-${depth * 0.45} -${depth * 0.5})`} opacity={0.3}>
          {paths.map((d, i) => (
            <path key={`h${i}`} d={d} stroke="var(--icon-highlight)" {...shared} strokeWidth={strokeWidth * 0.6} />
          ))}
        </g>
      )}
    </svg>
  );
}
