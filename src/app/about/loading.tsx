import { LoadShell, LoadStatus, Skel, SkelText } from '@/components/Loading';

export default function Loading() {
  return (
    <LoadShell index="08" slug="ABOUT">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-10">
          <SkelText lines={5} />
          <SkelText lines={4} />
        </div>

        <div className="grid gap-px border border-white/[0.08] bg-white/[0.08]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-6 bg-ink-950 p-5">
              <Skel delay={(i % 3) as 0 | 1 | 2} className="h-3 w-24" />
              <Skel delay={(i % 3) as 0 | 1 | 2} className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      <LoadStatus label="Loading fest record" />
    </LoadShell>
  );
}
