import { quotaTotal } from "./rarity";
import { cryptoRandom, randomId, shuffle, type RandomSource } from "./random";
import type {
  Card,
  CardSlot,
  CategoryRule,
  GameConfig,
  RarityCategory,
  RarityQuota,
  Tile,
  TileId,
} from "./types";

/** Specific, actionable error so theme content can be corrected (§13). */
export class CardGenerationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INSUFFICIENT_POOL"
      | "QUOTA_SIZE_MISMATCH"
      | "CATEGORY_UNSATISFIABLE"
      | "INVARIANT_VIOLATION",
  ) {
    super(message);
    this.name = "CardGenerationError";
  }
}

export interface GenerateCardOptions {
  tiles: readonly Tile[];
  config: GameConfig;
  gameId: string;
  playerId: string;
  rng?: RandomSource;
  /** Bounded retries when category rules fail (§13 step 10). */
  maxAttempts?: number;
  now?: number;
}

export function playableSlotCount(
  config: Pick<GameConfig, "cardSize" | "freeCenter">,
): number {
  const total = config.cardSize * config.cardSize;
  return config.freeCenter ? total - 1 : total;
}

export function freeCenterPosition(cardSize: number): number {
  return Math.floor((cardSize * cardSize) / 2);
}

export function groupByRarity(
  tiles: readonly Tile[],
): Record<RarityCategory, Tile[]> {
  const pools: Record<RarityCategory, Tile[]> = {
    common: [],
    uncommon: [],
    rare: [],
  };
  for (const t of tiles) if (t.active) pools[t.rarityCategory].push(t);
  return pools;
}

/** Validate that a tile pool can satisfy a quota. Returns human-readable problems. */
export function validatePool(
  tiles: readonly Tile[],
  quota: RarityQuota,
): string[] {
  const pools = groupByRarity(tiles);
  const problems: string[] = [];
  for (const cat of ["common", "uncommon", "rare"] as const) {
    if (pools[cat].length < quota[cat]) {
      problems.push(
        `Need ${quota[cat]} ${cat} tiles but only ${pools[cat].length} are active`,
      );
    }
  }
  return problems;
}

function countByCategory(tiles: readonly Tile[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tiles) m.set(t.category, (m.get(t.category) ?? 0) + 1);
  return m;
}

export function categoryRulesSatisfied(
  tiles: readonly Tile[],
  rules: readonly CategoryRule[] | undefined,
): boolean {
  if (!rules || rules.length === 0) return true;
  const counts = countByCategory(tiles);
  return rules.every((r) => {
    const n = counts.get(r.category) ?? 0;
    if (r.min !== undefined && n < r.min) return false;
    if (r.max !== undefined && n > r.max) return false;
    return true;
  });
}

function selectTiles(
  tiles: readonly Tile[],
  quota: RarityQuota,
  rng: RandomSource,
): Tile[] {
  const pools = groupByRarity(tiles);
  const chosen: Tile[] = [];
  for (const cat of ["common", "uncommon", "rare"] as const) {
    chosen.push(...shuffle(rng, pools[cat]).slice(0, quota[cat]));
  }
  return chosen;
}

/** Hard invariant (§10): active playable slot count == unique tile ID count. */
export function assertUniqueTiles(slots: readonly CardSlot[]): void {
  const ids = slots.filter((s) => !s.isFree).map((s) => s.tileId);
  if (ids.some((id) => id === null)) {
    throw new CardGenerationError(
      "Playable slot has no tile",
      "INVARIANT_VIOLATION",
    );
  }
  const unique = new Set(ids as TileId[]);
  if (unique.size !== ids.length) {
    throw new CardGenerationError(
      "Duplicate tile IDs on card",
      "INVARIANT_VIOLATION",
    );
  }
}

/**
 * Generate a rarity-balanced, unique-tile card (§13).
 * Throws CardGenerationError rather than retrying forever.
 */
export function generateCard(opts: GenerateCardOptions): Card {
  const { tiles, config, gameId, playerId } = opts;
  const rng = opts.rng ?? cryptoRandom;
  const maxAttempts = opts.maxAttempts ?? 50;
  const now = opts.now ?? Date.now();

  const slotCount = playableSlotCount(config);
  if (quotaTotal(config.rarityQuota) !== slotCount) {
    throw new CardGenerationError(
      `Rarity quota totals ${quotaTotal(config.rarityQuota)} but card has ${slotCount} playable slots`,
      "QUOTA_SIZE_MISMATCH",
    );
  }

  const poolProblems = validatePool(tiles, config.rarityQuota);
  if (poolProblems.length > 0) {
    throw new CardGenerationError(poolProblems.join("; "), "INSUFFICIENT_POOL");
  }

  let selected: Tile[] | null = null;
  let attempts = 0;
  for (; attempts < maxAttempts; attempts++) {
    const candidate = selectTiles(tiles, config.rarityQuota, rng);
    if (categoryRulesSatisfied(candidate, config.categoryRules)) {
      selected = candidate;
      break;
    }
  }
  if (!selected) {
    throw new CardGenerationError(
      `Could not satisfy category rules in ${maxAttempts} attempts`,
      "CATEGORY_UNSATISFIABLE",
    );
  }

  const ordered = shuffle(rng, selected);
  const cardId = randomId(rng);
  const total = config.cardSize * config.cardSize;
  const center = freeCenterPosition(config.cardSize);
  const slots: CardSlot[] = [];
  let ti = 0;
  for (let position = 0; position < total; position++) {
    const isFree = config.freeCenter && position === center;
    slots.push({
      id: `${cardId}-${position}`,
      position,
      tileId: isFree ? null : ordered[ti++].id,
      isFree,
      isFound: false,
      version: 0,
    });
  }

  // Final validation (§13 step 14)
  if (slots.length !== total)
    throw new CardGenerationError("Wrong slot count", "INVARIANT_VIOLATION");
  assertUniqueTiles(slots);
  const rarityScore = selected.reduce((sum, t) => sum + t.rarityScore, 0);

  return {
    id: cardId,
    gameId,
    playerId,
    size: config.cardSize,
    slots,
    rarityScore,
    generationMetadata: { attempts: attempts + 1, quota: config.rarityQuota },
    createdAt: now,
  };
}
