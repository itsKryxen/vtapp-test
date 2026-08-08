'use client';

import React, { useState } from 'react';
import DigitalEventPass from './DigitalEventPass';
import type { EventWithClub } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { buildPortalUrl, rememberOrder, type TicketOrder } from '@/lib/tickets';

interface Props {
  events: EventWithClub[];
}

export default function TicketPicker({ events }: Props) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '', reg: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<{ order: TicketOrder; url: string } | null>(null);

  // Preserve underlying checkout functionality for when prices go live
  async function checkout() {
    setError(null);
    if (!buyer.name.trim() || !buyer.email.trim()) {
      setError('Please provide your name and email.');
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc('create_ticket_order', {
        p_kind: 'event',
        p_event_ids: [...picked],
        p_buyer_name: buyer.name.trim(),
        p_buyer_email: buyer.email.trim(),
        p_buyer_phone: buyer.phone.trim() || null,
        p_buyer_reg_no: buyer.reg.trim() || null,
        p_combo_price: 0,
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

  /* ---------------- Handoff Screen ---------------- */
  if (handoff) {
    return (
      <div className="panel mx-auto max-w-xl space-y-6 p-8 text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
          ORDER CREATED // V-TAPP 2026
        </p>
        <p className="font-mono text-3xl tracking-widest text-[rgb(var(--text-primary))]">
          {handoff.order.reference}
        </p>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">
          EVENT PASS · PRICE TBA
        </p>

        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
          Write this reference down. You will need it on the VIT-AP payment portal.
        </p>

        <a
          href={handoff.url}
          className="btn-primary w-full justify-center"
        >
          Continue to payment
        </a>
      </div>
    );
  }

  /* ---------------- Main Tickets Page Interface ---------------- */
  return (
    <div className="space-y-10">
      {/* Hero Visual: Digital Event Pass Credential */}
      <DigitalEventPass />

      {/* Technical Order Summary Panel (Visual Adaptation) */}
      <div className="panel mx-auto max-w-[1000px] space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
            // ORDER SUMMARY SPECIFICATION
          </span>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            STATUS: PRICE TBA
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left font-mono text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] uppercase tracking-widest block">PASS TYPE</span>
            <span className="font-bold text-white">EVENT PASS</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] uppercase tracking-widest block">EVENT ACCESS</span>
            <span className="font-bold text-white">SINGLE EVENT</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] uppercase tracking-widest block">CURRENCY</span>
            <span className="font-bold text-white">INR (₹)</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] uppercase tracking-widest block">REGISTRATION FEE</span>
            <span className="font-bold text-[var(--brand)]">TBA</span>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-[color:var(--error)] bg-transparent p-3 font-mono text-xs text-[color:var(--error)]">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-4 font-mono text-xs text-[rgb(var(--text-muted))]">
          <span>Official VIT-AP University Event Registration Portal</span>
          <span className="text-slate-400">Ticket pricing & event selection will open upon official announcement.</span>
        </div>
      </div>
    </div>
  );
}
