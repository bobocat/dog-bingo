import type { GameState } from "./state";

/**
 * IndexedDB persistence for single-player games (§24).
 * localStorage holds only a pointer to the current game id.
 */
const DB_NAME = "dog-bingo";
const DB_VERSION = 1;
const STORE = "games";
const CURRENT_KEY = "dog-bingo:currentGameId";
const CURRENT_THEME_KEY = "dog-bingo:currentThemeSlug";

/** Slug of the theme with a game in progress (for the home-screen Continue card). */
export function getCurrentThemeSlug(): string | null {
  try {
    return localStorage.getItem(CURRENT_THEME_KEY);
  } catch {
    return null;
  }
}

export function setCurrentThemeSlug(slug: string | null): void {
  try {
    if (slug) localStorage.setItem(CURRENT_THEME_KEY, slug);
    else localStorage.removeItem(CURRENT_THEME_KEY);
  } catch {
    /* private mode */
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined")
      return reject(new Error("IndexedDB unavailable"));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE, { keyPath: "game.id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export interface GameStorage {
  save(state: GameState): Promise<void>;
  load(gameId: string): Promise<GameState | undefined>;
  remove(gameId: string): Promise<void>;
  getCurrentGameId(): string | null;
  setCurrentGameId(id: string | null): void;
}

export const indexedDbStorage: GameStorage = {
  async save(state) {
    await tx("readwrite", (s) => s.put(state));
  },
  async load(gameId) {
    return tx<GameState | undefined>(
      "readonly",
      (s) => s.get(gameId) as IDBRequest<GameState | undefined>,
    );
  },
  async remove(gameId) {
    await tx("readwrite", (s) => s.delete(gameId));
  },
  getCurrentGameId() {
    try {
      return localStorage.getItem(CURRENT_KEY);
    } catch {
      return null;
    }
  },
  setCurrentGameId(id) {
    try {
      if (id) localStorage.setItem(CURRENT_KEY, id);
      else localStorage.removeItem(CURRENT_KEY);
    } catch {
      /* private mode etc. */
    }
  },
};

/** In-memory fallback for SSR/tests. */
export function memoryStorage(): GameStorage {
  const games = new Map<string, GameState>();
  let current: string | null = null;
  return {
    async save(state) {
      games.set(state.game.id, structuredClone(state));
    },
    async load(id) {
      const g = games.get(id);
      return g ? structuredClone(g) : undefined;
    },
    async remove(id) {
      games.delete(id);
    },
    getCurrentGameId: () => current,
    setCurrentGameId: (id) => {
      current = id;
    },
  };
}
