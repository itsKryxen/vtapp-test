import type { SchoolCode } from './schools';

export type EventStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export type EventCategory =
  | 'technical'
  | 'coding'
  | 'robotics'
  | 'design'
  | 'gaming'
  | 'workshop'
  | 'cultural'
  | 'literary'
  | 'business'
  | 'sports'
  | 'guest-lecture';

export type EventMode = 'offline' | 'online' | 'hybrid';
export type TeamType = 'solo' | 'team' | 'both';

export interface Club {
  id: string; // VT26_SCOPE_001
  school: SchoolCode;
  club_index: number;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  instagram: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EventRecord {
  id: string; // uuid
  event_code: string; // VT26_SCOPE_001-E01
  club_id: string;
  school: SchoolCode;
  slug: string;

  title: string;
  tagline: string | null;
  description: string;
  rules: string | null;
  category: EventCategory;
  mode: EventMode;

  start_at: string;
  end_at: string;
  venue: string;

  team_type: TeamType;
  team_min: number;
  team_max: number;
  max_participants: number | null;
  registration_fee: number;
  registration_url: string | null;
  registration_deadline: string | null;

  prize_pool: number | null;
  prizes: string | null;

  coordinator_name: string;
  coordinator_phone: string;
  coordinator_email: string;

  poster_url: string | null;
  thumbnail_url: string | null;

  status: EventStatus;
  rejection_reason: string | null;
  is_featured: boolean;

  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface EventWithClub extends EventRecord {
  club: Pick<Club, 'id' | 'name' | 'logo_url' | 'instagram'> | null;
}

/**
 * `value` doubles as the Icon3D name, so every category has a matching
 * extruded SVG in src/components/Icon3D.tsx. Add a category here and you must
 * add a path set there too, or the icon silently renders nothing.
 */
export const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'coding', label: 'Coding' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'design', label: 'Design' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'literary', label: 'Literary' },
  { value: 'business', label: 'Business' },
  { value: 'sports', label: 'Sports' },
  { value: 'guest-lecture', label: 'Guest Lecture' },
];

/**
 * V-TAPP 2026 is entirely on campus, so every event is written as 'offline'
 * and mode is never shown or collected. The column and enum are left in the
 * database in case a future edition adds an online track. Re-add a Mode field
 * to EventForm and a chip row to EventFilters and it works again.
 */
export const MODES: { value: EventMode; label: string }[] = [
  { value: 'offline', label: 'On campus' },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}
