'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function DigitalEventPass() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-4 sm:py-8">
      {/* Scoped styles draw from the site-wide semantic theme tokens. */}
      <style jsx global>{`
        .pass-bg-card { background: rgb(var(--surface)) !important; border-color: var(--border) !important; box-shadow: var(--shadow-elevated) !important; color: rgb(var(--text-primary)) !important; }
        .pass-bg-header, .pass-bg-strip { background: rgb(var(--surface-elevated)) !important; border-color: var(--border) !important; color: rgb(var(--text-secondary)) !important; }
        .pass-accent-color { color: var(--brand) !important; }
        .pass-accent-border { border-color: var(--brand) !important; }
        .pass-text-primary { color: rgb(var(--text-primary)) !important; }
        .pass-text-secondary { color: rgb(var(--text-secondary)) !important; }
        .pass-text-muted { color: rgb(var(--text-muted)) !important; }
        .pass-qr-frame { background: rgb(var(--background-secondary)) !important; border-color: rgb(var(--brand-rgb) / 0.34) !important; }
        .pass-qr-box { background: rgb(var(--surface)) !important; border-color: var(--border-strong) !important; color: rgb(var(--text-primary)) !important; }
        .pass-tba-capsule { background: var(--brand) !important; border-color: var(--brand) !important; color: rgb(var(--button-primary-text)) !important; box-shadow: none !important; }
        .pass-grid { background-image: radial-gradient(rgb(var(--brand-rgb) / 0.42) 1px, transparent 1px); background-size: 16px 16px; }
        .pass-scan { background: linear-gradient(90deg, transparent, rgb(var(--brand-rgb) / 0.72), transparent); }
        .pass-status-dot { background: var(--brand-bright); }
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
        <div className="pass-grid pointer-events-none absolute inset-0 opacity-25" />

        {/* Scanning Light Pulse Line */}
        <div className="pass-scan pointer-events-none absolute inset-x-0 top-0 h-px" />

        {/* PASS HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b text-xs font-mono tracking-widest pass-bg-header">
          <div className="flex items-center gap-2">
            <span className="font-bold px-2.5 py-0.5 rounded text-[11px] pass-accent-border pass-accent-color border bg-current/10">
              [10] TICKETS
            </span>
            <span className="hidden sm:inline opacity-70">// V-TAPP 2026 OFFICIAL CREDENTIAL</span>
          </div>

          <div className="flex items-center gap-2 font-semibold">
            <span className="pass-status-dot h-2 w-2 rounded-full" />
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
              <span className="pass-status-dot h-1.5 w-1.5 rounded-full" />
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
            <span className="h-2 w-2 rounded-full bg-current" />
            <span>TBA</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
