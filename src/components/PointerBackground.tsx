'use client';

import { useEffect, useRef } from 'react';

const GLYPHS = ['—', '/', '|', '\\', '—', '/', '|', '\\'];

export default function PointerBackground() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!field || !canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastPaint = 0;
    let start = performance.now();
    let targetX = window.innerWidth * 0.66;
    let targetY = window.innerHeight * 0.38;
    let pointerX = targetX;
    let pointerY = targetY;
    let pointerActive = false;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      frame = window.requestAnimationFrame(draw);
      if (document.hidden || now - lastPaint < 32) return;
      lastPaint = now;

      pointerX += (targetX - pointerX) * 0.075;
      pointerY += (targetY - pointerY) * 0.075;
      field.style.setProperty('--pointer-x', `${pointerX}px`);
      field.style.setProperty('--pointer-y', `${pointerY}px`);

      context.clearRect(0, 0, width, height);
      const step = width < 768 ? 28 : 23;
      const time = (now - start) * 0.00022;
      const lightTheme = document.documentElement.classList.contains('light');
      context.font = `500 ${Math.max(9, step * 0.5)}px var(--font-original-mono), monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      for (let y = step * 0.5; y < height; y += step) {
        for (let x = step * 0.5; x < width; x += step) {
          const dx = x - pointerX;
          const dy = y - pointerY;
          const distance = Math.hypot(dx, dy);
          const influence = pointerActive ? Math.max(0, 1 - distance / 360) : 0;
          const wave =
            Math.sin(x * 0.006 + time * 2.1) * 0.8 +
            Math.cos(y * 0.007 - time * 1.7) * 0.65 +
            Math.sin((x + y) * 0.0035 + time) * 0.4;
          const orbit = Math.atan2(dy, dx) + Math.PI / 2;
          const angle = wave * (1 - influence) + orbit * influence;
          const glyphIndex = ((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8;
          const alpha = 0.075 + influence * 0.2;

          context.fillStyle = influence > 0.18
            ? lightTheme
              ? `rgba(15, 74, 92, ${alpha + 0.04})`
              : `rgba(159, 226, 237, ${alpha + 0.035})`
            : lightTheme
              ? `rgba(39, 139, 170, ${alpha})`
              : `rgba(75, 183, 210, ${alpha})`;
          context.fillText(GLYPHS[glyphIndex], x, y);
        }
      }
    };

    const move = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      targetX = event.clientX;
      targetY = event.clientY;
      pointerActive = true;
      field.dataset.active = 'true';
    };

    const leave = () => {
      pointerActive = false;
      field.dataset.active = 'false';
      targetX = width * 0.66;
      targetY = height * 0.38;
    };

    const syncMotion = () => {
      window.cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
      if (!reducedMotion.matches) {
        start = performance.now();
        frame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    syncMotion();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    finePointer.addEventListener('change', leave);
    reducedMotion.addEventListener('change', syncMotion);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('mouseleave', leave);
      finePointer.removeEventListener('change', leave);
      reducedMotion.removeEventListener('change', syncMotion);
    };
  }, []);

  return (
    <div ref={fieldRef} className="pointer-background" data-active="false" aria-hidden="true">
      <span className="pointer-background__aurora" />
      <canvas ref={canvasRef} className="pointer-background__flow" />
      <span className="pointer-background__glow" />
    </div>
  );
}
