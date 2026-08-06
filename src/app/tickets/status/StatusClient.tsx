'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { STATUS_COPY, formatINR, readOrders, rememberOrder, type TicketOrder } from '@/lib/tickets';

/**
 * Order lookup.
 *
 * On mount it loads any references this browser has seen before, so a returning
 * visitor sees their tickets without typing anything. The manual lookup box
 * covers a different device or a cleared browser.
 */
export default function StatusClient() {
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchOne = useCallback(async (reference: string): Promise<TicketOrder | null> => {
    const supabase = createClient();
    const { data, error: e } = await supabase.rpc('get_ticket_order', { p_reference: reference });
    if (e) throw e;
    return (data as TicketOrder) ?? null;
  }, []);

  useEffect(() => {
    (async () => {
      const refs = readOrders();
      if (refs.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const rows = await Promise.all(refs.map((r) => fetchOne(r).catch(() => null)));
        setOrders(rows.filter((r): r is TicketOrder => r !== null));
      } catch {
        /* the manual lookup still works */
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchOne]);

  async function lookup() {
    setError(null);
    const ref = query.trim().toUpperCase();
    if (!/^VT26-[A-Z0-9]{6}$/.test(ref)) {
      setError('References look like VT26-A7K3QX.');
      return;
    }

    try {
      const row = await fetchOne(ref);
      if (!row) {
        setError(`No order found for ${ref}.`);
        return;
      }
      rememberOrder(row.reference);
      setOrders((prev) => [row, ...prev.filter((o) => o.reference !== row.reference)]);
      setQuery('');
    } catch {
      setError('Could not reach the server. Try again in a moment.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* lookup */}
      <div className="flex flex-wrap items-stretch gap-px border border-white/[0.08] bg-white/[0.08]">
        <div className="flex flex-1 items-center gap-3 bg-ink-950 px-4">
          <span className="mono-label text-brand-500">REF</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            placeholder="VT26-XXXXXX"
            aria-label="Order reference"
            className="w-full min-w-0 bg-transparent py-3.5 font-mono text-sm uppercase tracking-widest text-white placeholder:text-slate-700 focus:outline-none"
          />
        </div>
        <button type="button" onClick={lookup} className="btn-primary !border-0 bg-bone px-6">
          Look up
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* results */}
      <div className="mt-8 space-y-4">
        {loading && <p className="mono-label">LOADING SAVED ORDERS…</p>}

        {!loading && orders.length === 0 && (
          <div className="panel p-12 text-center">
            <p className="display-md">No orders on this device</p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-slate-500">
              Enter a reference above, or buy a pass to get started.
            </p>
            <Link href="/tickets" className="btn-primary mt-7">
              Buy a pass
            </Link>
          </div>
        )}

        {orders.map((o) => {
          const copy = STATUS_COPY[o.status];
          return (
            <div key={o.reference} className="panel brackets">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
                <span className="font-mono text-sm tracking-widest text-white">{o.reference}</span>
                <span
                  className={`border px-2.5 py-1 font-mono text-[10px] tracking-label ${copy.tone}`}
                >
                  {copy.label}
                </span>
              </div>

              <dl className="divide-y divide-white/[0.06]">
                <Row
                  k="TICKET"
                  v={o.kind === 'combo' ? 'Combo pass, all events' : `${o.event_ids.length} event(s)`}
                />
                <Row k="AMOUNT" v={formatINR(o.amount)} />
                <Row k="NAME" v={o.buyer_name} />
                <Row
                  k="CREATED"
                  v={new Date(o.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
              </dl>

              {o.status === 'pending' && (
                <p className="border-t border-amber-400/30 bg-amber-400/[0.07] px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-label text-amber-400">
                  Not paid yet. Start a new order to try again.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <dt className="mono-label shrink-0">{k}</dt>
      <dd className="truncate font-mono text-[11px] text-slate-300">{v}</dd>
    </div>
  );
}
