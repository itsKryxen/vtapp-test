/**
 * Every section on the site opens the same way:
 *
 *   [03] / EVENTS ─────────────────────────────  12 INDEXED
 *   Featured events
 *
 * A mono index tag, the section slug, a hairline rule that runs to the edge,
 * an optional right-aligned count, then the light display heading underneath.
 */

interface Props {
  /** Two-digit index, e.g. "03". */
  index: string;
  /** Short uppercase slug, e.g. "EVENTS". */
  slug: string;
  /** The human heading. Accepts nodes so pages can interpolate values. */
  title: React.ReactNode;
  /** Optional supporting sentence. Accepts nodes for the same reason. */
  description?: React.ReactNode;
  /** Optional right-aligned readout, e.g. "12 INDEXED". */
  meta?: string;
  /** Optional right-hand slot, usually a link. */
  action?: React.ReactNode;
}

export default function SectionHeader({
  index,
  slug,
  title,
  description,
  meta,
  action,
}: Props) {
  return (
    <header className="section-header mb-10">
      <div className="flex items-center gap-4">
        <span className="tag-index shrink-0">[{index}]</span>
        <span className="mono-label shrink-0 text-slate-400">{slug}</span>
        <span className="h-px flex-1 bg-white/10" />
        {meta && <span className="mono-label shrink-0">{meta}</span>}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display-md">{title}</h2>
          {description && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">{description}</p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}

/** Page-level header, the larger variant used at the top of each route. */
export function PageHeader({
  index,
  slug,
  title,
  description,
  meta,
}: Omit<Props, 'action'>) {
  return (
    <header className="page-header mb-12">
      <div className="flex items-center gap-4">
        <span className="tag-index shrink-0">[{index}]</span>
        <span className="mono-label shrink-0 text-slate-400">{slug}</span>
        <span className="h-px flex-1 bg-white/10" />
        {meta && <span className="mono-label shrink-0">{meta}</span>}
      </div>

      <h1 className="display-lg mt-6">{title}</h1>

      {description && (
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
      )}
    </header>
  );
}
