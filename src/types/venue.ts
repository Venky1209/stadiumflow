export type GateStatus = 'open' | 'closed' | 'alert';
export type CrowdLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Gate {
  id: string;
  name: string;
  status: GateStatus;
  waitMinutes: number;
  crowdLevel: CrowdLevel;
  zone: string;
  lat?: number;
  lng?: number;
}

export interface Zone {
  id: string;
  name: string;
  crowdPercent: number;
  gateIds: string[];
  color?: string;
}

export interface ActiveAlert {
  id: string;
  gateId: string;
  message: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
}

export interface VenueState {
  zones: Record<string, Zone>;
  gates: Record<string, Gate>;
  lastUpdated: number;
  activeAlerts: ActiveAlert[];
  stadiumName: string;
  capacity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
