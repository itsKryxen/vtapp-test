import { createClient } from './supabase/server';
import { SAMPLE_EVENTS } from './sample-events';
import { DEMO_CLUBS, DEMO_SPONSORS, DEMO_TEAM } from './demo';
import type { Club, EventWithClub } from './types';
import type { Sponsor } from './sponsors';
import type { TeamMember } from './team';

/**
 * Every read goes through here. When Supabase env vars are missing (fresh clone,
 * CI build, design preview) we fall back to sample data instead of crashing, so
 * `npm run build` always succeeds.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Demo content fills the site whenever Supabase is not configured, so a fresh
 * clone looks like a finished festival site instead of a row of empty states.
 *
 * It can never leak into production: the moment NEXT_PUBLIC_SUPABASE_URL is
 * set, every read goes to the database and none of this is reachable. To
 * preview the empty "announced soon" states instead, set
 * NEXT_PUBLIC_SHOW_DEMO_EVENTS=false in .env.local.
 */
export function showDemoContent(): boolean {
  const flag = process.env.NEXT_PUBLIC_SHOW_DEMO_EVENTS;
  if (flag === 'true') return true;   // force demo, even with Supabase connected
  if (flag === 'false') return false; // force real data / empty states
  return !isSupabaseConfigured();     // auto
}

export interface EventFilters {
  school?: string;
  category?: string;
  mode?: string;
  q?: string;
}

function applyFiltersLocally(events: EventWithClub[], f: EventFilters): EventWithClub[] {
  return events.filter((e) => {
    if (f.school && e.school !== f.school) return false;
    if (f.category && e.category !== f.category) return false;
    if (f.mode && e.mode !== f.mode) return false;
    if (f.q) {
      const hay = `${e.title} ${e.tagline ?? ''} ${e.description}`.toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false;
    }
    return true;
  });
}

export async function getApprovedEvents(filters: EventFilters = {}): Promise<EventWithClub[]> {
  if (showDemoContent()) return applyFiltersLocally(SAMPLE_EVENTS, filters);
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  let query = supabase
    .from('events')
    .select('*, club:clubs(id, name, logo_url, instagram)')
    .eq('status', 'approved')
    .order('start_at', { ascending: true });

  if (filters.school) query = query.eq('school', filters.school);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.mode) query = query.eq('mode', filters.mode);
  if (filters.q) query = query.ilike('title', `%${filters.q}%`);

  const { data, error } = await query;
  if (error) {
    console.error('[data] getApprovedEvents', error.message);
    return [];
  }
  return (data ?? []) as unknown as EventWithClub[];
}

export async function getFeaturedEvents(limit = 6): Promise<EventWithClub[]> {
  const all = await getApprovedEvents();
  const featured = all.filter((e) => e.is_featured);
  return (featured.length >= 3 ? featured : all).slice(0, limit);
}

export async function getEventBySlug(slug: string): Promise<EventWithClub | null> {
  if (showDemoContent()) return SAMPLE_EVENTS.find((e) => e.slug === slug) ?? null;
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, club:clubs(id, name, logo_url, instagram)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .maybeSingle();

  if (error) {
    console.error('[data] getEventBySlug', error.message);
    return null;
  }
  return (data as unknown as EventWithClub) ?? null;
}

export async function getClubs(): Promise<Club[]> {
  if (showDemoContent()) return DEMO_CLUBS;
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true });

  if (error) {
    console.error('[data] getClubs', error.message);
    return [];
  }
  return (data ?? []) as Club[];
}

/** The signed-in user's club membership row, or null. */
export async function getMembership() {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('club_members')
    .select('*, club:clubs(*)')
    .eq('user_id', user.id)
    .maybeSingle();

  return data as
    | { user_id: string; club_id: string | null; role: 'club' | 'admin'; full_name: string | null; club: Club | null }
    | null;
}

/**
 * Active sponsors, ordered by tier then sort_order.
 * Returns [] when Supabase isn't configured, the sponsors page then shows its
 * "announced soon" state and the homepage strip renders nothing at all.
 */
export async function getSponsors(): Promise<Sponsor[]> {
  if (showDemoContent()) return DEMO_SPONSORS;
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    // Table missing = migration 003 not run yet. Don't blow up the page.
    console.error('[data] getSponsors', error.message);
    return [];
  }
  return (data ?? []) as Sponsor[];
}

/** Active core team members, ordered by department then sort_order. */
export async function getTeam(): Promise<TeamMember[]> {
  if (showDemoContent()) return DEMO_TEAM;
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    // Table missing = migration 004 not run yet. Don't blow up the page.
    console.error('[data] getTeam', error.message);
    return [];
  }
  return (data ?? []) as TeamMember[];
}
