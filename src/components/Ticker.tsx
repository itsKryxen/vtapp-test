import { FEST } from '@/lib/fest';

export default function Ticker() {
  return (
    <div className="relative z-[60] border-b border-black/15 bg-bone light:bg-[#00e5ff]">
      <div className="container-x flex min-h-7 items-center justify-between gap-4 overflow-hidden !px-4 font-mono text-[9px] font-semibold uppercase tracking-label text-ink-950 light:text-[#08080a] sm:!px-8 sm:text-[10px]">
        <span className="whitespace-nowrap">V-TAPP 2026</span>
        <span className="hidden whitespace-nowrap sm:inline">{FEST.dateLabel}</span>
        <span className="whitespace-nowrap">Registration open</span>
      </div>
    </div>
  );
}
