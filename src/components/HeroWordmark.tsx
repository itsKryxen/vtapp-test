'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * HeroWordmark
 * ─────────────────────────────────────────────────────────────
 * "V-TAPP26" built out of hundreds of miniature V-TAPP marks.
 *
 * The glyph shapes are sampled from a canvas render of the real wordmark type,
 * so the mosaic follows the letterforms exactly. Each sampled cell becomes one
 * mini mark that flies in from a scattered position; the stagger runs strictly
 * left → right, so the V lands first and the word finishes assembling ~3.5s
 * later. It plays once, starting only after the site's intro splash has handed
 * over, and then holds — nothing here loops.
 */

/** The run of spaces is deliberate: it opens the gap between the name and the
 * year. Both the canvas sample and the ghost type keep whitespace as-is. */
const TEXT = 'V-TAPP  26';
const TEXT_BEFORE_TWO = 'V-TAPP  ';

/** Seconds between the first tile leaving and the last one starting. */
const BUILD_SPREAD = 3;
/** Seconds a single tile takes to fly into place. */
const TILE_FLIGHT = 0.62;
/** How long to let the splash announce itself before deciding it is not running. */
const SPLASH_PROBE_MS = 150;
/** Safety net in case a running splash never fires its handover event. */
const SPLASH_FALLBACK_MS = 6000;

interface Tile {
  x: number;
  y: number;
  size: number;
  /** normalised horizontal position, drives the left-to-right stagger */
  u: number;
  /** scatter origin + spin, deterministic per tile */
  dx: number;
  dy: number;
  rotate: number;
}

interface Mosaic {
  tiles: Tile[];
  width: number;
  height: number;
}

/** Deterministic pseudo-random in [0,1) — no hydration mismatch, no Math.random. */
function rand(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function buildMosaic(fontStyle: {
  weight: string;
  size: number;
  family: string;
  letterSpacing: string;
}): Mosaic | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  const font = `${fontStyle.weight} ${fontStyle.size}px ${fontStyle.family}`;
  const applyFont = () => {
    ctx.font = font;
    if ('letterSpacing' in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        fontStyle.letterSpacing;
      ctx.font = font;
    }
  };

  applyFont();

  const metrics = ctx.measureText(TEXT);
  const ascent = metrics.actualBoundingBoxAscent || fontStyle.size * 0.72;
  const descent = metrics.actualBoundingBoxDescent || fontStyle.size * 0.2;
  const width = Math.ceil(metrics.width);
  const height = Math.ceil(ascent + descent);
  if (width < 8 || height < 8) return null;

  canvas.width = width;
  canvas.height = height;
  applyFont();
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  ctx.fillText(TEXT, 0, ascent);

  // On phones, Orbitron's sampled 2 can resemble a lowercase b after the
  // mosaic is coarsened. Replace only that small-screen glyph with an angular
  // five-stroke numeral; larger screens retain the original sampled type.
  if (window.innerWidth < 640) {
    const twoX = ctx.measureText(TEXT_BEFORE_TWO).width;
    const twoWidth = ctx.measureText('2').width;
    const glyphLeft = twoX + twoWidth * 0.08;
    const glyphWidth = twoWidth * 0.82;
    const glyphHeight = ascent;
    const stroke = Math.max(2, Math.min(glyphWidth * 0.2, glyphHeight * 0.16));
    const middleY = (glyphHeight - stroke) / 2;

    ctx.clearRect(twoX - 1, 0, twoWidth + 2, height);
    ctx.fillRect(glyphLeft, 0, glyphWidth, stroke);
    ctx.fillRect(glyphLeft + glyphWidth - stroke, 0, stroke, middleY + stroke);
    ctx.fillRect(glyphLeft, middleY, glyphWidth, stroke);
    ctx.fillRect(glyphLeft, middleY, stroke, glyphHeight - middleY);
    ctx.fillRect(glyphLeft, glyphHeight - stroke, glyphWidth, stroke);
  }

  const { data } = ctx.getImageData(0, 0, width, height);
  const maxTiles = window.innerWidth < 640 ? 140 : 280;

  let step = Math.max(4, Math.round(fontStyle.size / 12));
  let points: Array<{ x: number; y: number }> = [];

  // Coarsen the grid until the tile count is something a phone can animate.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    points = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (data[(y * width + x) * 4 + 3] > 128) points.push({ x, y });
      }
    }
    if (points.length <= maxTiles) break;
    step = Math.round(step * 1.35) || step + 1;
  }

  if (!points.length) return null;

  points.sort((a, b) => a.x - b.x || a.y - b.y);

  const size = Math.max(7, step * 1.55);
  const tiles: Tile[] = points.map((point, index) => {
    const angle = rand(index) * Math.PI * 2;
    const distance = 40 + rand(index + 91) * 130;
    return {
      x: point.x - size / 2,
      y: point.y - size / 2,
      size,
      u: width > 0 ? point.x / width : 0,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance * 0.6,
      rotate: (rand(index + 17) - 0.5) * 220,
    };
  });

  return { tiles, width, height };
}

export default function HeroWordmark({ className = '' }: { className?: string }) {
  const ghostRef = useRef<HTMLSpanElement>(null);
  const [mosaic, setMosaic] = useState<Mosaic | null>(null);
  const [started, setStarted] = useState(false);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reduceMotion) {
      setMosaic(null);
      return;
    }

    let cancelled = false;
    let frame = 0;

    const measure = () => {
      const ghost = ghostRef.current;
      if (!ghost || cancelled) return;
      const style = window.getComputedStyle(ghost);
      const next = buildMosaic({
        weight: style.fontWeight,
        size: parseFloat(style.fontSize),
        family: style.fontFamily,
        letterSpacing: style.letterSpacing === 'normal' ? '0px' : style.letterSpacing,
      });
      if (!cancelled) setMosaic(next);
    };

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };

    // The sample is only correct once the display face has actually loaded.
    if (document.fonts?.ready) {
      document.fonts.ready.then(schedule).catch(schedule);
    } else {
      schedule();
    }

    const observer = new ResizeObserver(schedule);
    if (ghostRef.current) observer.observe(ghostRef.current);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduceMotion]);

  // Hold the build back until the logo splash has handed the screen over, so the
  // two intros never overlap. The timer covers pages that never fire the event.
  useEffect(() => {
    if (reduceMotion) return;

    const begin = () => setStarted(true);
    window.addEventListener('vtapp:splash-exit', begin);
    window.addEventListener('vtapp:splash-complete', begin);

    // The splash marks <html> once its own effect has run, which is after this
    // one — so probe a beat later. No splash (in-app navigation, reduced motion
    // elsewhere) means nothing to wait for and the build can start straight away.
    let fallback: ReturnType<typeof setTimeout>;
    const probe = setTimeout(() => {
      if (!document.documentElement.dataset.vtappSplash) {
        begin();
        return;
      }
      fallback = setTimeout(begin, SPLASH_FALLBACK_MS);
    }, SPLASH_PROBE_MS);

    return () => {
      window.removeEventListener('vtapp:splash-exit', begin);
      window.removeEventListener('vtapp:splash-complete', begin);
      clearTimeout(probe);
      clearTimeout(fallback);
    };
  }, [reduceMotion]);

  return (
    <p className={`hero-wordmark ${className}`}>
      <span className="sr-only">V-TAPP 26</span>

      <span
        ref={ghostRef}
        aria-hidden="true"
        className={`hero-wordmark-ghost${mosaic ? ' is-sampled' : ''}`}
      >
        {TEXT}
      </span>

      {mosaic ? (
        <span
          className="hero-wordmark-mosaic"
          aria-hidden="true"
          style={{ width: mosaic.width, height: mosaic.height }}
        >
          {mosaic.tiles.map((tile, index) => (
            <motion.span
              key={index}
              className="hero-wordmark-tile"
              style={{ width: tile.size, height: tile.size }}
              initial={{
                opacity: 0,
                scale: 0.2,
                x: tile.x + tile.dx,
                y: tile.y + tile.dy,
                rotate: tile.rotate,
              }}
              animate={
                started
                  ? { opacity: 1, scale: 1, x: tile.x, y: tile.y, rotate: 0 }
                  : undefined
              }
              transition={{
                duration: TILE_FLIGHT,
                delay: tile.u * BUILD_SPREAD,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            />
          ))}

          {/* assembly head that leads the tiles across the word, once */}
          {started && (
            <motion.span
              className="hero-wordmark-beam"
              aria-hidden="true"
              initial={{ x: -10, opacity: 0 }}
              animate={{
                x: [-10, -10, mosaic.width + 10, mosaic.width + 10],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: BUILD_SPREAD + TILE_FLIGHT + 0.3,
                times: [0, 0.05, 0.86, 1],
                ease: 'linear',
              }}
            />
          )}
        </span>
      ) : null}
    </p>
  );
}
