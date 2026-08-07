import type { EventRecord } from '@/lib/types';
import MinimalTechCard from './event-cards/MinimalTechCard';
import PremiumGlowCard from './event-cards/PremiumGlowCard';
import CyberFrameCard from './event-cards/CyberFrameCard';
import CompactInfoCard from './event-cards/CompactInfoCard';
import type { EventCardProps } from './event-cards/types';

/**
 * EventCard acts as a selector to intelligently route to the correct
 * visual variant based on the event's category.
 */
export default function EventCard(props: EventCardProps) {
  const { category } = props.event;

  // Variant 01 — Minimal Tech
  if (['technical', 'coding'].includes(category)) {
    return <MinimalTechCard {...props} />;
  }

  // Variant 02 — Premium Glow
  if (['robotics'].includes(category)) {
    return <PremiumGlowCard {...props} />;
  }

  // Variant 03 — Cyber Frame
  if (['gaming', 'design'].includes(category)) {
    return <CyberFrameCard {...props} />;
  }

  // Variant 04 — Compact Info
  // Matches 'workshop', 'cultural', 'literary', 'business', 'sports', 'guest-lecture'
  // Also acts as the default fallback for any future categories
  return <CompactInfoCard {...props} />;
}
