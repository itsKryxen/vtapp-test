import Link from 'next/link';
import { formatINR } from '@/lib/tickets';

interface HomeTicketSummaryProps {
  name: string;
  perks: readonly string[];
  price: number;
}

export default function HomeTicketSummary({ name, perks, price }: HomeTicketSummaryProps) {
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="home-pass-title">
      <div className="brackets relative overflow-hidden border border-brand-500/30 bg-[linear-gradient(125deg,rgba(var(--brand-rgb),.18),rgba(var(--ink-900),.96)_46%,rgba(var(--ink-950),1))] p-6 sm:p-10 lg:p-14">
        <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-brand-600/15 blur-[90px]" />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_.82fr] lg:items-center">
          <div>
            <p className="mono-label text-brand-400">[ALL ACCESS / BOTH DAYS]</p>
            <h2 id="home-pass-title" className="display-lg mt-5 max-w-2xl">
              One pass. Every event. No second checkout.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Choose the {name} once and keep your options open across the entire festival.
              Individual event tickets remain available if you only want one experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/tickets" className="btn-primary justify-center !px-8 !py-3.5 text-center">
                Get the pass · {formatINR(price)}
              </Link>
              <Link href="/tickets/status" className="btn-ghost justify-center !px-8 !py-3.5 text-center">
                Check an order
              </Link>
            </div>
          </div>

          <div className="border border-white/15 bg-ink-950/70 p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="mono-label">COMBO PASS</p>
                <p className="mt-2 text-sm text-slate-400">One participant · two days</p>
              </div>
              <p className="font-display text-4xl font-light text-white sm:text-5xl">
                {formatINR(price)}
              </p>
            </div>

            <ul className="mt-5 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brand-500 shadow-[0_0_10px_var(--brand-glow)]" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
