import Link from 'next/link';
import { CATEGORIES } from '@/lib/types';
import { schoolAccent } from '@/lib/schools';
import type { EventCardProps } from './types';

export default function PremiumGlowCard({ event, clubName, priority = false, index = 0 }: EventCardProps) {
  const accent = schoolAccent(event.school);
  const category = CATEGORIES.find((item) => item.value === event.category);
  const date = new Date(event.start_at);
  const fee = Number(event.registration_fee);
  const prizePool = Number(event.prize_pool);

  const dateLabel = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
  
  return (
    <div 
      className="group relative flex flex-col h-full bg-ink-950 border border-white/40 hover:border-transparent transition-all duration-500 overflow-hidden rounded-xl"
      style={{ '--card-accent': accent } as React.CSSProperties}
    >
      {/* Glow Effect on Hover */}
      <div 
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-sm"
        style={{ background: `linear-gradient(135deg, ${accent}80, transparent, ${accent}80)` }}
      />
      
      {/* Inner Card Container */}
      <div className="relative flex flex-col flex-1 h-full bg-ink-950 rounded-xl overflow-hidden m-[1px] z-10">
        
        {/* Media Area */}
        <div className="relative h-48 w-full overflow-hidden bg-ink-900 border-b border-white/30">
          {event.thumbnail_url || event.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.thumbnail_url ?? event.poster_url ?? ''}
              alt={`${event.title} poster`}
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-cover opacity-80 saturate-[0.8] transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:saturate-100"
            />
          ) : (
             <div className="w-full h-full bg-[linear-gradient(135deg,rgb(var(--ink-900)),rgb(var(--ink-950)))] flex items-center justify-center">
                <span className="font-mono text-white/20 text-xs">NO VISUAL ASSET</span>
             </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent opacity-80" />
          
          {/* Category Badge overlay */}
          <div className="absolute top-4 left-4 bg-ink-950/80 backdrop-blur-md border border-white/30 px-2 py-1 rounded">
             <span className="font-mono text-[9px] uppercase tracking-wider text-white">
                {category?.label ?? event.category}
             </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-display text-2xl leading-tight text-white group-hover:text-[var(--card-accent)] transition-colors duration-300">
            {event.title}
          </h3>
          
          <div className="mt-auto pt-6 grid grid-cols-2 gap-4">
             <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Date</p>
                <p className="font-mono text-[11px] text-slate-200 mt-1">{dateLabel}</p>
             </div>
             {prizePool > 0 && (
                <div>
                   <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Prize Pool</p>
                   <p className="font-mono text-[11px] text-white mt-1 font-semibold shadow-[var(--card-accent)]">₹{prizePool.toLocaleString('en-IN')}</p>
                </div>
             )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-5 pt-0 mt-2 flex gap-3">
          <Link 
            href={`/events/${event.slug}`}
            className="flex-1 flex items-center justify-center py-2.5 rounded border border-white/30 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:border-white/30 transition-colors duration-200"
          >
            Explore
          </Link>
          <Link 
            href={`/events/${event.slug}`}
            className="flex-1 flex items-center justify-center py-2.5 rounded bg-brand-500 font-mono text-[10px] uppercase tracking-widest text-white shadow-[0_0_15px_rgba(var(--brand-500-rgb),0.5)] hover:shadow-[0_0_20px_rgba(var(--brand-500-rgb),0.8)] transition-all duration-300"
          >
            Register
          </Link>
        </div>
        
      </div>
    </div>
  );
}
