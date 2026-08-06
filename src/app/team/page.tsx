import type { Metadata } from 'next';
import { PageHeader } from '@/components/SectionHeader';
import { getTeam } from '@/lib/data';
import { initials, sortDepartments, type TeamMember } from '@/lib/team';
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
    <article className="">
      <div className="panel overflow-hidden transition hover:border-white/25">
        <div className="on-media relative aspect-square w-full overflow-hidden bg-ink-800">
          {member.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photo_url}
              alt={member.name}
              width={512}
              height={512}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-brand-900/50 to-ink-900">
              <span className="font-display display-md text-brand-400">
                {initials(member.name)}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
        </div>

        <div className="p-4">
          <h3 className="font-display text-base font-bold leading-tight text-white">
            {member.name}
          </h3>
          <p className="mt-0.5 text-sm text-brand-400">{member.role}</p>

          {socials.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="chip text-[10px] hover:border-white/30"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
