'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

const CATEGORIES = [
  { id: 'ai', filter: 'technical', label: 'AI', preview: 'AI Arena · Promptcraft · Model Sprint', x: 50, y: 8, angle: -90, length: 34, mx: 50, my: 8, ma: -90, ml: 30 },
  { id: 'robotics', filter: 'robotics', label: 'Robotics', preview: 'Robowars · Line Follower · Drone Challenge', x: 88, y: 28, angle: -31, length: 32, mx: 82, my: 28, ma: -38, ml: 27 },
  { id: 'hackathon', filter: 'technical', label: 'Hackathon', preview: '24-hour Build · Product Sprint · Open Innovation', x: 84, y: 75, angle: 38, length: 31, mx: 78, my: 76, ma: 42, ml: 26 },
  { id: 'coding', filter: 'coding', label: 'Coding', preview: 'Code Relay · Debug Derby · Algorithm Rush', x: 18, y: 75, angle: 142, length: 31, mx: 20, my: 76, ma: 138, ml: 26 },
  { id: 'ctf', filter: 'technical', label: 'CTF', preview: 'Cipher Hunt · Web Exploit · Digital Forensics', x: 10, y: 31, angle: 211, length: 32, mx: 18, my: 28, ma: 218, ml: 27 },
  { id: 'hardware', filter: 'technical', label: 'Hardware', preview: 'Circuit Design · IoT Build · Embedded Systems', x: 50, y: 92, angle: 90, length: 34, mx: 50, my: 91, ma: 90, ml: 30 },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];
type NodeStyle = CSSProperties & Record<`--${string}`, string | number>;

export default function InteractiveTechCore() {
  const [active, setActive] = useState<CategoryId>('ai');
  const [running, setRunning] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const selected = CATEGORIES.find((category) => category.id === active) ?? CATEGORIES[0];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let visible = true;
    const sync = () => setRunning(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { rootMargin: '80px 0px', threshold: 0.08 });

    observer.observe(root);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function moveCore(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !sceneRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      sceneRef.current?.style.setProperty('--pointer-x', x.toFixed(3));
      sceneRef.current?.style.setProperty('--pointer-y', y.toFixed(3));
      frameRef.current = 0;
    });
  }

  function resetCore() {
    sceneRef.current?.style.setProperty('--pointer-x', '0');
    sceneRef.current?.style.setProperty('--pointer-y', '0');
  }

  return (
    <div
      ref={rootRef}
      className="tech-core"
      data-running={running ? 'true' : 'false'}
      onPointerMove={moveCore}
      onPointerLeave={resetCore}
    >
      <div className="tech-core-kicker" aria-hidden="true">
        <span>INTERACTIVE SYSTEM</span>
        <span>06 NODES · ONLINE</span>
      </div>

      <div ref={sceneRef} className="tech-core-scene">
        <div className="tech-core-grid" aria-hidden="true" />
        <div className="tech-core-ring tech-core-ring--outer" aria-hidden="true" />
        <div className="tech-core-ring tech-core-ring--middle" aria-hidden="true" />
        <div className="tech-core-ring tech-core-ring--inner" aria-hidden="true" />
        <div className="tech-core-axis tech-core-axis--x" aria-hidden="true" />
        <div className="tech-core-axis tech-core-axis--y" aria-hidden="true" />

        {CATEGORIES.map((category) => {
          const style: NodeStyle = {
            '--node-x': `${category.x}%`, '--node-y': `${category.y}%`,
            '--node-mx': `${category.mx}%`, '--node-my': `${category.my}%`,
            '--link-angle': `${category.angle}deg`, '--link-length': `${category.length}%`,
            '--link-m-angle': `${category.ma}deg`, '--link-m-length': `${category.ml}%`,
          };
          return (
            <div key={category.id} className="tech-core-route" data-category={category.id} data-active={active === category.id ? 'true' : 'false'} style={style}>
              <span className="tech-core-connection" aria-hidden="true"><i /></span>
              <button
                type="button"
                className="tech-core-node"
                aria-pressed={active === category.id}
                aria-controls="tech-core-preview"
                onClick={() => setActive(category.id)}
                onFocus={() => setActive(category.id)}
                onPointerEnter={() => setActive(category.id)}
              >
                <span className="tech-core-node-dot" aria-hidden="true" />
                <span>{category.label}</span>
              </button>
            </div>
          );
        })}

        <div className="tech-core-heart" aria-hidden="true">
          <div className="tech-core-heart-orbit" />
          <div className="tech-core-heart-grid" />
          <div className="tech-core-heart-mark">V-TAPP</div>
          <span>CORE / 26</span>
        </div>

        <div id="tech-core-preview" className="tech-core-preview" role="status" aria-live="polite">
          <span className="tech-core-preview-index">ACTIVE NODE</span>
          <strong>{selected.label}</strong>
          <p>{selected.preview}</p>
          <Link href={`/events?category=${selected.filter}`}>Explore track <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>
  );
}
