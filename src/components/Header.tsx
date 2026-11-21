import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Activity, 
  Terminal, 
  Users, 
  Puzzle, 
  MessageSquare, 
  LayoutDashboard,
  Map as MapIcon,
  Package,
  Sliders,
  Clock,
  Flame,
  Shield,
  Compass,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  Settings,
  Download,
  RotateCw,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { pwaService } from '../services/pwaService';
import { ServerStatus } from '../types/rcon';
import { 
  getSavedProfiles, 
  getActiveProfile, 
  setActiveProfileId, 
  ServerProfile 
} from '../services/serverProfiles';
import { getTheme, toggleTheme, onThemeChange, Theme } from '../services/themeService';

export type NavSection = 'server' | 'monitoring' | 'players' | 'arsenal';

export interface SubTabItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export interface SectionItem {
  id: NavSection;
  label: string;
  icon: any;
  subTabs: SubTabItem[];
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenConnect }) => {
  const [connectionState, setConnectionState] = useState(rconService.getState());
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [activeProfile, setActiveProfile] = useState<ServerProfile>(getActiveProfile());
  const [profiles, setProfiles] = useState<ServerProfile[]>(getSavedProfiles());
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [theme, setThemeState] = useState<Theme>(getTheme());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onThemeChange(setThemeState);
  }, []);

  useEffect(() => {
    // PWA Service update and installation listeners
    const unsubUpdate = pwaService.onUpdateAvailable(() => {
      console.log('[PWA] New update available!');
      setIsUpdateAvailable(true);
    });

    const unsubInstall = pwaService.onInstallPrompt((prompt) => {
      setInstallPrompt(prompt);
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubUpdate();
      unsubInstall();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    await pwaService.promptInstall();
  };

  const handleApplyUpdate = () => {
    pwaService.applyUpdate();
  };

  useEffect(() => {
    const unsubState = rconService.onStateChange(setConnectionState);
    const unsubStatus = rconService.onStatus(setStatus);
    return () => {
      unsubState();
      unsubStatus();
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sections: SectionItem[] = [
    {
      id: 'server',
      label: 'Server',
      icon: Server,
      subTabs: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'convars', label: 'Rules & Convars', icon: Sliders },
        { id: 'automation', label: 'Automation & Tasks', icon: Clock }
      ]
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Activity,
      subTabs: [
        { id: 'console', label: 'Live Console', icon: Terminal },
        { id: 'map', label: 'Map & Radar', icon: MapIcon },
        { id: 'combat', label: 'Combat & Raid Feed', icon: Flame },
        { id: 'chat', label: 'In-Game Chat', icon: MessageSquare }
      ]
    },
    {
      id: 'players',
      label: 'Players',
      icon: Users,
      subTabs: [
        { 
          id: 'players-list', 
          label: 'Player Directory', 
          icon: Users, 
          badge: status ? `${status.players}/${status.maxPlayers}` : undefined 
        },
        { id: 'plugins', label: 'Plugins & Permissions', icon: Puzzle }
      ]
    },
    {
      id: 'arsenal',
      label: 'Arsenal',
      icon: Package,
      subTabs: [
        { id: 'items', label: 'Item Browser', icon: Package },
        { id: 'kits', label: 'Kits & Loadouts', icon: Shield },
        { id: 'prefabs', label: 'World Prefabs', icon: Compass }
      ]
    }
  ];

  // Determine active section based on activeTab
  const currentSection = sections.find((s) => s.subTabs.some((t) => t.id === activeTab)) || sections[0];

  const handleSectionClick = (section: SectionItem) => {
    // If active tab is already in this section, keep it. Otherwise switch to first sub-tab.
    if (!section.subTabs.some((t) => t.id === activeTab)) {
      setActiveTab(section.subTabs[0].id);
    }
  };

  const handleSelectProfile = (profile: ServerProfile) => {
    setActiveProfileId(profile.id);
    setActiveProfile(profile);
    setIsProfileDropdownOpen(false);
    rconService.connect(profile.host, profile.port, profile.password);
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-zinc-800/60">
          
          {/* Logo & Server Switcher Dropdown */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-rust-600 flex items-center justify-center font-black text-white text-base tracking-wider shadow-md shadow-rust-900/40">
                R
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm text-zinc-100 tracking-tight">
                  Rust<span className="text-rust-500">Admin</span>
                </span>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setProfiles(getSavedProfiles());
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 transition-colors"
                title="Switch server connection"
              >
                <Server className="w-3.5 h-3.5 text-rust-500" />
                <span className="truncate max-w-[120px] sm:max-w-[160px]">{activeProfile.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    Saved Server Profiles
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {profiles.map((p) => {
                      const isCurrent = p.id === activeProfile.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProfile(p)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-zinc-800 text-white font-semibold'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className="block truncate">{p.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500 truncate block">
                              {p.host}:{p.port}
                            </span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-rust-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onOpenConnect();
                    }}
                    className="w-full mt-1 pt-1.5 border-t border-zinc-800 text-left px-2.5 py-1.5 rounded-lg text-xs text-rust-400 hover:text-rust-300 hover:bg-zinc-800/50 flex items-center space-x-1.5 font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Manage Servers & Settings</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Primary 4 Category Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isSectionActive = currentSection.id === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSectionActive
                      ? 'bg-rust-600 text-white shadow-sm shadow-rust-900/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions: PWA Install, Update, Offline Status & Connection */}
          <div className="flex items-center space-x-2">
            {/* PWA Update Ready Button */}
            {isUpdateAvailable && (
              <button
                onClick={handleApplyUpdate}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-rust-600 via-amber-600 to-rust-600 hover:from-rust-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold shadow-md shadow-rust-950/80 animate-pulse transition-all border border-amber-500/50"
                title="A new version of RustAdmin is ready. Click to reload and apply now."
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden sm:inline">Update Ready</span>
                <span className="sm:hidden">Update</span>
              </button>
            )}

            {/* Install PWA Button (appears when browser triggers beforeinstallprompt) */}
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all border border-rust-500/50"
                title="Install RustAdmin as a desktop/mobile app"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Install App</span>
              </button>
            )}

            {/* Offline Badge */}
            {isOffline && (
              <span
                className="flex items-center space-x-1 px-2 py-1 bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs rounded-lg font-medium"
                title="Running in offline mode from Service Worker cache"
              >
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            {/* Theme Toggle (Dark / Light) */}
            <button
              type="button"
              onClick={() => toggleTheme()}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform duration-200" />
              )}
            </button>

            <button
              onClick={onOpenConnect}
              title="Click to open RCON connection settings"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                connectionState === 'connected'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/50 shadow-sm'
                  : connectionState === 'connecting'
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-400 animate-pulse'
                  : 'bg-rose-950/60 border-rose-600/80 text-rose-300 hover:bg-rose-900/70 animate-pulse shadow-md shadow-rose-950/60 ring-1 ring-rose-500/50'
              }`}
            >
              {connectionState === 'connected' ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Connected</span>
                </>
              ) : connectionState === 'connecting' ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <WifiOff className="w-3.5 h-3.5 text-rose-300" />
                  <span className="hidden sm:inline">Disconnected</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Contextual Sub-Nav Bar */}
        <div className="flex items-center space-x-1.5 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mr-1 shrink-0">
            {currentSection.label} /
          </span>

          {currentSection.subTabs.map((subTab) => {
            const Icon = subTab.icon;
            const isSubTabActive = activeTab === subTab.id;

            return (
              <button
                key={subTab.id}
                onClick={() => setActiveTab(subTab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSubTabActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSubTabActive ? 'text-rust-400' : 'text-zinc-400'}`} />
                <span>{subTab.label}</span>
                {subTab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-semibold bg-zinc-700 text-zinc-200 rounded-full font-mono">
                    {subTab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
