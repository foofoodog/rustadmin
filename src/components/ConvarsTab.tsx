import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Save, 
  Check, 
  Zap, 
  Sun, 
  Moon, 
  Shield, 
  Flame, 
  Users, 
  Clock, 
  CloudRain, 
  Compass, 
  Sparkles,
  Info
} from 'lucide-react';
import { rconService } from '../services/rconService';

interface ConvarState {
  decayScale: number;
  decayUpkeep: boolean;
  serverStability: boolean;
  serverRadiation: boolean;
  serverPve: boolean;
  teamSize: number;
  dayLength: number;
  nightLength: number;
  bradleyEnabled: boolean;
  heliLifetime: number;
  saveInterval: number;
  rain: number;
  fog: number;
  wind: number;
}

const DEFAULT_CONVARS: ConvarState = {
  decayScale: 1.0,
  decayUpkeep: true,
  serverStability: true,
  serverRadiation: true,
  serverPve: false,
  teamSize: 8,
  dayLength: 45,
  nightLength: 15,
  bradleyEnabled: true,
  heliLifetime: 15,
  saveInterval: 300,
  rain: 0,
  fog: 0,
  wind: 0.2
};

export const ConvarsTab: React.FC = () => {
  const [convars, setConvars] = useState<ConvarState>(DEFAULT_CONVARS);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCurrentConvars();
  }, []);

  const fetchCurrentConvars = async () => {
    setIsLoading(true);
    try {
      // Query key convars
      const decayResp = await rconService.sendCommand('decay.scale', true);
      const stabilityResp = await rconService.sendCommand('server.stability', true);
      const radResp = await rconService.sendCommand('server.radiation', true);
      const teamResp = await rconService.sendCommand('relationshipmanager.maxteamsize', true);
      const dayResp = await rconService.sendCommand('env.daylength', true);
      const nightResp = await rconService.sendCommand('env.nightlength', true);

      setConvars((prev) => ({
        ...prev,
        decayScale: parseNumber(decayResp?.Message, prev.decayScale),
        serverStability: parseBool(stabilityResp?.Message, prev.serverStability),
        serverRadiation: parseBool(radResp?.Message, prev.serverRadiation),
        teamSize: parseNumber(teamResp?.Message, prev.teamSize),
        dayLength: parseNumber(dayResp?.Message, prev.dayLength),
        nightLength: parseNumber(nightResp?.Message, prev.nightLength)
      }));
    } catch {}
    setIsLoading(false);
  };

  const parseNumber = (text?: string, fallback: number = 0): number => {
    if (!text) return fallback;
    const match = text.match(/:\s*"?([0-9.]+)"?/);
    return match ? parseFloat(match[1]) : fallback;
  };

  const parseBool = (text?: string, fallback: boolean = true): boolean => {
    if (!text) return fallback;
    const lower = text.toLowerCase();
    if (lower.includes('true') || lower.includes('"true"')) return true;
    if (lower.includes('false') || lower.includes('"false"')) return false;
    return fallback;
  };

  const applyConvar = async (command: string, label: string) => {
    try {
      await rconService.sendCommand(command);
      setToast(`Applied: ${label}`);
      setTimeout(() => setToast(null), 2500);
    } catch (err: any) {
      setToast(`Failed: ${err.message}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const applyPreset = async (preset: 'vanilla' | 'creative' | 'hardcore') => {
    if (preset === 'vanilla') {
      await rconService.sendCommand('decay.scale 1.0');
      await rconService.sendCommand('decay.upkeep true');
      await rconService.sendCommand('server.stability true');
      await rconService.sendCommand('server.radiation true');
      await rconService.sendCommand('server.pve false');
      await rconService.sendCommand('relationshipmanager.maxteamsize 8');
      setConvars((prev) => ({ ...prev, decayScale: 1.0, decayUpkeep: true, serverStability: true, serverRadiation: true, serverPve: false, teamSize: 8 }));
      setToast('Applied "Vanilla Competitive" Ruleset');
    } else if (preset === 'creative') {
      await rconService.sendCommand('decay.scale 0.0');
      await rconService.sendCommand('decay.upkeep false');
      await rconService.sendCommand('server.stability false');
      await rconService.sendCommand('server.radiation false');
      await rconService.sendCommand('server.pve true');
      await rconService.sendCommand('env.daylength 120');
      await rconService.sendCommand('env.nightlength 2');
      setConvars((prev) => ({ ...prev, decayScale: 0.0, decayUpkeep: false, serverStability: false, serverRadiation: false, serverPve: true, dayLength: 120, nightLength: 2 }));
      setToast('Applied "Build & Creative Sandbox" Ruleset');
    } else if (preset === 'hardcore') {
      await rconService.sendCommand('decay.scale 1.5');
      await rconService.sendCommand('relationshipmanager.maxteamsize 1');
      await rconService.sendCommand('server.stability true');
      await rconService.sendCommand('server.radiation true');
      setConvars((prev) => ({ ...prev, decayScale: 1.5, teamSize: 1 }));
      setToast('Applied "Solo Hardcore" Ruleset');
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-rust-500/50 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4 text-rust-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header and Preset Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Sliders className="w-5 h-5 text-rust-500 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-zinc-100">Server Rules & Convar Manager</h2>
            <p className="text-xs text-zinc-400">Live gameplay mechanics, decay scaling, team sizes, and environmental physics</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Presets:</span>
          <button
            onClick={() => applyPreset('vanilla')}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors"
          >
            Vanilla
          </button>
          <button
            onClick={() => applyPreset('creative')}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded text-xs font-medium transition-colors"
          >
            Build / Creative
          </button>
          <button
            onClick={() => applyPreset('hardcore')}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-rose-400 rounded text-xs font-medium transition-colors"
          >
            Solo Hardcore
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Building & Decay */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-rust-400" />
              <h3 className="font-bold text-sm text-zinc-100">Building & Upkeep</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">decay.*</span>
          </div>

          {/* Decay Scale */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-medium">Decay Scale (Multiplier)</span>
              <span className="font-mono text-rust-400 font-bold">{convars.decayScale}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={convars.decayScale}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setConvars((p) => ({ ...p, decayScale: val }));
                applyConvar(`decay.scale ${val}`, `Decay Scale ${val}x`);
              }}
              className="w-full accent-rust-500 cursor-pointer"
            />
            <span className="text-[11px] text-zinc-500 block mt-0.5">
              {convars.decayScale === 0 ? 'No Decay (Infinite base life)' : convars.decayScale === 1 ? 'Vanilla Standard' : 'Accelerated Decay'}
            </span>
          </div>

          {/* Upkeep Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-zinc-300 font-medium block">Tool Cupboard Upkeep</span>
              <span className="text-[11px] text-zinc-500">decay.upkeep</span>
            </div>
            <button
              onClick={() => {
                const next = !convars.decayUpkeep;
                setConvars((p) => ({ ...p, decayUpkeep: next }));
                applyConvar(`decay.upkeep ${next}`, `Upkeep ${next ? 'Enabled' : 'Disabled'}`);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                convars.decayUpkeep
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {convars.decayUpkeep ? 'Active' : 'Disabled'}
            </button>
          </div>

          {/* Structural Stability Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-zinc-300 font-medium block">Building Stability</span>
              <span className="text-[11px] text-zinc-500">server.stability</span>
            </div>
            <button
              onClick={() => {
                const next = !convars.serverStability;
                setConvars((p) => ({ ...p, serverStability: next }));
                applyConvar(`server.stability ${next}`, `Stability ${next ? 'Active' : 'Disabled'}`);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                convars.serverStability
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  : 'bg-rose-950 text-rose-400 border border-rose-800/60'
              }`}
            >
              {convars.serverStability ? 'Enabled' : 'Off (Skybases Allowed)'}
            </button>
          </div>
        </div>

        {/* Card 2: Environment & Time Cycles */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-zinc-100">Day & Night Cycles</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">env.*</span>
          </div>

          {/* Daytime Duration */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-medium">Day Length</span>
              <span className="font-mono text-amber-400 font-bold">{convars.dayLength} mins</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={convars.dayLength}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setConvars((p) => ({ ...p, dayLength: val }));
                applyConvar(`env.daylength ${val}`, `Day length ${val}m`);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Nighttime Duration */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-medium">Night Length</span>
              <span className="font-mono text-indigo-400 font-bold">{convars.nightLength} mins</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={convars.nightLength}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setConvars((p) => ({ ...p, nightLength: val }));
                applyConvar(`env.nightlength ${val}`, `Night length ${val}m`);
              }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <span className="text-[11px] text-zinc-500 block mt-0.5">
              Set to 1-2 mins for near perpetual daylight.
            </span>
          </div>

          {/* Radiation Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-zinc-300 font-medium block">Monument Radiation</span>
              <span className="text-[11px] text-zinc-500">server.radiation</span>
            </div>
            <button
              onClick={() => {
                const next = !convars.serverRadiation;
                setConvars((p) => ({ ...p, serverRadiation: next }));
                applyConvar(`server.radiation ${next}`, `Radiation ${next ? 'Enabled' : 'Disabled'}`);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                convars.serverRadiation
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {convars.serverRadiation ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Card 3: Teams & Combat Rules */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-rust-400" />
              <h3 className="font-bold text-sm text-zinc-100">Teams & Game Mode</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">server.*</span>
          </div>

          {/* Team Size Limit */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-medium">Max Team Size Limit</span>
              <span className="font-mono text-rust-400 font-bold">{convars.teamSize} Players</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={convars.teamSize}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setConvars((p) => ({ ...p, teamSize: val }));
                applyConvar(`relationshipmanager.maxteamsize ${val}`, `Max Team Size ${val}`);
              }}
              className="w-full accent-rust-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>Solo (1)</span>
              <span>Duo (2)</span>
              <span>Trio (3)</span>
              <span>Squad (4)</span>
              <span>Standard (8)</span>
            </div>
          </div>

          {/* PvE Mode Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-zinc-300 font-medium block">PvE Only Mode</span>
              <span className="text-[11px] text-zinc-500">server.pve (Blocks player damage)</span>
            </div>
            <button
              onClick={() => {
                const next = !convars.serverPve;
                setConvars((p) => ({ ...p, serverPve: next }));
                applyConvar(`server.pve ${next}`, `PvE Mode ${next ? 'Enabled' : 'Disabled'}`);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                convars.serverPve
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {convars.serverPve ? 'PvE Active' : 'PvP Normal'}
            </button>
          </div>

          {/* Bradley APC Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-zinc-300 font-medium block">Bradley APC Spawning</span>
              <span className="text-[11px] text-zinc-500">bradley.enabled</span>
            </div>
            <button
              onClick={() => {
                const next = !convars.bradleyEnabled;
                setConvars((p) => ({ ...p, bradleyEnabled: next }));
                applyConvar(`bradley.enabled ${next}`, `Bradley ${next ? 'Enabled' : 'Disabled'}`);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                convars.bradleyEnabled
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {convars.bradleyEnabled ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
