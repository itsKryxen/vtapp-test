import type { Metadata } from 'next';
import { PageHeader } from '@/components/SectionHeader';
import SignalBreachGame from '@/components/SignalBreachGame';

export const metadata: Metadata = {
  title: 'Signal Breach',
  description: 'Memorize the signal, repeat the node sequence, and breach six security layers before time expires.',
};

export default function SignalBreachPage() {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader
        index="SB"
        slug="SIGNAL BREACH"
        title="Break the sequence"
        description="A sixty-second memory protocol. Observe the glowing nodes, reproduce every sequence, and clear six security layers before the firewall resets."
        meta="01–16 NODES"
      />

      <SignalBreachGame />
    </div>
  );
}
