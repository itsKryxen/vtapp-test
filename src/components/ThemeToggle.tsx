'use client';

import { useEffect, useState } from 'react';

export const THEME_KEY = 'vtapp-theme';
export type Theme = 'dark' | 'light';

function syncFavicon(theme: Theme) {
  const href = theme === 'light' ? '/favicon-light.svg' : '/favicon-dark.svg';
  document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((link) => {
    link.href = href;
    link.type = 'image/svg+xml';
  });
}

/**
 * Dark / light switch.
 *
 * The class is set by the inline script in layout.tsx before first paint, so
 * this component only mirrors and updates it. Until it mounts it renders a
 * fixed-size placeholder, which keeps the navbar from shifting and avoids a
 * hydration mismatch (the server cannot know the stored preference).
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    setMounted(true);
    setTheme(initialTheme);
    syncFavicon(initialTheme);
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.classList.toggle('light', next === 'light');
    syncFavicon(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // private mode or storage disabled: the toggle still works for this visit
    }
  }

  if (!mounted) {
    return <span className="h-10 w-[74px] shrink-0" aria-hidden="true" />;
  }

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex h-10 shrink-0 items-stretch border border-white/15"
    >
      {(['dark', 'light'] as Theme[]).map((t) => {
        const active = theme === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => apply(t)}
            aria-pressed={active}
            title={t === 'dark' ? 'Dark mode' : 'Light mode'}
            className={`flex w-9 items-center justify-center transition-colors ${
              active ? 'bg-brand-600 on-brand light:bg-[color:var(--brand)]' : 'text-slate-500 hover:text-white'
            }`}
          >
            {t === 'dark' ? <MoonIcon /> : <SunIcon />}
            <span className="sr-only">{t === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          </button>
        );
      })}
    </div>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      {[
        [12, 2, 12, 4.6],
        [12, 19.4, 12, 22],
        [2, 12, 4.6, 12],
        [19.4, 12, 22, 12],
        [4.9, 4.9, 6.8, 6.8],
        [17.2, 17.2, 19.1, 19.1],
        [4.9, 19.1, 6.8, 17.2],
        [17.2, 6.8, 19.1, 4.9],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
