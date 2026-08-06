import type { Metadata } from 'next';
import { PageHeader } from '@/components/SectionHeader';
import AndhraPradeshBinaryMap from '@/components/AndhraPradeshBinaryMap';

export const metadata: Metadata = {
  title: 'Andhra Pradesh Map',
  description: 'An interactive binary map of Andhra Pradesh highlighting VIT-AP University.',
};

export default function MapPage() {
  return (
    <div className="pb-8 pt-28 sm:pt-36">
      <div className="container-x">
        <PageHeader
          index="AP"
          slug="BINARY MAP"
          title="Andhra Pradesh in signal"
     
        />
      </div>
      <AndhraPradeshBinaryMap />
    </div>
  );
}
