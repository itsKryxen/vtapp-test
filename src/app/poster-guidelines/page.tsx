import Link from 'next/link';
import { PageHeader } from '@/components/SectionHeader';
import type { Metadata } from 'next';
import { POSTER, THUMBNAIL } from '@/lib/poster';

export const metadata: Metadata = {
  title: 'Poster guidelines',
  description: 'The one poster size every V-TAPP 2026 club must upload: 1080 × 1350 px, 4:5 portrait.',
};

const DOS = [
  'Export at exactly 1080 × 1350 px. Nothing else is accepted.',
  'Keep the event name inside the middle 80% of the canvas (the safe area).',
  'Use large, high-contrast type. The card renders at 540 px wide on most phones.',
  'Put your club name and logo somewhere on the poster.',
  'Save as JPG at quality 80–90, or PNG if you have flat colour and sharp type.',
];

const DONTS = [
  'No landscape or square posters. They are rejected at upload.',
  'No screenshots of posters. Export from the design tool.',
  'No essential text in the outer 10%, which can be clipped on some cards.',
  'No files over 5 MB.',
  'No QR codes smaller than 200 px. They will not scan from the thumbnail.',
];

export default function PosterGuidelinesPage() {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader
        index="09"
        slug="POSTER SPEC"
        title={<>Poster guidelines</>}
        description={<>One size, no exceptions. A single canonical poster size is what keeps the event grid looking like one designed system instead of a collage.</>}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* spec card with a to-scale preview */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="panel p-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden border border-dashed border-brand-400/50 bg-ink-800">
              {/* safe area */}
              <div className="absolute inset-[10%] border border-dashed border-amber-400/60" />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-display display-md text-white">
                    {POSTER.width}
                    <span className="mx-1 text-slate-500">×</span>
                    {POSTER.height}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-brand-400">
                    {POSTER.ratioLabel} portrait
                  </p>
                  <p className="mt-6 text-[10px] text-amber-400">safe area · inner 80%</p>
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-2.5 text-xs">
              <Row k="Master poster" v={`${POSTER.width} × ${POSTER.height} px`} />
              <Row k="Aspect ratio" v={`${POSTER.ratioLabel} (portrait)`} />
              <Row k="Thumbnail" v={`${THUMBNAIL.width} × ${THUMBNAIL.height} WebP · auto-generated`} />
              <Row k="Formats" v="JPG · PNG · WebP" />
              <Row k="Max size" v={`${POSTER.maxBytes / 1024 / 1024} MB`} />
              <Row k="Colour" v="sRGB" />
            </dl>
          </div>

          <Link href="/dashboard/events/new" className="btn-primary mt-4 w-full">
            Upload your poster
          </Link>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-amber-400">Do</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
              {DOS.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="text-amber-400">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-rose-400">Don&apos;t</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
              {DONTS.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="text-rose-400">✕</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-6">
            <h2 className="text-lg font-bold">Setting the canvas in your design tool</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                <strong className="text-white">Canva</strong>: Create a design → Custom size →{' '}
                {POSTER.width} × {POSTER.height} px. Download as JPG.
              </li>
              <li>
                <strong className="text-white">Figma</strong>: Frame → 1080 × 1350. Export at 1×,
                JPG, quality 85.
              </li>
              <li>
                <strong className="text-white">Photoshop</strong>: New document → {POSTER.width} ×{' '}
                {POSTER.height} px, 72 ppi, RGB. Save for Web → JPEG.
              </li>
              <li>
                <strong className="text-white">Instagram post you already made</strong>: if it is
                already 4:5 portrait, it will be accepted and resized automatically.
              </li>
            </ul>
          </section>

          <section className="panel p-6">
            <h2 className="text-lg font-bold">What happens after you upload</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-300">
              <li>1. The browser checks the ratio before anything is sent. Wrong ratio → rejected on the spot.</li>
              <li>
                2. Correct ratio but off-size → automatically resized to {POSTER.width} ×{' '}
                {POSTER.height}.
              </li>
              <li>
                3. A {THUMBNAIL.width} × {THUMBNAIL.height} WebP thumbnail is generated and used on
                every event card.
              </li>
              <li>
                4. Both files are stored under{' '}
                <code className="bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-brand-400">
                  posters/&lt;CLUB_ID&gt;/&lt;EVENT_CODE&gt;/
                </code>
                .
              </li>
              <li>5. The core team reviews the event and publishes it.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/30 pb-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-right font-medium text-slate-200">{v}</dd>
    </div>
  );
}
