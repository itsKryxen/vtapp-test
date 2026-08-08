'use client';

import { useEffect, useRef } from 'react';

export default function PointerBackground() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let x = window.innerWidth * 0.5;
    let y = window.innerHeight * 0.35;

    const hide = () => {
      field.dataset.visible = 'false';
    };

    const update = () => {
      frame = 0;
      field.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      field.dataset.visible = 'true';
    };

    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || document.hidden) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const syncPreference = () => {
      if (!finePointer.matches || reducedMotion.matches) hide();
    };

    const handleVisibility = () => {
      if (document.hidden) hide();
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseleave', hide);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', hide);
    finePointer.addEventListener('change', syncPreference);
    reducedMotion.addEventListener('change', syncPreference);

    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', hide);
      finePointer.removeEventListener('change', syncPreference);
      reducedMotion.removeEventListener('change', syncPreference);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={fieldRef} className="pointer-background" data-visible="false" aria-hidden="true">
      <span className="pointer-background__glow" />
      <span className="pointer-background__grid" />
    </div>
  );
}
