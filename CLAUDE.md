@AGENTS.md

# Dog Bingo — project conventions for Claude Code

Read `docs/visual_bingo_design.md` before changing game rules. Its §56 "Claude Code Implementation Instructions" are binding; the short version:

- Domain logic (`src/domain`) stays pure, theme-agnostic, and UI-free. Add unit tests with every game-system change.
- Never weaken the unique-tile invariant. Never add a fourth rarity level. Keep re-spin outcome logic separate from its animation.
- Multiplayer mutations (future) are server-authoritative. Never expose service-role or AI provider keys to the browser.
- Prefer straightforward solutions over abstractions. Don't reach for animation libraries when CSS does the job.
- If a requirement conflicts with the design doc, stop and document it in §62 of the design doc rather than silently changing rules.

## Session ritual (required — the user asked for this)

At the end of **every** working session:

1. **Write a dev log** at `docs/devlog/YYYY-MM-DD.md` (append a `## Session N` heading if the date already exists). Cover: goal, what was built, decisions made, test/verification results with real numbers, known issues, and what's next.
2. **Update `docs/BACKLOG.md`** — mark items `[x]`/`[~]`, add discovered work under "Discovered work", never delete original items.
3. **Update `docs/visual_bingo_design.md`** — bump the "Last updated" line and add a dated entry to §62 "Implementation Notes" for any decision that refines or departs from the design. Do not rewrite the original sections; append.

## Commands

```
npm run dev            # http://localhost:3000
npm test               # vitest
npm run test:e2e       # playwright (uses port 3117 so it never collides with another dev server)
npm run simulate:cards -- --count 100000
npm run lint && npm run typecheck && npm run format:check
```

Before declaring a session done: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` must all pass. Run `npm run test:e2e` when UI changed.

## Layout cheatsheet

- `src/domain/` — types, rarity, random (injectable RNG), card-generation, respin, win-conditions. Pure.
- `src/features/game/` — `state.ts` (pure transitions), `storage.ts` (IndexedDB), `useGame.ts` (React hook).
- `src/themes/` — static registry; `dog.ts` is the content. Replaced by DB in Milestone 7.
- `src/components/` — UI. `TileCell.tsx` owns tap/info/re-spin + slot-machine animation.
- Placeholder art = `tile.metadata.placeholder { emoji, hue }` rendered by `PlaceholderArt`. Swap for `tile.primaryImage` when real art lands.

## Gotchas

- Next 16: `params` in route pages is a Promise — `await` it.
- React Compiler lint rules are on: no `Date.now()` or ref writes during render, no `setState` directly in effects (use `useSyncExternalStore` for media queries).
- Tailwind 4: tokens are defined in `globals.css` via `@theme inline`; use `bg-accent`, `text-muted`, etc.
- Corner controls on tiles must not cover the tile centre on ~70px phone tiles — sizes are capped with `min(max(...), 42%)`.
