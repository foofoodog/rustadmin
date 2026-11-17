import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Power, 
  Play, 
  Search,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { OxidePlugin } from '../types/rcon';

interface PluginsTabProps {
  onNavigateToPermissions?: () => void;
}

export const PluginsTab: React.FC<PluginsTabProps> = ({ onNavigateToPermissions }) => {
  const [plugins, setPlugins] = useState<OxidePlugin[]>([]);
  const [search, setSearch] = useState('');
  const [loadingPlugin, setLoadingPlugin] = useState<string | null>(null);

  useEffect(() => {
    const unsub = rconService.onPlugins(setPlugins);
    rconService.sendCommand('plugins', true);
    return () => unsub();
  }, []);

  const handleAction = async (action: 'reload' | 'unload' | 'load', stem: string) => {
    setLoadingPlugin(stem);
    try {
      if (action === 'reload') {
        await rconService.sendCommand(`oxide.reload ${stem}`);
      } else if (action === 'unload') {
        await rconService.sendCommand(`oxide.unload ${stem}`);
      } else if (action === 'load') {
        await rconService.sendCommand(`oxide.load ${stem}`);
      }
      setTimeout(() => {
        rconService.sendCommand('plugins', true);
        setLoadingPlugin(null);
      }, 800);
    } catch {
      setLoadingPlugin(null);
    }
  };

  const handleReloadAll = async () => {
    setLoadingPlugin('__all__');
    try {
      await rconService.sendCommand('oxide.reload *');
      setTimeout(() => {
        rconService.sendCommand('plugins', true);
        setLoadingPlugin(null);
      }, 1500);
    } catch {
      setLoadingPlugin(null);
    }
  };

  const filteredPlugins = plugins.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.filename.toLowerCase().includes(search.toLowerCase()) ||
    p.stem.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  const errorPlugins = plugins.filter((p) => p.status === 'error' || !!p.error);
  const loadedCount = plugins.filter((p) => p.status === 'loaded').length;
  const unloadedCount = plugins.filter((p) => p.status === 'unloaded').length;

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Puzzle className="w-5 h-5 text-rust-500" />
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
              <span>Oxide / uMod Plugins ({plugins.length})</span>
            </h2>
            <div className="flex space-x-3 text-xs text-zinc-400 mt-0.5">
              <span>Loaded: <b className="text-emerald-400">{loadedCount}</b></span>
              {unloadedCount > 0 && <span>Unloaded: <b className="text-amber-400">{unloadedCount}</b></span>}
              {errorPlugins.length > 0 && <span>Errors: <b className="text-rose-400">{errorPlugins.length}</b></span>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plugin, author..."
              className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-44 sm:w-56"
            />
          </div>

          {/* Reload All */}
          <button
            onClick={handleReloadAll}
            disabled={loadingPlugin === '__all__'}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rust-600 hover:bg-rust-500 active:bg-rust-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            title="Reload all plugins"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loadingPlugin === '__all__' ? 'animate-spin' : ''}`} />
            <span>Reload All</span>
          </button>

          {onNavigateToPermissions && (
            <button
              onClick={onNavigateToPermissions}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors"
              title="Open Oxide Permissions Manager"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rust-400" />
              <span>Permissions</span>
            </button>
          )}

          {/* Refresh List */}
          <button
            onClick={() => rconService.sendCommand('plugins')}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Callout Banner if any plugin failed compilation */}
      {errorPlugins.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Compilation Errors Detected ({errorPlugins.length})</span>
          </div>
          <div className="space-y-1.5 pl-6 text-xs text-rose-300 font-mono">
            {errorPlugins.map((p) => (
              <div key={p.stem} className="bg-rose-950/80 p-2.5 rounded border border-rose-900/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-200">{p.name}:</span> {p.error}
                </div>
                <button
                  onClick={() => handleAction('reload', p.stem)}
                  className="px-2 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded text-[11px] font-semibold shrink-0 ml-3"
                >
                  Retry Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plugins Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {filteredPlugins.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No plugins found matching "{search}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Plugin Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Memory / Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPlugins.map((plugin) => {
                  const isLoaded = plugin.status === 'loaded';
                  const isUnloaded = plugin.status === 'unloaded';
                  const hasError = plugin.status === 'error';
                  const isLoading = loadingPlugin === plugin.stem;

                  return (
                    <tr
                      key={plugin.stem}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        hasError
                          ? 'bg-rose-950/20'
                          : isUnloaded
                          ? 'bg-zinc-950/40 opacity-75'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-zinc-500">{plugin.index}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-100 flex items-center space-x-2">
                        {hasError ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : isUnloaded ? (
                          <Power className="w-4 h-4 text-zinc-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <div>
                          <span>{plugin.name}</span>
                          <span className="block text-[10px] text-zinc-500 font-mono font-normal">
                            {plugin.filename}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            hasError
                              ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                              : isUnloaded
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-900/40'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                          }`}
                        >
                          {hasError ? 'Error' : isUnloaded ? 'Unloaded' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-300">
                        {isUnloaded ? '-' : `v${plugin.version}`}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{plugin.author}</td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {plugin.memory}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* If Loaded: Show Reload + Unload */}
                          {isLoaded && (
                            <>
                              <button
                                onClick={() => handleAction('reload', plugin.stem)}
                                disabled={isLoading}
                                className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-zinc-200 rounded text-[11px] font-medium transition-colors"
                                title={`Reload ${plugin.stem}`}
                              >
                                <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                <span>Reload</span>
                              </button>
                              <button
                                onClick={() => handleAction('unload', plugin.stem)}
                                disabled={isLoading}
                                className="flex items-center space-x-1 px-2 py-1 bg-zinc-800/80 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 rounded text-[11px] transition-colors"
                                title={`Unload ${plugin.stem}`}
                              >
                                <Power className="w-3 h-3" />
                                <span>Unload</span>
                              </button>
                            </>
                          )}

                          {/* If Unloaded: Show Load button */}
                          {isUnloaded && (
                            <button
                              onClick={() => handleAction('load', plugin.stem)}
                              disabled={isLoading}
                              className="flex items-center space-x-1 px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded text-[11px] font-semibold transition-colors"
                              title={`Load ${plugin.stem}`}
                            >
                              <Play className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                              <span>Load</span>
                            </button>
                          )}

                          {/* If Error: Show Retry button */}
                          {hasError && (
                            <button
                              onClick={() => handleAction('reload', plugin.stem)}
                              disabled={isLoading}
                              className="flex items-center space-x-1 px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded text-[11px] font-semibold transition-colors"
                              title={`Retry compiling ${plugin.stem}`}
                            >
                              <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
