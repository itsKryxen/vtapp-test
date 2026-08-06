/**
 * VIT-AP schools. The `code` is the middle segment of every club ID:
 *   VT26_<code>_<index>   e.g. VT26_SCOPE_001
 *
 * Codes are UPPERCASE, letters only, and must never be renamed once IDs are
 * issued, the club ID is the permanent primary key for a club.
 */

export type SchoolCode =
  | 'SCOPE'
  | 'SENSE'
  | 'SMEC'
  | 'SAS'
  | 'VSB'
  | 'VSL'
  | 'VISH'
  | 'CENTRAL'
  | 'SBST';

export interface School {
  code: SchoolCode;
  name: string;
  short: string;
  /** hex, used for card glow, filter chips and school badges */
  accent: string;
}

/**
 * Accents stay inside the logo's world of crimson through ember and gold, with
 * two neutrals, so a page full of different schools still reads as one brand.
 * All eight sit on black at 4.5:1 or better.
 */
export const SCHOOLS: School[] = [
  { code: 'SCOPE', name: 'School of Computer Science and Engineering', short: 'Computer Science', accent: '#e0685e' },
  { code: 'SENSE', name: 'School of Electronics Engineering', short: 'Electronics', accent: '#cf3f34' },
  { code: 'SMEC', name: 'School of Mechanical Engineering', short: 'Mechanical', accent: '#e8823c' },
  { code: 'SAS', name: 'School of Advanced Sciences', short: 'Advanced Sciences', accent: '#e3b23c' },
  { code: 'VSB', name: 'VIT-AP School of Business', short: 'Business', accent: '#d8536b' },
  { code: 'VSL', name: 'VIT-AP School of Law', short: 'Law', accent: '#c9b8a8' },
  { code: 'VISH', name: 'VIT-AP School of Social Sciences and Humanities', short: 'Social Sciences', accent: '#b5666b' },
  { code: 'SBST', name: 'School of Bio Sciences and Technology', short: 'Bio Sciences', accent: '#5eb57c' },
  { code: 'CENTRAL', name: 'Central / University-wide Clubs', short: 'Central', accent: '#f1f1f1' },
];

export const SCHOOL_CODES = SCHOOLS.map((s) => s.code) as SchoolCode[];

const BY_CODE = new Map<string, School>(SCHOOLS.map((s) => [s.code, s]));

export function getSchool(code: string): School | undefined {
  return BY_CODE.get(code.toUpperCase());
}

/** Logo crimson, the fallback and the default accent everywhere. */
export const BRAND = '#b32821';

export function schoolAccent(code: string): string {
  return getSchool(code)?.accent ?? BRAND;
}
