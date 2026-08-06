/**
 * Poster + thumbnail specification for V-TAPP 2026.
 *
 * ONE canonical size. Every club uploads at exactly this size so the event grid
 * is pixel-uniform and nothing is ever letterboxed or stretched.
 *
 *   Master poster : 1080 x 1350  (4:5 portrait, Instagram-native)
 *   Thumbnail     :  540 x  675  (same ratio, generated automatically on upload)
 *   Card render   :  aspect-[4/5], object-cover
 *
 * Uploads are validated in the browser BEFORE they reach storage: wrong ratio is
 * rejected outright, and an off-spec-but-correct-ratio image is offered a
 * one-click resize to 1080x1350.
 */

export const POSTER = {
  width: 1080,
  height: 1350,
  ratio: 1080 / 1350, // 0.8
  ratioLabel: '4:5',
  maxBytes: 5 * 1024 * 1024, // 5 MB
  minWidth: 810, // below this, upscaling to 1080 looks soft, reject
  accept: ['image/jpeg', 'image/png', 'image/webp'],
  acceptAttr: 'image/jpeg,image/png,image/webp',
} as const;

export const THUMBNAIL = {
  width: 540,
  height: 675,
  quality: 0.82,
  format: 'image/webp' as const,
} as const;

/** How much the uploaded ratio may drift from 4:5 before we reject it (±1.5%). */
export const RATIO_TOLERANCE = 0.015;

export interface PosterCheck {
  ok: boolean;
  /** true when dimensions are exactly 1080x1350 */
  exact: boolean;
  /** true when ratio is 4:5 but dimensions differ, we can auto-resize */
  resizable: boolean;
  width: number;
  height: number;
  message: string;
}

export function checkPosterDimensions(width: number, height: number): PosterCheck {
  const ratio = width / height;
  const drift = Math.abs(ratio - POSTER.ratio) / POSTER.ratio;
  const base = { width, height };

  if (drift > RATIO_TOLERANCE) {
    return {
      ...base,
      ok: false,
      exact: false,
      resizable: false,
      message:
        `Poster must be ${POSTER.ratioLabel} portrait (${POSTER.width}x${POSTER.height}). ` +
        `Yours is ${width}x${height}. Re-export at ${POSTER.width}x${POSTER.height} and upload again.`,
    };
  }

  if (width < POSTER.minWidth) {
    return {
      ...base,
      ok: false,
      exact: false,
      resizable: false,
      message:
        `Poster is too small (${width}x${height}). Minimum ${POSTER.minWidth}px wide; ` +
        `${POSTER.width}x${POSTER.height} is required for a sharp thumbnail.`,
    };
  }

  if (width === POSTER.width && height === POSTER.height) {
    return { ...base, ok: true, exact: true, resizable: false, message: 'Perfect, exactly to spec.' };
  }

  return {
    ...base,
    ok: true,
    exact: false,
    resizable: true,
    message:
      `Ratio is correct but size is ${width}x${height}. ` +
      `It will be resized to ${POSTER.width}x${POSTER.height} on upload.`,
  };
}

export function checkPosterFile(file: File): string | null {
  if (!POSTER.accept.includes(file.type as (typeof POSTER.accept)[number])) {
    return 'Poster must be a JPG, PNG or WebP file.';
  }
  if (file.size > POSTER.maxBytes) {
    return `Poster must be under ${(POSTER.maxBytes / 1024 / 1024).toFixed(0)} MB (yours is ${(
      file.size /
      1024 /
      1024
    ).toFixed(1)} MB).`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Browser-only helpers (canvas). Guarded so they can be imported from  */
/* server components without blowing up.                                */
/* ------------------------------------------------------------------ */

export async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not read that image file.'));
      img.src = url;
    });
  } finally {
    // revoke on the next tick so decoding completes
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function drawCover(img: HTMLImageElement, w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  ctx.imageSmoothingQuality = 'high';

  const srcRatio = img.width / img.height;
  const dstRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (srcRatio > dstRatio) {
    sw = img.height * dstRatio;
    sx = (img.width - sw) / 2;
  } else if (srcRatio < dstRatio) {
    sh = img.width / dstRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Image encoding failed.'))), type, quality);
  });
}

/** Normalise any 4:5 image to exactly 1080x1350. */
export async function normalisePoster(file: File): Promise<Blob> {
  const img = await loadImage(file);
  if (img.width === POSTER.width && img.height === POSTER.height) return file;
  const canvas = drawCover(img, POSTER.width, POSTER.height);
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return toBlob(canvas, type, 0.92);
}

/** Generate the 540x675 WebP thumbnail used on every event card. */
export async function generateThumbnail(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = drawCover(img, THUMBNAIL.width, THUMBNAIL.height);
  return toBlob(canvas, THUMBNAIL.format, THUMBNAIL.quality);
}

export const POSTER_SPEC_TEXT = [
  `Size: ${POSTER.width} x ${POSTER.height} px (${POSTER.ratioLabel} portrait)`,
  `Format: JPG, PNG or WebP · under ${POSTER.maxBytes / 1024 / 1024} MB`,
  `Safe area: keep the event name inside the middle 80%, since the card crops slightly on mobile`,
  `Thumbnail: ${THUMBNAIL.width} x ${THUMBNAIL.height} WebP, generated automatically`,
];
