import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Power,
  ExternalLink,
  Search
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { OxidePlugin } from '../types/rcon';

export const PluginsTab: React.FC = () => {
  const [plugins, setPlugins] = useState<OxidePlugin[]>([]);
  const [search, setSearch] = useState('');
  const [loadingPlugin, setLoadingPlugin] = useState<string | null>(null);

  useEffect(() => {
    const unsub = rconService.onPlugins(setPlugins);
    rconService.sendCommand('plugins');
    return () => unsub();
  }, []);

  const handleReload = async (pluginName: string) => {
    setLoadingPlugin(pluginName);
    try {
      await rconService.sendCommand(`oxide.reload "${pluginName}"`);
      setTimeout(() => {
        rconService.sendCommand('plugins');
        setLoadingPlugin(null);
      }, 1000);
    } catch {
      setLoadingPlugin(null);
    }
  };

  const handleUnload = async (pluginName: string) => {
    setLoadingPlugin(pluginName);
    try {
      await rconService.sendCommand(`oxide.unload "${pluginName}"`);
      setTimeout(() => {
        rconService.sendCommand('plugins');
        setLoadingPlugin(null);
      }, 1000);
    } catch {
      setLoadingPlugin(null);
    }
  };

  const filteredPlugins = plugins.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.filename.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  const errorPlugins = plugins.filter((p) => !!p.error);

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Puzzle className="w-5 h-5 text-rust-500" />
          <h2 className="text-base font-bold text-zinc-100">
            Oxide / uMod Plugins ({plugins.length})
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plugin, author..."
              className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-48 sm:w-64"
            />
          </div>
          <button
            onClick={() => rconService.sendCommand('plugins')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
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
              <div key={p.name} className="bg-rose-950/80 p-2.5 rounded border border-rose-900/60">
                <span className="font-bold text-rose-200">{p.name}:</span> {p.error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plugins Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {filteredPlugins.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No plugins found. Ensure Oxide is installed and running.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Plugin Name</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Memory / Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPlugins.map((plugin) => {
                  const hasError = !!plugin.error;
                  return (
                    <tr
                      key={plugin.name}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        hasError ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-zinc-500">{plugin.index}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-100 flex items-center space-x-2">
                        {hasError ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <span>{plugin.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                            hasError
                              ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          v{plugin.version}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{plugin.author}</td>
                      <td className="py-3 px-4 font-mono text-zinc-400">{plugin.filename}</td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {plugin.memory}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Reload */}
                          <button
                            onClick={() => handleReload(plugin.name)}
                            disabled={loadingPlugin === plugin.name}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-zinc-200 rounded text-[11px] font-medium transition-colors"
                            title="Reload Plugin"
                          >
                            <RotateCw
                              className={`w-3 h-3 ${loadingPlugin === plugin.name ? 'animate-spin' : ''}`}
                            />
                            <span>Reload</span>
                          </button>

                          {/* Unload */}
                          <button
                            onClick={() => handleUnload(plugin.name)}
                            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                            title="Unload Plugin"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
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
