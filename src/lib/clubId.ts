/**
 * Club ID scheme for V-TAPP 2026.
 *
 *   VT26_SCOPE_001
 *   └┬┘ └─┬─┘ └┬┘
 *    │    │    └─ index: 3-digit, zero-padded, unique WITHIN the school, starts at 001
 *    │    └────── school code (see lib/schools.ts)
 *    └─────────── fest prefix: "VT" + 2-digit fest year
 *
 * Rules
 *  - Always uppercase. Separator is a single underscore.
 *  - The index is per-school, not global: VT26_SCOPE_001 and VT26_SENSE_001 both exist.
 *  - Once issued, a club ID is permanent. It is the login identifier, the foreign key
 *    on every event row, and the prefix of every uploaded poster's storage path.
 *  - Event codes derive from it:  VT26_SCOPE_001-E01, -E02, ...
 */

import { SCHOOL_CODES, type SchoolCode } from './schools';

export const FEST_YEAR = 2026;
export const FEST_PREFIX = `VT${String(FEST_YEAR).slice(-2)}`; // "VT26"
export const CLUB_INDEX_PAD = 3;
export const MAX_CLUBS_PER_SCHOOL = 999;

export const CLUB_ID_REGEX = new RegExp(
  `^${FEST_PREFIX}_(${SCHOOL_CODES.join('|')})_(\\d{${CLUB_INDEX_PAD}})$`
);

export const EVENT_CODE_REGEX = new RegExp(
  `^${FEST_PREFIX}_(${SCHOOL_CODES.join('|')})_(\\d{${CLUB_INDEX_PAD}})-E(\\d{2})$`
);

export interface ParsedClubId {
  raw: string;
  prefix: string;
  school: SchoolCode;
  index: number;
}

/** Build a club ID from its parts. Throws on an out-of-range index. */
export function buildClubId(school: SchoolCode, index: number): string {
  if (!Number.isInteger(index) || index < 1 || index > MAX_CLUBS_PER_SCHOOL) {
    throw new RangeError(`Club index must be 1..${MAX_CLUBS_PER_SCHOOL}, got ${index}`);
  }
  return `${FEST_PREFIX}_${school}_${String(index).padStart(CLUB_INDEX_PAD, '0')}`;
}

/** Parse a club ID. Returns null when the string is not a valid ID. */
export function parseClubId(value: string): ParsedClubId | null {
  const raw = value.trim().toUpperCase();
  const m = CLUB_ID_REGEX.exec(raw);
  if (!m) return null;
  return {
    raw,
    prefix: FEST_PREFIX,
    school: m[1] as SchoolCode,
    index: Number(m[2]),
  };
}

export function isValidClubId(value: string): boolean {
  return parseClubId(value) !== null;
}

/** Normalise user input: trims, uppercases, converts "-"/spaces to "_". */
export function normaliseClubId(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

/** Next free ID for a school, given the IDs already issued to that school. */
export function nextClubId(school: SchoolCode, existing: string[]): string {
  const used = existing
    .map(parseClubId)
    .filter((p): p is ParsedClubId => p !== null && p.school === school)
    .map((p) => p.index);
  const next = used.length === 0 ? 1 : Math.max(...used) + 1;
  return buildClubId(school, next);
}

/** Event code for the Nth event of a club: VT26_SCOPE_001-E01 */
export function buildEventCode(clubId: string, eventIndex: number): string {
  if (!isValidClubId(clubId)) throw new Error(`Invalid club ID: ${clubId}`);
  if (!Number.isInteger(eventIndex) || eventIndex < 1 || eventIndex > 99) {
    throw new RangeError(`Event index must be 1..99, got ${eventIndex}`);
  }
  return `${normaliseClubId(clubId)}-E${String(eventIndex).padStart(2, '0')}`;
}

/**
 * Storage path for a club's poster. Keeping the club ID as the first path
 * segment lets Supabase RLS scope writes to the club's own folder.
 */
export function posterPath(clubId: string, eventCode: string, ext: string): string {
  return `${normaliseClubId(clubId)}/${eventCode}/poster.${ext.replace(/^\./, '')}`;
}

export function thumbnailPath(clubId: string, eventCode: string): string {
  return `${normaliseClubId(clubId)}/${eventCode}/thumb.webp`;
}

/** Human-readable explanation, rendered on the club onboarding screen. */
export const CLUB_ID_HELP =
  `Format: ${FEST_PREFIX}_SCHOOL_NNN  ·  e.g. ${FEST_PREFIX}_SCOPE_001. ` +
  `The number is unique within your school and is assigned by the V-TAPP core team.`;
