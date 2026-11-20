import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Gift, 
  Users, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Zap, 
  Sword, 
  Hammer, 
  HeartPulse, 
  Sparkles, 
  Edit3,
  X,
  Search
} from 'lucide-react';
import { ItemSprite } from './ItemSprite';
import { rconService } from '../services/rconService';
import { Player } from '../types/rcon';
import { RUST_ITEMS, RustItem } from '../data/rustItems';

export interface KitItem {
  shortname: string;
  name: string;
  amount: number;
}

export interface KitPreset {
  id: string;
  name: string;
  description: string;
  category: 'PVP' | 'Raid' | 'Build' | 'Support' | 'Custom';
  items: KitItem[];
  isBuiltin?: boolean;
}

const BUILTIN_KITS: KitPreset[] = [
  {
    id: 'full-metal-ak',
    name: 'Full Metal AK-47',
    description: 'Tier 3 endgame combat loadout with high-velocity rifle ammo and syringes.',
    category: 'PVP',
    isBuiltin: true,
    items: [
      { shortname: 'rifle.ak', name: 'Assault Rifle', amount: 1 },
      { shortname: 'metal.facemask', name: 'Metal Facemask', amount: 1 },
      { shortname: 'metal.plate.torso', name: 'Metal Chestplate', amount: 1 },
      { shortname: 'hoodie', name: 'Hoodie', amount: 1 },
      { shortname: 'pants', name: 'Pants', amount: 1 },
      { shortname: 'shoes.boots', name: 'Boots', amount: 1 },
      { shortname: 'tactical.gloves', name: 'Tactical Gloves', amount: 1 },
      { shortname: 'ammo.rifle', name: '5.56 Rifle Ammo', amount: 128 },
      { shortname: 'syringe.medical', name: 'Medical Syringe', amount: 4 },
      { shortname: 'bandage', name: 'Bandage', amount: 3 }
    ]
  },
  {
    id: 'full-roadsign-sar',
    name: 'Roadsign SAR',
    description: 'Mid-game roamer setup with Semi-Automatic Rifle and full roadsign armor.',
    category: 'PVP',
    isBuiltin: true,
    items: [
      { shortname: 'rifle.semiauto', name: 'Semi-Automatic Rifle', amount: 1 },
      { shortname: 'coffeecan.helmet', name: 'Coffee Can Helmet', amount: 1 },
      { shortname: 'roadsign.jacket', name: 'Roadsign Jacket', amount: 1 },
      { shortname: 'roadsign.kilt', name: 'Roadsign Kilt', amount: 1 },
      { shortname: 'hoodie', name: 'Hoodie', amount: 1 },
      { shortname: 'pants', name: 'Pants', amount: 1 },
      { shortname: 'ammo.rifle', name: '5.56 Rifle Ammo', amount: 64 },
      { shortname: 'syringe.medical', name: 'Medical Syringe', amount: 3 }
    ]
  },
  {
    id: 'heavy-raid-breacher',
    name: 'Heavy Raid Breacher',
    description: 'Heavy armor juggernaut loadout equipped with Rocket Launcher and Timed C4.',
    category: 'Raid',
    isBuiltin: true,
    items: [
      { shortname: 'rocket.launcher', name: 'Rocket Launcher', amount: 1 },
      { shortname: 'heavy.plate.helmet', name: 'Heavy Plate Helmet', amount: 1 },
      { shortname: 'heavy.plate.jacket', name: 'Heavy Plate Jacket', amount: 1 },
      { shortname: 'heavy.plate.pants', name: 'Heavy Plate Pants', amount: 1 },
      { shortname: 'ammo.rocket.basic', name: 'Rocket', amount: 4 },
      { shortname: 'ammo.rocket.hv', name: 'HV Rocket', amount: 6 },
      { shortname: 'explosive.timed', name: 'Timed Explosive Charge', amount: 4 },
      { shortname: 'syringe.medical', name: 'Medical Syringe', amount: 6 }
    ]
  },
  {
    id: 'base-builder-starter',
    name: 'Base Builder Starter',
    description: 'Instant foundation kit with resources, tools, TC, code lock and metal door.',
    category: 'Build',
    isBuiltin: true,
    items: [
      { shortname: 'building.planner', name: 'Building Plan', amount: 1 },
      { shortname: 'hammer', name: 'Hammer', amount: 1 },
      { shortname: 'cupboard.tool', name: 'Tool Cupboard', amount: 1 },
      { shortname: 'wood', name: 'Wood', amount: 5000 },
      { shortname: 'stones', name: 'Stones', amount: 5000 },
      { shortname: 'metal.fragments', name: 'Metal Fragments', amount: 2000 },
      { shortname: 'door.hinged.metal', name: 'Sheet Metal Door', amount: 2 },
      { shortname: 'lock.code', name: 'Code Lock', amount: 2 }
    ]
  },
  {
    id: 'electrician-toolkit',
    name: 'Electrician Toolkit',
    description: 'Complete industrial/electrical pack with large battery, solar, switches, and wiring.',
    category: 'Build',
    isBuiltin: true,
    items: [
      { shortname: 'wiretool', name: 'Wire Tool', amount: 1 },
      { shortname: 'electric.battery.rechargable.large', name: 'Large Rechargeable Battery', amount: 2 },
      { shortname: 'electric.solarpanel.large', name: 'Large Solar Panel', amount: 4 },
      { shortname: 'electrical.branch', name: 'Electrical Branch', amount: 4 },
      { shortname: 'electric.switch', name: 'Switch', amount: 4 },
      { shortname: 'electric.splitter', name: 'Splitter', amount: 2 },
      { shortname: 'ceilinglight', name: 'Ceiling Light', amount: 6 }
    ]
  },
  {
    id: 'medic-care-package',
    name: 'Emergency Medic Kit',
    description: 'High-tier healing supplies, large medkits, and anti-radiation medicine.',
    category: 'Support',
    isBuiltin: true,
    items: [
      { shortname: 'largemedkit', name: 'Large Medkit', amount: 4 },
      { shortname: 'syringe.medical', name: 'Medical Syringe', amount: 12 },
      { shortname: 'bandage', name: 'Bandage', amount: 10 },
      { shortname: 'antiradpills', name: 'Anti-Radiation Pills', amount: 6 }
    ]
  }
];

export const KitsTab: React.FC = () => {
  const [kits, setKits] = useState<KitPreset[]>(() => {
    try {
      const saved = localStorage.getItem('rustadmin_custom_kits');
      if (saved) {
        const custom: KitPreset[] = JSON.parse(saved);
        return [...BUILTIN_KITS, ...custom];
      }
    } catch {}
    return BUILTIN_KITS;
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [targetPlayerId, setTargetPlayerId] = useState<string>('self');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);
  const [givingKitId, setGivingKitId] = useState<string | null>(null);

  // Custom Kit Creation Modal
  const [isCreating, setIsCreating] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const [newKitDesc, setNewKitDesc] = useState('');
  const [newKitItems, setNewKitItems] = useState<KitItem[]>([]);
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    const unsub = rconService.onPlayers((newPlayers) => {
      setPlayers(newPlayers);
      if (newPlayers.length > 0) {
        setTargetPlayerId((prev) => (prev === 'self' || !prev ? newPlayers[0].id : prev));
      }
    });
    rconService.sendCommand('status');
    return () => unsub();
  }, []);

  const saveCustomKitsToStorage = (allKits: KitPreset[]) => {
    const custom = allKits.filter((k) => !k.isBuiltin);
    localStorage.setItem('rustadmin_custom_kits', JSON.stringify(custom));
  };

  const handleGiveKit = async (kit: KitPreset) => {
    setGivingKitId(kit.id);
    const targetDesc = targetPlayerId === 'all'
      ? 'All Online Players'
      : targetPlayerId === 'self' 
      ? 'Console / Self' 
      : players.find((p) => p.id === targetPlayerId)?.name || targetPlayerId;

    try {
      for (const item of kit.items) {
        if (targetPlayerId === 'all') {
          await rconService.sendCommand(`inventory.giveall "${item.shortname}" ${item.amount}`);
        } else if (targetPlayerId === 'self') {
          await rconService.sendCommand(`inventory.give "${item.shortname}" ${item.amount}`);
        } else {
          await rconService.sendCommand(`inventory.giveto "${targetPlayerId}" "${item.shortname}" ${item.amount}`);
        }
      }
      setToast(`Successfully gave "${kit.name}" to ${targetDesc}`);
    } catch (err: any) {
      setToast(`Error giving kit: ${err.message}`);
    } finally {
      setGivingKitId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteCustomKit = (id: string) => {
    const updated = kits.filter((k) => k.id !== id);
    setKits(updated);
    saveCustomKitsToStorage(updated);
  };

  const handleAddItemToNewKit = (item: RustItem) => {
    setNewKitItems((prev) => {
      const existing = prev.find((i) => i.shortname === item.shortname);
      if (existing) {
        return prev.map((i) =>
          i.shortname === item.shortname ? { ...i, amount: i.amount + 1 } : i
        );
      }
      return [...prev, { shortname: item.shortname, name: item.name, amount: item.defaultAmount || 1 }];
    });
  };

  const handleSaveNewKit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKitName.trim() || newKitItems.length === 0) return;

    const newKit: KitPreset = {
      id: `custom-${Date.now()}`,
      name: newKitName.trim(),
      description: newKitDesc.trim() || 'Custom administrator loadout',
      category: 'Custom',
      isBuiltin: false,
      items: newKitItems
    };

    const updated = [...kits, newKit];
    setKits(updated);
    saveCustomKitsToStorage(updated);

    setIsCreating(false);
    setNewKitName('');
    setNewKitDesc('');
    setNewKitItems([]);
    setToast(`Saved custom kit "${newKit.name}"`);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredItemsForBuilder = RUST_ITEMS.filter((i) =>
    itemSearch.trim()
      ? i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        i.shortname.toLowerCase().includes(itemSearch.toLowerCase())
      : true
  ).slice(0, 30);

  const filteredKits = kits.filter((k) =>
    selectedCategory === 'All' ? true : k.category === selectedCategory
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-rust-500/50 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4 text-rust-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-rust-500 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-zinc-100">Kits & Loadout Spawner</h2>
              <span className="px-2 py-0.5 bg-zinc-800 text-rust-400 font-mono text-xs font-semibold rounded">
                {kits.length} Presets
              </span>
            </div>
            <p className="text-xs text-zinc-400">1-click full gear loadouts with multi-item batch delivery</p>
          </div>
        </div>

        {/* Target Player and Create Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400 font-medium">Give to:</span>
            <select
              value={targetPlayerId}
              onChange={(e) => setTargetPlayerId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
            >
              {players.length > 0 ? (
                <>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                  <option value="all">All Online Players ({players.length})</option>
                  <option value="self">Console / Self</option>
                </>
              ) : (
                <option value="self">No players online (Console / Self)</option>
              )}
            </select>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rust-600 hover:bg-rust-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Kit</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2">
        {['All', 'PVP', 'Raid', 'Build', 'Support', 'Custom'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-rust-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Kit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKits.map((kit) => {
          const isGiving = givingKitId === kit.id;
          return (
            <div
              key={kit.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-zinc-800 text-rust-400 border border-zinc-700/60">
                      {kit.category}
                    </span>
                    <h3 className="font-bold text-sm text-zinc-100 mt-2">{kit.name}</h3>
                  </div>
                  {!kit.isBuiltin && (
                    <button
                      onClick={() => handleDeleteCustomKit(kit.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Delete Custom Kit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{kit.description}</p>

                {/* Items Preview Grid with Sprites */}
                <div className="mt-3.5 pt-3 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
                    Included Items ({kit.items.length}):
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {kit.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-1 flex flex-col items-center justify-center relative group/item"
                        title={`${item.name} (${item.amount}x)`}
                      >
                        <ItemSprite
                          shortname={item.shortname}
                          size={36}
                          alt={item.name}
                        />
                        <span className="text-[9px] font-mono text-zinc-400 font-semibold mt-0.5">
                          x{item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleGiveKit(kit)}
                disabled={isGiving}
                className="mt-4 w-full py-2 bg-zinc-800 hover:bg-rust-600 active:bg-rust-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Gift className={`w-3.5 h-3.5 ${isGiving ? 'animate-spin' : ''}`} />
                <span>{isGiving ? 'Spawning Kit...' : `Give Kit (${kit.items.length} items)`}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* New Custom Kit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-rust-500" />
                <h3 className="font-bold text-sm text-zinc-100">Create Custom Loadout Kit</h3>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewKit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Kit Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Combat Kit"
                  value={newKitName}
                  onChange={(e) => setNewKitName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full metal AK kit with extra meds"
                  value={newKitDesc}
                  onChange={(e) => setNewKitDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                />
              </div>

              {/* Items Selected */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Selected Items ({newKitItems.length})
                </label>
                {newKitItems.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    No items added yet. Click items from the item picker below to add them.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                    {newKitItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 bg-zinc-900 border border-zinc-700/60 rounded-md px-2 py-1 text-xs text-zinc-200"
                      >
                        <ItemSprite shortname={item.shortname} size={24} />
                        <span className="font-medium">{item.name}</span>
                        <input
                          type="number"
                          min="1"
                          value={item.amount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 1;
                            setNewKitItems((prev) =>
                              prev.map((i, iIdx) => (iIdx === idx ? { ...i, amount: val } : i))
                            );
                          }}
                          className="w-12 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] font-mono text-center text-rust-400"
                        />
                        <button
                          type="button"
                          onClick={() => setNewKitItems((prev) => prev.filter((_, iIdx) => iIdx !== idx))}
                          className="text-zinc-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Item Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Click to Add Items
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Search item to add..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                  />
                </div>
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                  {filteredItemsForBuilder.map((item) => (
                    <button
                      key={item.shortname}
                      type="button"
                      onClick={() => handleAddItemToNewKit(item)}
                      className="flex flex-col items-center justify-center p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-rust-500/50 rounded-lg transition-all"
                      title={item.name}
                    >
                      <ItemSprite shortname={item.shortname} size={36} />
                      <span className="text-[10px] text-zinc-400 truncate max-w-full text-center mt-1">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newKitItems.length === 0}
                  className="px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  Save Kit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
