import React, { useState, useEffect } from 'react';
import { 
  Users, 
  RefreshCw, 
  UserX, 
  ShieldBan, 
  VolumeX, 
  MapPin, 
  Gift, 
  Copy, 
  Check, 
  Search,
  ExternalLink
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { Player } from '../types/rcon';

export const PlayersTab: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [actionModal, setActionModal] = useState<'kick' | 'ban' | 'give' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [giveItem, setGiveItem] = useState('wood');
  const [giveAmount, setGiveAmount] = useState('1000');

  useEffect(() => {
    const unsub = rconService.onPlayers(setPlayers);
    // Initial fetch
    rconService.sendCommand('status');
    return () => unsub();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAction = async () => {
    if (!selectedPlayer) return;

    if (actionModal === 'kick') {
      const reason = actionReason.trim() || 'Kicked by administrator';
      await rconService.sendCommand(`kick "${selectedPlayer.id}" "${reason}"`);
    } else if (actionModal === 'ban') {
      const reason = actionReason.trim() || 'Banned by administrator';
      await rconService.sendCommand(`ban "${selectedPlayer.id}" "${reason}"`);
    } else if (actionModal === 'give') {
      await rconService.sendCommand(`inventory.giveid "${selectedPlayer.id}" "${giveItem}" ${giveAmount}`);
    }

    setActionModal(null);
    setActionReason('');
    setSelectedPlayer(null);
    rconService.sendCommand('status');
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-rust-500" />
          <h2 className="text-base font-bold text-zinc-100">
            Connected Players ({players.length})
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player or SteamID..."
              className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-48 sm:w-64"
            />
          </div>
          <button
            onClick={() => rconService.sendCommand('status')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {filteredPlayers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            {players.length === 0 ? (
              <div className="space-y-2">
                <Users className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>No players are currently connected to the server.</p>
              </div>
            ) : (
              <p>No players matching "{search}".</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">SteamID</th>
                  <th className="py-3 px-4">Ping</th>
                  <th className="py-3 px-4">Connected</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-zinc-100 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-rust-950 border border-rust-800 flex items-center justify-center text-rust-400 font-bold text-xs uppercase">
                        {player.name.charAt(0)}
                      </div>
                      <span>{player.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      <div className="flex items-center space-x-1.5">
                        <span>{player.id}</span>
                        <button
                          onClick={() => handleCopy(player.id)}
                          className="text-zinc-500 hover:text-zinc-300 p-0.5"
                          title="Copy SteamID"
                        >
                          {copiedId === player.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        player.ping < 60
                          ? 'bg-emerald-950 text-emerald-400'
                          : player.ping < 120
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}>
                        {player.ping} ms
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{player.connected}</td>
                    <td className="py-3 px-4 text-zinc-400 font-mono">{player.addr}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Teleport */}
                        <button
                          onClick={() => rconService.sendCommand(`teleport2me "${player.id}"`)}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
                          title="Teleport to Me"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>

                        {/* Give Item */}
                        <button
                          onClick={() => {
                            setSelectedPlayer(player);
                            setActionModal('give');
                          }}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 rounded transition-colors"
                          title="Give Items"
                        >
                          <Gift className="w-4 h-4" />
                        </button>

                        {/* Mute */}
                        <button
                          onClick={() => rconService.sendCommand(`mute "${player.id}"`)}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-purple-400 rounded transition-colors"
                          title="Mute Chat"
                        >
                          <VolumeX className="w-4 h-4" />
                        </button>

                        {/* Kick */}
                        <button
                          onClick={() => {
                            setSelectedPlayer(player);
                            setActionModal('kick');
                          }}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 rounded transition-colors"
                          title="Kick Player"
                        >
                          <UserX className="w-4 h-4" />
                        </button>

                        {/* Ban */}
                        <button
                          onClick={() => {
                            setSelectedPlayer(player);
                            setActionModal('ban');
                          }}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                          title="Ban Player"
                        >
                          <ShieldBan className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal (Kick / Ban / Give) */}
      {actionModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 capitalize flex items-center space-x-2">
              {actionModal === 'kick' && <UserX className="w-5 h-5 text-amber-500" />}
              {actionModal === 'ban' && <ShieldBan className="w-5 h-5 text-rose-500" />}
              {actionModal === 'give' && <Gift className="w-5 h-5 text-emerald-500" />}
              <span>{actionModal} Player: {selectedPlayer.name}</span>
            </h3>

            {actionModal === 'give' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Item Shortname</label>
                  <input
                    type="text"
                    value={giveItem}
                    onChange={(e) => setGiveItem(e.target.value)}
                    placeholder="e.g. wood, scrap, rifle.ak"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Amount</label>
                  <input
                    type="number"
                    value={giveAmount}
                    onChange={(e) => setGiveAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Reason</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Reason for ${actionModal}...`}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedPlayer(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 text-white rounded-lg text-xs font-semibold transition-colors ${
                  actionModal === 'ban'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-rust-600 hover:bg-rust-500'
                }`}
              >
                Confirm {actionModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
