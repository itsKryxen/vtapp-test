'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

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
  const lastVisitedRef = useRef<string | null>(null);
  const cells = useMemo(makeCells, []);
  const cellIndex = useMemo(() => new Map(cells.map((cell, index) => [cell.id, index])), [cells]);
  const [values, setValues] = useState<number[]>(() => cells.map((cell) => cell.base));
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
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

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
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
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const next = Math.max(0, Math.min(1, -rect.top / distance));
      setProgress(next);
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
  }, []);

  const amaravatiX = CELL_ORIGIN_X + AMARAVATI_CELL.column * CELL_GAP;
  const amaravatiY = CELL_ORIGIN_Y + AMARAVATI_CELL.row * CELL_GAP;
  const mapScale = reducedMotion ? 1 : 1 + progress * 0.38;
  const capitalCount = Math.min(7, Math.round(progress * 6) + 1);

  return (
    <section ref={sectionRef} className="vtapp-map-scroll border-y border-white/10" aria-label="Interactive Andhra Pradesh map">
      <div className="vtapp-map-stage container-x">
        <div className="grid w-full">
          <div className="vtapp-map-panel panel brackets scanlines">
            <div className="vtapp-map-transform" style={{ transform: `scale(${mapScale})` }}>
              <svg
                ref={svgRef}
                viewBox="0 15 720 720"
                className="h-full w-full select-none"
                onPointerMove={handlePointerMove}
                onPointerLeave={() => { lastVisitedRef.current = null; setTrail([]); }}
                role="img"
                aria-labelledby="ap-map-svg-title ap-map-svg-description"
              >
                <title id="ap-map-svg-title">Interactive binary map of Andhra Pradesh</title>
                <desc id="ap-map-svg-description">Scroll to zoom toward Amaravati while its highlighted count advances from one to seven. Move across the digits to mutate the binary field and draw a local trail.</desc>
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

                <line x1="70" x2="650" y1={90 + progress * 520} y2={90 + progress * 520} className="vtapp-map-scanline" />

                <g className="font-mono" aria-hidden="true">
                  {cells.map((cell, index) => {
                    const value = cell.isAmaravati ? capitalCount : values[index];
                    return (
                      <text
                        key={cell.id}
                        x={cell.x}
                        y={cell.y}
                        textAnchor="middle"
                        className={`vtapp-map-cell ${cell.isAmaravati ? 'vtapp-map-cell-7' : `vtapp-map-cell-${value}`}`}
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

                <g className="vtapp-map-marker" style={{ opacity: 0.5 + progress * 0.5 }}>
                  <circle cx={amaravatiX} cy={amaravatiY - 5} r="22" fill="none" strokeWidth="1" strokeDasharray="3 5" />
                  <path d={`M ${amaravatiX + 9} ${amaravatiY - 13} H ${amaravatiX + 70}`} fill="none" />
                  <text x={amaravatiX + 77} y={amaravatiY - 15} className="font-mono text-[12px] font-bold tracking-[0.14em]">AMARAVATI // {capitalCount}</text>
                  <text x={amaravatiX + 77} y={amaravatiY + 3} className="font-mono text-[8px] tracking-[0.12em]">CAPITAL NODE // VIT-AP</text>
                </g>
              </svg>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
