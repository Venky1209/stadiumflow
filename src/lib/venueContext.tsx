'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { VenueState } from '@/types/venue';
import { getLocalMockState, localSimulateTick } from '@/lib/mockData';

interface VenueContextType {
  venueState: VenueState | null;
  isConnected: boolean;
  updateGate: (gateId: string, updates: Partial<VenueState['gates'][string]>) => void;
  sendAlert: (gateId: string, message: string) => void;
}

const VenueContext = createContext<VenueContextType>({
  venueState: null,
  isConnected: false,
  updateGate: () => {},
  sendAlert: () => {},
});

export function VenueProvider({ children }: { children: React.ReactNode }) {
  const [venueState, setVenueState] = useState<VenueState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mode, setMode] = useState<'firebase' | 'local' | null>(null);

  // Initialize — try Firebase, fallback to local
  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function init() {
      try {
        const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
        if (!dbUrl || dbUrl.length === 0) throw new Error('No DB URL');

        const { db } = await import('@/lib/firebase');
        if (!db) throw new Error('Firebase not initialized');

        const { ref, onValue } = await import('firebase/database');
        const { seedDatabase } = await import('@/lib/mockData');

        await seedDatabase(db);

        unsub = onValue(ref(db, 'venue'), (snap) => {
          if (snap.exists()) {
            setVenueState(snap.val() as VenueState);
            setIsConnected(true);
            setMode('firebase');
          }
        });
      } catch {
        // Local fallback
        const state = getLocalMockState();
        setVenueState(state);
        setIsConnected(true);
        setMode('local');
      }
    }

    init();
    return () => { if (unsub) unsub(); };
  }, []);

  // Simulate ticks
  useEffect(() => {
    if (!venueState || !mode) return;

    const interval = setInterval(() => {
      if (mode === 'firebase') {
        import('@/lib/firebase').then(({ db }) => {
          if (db) {
            import('@/lib/mockData').then(({ simulateTick }) => simulateTick(db));
          }
        });
      } else {
        setVenueState(prev => prev ? localSimulateTick(prev) : prev);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [venueState, mode]);

  const updateGate = useCallback((gateId: string, updates: Partial<VenueState['gates'][string]>) => {
    if (mode === 'firebase') {
      Promise.all([import('@/lib/firebase'), import('firebase/database')]).then(([{ db }, { ref, update }]) => {
        if (db) update(ref(db, `venue/gates/${gateId}`), updates);
      });
    } else {
      setVenueState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          gates: { ...prev.gates, [gateId]: { ...prev.gates[gateId], ...updates } },
          lastUpdated: Date.now(),
        };
      });
    }
  }, [mode]);

  const sendAlert = useCallback((gateId: string, message: string) => {
    const alert = {
      id: `alert-${Date.now()}`,
      gateId,
      message,
      timestamp: Date.now(),
      severity: 'warning' as const,
    };

    setVenueState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        activeAlerts: [...(prev.activeAlerts || []), alert],
        gates: { ...prev.gates, [gateId]: { ...prev.gates[gateId], status: 'alert' } },
        lastUpdated: Date.now(),
      };
    });

    if (mode === 'firebase') {
      Promise.all([import('@/lib/firebase'), import('firebase/database')]).then(([{ db }, { ref, update }]) => {
        if (db) update(ref(db, `venue/gates/${gateId}`), { status: 'alert' });
      });
    }
  }, [mode]);

  return (
    <VenueContext.Provider value={{ venueState, isConnected, updateGate, sendAlert }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  return useContext(VenueContext);
}
