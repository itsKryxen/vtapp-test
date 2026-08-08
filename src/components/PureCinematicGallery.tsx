'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';

interface PhotoItem {
  id: string;
  src: string; // relative to /public
  alt: string;
  // Choose reveal type based on index
}

// Using the demo images that already exist in the repo – these were sourced from the Drive folder.
const PHOTOS: PhotoItem[] = [
  { id: 'p1', src: '/demo/robowars.jpg', alt: 'Combat robotics' },
  { id: 'p2', src: '/demo/hackaverse.jpg', alt: 'Hackathon night' },
  { id: 'p3', src: '/demo/breach.jpg', alt: 'Cybersecurity CTF' },
  { id: 'p4', src: '/demo/pitch-perfect.jpg', alt: 'Startup pitch battle' },
  { id: 'p5', src: '/demo/bio-hack.jpg', alt: 'Biotech innovation' },
  { id: 'p6', src: '/demo/cad-clash.jpg', alt: 'Design & engineering' },
  { id: 'g1', src: '/assets/glimpses/photo-01.jpg', alt: 'V-TAPP 2024 — Glimpse 1' },
  { id: 'g2', src: '/assets/glimpses/photo-02.jpg', alt: 'V-TAPP 2024 — Glimpse 2' },
  { id: 'g3', src: '/assets/glimpses/photo-03.jpg', alt: 'V-TAPP 2024 — Glimpse 3' },
  { id: 'g4', src: '/assets/glimpses/photo-04.jpg', alt: 'V-TAPP 2024 — Glimpse 4' },
  { id: 'g5', src: '/assets/glimpses/photo-05.jpg', alt: 'V-TAPP 2024 — Glimpse 5' },
  { id: 'g6', src: '/assets/glimpses/photo-06.jpg', alt: 'V-TAPP 2024 — Glimpse 6' },
];

export default function PureCinematicGallery() {
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });

  // Cursor follower – desktop only
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };
  const handleMouseLeave = () => setCursorPos((c) => ({ ...c, visible: false }));

  // Lightbox keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activePhoto) return;
      if (e.key === 'Escape') setActivePhoto(null);
      if (e.key === 'ArrowRight') {
        const next = (activeIndex + 1) % PHOTOS.length;
        setActiveIndex(next);
        setActivePhoto(PHOTOS[next]);
      }
      if (e.key === 'ArrowLeft') {
        const prev = (activeIndex - 1 + PHOTOS.length) % PHOTOS.length;
        setActiveIndex(prev);
        setActivePhoto(PHOTOS[prev]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activePhoto, activeIndex]);

  // ---- Video Section (single video) ----
  const videoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: videoProgress } = useScroll({
    target: videoRef,
    offset: ['start start', 'end start'],
  });
  const videoScale = useTransform(videoProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const videoOpacity = useTransform(videoProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // ---- Horizontal Film Strip ----
  const stripRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stripProgress } = useScroll({ target: stripRef, offset: ['start start', 'end start'] });
  const stripX = useTransform(stripProgress, [0, 1], [0, -200]); // simple horizontal shift

  return (
    <div className="w-full space-y-24 my-16">
      {/* 01 – GLIMPSES INTRO */}
      <section className="text-center py-12">
        <h1 className="font-display text-6xl sm:text-8xl font-bold tracking-tight uppercase drop-shadow-lg text-slate-900 dark:text-white">
          GLIMPSES
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium italic">
          Moments captured in motion.
        </p>
      </section>

      {/* 02 – PHOTO SEQUENCE */}
      {PHOTOS.map((photo, idx) => {
        const ref = useRef<HTMLDivElement>(null);
        const inView = useInView(ref, { once: true, margin: '-20%' });
        // Choose a reveal based on index
        const revealVariants = (() => {
          switch (idx % 6) {
            case 0: // mask reveal
              return {
                hidden: { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 },
                visible: { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
              };
            case 1: // curtain reveal (two halves)
              return {
                hidden: { scaleX: 0, opacity: 0 },
                visible: { scaleX: 1, opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
              };
            case 2: // zoom reveal
              return {
                hidden: { scale: 1.2, opacity: 0 },
                visible: { scale: 1, opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
              };
            case 3: // blur reveal
              return {
                hidden: { filter: 'blur(12px)', opacity: 0 },
                visible: { filter: 'blur(0px)', opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
              };
            case 4: // slide from left
              return {
                hidden: { x: '-30%', opacity: 0 },
                visible: { x: '0%', opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
              };
            case 5: // clip-path geometric
              return {
                hidden: { clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' },
                visible: { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', transition: { duration: 1, ease: 'easeOut' } },
              };
            default:
              return {};
          }
        })();

        // Size variation – using modulo to select width percentages
        const widthClass = (() => {
          switch (idx % 4) {
            case 0:
              return 'w-full';
            case 1:
              return 'w-4/5';
            case 2:
              return 'w-3/5';
            case 3:
              return 'w-2/5';
            default:
              return 'w-full';
          }
        })();

        return (
          <section key={photo.id} className="relative flex justify-center" ref={ref}>
            <motion.div
              className={`relative overflow-hidden rounded-xl ${widthClass} cursor-pointer`}
              variants={revealVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              onMouseMove={(e) => handleMouseMove(e, photo.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                setActivePhoto(photo);
                setActiveIndex(idx);
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={1200}
                height={800}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTInIGhlaWdodD0nMTInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PC9zdmc+"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                priority={idx === 0}
              />
            </motion.div>
            {/* Desktop cursor follower */}
            {cursorPos.visible && (
              <div
                className="pointer-events-none absolute z-20 hidden sm:flex items-center justify-center w-20 h-20 rounded-full bg-white/80 text-black font-mono text-sm font-bold shadow-xl"
                style={{ left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%,-50%)' }}
              >
                VIEW
              </div>
            )}
          </section>
        );
      })}

      {/* 03 – SINGLE VIDEO CENTERPIECE */}
      <section ref={videoRef} className="flex justify-center py-16">
        <motion.div
          style={{ scale: videoScale, opacity: videoOpacity }}
          className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl"
        >
          <iframe
            src="https://www.youtube.com/embed/luVIty6bBIA?autoplay=1&mute=1&loop=1&playlist=luVIty6bBIA&controls=0&modestbranding=1"
            title="V‑TAPP cinematic glimpse"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </motion.div>
      </section>

      {/* 04 – HORIZONTAL FILM STRIP */}
      <section ref={stripRef} className="overflow-hidden py-12 bg-slate-100 dark:bg-slate-800">
        <motion.div
          style={{ x: stripX }}
          className="flex space-x-8 px-6"
        >
          {PHOTOS.map((photo) => (
            <div key={photo.id} className="flex-shrink-0 w-80 h-48 relative rounded-lg overflow-hidden shadow-lg" onClick={() => { setActivePhoto(photo); setActiveIndex(PHOTOS.findIndex(p => p.id === photo.id)); }}>
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
            </div>
          ))}
        </motion.div>
      </section>

      {/* 05 – PHOTO WALL (dense overlapping layout) */}
      <section className="relative h-[1200px] bg-black/10">
        {PHOTOS.map((photo, i) => {
          const size = 200 + (i % 3) * 100; // vary sizes
          const top = 50 + i * 120; // spread vertically
          const left = (i % 2) * 30 + (i % 5) * 15; // stagger horizontally
          return (
            <motion.div
              key={photo.id}
              className="absolute rounded-xl overflow-hidden shadow-md"
              style={{ width: size, height: size * 0.75, top, left, zIndex: i }}
              whileInView={{ opacity: [0, 1], y: [30, 0] }}
              viewport={{ once: true, margin: '-20%' }}
            >
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
            </motion.div>
          );
        })}
      </section>

      {/* 06 – FINAL HERO PHOTO */}
      <section className="flex justify-center py-24">
        <motion.div
          className="w-full max-w-5xl overflow-hidden rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1, transition: { duration: 1 } }}
          viewport={{ once: true }}
        >
          <Image src={PHOTOS[PHOTOS.length - 1].src} alt={PHOTOS[PHOTOS.length - 1].alt} width={2000} height={1200} className="w-full h-auto object-cover" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.8 } }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <h2 className="font-display text-5xl sm:text-7xl font-bold text-white drop-shadow-xl text-center">
            MORE TO COME.
          </h2>
        </motion.div>
      </section>

      {/* Lightbox Viewer */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setActivePhoto(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300"
                aria-label="Close"
              >
                ✕
              </button>
              <Image src={activePhoto.src} alt={activePhoto.alt} fill className="object-contain" />
              <div className="absolute bottom-2 left-2 text-white text-sm">
                {String(activeIndex + 1).padStart(2, '0')} / {String(PHOTOS.length).padStart(2, '0')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
