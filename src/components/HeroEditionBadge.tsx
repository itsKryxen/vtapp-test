'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * HeroEditionBadge
 * ─────────────────────────────────────────────────────────────
 * The "4th Edition" marker, rebuilt as an instrument readout: the frame draws
 * itself, the numeral rolls 01 → 04, the label types in letter by letter, and a
 * scan bar keeps sweeping the chip afterwards. Replaces the CSS typewriter,
 * which could not sequence against the rest of the hero.
 */

const LABEL = 'EDITION';
const ORDINAL_STEPS = ['01', '02', '03', '04'];

const frame: Variants = {
  hidden: { opacity: 0, scaleX: 0.72 },
  shown: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay: 0.15 },
  },
};

const letters: Variants = {
  hidden: {},
  shown: { transition: { delayChildren: 0.75, staggerChildren: 0.055 } },
};

const letter: Variants = {
  hidden: { opacity: 0, y: 6, filter: 'blur(4px)' },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.34, ease: 'easeOut' },
  },
};

export default function HeroEditionBadge({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(reduceMotion ? ORDINAL_STEPS.length - 1 : 0);

  // Roll the numeral up to 04, landing just as the label finishes typing.
  useEffect(() => {
    if (reduceMotion) {
      setStep(ORDINAL_STEPS.length - 1);
      return;
    }

    const timers = ORDINAL_STEPS.slice(1).map((_, index) =>
      setTimeout(() => setStep(index + 1), 500 + index * 190),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  return (
    <motion.div
      className={`hero-edition-chip ${className}`}
      initial="hidden"
      animate="shown"
      variants={frame}
      whileHover={reduceMotion ? undefined : { scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      aria-label="4th Edition"
      role="img"
    >
      <span className="hero-edition-chip-rule" aria-hidden="true" />

      <span className="hero-edition-chip-num" aria-hidden="true">
        <motion.span
          key={step}
          initial={reduceMotion ? false : { y: '-70%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {ORDINAL_STEPS[step]}
        </motion.span>
      </span>

      <span className="hero-edition-chip-div" aria-hidden="true" />

      <motion.span className="hero-edition-chip-label" variants={letters} aria-hidden="true">
        {LABEL.split('').map((character, index) => (
          <motion.span key={index} variants={letter}>
            {character}
          </motion.span>
        ))}
      </motion.span>

      {!reduceMotion && (
        <motion.span
          className="hero-edition-chip-scan"
          aria-hidden="true"
          initial={{ x: '-120%', opacity: 0 }}
          animate={{ x: ['-120%', '120%'], opacity: [0, 0.9, 0] }}
          transition={{
            duration: 1.6,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 3.4,
            delay: 1.4,
          }}
        />
      )}
    </motion.div>
  );
}
