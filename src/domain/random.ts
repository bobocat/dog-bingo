/**
 * Random source abstraction so domain logic is testable/deterministic.
 * `next()` returns a float in [0, 1).
 */
export interface RandomSource {
  next(): number;
}

/** Unbiased-enough browser/Node source using Web Crypto when available. */
export const cryptoRandom: RandomSource = {
  next() {
    const g = globalThis as {
      crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array };
    };
    if (g.crypto?.getRandomValues) {
      const buf = new Uint32Array(1);
      g.crypto.getRandomValues(buf);
      return buf[0] / 0x1_0000_0000;
    }
    return Math.random();
  },
};

/** Deterministic mulberry32 PRNG for tests and simulations. */
export function seededRandom(seed: number): RandomSource {
  let a = seed >>> 0;
  return {
    next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/** Integer in [0, n). */
export function randomInt(rng: RandomSource, n: number): number {
  return Math.floor(rng.next() * n);
}

/** Fisher–Yates shuffle; returns a new array. */
export function shuffle<T>(rng: RandomSource, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pick<T>(rng: RandomSource, items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick() from empty array");
  return items[randomInt(rng, items.length)];
}

/** Short random id (not a UUID; fine for local single-player). */
export function randomId(
  rng: RandomSource = cryptoRandom,
  length = 12,
): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < length; i++)
    s += alphabet[randomInt(rng, alphabet.length)];
  return s;
}
