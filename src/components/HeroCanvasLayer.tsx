'use client';

import { useEffect, useRef } from 'react';

/*
 * HeroCanvasLayer  v2
 * ─────────────────────────────────────────────────────────────
 * Three particle systems:
 *   SYS-1: 30 tiny white slow drifters  (opacity 0.08–0.22)
 *   SYS-2: 18 small red orbital/drifters (opacity 0.15–0.45)
 *   SYS-3:  6 bright crimson sparks      (fast, brief, rare)
 *
 * Neural network:
 *   14 softly-drifting nodes
 *   Edges between nodes within 165px
 *   Energy pulses travel toward center
 *
 * Radar sweep:  one wedge, 8-second period
 * Scan flash:   reads '.hero--scanning' class for brightness boost
 * ─────────────────────────────────────────────────────────────
 */

/* ─── types ─────────────────────────────────────────────── */

interface Sys1Particle { x: number; y: number; vx: number; vy: number; a: number; ad: number; sz: number; }
interface Sys2Particle { x: number; y: number; r: number; angle: number; speed: number; a: number; ad: number; sz: number; orbit: boolean; vx: number; vy: number; }
interface Sys3Spark    { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; sz: number; }
interface NetNode      { x: number; y: number; vx: number; vy: number; a: number; ad: number; phase: number; }
interface EnergyPulse  { ni: number; nj: number; t: number; speed: number; a: number; }

/* ─── helpers ───────────────────────────────────────────── */

const R = (a: number, b: number) => Math.random() * (b - a) + a;

function sys1(w: number, h: number): Sys1Particle {
  return { x: R(0, w), y: R(0, h), vx: R(-0.04, 0.04), vy: R(-0.06, 0.02), a: R(0.06, 0.2), ad: Math.random() < 0.5 ? 1 : -1, sz: R(0.4, 1.2) };
}

function sys2(w: number, h: number): Sys2Particle {
  const cx = w / 2, cy = h / 2;
  const orbit = Math.random() < 0.6;
  if (orbit) {
    const r = R(50, Math.min(cx, cy) * 0.9);
    const angle = R(0, Math.PI * 2);
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, r, angle, speed: R(0.0002, 0.0009) * (Math.random() < 0.5 ? 1 : -1), a: R(0.12, 0.42), ad: Math.random() < 0.5 ? 1 : -1, sz: R(0.8, 2.4), orbit: true, vx: 0, vy: 0 };
  }
  return { x: R(0, w), y: R(0, h), r: 0, angle: 0, speed: 0, a: R(0.1, 0.38), ad: 1, sz: R(0.7, 1.8), orbit: false, vx: R(-0.06, 0.06), vy: R(-0.08, 0.03) };
}

function sys3(w: number, h: number): Sys3Spark {
  const cx = w / 2, cy = h / 2;
  const angle = R(0, Math.PI * 2);
  const r = R(40, Math.min(cx, cy) * 0.6);
  const speed = R(0.8, 2.5);
  const dir = angle + R(-0.5, 0.5);
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed, life: 0, maxLife: R(0.3, 0.9), sz: R(1.2, 2.4) };
}

function makeNodes(w: number, h: number): NetNode[] {
  const cx = w / 2, cy = h / 2;
  const nodes: NetNode[] = [];
  let attempts = 0;
  while (nodes.length < 14 && attempts < 200) {
    const x = R(w * 0.05, w * 0.95), y = R(h * 0.05, h * 0.95);
    if (Math.hypot(x - cx, y - cy) > 70) {
      nodes.push({ x, y, vx: R(-0.04, 0.04), vy: R(-0.04, 0.04), a: R(0.1, 0.35), ad: Math.random() < 0.5 ? 1 : -1, phase: R(0, Math.PI * 2) });
    }
    attempts++;
  }
  return nodes;
}

function makePulse(nodes: NetNode[], cx: number, cy: number, existing: EnergyPulse[]): EnergyPulse | null {
  const THRESH = 165;
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < THRESH) {
        const alreadyActive = existing.some(p => (p.ni === i && p.nj === j) || (p.ni === j && p.nj === i));
        if (!alreadyActive) edges.push([i, j]);
      }
    }
  }
  if (!edges.length) return null;
  const [a, b] = edges[Math.floor(Math.random() * edges.length)];
  // direction: whichever node is farther from center becomes source
  const da = Math.hypot(nodes[a].x - cx, nodes[a].y - cy);
  const db = Math.hypot(nodes[b].x - cx, nodes[b].y - cy);
  return { ni: da > db ? a : b, nj: da > db ? b : a, t: 0, speed: R(0.003, 0.009), a: R(0.25, 0.55) };
}

/* ─── component ─────────────────────────────────────────── */

export default function HeroCanvasLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);

  const stateRef = useRef<{
    s1: Sys1Particle[];
    s2: Sys2Particle[];
    s3: Sys3Spark[];
    nodes: NetNode[];
    pulses: EnergyPulse[];
    w: number; h: number;
    t0: number;
    reduced: boolean;
    nextSparkAt: number;
    nextPulseAt: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let w = 0, h = 0;

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stateRef.current) {
        const s = stateRef.current;
        s.w = w; s.h = h;
        s.s1    = Array.from({ length: 30 }, () => sys1(w, h));
        s.s2    = Array.from({ length: 18 }, () => sys2(w, h));
        s.nodes = makeNodes(w, h);
        s.pulses = [];
      }
    }

    resize();
    stateRef.current = {
      s1: Array.from({ length: 30 }, () => sys1(w, h)),
      s2: Array.from({ length: 18 }, () => sys2(w, h)),
      s3: [],
      nodes: makeNodes(w, h),
      pulses: [],
      w, h,
      t0: performance.now(),
      reduced,
      nextSparkAt: performance.now() + R(1500, 4000),
      nextPulseAt: performance.now() + R(500, 1500),
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw(now: number) {
      const s = stateRef.current;
      if (!s || !ctx) return;

      const elapsed = (now - s.t0) / 1000;
      const { w, h } = s;
      const cx = w / 2, cy = h / 2;
      const scanning = !!(canvas?.closest('.hero--scanning'));
      const brightMult = scanning ? 1.6 : 1;

      ctx.clearRect(0, 0, w, h);

      /* ═══ SYS-1: white slow particles ═══ */
      for (const p of s.s1) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;
        p.a += p.ad * 0.0015;
        if (p.a > 0.22) { p.a = 0.22; p.ad = -1; }
        if (p.a < 0.06) { p.a = 0.06; p.ad = 1; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(p.a * brightMult).toFixed(3)})`;
        ctx.fill();
      }

      /* ═══ SYS-2: red orbital/drift particles ═══ */
      for (const p of s.s2) {
        if (p.orbit) {
          p.angle += p.speed;
          p.x = cx + Math.cos(p.angle) * p.r;
          p.y = cy + Math.sin(p.angle) * p.r;
        } else {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          if (p.y < -8) p.y = h + 8;
          if (p.y > h + 8) p.y = -8;
        }
        p.a += p.ad * 0.0022;
        if (p.a > 0.45) { p.a = 0.45; p.ad = -1; }
        if (p.a < 0.1)  { p.a = 0.1;  p.ad = 1;  }

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz * 2.8);
        const alpha = (p.a * brightMult).toFixed(3);
        grd.addColorStop(0, `rgba(224,104,94,${alpha})`);
        grd.addColorStop(1, 'rgba(224,104,94,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(238,156,149,${Math.min(1, parseFloat(alpha) * 1.5).toFixed(3)})`;
        ctx.fill();
      }

      /* ═══ SYS-3: sparks ═══ */
      if (now > s.nextSparkAt && s.s3.length < 6) {
        s.s3.push(sys3(w, h));
        s.nextSparkAt = now + R(800, 3500);
      }
      for (let i = s.s3.length - 1; i >= 0; i--) {
        const sp = s.s3[i];
        sp.x += sp.vx; sp.y += sp.vy;
        sp.vx *= 0.97; sp.vy *= 0.97;
        sp.life += 0.016;
        const lifePct = sp.life / sp.maxLife;
        if (lifePct >= 1) { s.s3.splice(i, 1); continue; }
        const alpha = Math.sin(lifePct * Math.PI) * 0.85 * brightMult;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(238,156,149,${alpha.toFixed(3)})`;
        ctx.fill();
        // trailing tail
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(sp.x - sp.vx * 5, sp.y - sp.vy * 5);
        ctx.strokeStyle = `rgba(224,104,94,${(alpha * 0.4).toFixed(3)})`;
        ctx.lineWidth = sp.sz * 0.5;
        ctx.stroke();
      }

      /* ═══ Neural network ═══ */
      const THRESH = 165;
      const NET_OPACITY = scanning ? 0.14 : 0.055;

      // Update nodes
      for (const nd of s.nodes) {
        nd.x += nd.vx; nd.y += nd.vy;
        if (nd.x < 10 || nd.x > w - 10) nd.vx *= -1;
        if (nd.y < 10 || nd.y > h - 10) nd.vy *= -1;
        nd.a += nd.ad * 0.002;
        if (nd.a > 0.35) { nd.a = 0.35; nd.ad = -1; }
        if (nd.a < 0.08) { nd.a = 0.08; nd.ad = 1;  }
      }

      // Draw edges
      for (let i = 0; i < s.nodes.length; i++) {
        for (let j = i + 1; j < s.nodes.length; j++) {
          const ni = s.nodes[i], nj = s.nodes[j];
          const dist = Math.hypot(ni.x - nj.x, ni.y - nj.y);
          if (dist < THRESH) {
            const fade = 1 - dist / THRESH;
            ctx.beginPath();
            ctx.moveTo(ni.x, ni.y);
            ctx.lineTo(nj.x, nj.y);
            ctx.strokeStyle = `rgba(179,40,33,${(NET_OPACITY * fade).toFixed(4)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const nd of s.nodes) {
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224,104,94,${(nd.a * brightMult).toFixed(3)})`;
        ctx.fill();
      }

      // Spawn + draw energy pulses
      if (now > s.nextPulseAt && s.pulses.length < 8) {
        const p = makePulse(s.nodes, cx, cy, s.pulses);
        if (p) s.pulses.push(p);
        s.nextPulseAt = now + R(300, 900);
      }

      for (let i = s.pulses.length - 1; i >= 0; i--) {
        const p = s.pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { s.pulses.splice(i, 1); continue; }

        const ni = s.nodes[p.ni], nj = s.nodes[p.nj];
        const px = ni.x + (nj.x - ni.x) * p.t;
        const py = ni.y + (nj.y - ni.y) * p.t;
        const alpha = Math.sin(p.t * Math.PI) * p.a * brightMult;

        // pulse glow
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 5);
        grd.addColorStop(0, `rgba(224,104,94,${alpha.toFixed(3)})`);
        grd.addColorStop(1, 'rgba(224,104,94,0)');
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        // core
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,200,190,${Math.min(1, alpha * 1.4).toFixed(3)})`;
        ctx.fill();
      }

      /* ═══ Radar sweep ═══ */
      const RADAR_PERIOD = 8;
      const radarAngle = ((elapsed % RADAR_PERIOD) / RADAR_PERIOD) * Math.PI * 2;
      const radarR = Math.min(cx, cy) * 0.92;
      const sweepArc = (24 * Math.PI) / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(radarAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radarR, -sweepArc, 0);
      ctx.closePath();
      const wg = ctx.createLinearGradient(-radarR * 0.3, 0, radarR, 0);
      wg.addColorStop(0, 'rgba(224,104,94,0)');
      wg.addColorStop(1, `rgba(224,104,94,${scanning ? 0.14 : 0.07})`);
      ctx.fillStyle = wg;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radarR, 0);
      ctx.strokeStyle = `rgba(224,104,94,${scanning ? 0.35 : 0.18})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="hero-canvas-layer"
    />
  );
}
