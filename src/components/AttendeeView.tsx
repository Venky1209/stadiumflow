'use client';

import { useState, useCallback, useEffect } from 'react';
import { useVenue } from '@/lib/venueContext';
import WaitTimeCard from './WaitTimeCard';
import WhatIfPanel from './WhatIfPanel';
import SmartAssistant from './SmartAssistant';
import type { Gate } from '@/types/venue';

const SECTIONS = [
  { id: '100s', label: 'Section 100s (Lower Bowl)', zone: 'north' },
  { id: '200s', label: 'Section 200s (Club Level)', zone: 'east' },
  { id: '300s', label: 'Section 300s (Upper Bowl)', zone: 'south' },
  { id: 'vip', label: 'VIP & Executive Suites', zone: 'west' },
  { id: 'ga', label: 'General Admission / Pitch', zone: 'north' },
];

export default function AttendeeView() {
  const { venueState } = useVenue();
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0].id);
  const [mapGate, setMapGate] = useState<Gate | null>(null);
  const [routeResult, setRouteResult] = useState<{ gate: Gate; phase: 'scanning' | 'found' } | null>(null);
  const [liveTick, setLiveTick] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setLiveTick(prev => !prev), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRouteMe = useCallback(() => {
    if (!venueState) return;
    const openGates = Object.values(venueState.gates).filter(g => g.status !== 'closed');
    if (openGates.length === 0) return;

    const matchedZone = SECTIONS.find(s => s.id === selectedSection)?.zone || 'north';
    setRouteResult({ gate: openGates[0], phase: 'scanning' });

    setTimeout(() => {
      const bestGate = openGates
        .filter(g => g.zone.toLowerCase() === matchedZone)
        .sort((a, b) => a.waitMinutes - b.waitMinutes)[0]
        || openGates.sort((a, b) => a.waitMinutes - b.waitMinutes)[0];
        
      setRouteResult({ gate: bestGate, phase: 'found' });
    }, 1200);
  }, [venueState, selectedSection]);

  if (!venueState) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-8">
          <div className="w-16 h-16 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[16px] font-semibold text-[#a1a1aa]">Establishing connection...</p>
        </div>
      </div>
    );
  }

  const gates = Object.values(venueState.gates);
  const openGates = gates.filter(g => g.status !== 'closed');
  const sortedGates = [...gates].sort((a, b) => {
    if (a.status === 'closed' && b.status !== 'closed') return 1;
    if (a.status !== 'closed' && b.status === 'closed') return -1;
    return a.waitMinutes - b.waitMinutes;
  });
  const shortestWaitId = openGates.length > 0
    ? openGates.reduce((min, g) => g.waitMinutes < min.waitMinutes ? g : min).id
    : null;
  const bestGate = openGates.length > 0
    ? openGates.reduce((min, g) => g.waitMinutes < min.waitMinutes ? g : min)
    : null;
  const avgWait = openGates.length > 0
    ? Math.round(openGates.reduce((s, g) => s + g.waitMinutes, 0) / openGates.length)
    : 0;

  return (
    <div className="w-full flex flex-col gap-12 lg:gap-16 pb-32 relative px-2 sm:px-4">

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Optimal Entry', value: bestGate?.name || '—', color: '#22c55e' },
          { label: 'Minimum Wait', value: `${bestGate?.waitMinutes || 0}`, unit: 'min', color: '#e4e4e7' },
          { label: 'Average Time', value: `${avgWait}`, unit: 'min', color: '#a1a1aa' },
          { label: 'Active Portals', value: `${openGates.length}`, unit: `/ ${gates.length}`, color: '#e4e4e7' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111114] border border-[#232328] rounded-xl p-8 relative overflow-hidden shadow-2xl shadow-black/50">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#71717a] mb-3">{stat.label}</p>
            <p className="text-[22px] lg:text-[28px] xl:text-[32px] font-black leading-tight tracking-tight flex items-baseline gap-2 flex-wrap" style={{ color: stat.color }}>
              <span key={stat.value} className="break-words max-w-full animate-val-update">{stat.value}</span>
              {stat.unit && <span className="text-[13px] font-bold text-[#52525b]">{stat.unit}</span>}
            </p>
            {liveTick && <div className="absolute inset-0 bg-white opacity-[0.02] animate-pulse pointer-events-none" />}
          </div>
        ))}
      </div>

      {/* ── Route Finder ── */}
      <div className="bg-[#18181b] border border-[#27272a] border-l-[4px] border-l-[#ccff00] rounded-xl p-8 lg:p-10 shadow-2xl shadow-black/50 relative overflow-visible flex flex-col">
        
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8 relative z-10 w-full mb-6">
          <div className="flex flex-col gap-3 min-h-fit">
            <h2 className="text-[24px] md:text-[28px] font-black text-white leading-normal m-0">
              Locate Your Fastest Entrance
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#a1a1aa] font-medium leading-relaxed m-0 block">
              Select your seating tier below. The AI will instantly plot the most efficient path.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full xl:w-auto mt-4 xl:mt-0 shrink-0">
            <div className="relative flex-1 sm:w-[400px]">
              <select
                value={selectedSection}
                onChange={(e) => { setSelectedSection(e.target.value); setRouteResult(null); }}
                className="w-full h-[64px] px-6 pr-12 bg-[#0c0c0e] border border-[#3f3f46] rounded-lg text-[16px] font-semibold text-white focus:outline-none focus:border-[#ccff00] transition-colors appearance-none cursor-pointer shadow-inner"
              >
                {SECTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717a]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            
            <button
              onClick={handleRouteMe}
              className="h-[64px] px-10 bg-[#ccff00] text-[#0c0c0e] text-[16px] font-black rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] whitespace-nowrap active:scale-95"
            >
              Analyze Route
            </button>
          </div>
        </div>

        {routeResult && (
          <div className="mt-10 pt-10 border-t border-[#27272a] relative z-10 flex-shrink-0 min-h-[150px]">
            {routeResult.phase === 'scanning' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 border-2 border-[#ccff00] border-r-transparent rounded-full animate-spin" />
                  <span className="text-[16px] font-bold text-[#ccff00]">Computing optimal path for {SECTIONS.find(s=>s.id === selectedSection)?.label}...</span>
                </div>
                <div className="h-2 bg-[#0c0c0e] rounded-full overflow-hidden border border-[#27272a]">
                  <div className="h-full bg-[#ccff00] rounded-full shadow-[0_0_10px_#ccff00]" style={{ animation: 'route-scan 1.2s ease-in-out' }} />
                </div>
              </div>
            ) : (
              <div className="animate-slide-up flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl p-8">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-[#22c55e] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_#22c55e]" />
                    Optimized Route Locked
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="text-[32px] md:text-[40px] font-black text-white leading-none">{routeResult.gate.name}</p>
                    <span className="px-4 py-1.5 bg-[#22c55e] text-[#0c0c0e] text-[14px] font-black uppercase rounded-md shadow-lg shadow-[#22c55e]/20">
                      {routeResult.gate.waitMinutes} min wait
                    </span>
                  </div>
                  <p className="text-[15px] font-medium text-[#a1a1aa] mt-2">Recommended access point for {SECTIONS.find(s=>s.id === selectedSection)?.label}</p>
                </div>
                <button
                  onClick={() => setMapGate(routeResult.gate)}
                  className="h-[56px] px-10 bg-[#22c55e] text-[#0c0c0e] text-[16px] font-black rounded-lg hover:bg-[#16a34a] transition-colors whitespace-nowrap shadow-xl shadow-[#22c55e]/20 active:scale-95"
                >
                  View Directions
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Main Full Width Grid ── */}
      <div className="flex flex-col gap-12 lg:gap-16">
        <WhatIfPanel />

        <div className="bg-[#111114] border border-[#232328] rounded-xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-[#232328] gap-6">
            <div>
              <h3 className="text-[24px] font-black text-white flex items-center gap-3">
                Live Gate Telemetry
                {liveTick && <span className="w-2 h-2 rounded-full bg-[#ccff00] shadow-[0_0_8px_#ccff00]" />}
              </h3>
              <p className="text-[14px] text-[#71717a] font-medium mt-1">Real-time throughput data streams from security checkpoints</p>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-bold text-[#a1a1aa] flex-wrap mt-4 sm:mt-0">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#22c55e]" /> Minimal Wait</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Moderate</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f97316]" /> Busy</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ef4444]" /> Critical Flow</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedGates.map((gate) => (
              <WaitTimeCard
                key={gate.id}
                gate={gate}
                isShortestWait={gate.id === shortestWaitId}
                onRouteClick={setMapGate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Smart Assistant Widget */}
      <SmartAssistant />

      {/* ── Map Modal ── */}
      {mapGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6" onClick={() => setMapGate(null)}>
          <div className="w-full max-w-4xl bg-[#111114] border border-[#27272a] rounded-xl overflow-hidden animate-slide-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-8 border-b border-[#27272a] bg-[#0c0c0e]">
              <div>
                <h3 className="text-[28px] font-black text-white">Navigation to {mapGate.name}</h3>
                <p className="text-[16px] font-medium text-[#a1a1aa] mt-1">
                  Live processing speed: <span className="text-[#22c55e] font-bold">{mapGate.waitMinutes} min clearance</span>
                </p>
              </div>
              <button
                onClick={() => setMapGate(null)}
                className="w-14 h-14 bg-[#18181b] border border-[#3f3f46] rounded-full text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-all flex items-center justify-center shadow-lg"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="w-full aspect-[21/9] bg-[#000]">
              <iframe
                title={`Route to ${mapGate.name}`}
                className="w-full h-full border-0"
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'YOUR_KEY'}&q=MetLife+Stadium+Gate+${mapGate.name.split(' ').pop()}&zoom=16`}
              />
            </div>
            <div className="p-8 border-t border-[#27272a] flex justify-between items-center bg-[#0c0c0e]">
              <div className="hidden sm:block">
                <p className="text-[14px] font-bold text-[#e4e4e7]">GPS Routing Active</p>
                <p className="text-[13px] text-[#71717a] mt-0.5">Powered by Google Maps Platform</p>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=MetLife+Stadium+Gate+${mapGate.name.split(' ').pop()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-[56px] px-10 bg-[#ccff00] text-[#0c0c0e] text-[16px] font-black rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.15)]"
              >
                Launch Maps App
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
