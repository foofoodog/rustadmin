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
  ShieldCheck, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Plus, 
  Check, 
  X, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { OxidePlugin } from '../types/rcon';

export const PluginsTab: React.FC = () => {
  const [plugins, setPlugins] = useState<OxidePlugin[]>([]);
  const [search, setSearch] = useState('');
  const [loadingPlugin, setLoadingPlugin] = useState<string | null>(null);

  // Oxide Permissions & Groups State
  const [allPerms, setAllPerms] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>(['default', 'admin']);
  const [selectedGroup, setSelectedGroup] = useState<string>('default');
  const [grantedPermsByGroup, setGrantedPermsByGroup] = useState<Record<string, Set<string>>>({});
  const [expandedPlugins, setExpandedPlugins] = useState<Record<string, boolean>>({});
  const [newPermInputs, setNewPermInputs] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = rconService.onPlugins(setPlugins);
    rconService.sendCommand('plugins', true);
    fetchPermissionsAndGroups();
    return () => unsub();
  }, []);

  const fetchPermissionsAndGroups = async () => {
    try {
      // 1. Fetch all permissions
      const permsResp = await rconService.sendCommand('oxide.show perms', true);
      if (permsResp?.Message) {
        const text = permsResp.Message.replace(/^Permissions:\s*/im, '').trim();
        const perms = text.split(/[\s,]+/).map((p) => p.trim()).filter(Boolean);
        if (perms.length > 0) {
          setAllPerms(Array.from(new Set(perms)).sort());
        }
      }

      // 2. Fetch groups
      const groupsResp = await rconService.sendCommand('oxide.show groups', true);
      if (groupsResp?.Message) {
        const text = groupsResp.Message.replace(/^Groups:\s*/im, '').trim();
        const grps = text.split(/[\s,]+/).map((g) => g.trim()).filter(Boolean);
        if (grps.length > 0) {
          const uniqueGroups = Array.from(new Set(grps));
          setGroups(uniqueGroups);
          // Fetch granted perms for each group
          uniqueGroups.forEach((g) => fetchGroupPerms(g));
        }
      }
    } catch {}
  };

  const fetchGroupPerms = async (group: string) => {
    try {
      const resp = await rconService.sendCommand(`oxide.show group ${group}`, true);
      if (resp?.Message) {
        const perms = new Set<string>();
        const lines = resp.Message.split('\n');
        let inPermSection = false;
        for (const line of lines) {
          if (line.toLowerCase().includes('permissions:')) {
            inPermSection = true;
            continue;
          }
          if (inPermSection) {
            if (line.toLowerCase().includes('players:') || line.toLowerCase().includes('users:')) {
              break;
            }
            const parts = line.split(/[\s,]+/).map((p) => p.trim()).filter(Boolean);
            parts.forEach((p) => perms.add(p));
          }
        }
        setGrantedPermsByGroup((prev) => ({ ...prev, [group]: perms }));
      }
    } catch {}
  };

  const toggleExpand = (stem: string) => {
    setExpandedPlugins((prev) => ({ ...prev, [stem]: !prev[stem] }));
  };

  const togglePermission = async (perm: string, group: string) => {
    const currentSet = grantedPermsByGroup[group] || new Set();
    const hasPerm = currentSet.has(perm);

    // Optimistic UI update
    const nextSet = new Set(currentSet);
    if (hasPerm) {
      nextSet.delete(perm);
    } else {
      nextSet.add(perm);
    }
    setGrantedPermsByGroup((prev) => ({ ...prev, [group]: nextSet }));

    try {
      if (hasPerm) {
        await rconService.sendCommand(`oxide.revoke group ${group} ${perm}`);
        setToast(`Revoked "${perm}" from group "${group}"`);
      } else {
        await rconService.sendCommand(`oxide.grant group ${group} ${perm}`);
        setToast(`Granted "${perm}" to group "${group}"`);
      }
    } catch (err: any) {
      setToast(`Failed: ${err.message}`);
    }
    setTimeout(() => setToast(null), 2500);
  };

  const grantAllForPlugin = async (pluginPerms: string[], group: string) => {
    for (const p of pluginPerms) {
      await rconService.sendCommand(`oxide.grant group ${group} ${p}`);
    }
    const currentSet = new Set(grantedPermsByGroup[group] || []);
    pluginPerms.forEach((p) => currentSet.add(p));
    setGrantedPermsByGroup((prev) => ({ ...prev, [group]: currentSet }));
    setToast(`Granted all ${pluginPerms.length} permissions to "${group}"`);
    setTimeout(() => setToast(null), 2500);
  };

  const revokeAllForPlugin = async (pluginPerms: string[], group: string) => {
    for (const p of pluginPerms) {
      await rconService.sendCommand(`oxide.revoke group ${group} ${p}`);
    }
    const currentSet = new Set(grantedPermsByGroup[group] || []);
    pluginPerms.forEach((p) => currentSet.delete(p));
    setGrantedPermsByGroup((prev) => ({ ...prev, [group]: currentSet }));
    setToast(`Revoked all ${pluginPerms.length} permissions from "${group}"`);
    setTimeout(() => setToast(null), 2500);
  };

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
        fetchPermissionsAndGroups();
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
        fetchPermissionsAndGroups();
        setLoadingPlugin(null);
      }, 1500);
    } catch {
      setLoadingPlugin(null);
    }
  };

  const getPluginPermissions = (stem: string, name: string): string[] => {
    const s = stem.toLowerCase();
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    return allPerms.filter((perm) => {
      const p = perm.toLowerCase();
      return (
        p.startsWith(s + '.') ||
        p.startsWith(cleanName + '.') ||
        p.includes('.' + s + '.') ||
        p === s
      );
    });
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

  // Global Oxide Core Permissions
  const coreOxidePerms = allPerms.filter((p) => p.startsWith('oxide.'));

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-rust-500/50 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4 text-rust-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Puzzle className="w-5 h-5 text-rust-500" />
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
              <span>Oxide / uMod Plugins & Integrated Permissions</span>
              <span className="px-2 py-0.5 bg-zinc-800 text-rust-400 font-mono text-xs font-semibold rounded">
                {plugins.length} Plugins
              </span>
            </h2>
            <div className="flex space-x-3 text-xs text-zinc-400 mt-0.5">
              <span>Loaded: <b className="text-emerald-400">{loadedCount}</b></span>
              {unloadedCount > 0 && <span>Unloaded: <b className="text-amber-400">{unloadedCount}</b></span>}
              {errorPlugins.length > 0 && <span>Errors: <b className="text-rose-400">{errorPlugins.length}</b></span>}
              <span>Total Server Permissions: <b className="text-zinc-300 font-mono">{allPerms.length}</b></span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Target Group Selector */}
          <div className="flex items-center space-x-1.5 bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-rust-400" />
            <span className="text-xs text-zinc-400 font-medium">Group:</span>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                fetchGroupPerms(e.target.value);
              }}
              className="bg-transparent text-xs text-zinc-200 font-semibold focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g} value={g} className="bg-zinc-900 text-zinc-200">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plugins..."
              className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-40 sm:w-52"
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

          {/* Refresh List */}
          <button
            onClick={() => {
              rconService.sendCommand('plugins');
              fetchPermissionsAndGroups();
            }}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition-colors"
            title="Refresh list and permissions"
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

      {/* Core Oxide Permissions Twisty Header Card */}
      {coreOxidePerms.length > 0 && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div
            onClick={() => toggleExpand('__oxide_core__')}
            className="p-3.5 bg-zinc-950/60 hover:bg-zinc-850/80 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              {expandedPlugins['__oxide_core__'] ? (
                <ChevronDown className="w-4 h-4 text-rust-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
              <ShieldCheck className="w-4 h-4 text-rust-500" />
              <span className="font-bold text-xs text-zinc-200">Core Oxide Permissions</span>
              <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-400 font-mono text-[10px] rounded">
                {coreOxidePerms.length} perms
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">
              Click to manage core administrator permissions
            </span>
          </div>

          {expandedPlugins['__oxide_core__'] && (
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  Managing permissions for group: <strong className="text-rust-400 font-mono">{selectedGroup}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => grantAllForPlugin(coreOxidePerms, selectedGroup)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded text-[11px] font-semibold"
                  >
                    Grant All
                  </button>
                  <button
                    onClick={() => revokeAllForPlugin(coreOxidePerms, selectedGroup)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-rose-400 rounded text-[11px] font-semibold"
                  >
                    Revoke All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {coreOxidePerms.map((perm) => {
                  const isGranted = (grantedPermsByGroup[selectedGroup] || new Set()).has(perm);
                  return (
                    <button
                      key={perm}
                      onClick={() => togglePermission(perm, selectedGroup)}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between text-xs font-mono transition-all ${
                        isGranted
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="truncate pr-1" title={perm}>{perm}</span>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          isGranted ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-600'
                        }`}
                      >
                        {isGranted ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plugins Table with Expanding Twisty Rows */}
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
                  <th className="py-3 px-4 w-10"></th>
                  <th className="py-3 px-4">Plugin Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Memory</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPlugins.map((plugin) => {
                  const isLoaded = plugin.status === 'loaded';
                  const isUnloaded = plugin.status === 'unloaded';
                  const hasError = plugin.status === 'error';
                  const isLoading = loadingPlugin === plugin.stem;
                  const isExpanded = !!expandedPlugins[plugin.stem];
                  const pluginPerms = getPluginPermissions(plugin.stem, plugin.name);

                  return (
                    <React.Fragment key={plugin.stem}>
                      <tr
                        className={`hover:bg-zinc-800/40 transition-colors ${
                          hasError
                            ? 'bg-rose-950/20'
                            : isUnloaded
                            ? 'bg-zinc-950/40 opacity-75'
                            : ''
                        }`}
                      >
                        {/* Twisty Expanding Chevron */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleExpand(plugin.stem)}
                            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                            title="Expand permissions grid"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-rust-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-zinc-500" />
                            )}
                          </button>
                        </td>

                        {/* Plugin Name & Stem */}
                        <td className="py-3 px-4 font-semibold text-zinc-100 flex items-center space-x-2">
                          {hasError ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                          ) : isUnloaded ? (
                            <Power className="w-4 h-4 text-zinc-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span>{plugin.name}</span>
                              <button
                                onClick={() => toggleExpand(plugin.stem)}
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded transition-colors ${
                                  pluginPerms.length > 0
                                    ? 'bg-zinc-800 hover:bg-rust-950 text-rust-400 border border-rust-500/30'
                                    : 'bg-zinc-950 text-zinc-500'
                                }`}
                              >
                                {pluginPerms.length} {pluginPerms.length === 1 ? 'perm' : 'perms'}
                              </button>
                            </div>
                            <span className="block text-[10px] text-zinc-500 font-mono font-normal">
                              {plugin.filename}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
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

                        {/* Version */}
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          {isUnloaded ? '-' : `v${plugin.version}`}
                        </td>

                        {/* Author */}
                        <td className="py-3 px-4 text-zinc-400">{plugin.author}</td>

                        {/* Memory */}
                        <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                          {plugin.memory}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
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

                      {/* Twisty Expanding Permissions Grid Under This Plugin */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-zinc-950/90 border-b border-zinc-800">
                            <div className="p-4 space-y-3 bg-zinc-950/60 border-l-2 border-rust-500 animate-in fade-in duration-150">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                                <div className="flex items-center space-x-2">
                                  <ShieldCheck className="w-4 h-4 text-rust-400" />
                                  <h4 className="font-bold text-xs text-zinc-200">
                                    Permissions for <span className="text-rust-400">{plugin.name}</span>
                                  </h4>
                                  <span className="text-zinc-500 text-[11px]">
                                    (Group: <strong className="text-zinc-300 font-mono">{selectedGroup}</strong>)
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {pluginPerms.length > 0 && (
                                    <>
                                      <button
                                        onClick={() => grantAllForPlugin(pluginPerms, selectedGroup)}
                                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 rounded text-[11px] font-semibold transition-colors"
                                      >
                                        Grant All to "{selectedGroup}"
                                      </button>
                                      <button
                                        onClick={() => revokeAllForPlugin(pluginPerms, selectedGroup)}
                                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 rounded text-[11px] font-semibold transition-colors"
                                      >
                                        Revoke All
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Permissions Grid */}
                              {pluginPerms.length === 0 ? (
                                <div className="py-4 text-center text-zinc-500 text-xs italic bg-zinc-900/50 rounded-lg border border-zinc-800/60">
                                  No registered Oxide permissions found matching stem "{plugin.stem}".
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                                  {pluginPerms.map((perm) => {
                                    const isGranted = (grantedPermsByGroup[selectedGroup] || new Set()).has(perm);
                                    return (
                                      <button
                                        key={perm}
                                        onClick={() => togglePermission(perm, selectedGroup)}
                                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs font-mono transition-all ${
                                          isGranted
                                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 shadow-sm'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                      >
                                        <div className="min-w-0 pr-1">
                                          <span className="block truncate font-medium" title={perm}>
                                            {perm}
                                          </span>
                                          <span className="text-[10px] text-zinc-500">
                                            {isGranted ? 'Active on group' : 'Not granted'}
                                          </span>
                                        </div>
                                        <span
                                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                                            isGranted ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-600'
                                          }`}
                                        >
                                          {isGranted ? '✓' : ''}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
