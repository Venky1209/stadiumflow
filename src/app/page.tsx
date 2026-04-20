'use client';

import { useState, useEffect } from 'react';
import { useVenue } from '@/lib/venueContext';
import AttendeeView from '@/components/AttendeeView';
import ManagerDashboard from '@/components/ManagerDashboard';

export default function Home() {
  const [view, setView] = useState<'attendee' | 'manager'>('attendee');
  const { isConnected } = useVenue();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setShowNav(false);
        } else if (currentScrollY < lastScrollY) {
          setShowNav(true);
        }
        setLastScrollY(currentScrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* ── Header ── */}
      <header className={`fixed top-0 left-0 w-full z-50 bg-[#0c0c0e]/90 backdrop-blur-md transition-transform duration-300 border-b border-[#1a1a1a] flex justify-center ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="w-full max-w-[1440px] px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ccff00] flex items-center justify-center text-[13px] font-black text-black select-none tracking-tight">
            SF
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-black tracking-tight text-white leading-none">
              StadiumFlow
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111] border border-[#1a1a1a]">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00ff66] animate-pulse' : 'bg-[#555]'}`} />
              <span className="text-[10px] text-[#666] font-bold tracking-wider uppercase">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* View Switch — Premium Segmented Control */}
        <div className="hidden sm:flex items-center p-1 bg-[#0c0c0e] rounded-xl border border-[#27272a] shadow-inner gap-1">
          {(['attendee', 'manager'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`
                px-6 py-2.5 text-[14px] font-bold rounded-lg transition-all duration-200 whitespace-nowrap
                ${view === v
                  ? 'bg-[#27272a] text-white shadow-md cursor-default'
                  : 'text-[#71717a] hover:text-[#e4e4e7] hover:bg-[#18181b]'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {v === 'attendee' && view === 'attendee' && <span className="w-2 h-2 rounded-full bg-[#ccff00] shadow-[0_0_8px_#ccff00]" />}
                {v === 'manager' && view === 'manager' && <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />}
                {v === 'attendee' ? 'Attendee View' : 'Manager Panel'}
              </span>
            </button>
          ))}
        </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="w-full max-w-[1440px] flex-1 px-4 sm:px-8 py-10 mt-[80px]">
        {view === 'attendee' ? <AttendeeView /> : <ManagerDashboard />}
      </main>
    </div>
  );
}
