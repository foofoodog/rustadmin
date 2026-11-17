import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Skull, 
  ShieldAlert, 
  Bomb, 
  UserPlus, 
  UserMinus, 
  Filter, 
  Search, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  Target,
  Zap,
  Crosshair
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { RconMessage } from '../types/rcon';

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

export const CombatFeedTab: React.FC = () => {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const unsub = rconService.onLog((msg: RconMessage) => {
      if (isPaused || !msg.Message) return;

      const text = msg.Message.trim();
      const lower = text.toLowerCase();
      const timeStr = new Date().toLocaleTimeString();

      let event: FeedEvent | null = null;

      // 1. Anti-cheat / Violations
      if (
        lower.includes('violation') ||
        lower.includes('flyhack') ||
        lower.includes('speedhack') ||
        lower.includes('eyehack') ||
        lower.includes('packet flooding')
      ) {
        event = {
          id: `ac-${Date.now()}-${Math.random()}`,
          type: 'anticheat',
          timestamp: timeStr,
          raw: text,
          details: text
        };
      }
      // 2. Explosives / Raiding
      else if (
        lower.includes('timed.explosive') ||
        lower.includes('ammo.rocket') ||
        lower.includes('explosive.satchel') ||
        lower.includes('mlrs') ||
        lower.includes('grenade.f1') ||
        (lower.includes('exploded') && !lower.includes('firework'))
      ) {
        event = {
          id: `raid-${Date.now()}-${Math.random()}`,
          type: 'raid',
          timestamp: timeStr,
          raw: text,
          details: text
        };
      }
      // 3. PvP / Combat death
      else if (
        lower.includes('was killed by') ||
        lower.includes('killed by') ||
        lower.includes('died (') ||
        lower.includes('suicide')
      ) {
        // Attempt to parse kill details
        event = {
          id: `kill-${Date.now()}-${Math.random()}`,
          type: 'kill',
          timestamp: timeStr,
          raw: text,
          details: text
        };
      }
      // 4. Connect / Disconnect
      else if (lower.includes('joined [') || lower.includes('connected [') || lower.includes('steamauth')) {
        event = {
          id: `conn-${Date.now()}-${Math.random()}`,
          type: 'connect',
          timestamp: timeStr,
          raw: text,
          details: text
        };
      } else if (lower.includes('disconnecting:') || lower.includes('kicked:') || lower.includes('left the server')) {
        event = {
          id: `disc-${Date.now()}-${Math.random()}`,
          type: lower.includes('kicked:') || lower.includes('banned:') ? 'ban' : 'disconnect',
          timestamp: timeStr,
          raw: text,
          details: text
        };
      }

      if (event) {
        setEvents((prev) => [event!, ...prev].slice(0, 300));
      }
    });

    return () => unsub();
  }, [isPaused]);

  const filteredEvents = events.filter((e) => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (search.trim()) {
      return e.details.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const getEventBadge = (type: FeedEvent['type']) => {
    switch (type) {
      case 'kill':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/60 text-amber-400 border border-amber-800/50">
            <Skull className="w-3 h-3" />
            <span>Combat Kill</span>
          </span>
        );
      case 'raid':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60 animate-pulse">
            <Bomb className="w-3 h-3" />
            <span>Raid / Explosion</span>
          </span>
        );
      case 'anticheat':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-900 text-white border border-red-700 animate-bounce">
            <ShieldAlert className="w-3 h-3" />
            <span>Anti-Cheat Alert</span>
          </span>
        );
      case 'connect':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <UserPlus className="w-3 h-3" />
            <span>Connected</span>
          </span>
        );
      case 'disconnect':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            <UserMinus className="w-3 h-3" />
            <span>Disconnected</span>
          </span>
        );
      case 'ban':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-400 border border-purple-800/60">
            <ShieldAlert className="w-3 h-3" />
            <span>Kick / Ban</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Flame className="w-5 h-5 text-rust-500 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-zinc-100">Live Combat & Raid Feed</h2>
              <span className="px-2 py-0.5 bg-zinc-800 text-rust-400 font-mono text-xs font-semibold rounded">
                {events.length} Events Logged
              </span>
            </div>
            <p className="text-xs text-zinc-400">Real-time parser for PVP kills, explosive detonations, and anti-cheat kicks</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search combat logs..."
              className="pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isPaused
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {isPaused ? 'Feed Paused' : 'Pause'}
          </button>

          <button
            onClick={() => setEvents([])}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition-colors"
            title="Clear Feed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'kill', label: 'Combat & Kills' },
          { id: 'raid', label: 'Raids & Explosions' },
          { id: 'anticheat', label: 'Anti-Cheat Alerts' },
          { id: 'connect', label: 'Connections' },
          { id: 'ban', label: 'Bans & Kicks' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === f.id
                ? 'bg-rust-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            <Flame className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p>No combat, raid, or violation events detected yet.</p>
            <p className="text-xs text-zinc-600 mt-1">Events will stream here automatically as they occur on the server.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80 max-h-[650px] overflow-y-auto font-mono text-xs">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3 flex items-start justify-between space-x-4 hover:bg-zinc-850/60 transition-colors ${
                  event.type === 'anticheat'
                    ? 'bg-red-950/20'
                    : event.type === 'raid'
                    ? 'bg-rose-950/15'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <span className="text-zinc-500 shrink-0 text-[11px] pt-0.5">
                    {event.timestamp}
                  </span>
                  <div className="shrink-0">{getEventBadge(event.type)}</div>
                  <div className="text-zinc-200 break-words leading-relaxed flex-1">
                    {event.details}
                  </div>
                </div>

                {/* Quick actions for anti-cheat or player violations */}
                {event.type === 'anticheat' && (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => rconService.sendCommand('kick ' + event.raw.split(' ')[0])}
                      className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-bold"
                    >
                      Kick
                    </button>
                    <button
                      onClick={() => rconService.sendCommand('ban ' + event.raw.split(' ')[0])}
                      className="px-2 py-0.5 bg-red-800 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                    >
                      Ban
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
