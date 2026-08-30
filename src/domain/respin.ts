import { CardGenerationError, assertUniqueTiles } from "./card-generation";
import { cryptoRandom, pick, randomId, type RandomSource } from "./random";
import type {
  Card,
  CardSlot,
  RarityCategory,
  ReSpinEvent,
  SlotId,
  Tile,
} from "./types";

export type ReSpinFailure =
  | "NO_RESPINS_REMAINING"
  | "SLOT_NOT_FOUND"
  | "SLOT_IS_FREE"
  | "SLOT_ALREADY_FOUND"
  | "NO_ELIGIBLE_REPLACEMENT";

export class ReSpinError extends Error {
  constructor(
    message: string,
    public readonly code: ReSpinFailure,
  ) {
    super(message);
    this.name = "ReSpinError";
  }
}

export interface ReSpinInput {
  card: Card;
  slotId: SlotId;
  tiles: readonly Tile[];
  respinsRemaining: number;
  /** Total re-spins the game started with; used for respinNumber. */
  respinsTotal: number;
  playerId: string;
  rng?: RandomSource;
  idempotencyKey?: string;
  now?: number;
}

export interface ReSpinResult {
  card: Card;
  respinsRemaining: number;
  event: ReSpinEvent;
  newTile: Tile;
}

export function canReSpin(slot: CardSlot, respinsRemaining: number): boolean {
  return respinsRemaining > 0 && !slot.isFree && !slot.isFound;
}

/** Tiles that could legally replace a slot: active, not on the card anywhere (§16.2). */
export function eligibleReplacements(
  card: Card,
  tiles: readonly Tile[],
): Tile[] {
  const onCard = new Set(
    card.slots.map((s) => s.tileId).filter((id): id is string => id !== null),
  );
  return tiles.filter((t) => t.active && !onCard.has(t.id));
}

/**
 * Choose a replacement: pick rarity uniformly first, then a tile from that pool (§16.3).
 * Falls back to remaining rarity pools if the chosen one is empty (§16.4).
 */
export function chooseReplacement(
  eligible: readonly Tile[],
  rng: RandomSource,
): { tile: Tile; usedFallbackPool: boolean } {
  let categories: RarityCategory[] = ["common", "uncommon", "rare"];
  let usedFallbackPool = false;
  while (categories.length > 0) {
    const cat = pick(rng, categories);
    const pool = eligible.filter((t) => t.rarityCategory === cat);
    if (pool.length > 0) return { tile: pick(rng, pool), usedFallbackPool };
    usedFallbackPool = true;
    categories = categories.filter((c) => c !== cat);
  }
  throw new ReSpinError(
    "No eligible replacement tile in any rarity pool",
    "NO_ELIGIBLE_REPLACEMENT",
  );
}

/** Pure re-spin transaction. Returns a new card; never mutates input. */
export function reSpin(input: ReSpinInput): ReSpinResult {
  const rng = input.rng ?? cryptoRandom;
  const now = input.now ?? Date.now();
  const { card, tiles } = input;

  if (input.respinsRemaining <= 0)
    throw new ReSpinError("No re-spins remaining", "NO_RESPINS_REMAINING");
  const slot = card.slots.find((s) => s.id === input.slotId);
  if (!slot) throw new ReSpinError("Slot not on card", "SLOT_NOT_FOUND");
  if (slot.isFree)
    throw new ReSpinError("Free slot cannot be re-spun", "SLOT_IS_FREE");
  if (slot.isFound)
    throw new ReSpinError("Found slot cannot be re-spun", "SLOT_ALREADY_FOUND");

  const oldTile = tiles.find((t) => t.id === slot.tileId);
  if (!oldTile)
    throw new ReSpinError("Slot tile missing from theme", "SLOT_NOT_FOUND");

  const eligible = eligibleReplacements(card, tiles);
  const { tile: newTile, usedFallbackPool } = chooseReplacement(eligible, rng);

  const newSlots = card.slots.map((s) =>
    s.id === slot.id ? { ...s, tileId: newTile.id, version: s.version + 1 } : s,
  );
  assertUniqueTiles(newSlots); // hard invariant; should be unreachable
  const newCard: Card = { ...card, slots: newSlots };

  const respinsRemaining = input.respinsRemaining - 1;
  const event: ReSpinEvent = {
    id: randomId(rng),
    gameId: card.gameId,
    playerId: input.playerId,
    cardId: card.id,
    slotId: slot.id,
    oldTileId: oldTile.id,
    newTileId: newTile.id,
    oldRarity: oldTile.rarityScore,
    newRarity: newTile.rarityScore,
    respinNumber: input.respinsTotal - respinsRemaining,
    usedFallbackPool,
    idempotencyKey: input.idempotencyKey ?? randomId(rng),
    createdAt: now,
  };

  return { card: newCard, respinsRemaining, event, newTile };
}

export { CardGenerationError };
