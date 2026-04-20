'use client';

import { useVenue } from '@/lib/venueContext';
import { useEffect, useState } from 'react';

function zoneColor(pct: number): string {
  if (pct <= 30) return '#00ff66';
  if (pct <= 55) return '#ccff00';
  if (pct <= 75) return '#ffaa00';
  return '#ff0033';
}

export default function HeatmapGrid() {
  const { venueState } = useVenue();
  const [scanOffset, setScanOffset] = useState(0);
  const [uptimeTag, setUptimeTag] = useState('000000');

  // Add a slight jitter for the "live data stream" effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanOffset(Math.floor(Math.random() * 5));
      setUptimeTag(Date.now().toString().slice(-6));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  if (!venueState) return null;

  const zones = Object.values(venueState.zones);
  const north = zones.find((z) => z.id === 'north');
  const south = zones.find((z) => z.id === 'south');
  const east = zones.find((z) => z.id === 'east');
  const west = zones.find((z) => z.id === 'west');

  const zoneData = [
    { zone: north, label: 'N-SEC', x: 150, y: 48 },
    { zone: south, label: 'S-SEC', x: 150, y: 352 },
    { zone: west, label: 'W-SEC', x: 42, y: 200 },
    { zone: east, label: 'E-SEC', x: 258, y: 200 },
  ];

  const gatePositions = [
    { x: 112, y: 28 }, { x: 188, y: 28 },
    { x: 112, y: 372 }, { x: 188, y: 372 },
    { x: 272, y: 155 }, { x: 272, y: 245 },
    { x: 28, y: 155 }, { x: 28, y: 245 },
  ];

  return (
    <div className="flex flex-col items-center relative">
      {/* Live Data Overlays outside SVG */}
      <div className="absolute top-0 right-2 flex flex-col items-end gap-1">
         <span className="text-[9px] font-mono text-[#00ff66] animate-pulse">UPT: {uptimeTag}</span>
         <span className="text-[9px] font-mono text-[#ccff00]">SYS.ACTIVE</span>
      </div>

      <svg viewBox="0 0 300 400" className="w-full max-w-[260px] font-mono" xmlns="http://www.w3.org/2000/svg">
        
        {/* Stadium Grid pattern (Brutalist style) */}
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="none" stroke="#262626" strokeWidth="0.5" strokeOpacity="0.5" />
        </pattern>
        <rect x="25" y="15" width="250" height="370" fill="url(#grid)" />
        <rect x="25" y="15" width="250" height="370" fill="none" stroke="#262626" strokeWidth="1" />
        
        {/* Corner Crosshairs */}
        <path d="M20 10 h10 v10" fill="none" stroke="#555" strokeWidth="1" />
        <path d="M280 10 h-10 v10" fill="none" stroke="#555" strokeWidth="1" />
        <path d="M20 390 h10 v-10" fill="none" stroke="#555" strokeWidth="1" />
        <path d="M280 390 h-10 v-10" fill="none" stroke="#555" strokeWidth="1" />

        {/* Pitch Area */}
        <rect x="90" y="130" width="120" height="140" fill="#050505" stroke="#333" strokeWidth="1">
           <animate attributeName="stroke" values="#222;#444;#222" dur="4s" repeatCount="indefinite" />
        </rect>
        <line x1="90" y1="200" x2="210" y2="200" stroke="#333" strokeDasharray="3 3">
           <animate attributeName="stroke-dashoffset" values="0;12" dur="2s" repeatCount="indefinite" />
        </line>
        <circle cx="150" cy="200" r="15" fill="none" stroke="#444" strokeWidth="1">
            <animate attributeName="r" values="15;35;15" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Scanning Radar Line */}
        <line x1="25" y1="15" x2="275" y2="15" stroke="#ccff00" strokeWidth="1" opacity="0.3">
          <animate attributeName="y1" values="15;385;15" dur="5s" repeatCount="indefinite" />
          <animate attributeName="y2" values="15;385;15" dur="5s" repeatCount="indefinite" />
        </line>

        {/* Zone blocks */}
        {north && (
          <rect x="40" y="30" width="220" height="70" fill={zoneColor(north.crowdPercent)} fillOpacity="0.1" stroke={zoneColor(north.crowdPercent)} strokeWidth="1">
             <animate attributeName="fill-opacity" values="0.05;0.15;0.05" dur={`${3 + scanOffset}s`} repeatCount="indefinite" />
          </rect>
        )}
        {south && (
          <rect x="40" y="300" width="220" height="70" fill={zoneColor(south.crowdPercent)} fillOpacity="0.1" stroke={zoneColor(south.crowdPercent)} strokeWidth="1">
             <animate attributeName="fill-opacity" values="0.05;0.15;0.05" dur="4.5s" repeatCount="indefinite" />
          </rect>
        )}
        {west && (
          <rect x="35" y="110" width="45" height="180" fill={zoneColor(west.crowdPercent)} fillOpacity="0.1" stroke={zoneColor(west.crowdPercent)} strokeWidth="1">
             <animate attributeName="fill-opacity" values="0.05;0.15;0.05" dur="3.8s" repeatCount="indefinite" />
          </rect>
        )}
        {east && (
          <rect x="220" y="110" width="45" height="180" fill={zoneColor(east.crowdPercent)} fillOpacity="0.1" stroke={zoneColor(east.crowdPercent)} strokeWidth="1">
             <animate attributeName="fill-opacity" values="0.05;0.15;0.05" dur="5.2s" repeatCount="indefinite" />
          </rect>
        )}

        {/* Zone labels */}
        {zoneData.map(({ zone, label, x, y }) => zone && (
          <g key={zone.id}>
            <text x={x} y={y - 8} textAnchor="middle" fill="#888" fontSize="8" fontWeight="800" letterSpacing="1">
              [{label}]
            </text>
            <rect x={x - 18} y={y + 2} width="36" height="16" fill="#000" stroke={zoneColor(zone.crowdPercent)} />
            <text x={x} y={y + 13} textAnchor="middle" fill={zoneColor(zone.crowdPercent)} fontSize="10" fontWeight="900">
              {zone.crowdPercent}%
            </text>
          </g>
        ))}

        {/* Connective Node Lines mapping to center */}
        {Object.values(venueState.gates).map((gate, i) => {
          const pos = gatePositions[i];
          if (!pos) return null;
          const c = gate.status === 'closed' ? '#ff0033' : gate.status === 'alert' ? '#ffaa00' : '#00ff66';
          return (
             <line key={`link-${gate.id}`} x1={pos.x} y1={pos.y} x2="150" y2="200" stroke={c} strokeWidth="0.5" opacity="0.3" strokeDasharray="1 3">
                <animate attributeName="stroke-dashoffset" values="4;0" dur="1s" repeatCount="indefinite" />
             </line>
          );
        })}

        {/* Gate nodes */}
        {Object.values(venueState.gates).map((gate, i) => {
          const pos = gatePositions[i];
          if (!pos) return null;
          const c = gate.status === 'closed' ? '#ff0033' : gate.status === 'alert' ? '#ffaa00' : '#00ff66';
          return (
            <g key={gate.id}>
              {/* Outer Ping */}
              <rect x={pos.x - 8} y={pos.y - 8} width="16" height="16" fill="none" stroke={c} strokeWidth="1">
                 {gate.status !== 'closed' && (
                    <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
                 )}
                 {gate.status !== 'closed' && (
                    <animate attributeName="width" values="16;30" dur="1.5s" repeatCount="indefinite" />
                 )}
                 {gate.status !== 'closed' && (
                    <animate attributeName="height" values="16;30" dur="1.5s" repeatCount="indefinite" />
                 )}
                 {gate.status !== 'closed' && (
                    <animate attributeName="x" values={`${pos.x - 8};${pos.x - 15}`} dur="1.5s" repeatCount="indefinite" />
                 )}
                 {gate.status !== 'closed' && (
                    <animate attributeName="y" values={`${pos.y - 8};${pos.y - 15}`} dur="1.5s" repeatCount="indefinite" />
                 )}
              </rect>
              {/* Core Node */}
              <rect x={pos.x - 5} y={pos.y - 5} width="10" height="10" fill="#000" stroke={c} strokeWidth="2" />
              {/* Active data bit indicator */}
               <rect x={pos.x - 1} y={pos.y - 1} width="2" height="2" fill={c}>
                  {gate.status !== 'closed' && (
                     <animate attributeName="opacity" values="0;1;0" dur={`${1 + (i%3)*0.5}s`} repeatCount="indefinite" />
                  )}
               </rect>
            </g>
          );
        })}
      </svg>

      {/* Complex Radar Legend */}
      <div className="flex w-full justify-between mt-6 border-t border-[#262626] pt-4 items-center">
        <div className="flex gap-4">
          {[{ l: 'LOW', c: '#00ff66' }, { l: 'MED', c: '#ccff00' }, { l: 'HIGH', c: '#ffaa00' }, { l: 'CRIT', c: '#ff0033' }].map(i => (
            <div key={i.l} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5" style={{ backgroundColor: i.c }} />
              <span className="text-[9px] text-[#888] font-black tracking-widest">{i.l}</span>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-[#444] font-black uppercase tracking-widest flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-[#ccff00] animate-pulse" />
           Live Feed
        </div>
      </div>
    </div>
  );
}
