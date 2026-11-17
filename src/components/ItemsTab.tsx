import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Gift, 
  Users, 
  X, 
  Check, 
  Zap,
  Filter
} from 'lucide-react';
import { RUST_ITEMS, RustItem, getItemIconUrl } from '../data/rustItems';
import { rconService } from '../services/rconService';
import { Player } from '../types/rcon';

export const ItemsTab: React.FC = () => {
  const [items] = useState<RustItem[]>(RUST_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedItem, setSelectedItem] = useState<RustItem | null>(null);
  const [targetPlayerId, setTargetPlayerId] = useState<string>('self');
  const [amount, setAmount] = useState<number>(1);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = rconService.onPlayers(setPlayers);
    rconService.sendCommand('status');
    return () => unsub();
  }, []);

  const categories = [
    'All',
    'Weapons',
    'Ammo',
    'Resources',
    'Medical',
    'Construction',
    'Deployables',
    'Tools',
    'Electrical',
    'Vehicles',
  ];

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.shortname.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenGive = (item: RustItem) => {
    setSelectedItem(item);
    setAmount(item.defaultAmount || 1);
  };

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      if (targetPlayerId === 'self') {
        await rconService.sendCommand(`inventory.give "${selectedItem.shortname}" ${amount}`);
        setToast(`Gave ${amount}x ${selectedItem.name} to Console`);
      } else {
        const player = players.find((p) => p.id === targetPlayerId);
        await rconService.sendCommand(`inventory.giveid "${targetPlayerId}" "${selectedItem.shortname}" ${amount}`);
        setToast(`Gave ${amount}x ${selectedItem.name} to ${player ? player.name : targetPlayerId}`);
      }
    } catch (err: any) {
      setToast(`Failed to give item: ${err.message}`);
    }

    setSelectedItem(null);
    setTimeout(() => setToast(null), 3000);
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

      {/* Header and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Package className="w-5 h-5 text-rust-500" />
          <div>
            <h2 className="text-base font-bold text-zinc-100">Item Spawner & Browser</h2>
            <p className="text-xs text-zinc-400">Search and give any item directly to players</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item name or shortname (e.g. ak, scrap)..."
            className="pl-9 pr-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-full sm:w-72 transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-rust-600 text-white shadow-sm'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.shortname}
            onClick={() => handleOpenGive(item)}
            className="group bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-rust-500/60 rounded-xl p-3 flex flex-col justify-between items-center text-center cursor-pointer transition-all shadow-sm hover:shadow-lg hover:shadow-rust-950/20"
          >
            <div className="w-20 h-20 flex items-center justify-center p-1 relative mb-2">
              <img
                src={getItemIconUrl(item.shortname)}
                alt={item.name}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="w-full">
              <h4 className="text-xs font-bold text-zinc-200 group-hover:text-rust-400 transition-colors truncate">
                {item.name}
              </h4>
              <span className="block text-[10px] font-mono text-zinc-500 truncate">
                {item.shortname}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenGive(item);
              }}
              className="mt-2 w-full py-1 bg-zinc-800 group-hover:bg-rust-600 text-zinc-300 group-hover:text-white rounded text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
            >
              <Gift className="w-3 h-3" />
              <span>Give</span>
            </button>
          </div>
        ))}
      </div>

      {/* Give Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
              <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-lg p-1 flex items-center justify-center">
                <img
                  src={getItemIconUrl(selectedItem.shortname)}
                  alt={selectedItem.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100">{selectedItem.name}</h3>
                <span className="text-xs font-mono text-rust-400">{selectedItem.shortname}</span>
              </div>
            </div>

            <form onSubmit={handleGive} className="space-y-3">
              {/* Target Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Target Player
                </label>
                <select
                  value={targetPlayerId}
                  onChange={(e) => setTargetPlayerId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                >
                  <option value="self">Console / Self (inventory.give)</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000000"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-rust-500"
                  required
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1, 10, 50, 100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                      amount === amt
                        ? 'bg-rust-600 text-white'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Give Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
