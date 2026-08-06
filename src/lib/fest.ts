/** Fest-wide constants. Change the dates here and the whole site follows. */

export const FEST = {
  name: 'V-TAPP 2026',
  fullName: 'V-TAPP 2026 International Techfest',
  university: 'VIT-AP University',
  /** The official strapline from the logo. */
  tagline: 'The Pinnacle of Innovation and Creativity',
  /** Longer supporting line used under the hero headline. */
  blurb: 'Two days. Seven schools. One campus running at full throttle.',
  /** Every V-TAPP event runs on campus, there is no online/hybrid track. */
  allOnCampus: true,
  /** ISO strings in IST (+05:30) */
  startsAt: '2026-09-11T09:00:00+05:30',
  endsAt: '2026-09-12T21:00:00+05:30',
  dateLabel: '11 & 12 September 2026',
  venue: 'VIT-AP University, Amaravati',
  email: 'vtapp.convenor@vitap.ac.in',
  instagram: 'https://instagram.com/vtapp.vitap',
  /** Deadline for clubs to submit events for review */
  submissionDeadline: '2026-08-25T23:59:00+05:30',
} as const;

export const STATS = [
  { value: '60+', label: 'Events' },
  { value: '7', label: 'Schools' },
  { value: '₹10L', label: 'Prize pool' },
  { value: '8000+', label: 'Participants' },
];
