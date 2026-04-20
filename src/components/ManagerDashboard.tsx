'use client';

import { useVenue } from '@/lib/venueContext';
import { useState, useEffect, useRef } from 'react';
import HeatmapGrid from './HeatmapGrid';

interface ActivityEvent {
  id: string;
  message: string;
  gate: string;
  type: 'arrival' | 'surge' | 'clear';
  time: string;
}

const ARRIVAL_MESSAGES = [
  'Group of 12 arrived',
  'Family with kids entered',
  '3 guests scanned',
  'VIP pass holder entered',
  'Wheelchair access used',
  'Season ticket holders (4)',
  '6 guests entered via mobile',
  'Late arrival — single ticket',
  'Staff member badged in',
  'Group of 8 arrived',
];

export default function ManagerDashboard() {
  const { venueState, updateGate, sendAlert } = useVenue();
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate live arrival events
  useEffect(() => {
    if (!venueState) return;
    const gates = Object.values(venueState.gates).filter(g => g.status !== 'closed');

    intervalRef.current = setInterval(() => {
      const randomGate = gates[Math.floor(Math.random() * gates.length)];
      if (!randomGate) return;

      const isSurge = Math.random() < 0.15;
      const isClear = Math.random() < 0.1;
      
      const event: ActivityEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        message: isSurge
          ? `Crowd surge detected — ${20 + Math.floor(Math.random() * 30)} people queuing`
          : isClear
            ? 'Queue cleared — flow normalized'
            : ARRIVAL_MESSAGES[Math.floor(Math.random() * ARRIVAL_MESSAGES.length)],
        gate: randomGate.name,
        type: isSurge ? 'surge' : isClear ? 'clear' : 'arrival',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setActivityLog(prev => [event, ...prev].slice(0, 30));
    }, 2500 + Math.random() * 1500);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [venueState]);

  if (!venueState) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-2 border-[#ccff00] border-r-transparent rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-[#71717a]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const gates = Object.values(venueState.gates);
  const openGates = gates.filter(g => g.status === 'open');
  const avgWait = openGates.length > 0
    ? Math.round(openGates.reduce((s, g) => s + g.waitMinutes, 0) / openGates.length)
    : 0;
  const criticalZones = Object.values(venueState.zones).filter(z => z.crowdPercent > 75);
  const totalFlow = activityLog.filter(e => e.type === 'arrival').length;
  const alerts = venueState.activeAlerts || [];

  return (
    <div className="flex flex-col gap-12 lg:gap-16 pb-32">
      
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111114] border border-[#232328] rounded-sm p-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#71717a]">Active Gates</span>
          <div className="text-[32px] font-black tracking-tight leading-none text-[#22c55e] mt-3">
            {openGates.length}<span className="text-[16px] text-[#3f3f46]"> / {gates.length}</span>
          </div>
        </div>
        <div className="bg-[#111114] border border-[#232328] rounded-sm p-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#71717a]">Avg Wait</span>
          <div className="text-[32px] font-black tracking-tight leading-none text-[#ccff00] mt-3">
            {avgWait}<span className="text-[16px] text-[#3f3f46]"> min</span>
          </div>
        </div>
        <div className="bg-[#111114] border border-[#232328] rounded-sm p-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#71717a]">Recent Arrivals</span>
          <div className="text-[32px] font-black tracking-tight leading-none text-[#e4e4e7] mt-3">
            {totalFlow}
          </div>
        </div>
        <div className={`bg-[#111114] border rounded-sm p-6 ${criticalZones.length > 0 ? 'border-[#ef4444]/30 bg-[#ef4444]/[0.03]' : 'border-[#232328]'}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-widest ${criticalZones.length > 0 ? 'text-[#ef4444]' : 'text-[#71717a]'}`}>Critical Zones</span>
          <div className={`text-[32px] font-black tracking-tight leading-none mt-3 ${criticalZones.length > 0 ? 'text-[#ef4444]' : 'text-[#3f3f46]'}`}>
            {criticalZones.length}
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Heatmap + Live Feed */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#111114] border border-[#232328] rounded-sm">
            <div className="px-6 py-4 border-b border-[#232328]">
              <h3 className="text-[14px] font-bold text-[#e4e4e7]">Live Density Map</h3>
            </div>
            <div className="p-6">
              <HeatmapGrid />
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-[#111114] border border-[#232328] rounded-sm">
            <div className="px-6 py-4 border-b border-[#232328] flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#e4e4e7]">Live Activity</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">Streaming</span>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {activityLog.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-[#3f3f46]">Waiting for activity...</div>
              ) : (
                activityLog.slice(0, 12).map((evt, i) => (
                  <div
                    key={evt.id}
                    className={`flex items-center gap-3 px-6 py-3 border-b border-[#232328] last:border-0 ${i === 0 ? 'animate-ticker' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      evt.type === 'surge' ? 'bg-[#ef4444] animate-pulse' :
                      evt.type === 'clear' ? 'bg-[#22c55e]' :
                      'bg-[#3f3f46]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-medium truncate ${
                        evt.type === 'surge' ? 'text-[#fca5a5]' :
                        evt.type === 'clear' ? 'text-[#86efac]' :
                        'text-[#a1a1aa]'
                      }`}>
                        {evt.message}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#3f3f46] whitespace-nowrap">{evt.gate}</span>
                    <span className="text-[10px] font-mono text-[#3f3f46] whitespace-nowrap">{evt.time}</span>
                  </div>
                ))
              )}
            </div>
            {activityLog.length > 0 && (
              <div className="px-6 py-3 border-t border-[#232328] bg-[#0c0c0e]">
                <p className="text-[11px] text-[#71717a] font-medium">
                  Tip: Watch for 
                  <span className="text-[#fca5a5] font-semibold"> red surge warnings</span> — 
                  deploy extra staff to those gates immediately.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gate Control */}
        <div className="lg:col-span-7 bg-[#111114] border border-[#232328] rounded-sm">
          <div className="px-6 py-4 border-b border-[#232328] flex justify-between items-center">
            <h3 className="text-[14px] font-bold text-[#e4e4e7]">Gate Controls</h3>
            <span className="text-[10px] font-semibold text-[#3f3f46] uppercase tracking-wider">{gates.length} terminals</span>
          </div>
          
          <div>
            {gates.map((gate) => {
              const statusColor = gate.status === 'closed' ? '#ef4444' : gate.status === 'alert' ? '#f59e0b' : '#22c55e';
              return (
                <div 
                  key={gate.id} 
                  className={`flex items-center justify-between px-6 py-4 border-b border-[#232328] last:border-0 transition-colors
                    ${gate.status === 'closed' ? 'bg-[#ef4444]/[0.02]' : 'hover:bg-[#18181b]'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColor }} />
                    <div>
                      <h4 className="text-[14px] font-bold text-[#e4e4e7]">{gate.name}</h4>
                      <p className="text-[11px] text-[#71717a] mt-0.5">
                        {gate.waitMinutes} min wait · {gate.crowdLevel} crowd · {gate.zone} zone
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => updateGate(gate.id, { status: gate.status === 'closed' ? 'open' : 'closed' })}
                      className={`h-[38px] px-5 text-[11px] font-bold rounded-sm transition-colors ${
                        gate.status === 'closed'
                          ? 'bg-[#22c55e] text-[#0c0c0e] hover:bg-[#16a34a]'
                          : 'bg-transparent border border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444] hover:text-white'
                      }`}
                    >
                      {gate.status === 'closed' ? 'Reopen Gate' : 'Close Gate'}
                    </button>
                    <button
                      onClick={() => sendAlert(gate.id, `Staff deployed to ${gate.name}`)}
                      className="h-[38px] px-5 text-[11px] font-bold rounded-sm bg-transparent border border-[#232328] text-[#71717a] hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
                    >
                      Deploy Staff
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <div className="bg-[#111114] border border-[#ef4444]/30 rounded-sm">
          <div className="px-6 py-4 border-b border-[#ef4444]/20 bg-[#ef4444]/[0.05]">
            <h3 className="text-[14px] font-bold text-[#ef4444] flex items-center justify-between">
              <span>Active Alerts</span>
              <span className="text-[12px] font-mono">{alerts.length}</span>
            </h3>
          </div>
          <div>
            {alerts.slice(-5).reverse().map((a) => (
              <div key={a.id} className="flex justify-between items-center px-6 py-3 border-b border-[#232328] last:border-0">
                <span className="text-[12px] font-medium text-[#fca5a5]">{a.message}</span>
                <span className="text-[10px] font-mono text-[#3f3f46]">{new Date(a.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
