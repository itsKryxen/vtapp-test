'use client';

import { useRouter } from 'next/navigation';
import Countdown from './Countdown';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

type ZoneId = 'hackathon' | 'robotics' | 'gaming' | 'workshops' | 'design' | 'stage';

type Zone = {
  id: ZoneId;
  label: string;
  node: string;
  filter: string;
  x: number;
  y: number;
  events: string[];
};

const ZONES: Zone[] = [
  { id: 'hackathon', label: 'Hackathon', node: 'NODE 01', filter: 'coding', x: 30, y: 29, events: ['HackaVerse', 'Breach CTF', 'Code Relay'] },
  { id: 'robotics', label: 'Robotics', node: 'NODE 02', filter: 'robotics', x: 70, y: 29, events: ['RoboWars', 'Autonomous Systems', 'Drone Challenge'] },
  { id: 'gaming', label: 'Gaming', node: 'NODE 03', filter: 'gaming', x: 75, y: 55, events: ['Valorant', 'Console Circuit', 'Sim Racing'] },
  { id: 'workshops', label: 'Innovation Lab', node: 'NODE 04', filter: 'workshop', x: 66, y: 82, events: ['Bio-Hack Lab', 'Rapid Prototyping', 'IoT Foundry'] },
  { id: 'design', label: 'Creative Tech', node: 'NODE 05', filter: 'design', x: 34, y: 82, events: ['CAD Clash', 'Interface Sprint', 'Motion Lab'] },
  { id: 'stage', label: 'Main Stage', node: 'NODE 06', filter: 'business', x: 25, y: 55, events: ['Opening Keynote', 'Pitch Perfect', 'Final Showcase'] },
];

const zonePaths: Record<ZoneId, string> = {
  hackathon: 'M590 374 L348 235', robotics: 'M610 374 L845 235', gaming: 'M620 392 L920 445',
  workshops: 'M607 410 L800 655', design: 'M582 412 L410 652', stage: 'M572 392 L260 428',
};

type WorldStyle = CSSProperties & Record<`--${string}`, string>;

export default function FestivalWorld({ counts = {} }: { counts?: Record<string, number> }) {
  const router = useRouter();
  const worldRef = useRef<HTMLDivElement>(null);
  const chargeFrame = useRef<number>();
  const chargeStarted = useRef(0);
  const [active, setActive] = useState<ZoneId>('hackathon');
  const [ready, setReady] = useState(false);
  const [booting, setBooting] = useState(true);
  const [charge, setCharge] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [travelling, setTravelling] = useState<ZoneId | null>(null);
  const selected = ZONES.find((zone) => zone.id === active) ?? ZONES[0];

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let returning = false;
    try { returning = sessionStorage.getItem('vtapp-world-booted') === '1'; } catch { /* storage is optional */ }
    const duration = reduced || returning || window.innerWidth < 640 ? 250 : 3100;
    const readyTimer = window.setTimeout(() => setReady(true), 40);
    const bootTimer = window.setTimeout(() => {
      setBooting(false);
      try { sessionStorage.setItem('vtapp-world-booted', '1'); } catch { /* storage is optional */ }
    }, duration);
    return () => { window.clearTimeout(readyTimer); window.clearTimeout(bootTimer); };
  }, []);

  const moveWorld = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !worldRef.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
    const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
    worldRef.current.style.setProperty('--look-x', x.toFixed(3));
    worldRef.current.style.setProperty('--look-y', y.toFixed(3));
  }, []);

  const resetWorld = useCallback(() => {
    worldRef.current?.style.setProperty('--look-x', '0');
    worldRef.current?.style.setProperty('--look-y', '0');
  }, []);

  const travel = useCallback((zone: Zone) => {
    if (travelling) return;
    setActive(zone.id);
    setTravelling(zone.id);
    window.setTimeout(() => router.push(`/events?category=${zone.filter}`), 620);
  }, [router, travelling]);

  const stopCharging = useCallback(() => {
    if (chargeFrame.current) cancelAnimationFrame(chargeFrame.current);
    chargeFrame.current = undefined;
    setCharge((current) => current >= 100 ? current : 0);
  }, []);

  const startCharging = useCallback(() => {
    if (pulse || boosted || chargeFrame.current) return;
    chargeStarted.current = performance.now() - (charge / 100) * 1250;
    const tick = (now: number) => {
      const next = Math.min(100, ((now - chargeStarted.current) / 1250) * 100);
      setCharge(next);
      if (next >= 100) {
        chargeFrame.current = undefined;
        setPulse(true);
        setBoosted(true);
        window.setTimeout(() => { setPulse(false); setCharge(0); }, 4200);
        window.setTimeout(() => setBoosted(false), 5200);
        return;
      }
      chargeFrame.current = requestAnimationFrame(tick);
    };
    chargeFrame.current = requestAnimationFrame(tick);
  }, [boosted, charge, pulse]);

  useEffect(() => () => { if (chargeFrame.current) cancelAnimationFrame(chargeFrame.current); }, []);

  const skipBoot = () => {
    setReady(true);
    setBooting(false);
    try { sessionStorage.setItem('vtapp-world-booted', '1'); } catch { /* storage is optional */ }
  };

  return (
    <section className="festival-world-hero" aria-labelledby="world-title">
      <div className="world-atmosphere" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="world-topline">
        <span>VIT-AP / AMARAVATI</span><span>11—12 SEP 2026</span><span className="world-status"><i /> SYSTEM ONLINE</span>
      </div>

      <div className="world-title-lockup">
        <p>International technology festival</p>
        <h1 id="world-title">V-TAPP <span>2026</span></h1>
        <div><span>TECHNOLOGY</span><i /><span>INNOVATION</span><i /><span>COMPETITION</span></div>
      </div>

      <div
        ref={worldRef}
        className="festival-world"
        data-ready={ready}
        data-booting={booting}
        data-pulse={pulse}
        data-boosted={boosted}
        data-travelling={travelling ?? undefined}
        style={{ '--look-x': '0', '--look-y': '0' } as WorldStyle}
        onPointerMove={moveWorld}
        onPointerLeave={resetWorld}
      >
        <svg className="world-svg" viewBox="0 0 1200 760" role="img" aria-label="Interactive isometric map of the V-TAPP technology festival campus">
          <defs>
            <linearGradient id="world-ground" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#101821"/><stop offset="1" stopColor="#071016"/></linearGradient>
            <linearGradient id="world-top" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1b2c38"/><stop offset="1" stopColor="#101b23"/></linearGradient>
            <filter id="core-soft"><feGaussianBlur stdDeviation="12"/></filter>
          </defs>

          <g className="world-ground">
            <path d="M600 94 L1130 372 L600 680 L70 372 Z" fill="url(#world-ground)" stroke="#29404d" strokeWidth="2"/>
            <path d="M70 372 L600 680 L600 712 L70 404 Z" fill="#050a0e" stroke="#1b2c35"/>
            <path d="M1130 372 L600 680 L600 712 L1130 404 Z" fill="#03080b" stroke="#1b2c35"/>
            {Array.from({ length: 10 }).map((_, index) => <path key={`grid-a-${index}`} d={`M${130 + index * 53} ${340 - index * 28} L${660 + index * 53} ${648 - index * 28}`} className="world-grid-line" />)}
            {Array.from({ length: 10 }).map((_, index) => <path key={`grid-b-${index}`} d={`M${1070 - index * 53} ${340 - index * 28} L${540 - index * 53} ${648 - index * 28}`} className="world-grid-line" />)}
          </g>

          <g className="world-circuits">
            {ZONES.map((zone, index) => (
              <g key={zone.id} data-active={active === zone.id} style={{ '--delay': `${index * 120}ms` } as WorldStyle}>
                <path d={zonePaths[zone.id]} className="world-circuit-base" />
                <path d={zonePaths[zone.id]} className="world-circuit-energy" />
              </g>
            ))}
          </g>

          <g className="zone zone-hackathon" data-active={active === 'hackathon'} onPointerEnter={() => setActive('hackathon')} onClick={() => travel(ZONES[0])} tabIndex={0} role="button" aria-label="Explore Hackathon events" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && travel(ZONES[0])}>
            <g transform="translate(70 0)">
            <path d="M170 235 L283 174 L386 228 L273 292 Z" className="zone-pad"/>
            <path d="M196 232 L277 188 L350 227 L269 273 Z" className="building-roof"/>
            <path d="M196 232 L269 273 L269 205 L196 166 Z" className="building-side" transform="translate(0 0)"/>
            <path d="M269 273 L350 227 L350 159 L269 205 Z" className="building-front"/>
            <path d="M196 166 L277 122 L350 159 L269 205 Z" className="building-top"/>
            <path d="M220 174 L277 143 L325 167 L269 197 Z" className="roof-detail"/>
            <g className="server-slits">{[0,1,2,3].map(i => <path key={i} d={`M286 ${211 + i*11} L333 ${185 + i*11}`} />)}</g>
            </g>
          </g>

          <g className="zone zone-robotics" data-active={active === 'robotics'} onPointerEnter={() => setActive('robotics')} onClick={() => travel(ZONES[1])} tabIndex={0} role="button" aria-label="Explore Robotics events" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && travel(ZONES[1])}>
            <g transform="translate(-70 0)">
            <path d="M810 225 L918 166 L1031 225 L922 289 Z" className="zone-pad"/>
            <path d="M848 234 L921 195 L990 232 L918 273 Z" className="building-roof"/>
            <path d="M848 234 L918 273 L918 215 L848 178 Z" className="building-side"/>
            <path d="M918 273 L990 232 L990 174 L918 215 Z" className="building-front"/>
            <path d="M848 178 L922 138 L990 174 L918 215 Z" className="building-top"/>
            <g className="robot-arm"><path d="M914 179 L930 160 L950 168"/><circle cx="914" cy="179" r="6"/><circle cx="930" cy="160" r="5"/><path d="M948 160 l15 8 -13 8"/></g>
            <g className="dish"><path d="M881 171 Q895 151 908 170 Q894 179 881 171"/><path d="M895 170 L895 187"/></g>
            </g>
          </g>

          <g className="zone zone-gaming" data-active={active === 'gaming'} onPointerEnter={() => setActive('gaming')} onClick={() => travel(ZONES[2])} tabIndex={0} role="button" aria-label="Explore Gaming events" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && travel(ZONES[2])}>
            <g transform="translate(-100 -30)">
              <path d="M886 431 L1014 363 L1115 417 L986 491 Z" className="zone-pad"/>
              <path d="M917 420 L1000 375 L1074 414 L991 461 Z" className="building-top"/>
              <path d="M917 420 L991 461 L991 429 L917 389 Z" className="building-side"/>
              <path d="M991 461 L1074 414 L1074 382 L991 429 Z" className="building-front"/>
              <path d="M949 406 L1000 379 L1043 402 L992 430 Z" className="screen"/>
              <path d="M973 401 l22 12 25-14" className="screen-mark"/>
            </g>
          </g>

          <g className="zone zone-workshops" data-active={active === 'workshops'} onPointerEnter={() => setActive('workshops')} onClick={() => travel(ZONES[3])} tabIndex={0} role="button" aria-label="Explore Innovation Lab workshops" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && travel(ZONES[3])}>
            <g transform="translate(10 30)">
            <path d="M670 571 L792 504 L908 565 L784 636 Z" className="zone-pad"/>
            <path d="M711 570 L786 530 L861 570 L785 613 Z" className="building-roof"/>
            <path d="M711 570 L785 613 L785 552 L711 512 Z" className="building-side"/>
            <path d="M785 613 L861 570 L861 510 L785 552 Z" className="building-front"/>
            <path d="M711 512 L786 472 L861 510 L785 552 Z" className="building-top"/>
            <g className="lab-tanks"><ellipse cx="758" cy="509" rx="11" ry="6"/><path d="M747 509 v28 q11 8 22 0 v-28"/><ellipse cx="758" cy="537" rx="11" ry="6"/><ellipse cx="814" cy="513" rx="9" ry="5"/><path d="M805 513 v21 q9 7 18 0 v-21"/></g>
            </g>
          </g>

          <g className="zone zone-design" data-active={active === 'design'} onPointerEnter={() => setActive('design')} onClick={() => travel(ZONES[4])} tabIndex={0} role="button" aria-label="Explore Creative Technology events" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && travel(ZONES[4])}>
            <g transform="translate(10 30)">
            <path d="M282 558 L397 497 L521 562 L405 630 Z" className="zone-pad"/>
            <path d="M322 558 L397 518 L480 562 L404 605 Z" className="building-top"/>
            <path d="M322 558 L404 605 L404 563 L322 520 Z" className="building-side"/>
            <path d="M404 605 L480 562 L480 520 L404 563 Z" className="building-front"/>
            <path d="M322 520 L397 480 L480 520 L404 563 Z" className="creative-roof"/>
            <g className="creative-prisms"><path d="M359 512 l30-16 26 14-30 17z"/><path d="M385 527 v18 l30-17v-18"/></g>
            </g>
          </g>

          <g className="zone zone-stage" data-active={active === 'stage'} onPointerEnter={() => setActive('stage')} onClick={() => travel(ZONES[5])} tabIndex={0} role="button" aria-label="Explore Main Stage events" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && travel(ZONES[5])}>
            <g transform="translate(110 -40)">
            <path d="M75 425 L190 363 L315 429 L198 497 Z" className="zone-pad"/>
            <path d="M111 430 L189 389 L274 433 L197 478 Z" className="building-top"/>
            <path d="M111 430 L197 478 L197 448 L111 402 Z" className="building-side"/>
            <path d="M197 478 L274 433 L274 403 L197 448 Z" className="building-front"/>
            <path d="M147 409 L190 386 L239 411 L196 436 Z" className="stage-screen"/>
            <path d="M158 410 l31-16 36 18-31 18z" className="stage-signal"/>
            </g>
          </g>

          <g className="world-core" data-charging={charge > 0}>
            <ellipse cx="600" cy="392" rx="112" ry="47" fill="#48d6e9" opacity=".06" filter="url(#core-soft)"/>
            <path d="M510 380 L600 330 L692 379 L600 431 Z" className="core-plinth-top"/>
            <path d="M510 380 L600 431 L600 459 L510 408 Z" className="core-plinth-side"/>
            <path d="M692 379 L600 431 L600 459 L692 407 Z" className="core-plinth-front"/>
            <g className="core-machine">
              <ellipse cx="600" cy="368" rx="65" ry="27" className="core-ring core-ring-a"/>
              <ellipse cx="600" cy="356" rx="49" ry="21" className="core-ring core-ring-b"/>
              <ellipse cx="600" cy="343" rx="33" ry="14" className="core-ring core-ring-c"/>
              <path d="M579 370 L586 308 L614 308 L621 370 Z" className="core-column"/>
              <ellipse cx="600" cy="307" rx="14" ry="6" className="core-cap"/>
              <circle cx="600" cy="338" r="7" className="core-energy"/>
              <g className="core-orbit"><circle cx="548" cy="343" r="4"/><circle cx="652" cy="371" r="3"/><circle cx="624" cy="318" r="3"/></g>
            </g>
            <circle cx="600" cy="382" r="20" className="world-pulse"/>
          </g>

          <g className="world-life" aria-hidden="true">
            <g className="drone drone-a"><path d="M0 0 h18 M9 -9 v18"/><circle cx="9" cy="0" r="4"/></g>
            <g className="drone drone-b"><path d="M0 0 h16 M8 -8 v16"/><circle cx="8" cy="0" r="3"/></g>
            <g className="rover"><path d="M0 0 l13 7 -13 7 -13-7z"/><circle cx="-8" cy="10" r="2"/><circle cx="8" cy="10" r="2"/></g>
          </g>
        </svg>

        <div className="world-zone-labels" aria-hidden="true">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className="world-zone-label"
              data-active={active === zone.id}
              style={{ '--x': `${zone.x}%`, '--y': `${zone.y}%` } as WorldStyle}
              onPointerEnter={() => setActive(zone.id)}
              onFocus={() => setActive(zone.id)}
              onClick={() => travel(zone)}
              tabIndex={-1}
            >
              <small>{zone.node}</small><strong>{zone.label}</strong><span>{String(counts[zone.filter] ?? zone.events.length).padStart(2, '0')} EVENTS ↗</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="overclock-control"
          style={{ '--charge': `${charge}%` } as WorldStyle}
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); startCharging(); }}
          onPointerUp={stopCharging}
          onPointerCancel={stopCharging}
          onPointerLeave={stopCharging}
          aria-label="Hold to overclock the central technology core"
        >
          <span>{boosted ? '100%' : charge > 0 ? `${Math.round(charge)}%` : 'HOLD'}</span><small>{boosted ? 'OVERDRIVE ACTIVE' : 'TO OVERCLOCK'}</small>
        </button>
      </div>

      <div className="world-countdown" aria-label="Countdown to V-TAPP 2026">
        <p><span>FESTIVAL BEGINS</span> 11 SEP 2026</p>
        <Countdown to="2026-09-11T09:00:00+05:30" />
      </div>

      <div className="drone-merch-drop" data-visible={!booting}>
        <div className="merch-drone">
          <svg viewBox="0 0 180 78" fill="none" aria-hidden="true">
            <g className="merch-drone-rotor merch-drone-rotor--left">
              <ellipse cx="35" cy="19" rx="29" ry="5" />
              <circle cx="35" cy="19" r="5" />
            </g>
            <g className="merch-drone-rotor merch-drone-rotor--right">
              <ellipse cx="145" cy="19" rx="29" ry="5" />
              <circle cx="145" cy="19" r="5" />
            </g>
            <path d="M48 24 L70 35 M132 24 L110 35" className="merch-drone-arm" />
            <path d="M63 36 L76 27 H104 L117 36 L108 57 H72 Z" className="merch-drone-body" />
            <path d="M76 27 L84 19 H97 L104 27" className="merch-drone-canopy" />
            <circle cx="90" cy="43" r="7" className="merch-drone-eye" />
            <path d="M72 57 L65 67 M108 57 L115 67" className="merch-drone-leg" />
            <circle cx="63" cy="69" r="3" className="merch-drone-light" />
            <circle cx="117" cy="69" r="3" className="merch-drone-light" />
          </svg>
        </div>
        <div className="merch-tethers"><i /><i /></div>
        <button type="button" className="merch-shirt-link" onClick={() => router.push('/merch')} aria-label="Explore V-TAPP 2026 merchandise">
          <div className="merch-shirt-3d">
          <svg viewBox="0 0 190 180" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="shirt-front" x1="43" y1="24" x2="139" y2="159" gradientUnits="userSpaceOnUse">
                <stop stopColor="#17343e" />
                <stop offset=".48" stopColor="#0b2028" />
                <stop offset="1" stopColor="#061217" />
              </linearGradient>
              <linearGradient id="shirt-side" x1="145" y1="42" x2="169" y2="145" gradientUnits="userSpaceOnUse">
                <stop stopColor="#24606e" />
                <stop offset="1" stopColor="#0a2832" />
              </linearGradient>
              <linearGradient id="shirt-edge" x1="21" y1="48" x2="48" y2="142" gradientUnits="userSpaceOnUse">
                <stop stopColor="#102932" />
                <stop offset="1" stopColor="#041015" />
              </linearGradient>
            </defs>
            <path d="M48 42 L22 55 L8 92 L33 103 L43 82 L43 158 L139 158 L139 81 L154 101 L179 88 L160 51 L135 41 L115 27 L71 27 Z" fill="#02090d" opacity=".48" transform="translate(7 8)" />
            <path d="M139 46 L160 56 L179 88 L154 101 L139 81 Z" fill="url(#shirt-side)" stroke="#48d6e9" strokeOpacity=".55" />
            <path d="M48 46 L22 55 L8 92 L33 103 L43 82 L48 70 Z" fill="url(#shirt-edge)" stroke="#48d6e9" strokeOpacity=".38" />
            <path d="M48 46 L71 27 Q92 48 115 27 L139 46 L139 158 L43 158 L43 82 Z" fill="url(#shirt-front)" stroke="#71e6f5" strokeWidth="2" />
            <path d="M71 27 Q92 48 115 27" stroke="#8ff3ff" strokeWidth="3" />
            <path d="M49 53 L67 40 M134 53 L118 40" stroke="#8ff3ff" strokeOpacity=".45" />
            <path d="M139 46 L146 52 L146 148 L139 158" stroke="#a5f5ff" strokeOpacity=".35" />
            <path d="M55 146 L128 146" stroke="#48d6e9" strokeOpacity=".22" />
            <g className="merch-shirt-print">
              <text x="91" y="83" textAnchor="middle">V-TAPP</text>
              <text x="91" y="102" textAnchor="middle">2026</text>
              <path d="M66 113 H116" />
              <text x="91" y="127" textAnchor="middle">TECH FEST</text>
            </g>
            <path d="M55 47 Q88 60 128 47" stroke="white" strokeOpacity=".08" strokeWidth="7" />
          </svg>
          </div>
          <span>Inspect merch <i aria-hidden="true">↗</i></span>
        </button>
      </div>

      <button type="button" className="mobile-merch-link" onClick={() => router.push('/merch')}>
        <span>V-TAPP 2026 shirt</span><strong>Explore merch</strong><i aria-hidden="true">↗</i>
      </button>

      <nav className="world-mobile-zones" aria-label="Festival districts">
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            data-active={active === zone.id}
            onClick={() => setActive(zone.id)}
          >
            <span>{zone.node.replace('NODE ', '')}</span>{zone.label}
          </button>
        ))}
      </nav>

      <aside className="world-inspector" aria-live="polite">
        <div className="world-inspector-head"><span>{selected.node}</span><span>ACTIVE DISTRICT</span></div>
        <p>{String(counts[selected.filter] ?? selected.events.length).padStart(2, '0')} EVENTS</p>
        <h2>{selected.label}</h2>
        <ul>{selected.events.map((event) => <li key={event}>{event}</li>)}</ul>
        <button type="button" onClick={() => travel(selected)}>Explore district <span>→</span></button>
      </aside>

      {boosted && (
        <div className="core-feedback" role="status" aria-live="polite">
          <span><i /> OVERCLOCK COMPLETE</span>
          <strong>ALL DISTRICTS POWERED</strong>
          <small>Campus output stabilized at 100%</small>
        </div>
      )}

      {booting && (
        <div className="world-boot" role="status" aria-live="polite">
          <div className="world-boot-copy"><span>V-TAPP 2026 / WORLD INITIALIZATION</span><strong>ASSEMBLING FESTIVAL GRID</strong></div>
          <div className="world-boot-progress"><i /></div>
          <button type="button" onClick={skipBoot}>Skip sequence</button>
        </div>
      )}
      {travelling && <div className="world-transition" aria-hidden="true"><span>ENTERING {selected.label.toUpperCase()}</span></div>}
    </section>
  );
}
