import rawDetails from './wikiItemDetails.json';

export interface CraftIngredient {
  item: string;
  quantity: number;
}

export interface CraftDetail {
  ingredients?: CraftIngredient[];
  yield?: number;
  craftTime?: string | null;
  researchCost?: number;
  techTreeCost?: number;
}

export interface RecycleDetail {
  item: string;
  quantity: number;
  chance: string;
}

export interface LootSourceDetail {
  source: string;
  amount: string;
  chance: number;
}

export interface AmmoForDetail {
  weapon: string;
  damage: number;
  dps: number;
  velocity: number;
  headshot: string;
}

export interface NutritionDetail {
  calories?: string;
  hydration?: string;
  instantHealth?: string;
  healthOverTime?: string;
}

export interface BuffDetail {
  effect: string;
  value: string;
  duration: string;
}

export interface WikiItemDetail {
  craft?: CraftDetail;
  recycle?: RecycleDetail[];
  recycleSafeZone?: RecycleDetail[];
  loot?: LootSourceDetail[];
  ammoFor?: AmmoForDetail[];
  nutrition?: NutritionDetail;
  buffs?: BuffDetail[];
}

export const ITEM_DETAILS: Record<string, WikiItemDetail> = (rawDetails as any) || {};

export function getItemDetails(shortname: string): WikiItemDetail | null {
  const d = ITEM_DETAILS[shortname];
  if (!d) return null;
  return d;
}

export function hasNutritionalValue(shortname: string): boolean {
  const d = ITEM_DETAILS[shortname];
  if (d && d.nutrition) {
    const n = d.nutrition;
    if (n.calories || n.hydration || n.instantHealth || n.healthOverTime) {
      return true;
    }
  }
  return false;
}

export function hasItemBuffs(shortname: string): boolean {
  const d = ITEM_DETAILS[shortname];
  return !!(d && d.buffs && d.buffs.length > 0);
}

export function isAnimalFeed(shortname: string): boolean {
  if (shortname.startsWith('clone.')) return false;
  // Seeds & bait (Chicken feed & fishing bait)
  if (shortname.startsWith('seed.') || shortname === 'grub' || shortname === 'worm') return true;
  // Produce and foods eaten by horses/livestock in troughs and coops
  if (
    shortname === 'corn' ||
    shortname === 'pumpkin' ||
    shortname === 'potato' ||
    shortname === 'apple' ||
    shortname === 'apple.spoiled' ||
    shortname === 'bread.loaf' ||
    shortname === 'bread.brioche.loaf' ||
    shortname === 'jar.pickle' ||
    shortname === 'cactusflesh' ||
    shortname.endsWith('.berry') ||
    shortname.includes('raspberries') ||
    shortname.includes('blueberries')
  ) {
    return true;
  }
  return false;
}

export const isChickenOrAnimalFeed = isAnimalFeed;
