/**
 * Fest merchandise.
 *
 * The drop is not open yet, so ITEMS is empty and the page shows its waiting
 * state. Add objects to ITEMS and the grid fills itself: no layout work, no
 * page edits. Images live in /public/merch/ at 4:5, the same ratio as event
 * posters, so one export size covers both.
 *
 *   {
 *     id: 'tee-black',
 *     name: 'Crew tee',
 *     blurb: 'Heavyweight cotton, blueprint mark across the back.',
 *     price: 599,
 *     image: '/merch/tee-black.webp',
 *     sizes: ['S', 'M', 'L', 'XL', 'XXL'],
 *     tag: 'Best seller',
 *   }
 *
 * Set `soldOut: true` to keep an item visible but unbuyable.
 */

export interface MerchItem {
  id: string;
  name: string;
  blurb: string;
  /** Rupees, whole numbers. */
  price: number;
  /** Path under /public, 4:5 portrait. Omit and the card draws a placeholder. */
  image?: string;
  sizes?: string[];
  /** Short badge, e.g. "Limited" or "Pre-order". */
  tag?: string;
  soldOut?: boolean;
}

export const MERCH: MerchItem[] = [];

/**
 * Where the buy button goes once the drop opens. Point it at the store, a form,
 * or the university portal. While it is null the cards show "Coming soon".
 */
export const MERCH_STORE_URL: string | null = null;

/** Collection window, shown on the page so nobody has to ask. */
export const MERCH_INFO = {
  /** Left as null until the team fixes a date. */
  opensOn: null as string | null,
  collectAt: 'Control room, CB 702',
  note: 'Merchandise is collected on campus during the fest. Nothing is shipped.',
};

export const formatPrice = (rupees: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
