# Dog Bingo — Visual Bingo / Lotería

A mobile-first, full-screen web app that combines Bingo, Lotería, and a real-world visual scavenger hunt. The first theme is **Dog Spotting**. See [`docs/visual_bingo_design.md`](docs/visual_bingo_design.md) for the full design and [`docs/BACKLOG.md`](docs/BACKLOG.md) for status.

**Current state:** playable single-player MVP with placeholder graphics (Milestones 0–4 + most of 6). No backend, no accounts, no real artwork yet.

## Setup

Requires Node 20+ (developed on Node 24).

```bash
npm install
cp .env.example .env.local   # optional — nothing is required for single player
npm run dev                  # http://localhost:3000
```

Open it on a phone (or use browser device emulation in portrait) for the intended experience.

## Scripts

| Command                                                     | What it does                                                                                                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                               | Dev server (Turbopack)                                                                                                                          |
| `npm run build` / `npm start`                               | Production build / serve                                                                                                                        |
| `npm test`                                                  | Vitest unit tests (domain logic, state, theme content)                                                                                          |
| `npm run test:e2e`                                          | Playwright e2e on iPhone 14, Pixel 7, and desktop viewports (starts the dev server itself). First run: `npx playwright install chromium webkit` |
| `npm run simulate:cards -- --count 100000 --respins 100000` | Game-balance simulation (§50 of the design doc); exits non-zero on any invariant violation                                                      |
| `npm run lint` / `npm run typecheck` / `npm run format`     | ESLint / `tsc --noEmit` / Prettier                                                                                                              |

## Project layout

```
src/
  app/            Next.js routes: / (themes), /play/[slug]
  components/     UI: CardGrid, TileCell (tap / info / re-spin + slot-machine animation),
                  TileDetail, OptionsScreen, CompletionOverlay, PlayScreen, PlaceholderArt
  domain/         Pure, theme-agnostic game logic (heavily unit tested):
                  types, rarity, random, card-generation, respin, win-conditions
  features/game/  state.ts (pure game-state transitions), storage.ts (IndexedDB),
                  useGame.ts (React hook wiring state + persistence)
  themes/         Static theme registry; dog.ts holds the 68-tile Dog Spotting content
  env/            zod-validated environment variables
scripts/          simulate-cards.ts
e2e/              Playwright specs
docs/             Design doc, backlog, dev logs
```

## Key rules (from the design doc)

- Every playable slot on a card is a **unique tile** — a hard invariant enforced at generation, re-spin, and restore.
- Exactly **three rarity levels** (common=1, uncommon=2, rare=3). Default 24-slot card is 12/8/4 = 40 points.
- **Re-spins**: 3 per game; rarity is chosen uniformly _first_, then a tile from that pool; the animation never decides the outcome.
- Domain logic never imports from UI. Keep it that way so multiplayer (server-authoritative) can reuse it.

## Environment variables

See [`.env.example`](.env.example). Everything is optional in Phase 1. Never commit `.env.local`; never expose service-role or AI provider keys to the browser.

## Working on this repo with Claude Code

See [`CLAUDE.md`](CLAUDE.md) for the session ritual (dev log, backlog, design doc updates).
