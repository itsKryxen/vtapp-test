import Image from 'next/image';
import Link from 'next/link';

/**
 * The V-TAPP mark and wordmark.
 *
 * `variant="mark"` , just the crimson triangle (navbar, tight spaces)
 * `variant="full"` , the full logo lockup (hero, footer, login)
 *
 * Both use the background-knocked-out versions, so the logo sits on the page
 * gradient rather than carrying its own black box. The opaque originals
 * (vtapp-logo.png / vtapp-mark.png) are kept for the favicon and OG card,
 * where a solid background is wanted.
 */
export function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/vtapp-mark-transparent.png"
      alt=""
      width={size}
      height={size}
      priority
      className={className}
    />
  );
}

export function LogoLockup({
  width = 420,
  className = '',
  priority = false,
}: {
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/vtapp-circuit-logo.svg"
      alt="V-TAPP: Celebrate Technology!"
      width={width}
      height={Math.round((width * 256) / 974)}
      priority={priority}
      className={className}
    />
  );
}

/** Navbar lockup: mark + wordmark, links home. */
export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="V-TAPP 2026 home">
      <span className="relative transition-transform duration-300 group-hover:scale-105">
        <LogoMark size={36} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-white">
        V-TAPP <span className="text-brand-500">2026</span>
      </span>
    </Link>
  );
}
