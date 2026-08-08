'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EventsComingSoonSection() {
  const [stampLanded, setStampLanded] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStampLanded(true);
    }, 280);

    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Dynamic stamp color palette based on theme (Blue in Light Mode, Red in Dark Mode)
  const stampStyles = isLight
    ? {
        border: 'border-blue-600',
        text: 'text-blue-600',
        subtext: 'text-blue-700/90',
        bg: 'bg-blue-500/10',
        glow: 'shadow-[0_0_35px_rgba(37,99,235,0.35)]',
        innerBorder: 'border-blue-500/80',
        divider: 'border-blue-500/40',
        ripple: 'border-blue-500/70',
        tagline: 'text-blue-600',
      }
    : {
        border: 'border-red-500',
        text: 'text-red-500',
        subtext: 'text-red-400/90',
        bg: 'bg-red-950/50',
        glow: 'shadow-[0_0_35px_rgba(239,68,68,0.4)]',
        innerBorder: 'border-red-500/80',
        divider: 'border-red-500/40',
        ripple: 'border-red-500/70',
        tagline: 'text-brand-400',
      };

  return (
    <div className="relative min-h-[420px] w-full flex flex-col justify-center items-center text-center p-6 sm:p-12 overflow-hidden my-6">
      {/* Background Ambient Radial Glow */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isLight
            ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.12),transparent_65%)]'
            : 'bg-[radial-gradient(circle_at_50%_45%,rgba(239,68,68,0.15),transparent_65%)]'
        }`}
      />

      {/* Main Container Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
          x: stampLanded ? [0, -3, 3, -2, 2, 0] : 0,
        }}
        transition={{
          duration: 0.4,
          x: { duration: 0.25, ease: 'easeInOut' },
        }}
        className="relative max-w-2xl w-full rounded-2xl border border-white/20 bg-ink-950/90 p-8 sm:p-12 shadow-2xl overflow-hidden space-y-8 backdrop-blur-xl"
      >
        <div className="space-y-2">
          <span className="event-card-category-badge">V-TAPP 2026</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Events Announced Soon
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Clubs are finalising their flagship hackathons, workshops, and competitions.
          </p>
        </div>

        {/* GRAPHICAL PHYSICAL RUBBER STAMP CONTAINER */}
        <div className="relative py-6 my-2 flex justify-center items-center">
          {/* Impact Shockwave Ring */}
          {stampLanded && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`absolute inset-0 m-auto w-64 h-32 rounded-2xl border-2 ${stampStyles.ripple} pointer-events-none`}
            />
          )}

          {/* Rubber Stamp graphic */}
          <motion.div
            initial={{ scale: 2.5, y: -120, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: -7 }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 22,
              mass: 1.2,
            }}
            className={`relative select-none inline-block px-8 py-5 rounded-2xl border-4 border-double ${stampStyles.border} ${stampStyles.text} ${stampStyles.bg} ${stampStyles.glow} backdrop-blur-sm transform -rotate-7 transition-colors duration-300`}
          >
            {/* Stamp Inner Border */}
            <div className={`border border-dashed ${stampStyles.innerBorder} p-3 text-center space-y-1.5`}>
              <div className={`flex items-center justify-center text-[10px] font-mono tracking-widest ${stampStyles.subtext} uppercase border-b ${stampStyles.divider} pb-1`}>
                <span>VIT-AP UNIVERSITY</span>
              </div>

              <div className="font-display text-3xl sm:text-5xl font-black tracking-wider uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] py-2">
                COMING SOON
              </div>

              <div className={`flex items-center justify-center text-[10px] font-mono tracking-widest ${stampStyles.subtext} uppercase border-t ${stampStyles.divider} pt-1`}>
                <span>V-TAPP 2026</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Message */}
        <div className="space-y-3 pt-2">
          <p className="text-base sm:text-lg font-medium text-slate-200">
            Every event goes live on this portal as soon as it is approved.
          </p>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: stampLanded ? 1 : 0, y: stampLanded ? 0 : 6 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-xs sm:text-sm font-mono ${stampStyles.tagline}`}
          >
            ✦ Stay tuned — registrations open shortly.
          </motion.p>
        </div>

        {/* Single Action Button */}
        <div className="pt-4 flex justify-center border-t border-white/10">
          <Link href="/clubs" className="btn-secondary text-xs uppercase font-mono tracking-wider">
            View Registered Clubs →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
