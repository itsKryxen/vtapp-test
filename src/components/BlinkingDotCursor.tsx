'use client';

import { useEffect, useRef } from 'react';

export default function BlinkingDotCursor() {
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const finePointer = window.matchMedia('(pointer: fine)');
    const root = document.documentElement;

    const setEnabled = () => {
      root.classList.toggle('has-dot-cursor', finePointer.matches);
      if (!finePointer.matches) cursor.dataset.visible = 'false';
    };

    const moveCursor = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      cursor.dataset.visible = 'true';
    };

    const hideCursor = () => {
      cursor.dataset.visible = 'false';
    };

    setEnabled();
    window.addEventListener('pointermove', moveCursor, { passive: true });
    document.addEventListener('mouseleave', hideCursor);
    window.addEventListener('blur', hideCursor);
    finePointer.addEventListener('change', setEnabled);

    return () => {
      root.classList.remove('has-dot-cursor');
      window.removeEventListener('pointermove', moveCursor);
      document.removeEventListener('mouseleave', hideCursor);
      window.removeEventListener('blur', hideCursor);
      finePointer.removeEventListener('change', setEnabled);
    };
  }, []);

  return (
    <span ref={cursorRef} className="blinking-dot-cursor" data-visible="false" aria-hidden="true">
      <span />
    </span>
  );
}
