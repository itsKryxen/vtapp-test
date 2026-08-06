import { FEST } from '@/lib/fest';

type SocialName = 'instagram' | 'linkedin' | 'youtube' | 'x' | 'facebook' | 'discord' | 'whatsapp';

type SocialLink = {
  href: string;
  label: string;
  name: SocialName;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { href: FEST.instagram, label: 'Instagram', name: 'instagram' },
  { href: 'https://www.linkedin.com/company/vtaap-2022', label: 'LinkedIn', name: 'linkedin' },
  { href: 'https://www.youtube.com', label: 'YouTube', name: 'youtube' },
  { href: 'https://x.com/VTAPP22', label: 'X', name: 'x' },
  { href: 'https://www.facebook.com/vtapp.vitap/', label: 'Facebook', name: 'facebook' },
  { href: 'https://discord.gg/RVZrqkAp', label: 'Discord', name: 'discord' },
  { href: 'https://www.whatsapp.com', label: 'WhatsApp', name: 'whatsapp' },
];

function SocialIcon({ name }: { name: SocialName }) {
  const common = {
    className: 'h-[22px] w-[22px]',
    viewBox: '0 0 24 24',
    role: 'presentation',
    'aria-hidden': true,
  } as const;

  switch (name) {
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.1" y="3.1" width="17.8" height="17.8" rx="5" />
          <circle cx="12" cy="12" r="4.15" />
          <circle cx="17.45" cy="6.65" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common} fill="currentColor">
          <path d="M5.35 7.65H2.1V21h3.25V7.65ZM3.72 2A1.9 1.9 0 1 0 3.7 5.8 1.9 1.9 0 0 0 3.72 2ZM21.9 13.35c0-4.02-2.15-5.9-5.02-5.9a4.34 4.34 0 0 0-3.93 2.16V7.65H9.7V21h3.25v-6.6c0-1.74.33-3.43 2.49-3.43 2.13 0 2.16 1.99 2.16 3.55V21h3.25l1.05-7.65Z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common} fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29.1 29.1 0 0 0 1 12a29.1 29.1 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29.1 29.1 0 0 0 23 12a29.1 29.1 0 0 0-.46-5.58ZM9.75 15.5v-7L15.5 12l-5.75 3.5Z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common} fill="currentColor">
          <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.25-8.29L2.97 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.43 4.05H6.58L17.8 19.84Z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...common} fill="currentColor">
          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
        </svg>
      );
    case 'discord':
      return (
        <svg {...common} fill="currentColor">
          <path d="M19.54 5.34A16.4 16.4 0 0 0 15.44 4l-.5 1.02a15.3 15.3 0 0 0-5.86 0L8.56 4a16.5 16.5 0 0 0-4.1 1.35C1.87 9.23 1.17 13.01 1.52 16.74a16.6 16.6 0 0 0 5.03 2.54l1.23-1.68c-.68-.26-1.33-.58-1.95-.96l.48-.37c3.77 1.76 7.87 1.76 11.6 0l.48.37c-.62.38-1.28.71-1.96.97l1.23 1.67a16.5 16.5 0 0 0 5.02-2.54c.41-4.32-.7-8.06-3.14-11.4ZM8.62 14.47c-1.13 0-2.06-1.05-2.06-2.34 0-1.3.91-2.35 2.06-2.35 1.16 0 2.09 1.06 2.07 2.35 0 1.29-.91 2.34-2.07 2.34Zm6.77 0c-1.14 0-2.06-1.05-2.06-2.34 0-1.3.9-2.35 2.06-2.35 1.15 0 2.08 1.06 2.06 2.35 0 1.29-.9 2.34-2.06 2.34Z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...common} fill="currentColor">
          <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.1.55 4.14 1.59 5.94L.1 24l6.32-1.66a11.87 11.87 0 0 0 5.66 1.44h.01c6.55 0 11.88-5.33 11.88-11.89a11.8 11.8 0 0 0-3.45-8.41Zm-8.44 18.29a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.75.98 1-3.65-.23-.38a9.82 9.82 0 0 1-1.51-5.26c0-5.44 4.43-9.86 9.87-9.86a9.8 9.8 0 0 1 6.98 2.89 9.8 9.8 0 0 1 2.88 6.99c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.39c-.3-.15-1.75-.87-2.02-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.56-.35Z" />
        </svg>
      );
  }
}

export function SocialLinks({ placement }: { placement: 'rail' | 'footer' }) {
  return (
    <div className={placement === 'rail' ? 'social-rail-links' : 'footer-social-links'}>
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${social.label} (opens in a new tab)`}
          className="social-link"
        >
          <SocialIcon name={social.name} />
        </a>
      ))}
    </div>
  );
}

export function SocialRail() {
  return (
    <aside className="social-rail" aria-label="Social media links">
      <SocialLinks placement="rail" />
    </aside>
  );
}
