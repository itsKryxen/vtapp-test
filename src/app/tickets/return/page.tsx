import { Suspense } from 'react';
import type { Metadata } from 'next';
import ReturnClient from './ReturnClient';
import { PageHeader } from '@/components/SectionHeader';

export const metadata: Metadata = {
  title: 'Order status',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function TicketReturnPage() {
  return (
    <div className="container-x pb-24 pt-16">
      <PageHeader
        index="11"
        slug="RECEIPT"
        title={<>Order confirmation</>}
        description={<>Returned from the VIT-AP payment portal.</>}
      />

      <Suspense
        fallback={
          <div className="panel mx-auto max-w-lg p-12 text-center">
            <p className="mono-label text-brand-500">LOADING</p>
          </div>
        }
      >
        <ReturnClient />
      </Suspense>
    </div>
  );
}
