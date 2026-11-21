export interface RconMessage {
  Identifier: number;
  Message: string;
  Name?: string;
  Type?: 'Generic' | 'Log' | 'Warning' | 'Error' | 'Chat';
  Stacktrace?: string;
  timestamp?: number;
}

export interface Player {
  id: string;
  name: string;
  ping: number;
  connected: string;
  addr: string;
  owner: string;
  violation: number;
  kicks: number;
  entityId: string;
}

export interface ServerStatus {
  hostname: string;
  version: string;
  map: string;
  players: number;
  maxPlayers: number;
  queued: number;
  joining: number;
  fps?: number;
  uptime?: string;
  entities?: number;
  seed?: string;
  worldSize?: number;
}

export interface OxidePlugin {
  index: string;
  name: string;
  version: string;
  author: string;
  memory: string;
  filename: string;
  stem: string;
  status: 'loaded' | 'unloaded' | 'error';
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  color?: string;
}

export interface FeedEvent {
  id: string;
  type: 'kill' | 'raid' | 'anticheat' | 'connect' | 'disconnect' | 'ban';
  timestamp: string;
  raw: string;
  attacker?: string;
  victim?: string;
  weapon?: string;
  distance?: string;
  details: string;
}

