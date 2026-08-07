import type { EventCardProps } from './event-cards/types';
import MasterEventCard from './event-cards/MasterEventCard';

/**
 * EventCard — renders every event with the same MasterEventCard design.
 * Dark theme: BLACK + TECH FEST RED.
 * Light theme: WHITE + V-TAP BLUE.
 */
export default function EventCard(props: EventCardProps) {
  return <MasterEventCard {...props} />;
}

