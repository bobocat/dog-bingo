import { generateCard } from "@/domain/card-generation";
import { cryptoRandom, randomId, type RandomSource } from "@/domain/random";
import { reSpin } from "@/domain/respin";
import type {
  Card,
  Game,
  GameModeId,
  Player,
  ReSpinEvent,
  SlotId,
  Theme,
  Tile,
} from "@/domain/types";
import { GAME_MODES, isWinSatisfied } from "@/domain/win-conditions";

/**
 * Single-player game state: the persisted unit. Pure functions only;
 * the React layer and storage layer wrap these.
 */
export interface GameState {
  /** Schema version for persistence migrations. */
  schemaVersion: 1;
  game: Game;
  player: Player;
  card: Card;
  respinHistory: ReSpinEvent[];
  /** Set once when the win condition first becomes satisfied. */
  completedAt?: number;
}

export interface NewGameOptions {
  theme: Theme;
  mode: GameModeId;
  freeCenter?: boolean;
  rng?: RandomSource;
  now?: number;
}

export function newGame(opts: NewGameOptions): GameState {
  const { theme, mode } = opts;
  const rng = opts.rng ?? cryptoRandom;
  const now = opts.now ?? Date.now();
  const freeCenter = opts.freeCenter ?? theme.config.freeCenter;
  const gameId = randomId(rng);
  const playerId = randomId(rng);

  // Theme quotas are tuned for the theme's default free-center setting. If the
  // player flips it, the slot count changes by one; absorb the difference in
  // the common pool so total score stays as close to balanced as possible.
  const quota = { ...theme.config.rarityQuota };
  const slots =
    theme.defaultCardSize * theme.defaultCardSize - (freeCenter ? 1 : 0);
  quota.common += slots - (quota.common + quota.uncommon + quota.rare);

  const game: Game = {
    id: gameId,
    themeId: theme.id,
    gameType: "single_player",
    gameMode: mode,
    winCondition: GAME_MODES[mode].winCondition,
    status: "active",
    config: {
      cardSize: theme.defaultCardSize,
      freeCenter,
      respins: theme.config.defaultRespins,
      rarityQuota: quota,
      categoryRules: theme.config.categoryRules,
    },
    startedAt: now,
    createdAt: now,
  };

  const card = generateCard({
    tiles: theme.tiles,
    config: game.config,
    gameId,
    playerId,
    rng,
    now,
  });

  const player: Player = {
    id: playerId,
    gameId,
    nickname: "You",
    teamId: null,
    respinsRemaining: game.config.respins,
    status: "active",
    joinedAt: now,
  };

  return { schemaVersion: 1, game, player, card, respinHistory: [] };
}

/** Toggle found state. Returns a new state; `justCompleted` is true exactly on the completing transition. */
export function toggleSlot(
  state: GameState,
  slotId: SlotId,
  now = Date.now(),
): { state: GameState; justCompleted: boolean } {
  if (state.game.status !== "active") return { state, justCompleted: false };
  const slot = state.card.slots.find((s) => s.id === slotId);
  if (!slot || slot.isFree) return { state, justCompleted: false };

  const wasWon = isWinSatisfied(state.card, state.game.winCondition);
  const card: Card = {
    ...state.card,
    slots: state.card.slots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            isFound: !s.isFound,
            foundAt: s.isFound ? undefined : now,
            version: s.version + 1,
          }
        : s,
    ),
  };
  const isWon = isWinSatisfied(card, state.game.winCondition);
  const justCompleted = !wasWon && isWon;

  const next: GameState = {
    ...state,
    card,
    game: justCompleted
      ? { ...state.game, status: "completed", endedAt: now }
      : state.game,
    completedAt: justCompleted ? now : state.completedAt,
  };
  return { state: next, justCompleted };
}

export function reSpinSlot(
  state: GameState,
  slotId: SlotId,
  tiles: readonly Tile[],
  rng: RandomSource = cryptoRandom,
  now = Date.now(),
): { state: GameState; newTile: Tile; event: ReSpinEvent } {
  const result = reSpin({
    card: state.card,
    slotId,
    tiles,
    respinsRemaining: state.player.respinsRemaining,
    respinsTotal: state.game.config.respins,
    playerId: state.player.id,
    rng,
    now,
  });
  return {
    state: {
      ...state,
      card: result.card,
      player: { ...state.player, respinsRemaining: result.respinsRemaining },
      respinHistory: [...state.respinHistory, result.event],
    },
    newTile: result.newTile,
    event: result.event,
  };
}

/** Reopen a completed game (e.g. player un-marks a tile after winning). Not used by default. */
export function isComplete(state: GameState): boolean {
  return state.game.status === "completed";
}

/** Minimal structural validation for restored state (§10 applies to restores too). */
export function validateRestoredState(
  value: unknown,
  tilesById: Map<string, Tile>,
): value is GameState {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<GameState>;
  if (
    s.schemaVersion !== 1 ||
    !s.game ||
    !s.player ||
    !s.card ||
    !Array.isArray(s.respinHistory)
  )
    return false;
  const slots = s.card.slots;
  if (!Array.isArray(slots) || slots.length !== s.card.size * s.card.size)
    return false;
  const ids = slots.filter((x) => !x.isFree).map((x) => x.tileId);
  if (ids.some((id) => id === null || !tilesById.has(id))) return false;
  return new Set(ids).size === ids.length;
}
