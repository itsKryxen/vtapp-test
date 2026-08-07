'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { STATUS_COPY, formatINR, rememberOrder, type TicketOrder } from '@/lib/tickets';

/**
 * Landing point after the payment portal redirects back.
 *
 * Reads ?ref and ?status, records the outcome, and shows the receipt. The
 * portal may spell success in a few different ways, so we normalise a handful
 * of common values rather than demanding an exact string.
 */

function normalise(raw: string | null): 'paid' | 'failed' | 'cancelled' | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (['success', 'successful', 'paid', 'completed', 'complete', 'ok', '1', 'true'].includes(s))
    return 'paid';
  if (['cancel', 'cancelled', 'canceled', 'aborted'].includes(s)) return 'cancelled';
  if (['fail', 'failed', 'failure', 'error', 'declined', '0', 'false'].includes(s)) return 'failed';
  return null;
}

export default function ReturnClient() {
  const params = useSearchParams();
  const ran = useRef(false);

  const [order, setOrder] = useState<TicketOrder | null>(null);
  const [state, setState] = useState<'working' | 'done' | 'error'>('working');
  const [message, setMessage] = useState('Confirming with the payment portal…');

  const reference = (params.get('ref') ?? params.get('reference') ?? '').toUpperCase();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      if (!reference) {
        setState('error');
        setMessage('No order reference was included in the return link.');
        return;
      }

      const status = normalise(
        params.get('status') ?? params.get('payment_status') ?? params.get('result')
      );
      const gatewayRef =
        params.get('txn') ?? params.get('txnid') ?? params.get('transaction_id') ?? null;

      try {
        const supabase = createClient();

        // Only write an outcome if the portal actually told us one. Otherwise
        // just read the order back and show whatever state it is in.
        const { data, error } = status
          ? await supabase.rpc('complete_ticket_order', {
              p_reference: reference,
              p_status: status,
              p_gateway_ref: gatewayRef,
            })
          : await supabase.rpc('get_ticket_order', { p_reference: reference });

        if (error) throw error;
        if (!data) {
          setState('error');
          setMessage(`No order found for reference ${reference}.`);
          return;
        }

        const row = data as TicketOrder;
        setOrder(row);
        rememberOrder(row.reference);
        setState('done');
      } catch (e) {
        setState('error');
        setMessage(
          e instanceof Error ? e.message : 'Could not reach the server to confirm your order.'
        );
      }
    })();
  }, [params, reference]);

  if (state === 'working') {
    return (
      <div className="panel mx-auto max-w-lg p-12 text-center">
        <p className="mono-label text-brand-500">
          WORKING
          <span className="ml-1 inline-block h-3 w-1.5 translate-y-px bg-brand-600 animate-blink" />
        </p>
        <p className="mt-5 text-sm text-slate-400">{message}</p>
      </div>
    );
  }

  if (state === 'error' || !order) {
    return (
      <div className="panel brackets mx-auto max-w-lg p-10 text-center">
        <p className="mono-label text-brand-400">COULD NOT CONFIRM</p>
        <p className="mt-5 text-sm leading-relaxed text-slate-400">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tickets/status" className="btn-ghost">
            Look up a reference
          </Link>
          <Link href="/tickets" className="btn-primary">
            Start again
          </Link>
        </div>
      </div>
    );
  }

  const copy = STATUS_COPY[order.status];
  const paid = order.status === 'paid';

  return (
    <div className="mx-auto max-w-xl">
      <div className="panel brackets">
        {/* status band */}
        <div className="flex items-center justify-between border-b border-white/30 px-6 py-4">
          <span className="mono-label">ORDER</span>
          <span className={`border px-3 py-1.5 font-mono text-[10px] tracking-label ${copy.tone}`}>
            {copy.label}
          </span>
        </div>

        <div className="px-6 py-10 text-center">
          {paid && (
            <svg viewBox="0 0 64 64" className="mx-auto h-14 w-14" fill="none" aria-hidden="true">
              <circle cx="32" cy="32" r="30" stroke="#10b981" strokeOpacity="0.3" />
              <path
                d="M18 33.5 L27.5 43 L46 21"
                pathLength={1}
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="bp-draw"
              />
            </svg>
          )}

          <p className="mt-6 font-mono text-3xl tracking-widest text-white">{order.reference}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{copy.note}</p>
        </div>

        <dl className="divide-y divide-white/20 border-t border-white/30">
          <Row k="NAME" v={order.buyer_name} />
          <Row k="EMAIL" v={order.buyer_email} />
          <Row
            k="TICKET"
            v={order.kind === 'combo' ? 'Combo pass, all events' : `${order.event_ids.length} event ticket(s)`}
          />
          <Row k="AMOUNT" v={formatINR(order.amount)} />
          {order.paid_at && (
            <Row
              k="PAID AT"
              v={new Date(order.paid_at).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          )}
        </dl>

        {paid && !order.verified && (
          <p className="border-t border-amber-400/30 bg-amber-400/[0.07] px-6 py-4 font-mono text-[10px] uppercase leading-relaxed tracking-label text-amber-400">
            Awaiting reconciliation by the core team. Your reference is recorded; bring it and your
            payment receipt on the day.
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-white/30 p-6">
          <Link href="/events" className="btn-primary flex-1">
            Browse events
          </Link>
          <Link href="/tickets/status" className="btn-ghost flex-1">
            My orders
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center font-mono text-[10px] uppercase leading-relaxed tracking-label text-slate-600">
        Save this reference. It is how the core team finds your registration.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3.5">
      <dt className="mono-label shrink-0">{k}</dt>
      <dd className="truncate font-mono text-[11px] text-slate-300">{v}</dd>
    </div>
  );
}
