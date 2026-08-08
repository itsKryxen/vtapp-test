/**
 * Blueprint line-art rendering of the V-TAPP triangle.
 *
 * The hero's vector centrepiece: the logo mark redrawn as an engineering
 * drawing, with construction circles, dimension leaders, corner registration
 * marks and a halftone field.
 *
 * It animates like a plotter at work. Construction circles counter-rotate at
 * different speeds, the outlines draw themselves on load, a bright segment
 * traces the geometry on a loop, the vertex marks pulse, and a scan bar sweeps
 * down the drawing. All CSS (see globals.css), so it stays sharp at any size,
 * costs nothing on the main thread, and settles into a finished static drawing
 * for anyone on prefers-reduced-motion.
 *
 * Server component: no hooks, no client bundle.
 */
export default function BlueprintMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 520"
      className={className}
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="bpStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-bright)" />
          <stop offset="60%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--brand-dark)" />
        </linearGradient>

        <pattern id="bpHalftone" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="1.1" fill="var(--brand)" opacity="0.5" />
        </pattern>

        {/* the scan bar's soft edge */}
        <linearGradient id="bpScan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-bright)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--brand-bright)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--brand-bright)" stopOpacity="0" />
        </linearGradient>

        {/* everything below the scan bar is clipped to the triangle */}
        <clipPath id="bpClip">
          <path d="M62 130 L458 130 L260 462 Z" />
        </clipPath>
      </defs>

      <g className="bp-float">
        {/* ---- construction circles, counter-rotating ---- */}
        <circle cx="260" cy="260" r="236" stroke="currentColor" strokeOpacity="0.07" />
        <g className="bp-spin">
          <circle
            cx="260"
            cy="260"
            r="188"
            stroke="currentColor"
            strokeOpacity="0.09"
            strokeDasharray="3 7"
          />
        </g>
        <g className="bp-spin-rev">
          <circle
            cx="260"
            cy="260"
            r="120"
            stroke="var(--brand)"
            strokeOpacity="0.3"
            strokeDasharray="2 9"
          />
        </g>

        {/* ---- centre axes ---- */}
        <line x1="260" y1="8" x2="260" y2="512" stroke="currentColor" strokeOpacity="0.05" />
        <line x1="8" y1="260" x2="512" y2="260" stroke="currentColor" strokeOpacity="0.05" />

        {/* ---- halftone fill ---- */}
        <path d="M62 130 L458 130 L260 462 Z" fill="url(#bpHalftone)" className="bp-flicker" />

        {/* ---- scan bar, clipped to the triangle ---- */}
        <g clipPath="url(#bpClip)">
          <rect x="40" y="0" width="440" height="26" fill="url(#bpScan)" className="bp-sweep" />
        </g>

        {/* ---- outer triangle: draws on, then a segment traces it forever ---- */}
        <path
          d="M62 130 L458 130 L260 462 Z"
          pathLength={1}
          stroke="url(#bpStroke)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="bp-draw"
        />
        <path
          d="M62 130 L458 130 L260 462 Z"
          pathLength={1}
          stroke="var(--brand-light)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="bp-trace"
        />

        {/* ---- inner offset triangle ---- */}
        <path
          d="M112 163 L408 163 L260 411 Z"
          pathLength={1}
          stroke="var(--brand-bright)"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeDasharray="6 5"
          style={{ animation: 'bpDraw 700ms cubic-bezier(0.22, 1, 0.36, 1) 80ms backwards' }}
        />

        {/* ---- the V stroke ---- */}
        <path
          d="M150 163 L260 411 L370 163"
          pathLength={1}
          stroke="url(#bpStroke)"
          strokeWidth="2"
          strokeLinejoin="round"
          className="bp-draw"
          style={{ animationDelay: '0.5s' }}
        />

        {/* ---- the T crossbar ---- */}
        <line
          x1="196"
          y1="196"
          x2="324"
          y2="196"
          pathLength={1}
          stroke="var(--brand-bright)"
          strokeOpacity="0.85"
          strokeWidth="2"
          className="bp-draw"
          style={{ animationDelay: '0.9s' }}
        />
        <line
          x1="260"
          y1="196"
          x2="260"
          y2="330"
          stroke="var(--brand-bright)"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />

        {/* ---- dimension leader, top ---- */}
        <line x1="62" y1="104" x2="458" y2="104" stroke="currentColor" strokeOpacity="0.16" />
        <line x1="62" y1="97" x2="62" y2="111" stroke="currentColor" strokeOpacity="0.16" />
        <line x1="458" y1="97" x2="458" y2="111" stroke="currentColor" strokeOpacity="0.16" />
        <text
          x="260"
          y="94"
          textAnchor="middle"
          fill="currentColor"
          fillOpacity="0.45"
          fontSize="11"
          fontFamily="var(--font-mono), monospace"
          letterSpacing="2"
        >
          396.00
        </text>

        {/* ---- dimension leader, right ---- */}
        <line x1="486" y1="130" x2="486" y2="462" stroke="currentColor" strokeOpacity="0.12" />
        <text
          x="500"
          y="300"
          fill="currentColor"
          fillOpacity="0.45"
          fontSize="11"
          fontFamily="var(--font-mono), monospace"
          letterSpacing="2"
          transform="rotate(90 500 300)"
        >
          332.00
        </text>

        {/* ---- vertex registration marks, pulsing out of phase ---- */}
        {[
          [62, 130],
          [458, 130],
          [260, 462],
        ].map(([x, y], i) => (
          <g key={i} stroke="var(--brand-bright)" strokeWidth="1">
            <circle
              cx={x}
              cy={y}
              r="9"
              className="bp-pulse"
              style={{ animationDelay: `${i * 1.05}s` }}
            />
            <line x1={x - 15} y1={y} x2={x + 15} y2={y} strokeOpacity="0.4" />
            <line x1={x} y1={y - 15} x2={x} y2={y + 15} strokeOpacity="0.4" />
          </g>
        ))}

        {/* ---- corner registration brackets ---- */}
        {[
          [16, 16, 1, 1],
          [504, 16, -1, 1],
          [16, 504, 1, -1],
          [504, 504, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <path
            key={i}
            d={`M${x + 26 * sx} ${y} L${x} ${y} L${x} ${y + 26 * sy}`}
            pathLength={1}
            stroke="var(--brand)"
            strokeWidth="1.5"
            strokeOpacity="0.75"
            className="bp-draw"
            style={{ animationDelay: `${1.1 + i * 0.12}s` }}
          />
        ))}

        <text
          x="26"
          y="498"
          fill="currentColor"
          fillOpacity="0.35"
          fontSize="10"
          fontFamily="var(--font-mono), monospace"
          letterSpacing="3"
        >
          VT26 / MARK / REV.A
        </text>
      </g>
    </svg>
  );
}
