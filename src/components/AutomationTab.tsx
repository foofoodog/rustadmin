import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  RotateCw, 
  AlertTriangle, 
  Megaphone, 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  Calendar,
  Save,
  Radio
} from 'lucide-react';
import { rconService } from '../services/rconService';

interface Announcement {
  id: string;
  text: string;
  intervalMinutes: number;
  enabled: boolean;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    text: '[Server] Welcome to our server! Join our Discord community at discord.gg/rustadmin for rules & events.',
    intervalMinutes: 15,
    enabled: true
  },
  {
    id: 'a2',
    text: '[Server] Please remember: no griefing outside raid hours. Report rule breakers in Discord.',
    intervalMinutes: 30,
    enabled: true
  }
];

export const AutomationTab: React.FC = () => {
  // Graceful Restart State
  const [restartDuration, setRestartDuration] = useState<number>(300); // 5 mins in seconds
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [isRestartActive, setIsRestartActive] = useState<boolean>(false);
  const restartTimerRef = useRef<any>(null);

  // Auto Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('rustadmin_announcements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ANNOUNCEMENTS;
  });
  const [isAnnouncerRunning, setIsAnnouncerRunning] = useState<boolean>(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [newAnnouncementInterval, setNewAnnouncementInterval] = useState(15);
  const announcerTimersRef = useRef<any[]>([]);

  // Wipe Wizard State
  const [wipeSeed, setWipeSeed] = useState<string>('1584212361');
  const [wipeSize, setWipeSize] = useState<number>(3500);
  const [wipeHostname, setWipeHostname] = useState<string>('My Rust Server [WIPED]');
  const [toast, setToast] = useState<string | null>(null);

  // Save announcements
  const saveAnnouncements = (items: Announcement[]) => {
    setAnnouncements(items);
    localStorage.setItem('rustadmin_announcements', JSON.stringify(items));
  };

  // Graceful Restart Countdown loop
  useEffect(() => {
    if (!isRestartActive || countdownRemaining === null) return;

    if (countdownRemaining <= 0) {
      rconService.sendCommand('server.save');
      rconService.sendCommand('restart');
      setIsRestartActive(false);
      setCountdownRemaining(null);
      setToast('Server restart initiated.');
      return;
    }

    // Broadcast milestone warnings
    if (countdownRemaining === 600) {
      rconService.sendCommand('say "[SERVER WARNING] Server will restart in 10 minutes!"');
    } else if (countdownRemaining === 300) {
      rconService.sendCommand('say "[SERVER WARNING] Server will restart in 5 minutes! Please find safe shelter."');
    } else if (countdownRemaining === 60) {
      rconService.sendCommand('say "[SERVER WARNING] Server will restart in 60 seconds! World save commencing..."');
      rconService.sendCommand('server.save');
    } else if (countdownRemaining === 10) {
      rconService.sendCommand('say "[SERVER WARNING] Server restarting in 10 seconds!"');
    }

    restartTimerRef.current = setTimeout(() => {
      setCountdownRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [isRestartActive, countdownRemaining]);

  const startGracefulRestart = () => {
    setIsRestartActive(true);
    setCountdownRemaining(restartDuration);
    const mins = Math.round(restartDuration / 60);
    rconService.sendCommand(`say "[SERVER WARNING] Scheduled server restart initiated. Restarting in ${mins} minute(s)."`);
    setToast(`Scheduled restart in ${mins} minute(s) started.`);
    setTimeout(() => setToast(null), 3000);
  };

  const cancelRestart = () => {
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    setIsRestartActive(false);
    setCountdownRemaining(null);
    rconService.sendCommand('restart -1');
    rconService.sendCommand('say "[SERVER NOTICE] Scheduled server restart has been CANCELLED by administrator."');
    setToast('Server restart cancelled.');
    setTimeout(() => setToast(null), 3000);
  };

  // Announcer Loop
  useEffect(() => {
    announcerTimersRef.current.forEach(clearInterval);
    announcerTimersRef.current = [];

    if (!isAnnouncerRunning) return;

    announcements.filter((a) => a.enabled).forEach((a) => {
      const intervalMs = Math.max(1, a.intervalMinutes) * 60 * 1000;
      const timer = setInterval(() => {
        rconService.sendCommand(`say "${a.text}"`);
      }, intervalMs);
      announcerTimersRef.current.push(timer);
    });

    return () => {
      announcerTimersRef.current.forEach(clearInterval);
      announcerTimersRef.current = [];
    };
  }, [isAnnouncerRunning, announcements]);

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    const newItem: Announcement = {
      id: `a-${Date.now()}`,
      text: newAnnouncementText.trim(),
      intervalMinutes: newAnnouncementInterval,
      enabled: true
    };
    saveAnnouncements([...announcements, newItem]);
    setNewAnnouncementText('');
    setToast('Added announcement.');
    setTimeout(() => setToast(null), 2500);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const generateRandomSeed = () => {
    const random = Math.floor(Math.random() * 2000000000) + 1;
    setWipeSeed(random.toString());
  };

  const handleExecuteWipeConfig = async () => {
    try {
      await rconService.sendCommand(`server.seed ${wipeSeed}`);
      await rconService.sendCommand(`server.worldsize ${wipeSize}`);
      await rconService.sendCommand(`server.hostname "${wipeHostname}"`);
      await rconService.sendCommand('server.save');
      setToast('Wipe parameters updated on server! A full restart is required to generate the new map.');
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
    }
    setTimeout(() => setToast(null), 4000);
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

      {/* Top Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-rust-500 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-zinc-100">Server Automation & Scheduled Tasks</h2>
            <p className="text-xs text-zinc-400">Graceful restarts with automatic chat warnings, periodic broadcast announcer, and wipe wizard</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Section 1: Graceful Server Restart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2.5">
              <RotateCw className="w-4 h-4 text-rust-400" />
              <h3 className="font-bold text-sm text-zinc-100">Graceful Restart with Chat Warnings</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Automatically warns all players in chat at key milestones, performs a world save, and executes the server restart.
            </p>

            {/* Countdown display if active */}
            {isRestartActive && countdownRemaining !== null ? (
              <div className="my-4 p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-center space-y-1 animate-pulse">
                <span className="text-[11px] uppercase tracking-wider font-bold text-rose-400 block">
                  Restart in Progress
                </span>
                <span className="text-3xl font-mono font-black text-rose-200">
                  {formatCountdown(countdownRemaining)}
                </span>
                <p className="text-[11px] text-rose-300">Broadcasting chat warnings to players</p>
              </div>
            ) : (
              <div className="space-y-3 my-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Select Countdown Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { sec: 60, label: '1 Minute' },
                      { sec: 300, label: '5 Minutes' },
                      { sec: 600, label: '10 Minutes' }
                    ].map((d) => (
                      <button
                        key={d.sec}
                        type="button"
                        onClick={() => setRestartDuration(d.sec)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                          restartDuration === d.sec
                            ? 'bg-rust-600 text-white'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-zinc-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Includes Automatic Pre-Restart World Save</span>
                  </div>
                  <p className="text-zinc-500">Sends chat notifications at 10m, 5m, 1m, and 10s.</p>
                </div>
              </div>
            )}
          </div>

          <div>
            {isRestartActive ? (
              <button
                onClick={cancelRestart}
                className="w-full py-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/50"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Abort Scheduled Restart</span>
              </button>
            ) : (
              <button
                onClick={startGracefulRestart}
                className="w-full py-2.5 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-rust-950/50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start {Math.round(restartDuration / 60)}m Graceful Restart</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Auto-Broadcast Announcements */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-rust-400" />
                <h3 className="font-bold text-sm text-zinc-100">Recurring Chat Announcer</h3>
              </div>
              <button
                onClick={() => setIsAnnouncerRunning(!isAnnouncerRunning)}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  isAnnouncerRunning
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <Radio className={`w-3 h-3 ${isAnnouncerRunning ? 'animate-pulse text-emerald-400' : ''}`} />
                <span>{isAnnouncerRunning ? 'Broadcasting Active' : 'Off'}</span>
              </button>
            </div>

            {/* Announcements List */}
            <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex items-start justify-between space-x-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">{item.text}</p>
                    <span className="text-[10px] text-rust-400 font-mono mt-1 block">
                      Every {item.intervalMinutes}m
                    </span>
                  </div>
                  <button
                    onClick={() => saveAnnouncements(announcements.filter((a) => a.id !== item.id))}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add announcement form */}
          <form onSubmit={handleAddAnnouncement} className="pt-2 border-t border-zinc-800 space-y-2">
            <input
              type="text"
              required
              placeholder="e.g. [Server] Join discord.gg/rust..."
              value={newAnnouncementText}
              onChange={(e) => setNewAnnouncementText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
            />
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-zinc-400 shrink-0">Interval (mins):</span>
              <input
                type="number"
                min="1"
                max="120"
                value={newAnnouncementInterval}
                onChange={(e) => setNewAnnouncementInterval(parseInt(e.target.value, 10) || 15)}
                className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono text-center text-zinc-200"
              />
              <button
                type="submit"
                className="flex-1 py-1 bg-zinc-800 hover:bg-rust-600 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Add Announcement
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Wipe Day Assistant */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2.5">
              <Calendar className="w-4 h-4 text-rust-400" />
              <h3 className="font-bold text-sm text-zinc-100">Wipe Day Configuration</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Configure map seed, world size, and server title for the upcoming wipe.
            </p>

            <div className="space-y-3 mt-3">
              {/* Seed */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Map Seed
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomSeed}
                    className="text-[10px] text-rust-400 hover:text-rust-300 font-medium"
                  >
                    Randomize Seed
                  </button>
                </div>
                <input
                  type="text"
                  value={wipeSeed}
                  onChange={(e) => setWipeSeed(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-rust-500"
                />
              </div>

              {/* World Size */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider">World Size</span>
                  <span className="font-mono text-rust-400 font-bold">{wipeSize}m</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="5000"
                  step="250"
                  value={wipeSize}
                  onChange={(e) => setWipeSize(parseInt(e.target.value, 10))}
                  className="w-full accent-rust-500 cursor-pointer"
                />
              </div>

              {/* Server Hostname */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Server Name / Title
                </label>
                <input
                  type="text"
                  value={wipeHostname}
                  onChange={(e) => setWipeHostname(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleExecuteWipeConfig}
            className="w-full py-2.5 bg-zinc-800 hover:bg-rust-600 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Apply Wipe Parameters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
