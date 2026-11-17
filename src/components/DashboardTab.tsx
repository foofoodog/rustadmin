import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CloudSun, 
  Plane, 
  Ship, 
  ShieldAlert, 
  Save, 
  RotateCcw, 
  Sun, 
  CloudRain, 
  CloudFog, 
  Send,
  Zap,
  Radio,
  FileCheck2
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { ServerStatus } from '../types/rcon';

export const DashboardTab: React.FC = () => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [timeVal, setTimeVal] = useState<number>(12);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = rconService.onStatus(setStatus);
    rconService.sendCommand('status');
    rconService.sendCommand('server.seed', true);
    rconService.sendCommand('server.worldsize', true);
    return () => unsub();
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const runCommand = async (cmd: string, successMsg?: string) => {
    try {
      await rconService.sendCommand(cmd);
      triggerToast(successMsg || `Executed: ${cmd}`);
    } catch (err: any) {
      triggerToast(`Failed: ${err.message}`);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTimeVal(val);
    runCommand(`env.time ${val}`, `Time set to ${val}:00`);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    runCommand(`say ${broadcastMsg.trim()}`, `Broadcast sent`);
    setBroadcastMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-rust-500/50 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4 text-rust-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Players Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Players Online</span>
            <Users className="w-4 h-4 text-rust-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-zinc-100">
              {status ? status.players : 0}
            </span>
            <span className="text-sm text-zinc-500 font-medium">
              / {status ? status.maxPlayers : 50}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400 flex space-x-3">
            <span>Queued: <b className="text-zinc-200">{status ? status.queued : 0}</b></span>
            <span>Joining: <b className="text-zinc-200">{status ? status.joining : 0}</b></span>
          </div>
        </div>

        {/* Server & Map Info Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Server & Map</span>
            <Radio className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2 truncate">
            <span className="text-xl font-bold text-zinc-100 truncate" title={status ? status.hostname : 'Localhost'}>
              {status ? status.hostname : 'Localhost'}
            </span>
            <span className="text-zinc-600 font-semibold">•</span>
            <span className="text-sm font-semibold text-zinc-300 truncate" title={status ? status.map : 'Procedural Map'}>
              {status ? status.map : 'Procedural Map'}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400 flex items-center space-x-3 font-mono">
            <span>Size: <b className="text-rust-400 font-semibold">{status?.worldSize || 2500}m</b></span>
            <span className="text-zinc-600">•</span>
            <span>Seed: <b className="text-zinc-200 font-semibold">{status?.seed || '1584212361'}</b></span>
          </div>
        </div>

        {/* Server Build Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rust Protocol</span>
            <FileCheck2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-zinc-100 truncate">
            {status ? status.version : 'Version 2636'}
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Secure Mode • Steam3 Connected
          </div>
        </div>

        {/* Quick Broadcast Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Server Broadcast</span>
            <Send className="w-4 h-4 text-amber-500" />
          </div>
          <form onSubmit={handleBroadcast} className="flex space-x-2 mt-1">
            <input
              type="text"
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Announcement..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
            />
            <button
              type="submit"
              className="bg-rust-600 hover:bg-rust-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* World & Environment Controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
            <Clock className="w-5 h-5 text-rust-500" />
            <h3 className="font-bold text-zinc-100 text-base">World & Environment</h3>
          </div>

          {/* Time of Day Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-zinc-300">
              <span className="flex items-center space-x-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Time of Day</span>
              </span>
              <span className="text-rust-400 font-mono text-base">{Math.floor(timeVal)}:00</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={timeVal}
              onChange={handleTimeChange}
              className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-rust-500"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
              <span>00:00 (Night)</span>
              <span>06:00 (Dawn)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Dusk)</span>
              <span>24:00</span>
            </div>
          </div>

          {/* Weather Presets */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Weather Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => runCommand('weather.reset', 'Weather: Clear Skies')}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 transition-colors"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Clear</span>
              </button>
              <button
                onClick={() => runCommand('weather.rain 1', 'Weather: Heavy Rain')}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 transition-colors"
              >
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span>Rain</span>
              </button>
              <button
                onClick={() => runCommand('weather.fog 1', 'Weather: Dense Fog')}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 transition-colors"
              >
                <CloudFog className="w-3.5 h-3.5 text-zinc-400" />
                <span>Fog</span>
              </button>
              <button
                onClick={() => runCommand('weather.storm 1', 'Weather: Lightning Storm')}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 transition-colors"
              >
                <CloudSun className="w-3.5 h-3.5 text-purple-400" />
                <span>Storm</span>
              </button>
            </div>
          </div>

          {/* Quick Server Action Buttons */}
          <div className="space-y-2 pt-2">
            <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Server Maintenance
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => runCommand('server.save', 'Server saved to disk')}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-emerald-400 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Server</span>
              </button>
              <button
                onClick={() => runCommand('restart 300', 'Server will restart in 5 minutes')}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-amber-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart (5m)</span>
              </button>
              <button
                onClick={() => runCommand('restart 0', 'Server restart cancelled')}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-rose-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel Restart</span>
              </button>
            </div>
          </div>
        </div>

        {/* Event Spawners */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
            <Zap className="w-5 h-5 text-rust-500" />
            <h3 className="font-bold text-zinc-100 text-base">Monument & World Events</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Patrol Heli */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-rust-950/60 border border-rust-800/60 flex items-center justify-center text-rust-400">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-100">Patrol Helicopter</h4>
                  <p className="text-xs text-zinc-400">Spawn attack helicopter</p>
                </div>
              </div>
              <button
                onClick={() => runCommand('spawn heli', 'Patrol Helicopter spawned!')}
                className="w-full py-1.5 bg-rust-600/80 hover:bg-rust-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Spawn Helicopter
              </button>
            </div>

            {/* Cargo Ship */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-100">Cargo Ship</h4>
                  <p className="text-xs text-zinc-400">Spawn offshore cargo event</p>
                </div>
              </div>
              <button
                onClick={() => runCommand('spawn cargoship', 'Cargo Ship spawned!')}
                className="w-full py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Call Cargo Ship
              </button>
            </div>

            {/* Bradley APC */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-100">Bradley APC</h4>
                  <p className="text-xs text-zinc-400">Spawn tank at Launch Site</p>
                </div>
              </div>
              <button
                onClick={() => runCommand('spawn bradley', 'Bradley APC spawned!')}
                className="w-full py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Spawn Bradley
              </button>
            </div>

            {/* Air Drop */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-100">Supply Drop</h4>
                  <p className="text-xs text-zinc-400">Call cargo plane air drop</p>
                </div>
              </div>
              <button
                onClick={() => runCommand('supply.call', 'Supply Drop called!')}
                className="w-full py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Call Air Drop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
