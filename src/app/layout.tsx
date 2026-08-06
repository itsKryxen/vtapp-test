import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Ticker from '@/components/Ticker';
import Preloader from '@/components/Preloader';
import PageLogoIntroAnimation from '@/components/PageLogoIntroAnimation';
import ButtonEffects from '@/components/ButtonEffects';
import BlinkingDotCursor from '@/components/BlinkingDotCursor';
import NumericCursorTrail from '@/components/NumericCursorTrail';
import CuteRobotCompanion from '@/components/CuteRobotCompanion';
import { SocialRail } from '@/components/SocialLinks';
import { FEST } from '@/lib/fest';

/**
 * Two families only.
 *
 * Inter carries both body and display: at 200 and 300 weights, set large and
 * tight, a neutral grotesque reads as engineered rather than loud. JetBrains
 * Mono carries every label, tag, nav item, button and readout, which is where
 * the technical character actually comes from.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
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
    var light = s === 'light' ||
      (!s && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (light) document.documentElement.classList.add('light');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <ButtonEffects />
        <BlinkingDotCursor />
        <NumericCursorTrail />
        <CuteRobotCompanion />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-bone focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-label focus:text-ink-950"
        >
          Skip to content
        </a>

        <Preloader />
        <PageLogoIntroAnimation />

        <Ticker />
        <Navbar />
        <SocialRail />

        <main id="main" className="relative z-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
