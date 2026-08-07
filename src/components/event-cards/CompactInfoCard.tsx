import Link from 'next/link';
import { CATEGORIES } from '@/lib/types';
import { schoolAccent } from '@/lib/schools';
import type { EventCardProps } from './types';

export default function CompactInfoCard({ event, clubName, index = 0 }: EventCardProps) {
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
      className="group relative flex flex-col h-full bg-white/[0.02] border border-white/30 hover:border-white/40 transition-all duration-300 overflow-hidden"
      style={{ '--card-accent': accent } as React.CSSProperties}
    >
      <div className="flex flex-1 flex-col p-4 sm:p-5">
         
         {/* Compact Header */}
         <div className="flex items-center gap-3 border-b border-white/30 pb-3 mb-3">
            <span className="font-mono text-xs text-[var(--card-accent)] font-semibold">{displayIndex}</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded-sm">
               {category?.label ?? event.category}
            </span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--card-accent)] opacity-50 group-hover:opacity-100 transition-opacity" />
         </div>
         
         {/* Title & Tagline */}
         <h3 className="font-display text-xl leading-tight text-white group-hover:text-[var(--card-accent)] transition-colors duration-300">
            {event.title}
         </h3>
         
         {event.tagline && (
            <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-snug">
               {event.tagline}
            </p>
         )}

         {/* Compact Metadata Blocks */}
         <div className="mt-auto pt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/40 pt-2">
               <span className="text-slate-500 uppercase tracking-wide">Date</span>
               <span className="text-slate-200">{dateLabel}</span>
            </div>
            
            {prizePool > 0 && (
               <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/40 pt-2">
                  <span className="text-slate-500 uppercase tracking-wide">Prize</span>
                  <span className="text-[var(--card-accent)]">₹{prizePool.toLocaleString('en-IN')}</span>
               </div>
            )}
            
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/40 pt-2">
               <span className="text-slate-500 uppercase tracking-wide">Fee</span>
               <span className="text-slate-200">{fee === 0 ? 'Free' : `₹${fee.toLocaleString('en-IN')}`}</span>
            </div>
         </div>
      </div>

      {/* Action Footer */}
      <div className="grid grid-cols-2 border-t border-white/30 bg-black/20">
        <Link 
          href={`/events/${event.slug}`}
          className="flex items-center justify-center py-2.5 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200 border-r border-white/30"
        >
          Explore
        </Link>
        <Link 
          href={`/events/${event.slug}`}
          className="flex items-center justify-center py-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--card-accent)] hover:bg-[var(--card-accent)] hover:text-white transition-colors duration-200"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
