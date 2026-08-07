import type { Metadata } from 'next';
import { PageHeader } from '@/components/SectionHeader';
import { getTeam } from '@/lib/data';
import { sortDepartments, type TeamMember } from '@/lib/team';
import { FEST } from '@/lib/fest';

export const metadata: Metadata = {
  title: 'Team',
  description: `The students running ${FEST.name} at ${FEST.university}.`,
};

export const revalidate = 300;

export default async function TeamPage() {
  const team = await getTeam();

  const departments = sortDepartments([...new Set(team.map((m) => m.department))]);
  const grouped = departments.map((d) => ({
    department: d,
    members: team.filter((m) => m.department === d),
  }));

  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader
        index="07"
        slug="TEAM"
        title={<>Team</>}
        description={<>{FEST.name} is brought to life by the combined efforts of our students and faculty. These are the people putting in the late nights so that two days in September go off without a hitch.</>}
      />

      {team.length === 0 ? (
        <div className="panel mt-14 p-16 text-center">
          <p className="font-display text-xl font-light text-white">Team announced soon</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            The core team for this edition is being finalised.
          </p>
        </div>
      ) : (
        <div className="mt-14 space-y-16">
          {grouped.map(({ department, members }) => (
            <section key={department}>
              <div className="mb-6 flex items-center gap-4">
                <h2 className="font-display display-md tracking-tight text-white">
                  {department}
                </h2>
                <span className="h-px flex-1 bg-gradient-to-r from-brand-600/60 to-transparent" />
                <span className="text-xs text-slate-500">
                  {members.length} member{members.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {members.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const socials = [
    member.email ? { label: 'Email', href: `mailto:${member.email}` } : null,
    member.linkedin ? { label: 'LinkedIn', href: member.linkedin } : null,
    member.instagram
      ? {
          label: 'Instagram',
          href: member.instagram.startsWith('http')
            ? member.instagram
            : `https://instagram.com/${member.instagram.replace(/^@/, '')}`,
        }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article className="team-member-card group">
      {/* Laser scanner line effect */}
      <div className="team-member-scanner-line" aria-hidden="true" />

      {/* HUD Corner accents */}
      <div className="team-member-hud-accent-tl" aria-hidden="true" />
      <div className="team-member-hud-accent-tr" aria-hidden="true" />

      {/* Portrait Image container */}
      <div className="team-member-portrait-container">
        {/* VIT-AP University Watermark behind portrait */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/vit-ap-university-logo.png"
          alt=""
          className="team-member-watermark"
          aria-hidden="true"
        />

        {member.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo_url}
            alt={member.name}
            width={512}
            height={512}
            loading="lazy"
            decoding="async"
            className="team-member-portrait"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[var(--cd-number)] relative z-10">
            <svg className="w-16 h-16 opacity-30 text-current" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="35" r="18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
              <path d="M25 80 C 25 60, 35 55, 50 55 C 65 55, 75 60, 75 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="50" cy="35" r="6" fill="currentColor" />
              <line x1="50" y1="5" x2="50" y2="17" stroke="currentColor" strokeWidth="1.5" />
              <line x1="50" y1="83" x2="50" y2="95" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="2 4" />
            </svg>
          </div>
        )}
      </div>

      {/* Thin futuristic divider ────────●──────── */}
      <div className="team-member-divider" aria-hidden="true">
        <span className="team-member-divider-node" />
      </div>

      {/* Details/Info section (middle) */}
      <div className="team-member-info">
        <h3 className="team-member-name">
          {member.name}
        </h3>

        {/* Leadership pill badge under the name */}
        <div className="team-member-badge-container">
          <span className="team-member-badge">
            <svg className="w-3 h-3 text-current inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {member.department}
          </span>
        </div>

        {/* Social Links */}
        {socials.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 z-20 relative">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="chip text-[9px] hover:border-[var(--cd-border-hover)]"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Dedicated bottom panel strip (Designation) */}
      <div className="team-member-designation-panel">
        <span className="team-member-designation-text">
          {member.role}
        </span>
      </div>
    </article>
  );
}
