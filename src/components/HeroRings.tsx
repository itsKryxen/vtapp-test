/**
 * HeroRings
 * Five SVG circular rings that sit behind the BlueprintMark.
 * All animation is pure CSS keyframes (see globals.css: hero-ring-* classes).
 * Server component – no client JS.
 */
export default function HeroRings() {
  const cx = 260;
  const cy = 260;

  return (
    <svg
      viewBox="0 0 520 520"
      className="hero-rings-svg"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      {/* Ring 1 – clockwise 35s */}
      <circle
        cx={cx} cy={cy} r={248}
        stroke="rgba(179,40,33,0.12)"
        strokeWidth="1"
        className="hero-ring-cw-35"
      />

      {/* Ring 2 – counter-clockwise 50s */}
      <circle
        cx={cx} cy={cy} r={220}
        stroke="rgba(224,104,94,0.07)"
        strokeWidth="0.8"
        strokeDasharray="4 10"
        className="hero-ring-ccw-50"
      />

      {/* Ring 3 – clockwise 70s */}
      <circle
        cx={cx} cy={cy} r={195}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1.5"
        strokeDasharray="2 8"
        className="hero-ring-cw-70"
      />

      {/* Ring 4 – dashed counter-clockwise 45s */}
      <circle
        cx={cx} cy={cy} r={168}
        stroke="rgba(179,40,33,0.18)"
        strokeWidth="0.6"
        strokeDasharray="6 6"
        className="hero-ring-ccw-45"
      />

      {/* Ring 5 – outer orbit, extremely slow 120s clockwise */}
      <circle
        cx={cx} cy={cy} r={245}
        stroke="rgba(224,104,94,0.06)"
        strokeWidth="0.5"
        strokeDasharray="1 18"
        className="hero-ring-cw-120"
      />

      {/* HUD tick marks on ring 1 at 0°, 90°, 180°, 270° */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const r = 248;
        const x = cx + Math.cos(rad) * r;
        const y = cy + Math.sin(rad) * r;
        const ix = cx + Math.cos(rad) * (r - 10);
        const iy = cy + Math.sin(rad) * (r - 10);
        return (
          <line
            key={i}
            x1={x} y1={y} x2={ix} y2={iy}
            stroke="rgba(224,104,94,0.35)"
            strokeWidth="1"
            className="hero-ring-cw-35"
          />
        );
      })}
    </svg>
  );
}
