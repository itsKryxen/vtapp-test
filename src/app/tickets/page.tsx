import type { Metadata } from 'next';
import Link from 'next/link';
import TicketPicker from './TicketPicker';
import { getApprovedEvents } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Tickets — V-TAPP 2026',
  description: 'Official Digital Event Pass & Access Credential for V-TAPP 2026 at VIT-AP University.',
};

export const dynamic = 'force-dynamic';

export default async function TicketsPage() {
  const events = await getApprovedEvents();

  return (
    <div className="container-x pb-24 pt-20 sm:pt-28">
      <TicketPicker events={events} />

      <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-widest text-slate-500">
        Already have an order reference?{' '}
        <Link href="/tickets/status" className="font-bold text-[var(--brand)] hover:underline">
          Check order status
        </Link>
      </p>
    </div>
  );
}
