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

export interface WikiItemDetail {
  craft?: CraftDetail;
  recycle?: RecycleDetail[];
  recycleSafeZone?: RecycleDetail[];
  loot?: LootSourceDetail[];
  ammoFor?: AmmoForDetail[];
  nutrition?: NutritionDetail;
}

export const ITEM_DETAILS: Record<string, WikiItemDetail> = (rawDetails as any) || {};

export function getItemDetails(shortname: string): WikiItemDetail | null {
  const d = ITEM_DETAILS[shortname];
  if (!d) return null;
  return d;
}
