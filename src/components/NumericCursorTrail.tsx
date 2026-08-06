'use client';

import { useEffect, useRef } from 'react';

// Cursor-trail controls. Keep the trail capped at seven visible signals.
export const CURSOR_TRAIL_LIMIT = 7;
export const CURSOR_TRAIL_EMIT_MS = 115;
export const CURSOR_TRAIL_STEP_MS = 170;
export const CURSOR_TRAIL_DIGITS = ['5', '4', '2', '1', '0'] as const;
export const CURSOR_TRAIL_HEAT_COLORS = {
  '5': '#fff2a8',
  '4': '#ffb347',
  '2': '#ff5b3d',
  '1': '#b32821',
  '0': '#4f1512',
} as const;
export const CURSOR_TRAIL_LINE_WIDTH = 2.2;
export const CURSOR_TRAIL_CLUSTER_PULL = 0.24;

type TrailSignal = {
  bornAt: number;
  x: number;
  y: number;
};

export default function NumericCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const context = canvas.getContext('2d');
    if (!context) return;

    let signals: TrailSignal[] = [];
    let animationFrame = 0;
    let lastEmission = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const lifetime = CURSOR_TRAIL_STEP_MS * CURSOR_TRAIL_DIGITS.length;
      signals = signals.filter((signal) => time - signal.bornAt < lifetime);

      const renderedSignals = signals.map((signal) => {
        const age = time - signal.bornAt;
        const stage = Math.max(
          0,
          Math.min(
            CURSOR_TRAIL_DIGITS.length - 1,
            Math.floor(age / CURSOR_TRAIL_STEP_MS),
          ),
        );
        const digit = CURSOR_TRAIL_DIGITS[stage];
        const stageProgress = (age % CURSOR_TRAIL_STEP_MS) / CURSOR_TRAIL_STEP_MS;
        const lifeProgress = age / lifetime;
        const zeroFade = digit === '0' ? 1 - stageProgress : 1;
        const opacity = Math.max(0, (0.92 - lifeProgress * 0.46) * zeroFade);

        return {
          ...signal,
          color: CURSOR_TRAIL_HEAT_COLORS[digit],
          digit,
          lifeProgress,
          opacity,
          renderY: signal.y - lifeProgress * 9,
        };
      });

      // Connect each number into one heat path. Segments become brighter and
      // wider toward the live end, while their gradients inherit both digits'
      // current heat-map colours.
      for (let index = 1; index < renderedSignals.length; index += 1) {
        const previous = renderedSignals[index - 1];
        const current = renderedSignals[index];
        const trailPosition = index / Math.max(1, renderedSignals.length - 1);
        const segmentLength = Math.hypot(current.x - previous.x, current.renderY - previous.renderY);
        const lengthShade = Math.min(1, segmentLength / 130);
        const gradient = context.createLinearGradient(
          previous.x,
          previous.renderY,
          current.x,
          current.renderY,
        );
        gradient.addColorStop(0, previous.color);
        gradient.addColorStop(1, current.color);

        context.save();
        context.globalAlpha =
          Math.min(previous.opacity, current.opacity) *
          (0.18 + trailPosition * 0.5) *
          (0.72 + lengthShade * 0.28);
        context.strokeStyle = gradient;
        context.lineWidth = 0.65 + CURSOR_TRAIL_LINE_WIDTH * trailPosition + lengthShade * 0.35;
        context.lineCap = 'round';
        context.shadowColor = current.color;
        context.shadowBlur = 3 + trailPosition * 8;
        context.beginPath();
        context.moveTo(previous.x, previous.renderY);
        context.lineTo(current.x, current.renderY);
        context.stroke();
        context.restore();
      }

      for (const signal of renderedSignals) {
        context.save();
        context.globalAlpha = signal.opacity;
        context.fillStyle = signal.color;
        context.shadowColor = signal.color;
        context.shadowBlur = 11 * (1 - signal.lifeProgress);
        context.font = `700 ${Math.max(9, 15 - signal.lifeProgress * 4)}px "JetBrains Mono", monospace`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(signal.digit, signal.x, signal.renderY);
        context.restore();
      }

      animationFrame = signals.length ? window.requestAnimationFrame(draw) : 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      if (event.target instanceof Element && event.target.closest('.vtapp-map-scroll')) {
        // Pause global emissions over the map, but let existing signals finish
        // their normal heat, count-down and fade sequence.
        return;
      }
      const now = performance.now();
      if (now - lastEmission < CURSOR_TRAIL_EMIT_MS) return;
      lastEmission = now;

      // Pull the existing chain toward the live pointer before adding its new
      // head. This keeps the seven signals compact without increasing the
      // number emitted per second.
      signals = signals.map((signal, index) => {
        const depth = (index + 1) / Math.max(1, signals.length);
        const pull = CURSOR_TRAIL_CLUSTER_PULL * (0.55 + depth * 0.45);
        return {
          ...signal,
          x: signal.x + (event.clientX - signal.x) * pull,
          y: signal.y + (event.clientY - signal.y) * pull,
        };
      });
      signals.push({ bornAt: now, x: event.clientX, y: event.clientY });
      if (signals.length > CURSOR_TRAIL_LIMIT) {
        signals = signals.slice(-CURSOR_TRAIL_LIMIT);
      }
      if (!animationFrame) animationFrame = window.requestAnimationFrame(draw);
    };

    const clear = () => {
      signals = [];
      context.clearRect(0, 0, width, height);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches || !finePointer.matches) clear();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    finePointer.addEventListener('change', onMotionPreferenceChange);
    reducedMotion.addEventListener('change', onMotionPreferenceChange);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      finePointer.removeEventListener('change', onMotionPreferenceChange);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="numeric-cursor-trail" aria-hidden="true" />;
}
