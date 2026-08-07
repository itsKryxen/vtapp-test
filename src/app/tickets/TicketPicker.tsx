'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  COMBO,
  buildPortalUrl,
  formatINR,
  rememberOrder,
  type TicketKind,
  type TicketOrder,
} from '@/lib/tickets';
import { schoolAccent } from '@/lib/schools';
import type { EventWithClub } from '@/lib/types';

interface Props {
  events: EventWithClub[];
}

export default function TicketPicker({ events }: Props) {
  const [kind, setKind] = useState<TicketKind>('combo');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '', reg: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<{ order: TicketOrder; url: string } | null>(null);

  const eventTotal = useMemo(
    () =>
      events
        .filter((e) => picked.has(e.id))
        .reduce((sum, e) => sum + Number(e.registration_fee), 0),
    [events, picked]
  );

  const total = kind === 'combo' ? COMBO.price : eventTotal;
  const saving = eventTotal - COMBO.price;

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function validate(): string | null {
    if (buyer.name.trim().length < 2) return 'Enter your full name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(buyer.email)) return 'Enter a valid email address.';
    if (buyer.phone && !/^[0-9+ ()-]{8,20}$/.test(buyer.phone)) return 'Enter a valid phone number.';
    if (kind === 'event' && picked.size === 0) return 'Select at least one event.';
    return null;
  }

  async function checkout() {
    setError(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();

      // The amount is recomputed server side inside the RPC, so nothing here
      // decides the price. This call only says what was selected.
      const { data, error: rpcError } = await supabase.rpc('create_ticket_order', {
        p_kind: kind,
        p_event_ids: kind === 'event' ? [...picked] : [],
        p_buyer_name: buyer.name.trim(),
        p_buyer_email: buyer.email.trim(),
        p_buyer_phone: buyer.phone.trim() || null,
        p_buyer_reg_no: buyer.reg.trim() || null,
        p_combo_price: COMBO.price,
      });

      if (rpcError) throw rpcError;

      const order = data as TicketOrder;
      rememberOrder(order.reference);
      setHandoff({ order, url: buildPortalUrl(order, window.location.origin) });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not start the order. Check your connection and try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- handoff screen ---------------- */
  if (handoff) {
    return (
      <div className="panel brackets mx-auto max-w-xl p-8 text-center">
        <p className="mono-label text-brand-500">ORDER CREATED</p>
        <p className="mt-6 font-mono text-3xl tracking-widest text-white">
          {handoff.order.reference}
        </p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-label text-slate-500">
          {formatINR(handoff.order.amount)} · {handoff.order.kind === 'combo' ? 'COMBO PASS' : `${handoff.order.event_ids.length} EVENT(S)`}
        </p>

        <p className="mx-auto mt-7 max-w-sm text-sm leading-relaxed text-slate-400">
          Write this reference down. You are about to be sent to the VIT-AP payment portal, and
          you will need it if anything goes wrong on the way back.
        </p>

        <a href={handoff.url} className="btn-primary mt-8 w-full">
          Continue to payment
        </a>

        <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-label text-slate-600">
          events.vitap.ac.in · you will return here automatically
        </p>
      </div>
    );
  }

  /* ---------------- picker ---------------- */
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="space-y-8">
        {/* product switch */}
        <div className="grid gap-px border border-white/30 bg-white/[0.08] sm:grid-cols-2">
          <ProductTile
            active={kind === 'combo'}
            onClick={() => setKind('combo')}
            index="01"
            name="Combo pass"
            price={formatINR(COMBO.price)}
            note="Every event, both days"
          />
          <ProductTile
            active={kind === 'event'}
            onClick={() => setKind('event')}
            index="02"
            name="Per event"
            price="FROM ₹0"
            note="Pick only what you want"
          />
        </div>

        {kind === 'combo' ? (
          <div className="panel p-7">
            <p className="mono-label text-brand-500">INCLUDED</p>
            <ul className="mt-5 space-y-3">
              {COMBO.perks.map((perk) => (
                <li key={perk} className="flex gap-3 text-sm text-slate-300">
                  <span className="mt-1.5 h-1 w-3 shrink-0 bg-brand-600" />
                  {perk}
                </li>
              ))}
            </ul>
            {eventTotal > 0 && saving > 0 && (
              <p className="mt-6 border-t border-white/30 pt-5 font-mono text-[11px] uppercase tracking-label text-emerald-400">
                Buying every event separately costs {formatINR(eventTotal)}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="tag-index">[SELECT]</span>
              <span className="h-px flex-1 bg-white/10" />
              <span className="mono-label">
                {String(picked.size).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
              </span>
            </div>

            {events.length === 0 ? (
              <div className="panel p-12 text-center">
                <p className="display-md">Events announced soon</p>
                <p className="mt-3 text-sm text-slate-500">
                  Per-event tickets open as clubs publish. The combo pass is available now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/20 border border-white/30">
                {events.map((e) => {
                  const on = picked.has(e.id);
                  return (
                    <label
                      key={e.id}
                      className={`flex cursor-pointer items-center gap-4 px-4 py-3.5 transition-colors ${
                        on ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(e.id)}
                        className="sr-only"
                      />
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors ${
                          on ? 'border-brand-600 bg-brand-600' : 'border-white/25'
                        }`}
                      >
                        {on && (
                          <svg viewBox="0 0 10 10" className="h-2 w-2" aria-hidden="true">
                            <path
                              d="M1 5l2.6 2.6L9 2"
                              stroke="#fff"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </span>

                      <span
                        className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-label"
                        style={{ color: schoolAccent(e.school) }}
                      >
                        {e.school}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white">{e.title}</span>
                        <span className="block truncate font-mono text-[10px] uppercase tracking-label text-slate-600">
                          {new Date(e.start_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}{' '}
                          · {e.venue}
                        </span>
                      </span>

                      <span className="shrink-0 font-mono text-[11px] tracking-label text-slate-300">
                        {Number(e.registration_fee) === 0
                          ? 'FREE'
                          : formatINR(Number(e.registration_fee))}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* buyer */}
        <div className="panel p-7">
          <p className="mono-label text-brand-500">YOUR DETAILS</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="t-name">Full name *</label>
              <input
                id="t-name"
                className="field"
                value={buyer.name}
                onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="t-email">Email *</label>
              <input
                id="t-email"
                type="email"
                className="field"
                value={buyer.email}
                onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="t-phone">Phone</label>
              <input
                id="t-phone"
                className="field"
                value={buyer.phone}
                onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                placeholder="+91 90000 00000"
              />
            </div>
            <div>
              <label className="label" htmlFor="t-reg">Registration number</label>
              <input
                id="t-reg"
                className="field"
                value={buyer.reg}
                onChange={(e) => setBuyer({ ...buyer, reg: e.target.value })}
                placeholder="22BCE7000"
              />
              <p className="hint">VIT-AP students only. Leave blank if you are external.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- summary ---------------- */}
      <aside className="panel brackets lg:sticky lg:top-24">
        <div className="border-b border-white/30 px-6 py-4">
          <p className="mono-label text-brand-500">ORDER SUMMARY</p>
        </div>

        <dl className="divide-y divide-white/20">
          <Row k="TYPE" v={kind === 'combo' ? 'Combo pass' : 'Per event'} />
          <Row
            k="ITEMS"
            v={kind === 'combo' ? '1 pass' : `${picked.size} event${picked.size === 1 ? '' : 's'}`}
          />
          <Row k="CURRENCY" v="INR" />
        </dl>

        <div className="flex items-baseline justify-between border-t border-white/30 px-6 py-6">
          <span className="mono-label">TOTAL</span>
          <span className="font-display text-4xl font-light tracking-tightest text-white">
            {formatINR(total)}
          </span>
        </div>

        {error && (
          <p className="border-t border-brand-600/30 bg-brand-600/10 px-6 py-4 font-mono text-[11px] leading-relaxed text-brand-400">
            {error}
          </p>
        )}

        <div className="border-t border-white/30 p-6">
          <button type="button" onClick={checkout} disabled={busy} className="btn-primary w-full">
            {busy ? 'Creating order…' : 'Proceed to payment'}
          </button>
          <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-label text-slate-600">
            Payment is handled by VIT-AP at events.vitap.ac.in. You will return here once it is
            done.
          </p>
        </div>
      </aside>
    </div>
  );
}

function ProductTile({
  active,
  onClick,
  index,
  name,
  price,
  note,
}: {
  active: boolean;
  onClick: () => void;
  index: string;
  name: string;
  price: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative bg-ink-950 p-6 text-left transition-colors ${
        active ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
      }`}
    >
      {active && <span className="absolute inset-x-0 top-0 h-px bg-brand-600" />}
      <span className={`mono-tag ${active ? 'text-brand-500' : 'text-slate-600'}`}>[{index}]</span>
      <span className="mt-3 block font-display text-xl font-light text-white">{name}</span>
      <span className="mt-1 block font-mono text-[11px] uppercase tracking-label text-slate-500">
        {note}
      </span>
      <span className="mt-4 block font-mono text-lg tracking-label text-white">{price}</span>
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <dt className="mono-label">{k}</dt>
      <dd className="font-mono text-[11px] text-slate-300">{v}</dd>
    </div>
  );
}
