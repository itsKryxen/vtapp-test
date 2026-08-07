import Image from 'next/image';
import Link from 'next/link';
import newLogo from '../../public/downloaded-logo.png';

/**
 * The V-TAPP mark and wordmark.
 */
export function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src={newLogo}
      alt=""
      style={{ width: size, height: 'auto' }}
      priority
      className={`object-contain ${className}`}
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
    <>
      <Image
        src={newLogo}
        alt="V-TAPP: Celebrate Technology!"
        style={{ width: width, height: 'auto' }}
        priority={priority}
        className={`${className} theme-image-on-dark object-contain`}
      />
      <Image
        src={newLogo}
        alt="V-TAPP: Celebrate Technology!"
        style={{ width: width, height: 'auto' }}
        priority={priority}
        className={`${className} theme-image-on-light object-contain`}
      />
    </>
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
