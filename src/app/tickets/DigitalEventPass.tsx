'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DigitalEventPass() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 sm:py-8">
      {/* Dynamic Scoped Theme Styles for 100% High-Contrast Rendering */}
      <style jsx global>{`
        /* LIGHT MODE ENFORCEMENT STYLES */
        html.light .pass-bg-card {
          background-color: #ffffff !important;
          border-color: #cbd5e1 !important;
          box-shadow: 0 20px 50px rgba(21, 155, 215, 0.16) !important;
          color: #0f172a !important;
        }
        html.light .pass-bg-header {
          background-color: #f8fafc !important;
          border-color: #e2e8f0 !important;
          color: #475569 !important;
        }
        html.light .pass-bg-strip {
          background-color: #f8fafc !important;
          border-color: #e2e8f0 !important;
          color: #0f172a !important;
        }
        html.light .pass-bg-[#159BD7] {
          background-color: #ffffff !important;
          border-color: #e2e8f0 !important;
        }
        html.light .pass-accent-color {
          color: #0284c7 !important;
        }
        html.light .pass-accent-border {
          border-color: #0284c7 !important;
        }
        html.light .pass-text-primary {
          color: #0f172a !important;
        }
        html.light .pass-text-secondary {
          color: #334155 !important;
        }
        html.light .pass-text-muted {
          color: #64748b !important;
        }
        html.light .pass-qr-frame {
          background-color: #f8fafc !important;
          border-color: rgba(2, 132, 199, 0.4) !important;
        }
        html.light .pass-qr-box {
          background-color: #ffffff !important;
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
        }
        html.light .pass-tba-capsule {
          background-color: #0284c7 !important;
          border-color: #0284c7 !important;
          color: #ffffff !important;
          box-shadow: 0 0 25px rgba(2, 132, 199, 0.45) !important;
        }

        /* DARK MODE STYLES */
        html:not(.light) .pass-bg-card {
          background-color: #0a0a0a !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 20px 50px rgba(214, 40, 40, 0.18) !important;
          color: #f8fafc !important;
        }
        html:not(.light) .pass-bg-header {
          background-color: #050505 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #a7a7a7 !important;
        }
        html:not(.light) .pass-bg-strip {
          background-color: #050505 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #f8fafc !important;
        }
        html:not(.light) .pass-accent-color {
          color: #ef4444 !important;
        }
        html:not(.light) .pass-accent-border {
          border-color: #d62828 !important;
        }
        html:not(.light) .pass-text-primary {
          color: #ffffff !important;
        }
        html:not(.light) .pass-text-secondary {
          color: #cbd5e1 !important;
        }
        html:not(.light) .pass-text-muted {
          color: #94a3b8 !important;
        }
        html:not(.light) .pass-qr-frame {
          background-color: #0d0d0d !important;
          border-color: rgba(214, 40, 40, 0.4) !important;
        }
        html:not(.light) .pass-qr-box {
          background-color: #000000 !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
        }
        html:not(.light) .pass-tba-capsule {
          background-color: #d62828 !important;
          border-color: #ff3b30 !important;
          color: #ffffff !important;
          box-shadow: 0 0 25px rgba(214, 40, 40, 0.5) !important;
        }
      `}</style>

      {/* Page Subtitle & Tagline */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono tracking-widest uppercase border pass-accent-border pass-accent-color bg-current/5">
          <span>ACCESS CREDENTIAL</span>
          <span>//</span>
          <span>V-TAPP 2026</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight pass-text-primary">
          CHOOSE YOUR EVENT PASS
        </h1>
        <p className="text-sm sm:text-base font-medium pass-text-secondary">
          Pick only what you want. Your event. Your moment.
        </p>
      </div>

      {/* DIGITAL EVENT PASS MAIN CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[1020px] rounded-2xl border transition-all duration-300 overflow-hidden pass-bg-card"
      >
        {/* Technical Corner Clips & Frame Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 pass-accent-border" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 pass-accent-border" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 pass-accent-border" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 pass-accent-border" />

        {/* Ambient Grid Overlay */}
        <div
          className={`pointer-events-none absolute inset-0 opacity-25 ${
            isLight
              ? 'bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]'
              : 'bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]'
          }`}
        />

        {/* Scanning Light Pulse Line */}
        <div
          className={`pointer-events-none absolute inset-x-0 h-px animate-pulse ${
            isLight
              ? 'top-0 bg-gradient-to-r from-transparent via-[#0284c7] to-transparent shadow-[0_0_12px_#0284c7]'
              : 'top-0 bg-gradient-to-r from-transparent via-[#ef4444] to-transparent shadow-[0_0_12px_#ef4444]'
          }`}
        />

        {/* PASS HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b text-xs font-mono tracking-widest pass-bg-header">
          <div className="flex items-center gap-2">
            <span className="font-bold px-2.5 py-0.5 rounded text-[11px] pass-accent-border pass-accent-color border bg-current/10">
              [10] TICKETS
            </span>
            <span className="hidden sm:inline opacity-70">// V-TAPP 2026 OFFICIAL CREDENTIAL</span>
          </div>

          <div className="flex items-center gap-2 font-semibold">
            <span className={`w-2 h-2 rounded-full animate-ping ${isLight ? 'bg-[#0284c7]' : 'bg-[#ef4444]'}`} />
            <span className="pass-text-primary">● INDIVIDUAL EVENT ACCESS</span>
          </div>
        </div>

        {/* MAIN BODY AREA (Grid on Desktop: Text Left, QR Right) */}
        <div className="p-6 sm:p-10 grid gap-8 md:grid-cols-[1fr_240px] items-center">
          {/* Left Column: Event Pass Titles */}
          <div className="space-y-5">
            <div>
              <span className="font-mono text-xs font-bold tracking-widest uppercase pass-accent-color">
                VIT-AP UNIVERSITY TECH FEST
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-none mt-1 pass-text-primary">
                V-TAPP 2026
              </h2>
            </div>

            <div className="space-y-2">
              <div className="inline-block font-display text-2xl sm:text-4xl font-extrabold tracking-wider uppercase border-b-2 pb-1 pass-accent-border pass-text-primary">
                EVENT PASS
              </div>
              <p className="text-sm sm:text-base font-medium max-w-md pass-text-secondary">
                Pick only what you want.
                <br />
                <span className="font-bold pass-text-primary">Your event. Your moment.</span>
              </p>
            </div>
          </div>

          {/* Right Column: Framed Technical QR Code Area */}
          <div className="relative rounded-xl border p-5 flex flex-col items-center justify-center text-center space-y-3 transition-colors pass-qr-frame">
            {/* Corner Crosshairs */}
            <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l pass-accent-border" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r pass-accent-border" />
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l pass-accent-border" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r pass-accent-border" />

            <span className="font-mono text-[9px] uppercase tracking-widest font-bold pass-text-muted">
              [ ACCESS QR CODE ]
            </span>

            {/* Stylized Futuristic SVG QR Matrix Placeholder */}
            <div className="relative p-3 rounded-lg border flex items-center justify-center pass-qr-box">
              <svg viewBox="0 0 100 100" className="w-28 h-28 fill-current">
                {/* Outer corners */}
                <rect x="5" y="5" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="11" y="11" width="14" height="14" />
                <rect x="69" y="5" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="75" y="11" width="14" height="14" />
                <rect x="5" y="69" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="11" y="75" width="14" height="14" />

                {/* Cyber Matrix Modules */}
                <rect x="38" y="10" width="8" height="8" />
                <rect x="50" y="10" width="8" height="8" />
                <rect x="10" y="38" width="8" height="8" />
                <rect x="22" y="44" width="8" height="8" />
                <rect x="38" y="38" width="12" height="12" />
                <rect x="56" y="38" width="8" height="8" />
                <rect x="70" y="38" width="10" height="10" />
                <rect x="84" y="44" width="8" height="8" />

                <rect x="38" y="56" width="8" height="8" />
                <rect x="50" y="50" width="10" height="10" />
                <rect x="66" y="56" width="12" height="12" />
                <rect x="84" y="60" width="8" height="8" />

                <rect x="38" y="74" width="10" height="10" />
                <rect x="54" y="74" width="8" height="8" />
                <rect x="68" y="74" width="12" height="12" />
                <rect x="84" y="84" width="8" height="8" />
              </svg>
            </div>

            <div className="font-mono text-[9px] tracking-widest uppercase flex items-center gap-1.5 pass-text-muted font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-[#0284c7]' : 'bg-[#ef4444]'}`} />
              <span>V-TAPP 2026 VERIFIED</span>
            </div>
          </div>
        </div>

        {/* INFORMATION STRIP (3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-t border-b text-left pass-bg-strip">
          {/* Calendar */}
          <div className="p-4 sm:p-5 space-y-1">
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase pass-accent-color">
              [ CALENDAR ]
            </span>
            <p className="font-display font-bold text-base sm:text-lg leading-tight pass-text-primary">
              11 & 12 SEP 2026
            </p>
          </div>

          {/* Location */}
          <div className="p-4 sm:p-5 space-y-1">
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase pass-accent-color">
              [ LOCATION ]
            </span>
            <p className="font-display font-bold text-base sm:text-lg leading-tight pass-text-primary">
              VIT-AP UNIVERSITY
              <span className="block text-xs font-mono font-normal pass-text-muted">AMARAVATI</span>
            </p>
          </div>

          {/* Access Type */}
          <div className="p-4 sm:p-5 space-y-1">
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase pass-accent-color">
              [ ACCESS ]
            </span>
            <p className="font-display font-bold text-base sm:text-lg leading-tight pass-text-primary">
              SINGLE EVENT ACCESS
            </p>
          </div>
        </div>

        {/* BOTTOM ACTION AREA (Price & TBA Status Capsule) */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-10 py-5 border-t pass-bg-card">
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold block pass-text-muted">
              REGISTRATION FEE / PRICE
            </span>
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight uppercase pass-text-primary">
              PRICE TO BE ANNOUNCED
            </span>
          </div>

          {/* HIGHLIGHTED NON-CLICKABLE TBA CAPSULE (STRICT RULE: pointer-events-none, cursor-default) */}
          <div className="pointer-events-none cursor-default select-none inline-flex items-center gap-3 px-6 py-3 rounded-xl font-mono text-sm font-extrabold tracking-widest pass-tba-capsule">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>TBA</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
