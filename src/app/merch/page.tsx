import type { Metadata } from 'next';
import { PageHeader } from '@/components/SectionHeader';
import Icon3D from '@/components/Icon3D';
import { FEST } from '@/lib/fest';
import { MERCH, MERCH_INFO, MERCH_STORE_URL, formatPrice, type MerchItem } from '@/lib/merch';

export const metadata: Metadata = {
  title: 'Merch',
  description: `Official ${FEST.name} merchandise, collected on campus during the fest.`,
};

export const revalidate = 300;

export default function MerchPage() {
  return (
    <div className="container-x pb-20 pt-24 sm:pb-24 sm:pt-28">
      <PageHeader
        index="09"
        slug={"merchandise".toUpperCase()}
        title={"merchandise".toUpperCase()}
 
        meta={MERCH.length > 0 ? `${MERCH.length} ITEMS` : 'DROP PENDING'}
      />

      {MERCH.length === 0 ? <Waiting /> : <Grid items={MERCH} />}

      {/* how it works */}
      <section className="mt-20 grid gap-px border border-white/30 bg-white/[0.08] sm:grid-cols-3">
        <Fact icon="calendar" k="Drop opens" v={MERCH_INFO.opensOn ?? 'To be announced'} />
        <Fact icon="pin" k="Collect at" v={MERCH_INFO.collectAt} />
        <Fact icon="campus" k="Delivery" v="On campus only" />
      </section>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-400">{MERCH_INFO.note}</p>

      {/* register interest */}
      <section className="panel brackets mt-16 p-8 text-center sm:p-12">
        <h2 className="font-display display-md sm:text-3xl">Want first pick?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
          Print runs are limited and sizes go quickly. Write to us and we will tell you the moment
          the drop opens.
        </p>
        <a
          href={`mailto:${FEST.email}?subject=V-TAPP%202026%20Merch`}
          className="btn-primary mt-7"
        >
          Tell me when it drops
        </a>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ grid --- */

function Grid({ items }: { items: MerchItem[] }) {
  return (
    <div className="mt-14 grid gap-px border border-white/30 bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Card key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}

function Card({ item, index }: { item: MerchItem; index: number }) {
  // narrowed here rather than via a boolean, so the href below stays a string
  const storeUrl = item.soldOut ? null : MERCH_STORE_URL;

  return (
    <article className="group flex flex-col bg-ink-950 transition-colors hover:bg-white/[0.02]">
      {/* artwork, 4:5 like the event posters */}
      <div className="on-media relative aspect-poster overflow-hidden border-b border-white/30 bg-white/[0.02]">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon3D name="merch" size={72} />
          </div>
        )}

        <span className="absolute left-0 top-0 bg-ink-950/90 px-2.5 py-1.5 font-mono text-[10px] tracking-label text-slate-400">
          {String(index + 1).padStart(2, '0')}
        </span>

        {item.tag && !item.soldOut && (
          <span className="on-brand absolute right-0 top-0 bg-brand-600 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-label">
            {item.tag}
          </span>
        )}

        {item.soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink-950/75 font-mono text-xs uppercase tracking-label text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-light leading-tight tracking-tight">
            {item.name}
          </h2>
          <span className="shrink-0 font-mono text-sm tracking-wide text-brand-400">
            {formatPrice(item.price)}
          </span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{item.blurb}</p>

        {item.sizes && item.sizes.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {item.sizes.map((s) => (
              <span
                key={s}
                className="border border-white/12 px-2.5 py-1 font-mono text-[10px] tracking-label text-slate-400"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6">
          {storeUrl ? (
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
            >
              Buy
            </a>
          ) : (
            <span className="btn-ghost pointer-events-none w-full opacity-60">
              {item.soldOut ? 'Sold out' : 'Coming soon'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* --------------------------------------------------------------- waiting --- */

function Waiting() {
  return (
    <div className="panel brackets mt-14 flex flex-col items-center px-8 py-20 text-center">
      <Icon3D name="merch" size={84} />

      <p className="mt-8 font-display text-2xl font-light tracking-tight text-white">
        The drop is being printed
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        Tees, hoodies and the rest of the {FEST.name} kit go on sale before {FEST.dateLabel}. This
        page fills in the moment the run is confirmed.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <span className="mono-label">STATUS: IN PRODUCTION</span>
        <span className="mono-label text-brand-500">V-TAPP 2026 / MERCH / REV.A</span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- facts --- */

function Fact({ icon, k, v }: { icon: 'calendar' | 'pin' | 'campus'; k: string; v: string }) {
  return (
    <div className="flex items-start gap-4 bg-ink-950 p-6">
      <Icon3D name={icon} size={30} />
      <div>
        <p className="mono-label">{k}</p>
        <p className="mt-2 text-sm leading-relaxed text-white">{v}</p>
      </div>
    </div>
  );
}
