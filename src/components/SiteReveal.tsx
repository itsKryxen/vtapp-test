'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SiteReveal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const firstPath = useRef(pathname);
  const excluded = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const [revealed, setRevealed] = useState(excluded || pathname !== firstPath.current);

  useEffect(() => {
    if (excluded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    const reveal = () => setRevealed(true);
    window.addEventListener('vtapp:splash-exit', reveal);
    window.addEventListener('vtapp:splash-complete', reveal);
    return () => {
      window.removeEventListener('vtapp:splash-exit', reveal);
      window.removeEventListener('vtapp:splash-complete', reveal);
    };
  }, [excluded]);

  return (
    <motion.div
      className="vtapp-site-reveal"
      data-revealed={revealed}
      initial={false}
      animate={{ opacity: revealed ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ minHeight: '100dvh' }}
    >
      {children}
    </motion.div>
  );
}
