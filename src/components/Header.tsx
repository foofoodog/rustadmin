import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Activity, 
  Terminal, 
  Users, 
  Puzzle, 
  ShieldCheck,
  MessageSquare, 
  LayoutDashboard,
  Map as MapIcon,
  Package,
  Settings
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { ServerStatus } from '../types/rcon';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenConnect }) => {
  const [connectionState, setConnectionState] = useState(rconService.getState());
  const [status, setStatus] = useState<ServerStatus | null>(null);

  useEffect(() => {
    const unsubState = rconService.onStateChange(setConnectionState);
    const unsubStatus = rconService.onStatus(setStatus);
    return () => {
      unsubState();
      unsubStatus();
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'players', label: 'Players', icon: Users, badge: status ? `${status.players}/${status.maxPlayers}` : undefined },
    { id: 'plugins', label: 'Plugins', icon: Puzzle },
    { id: 'permissions', label: 'Permissions', icon: ShieldCheck },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Server Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-rust-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-lg shadow-rust-900/40">
                R
              </div>
              <div>
                <span className="font-bold text-base text-zinc-100 tracking-tight">
                  Rust<span className="text-rust-500">Admin</span>
                </span>
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-400 rounded">
                  WebRCON
                </span>
              </div>
            </div>

            {status && connectionState === 'connected' && (
              <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-zinc-800 text-xs">
                <span className="text-zinc-300 font-medium">{status.hostname}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{status.map}</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rust-500' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-semibold bg-zinc-700/80 text-zinc-200 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Connection Status Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenConnect}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                connectionState === 'connected'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/50'
                  : connectionState === 'connecting'
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-400 animate-pulse'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/50'
              }`}
            >
              {connectionState === 'connected' ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </>
              ) : connectionState === 'connecting' ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Disconnected</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
