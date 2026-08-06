/**
 * Core team model and photo spec.
 *
 * Departments are free text so the core team can invent new ones without a
 * migration. DEFAULT_DEPARTMENTS is only the dropdown's starting list, and
 * DEPARTMENT_ORDER controls how the public page stacks them; anything not in
 * that list falls to the bottom, alphabetically.
 */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  photo_url: string | null;
  email: string | null;
  linkedin: string | null;
  instagram: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_DEPARTMENTS = [
  'Leadership',
  'Core',
  'Technical',
  'Events',
  'Sponsorship',
  'Design',
  'Marketing',
  'Operations',
  'Hospitality',
  'Media',
  'Finance',
] as const;

export const DEPARTMENT_ORDER: string[] = [...DEFAULT_DEPARTMENTS];

export function sortDepartments(departments: string[]): string[] {
  return [...departments].sort((a, b) => {
    const ia = DEPARTMENT_ORDER.indexOf(a);
    const ib = DEPARTMENT_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

/** Initials fallback when a member has no photo yet. */
export function initials(name: string): string {
  return name
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/* ------------------------------------------------------------------ */
/* Photo spec                                                          */
/* ------------------------------------------------------------------ */

/**
 * Square headshots, centre-cropped. 512px covers a retina 256px render, which
 * is bigger than the card ever needs, so nobody's face goes soft.
 */
export const TEAM_PHOTO = {
  size: 512,
  maxBytes: 3 * 1024 * 1024, // 3 MB, since these come straight off phones
  minSize: 200,
  accept: ['image/jpeg', 'image/png', 'image/webp'],
  acceptAttr: 'image/jpeg,image/png,image/webp',
  quality: 0.86,
} as const;

export function checkPhotoFile(file: File): string | null {
  if (!TEAM_PHOTO.accept.includes(file.type as (typeof TEAM_PHOTO.accept)[number])) {
    return 'Photo must be a JPG, PNG or WebP file.';
  }
  if (file.size > TEAM_PHOTO.maxBytes) {
    return `Photo must be under ${TEAM_PHOTO.maxBytes / 1024 / 1024} MB (yours is ${(
      file.size /
      1024 /
      1024
    ).toFixed(1)} MB).`;
  }
  return null;
}

/** Browser-only: centre-crop to square and resize to 512x512 WebP. */
export async function normalisePhoto(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Could not read that image file.'));
      i.src = url;
    });

    if (Math.min(img.width, img.height) < TEAM_PHOTO.minSize) {
      throw new Error(
        `Photo is too small (${img.width}x${img.height}). Minimum ${TEAM_PHOTO.minSize}px on the short side.`
      );
    }

    const S = TEAM_PHOTO.size;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available in this browser.');
    ctx.imageSmoothingQuality = 'high';

    const side = Math.min(img.width, img.height);
    // Crop slightly above centre; faces sit in the top half of most photos.
    const sx = (img.width - side) / 2;
    const sy = Math.max(0, (img.height - side) / 2 - side * 0.06);
    ctx.drawImage(img, sx, sy, side, side, 0, 0, S, S);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Image encoding failed.'))),
        'image/webp',
        TEAM_PHOTO.quality
      );
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function teamPhotoPath(memberId: string): string {
  return `team/${memberId}.webp`;
}
