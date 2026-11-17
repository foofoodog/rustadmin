import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Search, 
  RotateCw, 
  Zap, 
  UserPlus, 
  UserMinus,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { Player } from '../types/rcon';

interface GroupData {
  name: string;
  permissions: Set<string>;
  players: string[];
}

export const PermissionsManager: React.FC = () => {
  const [allPerms, setAllPerms] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>(['default', 'admin']);
  const [targetType, setTargetType] = useState<'group' | 'user'>('group');
  const [selectedGroup, setSelectedGroup] = useState<string>('default');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
  const [grantedPerms, setGrantedPerms] = useState<Set<string>>(new Set());
  const [groupPlayers, setGroupPlayers] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newPlayerId, setNewPlayerId] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubPlayers = rconService.onPlayers(setOnlinePlayers);
    loadAllPermissions();
    loadGroups();
    return () => unsubPlayers();
  }, []);

  useEffect(() => {
    if (targetType === 'group' && selectedGroup) {
      loadGroupDetails(selectedGroup);
    } else if (targetType === 'user' && selectedUser) {
      loadUserDetails(selectedUser);
    }
  }, [targetType, selectedGroup, selectedUser]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadAllPermissions = async () => {
    try {
      const resp = await rconService.sendCommand('oxide.show perms');
      if (resp && resp.Message) {
        // Parse permissions list
        const text = resp.Message.replace(/^Permissions:\s*/i, '').trim();
        const perms = text.split(/,\s*/).map((p) => p.trim()).filter(Boolean);
        if (perms.length > 0) {
          setAllPerms(Array.from(new Set(perms)).sort());
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadGroups = async () => {
    try {
      const resp = await rconService.sendCommand('oxide.show groups');
      if (resp && resp.Message) {
        const text = resp.Message.replace(/^Groups:\s*/i, '').trim();
        const grps = text.split(/,\s*/).map((g) => g.trim()).filter(Boolean);
        if (grps.length > 0) {
          setGroups(Array.from(new Set(grps)));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadGroupDetails = async (groupName: string) => {
    setLoading(true);
    try {
      const resp = await rconService.sendCommand(`oxide.show group ${groupName}`);
      if (resp && resp.Message) {
        parseTargetDetails(resp.Message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    setLoading(true);
    try {
      const resp = await rconService.sendCommand(`oxide.show user ${userId}`);
      if (resp && resp.Message) {
        parseTargetDetails(resp.Message);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseTargetDetails = (text: string) => {
    const lines = text.split('\n');
    let permsSection = false;
    let playersSection = false;
    const perms = new Set<string>();
    const plrs: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.includes('permissions:')) {
        permsSection = true;
        playersSection = false;
        continue;
      }
      if (line.includes('players:') || line.includes('groups:')) {
        playersSection = true;
        permsSection = false;
        continue;
      }

      if (permsSection) {
        if (!line.includes('No permissions')) {
          line.split(/,\s*/).forEach((p) => {
            const clean = p.trim();
            if (clean) perms.add(clean);
          });
        }
      }

      if (playersSection) {
        line.split(/,\s*/).forEach((pl) => {
          const clean = pl.trim();
          if (clean) plrs.push(clean);
        });
      }
    }

    setGrantedPerms(perms);
    setGroupPlayers(plrs);
  };

  const togglePermission = async (perm: string) => {
    const isGranted = grantedPerms.has(perm);
    const target = targetType === 'group' ? selectedGroup : selectedUser;
    const cmd = isGranted
      ? `oxide.revoke ${targetType} "${target}" "${perm}"`
      : `oxide.grant ${targetType} "${target}" "${perm}"`;

    try {
      // Optimistic update
      const next = new Set(grantedPerms);
      if (isGranted) {
        next.delete(perm);
      } else {
        next.add(perm);
      }
      setGrantedPerms(next);

      await rconService.sendCommand(cmd);
      triggerToast(isGranted ? `Revoked ${perm}` : `Granted ${perm}`);
    } catch (err: any) {
      triggerToast(`Error: ${err.message}`);
      // Revert on error
      if (targetType === 'group') loadGroupDetails(selectedGroup);
      else loadUserDetails(selectedUser);
    }
  };

  const grantCategory = async (categoryPerms: string[]) => {
    const target = targetType === 'group' ? selectedGroup : selectedUser;
    for (const perm of categoryPerms) {
      if (!grantedPerms.has(perm)) {
        await rconService.sendCommand(`oxide.grant ${targetType} "${target}" "${perm}"`);
      }
    }
    const next = new Set(grantedPerms);
    categoryPerms.forEach((p) => next.add(p));
    setGrantedPerms(next);
    triggerToast(`Granted all in category`);
  };

  const revokeCategory = async (categoryPerms: string[]) => {
    const target = targetType === 'group' ? selectedGroup : selectedUser;
    for (const perm of categoryPerms) {
      if (grantedPerms.has(perm)) {
        await rconService.sendCommand(`oxide.revoke ${targetType} "${target}" "${perm}"`);
      }
    }
    const next = new Set(grantedPerms);
    categoryPerms.forEach((p) => next.delete(p));
    setGrantedPerms(next);
    triggerToast(`Revoked all in category`);
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const g = newGroupName.trim().toLowerCase();
    if (!g) return;
    await rconService.sendCommand(`oxide.group add "${g}"`);
    setNewGroupName('');
    triggerToast(`Group '${g}' created`);
    loadGroups();
  };

  const handleAddUserToGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = newPlayerId.trim();
    if (!uid || !selectedGroup) return;
    await rconService.sendCommand(`oxide.usergroup add "${uid}" "${selectedGroup}"`);
    setNewPlayerId('');
    triggerToast(`Added ${uid} to group ${selectedGroup}`);
    loadGroupDetails(selectedGroup);
  };

  const handleRemoveUserFromGroup = async (playerStr: string) => {
    // playerStr is e.g. "76561198000000000 (Name)"
    const m = playerStr.match(/(\d{17})/);
    const uid = m ? m[1] : playerStr;
    await rconService.sendCommand(`oxide.usergroup remove "${uid}" "${selectedGroup}"`);
    triggerToast(`Removed from group ${selectedGroup}`);
    loadGroupDetails(selectedGroup);
  };

  // Group permissions by plugin prefix (e.g. buildinggrades.* -> Building Grades)
  const groupedPerms: { [prefix: string]: string[] } = {};
  for (const perm of allPerms) {
    if (search && !perm.toLowerCase().includes(search.toLowerCase())) {
      continue;
    }
    const prefix = perm.split('.')[0] || 'other';
    if (!groupedPerms[prefix]) groupedPerms[prefix] = [];
    groupedPerms[prefix].push(perm);
  }

  const formatPluginHeader = (prefix: string) => {
    const map: { [key: string]: string } = {
      buildinggrades: 'Building Grades',
      blueprintmanager: 'Blueprint Manager',
      copypaste: 'Copy Paste',
      instantcraft: 'Instant Craft',
      kits: 'Kits',
      stacksizecontroller: 'Stack Size Controller',
      buildrace: 'Build Race',
      oxide: 'Oxide Core Admin',
    };
    return map[prefix.toLowerCase()] || prefix.toUpperCase();
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

      {/* Target Selector Toolbar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-rust-500" />
            <div>
              <h2 className="text-base font-bold text-zinc-100">Permissions Configurator</h2>
              <p className="text-xs text-zinc-400">Configure Oxide permissions per Group or Player</p>
            </div>
          </div>

          {/* Toggle Group vs User */}
          <div className="flex items-center space-x-2">
            <div className="bg-zinc-950 p-1 rounded-lg border border-zinc-800 flex text-xs">
              <button
                onClick={() => setTargetType('group')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  targetType === 'group'
                    ? 'bg-rust-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Manage Group
              </button>
              <button
                onClick={() => setTargetType('user')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  targetType === 'user'
                    ? 'bg-rust-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Manage Player
              </button>
            </div>

            <button
              onClick={() => {
                loadAllPermissions();
                if (targetType === 'group') loadGroupDetails(selectedGroup);
                else if (selectedUser) loadUserDetails(selectedUser);
              }}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition-colors"
              title="Refresh Permissions"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Target Select Options */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-800">
          {targetType === 'group' ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Select Group:</span>
              {groups.map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedGroup === grp
                      ? 'bg-rust-600 text-white shadow-sm'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {grp}
                </button>
              ))}

              {/* Add New Group inline */}
              <form onSubmit={handleAddGroup} className="flex items-center space-x-1.5 ml-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name..."
                  className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-32"
                />
                <button
                  type="submit"
                  className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs"
                  title="Create Group"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Select Player:</span>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
              >
                <option value="">-- Choose connected player or enter SteamID --</option>
                {onlinePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                placeholder="Or paste SteamID..."
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-48 font-mono"
              />
            </div>
          )}

          {/* Search Filter */}
          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter permissions..."
              className="pl-8 pr-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Group Members Section (if Group selected) */}
      {targetType === 'group' && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-rust-500" />
              <span>Players in Group '{selectedGroup}' ({groupPlayers.length})</span>
            </span>

            {/* Add User to Group Form */}
            <form onSubmit={handleAddUserToGroup} className="flex items-center space-x-2">
              <input
                type="text"
                value={newPlayerId}
                onChange={(e) => setNewPlayerId(e.target.value)}
                placeholder="SteamID to add..."
                className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-48 font-mono"
              />
              <button
                type="submit"
                className="flex items-center space-x-1 px-3 py-1 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-xs font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2">
            {groupPlayers.length === 0 ? (
              <span className="text-xs text-zinc-500 italic">No players explicitly assigned to this group.</span>
            ) : (
              groupPlayers.map((plr) => (
                <div
                  key={plr}
                  className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg text-xs flex items-center space-x-2 text-zinc-300"
                >
                  <span>{plr}</span>
                  <button
                    onClick={() => handleRemoveUserFromGroup(plr)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Remove from group"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Permissions Categories Grid */}
      <div className="space-y-4">
        {Object.keys(groupedPerms).length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm bg-zinc-900 border border-zinc-800 rounded-xl">
            No permissions matching "{search}".
          </div>
        ) : (
          Object.entries(groupedPerms).map(([prefix, perms]) => {
            const grantedCount = perms.filter((p) => grantedPerms.has(p)).length;
            const allGranted = grantedCount === perms.length;

            return (
              <div
                key={prefix}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-zinc-100">
                      {formatPluginHeader(prefix)}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      ({grantedCount}/{perms.length} granted)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      onClick={() => grantCategory(perms)}
                      className="px-2.5 py-1 bg-zinc-950 hover:bg-emerald-950 hover:text-emerald-400 border border-zinc-800 rounded text-[11px] font-semibold text-zinc-300 transition-colors"
                    >
                      Grant All
                    </button>
                    <button
                      onClick={() => revokeCategory(perms)}
                      className="px-2.5 py-1 bg-zinc-950 hover:bg-rose-950 hover:text-rose-400 border border-zinc-800 rounded text-[11px] font-semibold text-zinc-400 transition-colors"
                    >
                      Revoke All
                    </button>
                  </div>
                </div>

                {/* Permissions Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {perms.map((perm) => {
                    const isGranted = grantedPerms.has(perm);
                    return (
                      <div
                        key={perm}
                        onClick={() => togglePermission(perm)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all select-none text-xs ${
                          isGranted
                            ? 'bg-emerald-950/30 border-emerald-800/60 text-zinc-100'
                            : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-mono text-[11px] truncate pr-2">
                          <span className={isGranted ? 'text-emerald-400 font-semibold' : ''}>
                            {perm}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            isGranted
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-zinc-700 bg-zinc-900'
                          }`}
                        >
                          {isGranted && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
