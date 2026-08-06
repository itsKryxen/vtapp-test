'use client';

import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/** Cursor-reactive PCB artwork that sits behind the event grid. */
export default function EventCircuitField({ children }: Props) {
  const fieldRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const updatePointer = (event: PointerEvent<HTMLElement>) => {
    const field = fieldRef.current;
    if (!field) return;

    const bounds = field.getBoundingClientRect();
    pointerRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
    field.dataset.active = 'true';

    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      field.style.setProperty('--pcb-x', `${pointerRef.current.x}px`);
      field.style.setProperty('--pcb-y', `${pointerRef.current.y}px`);
      frameRef.current = null;
    });
  };

  return (
    <section
      ref={fieldRef}
      className="event-circuit-field"
      onPointerMove={updatePointer}
      onPointerLeave={(event) => {
        event.currentTarget.dataset.active = 'false';
      }}
    >
      <div className="event-circuit-layer" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="event-pcb-pattern" width="360" height="260" patternUnits="userSpaceOnUse">
              <g className="event-circuit-board">
                <path d="M0 38H74V86H144V126H246" />
                <path d="M44 0V48H116V166H196V224H360" />
                <path d="M0 214H88V188H274V108H330V0" />
                <path d="M178 0V64H288V154H360" />
                <path d="M0 142H34V112H86" />
                <path d="M232 260V198H316V184H360" />
                <circle cx="74" cy="38" r="3" />
                <circle cx="144" cy="126" r="3" />
                <circle cx="246" cy="126" r="4" />
                <circle cx="116" cy="166" r="3" />
                <circle cx="196" cy="224" r="4" />
                <circle cx="274" cy="188" r="3" />
                <circle cx="274" cy="108" r="4" />
                <circle cx="288" cy="64" r="3" />
                <circle cx="34" cy="142" r="3" />
                <circle cx="316" cy="198" r="3" />
              </g>
              <g className="event-circuit-signal">
                <path d="M0 38H74V86H144V126H246" pathLength="100" />
                <path d="M44 0V48H116V166H196V224H360" pathLength="100" />
                <path d="M0 214H88V188H274V108H330V0" pathLength="100" />
                <path d="M178 0V64H288V154H360" pathLength="100" />
                <path d="M232 260V198H316V184H360" pathLength="100" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#event-pcb-pattern)" />
        </svg>
      </div>

      <div className="event-circuit-content">{children}</div>
    </section>
  );
}
