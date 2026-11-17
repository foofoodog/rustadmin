import allItemsData from './allRustItems.json';

export interface RustItem {
  id?: number;
  name: string;
  shortname: string;
  category: string;
  defaultAmount?: number;
  description?: string;
  stackable?: number;
  rarity?: string;
  icon?: string;
  isVehicle?: boolean;
}

export const VEHICLE_SHORTNAMES = new Set([
  'minicopter',
  'scraptransportheli',
  'scraptransportheli.repair',
  'attackhelicopter',
  'rowboat',
  'rhib',
  'tugboat',
  'submarinesolo',
  'submarineduo',
  '2module.car',
  '2module.car.chassis',
  '3module.car',
  '3module.car.chassis',
  '4module.car',
  '4module.car.chassis',
  'snowmobile',
  'snowmobiletomaha',
  'workcart',
  'locomotive',
  'motorbike',
  'bicycle',
  'pedalbike',
  'pedaltrike'
]);

// Determine intelligent default give amounts based on item category and stack size
function computeDefaultAmount(item: any): number {
  const stack = item.stackable || 1;
  const cat = item.category?.toLowerCase() || '';

  if (stack === 1) return 1;
  if (cat === 'ammo' || cat === 'ammunition') return Math.min(stack, 128);
  if (cat === 'resources') return Math.min(stack, 1000);
  if (cat === 'medical') return Math.min(stack, 10);
  if (cat === 'food') return Math.min(stack, 20);
  if (cat === 'components') return Math.min(stack, 20);
  return Math.min(stack, 10);
}

export const RUST_ITEMS: RustItem[] = (allItemsData as any[]).map((item) => ({
  id: item.id,
  name: item.name,
  shortname: item.shortname,
  category: item.category,
  defaultAmount: computeDefaultAmount(item),
  description: item.description,
  stackable: item.stackable || 1,
  rarity: item.rarity,
  icon: item.icon || `${item.shortname}.webp`,
  isVehicle: VEHICLE_SHORTNAMES.has(item.shortname)
}));

export const RUST_CATEGORIES = [
  'All',
  'Weapons',
  'Construction',
  'Items',
  'Resources',
  'Attire',
  'Tools',
  'Medical',
  'Food',
  'Ammo',
  'Traps',
  'Misc',
  'Components',
  'Electrical',
  'Fun',
  'Vehicles'
] as const;

export function getItemIconUrl(shortname: string): string {
  return `/items/${shortname}.png`;
}

export function getItemFallbackIconUrl(shortname: string): string {
  return `https://wiki.rustclash.com/img/items180/${shortname}.png`;
}

export function getItemTertiaryIconUrl(shortname: string, iconFilename?: string): string {
  const file = iconFilename || `${shortname}.webp`;
  return `https://raw.githubusercontent.com/bobosneefdev/rust-items-json/master/data/icons/${file}`;
}
