import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Gift, 
  Users, 
  X, 
  Check, 
  Zap,
  Filter,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  RUST_ITEMS, 
  RustItem, 
  RUST_CATEGORIES, 
  getItemIconUrl, 
  getItemFallbackIconUrl, 
  getItemTertiaryIconUrl 
} from '../data/rustItems';
import { rconService } from '../services/rconService';
import { Player } from '../types/rcon';

// Resilient Item Image with 3-tier CDN fallback and icon placeholder
const ItemImage: React.FC<{ item: RustItem; className?: string }> = ({ item, className = "max-h-full max-w-full object-contain" }) => {
  const [tier, setTier] = useState<number>(1);

  const handleError = () => {
    setTier((prev) => prev + 1);
  };

  if (tier === 1) {
    return (
      <img
        src={getItemIconUrl(item.shortname)}
        alt={item.name}
        loading="lazy"
        onError={handleError}
        className={className}
      />
    );
  }

  if (tier === 2) {
    return (
      <img
        src={getItemFallbackIconUrl(item.shortname)}
        alt={item.name}
        loading="lazy"
        onError={handleError}
        className={className}
      />
    );
  }

  if (tier === 3) {
    return (
      <img
        src={getItemTertiaryIconUrl(item.shortname, item.icon)}
        alt={item.name}
        loading="lazy"
        onError={handleError}
        className={className}
      />
    );
  }

  // Tier 4: Stylish Fallback Badge
  const shortDisplay = item.shortname.split('.').pop() || item.name.slice(0, 4);
  return (
    <div className="w-14 h-14 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex flex-col items-center justify-center text-zinc-400 group-hover:border-rust-500/50 transition-colors p-1">
      <Package className="w-6 h-6 text-rust-400/80 mb-0.5" />
      <span className="text-[9px] font-mono font-medium text-zinc-400 uppercase truncate max-w-[50px] text-center">
        {shortDisplay}
      </span>
    </div>
  );
};

export const ItemsTab: React.FC = () => {
  const [items] = useState<RustItem[]>(RUST_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedItem, setSelectedItem] = useState<RustItem | null>(null);
  const [targetPlayerId, setTargetPlayerId] = useState<string>('self');
  const [amount, setAmount] = useState<number>(1);
  const [toast, setToast] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(96);

  useEffect(() => {
    const unsub = rconService.onPlayers(setPlayers);
    rconService.sendCommand('status');
    return () => unsub();
  }, []);

  // Reset pagination limit when category or search changes
  useEffect(() => {
    setDisplayLimit(96);
  }, [selectedCategory, search]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: items.length };
    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1;
      if (item.isVehicle) {
        counts['Vehicles'] = (counts['Vehicles'] || 0) + 1;
      }
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory === 'Vehicles') {
        if (!item.isVehicle && item.category !== 'Vehicles') return false;
      } else if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          item.name.toLowerCase().includes(q) ||
          item.shortname.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, selectedCategory, search]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayLimit);
  }, [filteredItems, displayLimit]);

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
          <Package className="w-5 h-5 text-rust-500 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-zinc-100">Item Spawner & Browser</h2>
              <span className="px-2 py-0.5 bg-zinc-800 text-rust-400 font-mono text-xs font-semibold rounded">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
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
            placeholder="Search item name or shortname (e.g. salvaged, ak)..."
            className="pl-9 pr-8 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500 w-full sm:w-80 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {RUST_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-rust-600 text-white shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-rust-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Item Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-300">No items found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query or selected category</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {visibleItems.map((item) => (
              <div
                key={item.shortname}
                onClick={() => handleOpenGive(item)}
                className="group bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-rust-500/60 rounded-xl p-3 flex flex-col justify-between items-center text-center cursor-pointer transition-all shadow-sm hover:shadow-lg hover:shadow-rust-950/20 relative"
              >
                {/* Stack size badge if > 1 */}
                {item.stackable && item.stackable > 1 && (
                  <span className="absolute top-2 right-2 text-[10px] font-mono text-zinc-500 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-800">
                    x{item.stackable >= 1000 ? `${item.stackable / 1000}k` : item.stackable}
                  </span>
                )}

                <div className="w-20 h-20 flex items-center justify-center p-1 relative mb-2">
                  <ItemImage
                    item={item}
                    className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="w-full">
                  <h4
                    className="text-xs font-bold text-zinc-200 group-hover:text-rust-400 transition-colors truncate"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  <span
                    className="block text-[10px] font-mono text-zinc-500 truncate"
                    title={item.shortname}
                  >
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

          {/* Load More Button for progressive rendering */}
          {visibleItems.length < filteredItems.length && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 96)}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-rust-500/40 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-2 shadow-sm"
              >
                <ChevronDown className="w-4 h-4 text-rust-400" />
                <span>
                  Load More Items (Showing {visibleItems.length} of {filteredItems.length})
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Give Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start space-x-3 border-b border-zinc-800 pb-3">
              <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 flex items-center justify-center shrink-0">
                <ItemImage
                  item={selectedItem}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-zinc-100 truncate">{selectedItem.name}</h3>
                  {selectedItem.rarity && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                      {selectedItem.rarity}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-rust-400 block truncate">{selectedItem.shortname}</span>
                <div className="flex items-center space-x-3 text-[11px] text-zinc-500 mt-1">
                  <span>Category: <strong className="text-zinc-400">{selectedItem.category}</strong></span>
                  {selectedItem.stackable && (
                    <span>Stack: <strong className="text-zinc-400">{selectedItem.stackable}</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Description if available */}
            {selectedItem.description && (
              <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3 text-xs text-zinc-300 leading-relaxed max-h-28 overflow-y-auto break-words whitespace-pre-wrap scrollbar-thin scrollbar-thumb-zinc-800">
                <p>{selectedItem.description}</p>
              </div>
            )}

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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Quantity
                  </label>
                  {selectedItem.stackable && selectedItem.stackable > 1 && (
                    <button
                      type="button"
                      onClick={() => setAmount(selectedItem.stackable || 1)}
                      className="text-[11px] text-rust-400 hover:text-rust-300 font-mono"
                    >
                      Max Stack ({selectedItem.stackable})
                    </button>
                  )}
                </div>
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
