import Link from 'next/link';
import { CATEGORIES } from '@/lib/types';
import { schoolAccent } from '@/lib/schools';
import type { EventCardProps } from './types';

export default function MinimalTechCard({ event, clubName, index = 0 }: EventCardProps) {
  const accent = schoolAccent(event.school);
  const category = CATEGORIES.find((item) => item.value === event.category);
  const date = new Date(event.start_at);
  const displayIndex = String(index + 1).padStart(2, '0');
  const fee = Number(event.registration_fee);
  const prizePool = Number(event.prize_pool);

  const dateLabel = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
  
  return (
    <div 
      className="group relative flex flex-col h-full bg-white/5 border border-white/30 hover:border-white/25 transition-all duration-300 overflow-hidden"
      style={{ '--card-accent': accent } as React.CSSProperties}
    >
      {/* Schematic overlay lines */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      {/* Top Header */}
      <div className="flex items-center px-4 py-2 border-b border-white/30 relative z-10 bg-ink-950/80">
        <span className="font-mono text-[10px] text-[var(--card-accent)]">[{displayIndex}]</span>
        <span className="ml-3 font-mono text-[9px] uppercase tracking-widest text-slate-400">
          {category?.label ?? event.category}
        </span>
        <div className="ml-auto flex gap-1">
           <div className="w-1 h-1 bg-[var(--card-accent)] opacity-80" />
           <div className="w-1 h-1 bg-white/20" />
           <div className="w-1 h-1 bg-white/20" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 p-5 relative z-10 bg-ink-950/40">
        <h3 className="font-display text-2xl leading-tight text-white group-hover:text-[var(--card-accent)] transition-colors duration-300">
          {event.title}
        </h3>
        
        {event.tagline && (
          <p className="mt-3 text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {event.tagline}
          </p>
        )}

        <div className="mt-auto pt-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Date</p>
              <p className="font-mono text-[11px] text-slate-200 mt-1">{dateLabel}</p>
            </div>
            {prizePool > 0 && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Prize Pool</p>
                <p className="font-mono text-[11px] text-slate-200 mt-1">₹{prizePool.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="grid grid-cols-2 border-t border-white/30 relative z-10 bg-ink-950/80">
        <Link 
          href={`/events/${event.slug}`}
          className="flex items-center justify-center py-3 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:bg-[var(--card-accent)] hover:text-white transition-colors duration-200 border-r border-white/30 group/explore"
        >
          Explore <span className="ml-1 opacity-0 -translate-x-2 group-hover/explore:opacity-100 group-hover/explore:translate-x-0 transition-all duration-300">→</span>
        </Link>
        <Link 
          href={`/events/${event.slug}`}
          className="flex items-center justify-center py-3 font-mono text-[10px] uppercase tracking-widest bg-brand-500 text-black hover:bg-brand-400 transition-colors duration-200 group/reg"
        >
          Register <span className="ml-1 opacity-0 translate-y-1 group-hover/reg:opacity-100 group-hover/reg:translate-y-0 transition-all duration-300">↗</span>
        </Link>
      </div>
      
      {/* Accent corner */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--card-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-1 -mt-1 pointer-events-none" />
    </div>
  );
}
