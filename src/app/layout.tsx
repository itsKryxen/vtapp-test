import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Orbitron } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';
import PageLogoIntroAnimation from '@/components/PageLogoIntroAnimation';
import PointerBackground from '@/components/PointerBackground';
import { FEST } from '@/lib/fest';
import SiteReveal from '@/components/SiteReveal';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-original-mono',
  display: 'swap',
  weight: ['400', '500', '700', '800'],
});

// Squared-off techno face for the hero wordmark. The site's `font-display`
// stack asks for Ethnocentric, which is licensed and never loaded, so anything
// using it silently falls back to the system sans — hence the plain look.
const wordmark = Orbitron({
  subsets: ['latin'],
  variable: '--font-wordmark',
  display: 'swap',
  weight: ['500', '700', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtapp.vitap.ac.in'),
  title: {
    default: `${FEST.name} · ${FEST.university}`,
    template: `%s · ${FEST.name}`,
  },
  description: `${FEST.fullName}. ${FEST.dateLabel} at ${FEST.venue}. ${FEST.tagline}`,
  keywords: ['V-TAPP', 'VTAPP 2026', 'VIT-AP', 'techfest', 'Amaravati', 'hackathon', 'college fest'],
  openGraph: {
    type: 'website',
    title: `${FEST.name} · ${FEST.university}`,
    description: `${FEST.tagline} · ${FEST.dateLabel} · ${FEST.venue}`,
    siteName: FEST.name,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `${FEST.name}: ${FEST.tagline}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: FEST.name,
    description: FEST.tagline,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * Runs before first paint so the stored theme is on <html> by the time the
 * browser draws. Without this you get a flash of the wrong theme on every
 * load, which is the one thing that makes a theme switch feel broken.
 */
const THEME_SCRIPT = `
(function(){
  try {
    var s = localStorage.getItem('vtapp-theme');
    if (s !== 'light' && s !== 'dark') s = 'system';
    var light = s === 'light' ||
      (s === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (light) document.documentElement.classList.add('light');
    document.documentElement.dataset.theme = s;
    var favicon = light ? '/favicon-light.svg' : '/favicon-dark.svg';
    document.querySelectorAll('link[rel~="icon"]').forEach(function(link) {
      link.setAttribute('href', favicon);
      link.setAttribute('type', 'image/svg+xml');
    });
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${wordmark.variable}`} suppressHydrationWarning>
      <head>
        <link id="vtapp-theme-favicon" rel="icon" type="image/svg+xml" href="/favicon-dark.svg" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <PointerBackground />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-bone focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-label focus:text-ink-950"
        >
          Skip to content
        </a>

        <Preloader />
        <PageLogoIntroAnimation />
        <SiteReveal>
          <Navbar />
          <main id="main" className="relative z-10">
            {children}
          </main>

          <Footer />
        </SiteReveal>
      </body>
    </html>
  );
}
