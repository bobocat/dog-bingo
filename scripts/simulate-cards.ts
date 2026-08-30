/**
 * Game-balance simulation (§50).
 *   npm run simulate:cards -- --theme dog --count 100000 --respins 100000
 */
import { generateCard, groupByRarity } from "../src/domain/card-generation";
import { seededRandom } from "../src/domain/random";
import { reSpin } from "../src/domain/respin";
import type { GameConfig } from "../src/domain/types";
import { getThemeBySlug } from "../src/themes";

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const slug = arg("theme", "dog");
const count = Number(arg("count", "100000"));
const respinCount = Number(arg("respins", "100000"));
const seed = Number(arg("seed", String(Date.now() % 1_000_000)));

const theme = getThemeBySlug(slug);
if (!theme) {
  console.error(`Unknown theme: ${slug}`);
  process.exit(1);
}

const config: GameConfig = {
  cardColumns: theme.defaultCardColumns,
  cardRows: theme.defaultCardRows,
  freeCenter: theme.config.freeCenter,
  respins: theme.config.defaultRespins,
  rarityQuota: theme.config.rarityQuota,
  categoryRules: theme.config.categoryRules,
};
const tiles = theme.tiles;
const byId = new Map(tiles.map((t) => [t.id, t]));
const rng = seededRandom(seed);

console.log(
  `Theme "${theme.name}": ${tiles.length} tiles`,
  groupByRarity(tiles).common.length,
  "C /",
  groupByRarity(tiles).uncommon.length,
  "U /",
  groupByRarity(tiles).rare.length,
  "R",
);
console.log(`Seed ${seed}. Generating ${count.toLocaleString()} cards…`);

const t0 = performance.now();
let duplicates = 0;
let scoreMin = Infinity;
let scoreMax = -Infinity;
let scoreSum = 0;
let quotaViolations = 0;
const appearances = new Map<string, number>();
const categoryTotals = new Map<string, number>();
let attemptsSum = 0;

for (let i = 0; i < count; i++) {
  const card = generateCard({
    tiles,
    config,
    gameId: "sim",
    playerId: "sim",
    rng,
  });
  const ids = card.slots
    .filter((s) => !s.isFree)
    .map((s) => s.tileId as string);
  if (new Set(ids).size !== ids.length) duplicates++;
  scoreMin = Math.min(scoreMin, card.rarityScore);
  scoreMax = Math.max(scoreMax, card.rarityScore);
  scoreSum += card.rarityScore;
  attemptsSum += Number(
    (card.generationMetadata as { attempts: number }).attempts,
  );
  const rc = { common: 0, uncommon: 0, rare: 0 };
  for (const id of ids) {
    const t = byId.get(id)!;
    rc[t.rarityCategory]++;
    appearances.set(id, (appearances.get(id) ?? 0) + 1);
    categoryTotals.set(t.category, (categoryTotals.get(t.category) ?? 0) + 1);
  }
  if (
    rc.common !== config.rarityQuota.common ||
    rc.uncommon !== config.rarityQuota.uncommon ||
    rc.rare !== config.rarityQuota.rare
  )
    quotaViolations++;
}
const t1 = performance.now();

console.log(`\n— Cards — (${((t1 - t0) / 1000).toFixed(1)}s)`);
console.log(`Duplicate violations: ${duplicates}`);
console.log(`Quota violations:     ${quotaViolations}`);
console.log(
  `Rarity score:         min ${scoreMin} / avg ${(scoreSum / count).toFixed(2)} / max ${scoreMax}`,
);
console.log(`Avg generation tries: ${(attemptsSum / count).toFixed(2)}`);
console.log("Category distribution (avg per card):");
for (const [cat, n] of [...categoryTotals].sort((a, b) => b[1] - a[1]))
  console.log(`  ${cat.padEnd(18)} ${(n / count).toFixed(2)}`);
const never = tiles.filter((t) => t.active && !appearances.has(t.id));
console.log(
  `Tiles never selected: ${never.length}${never.length ? " -> " + never.map((t) => t.slug).join(", ") : ""}`,
);
const freq = [...appearances]
  .map(([id, n]) => [byId.get(id)!.slug, n / count] as const)
  .sort((a, b) => a[1] - b[1]);
console.log(
  `Least frequent: ${freq
    .slice(0, 3)
    .map(([s, f]) => `${s} ${(f * 100).toFixed(1)}%`)
    .join(", ")}`,
);
console.log(
  `Most frequent:  ${freq
    .slice(-3)
    .map(([s, f]) => `${s} ${(f * 100).toFixed(1)}%`)
    .join(", ")}`,
);

// ---- Re-spins ----
console.log(`\n— Re-spins — simulating ${respinCount.toLocaleString()}…`);
const base = generateCard({
  tiles,
  config,
  gameId: "sim",
  playerId: "sim",
  rng,
});
const playable = base.slots.filter((s) => !s.isFree);
const outcomes = { common: 0, uncommon: 0, rare: 0 };
let fallbacks = 0;
let respinDuplicates = 0;
for (let i = 0; i < respinCount; i++) {
  const slot = playable[i % playable.length];
  const r = reSpin({
    card: base,
    slotId: slot.id,
    tiles,
    respinsRemaining: 3,
    respinsTotal: 3,
    playerId: "sim",
    rng,
  });
  outcomes[byId.get(r.event.newTileId)!.rarityCategory]++;
  if (r.event.usedFallbackPool) fallbacks++;
  const ids = r.card.slots.filter((s) => !s.isFree).map((s) => s.tileId);
  if (new Set(ids).size !== ids.length) respinDuplicates++;
}
for (const k of ["common", "uncommon", "rare"] as const)
  console.log(
    `  ${k.padEnd(9)} ${((outcomes[k] / respinCount) * 100).toFixed(2)}%`,
  );
console.log(`Fallback pool used:   ${fallbacks}`);
console.log(`Duplicate introduced: ${respinDuplicates}`);

// Three-use limit
let remaining = 3;
let uses = 0;
try {
  for (;;) {
    const r = reSpin({
      card: base,
      slotId: playable[uses].id,
      tiles,
      respinsRemaining: remaining,
      respinsTotal: 3,
      playerId: "sim",
      rng,
    });
    remaining = r.respinsRemaining;
    uses++;
  }
} catch {
  /* expected at 0 */
}
console.log(
  `Three-use limit:      ${uses === 3 ? "OK" : "FAILED (" + uses + ")"}`,
);

if (duplicates || quotaViolations || respinDuplicates || uses !== 3)
  process.exit(1);
