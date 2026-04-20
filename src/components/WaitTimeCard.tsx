'use client';

import type { Gate } from '@/types/venue';

interface WaitTimeCardProps {
  gate: Gate;
  isShortestWait?: boolean;
  onRouteClick?: (gate: Gate) => void;
}

const CROWD_CONFIG: Record<string, { color: string; bg: string; label: string; bgStroke: string }> = {
  low:      { color: '#22c55e', bg: 'rgba(34,197,94,0.04)',  label: 'Minimal Wait', bgStroke: 'rgba(34,197,94,0.1)' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.04)', label: 'Moderate', bgStroke: 'rgba(245,158,11,0.1)' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.04)', label: 'Busy Flow', bgStroke: 'rgba(249,115,22,0.1)' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.04)',  label: 'Critical Peak', bgStroke: 'rgba(239,68,68,0.1)' },
};

// Abstract stadium geometry background
function GateBackgroundSVG({ color, strokeColor }: { color: string, strokeColor: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" preserveAspectRatio="none" viewBox="0 0 400 250">
      <path d="M-50,250 C100,50 300,150 450,250" fill={color} />
      <path d="M-50,250 C150,100 250,50 450,250" fill="none" stroke={strokeColor} strokeWidth="1" />
      <path d="M-50,250 C50,150 350,100 450,250" fill="none" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="4 4" />
      <circle cx="150" cy="120" r="3" fill={strokeColor} className="animate-pulse" />
      <circle cx="280" cy="80" r="2" fill={strokeColor} className="animate-pulse" style={{ animationDelay: '1s' }} />
    </svg>
  );
}

export default function WaitTimeCard({ gate, isShortestWait, onRouteClick }: WaitTimeCardProps) {
  const isClosed = gate.status === 'closed';
  const crowd = CROWD_CONFIG[gate.crowdLevel] || CROWD_CONFIG.low;

  return (
    <button
      onClick={() => onRouteClick && !isClosed && onRouteClick(gate)}
      disabled={isClosed}
      className={`
        group relative w-full text-left rounded-xl transition-all duration-300 overflow-hidden outline-none
        ${isClosed
          ? 'opacity-50 cursor-not-allowed border border-[#27272a]'
          : isShortestWait
            ? 'border-2 border-[#22c55e] shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(34,197,94,0.2)]'
            : `border border-[#27272a] hover:border-[${crowd.color}] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]`
        }
      `}
    >
      <div
        className={`relative z-10 p-6 xl:p-8 h-full flex flex-col justify-between min-h-[240px] transition-all duration-300
          ${isClosed ? 'bg-[#0c0c0e]' : 'bg-[#18181b]'}`
        }
        style={!isClosed ? { backgroundColor: crowd.bg } : undefined}
      >
        {!isClosed && <GateBackgroundSVG color={crowd.bg} strokeColor={crowd.bgStroke} />}
        
        {/* Recommended Badge */}
        {isShortestWait && !isClosed && (
          <div className="bg-[#22c55e] text-[#0c0c0e] text-[11px] font-black py-2 px-3 uppercase tracking-[0.2em] w-max rounded-md shadow-[0_2px_10px_rgba(34,197,94,0.3)] relative z-20 mb-4 sm:mb-6">
            Optimal Access Point
          </div>
        )}

        {/* Top Row */}
        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10 w-full">
          <div className="flex-1 min-w-[120px]">
            <h3 className="text-[20px] md:text-[24px] font-black text-white tracking-tight leading-tight">{gate.name}</h3>
            <p className="text-[13px] text-[#a1a1aa] font-bold mt-1 uppercase tracking-widest">{gate.zone} ZONE</p>
          </div>
          {!isClosed && (
            <span
              className="shrink-0 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-sm"
              style={{ color: crowd.color, backgroundColor: `${crowd.bgStroke}` }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: crowd.color }} />
              {crowd.label}
            </span>
          )}
        </div>

        {/* Bottom Row */}
        <div className="flex items-end justify-between mt-auto pt-8 relative z-10">
          {isClosed ? (
            <span className="text-[16px] font-black text-[#ef4444] uppercase tracking-widest">Access Restricted</span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span key={gate.waitMinutes} className="text-[48px] xl:text-[56px] font-black tracking-tighter leading-none text-white drop-shadow-md animate-val-update">
                {gate.waitMinutes}
              </span>
              <span className="text-[16px] font-bold text-[#71717a]">min</span>
            </div>
          )}

          {!isClosed && (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#111114] border border-[#27272a] text-[#71717a] group-hover:bg-[#ccff00] group-hover:text-black group-hover:border-[#ccff00] transition-colors shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
