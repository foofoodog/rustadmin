import React, { useState, useEffect } from 'react';
import { X, Server, Key, Globe, ShieldCheck } from 'lucide-react';
import { rconService } from '../services/rconService';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('28016');
  const [password, setPassword] = useState('rcon.password');

  useEffect(() => {
    const savedHost = localStorage.getItem('rustadmin_host');
    const savedPort = localStorage.getItem('rustadmin_port');
    const savedPass = localStorage.getItem('rustadmin_pass');

    if (savedHost) setHost(savedHost);
    if (savedPort) setPort(savedPort);
    if (savedPass) setPassword(savedPass);
  }, []);

  if (!isOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('rustadmin_host', host);
    localStorage.setItem('rustadmin_port', port);
    localStorage.setItem('rustadmin_pass', password);

    rconService.connect(host, parseInt(port, 10) || 28016, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center space-x-2 text-rust-500 font-bold text-lg">
            <Server className="w-5 h-5" />
            <span>Connect to WebRCON</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleConnect} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Server Host / IP
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="127.0.0.1 or codewarren"
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-rust-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              RCON Port
            </label>
            <div className="relative">
              <Server className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="28016"
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-rust-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              RCON Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="rcon.password"
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-rust-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-rust-600 hover:bg-rust-500 active:bg-rust-700 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-rust-900/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Connect to Server</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
