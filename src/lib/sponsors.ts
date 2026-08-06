/**
 * Sponsor tiers and logo spec.
 *
 * Tier drives the layout: title gets a full-width band, and each step down
 * gets a denser grid with a smaller logo. That hierarchy is the whole point:
 * it's what a sponsor is paying for.
 */

export type SponsorTier = 'title' | 'gold' | 'silver' | 'bronze' | 'partner';

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  logo_url: string | null;
  website: string | null;
  blurb: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TierSpec {
  value: SponsorTier;
  label: string;
  /** Shown as the section subheading. */
  note: string;
  /** Tailwind grid classes for this tier's row. */
  grid: string;
  /** Tailwind height class for the logo inside each card. */
  logoHeight: string;
  /** Card padding, bigger tiers get more room. */
  padding: string;
  accent: string;
}

export const TIERS: TierSpec[] = [
  {
    value: 'title',
    label: 'Title Sponsor',
    note: 'Presenting V-TAPP 2026',
    grid: 'grid-cols-1',
    logoHeight: 'h-24 sm:h-32',
    padding: 'p-10 sm:p-14',
    accent: '#e0685e',
  },
  {
    value: 'gold',
    label: 'Gold',
    note: '',
    grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    logoHeight: 'h-16 sm:h-20',
    padding: 'p-8',
    accent: '#e3b23c',
  },
  {
    value: 'silver',
    label: 'Silver',
    note: '',
    grid: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    logoHeight: 'h-12 sm:h-16',
    padding: 'p-6',
    accent: '#c9cdd4',
  },
  {
    value: 'bronze',
    label: 'Bronze',
    note: '',
    grid: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5',
    logoHeight: 'h-10 sm:h-12',
    padding: 'p-5',
    accent: '#c08457',
  },
  {
    value: 'partner',
    label: 'Partners',
    note: 'Community, media and outreach partners',
    grid: 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6',
    logoHeight: 'h-8 sm:h-10',
    padding: 'p-4',
    accent: '#f1f1f1',
  },
];

export const TIER_ORDER: SponsorTier[] = TIERS.map((t) => t.value);

export function getTier(value: string): TierSpec | undefined {
  return TIERS.find((t) => t.value === value);
}

/* ------------------------------------------------------------------ */
/* Logo spec                                                           */
/* ------------------------------------------------------------------ */

/**
 * Sponsor logos arrive in every shape imaginable: wide wordmarks, square
 * badges, tall stacked lockups. Rather than force one aspect ratio, we fit
 * each logo inside a fixed box on a transparent canvas ("contain", not
 * "cover"), so nothing is ever cropped and every logo optically matches.
 */
export const SPONSOR_LOGO = {
  boxWidth: 600,
  boxHeight: 300,
  maxBytes: 1024 * 1024, // 1 MB
  minWidth: 120,
  accept: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  acceptAttr: 'image/jpeg,image/png,image/webp,image/svg+xml',
  quality: 0.92,
} as const;

export function checkSponsorLogoFile(file: File): string | null {
  if (!SPONSOR_LOGO.accept.includes(file.type as (typeof SPONSOR_LOGO.accept)[number])) {
    return 'Logo must be a PNG, JPG, WebP or SVG file.';
  }
  if (file.size > SPONSOR_LOGO.maxBytes) {
    return `Logo must be under ${SPONSOR_LOGO.maxBytes / 1024 / 1024} MB (yours is ${(
      file.size /
      1024 /
      1024
    ).toFixed(1)} MB).`;
  }
  return null;
}

/** Browser-only: fit the logo inside 600×300 on a transparent canvas. */
export async function normaliseSponsorLogo(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Could not read that image file.'));
      i.src = url;
    });

    const { boxWidth: W, boxHeight: H } = SPONSOR_LOGO;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available in this browser.');
    ctx.imageSmoothingQuality = 'high';

    // contain: scale to fit, never crop, never upscale past 1:1
    const scale = Math.min(W / img.width, H / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Image encoding failed.'))),
        'image/webp',
        SPONSOR_LOGO.quality
      );
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function sponsorLogoPath(sponsorId: string): string {
  return `sponsors/${sponsorId}.webp`;
}
