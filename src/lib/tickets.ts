/**
 * Ticketing config and the handoff to the university payment portal.
 *
 * Flow:
 *   1. visitor picks a combo pass or a set of events on /tickets
 *   2. we create a PENDING order in Supabase and get back a reference
 *   3. we send them to events.vitap.ac.in with that reference and the amount
 *   4. the portal redirects to /tickets/return?ref=...&status=success
 *   5. we record the outcome and show the receipt
 *
 * Step 4 arrives as a plain URL parameter, so it proves nothing on its own.
 * Orders completed this way are stored with verified=false and the receipt
 * says so. Reconcile against the portal's own records before granting entry.
 */

export type TicketKind = 'combo' | 'event';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface TicketOrder {
  id: string;
  reference: string;
  kind: TicketKind;
  event_ids: string[];
  amount: number;
  currency: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_reg_no: string | null;
  status: OrderStatus;
  gateway_ref: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

/** Flat rate for the pass that covers every event. */
export const COMBO_PRICE = 500;

export const COMBO = {
  price: COMBO_PRICE,
  name: 'V-TAPP Combo Pass',
  blurb: 'One pass, every event, both days.',
  perks: [
    'Entry to every event across all seven schools',
    'Both days, 11 and 12 September',
    'No per-event booking, no queueing twice',
    'Fest kit and participation certificate',
  ],
} as const;

/** Where payment happens. Override with NEXT_PUBLIC_PAYMENT_PORTAL if it moves. */
export const PORTAL_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_PORTAL ?? 'https://events.vitap.ac.in';

/** Local key so a visitor's own references survive a page reload. */
export const ORDERS_KEY = 'vtapp-orders';

/**
 * Build the portal URL.
 *
 * `return_url` is what brings them back here. If the portal ignores it, the
 * reference is still printed on screen before they leave, so an order can
 * always be recovered from /tickets/status.
 */
export function buildPortalUrl(order: Pick<TicketOrder, 'reference' | 'amount' | 'kind'>, siteOrigin: string): string {
  const url = new URL(PORTAL_BASE);
  url.searchParams.set('ref', order.reference);
  url.searchParams.set('amount', String(order.amount));
  url.searchParams.set('currency', 'INR');
  url.searchParams.set('event', 'V-TAPP 2026');
  url.searchParams.set('type', order.kind === 'combo' ? 'combo-pass' : 'event-ticket');
  url.searchParams.set('return_url', `${siteOrigin}/tickets/return?ref=${order.reference}`);
  return url.toString();
}

export function formatINR(amount: number): string {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export const STATUS_COPY: Record<OrderStatus, { label: string; tone: string; note: string }> = {
  pending: {
    label: 'AWAITING PAYMENT',
    tone: 'text-amber-400 border-amber-400/40',
    note: 'This order has not been paid yet. Reopen the payment link to finish.',
  },
  paid: {
    label: 'COMPLETED',
    tone: 'text-emerald-400 border-emerald-400/40',
    note: 'Payment and registration confirmed. Keep your reference for entry.',
  },
  failed: {
    label: 'FAILED',
    tone: 'text-brand-400 border-brand-400/40',
    note: 'The payment did not go through. Nothing was charged. Start a new order.',
  },
  cancelled: {
    label: 'CANCELLED',
    tone: 'text-slate-400 border-white/20',
    note: 'This order was cancelled before payment.',
  },
};

/* ------------------------------------------------------------------ */
/* Browser-side reference memory                                       */
/* ------------------------------------------------------------------ */

export function rememberOrder(reference: string) {
  if (typeof window === 'undefined') return;
  try {
    const prev = readOrders();
    const next = [reference, ...prev.filter((r) => r !== reference)].slice(0, 10);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked, the reference is still on screen */
  }
}

export function readOrders(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((r): r is string => typeof r === 'string') : [];
  } catch {
    return [];
  }
}
