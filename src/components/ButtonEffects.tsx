'use client';

import { useEffect } from 'react';

type MagneticState = {
  element: HTMLElement;
  frame: number;
  velocityX: number;
  velocityY: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
};

/** Applies the magnetic, spring-back button motion used by the prototype. */
export default function ButtonEffects() {
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const states = new Map<HTMLElement, MagneticState>();

    const getButton = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>('.btn') : null;

    const animate = (state: MagneticState) => {
      const tension = 0.18;
      const friction = 0.68;
      state.velocityX = (state.velocityX + (state.targetX - state.x) * tension) * friction;
      state.velocityY = (state.velocityY + (state.targetY - state.y) * tension) * friction;
      state.x += state.velocityX;
      state.y += state.velocityY;
      state.element.style.setProperty('--button-x', `${state.x.toFixed(2)}px`);
      state.element.style.setProperty('--button-y', `${state.y.toFixed(2)}px`);

      const settled =
        Math.abs(state.targetX - state.x) < 0.04 &&
        Math.abs(state.targetY - state.y) < 0.04 &&
        Math.abs(state.velocityX) < 0.04 &&
        Math.abs(state.velocityY) < 0.04;

      if (settled) {
        state.x = state.targetX;
        state.y = state.targetY;
        state.element.style.setProperty('--button-x', `${state.x}px`);
        state.element.style.setProperty('--button-y', `${state.y}px`);
        state.frame = 0;
        if (state.x === 0 && state.y === 0) states.delete(state.element);
        return;
      }

      state.frame = window.requestAnimationFrame(() => animate(state));
    };

    const setTarget = (element: HTMLElement, x: number, y: number) => {
      let state = states.get(element);
      if (!state) {
        state = {
          element,
          frame: 0,
          velocityX: 0,
          velocityY: 0,
          x: 0,
          y: 0,
          targetX: x,
          targetY: y,
        };
        states.set(element, state);
      } else {
        state.targetX = x;
        state.targetY = y;
      }
      if (!state.frame) state.frame = window.requestAnimationFrame(() => animate(state));
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const element = getButton(event.target);
      if (!element || element.matches(':disabled')) return;
      const rect = element.getBoundingClientRect();
      setTarget(
        element,
        (event.clientX - rect.left - rect.width / 2) * 0.16,
        (event.clientY - rect.top - rect.height / 2) * 0.16,
      );
    };

    const onPointerOut = (event: PointerEvent) => {
      const element = getButton(event.target);
      if (!element) return;
      if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;
      setTarget(element, 0, 0);
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOut, { passive: true });

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      states.forEach((state) => {
        if (state.frame) window.cancelAnimationFrame(state.frame);
        state.element.style.removeProperty('--button-x');
        state.element.style.removeProperty('--button-y');
      });
      states.clear();
    };
  }, []);

  return null;
}
