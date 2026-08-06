/**
 * Club logo spec.
 *
 * Small, square, and one size only. These render at 40 to 72px on the clubs
 * directory and event pages, so anything larger is wasted bytes.
 *
 *   Master : 256 x 256 (1:1)
 *   Output : WebP, transparent background preserved
 *
 * Unlike event posters we do NOT reject off-spec uploads, since most clubs only have
 * a logo in whatever size their designer left it. Anything square-ish is
 * centre-cropped to 256x256 automatically.
 */

export const CLUB_LOGO = {
  size: 256,
  maxBytes: 1024 * 1024, // 1 MB
  minSize: 96,
  accept: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  acceptAttr: 'image/jpeg,image/png,image/webp,image/svg+xml',
  quality: 0.9,
} as const;

/** How far from square we tolerate before warning (not rejecting). ±20%. */
export const SQUARE_TOLERANCE = 0.2;

export interface LogoCheck {
  ok: boolean;
  square: boolean;
  width: number;
  height: number;
  message: string;
}

export function checkLogoFile(file: File): string | null {
  if (!CLUB_LOGO.accept.includes(file.type as (typeof CLUB_LOGO.accept)[number])) {
    return 'Logo must be a PNG, JPG, WebP or SVG file.';
  }
  if (file.size > CLUB_LOGO.maxBytes) {
    return `Logo must be under ${CLUB_LOGO.maxBytes / 1024 / 1024} MB (yours is ${(
      file.size /
      1024 /
      1024
    ).toFixed(1)} MB).`;
  }
  return null;
}

export function checkLogoDimensions(width: number, height: number): LogoCheck {
  const drift = Math.abs(width - height) / Math.max(width, height);
  const base = { width, height };

  if (Math.min(width, height) < CLUB_LOGO.minSize) {
    return {
      ...base,
      ok: false,
      square: false,
      message: `Logo is too small (${width}×${height}). Minimum ${CLUB_LOGO.minSize}×${CLUB_LOGO.minSize} px.`,
    };
  }

  if (drift > SQUARE_TOLERANCE) {
    return {
      ...base,
      ok: true,
      square: false,
      message: `Your logo is ${width}×${height}, so it will be centre-cropped to a square. A square file gives a better result.`,
    };
  }

  return {
    ...base,
    ok: true,
    square: true,
    message: `Looks good. ${width}×${height}, resized to ${CLUB_LOGO.size}×${CLUB_LOGO.size}.`,
  };
}

/* ------------------------------------------------------------------ */
/* Browser-only (canvas)                                               */
/* ------------------------------------------------------------------ */

export async function loadLogo(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not read that image file.'));
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** Centre-crop to square and resize to 256×256 WebP, keeping transparency. */
export async function normaliseLogo(file: File): Promise<Blob> {
  const img = await loadLogo(file);
  const S = CLUB_LOGO.size;

  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  ctx.imageSmoothingQuality = 'high';

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, S, S);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Image encoding failed.'))),
      'image/webp',
      CLUB_LOGO.quality
    );
  });
}

/** Storage path for a club's logo, first segment scopes RLS to the club. */
export function clubLogoPath(clubId: string): string {
  return `${clubId}/logo.webp`;
}
