'use client';

import { useVenue } from '@/lib/venueContext';
import type { Gate } from '@/types/venue';

function projectWait(gate: Gate, delay: number): number {
  if (gate.status === 'closed') return -1;
  const base = gate.waitMinutes;
  switch (gate.crowdLevel) {
    case 'critical': return Math.max(1, Math.round(base * 0.8 - delay * 0.3));
    case 'high': return Math.max(1, Math.round(base * 0.85));
    case 'medium': return Math.round(base * 1.05 + delay * 0.2);
    case 'low': return Math.round(base * 1.2 + delay * 0.5);
    default: return base;
  }
}

export default function WhatIfPanel() {
  const { venueState } = useVenue();
  if (!venueState) return null;

  const openGates = Object.values(venueState.gates).filter(g => g.status !== 'closed');
  const sortedNow = [...openGates].sort((a, b) => a.waitMinutes - b.waitMinutes);
  const bestNow = sortedNow[0];

  const delay = 15;
  const projected = openGates
    .map(g => ({ ...g, projected: projectWait(g, delay) }))
    .filter(g => g.projected >= 0)
    .sort((a, b) => a.projected - b.projected);
  const bestLater = projected[0];

  if (!bestNow || !bestLater) return null;

  const nowBetter = bestNow.waitMinutes <= bestLater.projected;

  return (
    <div className="bg-[#111114] border border-[#232328] rounded-xl overflow-hidden shadow-xl">
      <div className="px-8 py-6 border-b border-[#232328] bg-[#0c0c0e]">
        <h3 className="text-[18px] md:text-[20px] font-black text-white">Dynamic Surge Forecast</h3>
        <p className="text-[13px] text-[#71717a] mt-1 font-medium">Predictive model simulation based on live entry telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#232328]">
        <div className={`p-8 md:p-10 ${nowBetter ? 'bg-[#22c55e]/[0.08]' : ''}`}>
          <div className="flex flex-col items-start gap-2 mb-6">
            {nowBetter && <span className="bg-[#22c55e] text-[#0c0c0e] text-[10px] font-black uppercase px-2.5 py-1 tracking-[0.2em] rounded shadow-[0_0_10px_rgba(34,197,94,0.3)]">Optimal Play</span>}
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">Enter Now</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span key={bestNow.waitMinutes} className={`text-[48px] md:text-[56px] font-black tracking-tighter leading-none animate-val-update ${nowBetter ? 'text-[#22c55e]' : 'text-white drop-shadow-md'}`}>
              {bestNow.waitMinutes}
            </span>
            <span className="text-[16px] font-bold text-[#71717a]">min</span>
          </div>
          <p className="text-[18px] font-black text-white">{bestNow.name}</p>
          <p className="text-[13px] font-bold text-[#71717a] mt-1 uppercase tracking-widest">{bestNow.zone} zone</p>
        </div>

        <div className={`p-8 md:p-10 ${!nowBetter ? 'bg-[#ccff00]/[0.05]' : 'bg-[#18181b]'}`}>
          <div className="flex flex-col items-start gap-2 mb-6">
            {!nowBetter && <span className="bg-[#ccff00] text-[#0c0c0e] text-[10px] font-black uppercase px-2.5 py-1 tracking-[0.2em] rounded shadow-[0_0_10px_rgba(204,255,0,0.3)]">Optimal Play</span>}
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">Hold for {delay}m</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span key={bestLater.projected} className={`text-[48px] md:text-[56px] font-black tracking-tighter leading-none animate-val-update ${!nowBetter ? 'text-[#ccff00]' : 'text-[#e4e4e7]'}`}>
              {bestLater.projected}
            </span>
            <span className="text-[16px] font-bold text-[#71717a]">min</span>
          </div>
          <p className="text-[18px] font-black text-white">{bestLater.name}</p>
          <p className="text-[13px] font-bold text-[#71717a] mt-1 uppercase tracking-widest">{bestLater.zone} zone</p>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-[#232328] bg-[#0c0c0e]">
        <p className="text-[15px] font-medium text-[#e4e4e7] flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-white opacity-20 hidden md:block" />
          <span className={nowBetter ? 'text-[#22c55e] font-bold' : 'text-[#ccff00] font-bold'}>Target Locked: </span>
          {nowBetter
            ? `Proceed to ${bestNow.name} immediately for the quickest clearance.`
            : `Hold your position for ${delay} minutes — ${bestLater.name} will experience a crowd drop.`
          }
        </p>
      </div>
    </div>
  );
}
