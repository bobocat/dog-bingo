# Implementation Backlog

Extracted from `visual_bingo_design.md` §55 on 2026-08-30. This is the running checklist required by design doc §56.16. Update it at the end of every session.

**Priority:** P0 required for milestone · P1 important · P2 useful later
**Status:** `[x]` done · `[~]` partial (note why) · `[ ]` not started

---

## Milestone 0 — Project Foundation

- [x] **P0 — Initialize application** — Next.js 16 + TypeScript, Tailwind 4, ESLint, Prettier, Vitest, Playwright, zod env validation (`src/env`). App starts, prod build succeeds, `npm test` / `npm run test:e2e` exist, no secrets committed.
- [x] **P0 — Establish domain types** — `src/domain/types.ts`: Theme, Tile, Rarity (1/2/3 only), Card, CardSlot, Game, GameMode, WinCondition, Player, ReSpinEvent. No `any`.
- [x] **P1 — Create design tokens** — `src/app/globals.css` `:root` tokens for color, radius, shadow, touch target, animation durations; core screens use them.

## Milestone 1 — Core Prototype

- [x] **P0 — Hardcoded dog card** — superseded: went straight to data-driven generation. 5×5, free center, 24 playable tiles, portrait layout, no horizontal scroll (e2e asserted).
- [x] **P0 — Mark found interaction** — tap toggles, stamp overlay + desaturation, repeat tap undoes, info/re-spin buttons stop propagation.
- [x] **P0 — Tile detail view** — bottom sheet with name, large art, tips, size, coat, reference-image strip (placeholders until M5).
- [x] **P0 — Basic win detection** — `win-conditions.ts` implements any_line, row, column, diagonal, lines(N), four_corners, full_card as data. Unit tested; completion fires exactly once (`state.test.ts`).

## Milestone 2 — Theme + Rarity System

- [x] **P0 — Theme data schema** — `Theme`/`ThemeConfig` types; static registry in `src/themes`. App loads dog theme from data.
- [x] **P0 — Tile rarity** — `rarity.ts`; only 1/2/3 accepted. Rarity pip shown on every tile (C/U/R) and in detail view.
- [x] **P0 — Unique card generator** — `card-generation.ts`; clear `CardGenerationError` codes; 10,000-card zero-duplicate test.
- [x] **P0 — Rarity-balanced generation** — 12/8/4 default quota, configurable per theme, every card scores 40.
- [x] **P1 — Category balancing** — optional min/max rules with bounded retries; unsatisfiable config reported. Dog theme uses `breed ≤ 14`, `clothing ≤ 3`.
- [x] **P1 — Card simulator CLI** — `npm run simulate:cards -- --count 100000`. Reports duplicates, quota compliance, category distribution, tile frequency, re-spin distribution, 3-use limit.

## Milestone 3 — Re-Spin System

- [x] **P0 — Re-spin UI control** — lower-right corner, ≥36px hit area, only on unfound eligible tiles, stops propagation.
- [x] **P0 — Three-re-spin limit** — counter starts at 3; buttons disappear at 0 (e2e asserted).
- [x] **P0 — Equal rarity selection** — rarity chosen uniformly first, then tile. 100k simulation ≈ 33/33/33.
- [x] **P0 — Re-spin uniqueness** — replacement never same tile or already on card; 100k re-spin test.
- [x] **P0 — Empty rarity pool fallback** — removes exhausted rarity and re-picks; `usedFallbackPool` recorded on the event; unit tested.
- [x] **P0 — Slot-machine animation** — `TileCell.tsx` cycles candidates with slowing gaps and lands on the predetermined result; reduced-motion skips cycling.
- [~] **P1 — Re-spin analytics event** — `ReSpinEvent` recorded in `respinHistory` (old/new tile + rarity, respin number, fallback flag). No analytics sink yet (M11).

## Milestone 4 — Complete Dog Theme

- [x] **P0 — Create 50–75 initial tiles** — 68 tiles: 22 breeds, 4 mixed/type, 42 observation across behavior/clothing/owner_interaction/environment/special.
- [~] **P0 — Identification content** — every tile has `identificationTips`; breeds have size + coat notes. Needs editorial review and `description` copy.
- [~] **P0 — Assign rarity editorially** — assigned (28 C / 25 U / 15 R). Needs playtest review; rare tier should be re-checked per region.

## Milestone 5 — Local AI Image Generation

> **2026-08-30 interim:** all 68 tile illustrations were generated with Gemini (`gemini-3.1-flash-image`) via the MCP image tool using the §36.1 master style prompt, reviewed by sampling, optimized with sharp, and shipped in `public/tiles/`. The ComfyUI/FLUX local pipeline below remains the plan for regeneration, admin workflow, and future themes. Masters live outside the repo at `C:/git/nanobanana/pictures/`.

- [ ] **P0 — Install/test ComfyUI generation workflow** (FLUX.2 [klein] 4B)
- [ ] **P0 — Create master style prompt**
- [ ] **P0 — Create breed prompt builder**
- [ ] **P0 — Generation job schema**
- [ ] **P0 — Local generation worker**
- [ ] **P0 — Admin generation queue**
- [ ] **P0 — Candidate approval workflow**
- [ ] **P1 — Automatic thumbnail generation**
- [ ] **P1 — Style reference workflow**
- [ ] **P2 — LoRA experiment**

## Milestone 6 — Production Single Player

- [x] **P0 — IndexedDB persistence** — `storage.ts`; refresh restores card, found state, re-spins, replacements (e2e asserted). Restored state is re-validated against the unique-tile invariant. Hardened 2026-08-30: legacy saves are **migrated** (`migrateGameState`) instead of discarded, state re-flushes on `pagehide`/backgrounding, `navigator.storage.persist()` requested on game start, and the home screen shows a Continue card.
- [~] **P0 — PWA manifest/service worker** — manifest + icons + viewport done. **No service worker yet**; offline play not implemented.
- [x] **P0 — Optimized image loading** — masters resized to 384×512 card WebP + 768×1024 detail WebP via `scripts/optimize-tiles.mjs`; card uses thumbnails, detail lazy-loads; emoji fallback on load failure.
- [x] **P0 — Game options screen** — Bingo / Full Card; free-center toggle shown only for odd×odd grids (default 4×4 Loteria card has none).
- [x] **P0 — Completion screen** — confetti, stats (found, time, re-spins used), Play again / Change options / Themes.
- [x] **P1 — Sound/haptics** — Web Audio synthesized chirps on mark/unmark + navigator.vibrate; mute toggle in the play footer, preference in localStorage (`src/features/game/feedback.ts`).
- [~] **P1 — Accessibility pass** — aria labels, roles, keyboard toggle, focus rings, reduced motion in place. Needs contrast audit and screen-reader test.

## Milestone 7 — Supabase Production Backend

- [ ] **P0 — Create PostgreSQL schema**
- [ ] **P0 — Storage** buckets/policies
- [ ] **P0 — Admin authentication**
- [ ] **P0 — RLS/security policy pass**
- [ ] **P1 — Content publishing status**

## Milestone 8 — Multiplayer

- [ ] **P0 — Create game + join code**
- [ ] **P0 — Join by nickname**
- [ ] **P0 — Multiplayer lobby**
- [ ] **P0 — Server-authoritative card generation**
- [ ] **P0 — Realtime tile updates**
- [ ] **P0 — Server-authoritative re-spin endpoint**
- [ ] **P0 — Server winner validation**
- [ ] **P0 — Reconnect**
- [ ] **P1 — Progress leaderboard**
- [~] **P1 — QR joining** — single-player invite shipped early: home-screen "Invite a friend" QR + share sheet (`InviteButton.tsx`, `qrcode` pkg) links to the app so a friend plays their own card. True QR _game joining_ (`/join/CODE`) still belongs to multiplayer.

## Milestone 9 — Teams

- [ ] **P1 — Team data model** (`teamId` nullable field already present on `Player`)
- [ ] **P1 — Shared team card mode**
- [ ] **P2 — Individual card/team score mode**
- [ ] **P2 — Team rankings**

## Milestone 10 — Admin / Theme Authoring

- [ ] **P0 — Theme CRUD**
- [ ] **P0 — Tile CRUD**
- [ ] **P0 — Rarity/category editing**
- [ ] **P0 — Theme validation** (`validatePool()` exists in domain; needs UI)
- [ ] **P1 — Card preview/simulator UI**
- [ ] **P1 — Batch image generation**
- [ ] **P1 — Batch publish validation**

## Milestone 11 — Analytics and Balancing

- [ ] **P1 — Game analytics**
- [ ] **P1 — Tile find analytics**
- [ ] **P1 — Re-spin analytics**
- [ ] **P1 — Balance dashboard**

---

## Discovered work (not in original design doc)

- [ ] **P1 — Service worker / offline** — required for §25; consider `serwist` or hand-rolled SW once real image assets exist.
- [ ] **P1 — Long-press to open tile info** — §15 recommends long press in addition to the `i` button. Only the button exists.
- [ ] **P2 — Free-center-off balancing** — currently adds one common tile; consider a theme-defined full-size quota instead.
- [ ] **P2 — Multiple saved games** — storage keys by game id already; UI only tracks one "current" game.
- [ ] **P2 — Un-marking after completion** — game freezes at `completed`; decide whether players may reopen a card.
- [x] **P2 — Placeholder art for tiles that share an emoji** — resolved: real art shipped for all 68 tiles; emoji remains only as a load-failure fallback.
- [ ] **P1 — Per-tile art QA pass** — sampled tiles look right, but all 68 should be reviewed against the §41 checklist (anatomy, breed accuracy, stray text/frames). One frame already cropped (`person_walking_three_dogs`).
- [ ] **P2 — Commit or archive master images** — 68 JPEG masters live outside the repo; decide where they belong (repo LFS, Supabase Storage in M7, or archive).
- [ ] **P2 — Sound on win/re-spin** — only mark/unmark has audio; consider a completion fanfare and re-spin tick.
