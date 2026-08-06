import { forwardRef, useId } from 'react';
import { VTAPP_LOGO_PATH } from '@/lib/vtappLogoPath';

const SEGMENTS = [
  {
    name: 'v',
    clip: { x: 0, y: 0, width: 214, height: 194 },
    routes: [
      'M 10 25 L 48 25 L 48 112 L 86 170 L 132 170 L 132 142 L 176 67 L 205 67',
      'M 28 25 L 69 25 L 69 103 L 101 151 L 126 151',
    ],
  },
  {
    name: 'dash',
    clip: { x: 211, y: 62, width: 65, height: 76 },
    routes: ['M 220 112 L 266 112'],
  },
  {
    name: 't',
    clip: { x: 274, y: 0, width: 194, height: 194 },
    routes: [
      'M 282 25 L 454 25 L 423 55 L 366 55 L 366 184',
      'M 310 25 L 310 50 L 347 50 L 347 153 L 385 153',
    ],
  },
  {
    name: 'a',
    clip: { x: 466, y: 0, width: 160, height: 198 },
    routes: [
      'M 550 22 L 602 117 L 618 183 L 580 183 L 551 101 L 521 160 L 480 187',
      'M 528 43 L 558 74 L 543 121 L 510 121',
    ],
  },
  {
    name: 'p-one',
    clip: { x: 623, y: 0, width: 171, height: 198 },
    routes: [
      'M 632 24 L 746 24 L 780 51 L 780 91 L 752 118 L 690 118 L 690 184',
      'M 652 25 L 652 62 L 729 62 L 748 76 L 730 93 L 674 93 L 674 151',
    ],
  },
  {
    name: 'p-two',
    clip: { x: 790, y: 0, width: 184, height: 198 },
    routes: [
      'M 797 24 L 913 24 L 949 51 L 949 92 L 920 119 L 860 119 L 860 184',
      'M 816 25 L 816 62 L 898 62 L 917 77 L 898 94 L 842 94 L 842 151',
    ],
  },
] as const;

type CircuitWordmarkProps = {
  className?: string;
  labelled?: boolean;
};

const CircuitWordmark = forwardRef<SVGSVGElement, CircuitWordmarkProps>(function CircuitWordmark(
  { className = '', labelled = false },
  ref,
) {
  const rawId = useId();
  const id = `vtapp-${rawId.replace(/:/g, '')}`;

  return (
    <svg
      ref={ref}
      viewBox="0 0 974 256"
      className={className}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? 'V-TAPP — Celebrate Technology!' : undefined}
      aria-hidden={labelled ? undefined : true}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path id={`${id}-silhouette`} d={VTAPP_LOGO_PATH} fillRule="evenodd" />

        {SEGMENTS.map(({ name, clip }) => (
          <clipPath id={`${id}-clip-${name}`} key={`clip-${name}`}>
            <rect {...clip} />
          </clipPath>
        ))}

        <clipPath id={`${id}-clip-tagline`}>
          <rect x="64" y="194" width="820" height="62" />
        </clipPath>

        {SEGMENTS.map(({ name, routes }) => (
          <mask id={`${id}-mask-${name}`} key={`mask-${name}`} maskUnits="userSpaceOnUse">
            <rect width="974" height="256" fill="black" />
            {routes.map((route, routeIndex) => (
              <path
                key={route}
                d={route}
                pathLength={1}
                className="vtapp-mask-trace"
                data-mask-segment={name}
                data-route={routeIndex}
                stroke="white"
                strokeWidth="38"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </mask>
        ))}

        <filter id={`${id}-soft-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0.69 0 0 0 0.12  0 0.07 0 0 0  0 0 0.15 0 0  0 0 0 0.72 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {SEGMENTS.map(({ name }) => (
        <g
          key={name}
          className="vtapp-letter"
          data-letter={name}
          clipPath={`url(#${id}-clip-${name})`}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <use className="vtapp-letter-base" href={`#${id}-silhouette`} fill="#B11226" />
          <use
            className="vtapp-letter-reveal"
            href={`#${id}-silhouette`}
            fill="#D53A4F"
            mask={`url(#${id}-mask-${name})`}
          />
        </g>
      ))}

      <g className="vtapp-tagline" clipPath={`url(#${id}-clip-tagline)`}>
        <use href={`#${id}-silhouette`} fill="#B11226" />
      </g>

      <g
        className="vtapp-circuit-network"
        stroke="#B11226"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-soft-glow)`}
      >
        {SEGMENTS.flatMap(({ name, routes }, segmentIndex) =>
          routes.map((route, routeIndex) => (
            <path
              key={`${name}-${routeIndex}`}
              d={route}
              pathLength={1}
              className="vtapp-energy-trace"
              data-energy-segment={name}
              data-segment-index={segmentIndex}
              strokeWidth={routeIndex === 0 ? 2.5 : 1.7}
            />
          )),
        )}
      </g>

      <g className="vtapp-energy-nodes" fill="#B11226" filter={`url(#${id}-soft-glow)`}>
        <circle className="vtapp-energy-node" cx="10" cy="25" r="3.2" />
        <circle className="vtapp-energy-node" cx="220" cy="112" r="2.4" />
        <circle className="vtapp-energy-node" cx="282" cy="25" r="2.7" />
        <circle className="vtapp-energy-node" cx="550" cy="22" r="2.7" />
        <circle className="vtapp-energy-node" cx="632" cy="24" r="2.7" />
        <circle className="vtapp-energy-node" cx="797" cy="24" r="2.7" />
      </g>
    </svg>
  );
});

export default CircuitWordmark;
