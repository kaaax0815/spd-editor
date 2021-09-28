/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SaveGame {
  ankhsUsed: number;
  foodEaten: number;
  version: number;
  nextid: number;
  priranhas: number;
  limited_drops: { [key: string]: number };
  amuletObtained: boolean;
  seed: number;
  chapters: number[];
  gold: number;
  upgradesUsed: number;
  enemiesSlain: number;
  maxDepth: number;
  depth: number;
  qualifiedForNoKilling: boolean;
  sneakAttacks: number;
  region_secrets: number[];
  special_rooms: string[];
  quests: Quests;
  spawnersAlive: number;
  thrownAssists: number;
  mobs_to_champion: number;
  challenges: number;
  records: any[];
  pit_needed: number;
  hero: Hero;
  placements: boolean[];
  duration: number;
  artifact_probs: number[];
  general_probs: number[];
  potionsCooked: number;
  badges: Badges;
}

export interface Badges {
  badges: string[];
}

export interface Hero {
  htboost: number;
  cursed: boolean;
  HP: number;
  __className: string;
  HT: number;
  inventory: Inventory[];
  attackSkill: number;
  STR: number;
  weapon: Armor;
  pos: number;
  id: number;
  buffs: Buff[];
  defenseSkill: number;
  exp: number;
  class: string;
  up_names: any[];
  up_vals: any[];
  craft_names: any[];
  craft_vals: any[];
  cursedKnown: boolean;
  lvl: number;
  quantity: number;
  levelKnown: boolean;
  subClass: string;
  level: number;
  talents_tier_3: TalentsTier;
  talents_tier_4: TalentsTier;
  talents_tier_1: TalentsTier;
  talents_tier_2: TalentsTier;
  kept_lost: boolean;
  armor: Armor;
  time: number;
}

export interface Armor {
  augment: string;
  cursedKnown: boolean;
  quantity: number;
  levelKnown: boolean;
  cursed: boolean;
  level: number;
  uses_left_to_id: number;
  available_uses: number;
  seal?: Seal;
  __className: string;
  kept_lost: boolean;
  curse_infusion_bonus: boolean;
}

export interface Seal {
  cursedKnown: boolean;
  quantity: number;
  levelKnown: boolean;
  cursed: boolean;
  level: number;
  __className: string;
  kept_lost: boolean;
}

export interface Buff {
  __className: string;
  time: number;
  id: number;
  level?: number;
  partialDamage?: number;
  shielding?: number;
}

export interface Inventory {
  cursedKnown: boolean;
  quantity: number;
  levelKnown: boolean;
  cursed: boolean;
  level: number;
  uses_left_to_id?: number;
  quickslotpos?: number;
  durability?: number;
  __className: string;
  kept_lost: boolean;
  curse_infusion_bonus?: boolean;
  augment?: string;
  available_uses?: number;
  volume?: number;
  inventory?: any[];
}

export type TalentsTier = Record<string, unknown>;

export interface Quests {
  blacksmith: Blacksmith;
  wandmaker: Blacksmith;
  sadGhost: Blacksmith;
  demon: Blacksmith;
}

export interface Blacksmith {
  spawned: boolean;
}
