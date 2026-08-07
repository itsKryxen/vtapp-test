import Link from 'next/link';
import { CATEGORIES } from '@/lib/types';
import { schoolAccent } from '@/lib/schools';
import type { EventCardProps } from './types';

export default function CyberFrameCard({ event, clubName, priority = false, index = 0 }: EventCardProps) {
  const accent = schoolAccent(event.school);
  const category = CATEGORIES.find((item) => item.value === event.category);
  const date = new Date(event.start_at);
  const displayIndex = String(index + 1).padStart(2, '0');
  const prizePool = Number(event.prize_pool);

  const dateLabel = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
  
  // Subtle secondary cyber accents based on type
  const secondaryAccent = event.category === 'gaming' ? '#8b5cf6' : '#06b6d4';
  
  return (
    <div 
      className="group relative flex flex-col h-full bg-ink-950 border border-white/30 hover:border-white/30 transition-all duration-300 overflow-hidden"
      style={{ 
         '--card-accent': accent,
         '--cyber-accent': secondaryAccent
      } as React.CSSProperties}
    >
      {/* Cyber Frame Decorative Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--cyber-accent)] to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--card-accent)] to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Event Number / Header */}
      <div className="flex items-end justify-between px-5 pt-5 pb-3">
         <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--cyber-accent)]">SEQ_NO</span>
            <span className="font-display text-4xl leading-none text-white opacity-80">{displayIndex}</span>
         </div>
         <div className="border border-white/30 px-3 py-1 bg-white/5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-300">
               {category?.label ?? event.category}
            </span>
         </div>
      </div>
      
      {/* Media Overlay Line */}
      <div className="w-full h-px bg-white/10 relative">
         <div className="absolute left-0 top-0 h-full w-12 bg-[var(--cyber-accent)] opacity-50 group-hover:w-24 transition-all duration-700" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 p-5 relative z-10 bg-[linear-gradient(180deg,transparent_0%,rgba(var(--ink-950-rgb),0.5)_100%)]">
        <h3 className="font-display text-2xl leading-tight text-white group-hover:text-[var(--card-accent)] transition-colors duration-300">
          {event.title}
        </h3>
        
        {event.tagline && (
          <p className="mt-3 text-sm text-slate-400 line-clamp-2 leading-relaxed font-mono text-[11px]">
            &gt; {event.tagline}
          </p>
        )}

        <div className="mt-auto pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 border-l-2 border-[var(--cyber-accent)] pl-3 opacity-80">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Date</p>
              <p className="font-mono text-[11px] text-white mt-1">{dateLabel}</p>
            </div>
            {prizePool > 0 && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Prize Pool</p>
                <p className="font-mono text-[11px] text-[var(--cyber-accent)] mt-1">₹{prizePool.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex border-t border-white/30">
        <Link 
          href={`/events/${event.slug}`}
          className="flex-1 flex items-center justify-center py-3 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/5 transition-colors duration-200 border-r border-white/30"
        >
          Explore //
        </Link>
        <Link 
          href={`/events/${event.slug}`}
          className="flex-1 flex items-center justify-center py-3 font-mono text-[10px] uppercase tracking-widest bg-brand-500/10 text-white hover:bg-brand-500 transition-colors duration-200 relative overflow-hidden group/reg"
        >
          <span className="relative z-10">Register_</span>
          <div className="absolute inset-0 bg-brand-500 translate-y-full group-hover/reg:translate-y-0 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}
