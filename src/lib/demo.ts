import type { Sponsor } from './sponsors';
import type { TeamMember } from './team';
import type { Club } from './types';

/**
 * Demo content for previewing the site before the real data exists.
 *
 * Used automatically whenever Supabase is not configured. The moment you add
 * your Supabase keys, every one of these is replaced by real database rows and
 * none of this reaches production. Artwork lives in public/demo and is
 * generated, not licensed, so there is nothing to attribute.
 *
 * To force the empty "announced soon" states while previewing, set
 * NEXT_PUBLIC_SHOW_DEMO_EVENTS=false in .env.local.
 */

const now = '2026-08-01T10:00:00+05:30';

export const DEMO_CLUBS: Club[] = [
  {
    id: 'VT26_SCOPE_001',
    school: 'SCOPE',
    club_index: 1,
    name: 'Google Developer Group VIT-AP',
    tagline: 'Build with Google tech, ship something real',
    logo_url: '/demo/club-gdg.webp',
    contact_name: 'Aditya Rao',
    contact_email: 'gdg@vitap.ac.in',
    contact_phone: '+91 90000 00001',
    instagram: '@gdg.vitap',
    is_active: true,
    created_at: now,
  },
  {
    id: 'VT26_SCOPE_002',
    school: 'SCOPE',
    club_index: 2,
    name: 'Cybernauts',
    tagline: 'Security, CTFs and breaking things responsibly',
    logo_url: '/demo/club-cybernauts.webp',
    contact_name: 'Nikhil S',
    contact_email: 'cyber@vitap.ac.in',
    contact_phone: '+91 90000 00002',
    instagram: '@cybernauts.vitap',
    is_active: true,
    created_at: now,
  },
  {
    id: 'VT26_SENSE_001',
    school: 'SENSE',
    club_index: 1,
    name: 'IEEE Student Branch',
    tagline: 'Electronics, radio and everything RF',
    logo_url: '/demo/club-ieee.webp',
    contact_name: 'Priya M',
    contact_email: 'ieee@vitap.ac.in',
    contact_phone: '+91 90000 00003',
    instagram: '@ieee.vitap',
    is_active: true,
    created_at: now,
  },
  {
    id: 'VT26_SMEC_001',
    school: 'SMEC',
    club_index: 1,
    name: 'SAE Collegiate Club',
    tagline: 'Automotive engineering, built in the workshop',
    logo_url: '/demo/club-sae.webp',
    contact_name: 'Rohit Verma',
    contact_email: 'sae@vitap.ac.in',
    contact_phone: '+91 90000 00004',
    instagram: '@sae.vitap',
    is_active: true,
    created_at: now,
  },
  {
    id: 'VT26_SAS_001',
    school: 'SAS',
    club_index: 1,
    name: 'Bioverse',
    tagline: 'Biotech and life sciences, hands on',
    logo_url: '/demo/club-bioverse.webp',
    contact_name: 'Sneha Reddy',
    contact_email: 'bio@vitap.ac.in',
    contact_phone: '+91 90000 00005',
    instagram: '@bioverse.vitap',
    is_active: true,
    created_at: now,
  },
  {
    id: 'VT26_VSB_001',
    school: 'VSB',
    club_index: 1,
    name: 'E-Cell VIT-AP',
    tagline: 'Entrepreneurship, from idea to pitch',
    logo_url: '/demo/club-ecell.webp',
    contact_name: 'Karthik N',
    contact_email: 'ecell@vitap.ac.in',
    contact_phone: '+91 90000 00006',
    instagram: '@ecell.vitap',
    is_active: true,
    created_at: now,
  },
];

export const DEMO_SPONSORS: Sponsor[] = [
  {
    id: 'demo-sp-1',
    name: 'Northwind Cloud',
    tier: 'title',
    logo_url: '/demo/sponsor-northwind.webp',
    website: 'https://example.com',
    blurb:
      'Presenting partner for V-TAPP 2026, backing the hackathon track and providing cloud credits to every registered team.',
    sort_order: 10,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  { id: 'demo-sp-2', name: 'Aeronix', tier: 'gold', logo_url: '/demo/sponsor-aeronix.webp', website: 'https://example.com', blurb: null, sort_order: 10, is_active: true, created_at: now, updated_at: now },
  { id: 'demo-sp-3', name: 'Quantile Analytics', tier: 'gold', logo_url: '/demo/sponsor-quantile.webp', website: 'https://example.com', blurb: null, sort_order: 20, is_active: true, created_at: now, updated_at: now },
  { id: 'demo-sp-4', name: 'Vertex Labs', tier: 'gold', logo_url: '/demo/sponsor-vertex-labs.webp', website: null, blurb: null, sort_order: 30, is_active: true, created_at: now, updated_at: now },
  { id: 'demo-sp-5', name: 'Kalpana', tier: 'silver', logo_url: '/demo/sponsor-kalpana.webp', website: 'https://example.com', blurb: null, sort_order: 10, is_active: true, created_at: now, updated_at: now },
  { id: 'demo-sp-6', name: 'Stackforge', tier: 'silver', logo_url: '/demo/sponsor-stackforge.webp', website: 'https://example.com', blurb: null, sort_order: 20, is_active: true, created_at: now, updated_at: now },
  { id: 'demo-sp-7', name: 'Meridian', tier: 'bronze', logo_url: '/demo/sponsor-meridian.webp', website: null, blurb: null, sort_order: 10, is_active: true, created_at: now, updated_at: now },
  { id: 'demo-sp-8', name: 'BlueCircuit', tier: 'partner', logo_url: '/demo/sponsor-bluecircuit.webp', website: null, blurb: null, sort_order: 10, is_active: true, created_at: now, updated_at: now },
];

function member(
  id: string,
  name: string,
  role: string,
  department: string,
  sort_order: number,
  extra: Partial<TeamMember> = {}
): TeamMember {
  return {
    id,
    name,
    role,
    department,
    photo_url: null, // the card falls back to initials, which reads fine
    email: null,
    linkedin: null,
    instagram: null,
    sort_order,
    is_active: true,
    created_at: now,
    updated_at: now,
    ...extra,
  };
}

export const DEMO_TEAM: TeamMember[] = [
  member('demo-t-1', 'Rahul Nayak', 'Convenor', 'Core', 10, { email: 'vtapp.convenor@vitap.ac.in' }),
  member('demo-t-2', 'Ananya Iyer', 'Co-Convenor', 'Core', 20),
  member('demo-t-3', 'Vikram Shetty', 'General Secretary', 'Core', 30),

  member('demo-t-4', 'Meera Krishnan', 'Technical Head', 'Technical', 10),
  member('demo-t-5', 'Arjun Pillai', 'Web Lead', 'Technical', 20),
  member('demo-t-6', 'Tanvi Deshmukh', 'Infrastructure Lead', 'Technical', 30),

  member('demo-t-7', 'Sahil Chopra', 'Events Head', 'Events', 10),
  member('demo-t-8', 'Divya Menon', 'Events Coordinator', 'Events', 20),

  member('demo-t-9', 'Ishaan Bhatt', 'Sponsorship Head', 'Sponsorship', 10),
  member('demo-t-10', 'Nandini Rao', 'Outreach Lead', 'Sponsorship', 20),

  member('demo-t-11', 'Kabir Sen', 'Design Head', 'Design', 10),
  member('demo-t-12', 'Riya Kulkarni', 'Creative Lead', 'Design', 20),

  member('demo-t-13', 'Aarav Malhotra', 'Marketing Head', 'Marketing', 10),
  member('demo-t-14', 'Sara Fernandes', 'Social Media Lead', 'Marketing', 20),

  member('demo-t-15', 'Yash Agarwal', 'Operations Head', 'Operations', 10),
  member('demo-t-16', 'Pooja Nair', 'Hospitality Head', 'Hospitality', 10),
];
