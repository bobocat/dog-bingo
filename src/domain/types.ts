/**
 * Core domain types. Theme-agnostic: nothing here knows about dogs.
 * The UI is never the source of truth for these definitions.
 */

// ---------- Rarity (exactly three levels — see design doc §8) ----------

export const RARITY_CATEGORIES = ["common", "uncommon", "rare"] as const;
export type RarityCategory = (typeof RARITY_CATEGORIES)[number];

export const RARITY_SCORES = [1, 2, 3] as const;
export type RarityScore = (typeof RARITY_SCORES)[number];

// ---------- Theme & tiles ----------

export type ThemeStatus = "draft" | "published" | "archived";

export type TileId = string;
export type ThemeId = string;

export interface TileImage {
  id: string;
  imageType: "primary" | "reference" | "alternate" | "cover";
  url: string;
  thumbnailUrl?: string;
  altText: string;
  approved: boolean;
  displayOrder: number;
}

export interface Tile {
  id: TileId;
  themeId: ThemeId;
  slug: string;
  name: string;
  shortName?: string;
  /** Theme-defined category, e.g. "breed" or "behavior". Free-form string. */
  category: string;
  rarityScore: RarityScore;
  rarityCategory: RarityCategory;
  description?: string;
  identificationTips?: string;
  sizeNotes?: string;
  coatNotes?: string;
  primaryImage?: TileImage;
  referenceImages?: TileImage[];
  active: boolean;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

/** Optional per-category min/max limits applied during generation (§7). */
export interface CategoryRule {
  category: string;
  min?: number;
  max?: number;
}

export interface RarityQuota {
  common: number;
  uncommon: number;
  rare: number;
}

export interface ThemeConfig {
  freeCenter: boolean;
  defaultRespins: number;
  rarityQuota: RarityQuota;
  /** Approximate mode (§12.3). Unused for the dog MVP. */
  targetRarityScore?: number;
  rarityTolerance?: number;
  categoryRules?: CategoryRule[];
}

export interface Theme {
  id: ThemeId;
  slug: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  status: ThemeStatus;
  defaultGameMode: GameModeId;
  defaultCardColumns: number;
  defaultCardRows: number;
  recommendedAge?: string;
  /** Optional theme-specific label for the full_card mode, e.g. "Loteria". */
  fullCardLabel?: string;
  config: ThemeConfig;
  tiles: Tile[];
}

// ---------- Game modes & win conditions (§5) ----------

export type GameModeId = "bingo" | "full_card";

export type WinCondition =
  | { type: "any_line" }
  | { type: "row" }
  | { type: "column" }
  | { type: "diagonal" }
  | { type: "lines"; count: number }
  | { type: "four_corners" }
  | { type: "full_card" };

export interface GameMode {
  id: GameModeId;
  /** Player-facing label may be theme-specific; this is the default. */
  label: string;
  winCondition: WinCondition;
}

// ---------- Cards & slots (§10, §23) ----------

export type SlotId = string;

export interface CardSlot {
  id: SlotId;
  position: number;
  /** null only when isFree is true */
  tileId: TileId | null;
  isFree: boolean;
  isFound: boolean;
  foundAt?: number;
  /** Incremented on each mutation (re-spin, toggle) for optimistic sync. */
  version: number;
}

export interface Card {
  id: string;
  gameId: string;
  playerId: string;
  columns: number;
  rows: number;
  slots: CardSlot[];
  rarityScore: number;
  generationMetadata?: Record<string, unknown>;
  createdAt: number;
}

// ---------- Players & games ----------

export type GameType = "single_player" | "multiplayer";
export type GameStatus = "lobby" | "active" | "completed" | "abandoned";
export type PlayerStatus = "active" | "left" | "disconnected";

export interface Player {
  id: string;
  gameId: string;
  nickname: string;
  /** Nullable now; team play is Milestone 9 (§21). */
  teamId: string | null;
  respinsRemaining: number;
  status: PlayerStatus;
  joinedAt: number;
  lastSeenAt?: number;
}

export interface GameConfig {
  cardColumns: number;
  cardRows: number;
  freeCenter: boolean;
  respins: number;
  rarityQuota: RarityQuota;
  categoryRules?: CategoryRule[];
}

export interface Game {
  id: string;
  themeId: ThemeId;
  gameType: GameType;
  gameMode: GameModeId;
  winCondition: WinCondition;
  status: GameStatus;
  joinCode?: string;
  hostPlayerId?: string;
  config: GameConfig;
  startedAt?: number;
  endedAt?: number;
  createdAt: number;
}

// ---------- Re-spins (§16) ----------

export interface ReSpinEvent {
  id: string;
  gameId: string;
  playerId: string;
  cardId: string;
  slotId: SlotId;
  oldTileId: TileId;
  newTileId: TileId;
  oldRarity: RarityScore;
  newRarity: RarityScore;
  /** 1-based index of this re-spin within the game (1..respins). */
  respinNumber: number;
  /** True when the chosen rarity pool was empty and a fallback pool was used (§16.4). */
  usedFallbackPool: boolean;
  idempotencyKey: string;
  createdAt: number;
}
