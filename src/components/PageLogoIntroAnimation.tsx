'use client';

import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import CircuitWordmark from './CircuitWordmark';

const INTRO_DURATION_SECONDS = 3.15;

type Destination = {
  x: number;
  y: number;
  scale: number;
};

const CENTERED: Destination = { x: 0, y: 0, scale: 1 };

export default function PageLogoIntroAnimation() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoShellRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);
  const initialPathRef = useRef(pathname);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [destination, setDestination] = useState<Destination>(CENTERED);

  const excluded = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  useLayoutEffect(() => {
    if (excluded || pathname !== initialPathRef.current) {
      setVisible(false);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setVisible(false);
      window.dispatchEvent(new CustomEvent('vtapp:splash-complete'));
      return;
    }

    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const logoShell = logoShellRef.current;
    const pulse = pulseRef.current;
    const ambient = ambientRef.current;
    if (!overlay || !logo || !logoShell || !pulse || !ambient) return;

    document.documentElement.dataset.vtappSplash = 'active';
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const context = gsap.context(() => {
      const letters = gsap.utils.toArray<SVGGElement>('.vtapp-letter', logo);
      const maskRoutes = gsap.utils.toArray<SVGPathElement>('.vtapp-mask-trace', logo);
      const energyRoutes = gsap.utils.toArray<SVGPathElement>('.vtapp-energy-trace', logo);
      const nodes = gsap.utils.toArray<SVGCircleElement>('.vtapp-energy-node', logo);
      const tagline = logo.querySelector<SVGGElement>('.vtapp-tagline');

      gsap.set(letters, { opacity: 0, scale: 0.98 });
      gsap.set(maskRoutes, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(energyRoutes, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
      gsap.set(nodes, { opacity: 0, scale: 0, transformOrigin: 'center' });
      gsap.set(tagline, { opacity: 0, y: 15 });
      gsap.set(pulse, { opacity: 0, scale: 0.45 });
      gsap.set(ambient, { opacity: 0, scale: 0.82 });

      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // 0.00–0.30: an intentionally untouched theme-matched field.
      timeline.to(pulse, { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }, 0.3);
      timeline.to(pulse, { opacity: 0.55, scale: 0.72, duration: 0.24, ease: 'sine.inOut' }, 0.52);
      timeline.to(ambient, { opacity: 0.72, scale: 1, duration: 0.72, ease: 'sine.out' }, 0.42);

      // 0.60–1.50: the activation signal travels across the PCB network.
      energyRoutes.forEach((route, index) => {
        const segment = Number(route.dataset.segmentIndex ?? 0);
        timeline.to(
          route,
          {
            strokeDashoffset: 0,
            opacity: 0.92,
            duration: 0.42,
            ease: 'power1.inOut',
          },
          0.58 + segment * 0.16 + (index % 2) * 0.035,
        );
      });

      // Each character starts when the previous draw is about 80% complete.
      letters.forEach((letter, index) => {
        const start = 0.62 + index * 0.216;
        const segmentName = letter.dataset.letter;
        const segmentMasks = maskRoutes.filter((route) => route.dataset.maskSegment === segmentName);

        timeline.to(
          segmentMasks,
          { strokeDashoffset: 0, duration: 0.27, stagger: 0.025, ease: 'power1.inOut' },
          start,
        );
        timeline.to(letter, { opacity: 1, scale: 1, duration: 0.27, ease: 'power2.out' }, start);

        if (nodes[index]) {
          timeline.to(nodes[index], { opacity: 1, scale: 1, duration: 0.16 }, start);
        }
      });

      timeline.to(pulse, { opacity: 0, scale: 0.2, duration: 0.2 }, 1.45);
      timeline.to(energyRoutes, { opacity: 0.18, duration: 0.22 }, 1.82);
      timeline.to(ambient, { opacity: 0.28, scale: 1.03, duration: 0.4, ease: 'sine.inOut' }, 1.55);

      // A restrained, simultaneous power-on wave through every route.
      timeline.set(energyRoutes, { strokeDashoffset: 1, opacity: 0.28 }, 1.9);
      timeline.to(
        energyRoutes,
        { strokeDashoffset: 0, opacity: 0.78, duration: 0.34, stagger: 0.008, ease: 'power1.inOut' },
        1.9,
      );
      timeline.to(energyRoutes, { opacity: 0.1, duration: 0.2 }, 2.22);
      timeline.to(nodes, { opacity: 0.25, duration: 0.18 }, 2.2);
      timeline.to(ambient, { opacity: 0.55, scale: 1.05, duration: 0.26, ease: 'sine.out' }, 1.9);
      timeline.to(ambient, { opacity: 0.18, scale: 1.08, duration: 0.42, ease: 'sine.inOut' }, 2.18);

      timeline.to(tagline, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.95);

      // Almost-imperceptible hold/breath before the logo finds its permanent home.
      timeline.to(logo, { scale: 1.01, duration: 0.18, ease: 'sine.inOut' }, 2.18);
      timeline.to(logo, { scale: 1, duration: 0.18, ease: 'sine.inOut' }, 2.36);

      timeline.call(() => {
        const target = document.querySelector<HTMLElement>('[data-navbar-logo-target]');
        const shellRect = logoShell.getBoundingClientRect();
        const targetRect = target?.getBoundingClientRect();

        if (targetRect && shellRect.width > 0) {
          setDestination({
            x: targetRect.left + targetRect.width / 2 - window.innerWidth / 2,
            y: targetRect.top + targetRect.height / 2 - window.innerHeight / 2,
            scale: targetRect.width / shellRect.width,
          });
        }

        document.documentElement.dataset.vtappSplash = 'exiting';
        window.dispatchEvent(new CustomEvent('vtapp:splash-exit'));
        setExiting(true);
      }, undefined, 2.52);

      // Crossfade only once both logos are effectively occupying the same box.
      timeline.call(() => {
        document.documentElement.dataset.vtappSplash = 'arrived';
      }, undefined, 3.03);
      timeline.to(logoShell, { opacity: 0, duration: 0.12, ease: 'sine.inOut' }, 3.03);

      timeline.call(() => {
        delete document.documentElement.dataset.vtappSplash;
        document.body.style.overflow = previousOverflow;
        window.dispatchEvent(new CustomEvent('vtapp:splash-complete'));
        setVisible(false);
      }, undefined, INTRO_DURATION_SECONDS);
    }, overlay);

    return () => {
      context.revert();
      delete document.documentElement.dataset.vtappSplash;
      document.body.style.overflow = previousOverflow;
    };
  }, [excluded, pathname]);

  if (!visible || excluded) return null;

  return (
    <motion.div
      ref={overlayRef}
      aria-label="V-TAPP is powering on"
      role="status"
      className="vtapp-splash"
      style={{ pointerEvents: exiting ? 'none' : 'auto' }}
    >
      <motion.div
        aria-hidden="true"
        className="vtapp-splash-backdrop"
        initial={false}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.63, ease: [0.16, 1, 0.3, 1] }}
      >
        <div ref={ambientRef} className="vtapp-splash-ambient" />
      </motion.div>
      <div className="vtapp-splash-logo-anchor">
        <motion.div
          ref={logoShellRef}
          layout
          className="vtapp-splash-logo-shell"
          initial={false}
          animate={destination}
          transition={{ duration: 0.63, ease: [0.16, 1, 0.3, 1] }}
        >
          <span ref={pulseRef} className="vtapp-activation-pulse" aria-hidden="true" />
          <CircuitWordmark ref={logoRef} labelled className="h-auto w-full overflow-visible" />
        </motion.div>
      </div>
    </motion.div>
  );
}
