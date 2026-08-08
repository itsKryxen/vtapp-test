'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Club } from '@/lib/types';
import { schoolAccent } from '@/lib/schools';

interface StampComingSoonModalProps {
  club: Club | null;
  onClose: () => void;
}

export default function StampComingSoonModal({ club, onClose }: StampComingSoonModalProps) {
  const [stampLanded, setStampLanded] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (!club) {
      setStampLanded(false);
      return;
    }

    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Set stamp landed trigger after short impact delay
    const timer = setTimeout(() => {
      setStampLanded(true);
    }, 280);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [club, onClose]);

  if (!club) return null;

  const accent = schoolAccent(club.school);

  // Dynamic stamp color palette based on theme (Blue in Light Mode, Red in Dark Mode)
  const stampStyles = isLight
    ? {
        border: 'border-blue-600',
        text: 'text-blue-600',
        subtext: 'text-blue-700/90',
        bg: 'bg-blue-500/10',
        glow: 'shadow-[0_0_30px_rgba(37,99,235,0.35)]',
        innerBorder: 'border-blue-500/80',
        divider: 'border-blue-500/40',
        ripple: 'border-blue-500/70',
        tagline: 'text-blue-600',
      }
    : {
        border: 'border-red-500',
        text: 'text-red-500',
        subtext: 'text-red-400/90',
        bg: 'bg-red-950/40',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.35)]',
        innerBorder: 'border-red-500/80',
        divider: 'border-red-500/40',
        ripple: 'border-red-500/60',
        tagline: 'text-brand-400',
      };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
        onClick={onClose}
      >
        {/* Main Modal Box with Impact Shake */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
            x: stampLanded ? [0, -3, 3, -2, 2, 0] : 0,
          }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{
            duration: 0.3,
            x: { duration: 0.25, ease: 'easeInOut' },
          }}
          className="relative max-w-lg w-full rounded-2xl border border-white/20 bg-ink-950 p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Ambient Glow */}
          <div
            className={`absolute inset-0 pointer-events-none opacity-20 ${
              isLight
                ? 'bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,0.4),transparent_60%)]'
                : 'bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.4),transparent_60%)]'
            }`}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full border border-white/15 bg-black/50 p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-all z-20"
            title="Close (Esc)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          {/* Club Header Info */}
          <div className="space-y-2 pt-2 relative z-10">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded border border-white/10 text-slate-300 bg-white/5">
                VIT-AP
              </span>
              <span className="font-mono text-xs text-slate-400">// REGISTERED CLUB</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              {club.name}
            </h2>
            {club.tagline && (
              <p className="text-xs text-slate-400 italic max-w-sm mx-auto">
                “{club.tagline}”
              </p>
            )}
          </div>

          {/* GRAPHICAL PHYSICAL RUBBER STAMP CONTAINER */}
          <div className="relative py-4 my-2 flex justify-center items-center">
            {/* Impact Shockwave Ring */}
            {stampLanded && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`absolute inset-0 m-auto w-48 h-24 rounded-xl border-2 ${stampStyles.ripple} pointer-events-none`}
              />
            )}

            {/* Rubber Stamp graphic */}
            <motion.div
              initial={{ scale: 2.4, y: -100, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotate: -7 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 20,
                mass: 1.1,
              }}
              className={`relative select-none inline-block px-6 py-4 rounded-xl border-4 border-double ${stampStyles.border} ${stampStyles.text} ${stampStyles.bg} ${stampStyles.glow} backdrop-blur-sm transform -rotate-6 transition-colors duration-300`}
            >
              {/* Stamp Inner Border */}
              <div className={`border border-dashed ${stampStyles.innerBorder} p-2 text-center space-y-1`}>
                <div className={`flex items-center justify-center text-[9px] font-mono tracking-widest ${stampStyles.subtext} uppercase border-b ${stampStyles.divider} pb-1`}>
                  <span>VIT-AP UNIVERSITY</span>
                </div>

                <div className="font-display text-2xl sm:text-4xl font-black tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] py-1">
                  COMING SOON
                </div>

                <div className={`flex items-center justify-center text-[9px] font-mono tracking-widest ${stampStyles.subtext} uppercase border-t ${stampStyles.divider} pt-1`}>
                  <span>V-TAPP 2026</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Message Below Stamp */}
          <div className="space-y-3 relative z-10">
            <p className="text-sm sm:text-base font-medium text-slate-200">
              Events for <span className="text-white font-bold">{club.name}</span> are coming soon.
            </p>

            {/* Delayed Fading Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: stampLanded ? 1 : 0, y: stampLanded ? 0 : 5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`text-xs font-mono ${stampStyles.tagline}`}
            >
              ✦ Stay tuned — exciting events are on the way.
            </motion.p>
          </div>

          {/* Modal Action Button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="btn-secondary w-full py-2.5 text-xs font-mono uppercase tracking-wider"
            >
              Close & Return to Directory
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
