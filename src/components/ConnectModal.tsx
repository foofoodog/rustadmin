import React, { useState, useEffect } from 'react';
import { 
  X, 
  Server, 
  Key, 
  Globe, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  Bookmark,
  Layers
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { 
  getSavedProfiles, 
  saveProfile, 
  deleteProfile, 
  getActiveProfile, 
  setActiveProfileId, 
  ServerProfile 
} from '../services/serverProfiles';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileChanged?: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, onProfileChanged }) => {
  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ServerProfile>(getActiveProfile());
  const [name, setName] = useState('');
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('28016');
  const [password, setPassword] = useState('rcon.password');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedProfiles();
      const current = getActiveProfile();
      setProfiles(saved);
      setActiveProfile(current);
      setSelectedProfileId(current.id);
      setName(current.name);
      setHost(current.host);
      setPort(current.port.toString());
      setPassword(current.password);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProfile = (p: ServerProfile) => {
    setSelectedProfileId(p.id);
    setName(p.name);
    setHost(p.host);
    setPort(p.port.toString());
    setPassword(p.password);
  };

  const handleNewProfile = () => {
    setSelectedProfileId('');
    setName('New Server Profile');
    setHost('127.0.0.1');
    setPort('28016');
    setPassword('rcon.password');
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteProfile(id);
    setProfiles(updated);
    if (selectedProfileId === id && updated.length > 0) {
      handleSelectProfile(updated[0]);
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();

    const saved = saveProfile({
      id: selectedProfileId || undefined,
      name: name.trim() || 'Rust Dedicated',
      host: host.trim(),
      port: parseInt(port, 10) || 28016,
      password: password.trim()
    });

    setActiveProfileId(saved.id);
    localStorage.setItem('rustadmin_host', saved.host);
    localStorage.setItem('rustadmin_port', saved.port.toString());
    localStorage.setItem('rustadmin_pass', saved.password);

    rconService.connect(saved.host, saved.port, saved.password);
    if (onProfileChanged) onProfileChanged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-150">
        
        {/* Left Column: Saved Profiles List */}
        <div className="w-full md:w-56 bg-zinc-950/80 border-r border-zinc-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Bookmark className="w-3.5 h-3.5 text-rust-500" />
                <span>Profiles</span>
              </span>
              <button
                type="button"
                onClick={handleNewProfile}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                title="Create new profile"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {profiles.map((p) => {
                const isSelected = selectedProfileId === p.id;
                const isActive = activeProfile.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProfile(p)}
                    className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between group transition-colors ${
                      isSelected
                        ? 'bg-zinc-800 text-white font-medium border border-zinc-700/80'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1 truncate pr-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="truncate">{p.name}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Currently Active" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block">
                        {p.host}:{p.port}
                      </span>
                    </div>

                    {profiles.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProfile(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNewProfile}
            className="mt-4 w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 flex items-center justify-center space-x-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Server</span>
          </button>
        </div>

        {/* Right Column: Connection Form */}
        <div className="flex-1 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2 text-rust-500 font-bold text-base">
              <Server className="w-5 h-5" />
              <span>{selectedProfileId ? 'Edit Server Profile' : 'New Server Profile'}</span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleConnect} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Profile / Server Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Local Dedicated or Main 2x"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-rust-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Server Host / IP
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="127.0.0.1"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-rust-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  RCON Port
                </label>
                <div className="relative">
                  <Server className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="28016"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-rust-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  RCON Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="rcon.password"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-rust-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-rust-600 hover:bg-rust-500 active:bg-rust-700 text-white font-semibold rounded-lg text-xs transition-all shadow-lg shadow-rust-900/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save & Connect</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
