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
  Info,
  Sparkles,
  Crosshair,
  Hammer,
  Recycle,
  Boxes
} from 'lucide-react';
import { 
  RUST_ITEMS, 
  RustItem, 
  RUST_CATEGORIES 
} from '../data/rustItems';
import { getItemStats } from '../data/itemStats';
import { getItemDetails } from '../data/itemDetails';
import { ItemSprite } from './ItemSprite';
import { rconService } from '../services/rconService';
import { Player } from '../types/rcon';

export const ItemsTab: React.FC = () => {
  const [items] = useState<RustItem[]>(RUST_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDlcPack, setSelectedDlcPack] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedItem, setSelectedItem] = useState<RustItem | null>(null);
  const [targetPlayerId, setTargetPlayerId] = useState<string>('self');
  const [amount, setAmount] = useState<number>(1);
  const [toast, setToast] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(96);
  const [openTwisties, setOpenTwisties] = useState<Record<string, boolean>>({});
  const [recyclerMode, setRecyclerMode] = useState<'standard' | 'safezone'>('standard');

  const toggleTwisty = (key: string) => {
    setOpenTwisties((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  // Reset pagination limit when category, dlc pack, or search changes
  useEffect(() => {
    setDisplayLimit(96);
  }, [selectedCategory, selectedDlcPack, search]);

  // Handle Escape key to close Give Item modal
  useEffect(() => {
    if (!selectedItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  const isDlcFilterActive = selectedDlcPack !== 'all';
  const isSearchFilterActive = !!search.trim();

  // Compute category counts (scoped to active DLC pack AND active search query)
  const categoryCounts = useMemo(() => {
    const q = search.toLowerCase().trim();
    const scopedItems = items.filter((item) => {
      if (isDlcFilterActive && item.dlcPack !== selectedDlcPack) {
        return false;
      }
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.shortname.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      return true;
    });

    const counts: Record<string, number> = { All: scopedItems.length };
    for (const item of scopedItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
      if (item.isVehicle) {
        counts['Vehicles'] = (counts['Vehicles'] || 0) + 1;
      }
      if (item.isDlc) {
        counts['DLC / Packs'] = (counts['DLC / Packs'] || 0) + 1;
      }
    }
    return counts;
  }, [items, isDlcFilterActive, selectedDlcPack, search]);

  // Compute available DLC packs with item counts
  const availableDlcPacks = useMemo(() => {
    const packsMap: Record<string, number> = {};
    for (const item of items) {
      if (item.dlcPack) {
        packsMap[item.dlcPack] = (packsMap[item.dlcPack] || 0) + 1;
      }
    }
    return Object.entries(packsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // DLC Pack specific filter
      if (selectedDlcPack !== 'all' && item.dlcPack !== selectedDlcPack) {
        return false;
      }

      if (selectedCategory === 'Vehicles') {
        if (!item.isVehicle && item.category !== 'Vehicles') return false;
      } else if (selectedCategory === 'DLC / Packs') {
        if (!item.isDlc) return false;
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
  }, [items, selectedCategory, selectedDlcPack, search]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayLimit);
  }, [filteredItems, displayLimit]);

  const handleOpenGive = (item: RustItem) => {
    setSelectedItem(item);
    setAmount(item.defaultAmount || (item.stackable && item.stackable > 1 ? item.stackable : 1));
    setOpenTwisties({});
    setRecyclerMode('standard');
  };

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      if (targetPlayerId === 'all') {
        await rconService.sendCommand(`inventory.giveall "${selectedItem.shortname}" ${amount}`);
        setToast(`Gave ${amount}x ${selectedItem.name} to all online players`);
      } else if (targetPlayerId === 'self') {
        await rconService.sendCommand(`inventory.give "${selectedItem.shortname}" ${amount}`);
        setToast(`Gave ${amount}x ${selectedItem.name} to Console`);
      } else {
        const player = players.find((p) => p.id === targetPlayerId);
        await rconService.sendCommand(`inventory.giveto "${targetPlayerId}" "${selectedItem.shortname}" ${amount}`);
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

        {/* Controls: DLC Dropdown & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* DLC Filter Dropdown */}
          <div className="relative flex items-center">
            <Sparkles className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-purple-500 dark:text-purple-400 pointer-events-none" />
            <select
              value={selectedDlcPack}
              onChange={(e) => setSelectedDlcPack(e.target.value)}
              className={`pl-8 pr-7 py-1.5 bg-white dark:bg-zinc-950 border rounded-lg text-xs font-medium focus:outline-none focus:border-rust-500 transition-colors appearance-none cursor-pointer w-full sm:w-auto shadow-xs ${
                selectedDlcPack !== 'all'
                  ? 'border-purple-400 dark:border-purple-500/70 text-purple-700 dark:text-purple-200 bg-purple-50 dark:bg-purple-950/25 ring-1 ring-purple-500/30'
                  : 'border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700'
              }`}
              title="Filter items by DLC or expansion pack"
            >
              <option value="all">All DLC Packs ({categoryCounts['DLC / Packs'] || 0})</option>
              {availableDlcPacks.map((pack) => (
                <option key={pack.name} value={pack.name} className="bg-zinc-900 text-zinc-100">
                  {pack.name} ({pack.count})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-3 h-3 text-zinc-500 pointer-events-none" />
            {selectedDlcPack !== 'all' && (
              <button
                onClick={() => setSelectedDlcPack('all')}
                className="ml-1 p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800 transition-colors"
                title="Clear DLC filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item name or shortname (e.g. salvaged, ak)..."
              className="pl-9 pr-8 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rust-500 w-full sm:w-72 transition-colors shadow-xs"
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
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {RUST_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;

          // Counter badge and button styling
          let buttonClass = '';
          let counterClass = '';

          if (isSelected) {
            buttonClass = 'bg-rust-600 text-white shadow-sm ring-1 ring-rust-500/50';
            counterClass = 'bg-black/25 text-white font-bold ring-1 ring-white/20';
          } else if (isDlcFilterActive && count > 0) {
            buttonClass = 'bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-700/80 text-purple-900 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/60 shadow-xs font-semibold';
            counterClass = 'bg-purple-200 dark:bg-purple-900/90 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-600/60 font-bold';
          } else if (isSearchFilterActive && count > 0) {
            buttonClass = 'bg-rust-50 dark:bg-rust-950/40 border border-rust-300 dark:border-rust-700/80 text-rust-900 dark:text-rust-200 hover:bg-rust-100 dark:hover:bg-rust-900/60 shadow-xs font-semibold';
            counterClass = 'bg-rust-200 dark:bg-rust-900/90 text-rust-900 dark:text-rust-200 border border-rust-300 dark:border-rust-600/60 font-bold';
          } else if ((isDlcFilterActive || isSearchFilterActive) && count === 0) {
            buttonClass = 'bg-zinc-900/50 border border-zinc-800/60 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 opacity-60 hover:opacity-100 font-medium';
            counterClass = 'bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 border border-zinc-800/40 font-medium';
          } else {
            buttonClass = 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 shadow-xs font-medium';
            counterClass = 'bg-zinc-800 text-zinc-400 border border-zinc-700/50 font-medium';
          }

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 ${buttonClass}`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${counterClass}`}
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
              setSelectedDlcPack('all');
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
                className="group bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-rust-500 rounded-xl p-3 flex flex-col justify-between items-center text-center cursor-pointer transition-all shadow-sm hover:shadow-md relative"
              >
                {/* Stack size badge if > 1 */}
                {item.stackable && item.stackable > 1 && (
                  <span className="absolute top-2 right-2 text-[10px] font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/60 font-semibold shadow-xs">
                    x{item.stackable >= 1000 ? `${item.stackable / 1000}k` : item.stackable}
                  </span>
                )}

                {/* DLC Pack Badge on top-left (clickable to quick-filter) */}
                {item.isDlc && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.dlcPack) setSelectedDlcPack(item.dlcPack);
                    }}
                    className="absolute top-2 left-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/90 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800/70 shadow-xs flex items-center space-x-1 max-w-[110px] cursor-pointer transition-colors"
                    title={`Filter by ${item.dlcPack || 'DLC Content'}`}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="truncate">{item.dlcPack || 'DLC'}</span>
                  </button>
                )}

                <div className="w-20 h-20 flex items-center justify-center p-1 relative mb-2">
                  <ItemSprite
                    shortname={item.shortname}
                    size={72}
                    alt={item.name}
                    className="filter drop-shadow group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="w-full">
                  <h4
                    className="text-xs font-bold text-zinc-100 group-hover:text-rust-500 transition-colors truncate"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  <span
                    className="block text-[10px] font-mono text-zinc-400 truncate"
                    title={item.shortname}
                  >
                    {item.shortname}
                  </span>

                  {/* Compact Item Stats preview on card */}
                  {(() => {
                    const stats = getItemStats(item.shortname);
                    if (!stats) return null;
                    if (stats.damage !== undefined) {
                      return (
                        <div className="flex items-center space-x-1 text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">{stats.damage} Dmg</span>
                          {stats.attackSpeed && <span className="text-zinc-400 dark:text-zinc-500">• {stats.attackSpeed}</span>}
                        </div>
                      );
                    }
                    if (stats.projectileProtection) {
                      return (
                        <div className="flex items-center space-x-1 text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.projectileProtection} Proj</span>
                          {stats.meleeProtection && <span className="text-zinc-400 dark:text-zinc-500">• {stats.meleeProtection} Mel</span>}
                        </div>
                      );
                    }
                    if (stats.instantHealth) {
                      return (
                        <div className="flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 truncate">
                          <span className="font-semibold">+{stats.instantHealth} HP</span>
                          {stats.healthOverTime && <span className="text-zinc-400 dark:text-zinc-500">(+{stats.healthOverTime})</span>}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenGive(item);
                  }}
                  className="mt-2 w-full py-1 bg-zinc-800 hover:bg-rust-600 text-zinc-300 hover:text-white border border-zinc-700/50 hover:border-rust-500 rounded text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors shadow-xs"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header: Fixed at top so 'X' never scrolls out of view */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 relative shrink-0 bg-zinc-900">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 z-10 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start space-x-3 pr-8">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 flex items-center justify-center shrink-0">
                  <ItemSprite
                    shortname={selectedItem.shortname}
                    size={56}
                    alt={selectedItem.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-bold text-sm text-zinc-100">{selectedItem.name}</h3>
                    {selectedItem.rarity && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50 shrink-0">
                        {selectedItem.rarity}
                      </span>
                    )}
                    {selectedItem.workbench && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 shrink-0" title="Workbench Tier Required to Craft">
                        {selectedItem.workbench}
                      </span>
                    )}
                    {selectedItem.craftable === false && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/60 shrink-0" title="Cannot be crafted by players">
                        Uncraftable / Military
                      </span>
                    )}
                    {selectedItem.isDlc && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/90 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800/70 text-[10px] font-bold uppercase shadow-xs whitespace-nowrap shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span>{selectedItem.dlcPack || 'DLC Content'}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-rust-400 block truncate mt-0.5">{selectedItem.shortname}</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 mt-1">
                    <span>Category: <strong className="text-zinc-400">{selectedItem.category}</strong></span>
                    {selectedItem.stackable && (
                      <span>Stack: <strong className="text-zinc-400">{selectedItem.stackable}</strong></span>
                    )}
                    {selectedItem.despawnTime && (
                      <span>Despawn: <strong className="text-zinc-400">{selectedItem.despawnTime}</strong></span>
                    )}
                    {selectedItem.recyclable !== undefined && (
                      <span>Recyclable: <strong className={selectedItem.recyclable ? 'text-emerald-400' : 'text-zinc-500'}>{selectedItem.recyclable ? 'Yes' : 'No'}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
              {/* Description if available */}
              {selectedItem.description && (
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3 text-xs text-zinc-300 leading-relaxed max-h-24 overflow-y-auto break-words whitespace-pre-wrap scrollbar-thin scrollbar-thumb-zinc-800">
                  <p>{selectedItem.description}</p>
                </div>
              )}

            {/* Collapsible Accordion Sections (Damage/Combat, Crafting, Recycling, Loot Drops) */}
            {(() => {
              const stats = getItemStats(selectedItem.shortname);
              const details = getItemDetails(selectedItem.shortname);

              const hasCombat = !!stats || (!!details?.ammoFor && details.ammoFor.length > 0);
              const hasCraft = !!details?.craft && (
                (!!details.craft.ingredients && details.craft.ingredients.length > 0) ||
                details.craft.researchCost !== undefined ||
                details.craft.techTreeCost !== undefined
              );
              const hasRecycle = !!details?.recycle && details.recycle.length > 0;
              const hasLoot = !!details?.loot && details.loot.length > 0;

              if (!hasCombat && !hasCraft && !hasRecycle && !hasLoot) {
                return null;
              }

              return (
                <div className="space-y-2">
                  {/* 1. Combat & Damage Stats */}
                  {hasCombat && (
                    <div className="border border-zinc-800/90 rounded-lg overflow-hidden bg-zinc-950/60">
                      <button
                        type="button"
                        onClick={() => toggleTwisty('combat')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800/60 text-left transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Crosshair className="w-3.5 h-3.5 text-rust-400 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-200">
                            {stats?.damage !== undefined || (details?.ammoFor && details.ammoFor.length > 0)
                              ? 'Combat & Damage Stats'
                              : 'Item Performance & Protection'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {stats?.damage !== undefined && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rust-500/10 text-rust-400 border border-rust-500/20">
                              {stats.damage} dmg
                            </span>
                          )}
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                              openTwisties['combat'] ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {openTwisties['combat'] && (
                        <div className="p-3 border-t border-zinc-800/70 space-y-3 text-xs">
                          {/* Weapon / Attire / Food Stats Grid */}
                          {stats && (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-sans">
                              {stats.damage !== undefined && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Damage</span>
                                  <span className="font-semibold text-zinc-100">{stats.damage}</span>
                                </div>
                              )}
                              {stats.attackSpeed && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Attack Speed</span>
                                  <span className="font-semibold text-zinc-100">{stats.attackSpeed}</span>
                                </div>
                              )}
                              {stats.range && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Range</span>
                                  <span className="font-semibold text-zinc-100">{stats.range}</span>
                                </div>
                              )}
                              {stats.drawTime && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Draw</span>
                                  <span className="font-semibold text-zinc-100">{stats.drawTime}</span>
                                </div>
                              )}
                              {stats.throwable && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Throw</span>
                                  <span className="font-semibold text-zinc-100">{stats.throwable}</span>
                                </div>
                              )}
                              {stats.magazineSize !== undefined && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Capacity</span>
                                  <span className="font-semibold text-zinc-100">{stats.magazineSize} rds</span>
                                </div>
                              )}
                              {stats.reloadTime && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Reload</span>
                                  <span className="font-semibold text-zinc-100">{stats.reloadTime}</span>
                                </div>
                              )}
                              {stats.recoil && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Recoil</span>
                                  <span className="font-semibold text-zinc-100">{stats.recoil}</span>
                                </div>
                              )}
                              {stats.projectileProtection && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Projectile</span>
                                  <span className="font-semibold text-emerald-400">{stats.projectileProtection}</span>
                                </div>
                              )}
                              {stats.meleeProtection && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Melee</span>
                                  <span className="font-semibold text-emerald-400">{stats.meleeProtection}</span>
                                </div>
                              )}
                              {stats.biteProtection && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Bite</span>
                                  <span className="font-semibold text-zinc-200">{stats.biteProtection}</span>
                                </div>
                              )}
                              {stats.radiationProtection && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Radiation</span>
                                  <span className="font-semibold text-amber-400">{stats.radiationProtection}</span>
                                </div>
                              )}
                              {stats.coldProtection && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Cold</span>
                                  <span className="font-semibold text-cyan-400">{stats.coldProtection}</span>
                                </div>
                              )}
                              {stats.explosionProtection && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Explosion</span>
                                  <span className="font-semibold text-rose-400">{stats.explosionProtection}</span>
                                </div>
                              )}
                              {stats.instantHealth !== undefined && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Instant Heal</span>
                                  <span className="font-semibold text-emerald-400">+{stats.instantHealth} HP</span>
                                </div>
                              )}
                              {stats.healthOverTime !== undefined && (
                                <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                                  <span className="text-zinc-400">Heal Over Time</span>
                                  <span className="font-semibold text-emerald-400">+{stats.healthOverTime} HP</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Compatible Weapons / Ballistics Table (for Ammo) */}
                          {details?.ammoFor && details.ammoFor.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Compatible Weapons & Ballistics
                              </span>
                              <div className="overflow-x-auto rounded border border-zinc-800/80">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800/80 font-medium">
                                    <tr>
                                      <th className="px-2 py-1.5">Weapon</th>
                                      <th className="px-2 py-1.5 text-right">Damage</th>
                                      <th className="px-2 py-1.5 text-right">DPS</th>
                                      <th className="px-2 py-1.5 text-right">Velocity</th>
                                      <th className="px-2 py-1.5 text-right">Headshot</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-800/50 font-mono text-zinc-300">
                                    {details.ammoFor.map((af, idx) => (
                                      <tr key={idx} className="hover:bg-zinc-900/40">
                                        <td className="px-2 py-1 font-sans text-zinc-200">{af.weapon}</td>
                                        <td className="px-2 py-1 text-right text-rust-300 font-semibold">{af.damage}</td>
                                        <td className="px-2 py-1 text-right">{af.dps}</td>
                                        <td className="px-2 py-1 text-right">{af.velocity}m/s</td>
                                        <td className="px-2 py-1 text-right text-amber-300">{af.headshot}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Crafting & Recipe */}
                  {hasCraft && (
                    <div className="border border-zinc-800/90 rounded-lg overflow-hidden bg-zinc-950/60">
                      <button
                        type="button"
                        onClick={() => toggleTwisty('crafting')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800/60 text-left transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Hammer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-200">Crafting & Recipe</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {details?.craft?.yield && details.craft.yield > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Yield {details.craft.yield}x
                            </span>
                          )}
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                              openTwisties['crafting'] ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {openTwisties['crafting'] && (
                        <div className="p-3 border-t border-zinc-800/70 space-y-2.5 text-xs">
                          {/* Recipe Meta Badges (Workbench, Yield, Scrap) */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {selectedItem.workbench && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-medium">
                                {selectedItem.workbench}
                              </span>
                            )}
                            {details?.craft?.craftTime && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-medium">
                                Craft: {details.craft.craftTime}
                              </span>
                            )}
                            {details?.craft?.researchCost !== undefined && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 font-medium">
                                Research: {details.craft.researchCost} Scrap
                              </span>
                            )}
                            {details?.craft?.techTreeCost !== undefined && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800/50 text-blue-300 font-medium">
                                Tech Tree: {details.craft.techTreeCost} Scrap
                              </span>
                            )}
                          </div>

                          {/* Ingredients List */}
                          {details?.craft?.ingredients && details.craft.ingredients.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Required Ingredients
                              </span>
                              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                {details.craft.ingredients.map((ing, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900/70 border border-zinc-800/70 rounded-md"
                                  >
                                    <span className="text-zinc-300 truncate pr-2">{ing.item}</span>
                                    <span className="font-mono font-bold text-amber-400 shrink-0">
                                      ×{ing.quantity.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Recycler Yields */}
                  {hasRecycle && (
                    <div className="border border-zinc-800/90 rounded-lg overflow-hidden bg-zinc-950/60">
                      <button
                        type="button"
                        onClick={() => toggleTwisty('recycling')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800/60 text-left transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Recycle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-200">Recycler Yields</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {details?.recycle?.length} materials
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                              openTwisties['recycling'] ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {openTwisties['recycling'] && (
                        <div className="p-3 border-t border-zinc-800/70 space-y-2.5 text-xs">
                          {/* Location Selector Tabs if Safe Zone data exists */}
                          {details?.recycleSafeZone && details.recycleSafeZone.length > 0 && (
                            <div className="flex items-center space-x-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setRecyclerMode('standard')}
                                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                                  recyclerMode === 'standard'
                                    ? 'bg-zinc-800 text-emerald-400 shadow-xs'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                Monument / Standard (100%)
                              </button>
                              <button
                                type="button"
                                onClick={() => setRecyclerMode('safezone')}
                                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                                  recyclerMode === 'safezone'
                                    ? 'bg-zinc-800 text-amber-400 shadow-xs'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                Safe Zone (-20% Penalty)
                              </button>
                            </div>
                          )}

                          {/* Recycler Items Grid */}
                          {(() => {
                            const activeRecycleList = (recyclerMode === 'safezone' && details?.recycleSafeZone) 
                              ? details.recycleSafeZone 
                              : details?.recycle;

                            return (
                              <div className="grid grid-cols-2 gap-1.5">
                                {activeRecycleList?.map((rec, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900/70 border border-zinc-800/70 rounded-md"
                                  >
                                    <span className="text-zinc-300 truncate pr-2">{rec.item}</span>
                                    <div className="flex items-center space-x-1.5 shrink-0">
                                      <span className="font-mono font-bold text-emerald-400">×{rec.quantity}</span>
                                      <span className="text-[10px] text-zinc-500 font-mono">({rec.chance})</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          <p className="text-[10px] text-zinc-500 italic">
                            {recyclerMode === 'safezone'
                              ? 'Safe Zone recyclers impose a 20% penalty on material outputs and operate slower.'
                              : 'Standard recycler output. Monument recyclers also provide a 20% speed bonus.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. World Loot Drops */}
                  {hasLoot && (
                    <div className="border border-zinc-800/90 rounded-lg overflow-hidden bg-zinc-950/60">
                      <button
                        type="button"
                        onClick={() => toggleTwisty('loot')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800/60 text-left transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Boxes className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-200">World Loot Drops</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {details?.loot?.length} sources
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                              openTwisties['loot'] ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {openTwisties['loot'] && (
                        <div className="p-3 border-t border-zinc-800/70 space-y-2 text-xs">
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                            {details?.loot?.map((lt, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900/60 border border-zinc-800/70 rounded-md"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="text-zinc-200 text-[11px] font-medium truncate capitalize">
                                    {lt.source}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-mono">
                                    Amount: <span className="text-zinc-300 font-semibold">{lt.amount}</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-mono font-bold text-blue-400 text-xs">
                                    {lt.chance}%
                                  </span>
                                  <div className="w-16 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${Math.min(100, lt.chance)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

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
                  {players.length > 0 ? (
                    <>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </option>
                      ))}
                      <option value="all">All Online Players ({players.length})</option>
                      <option value="self">Console / Self (in-game admin only)</option>
                    </>
                  ) : (
                    <option value="self">No players online (Console / Self)</option>
                  )}
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
      </div>
    )}
    </div>
  );
};
