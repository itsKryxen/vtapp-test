'use client';

import { useEffect, useRef, useState } from 'react';

export const THEME_KEY = 'vtapp-theme';
export type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';
type ThemeDetail = { preference: ThemePreference; resolved: ResolvedTheme };

const THEME_EVENT = 'vtapp-theme-change';
const OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return preference;
}

function syncFavicon(theme: ResolvedTheme) {
  const href = theme === 'light' ? '/favicon-light.svg' : '/favicon-dark.svg';
  document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((link) => {
    link.href = href;
    link.type = 'image/svg+xml';
  });
}

function updateDocument(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle('light', resolved === 'light');
  document.documentElement.dataset.theme = preference;
  syncFavicon(resolved);
  return resolved;
}

export default function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = document.documentElement.dataset.theme;
    const initial: ThemePreference = stored === 'light' || stored === 'dark' ? stored : 'system';
    const initialResolved = updateDocument(initial);
    setPreference(initial);
    setResolved(initialResolved);
    setMounted(true);

    const media = window.matchMedia('(prefers-color-scheme: light)');
    const syncFromSystem = () => {
      if (document.documentElement.dataset.theme !== 'system') return;
      const nextResolved = updateDocument('system');
      setResolved(nextResolved);
      window.dispatchEvent(new CustomEvent<ThemeDetail>(THEME_EVENT, {
        detail: { preference: 'system', resolved: nextResolved },
      }));
    };
    const syncFromControl = (event: Event) => {
      const detail = (event as CustomEvent<ThemeDetail>).detail;
      setPreference(detail.preference);
      setResolved(detail.resolved);
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    media.addEventListener('change', syncFromSystem);
    window.addEventListener(THEME_EVENT, syncFromControl);
    document.addEventListener('pointerdown', closeOnOutsidePress);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      media.removeEventListener('change', syncFromSystem);
      window.removeEventListener(THEME_EVENT, syncFromControl);
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function apply(nextPreference: ThemePreference) {
    const nextResolved = updateDocument(nextPreference);
    setPreference(nextPreference);
    setResolved(nextResolved);
    setOpen(false);
    try {
      localStorage.setItem(THEME_KEY, nextPreference);
    } catch {
      // Storage can be unavailable; the selected theme still applies this visit.
    }
    window.dispatchEvent(new CustomEvent<ThemeDetail>(THEME_EVENT, {
      detail: { preference: nextPreference, resolved: nextResolved },
    }));
  }

  if (!mounted) return <span className="h-10 w-10 shrink-0" aria-hidden="true" />;

  return (
    <div ref={rootRef} className="theme-switcher">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Theme: ${preference}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="theme-switcher-trigger"
      >
        {preference === 'system' ? <SystemIcon /> : resolved === 'dark' ? <MoonIcon /> : <SunIcon />}
      </button>

      <div className="theme-switcher-menu" role="menu" data-open={open ? 'true' : 'false'}>
        <p className="theme-switcher-label">Appearance</p>
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="menuitemradio"
            aria-checked={preference === option.value}
            onClick={() => apply(option.value)}
            className="theme-switcher-option"
            tabIndex={open ? 0 : -1}
          >
            <span>{option.label}</span>
            {preference === option.value && <span aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 20h7M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
