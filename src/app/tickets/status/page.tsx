import type { Metadata } from 'next';
import StatusClient from './StatusClient';
import { PageHeader } from '@/components/SectionHeader';

export const metadata: Metadata = {
  title: 'My orders',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function TicketStatusPage() {
  return (
    <div className="container-x pb-24 pt-16">
      <PageHeader
        index="12"
        slug="ORDERS"
        title={<>My tickets</>}
        description={<>Orders bought from this browser, plus a lookup by reference.</>}
      />
      <StatusClient />
    </div>
  );
}
