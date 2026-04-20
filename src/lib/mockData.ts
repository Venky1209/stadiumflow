import { Database, ref, set, get, update } from 'firebase/database';
import type { VenueState, Gate, Zone, CrowdLevel } from '@/types/venue';

const GATE_NAMES = [
  'North Gate A', 'North Gate B',
  'South Gate A', 'South Gate B',
  'East Gate A', 'East Gate B',
  'West Gate A', 'West Gate B',
];

const ZONE_CONFIG: { id: string; name: string; gateIds: string[] }[] = [
  { id: 'north', name: 'North Stand', gateIds: ['gate-1', 'gate-2'] },
  { id: 'south', name: 'South Stand', gateIds: ['gate-3', 'gate-4'] },
  { id: 'east', name: 'East Wing', gateIds: ['gate-5', 'gate-6'] },
  { id: 'west', name: 'West Wing', gateIds: ['gate-7', 'gate-8'] },
];

function crowdLevelFromWait(wait: number): CrowdLevel {
  if (wait <= 4) return 'low';
  if (wait <= 8) return 'medium';
  if (wait <= 13) return 'high';
  return 'critical';
}

function randomWait(): number {
  return Math.floor(Math.random() * 16) + 2; // 2-18 min
}

function buildInitialState(): VenueState {
  const gates: Record<string, Gate> = {};
  const zones: Record<string, Zone> = {};

  GATE_NAMES.forEach((name, i) => {
    const id = `gate-${i + 1}`;
    const wait = randomWait();
    gates[id] = {
      id,
      name,
      status: 'open',
      waitMinutes: wait,
      crowdLevel: crowdLevelFromWait(wait),
      zone: ZONE_CONFIG[Math.floor(i / 2)].id,
    };
  });

  ZONE_CONFIG.forEach((zc) => {
    const zoneGates = zc.gateIds.map((gid) => gates[gid]);
    const avgWait = zoneGates.reduce((s, g) => s + g.waitMinutes, 0) / zoneGates.length;
    zones[zc.id] = {
      id: zc.id,
      name: zc.name,
      crowdPercent: Math.min(100, Math.round((avgWait / 18) * 100)),
      gateIds: zc.gateIds,
    };
  });

  return {
    gates,
    zones,
    lastUpdated: Date.now(),
    activeAlerts: [],
    stadiumName: 'MetLife Arena',
    capacity: 50000,
  };
}

export async function seedDatabase(database: Database): Promise<VenueState> {
  const venueRef = ref(database, 'venue');
  const snapshot = await get(venueRef);

  if (snapshot.exists()) {
    return snapshot.val() as VenueState;
  }

  const state = buildInitialState();
  await set(venueRef, state);
  return state;
}

export function simulateTick(database: Database): void {
  const venueRef = ref(database, 'venue/gates');

  get(venueRef).then((snapshot) => {
    if (!snapshot.exists()) return;
    const gates = snapshot.val() as Record<string, Gate>;
    const updates: Record<string, unknown> = {};

    // Pick 2-3 random gates to update
    const gateIds = Object.keys(gates);
    const numUpdates = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < numUpdates; i++) {
      const gid = gateIds[Math.floor(Math.random() * gateIds.length)];
      const gate = gates[gid];
      if (gate.status === 'closed') continue;

      const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const newWait = Math.max(1, Math.min(20, gate.waitMinutes + delta));
      updates[`${gid}/waitMinutes`] = newWait;
      updates[`${gid}/crowdLevel`] = crowdLevelFromWait(newWait);
    }

    // Update zone crowd percentages
    const zoneUpdates: Record<string, number> = {};
    ZONE_CONFIG.forEach((zc) => {
      const zoneGates = zc.gateIds.map((gid) => {
        const updatedWait = updates[`${gid}/waitMinutes`] as number | undefined;
        return updatedWait ?? gates[gid]?.waitMinutes ?? 5;
      });
      const avgWait = zoneGates.reduce((s, w) => s + w, 0) / zoneGates.length;
      zoneUpdates[zc.id] = Math.min(100, Math.round((avgWait / 18) * 100));
    });

    update(ref(database, 'venue/gates'), updates);

    // Update zones separately
    Object.entries(zoneUpdates).forEach(([zid, pct]) => {
      update(ref(database, `venue/zones/${zid}`), { crowdPercent: pct });
    });

    update(ref(database, 'venue'), { lastUpdated: Date.now() });
  });
}

// Fallback: local-only mock state for when Firebase is not configured
export function getLocalMockState(): VenueState {
  return buildInitialState();
}

export function localSimulateTick(state: VenueState): VenueState {
  const newGates = { ...state.gates };
  const gateIds = Object.keys(newGates);
  const numUpdates = Math.floor(Math.random() * 2) + 2;

  for (let i = 0; i < numUpdates; i++) {
    const gid = gateIds[Math.floor(Math.random() * gateIds.length)];
    const gate = { ...newGates[gid] };
    if (gate.status === 'closed') continue;
    const delta = Math.floor(Math.random() * 5) - 2;
    gate.waitMinutes = Math.max(1, Math.min(20, gate.waitMinutes + delta));
    gate.crowdLevel = crowdLevelFromWait(gate.waitMinutes);
    newGates[gid] = gate;
  }

  const newZones = { ...state.zones };
  ZONE_CONFIG.forEach((zc) => {
    const zoneGates = zc.gateIds.map((gid) => newGates[gid]);
    const avgWait = zoneGates.reduce((s, g) => s + g.waitMinutes, 0) / zoneGates.length;
    newZones[zc.id] = {
      ...newZones[zc.id],
      crowdPercent: Math.min(100, Math.round((avgWait / 18) * 100)),
    };
  });

  return {
    ...state,
    gates: newGates,
    zones: newZones,
    lastUpdated: Date.now(),
  };
}
