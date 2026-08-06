import type { Metadata } from 'next';
import Link from 'next/link';
import TicketPicker from './TicketPicker';
import { PageHeader } from '@/components/SectionHeader';
import { getApprovedEvents } from '@/lib/data';
import { COMBO, formatINR } from '@/lib/tickets';
import { FEST } from '@/lib/fest';

export const metadata: Metadata = {
  title: 'Tickets',
  description: `Combo pass ${formatINR(COMBO.price)} or per-event tickets for ${FEST.name}.`,
};

export const dynamic = 'force-dynamic';

export default async function TicketsPage() {
  const events = await getApprovedEvents();

  return (
    <div className="container-x pb-24 pt-16">
      <PageHeader
        index="10"
        slug="TICKETS"
        title={<>Get your pass</>}
        description={
          <>
            One combo pass covers every event across both days for {formatINR(COMBO.price)}, or buy
            tickets for individual events. Payment is handled by the university portal.
          </>
        }
        meta={`${events.length} EVENTS OPEN`}
      />

      <TicketPicker events={events} />

      <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-label text-slate-600">
        Already have a reference?{' '}
        <Link href="/tickets/status" className="text-brand-400 hover:underline">
          Check your order
        </Link>
      </p>
    </div>
  );
}
