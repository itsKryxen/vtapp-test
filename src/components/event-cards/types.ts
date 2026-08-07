import type { EventRecord } from '@/lib/types';

export interface EventCardProps {
  event: Pick<
    EventRecord,
    | 'id'
    | 'slug'
    | 'title'
    | 'tagline'
    | 'category'
    | 'school'
    | 'start_at'
    | 'venue'
    | 'thumbnail_url'
    | 'poster_url'
    | 'registration_fee'
    | 'prize_pool'
  >;
  clubName?: string | null;
  priority?: boolean;
  /** Position in the event index. */
  index?: number;
}
