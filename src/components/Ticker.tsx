import { FEST } from '@/lib/fest';

/**
 * The bone-coloured marquee that pins to the very top of every page.
 *
 * Two identical copies of the item list sit side by side and the track
 * translates by exactly -50%, so the loop is seamless with no JS and no
 * measuring. It runs continuously and never pauses, including on hover.
 */

const ITEMS = [
  'V-TAPP 2026',
  FEST.dateLabel.toUpperCase(),
  'VIT-AP UNIVERSITY',
  'AMARAVATI',
  'THE PINNACLE OF INNOVATION AND CREATIVITY',
  '8 SCHOOLS',
  'HACKATHONS × ROBOTICS × CTF × PITCH BATTLES',
  'ON CAMPUS',
  'REGISTRATIONS OPEN',
];

function Run({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {ITEMS.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          <span className="whitespace-nowrap px-5 font-mono text-[10px] uppercase tracking-label text-ink-950">
            {item}
          </span>
          <span className="text-[9px] text-brand-600">◆</span>
        </span>
      ))}
    </div>
  );
}

export default function Ticker() {
  return (
    <div className="relative z-[60] overflow-hidden border-b border-black/20 bg-bone">
      <div className="marquee-track py-2">
        <Run />
        <Run aria-hidden />
      </div>
    </div>
  );
}
