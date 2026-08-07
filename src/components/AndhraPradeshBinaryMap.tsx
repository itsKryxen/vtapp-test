'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { FEST } from '@/lib/fest';

type BinaryCell = {
  base: 0 | 1;
  column: number;
  id: string;
  isAmaravati: boolean;
  row: number;
  x: number;
  y: number;
};

type TrailPoint = { id: string; x: number; y: number };

const CELL_GAP = 10.5;
const CELL_ORIGIN_X = 55;
const CELL_ORIGIN_Y = 150;
const AMARAVATI_CELL = { column: 29, row: 18 };
const EDITION_TIMELINE = [
  {
    year: '2022',
    edition: 1,
    threshold: 0,
    label: 'Origin signal',
    description: 'The first V-TAPP edition established the starting point for the festival.',
    meta: 'First edition',
  },
  {
    year: '2023',
    edition: 2,
    threshold: 0.5,
    label: 'Second transmission',
    description: 'The second edition continued the V-TAPP story one year later.',
    meta: 'One year later',
  },
  {
    year: '2026',
    edition: 3,
    threshold: 0.86,
    label: 'Current signal',
    description: `The current edition lands at VIT-AP University on ${FEST.dateLabel}.`,
    meta: 'Three-year interval',
  },
] as const;

const LAST_EDITION_INDEX = EDITION_TIMELINE.length - 1;
const DESKTOP_STORY_QUERY = '(min-width: 1280px)';
const STICKY_TOP = 88;

// Sampled from the supplied Andhra Pradesh silhouette. A 1 marks a position
// inside the state; the visible binary value is generated separately.
const AP_MASK = [
  '0000000000000000000000000000000000000000000000000000000100',
  '0000000000000000000000000000000000000000000000011100001000',
  '0000000000000000000000000000000000000000000000111110010000',
  '0000000000000000000000000000000000000000000011111111100000',
  '0000000000000000000000000000000000000000100001111111000000',
  '0000000000000000000000000000000000000000101111111110000000',
  '0000000000000000000000000000000000000000111111111000000000',
  '0000000000000000000000000000000000000111111111110000000000',
  '0000000000000000000000000000000000011111111111100000000000',
  '0000000000000000000000000000001111111111111111000000000000',
  '0000000000000000000000000000001111111111111100000000000000',
  '0000000000000000000000000000000011111111110000000000000000',
  '0000000000000000000000000000000011111111000000000000000000',
  '0000000000000000000000000001001111111110000000000000000000',
  '0000000000000000000000001100111111111110000000000000000000',
  '0000000000000000000000001111111111111110000000000000000000',
  '0000000000000000000011111111111111111110000000000000000000',
  '0000000000000000000111111111111111111000000000000000000000',
  '0000000000000000000111111111111100000000000000000000000000',
  '0000000000000000111111111111111100000000000000000000000000',
  '0000000000001111111111111111111000000000000000000000000000',
  '0000111111111111111111111110010000000000000000000000000000',
  '0000111111111111111111111000000000000000000000000000000000',
  '0001111111111111111111111000000000000000000000000000000000',
  '0000111111111111111111110000000000000000000000000000000000',
  '0000111111111111111111110000000000000000000000000000000000',
  '0000111111111111111111110000000000000000000000000000000000',
  '0011111111111111111111110000000000000000000000000000000000',
  '0011111111111111111111110000000000000000000000000000000000',
  '0011111111111111111111111000000000000000000000000000000000',
  '0001111111111111111111111000000000000000000000000000000000',
  '0001000111111111111111110000000000000000000000000000000000',
  '0000001111111111111111110000000000000000000000000000000000',
  '0001111111111111111111111000000000000000000000000000000000',
  '0000001100011111111111110000000000000000000000000000000000',
  '0000000000011111111111110000000000000000000000000000000000',
  '0000000000000111111111110000000000000000000000000000000000',
  '0000000000000111111111000000000000000000000000000000000000',
  '0000000000000011111000000000000000000000000000000000000000',
  '0000000000000110000000000000000000000000000000000000000000',
  '0000000000001100000000000000000000000000000000000000000000',
  '0000000000001000000000000000000000000000000000000000000000',
] as const;

function makeCells() {
  return AP_MASK.flatMap((maskRow, row) =>
    [...maskRow].flatMap((inside, column): BinaryCell[] => {
      if (inside !== '1') return [];
      const isAmaravati = row === AMARAVATI_CELL.row && column === AMARAVATI_CELL.column;
      return [{
        id: `${row}-${column}`,
        row,
        column,
        isAmaravati,
        x: CELL_ORIGIN_X + column * CELL_GAP,
        y: CELL_ORIGIN_Y + row * CELL_GAP,
        base: ((row * 7 + column * 3 + row * column) % 5 < 2 ? 1 : 0) as 0 | 1,
      }];
    }),
  );
}

export default function AndhraPradeshBinaryMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapTransformRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<SVGLineElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const timelineFillRef = useRef<HTMLSpanElement>(null);
  const lastVisitedRef = useRef<string | null>(null);
  const cells = useMemo(makeCells, []);
  const cellIndex = useMemo(() => new Map(cells.map((cell, index) => [cell.id, index])), [cells]);
  const [values, setValues] = useState<number[]>(() => cells.map((cell) => cell.base));
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [scrollEditionIndex, setScrollEditionIndex] = useState(0);
  const [selectedEditionIndex, setSelectedEditionIndex] = useState(LAST_EDITION_INDEX);
  const [isDesktopStory, setIsDesktopStory] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopMedia = window.matchMedia(DESKTOP_STORY_QUERY);
    const updatePreferences = () => {
      setReducedMotion(motionMedia.matches);
      setIsDesktopStory(desktopMedia.matches);
    };
    updatePreferences();
    motionMedia.addEventListener('change', updatePreferences);
    desktopMedia.addEventListener('change', updatePreferences);
    return () => {
      motionMedia.removeEventListener('change', updatePreferences);
      desktopMedia.removeEventListener('change', updatePreferences);
    };
  }, []);

  const visitCell = useCallback((cell: BinaryCell) => {
    if (lastVisitedRef.current === cell.id) return;
    lastVisitedRef.current = cell.id;
    const index = cellIndex.get(cell.id);
    if (index !== undefined && !cell.isAmaravati) {
      setValues((current) => {
        const next = [...current];
        next[index] = Math.min(2, current[index] + 1);
        return next;
      });
    }
    setTrail((current) => [
      { id: `${cell.id}-${performance.now()}`, x: cell.x, y: cell.y - 5 },
      ...current,
    ].slice(0, 11));
  }, [cellIndex]);

  const visitPointerCell = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const local = point.matrixTransform(matrix.inverse());
    const column = Math.round((local.x - CELL_ORIGIN_X) / CELL_GAP);
    const row = Math.round((local.y - CELL_ORIGIN_Y + 5) / CELL_GAP);
    const index = cellIndex.get(`${row}-${column}`);
    if (index === undefined) {
      lastVisitedRef.current = null;
      return;
    }
    visitCell(cells[index]);
  };

  useEffect(() => {
    const scrollDriven = isDesktopStory && !reducedMotion;
    if (!scrollDriven) {
      if (mapTransformRef.current) mapTransformRef.current.style.transform = 'scale(1)';
      if (scanlineRef.current) scanlineRef.current.style.transform = 'translateY(0px)';
      if (markerRef.current) markerRef.current.style.opacity = '1';
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight + STICKY_TOP);
      const next = Math.max(0, Math.min(1, (STICKY_TOP - rect.top) / distance));
      const nextEditionIndex = EDITION_TIMELINE.reduce(
        (activeIndex, item, index) => (next >= item.threshold ? index : activeIndex),
        0,
      );

      if (mapTransformRef.current) {
        mapTransformRef.current.style.transform = `scale(${1 + next * 0.38})`;
      }
      if (scanlineRef.current) {
        scanlineRef.current.style.transform = `translateY(${next * 520}px)`;
      }
      if (markerRef.current) {
        markerRef.current.style.opacity = String(0.5 + next * 0.5);
      }
      if (timelineFillRef.current) {
        timelineFillRef.current.style.height = `${next * 100}%`;
      }
      setScrollEditionIndex((current) => (current === nextEditionIndex ? current : nextEditionIndex));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isDesktopStory, reducedMotion]);

  const scrollDriven = isDesktopStory && !reducedMotion;
  const activeEditionIndex = scrollDriven ? scrollEditionIndex : selectedEditionIndex;

  useEffect(() => {
    if (scrollDriven || !timelineFillRef.current) return;
    timelineFillRef.current.style.height = `${(activeEditionIndex / LAST_EDITION_INDEX) * 100}%`;
  }, [activeEditionIndex, scrollDriven]);

  const selectEdition = (index: number) => {
    setSelectedEditionIndex(index);
    if (!scrollDriven) return;
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const distance = Math.max(1, rect.height - window.innerHeight + STICKY_TOP);
    const sectionTop = window.scrollY + rect.top;
    window.scrollTo({
      top: sectionTop - STICKY_TOP + EDITION_TIMELINE[index].threshold * distance,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const amaravatiX = CELL_ORIGIN_X + AMARAVATI_CELL.column * CELL_GAP;
  const amaravatiY = CELL_ORIGIN_Y + AMARAVATI_CELL.row * CELL_GAP;
  const capitalCount = EDITION_TIMELINE[activeEditionIndex].edition;

  return (
    <section ref={sectionRef} className="vtapp-map-scroll border-y border-white/30" aria-label="Interactive Andhra Pradesh map">
      <div className="vtapp-map-stage container-x">
        <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="vtapp-map-panel panel brackets scanlines">
            {Array.from({ length: 4 }, (_, index) => (
              <span
                key={index}
                className={`vtapp-map-border-signal vtapp-map-border-signal-${index + 1}`}
                aria-hidden="true"
              >
                <span className="vtapp-map-border-signal-tail">
                  <span className="vtapp-map-border-signal-tip" />
                </span>
                <span className="vtapp-map-border-signal-label">
                  <span>V-TAPP</span>
                  <span>// 2026</span>
                </span>
              </span>
            ))}
            <div ref={mapTransformRef} className="vtapp-map-transform">
              <svg
                ref={svgRef}
                viewBox="0 15 720 720"
                className="h-full w-full select-none"
                onPointerMove={visitPointerCell}
                onPointerDown={visitPointerCell}
                onPointerLeave={() => { lastVisitedRef.current = null; setTrail([]); }}
                role="img"
                aria-labelledby="ap-map-svg-title ap-map-svg-description"
              >
                <title id="ap-map-svg-title">Interactive binary map of Andhra Pradesh</title>
                <desc id="ap-map-svg-description">Explore three V-TAPP editions around the highlighted VIT-AP node. Move or tap across the digits to mutate the binary field and draw a local trail.</desc>
                <defs>
                  <filter id="vtapp-map-glow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <linearGradient id="vtapp-trail-gradient" x1="0" x2="1">
                    <stop offset="0" stopColor="rgb(var(--fg))" stopOpacity="0" />
                    <stop offset="1" stopColor="rgb(var(--em-300))" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                <line ref={scanlineRef} x1="70" x2="650" y1="90" y2="90" className="vtapp-map-scanline" />

                <g className="font-mono" aria-hidden="true">
                  {cells.map((cell, index) => {
                    const value = cell.isAmaravati ? capitalCount : values[index];
                    return (
                      <text
                        key={cell.id}
                        x={cell.x}
                        y={cell.y}
                        textAnchor="middle"
                        className={`vtapp-map-cell ${cell.isAmaravati ? 'vtapp-map-cell-node' : `vtapp-map-cell-${value}`}`}
                      >
                        {value}
                      </text>
                    );
                  })}
                </g>

                {trail.length > 1 && (
                  <polyline
                    points={[...trail].reverse().map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke="url(#vtapp-trail-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.82"
                    filter="url(#vtapp-map-glow)"
                    pointerEvents="none"
                  />
                )}
                {trail.map((point, index) => (
                  <circle
                    key={point.id}
                    cx={point.x}
                    cy={point.y}
                    r={Math.max(1.5, 5 - index * 0.36)}
                    className={index < 3 ? 'vtapp-map-trail-hot' : 'vtapp-map-trail'}
                    opacity={Math.max(0.08, 0.9 - index * 0.08)}
                    pointerEvents="none"
                  />
                ))}

                <g ref={markerRef} className="vtapp-map-marker">
                  <circle cx={amaravatiX} cy={amaravatiY - 5} r="22" fill="none" strokeWidth="1" strokeDasharray="3 5" />
                  <path d={`M ${amaravatiX + 9} ${amaravatiY - 13} H ${amaravatiX + 115}`} fill="none" />
                  <text x={amaravatiX + 117} y={amaravatiY - 15} className="font-mono text-[12px] font-bold tracking-[0.14em]">VIT-AP // {capitalCount}</text>
                  <text x={amaravatiX + 117} y={amaravatiY + 3} className="font-mono text-[8px] tracking-[0.12em]">UNIVERSITY NODE</text>
                </g>
              </svg>
            </div>
          </div>

          <aside className="vtapp-timeline panel brackets flex min-h-[360px] flex-col p-6 sm:p-8" aria-label="V-TAPP edition timeline">
            <div className="flex items-center justify-between gap-4 border-b border-white/30 pb-5">
              <div>
                <p className="mono-label text-brand-500">V-TAPP HISTORY</p>
                <h2 className="mt-2 font-display text-2xl font-light text-white">Edition timeline</h2>
              </div>
              <span className="font-mono text-xs text-slate-500">
                {String(activeEditionIndex + 1).padStart(2, '0')} / 03
              </span>
            </div>

            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
              {scrollDriven ? 'Scroll or select an edition' : 'Select an edition to explore'}
            </p>

            <div className="relative mt-5 flex-1">
              <span
                ref={timelineFillRef}
                className="absolute -left-px top-0 w-px bg-brand-500 transition-[height] duration-300"
                style={scrollDriven ? undefined : { height: `${(activeEditionIndex / LAST_EDITION_INDEX) * 100}%` }}
                aria-hidden="true"
              />
              <ol className="vtapp-timeline-list border-l border-white/30 pl-5">
                {EDITION_TIMELINE.map((item, index) => {
                  const active = index === activeEditionIndex;
                  const reached = index <= activeEditionIndex;
                  return (
                    <li key={item.year} className="relative">
                      <span
                        className={`absolute -left-[1.59rem] top-5 h-2.5 w-2.5 border transition-colors duration-300 ${
                          reached
                            ? 'border-brand-400 bg-brand-600 shadow-[0_0_16px_rgb(179_40_33/.8)]'
                            : 'border-white/40 bg-ink-950'
                        }`}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        className={`vtapp-timeline-card w-full border px-4 py-3 text-left transition-colors ${
                          active
                            ? 'border-brand-500/60 bg-brand-600/10'
                            : 'border-white/30 bg-ink-900/35 hover:border-white/40 hover:bg-white/[.025]'
                        }`}
                        aria-pressed={active}
                        aria-current={active ? 'step' : undefined}
                        aria-label={`Explore V-TAPP ${item.year}, edition ${item.edition}`}
                        onClick={() => selectEdition(index)}
                      >
                        <span className="flex items-start justify-between gap-4">
                          <span>
                            <span className={`block font-display text-2xl font-light transition-colors ${active ? 'text-white' : 'text-slate-300'}`}>
                              {item.year}
                            </span>
                            <span className={`mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] ${active ? 'text-brand-400' : 'text-slate-500'}`}>
                              {item.label}
                            </span>
                          </span>
                          <span className={`font-mono text-xs ${active ? 'text-brand-400' : 'text-slate-500'}`}>
                            0{item.edition}
                          </span>
                        </span>
                        <span className={`mt-2 block text-[11px] leading-relaxed ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.description}
                        </span>
                        <span className={`mt-2 block font-mono text-[8px] uppercase tracking-[0.15em] ${active ? 'text-slate-400' : 'text-slate-600'}`}>
                          {item.meta}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
