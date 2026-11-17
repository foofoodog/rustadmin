import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Users, 
  MapPin, 
  ExternalLink, 
  Compass, 
  Crosshair, 
  Zap, 
  RefreshCw, 
  Search, 
  SlidersHorizontal, 
  Flame, 
  ShieldCheck, 
  ShoppingBag, 
  Pickaxe, 
  Mountain, 
  Droplets, 
  Move,
  Anchor,
  Fuel,
  ShoppingCart,
  Radio,
  Warehouse,
  CircleDot,
  Skull
} from 'lucide-react';
import { rconService } from '../services/rconService';
import { ServerStatus } from '../types/rcon';

export type MonumentCategory = 'major' | 'safezone' | 'roadside' | 'quarry' | 'cave' | 'water' | 'substation';

export interface Monument {
  id: string;
  name: string;
  type: string;
  prefab: string;
  x: number;
  y: number;
  z: number;
  category: MonumentCategory;
}

interface MapPlayerPos {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
}

// Pre-baked monuments from world.monuments on map 2500_1584212361
const DEFAULT_MONUMENTS: Monument[] = [
  // Major Radtowns & Offshore
  { id: 'ferry_terminal', name: 'Ferry Terminal', type: 'Radtown', prefab: 'ferry_terminal_1', x: 297.8, y: 1.25, z: -862.47, category: 'major' },
  { id: 'harbor_1', name: 'Harbor 1', type: 'Radtown', prefab: 'harbor_1', x: 933.56, y: 1.45, z: 334.18, category: 'major' },
  { id: 'harbor_2', name: 'Harbor 2', type: 'Radtown', prefab: 'harbor_2', x: -852.64, y: 0.73, z: 264.52, category: 'major' },
  { id: 'mil_base', name: 'Abandoned Military Base', type: 'Radtown', prefab: 'desert_military_base_d', x: 496.09, y: 16.78, z: -626.48, category: 'major' },
  { id: 'missile_silo', name: 'Nuclear Missile Silo', type: 'Radtown', prefab: 'nuclear_missile_silo', x: 30.65, y: -25.19, z: -656.81, category: 'major' },
  { id: 'trainyard', name: 'Train Yard', type: 'Radtown', prefab: 'trainyard_1', x: 189.89, y: 27.92, z: -120.14, category: 'major' },
  { id: 'dome', name: 'The Dome (Sphere Tank)', type: 'Radtown', prefab: 'sphere_tank', x: -10.04, y: 29.35, z: 640.73, category: 'major' },
  { id: 'junkyard', name: 'Junkyard', type: 'Radtown', prefab: 'junkyard_1', x: 523.5, y: 22.64, z: 409.34, category: 'major' },
  { id: 'sewer_branch', name: 'Sewer Branch', type: 'Radtown', prefab: 'radtown_small_3', x: 409.46, y: 1.04, z: -356.84, category: 'major' },
  { id: 'satellite_dish', name: 'Satellite Dish', type: 'Radtown', prefab: 'satellite_dish', x: -36.97, y: 18.08, z: -375.11, category: 'major' },
  { id: 'underwater_lab', name: 'Underwater Lab', type: 'Building', prefab: 'underwater_lab_a', x: 1185.43, y: -49.89, z: -243.64, category: 'major' },
  { id: 'large_oilrig', name: 'Large Oil Rig', type: 'Building', prefab: 'oilrig_1', x: -812.22, y: 0.0, z: -1581.96, category: 'major' },
  { id: 'small_oilrig', name: 'Oil Rig (Small)', type: 'Building', prefab: 'oilrig_2', x: 204.43, y: 0.0, z: 1570.6, category: 'major' },
  { id: 'lighthouse_1', name: 'Lighthouse (South)', type: 'Lighthouse', prefab: 'lighthouse', x: 961.18, y: 0.0, z: -593.35, category: 'major' },
  { id: 'lighthouse_2', name: 'Lighthouse (North)', type: 'Lighthouse', prefab: 'lighthouse', x: 559.72, y: 0.0, z: 906.74, category: 'major' },

  // Safe Zones
  { id: 'outpost', name: 'Outpost', type: 'Town', prefab: 'compound', x: -15.69, y: 41.79, z: 278.61, category: 'safezone' },
  { id: 'bandit_camp', name: 'Bandit Camp', type: 'Town', prefab: 'bandit_town', x: -341.43, y: 12.88, z: -149.5, category: 'safezone' },
  { id: 'fishing_village_large', name: 'Large Fishing Village', type: 'Radtown', prefab: 'fishing_village_a', x: -805.74, y: 0.0, z: -406.55, category: 'safezone' },
  { id: 'fishing_village_small', name: 'Fishing Village', type: 'Radtown', prefab: 'fishing_village_b', x: 788.84, y: 0.0, z: -869.04, category: 'safezone' },
  { id: 'ranch', name: 'Ranch', type: 'Town', prefab: 'stables_a', x: 517.87, y: 4.28, z: 188.02, category: 'safezone' },
  { id: 'large_barn', name: 'Large Barn', type: 'Town', prefab: 'stables_b', x: -443.73, y: 18.0, z: 72.54, category: 'safezone' },

  // Roadside
  { id: 'gas_station', name: "Oxum's Gas Station", type: 'Roadside', prefab: 'gas_station_1', x: -522.81, y: 22.76, z: 254.95, category: 'roadside' },
  { id: 'mining_outpost', name: 'Mining Outpost', type: 'Roadside', prefab: 'warehouse', x: 277.02, y: 7.85, z: -511.05, category: 'roadside' },
  { id: 'supermarket', name: 'Abandoned Supermarket', type: 'Roadside', prefab: 'supermarket_1', x: 215.73, y: 38.72, z: 235.04, category: 'roadside' },

  // Quarries
  { id: 'sulfur_quarry', name: 'Sulfur Quarry', type: 'Building', prefab: 'mining_quarry_a', x: -813.04, y: 33.71, z: -116.15, category: 'quarry' },
  { id: 'hqm_quarry', name: 'HQM Quarry', type: 'Building', prefab: 'mining_quarry_c', x: -272.34, y: 4.34, z: -811.06, category: 'quarry' },
  { id: 'stone_quarry', name: 'Stone Quarry', type: 'Building', prefab: 'mining_quarry_b', x: -672.44, y: 46.26, z: 530.99, category: 'quarry' },

  // Caves & Tunnels
  { id: 'tunnel_1', name: 'Train Tunnel (West)', type: 'Roadside', prefab: 'entrance_bunker_d', x: -486.0, y: 3.0, z: -594.0, category: 'cave' },
  { id: 'tunnel_2', name: 'Train Tunnel (East)', type: 'Roadside', prefab: 'entrance_bunker_b', x: 405.0, y: 31.5, z: 630.0, category: 'cave' },
  { id: 'cave_1', name: 'Underground Cave (Medium)', type: 'Cave', prefab: 'cave_medium_medium', x: 197.32, y: 14.65, z: -424.53, category: 'cave' },
  { id: 'cave_2', name: 'Underground Cave (Easy)', type: 'Cave', prefab: 'cave_medium_easy', x: 816.72, y: 1.31, z: 629.34, category: 'cave' },
  { id: 'cave_3', name: 'Underground Cave (Small A)', type: 'Cave', prefab: 'cave_small_easy', x: -225.69, y: 68.57, z: 466.39, category: 'cave' },
  { id: 'cave_4', name: 'Underground Cave (Small B)', type: 'Cave', prefab: 'cave_small_easy', x: -612.99, y: 15.77, z: -492.72, category: 'cave' },
  { id: 'cave_5', name: 'Underground Cave (Small C)', type: 'Cave', prefab: 'cave_small_medium', x: 849.51, y: 2.43, z: -444.07, category: 'cave' },

  // Water & Nature
  { id: 'well_1', name: 'Water Well (East)', type: 'WaterWell', prefab: 'water_well_d', x: 788.63, y: 2.51, z: 72.79, category: 'water' },
  { id: 'well_2', name: 'Water Well (Central)', type: 'WaterWell', prefab: 'water_well_d', x: 401.14, y: 24.04, z: -164.17, category: 'water' },
  { id: 'well_3', name: 'Water Well (North East)', type: 'WaterWell', prefab: 'water_well_a', x: 707.45, y: 6.07, z: 392.89, category: 'water' },
  { id: 'jungle_ruin', name: 'Jungle Ruin', type: 'Building', prefab: 'jungle_ruins_e', x: 581.19, y: 5.55, z: -6.89, category: 'water' },
  { id: 'jungle_swamp', name: 'Jungle Swamp', type: 'Oasis', prefab: 'ue_jungle_swamp_a', x: 566.19, y: 11.0, z: -202.18, category: 'water' },
  { id: 'wild_swamp', name: 'Wild Swamp', type: 'Radtown', prefab: 'swamp_b', x: -657.35, y: 35.96, z: 22.25, category: 'water' },
  { id: 'ice_lake', name: 'Ice Lake', type: 'Lake', prefab: 'ice_lake_4', x: 189.61, y: 67.08, z: 577.53, category: 'water' },

  // Substations
  { id: 'sub_1', name: 'Substation (South East)', type: 'Building', prefab: 'power_sub_small_2', x: 537.84, y: 5.77, z: -349.0, category: 'substation' },
  { id: 'sub_2', name: 'Substation (South)', type: 'Building', prefab: 'power_sub_small_1', x: 341.43, y: 7.97, z: -739.79, category: 'substation' },
  { id: 'sub_3', name: 'Substation (East)', type: 'Building', prefab: 'power_sub_small_1', x: 829.39, y: 4.42, z: 231.2, category: 'substation' },
  { id: 'sub_4', name: 'Substation (Center West)', type: 'Building', prefab: 'power_sub_small_2', x: -73.78, y: 36.6, z: 146.49, category: 'substation' },
  { id: 'sub_5', name: 'Substation (Center South)', type: 'Building', prefab: 'power_sub_small_2', x: 42.44, y: 31.52, z: -251.09, category: 'substation' },
  { id: 'sub_6', name: 'Substation (West)', type: 'Building', prefab: 'power_sub_small_1', x: -681.74, y: 16.86, z: 311.64, category: 'substation' },
  { id: 'sub_7', name: 'Substation (North)', type: 'Building', prefab: 'power_sub_small_2', x: -24.09, y: 35.79, z: 748.59, category: 'substation' },
  { id: 'sub_8', name: 'Substation (Far West)', type: 'Building', prefab: 'power_sub_small_2', x: -779.79, y: 11.29, z: 113.42, category: 'substation' },
  { id: 'sub_9', name: 'Power Substation Big 1', type: 'Building', prefab: 'power_sub_big_1', x: 90.09, y: 16.31, z: -735.74, category: 'substation' },
  { id: 'sub_10', name: 'Power Substation Big 2', type: 'Building', prefab: 'power_sub_big_2', x: 142.64, y: 13.25, z: -743.24, category: 'substation' },
  { id: 'sub_11', name: 'Power Substation Big 3', type: 'Building', prefab: 'power_sub_big_2', x: 202.7, y: 8.35, z: -638.14, category: 'substation' },
  { id: 'sub_12', name: 'Power Substation Big 4', type: 'Building', prefab: 'power_sub_big_2', x: 690.69, y: 3.55, z: -870.87, category: 'substation' },
  { id: 'sub_13', name: 'Power Substation Big 5', type: 'Building', prefab: 'power_sub_big_2', x: 187.69, y: 9.31, z: -578.08, category: 'substation' },
  { id: 'sub_14', name: 'Power Substation Big 6', type: 'Building', prefab: 'power_sub_big_2', x: -112.61, y: 32.1, z: -277.78, category: 'substation' },
  { id: 'sub_15', name: 'Power Substation Big 7', type: 'Building', prefab: 'power_sub_big_1', x: 30.03, y: 26.52, z: 67.57, category: 'substation' },
  { id: 'sub_16', name: 'Power Substation Big 8', type: 'Building', prefab: 'power_sub_big_2', x: -90.09, y: 14.71, z: -127.63, category: 'substation' },
  { id: 'sub_17', name: 'Power Substation Big 9', type: 'Building', prefab: 'power_sub_big_1', x: -405.41, y: 21.95, z: 120.12, category: 'substation' },
  { id: 'sub_18', name: 'Power Substation Big 10', type: 'Building', prefab: 'power_sub_big_2', x: -750.75, y: 9.65, z: 172.67, category: 'substation' },
  { id: 'sub_19', name: 'Power Substation Big 11', type: 'Building', prefab: 'power_sub_big_1', x: -487.99, y: 23.96, z: 180.18, category: 'substation' },
  { id: 'sub_20', name: 'Power Substation Big 12', type: 'Building', prefab: 'power_sub_big_2', x: 307.81, y: 38.46, z: 97.6, category: 'substation' },
  { id: 'sub_21', name: 'Power Substation Big 13', type: 'Building', prefab: 'power_sub_big_1', x: 503.0, y: 27.89, z: 548.05, category: 'substation' },
];

function categorizeMonument(name: string, type: string, prefab: string): MonumentCategory {
  const n = name.toLowerCase();

  // Safe zones
  if (n.includes('outpost') || n.includes('bandit') || n.includes('fishing village') || n.includes('barn') || n.includes('ranch') || n.includes('stables')) {
    return 'safezone';
  }

  // Major Radtowns & Offshore
  if (
    n.includes('oil rig') || n.includes('oilrig') || n.includes('silo') || n.includes('dome') || 
    n.includes('train yard') || n.includes('military') || n.includes('harbor') || n.includes('ferry') ||
    n.includes('airfield') || n.includes('launch') || n.includes('power plant') || n.includes('water treatment') ||
    n.includes('satellite') || n.includes('sewer') || n.includes('junkyard') || n.includes('underwater lab') ||
    n.includes('lighthouse') || n.includes('arctic research')
  ) {
    return 'major';
  }

  // Mining Quarries
  if (n.includes('quarry')) {
    return 'quarry';
  }

  // Caves & underground tunnels
  if (n.includes('cave') || n.includes('tunnel') || type.toLowerCase() === 'cave') {
    return 'cave';
  }

  // Roadside & Small Monuments
  if (n.includes('supermarket') || n.includes('gas station') || n.includes('mining outpost') || n.includes('warehouse')) {
    return 'roadside';
  }

  // Substations
  if (n.includes('substation')) {
    return 'substation';
  }

  // Water wells & Natural features
  if (n.includes('water well') || n.includes('swamp') || n.includes('ice lake') || n.includes('oasis') || n.includes('ruin')) {
    return 'water';
  }

  return 'roadside';
}

// Glyph definitions for individual monuments & categories
export interface GlyphConfig {
  icon: React.FC<{ className?: string }>;
  bg: string;
  border: string;
  text: string;
  iconSize: string;
  badgeSize: string;
}

export function getMonumentGlyph(m: Monument): GlyphConfig {
  const n = m.name.toLowerCase();

  // Distinct High-Profile Icons
  if (n.includes('oil rig') || n.includes('oilrig')) {
    return { icon: Anchor, bg: 'bg-rose-600', border: 'border-white', text: 'text-white', iconSize: 'w-3.5 h-3.5', badgeSize: 'w-6 h-6' };
  }
  if (n.includes('gas station')) {
    return { icon: Fuel, bg: 'bg-amber-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
  }
  if (n.includes('supermarket')) {
    return { icon: ShoppingCart, bg: 'bg-amber-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
  }
  if (n.includes('mining outpost')) {
    return { icon: Warehouse, bg: 'bg-amber-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
  }
  if (n.includes('satellite')) {
    return { icon: Radio, bg: 'bg-rose-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
  }
  if (n.includes('dome')) {
    return { icon: CircleDot, bg: 'bg-rose-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
  }
  if (n.includes('ferry') || n.includes('harbor') || n.includes('fishing village')) {
    return { icon: Anchor, bg: m.category === 'safezone' ? 'bg-emerald-600' : 'bg-rose-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
  }

  // Category fallbacks
  switch (m.category) {
    case 'safezone':
      return { icon: ShieldCheck, bg: 'bg-emerald-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
    case 'quarry':
      return { icon: Pickaxe, bg: 'bg-orange-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
    case 'cave':
      return { icon: Mountain, bg: 'bg-purple-600', border: 'border-white', text: 'text-white', iconSize: 'w-2.5 h-2.5', badgeSize: 'w-4 h-4' };
    case 'water':
      return { icon: Droplets, bg: 'bg-sky-600', border: 'border-white', text: 'text-white', iconSize: 'w-2.5 h-2.5', badgeSize: 'w-4 h-4' };
    case 'substation':
      return { icon: Zap, bg: 'bg-zinc-800', border: 'border-zinc-500', text: 'text-amber-400', iconSize: 'w-2.5 h-2.5', badgeSize: 'w-3.5 h-3.5' };
    case 'major':
    default:
      return { icon: Flame, bg: 'bg-rose-600', border: 'border-white', text: 'text-white', iconSize: 'w-3 h-3', badgeSize: 'w-5 h-5' };
  }
}

export const MapTab: React.FC = () => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [mapSize, setMapSize] = useState<number>(2500);
  const [mapSeed, setMapSeed] = useState<string>('1584212361');
  const [monuments, setMonuments] = useState<Monument[]>(DEFAULT_MONUMENTS);
  const [players, setPlayers] = useState<MapPlayerPos[]>([]);
  const [selectedCoord, setSelectedCoord] = useState<{ x: number; z: number } | null>(null);
  const [hoveredMonument, setHoveredMonument] = useState<Monument | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Zoom and Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Category Toggles
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({
    major: true,
    safezone: true,
    roadside: true,
    quarry: true,
    cave: true,
    water: true,
    substation: false, // hidden by default to keep map clean
    players: true,
    grid: true,
  });

  const viewportRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number; moved: boolean }>({
    mouseX: 0,
    mouseY: 0,
    panX: 0,
    panY: 0,
    moved: false,
  });

  useEffect(() => {
    const unsub = rconService.onStatus(setStatus);
    rconService.sendCommand('status');
    fetchPlayerPositions();
    fetchLiveMonuments();

    const interval = setInterval(() => {
      fetchPlayerPositions();
    }, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  // Mouse wheel zoom listener (passive: false to prevent outer page scroll)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.ctrlKey || e.metaKey ? 0.35 : 0.18;
      const factor = e.deltaY < 0 ? 1 + step : 1 / (1 + step);

      setZoom((prev) => {
        const next = Math.min(Math.max(0.6, +(prev * factor).toFixed(2)), 5.0);
        return next;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const fetchLiveMonuments = async () => {
    try {
      const resp = await rconService.sendCommand('world.monuments', true);
      if (resp && resp.Message && resp.Message.includes('assets/')) {
        parseMonumentsOutput(resp.Message);
      }
    } catch {
      // fallback to pre-baked list
    }
  };

  const parseMonumentsOutput = (text: string) => {
    const list: Monument[] = [];
    const pattern = /^\s*(\w+)\s+(.+?)\s+(assets\/[^\s]+\.prefab)\s+\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/gm;
    let match;
    let idx = 0;
    while ((match = pattern.exec(text)) !== null) {
      const type = match[1];
      const name = match[2].trim();
      const prefab = match[3];
      const x = parseFloat(match[4]);
      const y = parseFloat(match[5]);
      const z = parseFloat(match[6]);
      const category = categorizeMonument(name, type, prefab);
      list.push({
        id: `mon_${idx++}`,
        name,
        type,
        prefab,
        x,
        y,
        z,
        category,
      });
    }

    if (list.length > 0) {
      setMonuments(list);
    }
  };

  const fetchPlayerPositions = async () => {
    try {
      const resp = await rconService.sendCommand('playerlistpos', true);
      if (resp && resp.Message) {
        parsePlayerPositions(resp.Message);
      }
    } catch {
      // ignore
    }
  };

  const parsePlayerPositions = (text: string) => {
    const list: MapPlayerPos[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      const m = line.match(/^(\d{17})\s+"([^"]+)"\s+\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
      if (m) {
        list.push({
          id: m[1],
          name: m[2],
          x: parseFloat(m[3]),
          y: parseFloat(m[4]),
          z: parseFloat(m[5]),
        });
      }
    }
    setPlayers(list);
  };

  // Dragging & clicking interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    if (Math.hypot(dx, dy) > 4) {
      dragStartRef.current.moved = true;
    }
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    // If click without dragging (< 5px), select coordinates!
    if (!dragStartRef.current.moved && mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const half = mapSize / 2;
      const worldX = Math.round(((clickX / rect.width) * mapSize) - half);
      const worldZ = Math.round(half - ((clickY / rect.height) * mapSize));

      setSelectedCoord({ x: worldX, z: worldZ });
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Center the map view directly on coordinates (X, Z) with auto-pan and optional zoom
  const centerOnCoords = (x: number, z: number, autoZoom = true) => {
    const half = mapSize / 2;
    const pX = (x + half) / mapSize;
    const pZ = (half - z) / mapSize;

    // Zoom in to at least 1.6x if currently zoomed out so the POI is prominent
    const targetZoom = autoZoom ? Math.max(zoom, 1.6) : zoom;
    const newPanX = Math.round(-(pX - 0.5) * 540 * targetZoom);
    const newPanY = Math.round(-(pZ - 0.5) * 540 * targetZoom);

    setZoom(targetZoom);
    setPan({ x: newPanX, y: newPanY });
    setSelectedCoord({ x: Math.round(x), z: Math.round(z) });
  };

  const selectMonument = (m: Monument) => {
    // If the category of the monument is currently hidden, automatically turn it on!
    if (!visibleCategories[m.category]) {
      setVisibleCategories((prev) => ({ ...prev, [m.category]: true }));
    }
    centerOnCoords(m.x, m.z, true);
    setToast(`Centered on: ${m.name}`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleTeleport = async () => {
    if (!selectedCoord) return;
    try {
      await rconService.sendCommand(`teleportpos ${selectedCoord.x} 50 ${selectedCoord.z}`);
      setToast(`Teleported to (${selectedCoord.x}, 50, ${selectedCoord.z})`);
    } catch (err: any) {
      setToast(`Failed: ${err.message}`);
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Convert world X, Z into percentage positions for CSS (0% to 100%)
  const toPercentage = (x: number, z: number) => {
    const half = mapSize / 2;
    const left = ((x + half) / mapSize) * 100;
    const top = ((half - z) / mapSize) * 100;
    return { left: `${left}%`, top: `${top}%` };
  };

  const toggleCategory = (cat: string) => {
    setVisibleCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const setAllCategories = (enabled: boolean) => {
    setVisibleCategories({
      major: enabled,
      safezone: enabled,
      roadside: enabled,
      quarry: enabled,
      cave: enabled,
      water: enabled,
      substation: enabled,
      players: enabled,
      grid: visibleCategories.grid,
    });
  };

  // Category visual styles for filter badges
  const categoryConfigs: Record<MonumentCategory, { label: string; color: string; badgeBg: string; dot: string; icon: React.FC<{ className?: string }> }> = {
    major: {
      label: 'Major',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      dot: 'bg-rose-500',
      icon: Flame,
    },
    safezone: {
      label: 'Safe Zones',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
    },
    roadside: {
      label: 'Roadside',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      dot: 'bg-amber-500',
      icon: ShoppingBag,
    },
    quarry: {
      label: 'Quarries',
      color: 'text-orange-400',
      badgeBg: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
      dot: 'bg-orange-500',
      icon: Pickaxe,
    },
    cave: {
      label: 'Caves & Tunnels',
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      dot: 'bg-purple-500',
      icon: Mountain,
    },
    water: {
      label: 'Water & Nature',
      color: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
      dot: 'bg-sky-500',
      icon: Droplets,
    },
    substation: {
      label: 'Substations',
      color: 'text-zinc-400',
      badgeBg: 'bg-zinc-800 border-zinc-700 text-zinc-300',
      dot: 'bg-zinc-400',
      icon: Zap,
    },
  };

  // Filtered monuments based on category & search
  const filteredMonuments = monuments.filter((m) => {
    if (!visibleCategories[m.category]) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Count items per category
  const categoryCounts = monuments.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-rust-500/50 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4 text-rust-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <MapIcon className="w-5 h-5 text-rust-500" />
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
              <span>Interactive Map Browser</span>
              <span className="px-2 py-0.5 bg-zinc-800 text-rust-400 font-mono text-xs rounded">
                Size: {mapSize} • Seed: {mapSeed}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Scroll wheel to zoom • Drag to pan • Click map to select • Click POI to center
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
              title="Zoom In (or mouse wheel up)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1.5 text-zinc-300 font-bold min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.25).toFixed(2)))}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
              title="Zoom Out (or mouse wheel down)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
              title="Reset Zoom & Pan to Center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Positions & Monuments */}
          <button
            onClick={() => {
              fetchPlayerPositions();
              fetchLiveMonuments();
              setToast('Refreshed map entities');
              setTimeout(() => setToast(null), 2000);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {/* External RustMaps link */}
          <a
            href={`https://rustmaps.com/map/${mapSize}_${mapSeed}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 bg-rust-600 hover:bg-rust-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <span>RustMaps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* POI Category Filter Badges */}
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-zinc-400 font-semibold text-[11px] mr-1 flex items-center space-x-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-rust-500" />
            <span>POIs:</span>
          </span>

          {(Object.keys(categoryConfigs) as MonumentCategory[]).map((cat) => {
            const cfg = categoryConfigs[cat];
            const active = visibleCategories[cat];
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  active
                    ? `${cfg.badgeBg} border-opacity-60 shadow-sm`
                    : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
                }`}
                title={`Toggle ${cfg.label}`}
              >
                <div className={`w-2 h-2 rounded-full ${active ? cfg.dot : 'bg-zinc-600'}`} />
                <span>{cfg.label}</span>
                <span className={`text-[10px] font-mono ${active ? 'opacity-90' : 'opacity-40'}`}>
                  ({count})
                </span>
              </button>
            );
          })}

          {/* Players Toggle */}
          <button
            onClick={() => toggleCategory('players')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              visibleCategories.players
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${visibleCategories.players ? 'bg-cyan-400' : 'bg-zinc-600'}`} />
            <span>Players</span>
            <span className="text-[10px] font-mono">({players.length})</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => toggleCategory('grid')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              visibleCategories.grid
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Grid</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setAllCategories(true)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors"
          >
            Show All
          </button>
          <span className="text-zinc-700">•</span>
          <button
            onClick={() => setAllCategories(false)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors"
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Main Map Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Canvas Viewport with Wheel Zoom and Pan Drag */}
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => isDragging && setIsDragging(false)}
          className={`lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-hidden shadow-inner flex items-center justify-center min-h-[620px] relative select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Helper hint badge */}
          <div className="absolute top-3 left-3 z-30 pointer-events-none flex items-center space-x-2 bg-zinc-950/85 backdrop-blur border border-zinc-800/80 px-2.5 py-1 rounded-md text-[11px] text-zinc-400 shadow-md">
            <Move className="w-3.5 h-3.5 text-rust-500" />
            <span>Drag to Pan • Mouse Wheel to Zoom ({Math.round(zoom * 100)}%)</span>
          </div>

          {/* Scaled & Translated Map Surface */}
          <div
            ref={mapContainerRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            className="relative w-[540px] h-[540px] bg-[#0c1421] rounded-xl shadow-2xl cursor-crosshair border border-zinc-800/80 transition-transform duration-75 select-none"
          >
            {/* Map Terrain Image */}
            <img
              src="https://content.rustmaps.com/maps/290/4349c039912148afb138c9d2590b7b1d/map_raw_normalized.webp"
              alt="Rust Map"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none opacity-90 rounded-xl"
            />

            {/* Grid Overlay */}
            {visibleCategories.grid && (
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 pointer-events-none opacity-25 border border-white/20">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className="border border-white/20 flex items-start p-1 text-[8px] font-mono text-white">
                    {String.fromCharCode(65 + (i % 5))}{Math.floor(i / 5) + 1}
                  </div>
                ))}
              </div>
            )}

            {/* POI Glyphs & Markers */}
            {filteredMonuments.map((m) => {
              const pos = toPercentage(m.x, m.z);
              const glyph = getMonumentGlyph(m);
              const GlyphIcon = glyph.icon;
              const isSelected = selectedCoord && Math.hypot(selectedCoord.x - m.x, selectedCoord.z - m.z) < 25;
              const isHovered = hoveredMonument?.id === m.id;

              return (
                <div
                  key={m.id}
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                    transformOrigin: 'center center',
                    zIndex: isHovered ? 40 : (isSelected ? 30 : 10),
                  }}
                  className="absolute pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectMonument(m);
                  }}
                  onMouseEnter={() => setHoveredMonument(m)}
                  onMouseLeave={() => setHoveredMonument(null)}
                >
                  {/* Glyph Circular Badge */}
                  <div
                    className={`rounded-full flex items-center justify-center border shadow-md transition-transform duration-150 hover:scale-125 ${
                      glyph.bg
                    } ${glyph.border} ${glyph.text} ${glyph.badgeSize} ${
                      isSelected ? 'ring-4 ring-rust-500 scale-125 shadow-rust-500/60' : ''
                    }`}
                  >
                    <GlyphIcon className={glyph.iconSize} />
                  </div>
                </div>
              );
            })}

            {/* Live Player Pins */}
            {visibleCategories.players && players.map((p) => {
              const pos = toPercentage(p.x, p.z);
              return (
                <div
                  key={p.id}
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                    transformOrigin: 'center center',
                  }}
                  className="absolute pointer-events-auto z-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    centerOnCoords(p.x, p.z, true);
                    setToast(`Centered on player: ${p.name}`);
                    setTimeout(() => setToast(null), 2000);
                  }}
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                    <Users className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-cyan-950/90 text-cyan-200 text-[10px] font-bold rounded whitespace-nowrap border border-cyan-600 shadow-md">
                    {p.name}
                  </div>
                </div>
              );
            })}

            {/* Clicked Target Marker */}
            {selectedCoord && (
              <div
                style={{
                  ...toPercentage(selectedCoord.x, selectedCoord.z),
                  transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                  transformOrigin: 'center center',
                }}
                className="absolute pointer-events-none z-30"
              >
                {/* Ping pulse centered on point */}
                <div className="w-8 h-8 rounded-full border-2 border-rust-500 bg-rust-500/20 animate-ping" />

                {/* Crosshair centered on point */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crosshair className="w-6 h-6 text-rust-400 drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]" />
                  {/* Exact center dot */}
                  <div className="w-1.5 h-1.5 rounded-full bg-rust-500 absolute" />
                </div>
              </div>
            )}

            {/* Global Hovered POI Tooltip Card - Always on Top of All Pins & Fixed Screen Scale */}
            {hoveredMonument && (() => {
              const pos = toPercentage(hoveredMonument.x, hoveredMonument.z);
              const glyph = getMonumentGlyph(hoveredMonument);
              const GlyphIcon = glyph.icon;

              return (
                <div
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: `translate(-50%, -100%) scale(${1 / zoom})`,
                    transformOrigin: 'bottom center',
                  }}
                  className="absolute pointer-events-none z-50 flex flex-col items-center pb-2.5"
                >
                  <div className="bg-zinc-950/95 border border-zinc-700/90 px-3 py-1.5 rounded-lg shadow-2xl text-white text-xs whitespace-nowrap flex items-center space-x-2.5 backdrop-blur-md">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${glyph.bg} text-white shadow-sm flex-shrink-0`}>
                      <GlyphIcon className="w-3 h-3" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-100 text-xs">{hoveredMonument.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        X: {Math.round(hoveredMonument.x)} • Z: {Math.round(hoveredMonument.z)}
                      </span>
                    </div>
                  </div>
                  {/* Tooltip caret */}
                  <div className="w-2 h-2 bg-zinc-950 border-r border-b border-zinc-700 -mt-1 rotate-45" />
                </div>
              );
            })()}
          </div>
        </div>

        {/* Map Sidebar: POI List & Coordinates */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Coordinates & Teleport Section */}
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-rust-500" />
                <span>Selected Coordinates</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Click map or pick a POI to center</p>
            </div>

            {selectedCoord ? (
              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">World X:</span>
                  <span className="font-mono font-bold text-zinc-200">{selectedCoord.x} m</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">World Z:</span>
                  <span className="font-mono font-bold text-zinc-200">{selectedCoord.z} m</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Teleport Cmd:</span>
                  <span className="font-mono text-rust-400 text-[11px] truncate">
                    teleportpos {selectedCoord.x} 50 {selectedCoord.z}
                  </span>
                </div>
                <button
                  onClick={handleTeleport}
                  className="w-full mt-2 py-2 bg-rust-600 hover:bg-rust-500 active:bg-rust-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Teleport to Location</span>
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-zinc-500 text-xs bg-zinc-950/40 rounded-lg border border-dashed border-zinc-800">
                Click anywhere on the map or pick a POI below.
              </div>
            )}

            {/* POI Search Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">
                  Monuments & POIs ({filteredMonuments.length})
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Oil, Dome, Silo..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-rust-500"
                />
              </div>

              {/* Scrollable Monuments List with Glyphs */}
              <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {filteredMonuments.map((m) => {
                  const glyph = getMonumentGlyph(m);
                  const GlyphIcon = glyph.icon;
                  const isSelected = selectedCoord && selectedCoord.x === Math.round(m.x) && selectedCoord.z === Math.round(m.z);

                  return (
                    <button
                      key={m.id}
                      onClick={() => selectMonument(m)}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between text-xs group ${
                        isSelected
                          ? 'bg-rust-950/50 border-rust-500 text-rust-100 shadow-sm'
                          : 'bg-zinc-950/50 hover:bg-zinc-800/60 border-zinc-800/80 text-zinc-300'
                      }`}
                      title="Click to center and target monument"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${glyph.bg} ${glyph.text} border ${glyph.border}`}>
                          <GlyphIcon className="w-2.5 h-2.5" />
                        </div>
                        <span className="font-medium truncate">{m.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500 flex-shrink-0 ml-2 group-hover:text-zinc-300">
                        {Math.round(m.x)}, {Math.round(m.z)}
                      </span>
                    </button>
                  );
                })}

                {filteredMonuments.length === 0 && (
                  <div className="p-3 text-center text-zinc-500 text-xs">
                    No POIs match your search or filters.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Info Footer */}
          <div className="text-[11px] text-zinc-500 border-t border-zinc-800 pt-3 flex justify-between">
            <span>Map: 2500_1584212361</span>
            <button
              onClick={handleResetView}
              className="text-rust-400 hover:text-rust-300 transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
