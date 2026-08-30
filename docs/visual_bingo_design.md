# Visual Bingo / Lotería Web App

## Product Design, Technical Architecture, AI Asset Pipeline, and Implementation Backlog

**Document status:** Implementation design (living)  
**Last updated:** 2026-08-30 (session 2) — portrait full-screen card; interim AI artwork shipped for all 68 tiles (see §62)  
**Primary implementation target:** Claude Code  
**Primary platform:** Mobile-first browser/PWA  
**Initial theme:** Dog spotting  
**Architecture goal:** Ship a polished single-player MVP quickly without creating a dead-end architecture for multiplayer, teams, or additional themes.

---

# 1. Product Summary

Build a mobile-first, full-screen web application that combines the mechanics of Bingo, Lotería, and a real-world visual scavenger hunt.

Instead of numbers, every playable card slot contains:

- An illustration
- A short title
- Optional short descriptor
- A rarity level
- An information/detail action
- A re-spin action while re-spins remain

The initial theme is **Dog Spotting**. Players walk through a real-world environment and mark items as they find them.

Example tiles include:

- Golden Retriever
- Labrador Retriever
- French Bulldog
- Husky
- Border Collie
- Great Dane
- Person walking two dogs
- Person walking three or more dogs
- Dog wearing clothing
- Dog riding in a stroller
- Dog carrying a toy

The core engine must be theme-agnostic so additional themes can be added without changing game logic.

Potential future themes include:

- Birds
- Wildlife
- Cars
- Plants
- City landmarks
- Travel
- Museums
- Festivals
- Educational topics
- Retail promotions
- Branded scavenger hunts
- Custom event themes

The product should feel like a polished casual mobile game, not a conventional database-driven website.

---

# 2. Product Goals

The application should:

1. Work extremely well on mobile phones.
2. Run in a modern browser without requiring installation.
3. Support optional PWA installation.
4. Use a full-screen, touch-first interface.
5. Be usable by children and families.
6. Use large, obvious, thumb-friendly controls.
7. Make every card visually interesting.
8. Allow cards to differ while remaining approximately equal in difficulty.
9. Persist single-player progress if the browser closes or reloads.
10. Support multiplayer in Phase 2 without rewriting the game model.
11. Allow new themes to be created from database content.
12. Support AI-assisted creation of illustration assets.
13. Keep initial hosting and operating costs very low.
14. Allow the local image-generation system to be replaced by cloud APIs without changing the admin UI.

---

# 3. Core Design Principles

## 3.1 Theme-Agnostic Game Engine

Do not hardcode dog-specific logic into the game engine.

The engine should understand:

- Theme
- Tile
- Tile category
- Rarity
- Card
- Slot
- Game
- Player
- Completion state
- Re-spin state
- Win condition

"Dog breed" is theme content, not a game-system concept.

---

## 3.2 Mobile First

The primary viewport is portrait mobile.

The card should occupy most of the display.

Avoid:

- Tiny text
- Desktop-style menus
- Hover-only interactions
- Dense toolbars
- Nested navigation
- Accidental browser zoom interactions

Use:

- CSS safe-area insets
- Touch-friendly hit areas
- Responsive type
- PWA manifest
- Fast cached image assets
- Reduced-motion support

---

## 3.3 Easy to Understand, Difficult Enough to Be Interesting

Players should understand the basic interaction immediately:

1. See something in the real world.
2. Tap its card slot.
3. The slot becomes marked as found.
4. Complete the required pattern or card.

Rarity and re-spins add strategy without turning the game into a rules-heavy experience.

---

# 4. Development Phases

## Phase 1 — Single Player

Build the complete core game loop without user accounts or real-time networking.

Required capabilities:

- Theme selection
- Configurable card generation
- Unique tiles
- Three rarity levels
- Rarity-balanced cards
- Found/not-found interaction
- Three re-spins per game
- Re-spin animation
- Tile information/details view
- Local persistence
- Bingo and full-card modes
- Game-complete screen
- PWA/offline caching where practical

Phase 1 should be production quality, not a disposable prototype.

---

## Phase 2 — Multiplayer

Add:

- Create game
- Join code
- QR joining
- Lobby
- Host controls
- Server-generated cards
- Server-authoritative card state
- Real-time player progress
- Server-authoritative re-spins
- Winner validation
- Reconnection support
- Results/rankings
- Foundations for team play

---

# 5. Game Modes

## 5.1 Standard Bingo

Default card:

- 5 x 5
- Optional FREE center
- 24 playable slots when center is free

Supported win conditions should be configurable:

- Horizontal row
- Vertical column
- Diagonal
- Any one line
- Multiple lines
- Four corners
- Entire card

Implement win conditions as data/rules rather than hardcoded UI logic.

---

## 5.2 Full Card / Lotería Mode

The player must mark every playable slot.

This is likely to be a strong default for real-world scavenger-hunt play.

The system should call this internally something like:

`full_card`

The presentation can use a friendlier theme-specific label.

---

## 5.3 Future Modes

Architecture should allow future modes such as:

- Timed score attack
- First to N finds
- Team shared card
- Competitive teams
- Cooperative card
- Point-based rarity scoring
- Daily challenge

Do not implement these until needed.

---

# 6. Dog Theme Content

The dog theme should combine breed tiles with observation tiles.

## 6.1 Breed Tiles

Prefer breeds that are:

- Visually recognizable
- Common enough to realistically encounter
- Distinct enough for non-experts to identify
- Appropriate for the target region

Examples:

- Golden Retriever
- Labrador Retriever
- French Bulldog
- Poodle
- Beagle
- Chihuahua
- Siberian Husky
- Dachshund
- Border Collie
- Boxer
- Great Dane
- German Shepherd
- Pug
- Corgi
- Shih Tzu
- Australian Shepherd

Avoid filling the database with obscure breeds simply to increase content count.

---

## 6.2 Mixed Breed / Type Tiles

Use mixed-breed tiles only when the concept is realistically identifiable.

Examples might include:

- Doodle-type dog
- Terrier mix
- Shepherd mix

Do not expect players to identify subtle genetic mixtures from appearance alone.

---

## 6.3 Observation Tiles

Examples:

- Person walking two dogs
- Person walking three or more dogs
- Dog wearing clothing
- Dog wearing boots
- Dog wearing a raincoat
- Dog wearing a bandana
- Dog riding in a stroller
- Dog riding in a backpack
- Dog carrying a toy
- Dog playing fetch
- Two dogs playing
- Puppy
- Very large dog
- Very small dog
- Dog swimming
- Dog in a vehicle

Observation tiles participate in the same rarity and card-balancing system.

---

# 7. Tile Categories

Suggested initial categories:

- `breed`
- `mixed_breed`
- `behavior`
- `clothing`
- `owner_interaction`
- `environment`
- `special`

Categories allow the card generator to create visual and gameplay variety.

A theme can optionally specify category quotas or limits.

Example:

- No more than 75% breed tiles
- At least 3 observation tiles
- No more than 2 clothing tiles

These should be configurable rather than hardcoded.

---

# 8. Rarity System

Use exactly three rarity levels.

| Score | ID         | Player-facing meaning         |
| ----- | ---------- | ----------------------------- |
| 1     | `common`   | Easy to encounter             |
| 2     | `uncommon` | Takes some searching          |
| 3     | `rare`     | Lucky but realistic encounter |

Do not create an "ultra rare" or "legendary" tier.

The game should deliberately avoid tiles that are so rare that completion becomes frustrating or unrealistic.

"Rare" means less common, but still plausible during normal play.

---

# 9. Rarity Assignment

Each tile stores:

- `rarity_score`
- `rarity_category`

Example:

```json
{
  "id": "dog_great_dane",
  "name": "Great Dane",
  "category": "breed",
  "rarityScore": 2,
  "rarityCategory": "uncommon"
}
```

Rarity values should initially be editorially assigned.

Later, analytics can suggest changes based on:

- Find rate
- Re-spin rate
- Average time to find
- Completion rate
- Geographic differences
- Player feedback

Do not automatically change production rarity values from analytics. Use analytics to recommend edits for review.

---

# 10. Unique Tile Invariant

Every active slot on a player's card must always be unique.

This is a hard invariant.

It applies to:

- Initial generation
- Re-spins
- Restored games
- Multiplayer reconnects
- Server-side mutations
- Future game mechanics

The invariant is:

```text
active playable slot count == unique tile ID count
```

Example invalid card:

```text
Golden Retriever
Husky
Beagle
Golden Retriever
Great Dane
```

Example valid card:

```text
Golden Retriever
Husky
Beagle
Border Collie
Great Dane
```

Never permit a duplicate to satisfy rarity or category constraints. Uniqueness has higher priority.

---

# 11. Theme Pool Size

The theme should contain substantially more eligible tiles than one card.

For a standard 24-playable-slot card, target:

- **Minimum practical library:** ~45 tiles
- **Preferred initial library:** 50–75 tiles
- **Better long-term library:** 75+ tiles

The admin system should flag a theme if it cannot reliably satisfy:

- Unique tiles
- Rarity quotas
- Category quotas
- Re-spin replacements

---

# 12. Balanced Card Generation

## 12.1 Objective

Each player should receive a different randomized card while starting with approximately equivalent difficulty.

Difficulty is represented primarily by rarity.

---

## 12.2 Preferred Strategy: Rarity Quotas

Instead of merely generating random cards and comparing total scores, define an expected rarity mix for each card configuration.

For a 24-slot card, an initial default could be:

- 12 Common
- 8 Uncommon
- 4 Rare

Total rarity score:

```text
12 × 1 + 8 × 2 + 4 × 3 = 40
```

This gives every starting card exactly the same rarity score while still allowing the content to be randomized.

Treat these values as initial balancing defaults, not permanent design constants.

A theme/game configuration should be able to specify:

```json
{
  "slotCount": 24,
  "rarityQuota": {
    "common": 12,
    "uncommon": 8,
    "rare": 4
  }
}
```

This is preferred over unconstrained random generation because it makes multiplayer fairness deterministic and easy to test.

---

## 12.3 Approximate Mode

Allow an optional `rarityTolerance` mode for future themes where exact quotas are undesirable.

Example:

```json
{
  "targetRarityScore": 40,
  "rarityTolerance": 2
}
```

For the dog MVP, use explicit rarity quotas unless playtesting gives a reason not to.

---

# 13. Card Generation Algorithm

Recommended algorithm:

1. Load all active tiles for the selected theme.
2. Filter out tiles not allowed by game configuration.
3. Validate that each rarity pool contains enough eligible unique tiles.
4. Determine slot count.
5. Determine rarity quota.
6. Determine optional category constraints.
7. Shuffle candidate pools using a server/client cryptographically safe or sufficiently unbiased random source.
8. Select unique candidates for each rarity quota.
9. Apply category constraints.
10. If category constraints fail, retry selection using bounded attempts.
11. Shuffle the final selected tiles.
12. Assign them to card positions.
13. Insert FREE space if required.
14. Validate:
    - Correct number of slots
    - No duplicate tile IDs
    - Correct rarity distribution
    - Category constraints satisfied
15. Persist the card.
16. Render to player.

Do not use an unbounded retry loop.

If constraints cannot be satisfied, return a specific content/configuration error so the theme can be corrected.

---

# 14. Marking Tiles as Found

Primary interaction:

- Tap tile = toggle found state

Found state should be visually unmistakable.

Potential visual treatment:

- Illustrated stamp/checkmark
- Color wash
- Slight desaturation under overlay
- Scale/pop animation
- Subtle sound
- Optional haptic feedback where browser/device supports it

Tapping again should unmark the tile unless the game configuration locks found tiles.

For MVP, allow undo.

---

# 15. Tile Information / Identification

A player may need help deciding whether the dog they see matches a tile.

Do not rely only on double-tap.

Recommended interactions:

- Small `i` info button
- Long press
- Optional double tap as a shortcut

Detail view should include:

- Name
- Large illustration
- 2–4 additional reference images
- Very short description
- Key identification clues
- Typical size
- Coat/color notes
- Distinguishing features

The purpose is:

> "Does the dog I am looking at match this tile?"

It is not intended to be a complete breed encyclopedia.

---

# 16. Re-Spin System

Each player receives exactly **3 re-spins per game** by default.

Store this as configuration so future games can change it.

---

## 16.1 Re-Spin Control

Every eligible unfinished tile shows a small re-spin control in a lower corner.

Recommended icon:

- Circular arrows
- Shuffle symbol
- Small slot-machine-inspired graphic

Requirements:

- Large enough for touch
- Clearly separate from the main tile tap
- Does not obscure the tile subject
- Accessible label: `Re-spin this tile`
- Stop propagation so pressing it does not mark the tile found

---

## 16.2 Re-Spin Eligibility

Default rule:

- Only unfinished tiles may be re-spun.

A re-spin may not:

- Produce the same tile
- Produce a tile already elsewhere on the player's card
- Produce a disabled tile
- Produce a tile outside the current theme
- Violate required content restrictions

Found tiles should not expose a re-spin button.

---

## 16.3 Re-Spin Rarity Probability

A re-spin first chooses a rarity category.

Each category has an equal chance:

- Common: 1/3
- Uncommon: 1/3
- Rare: 1/3

Important:

Do **not** randomly choose from all remaining tiles and infer rarity afterward.

The selection order is:

1. Choose rarity category uniformly.
2. Build eligible unique tile pool for that rarity.
3. Randomly choose a tile from that pool.

This preserves equal rarity probabilities even if the database contains different numbers of Common, Uncommon, and Rare tiles.

---

## 16.4 Empty Rarity Pool Edge Case

If the selected rarity category has no valid unique replacement:

1. Remove that rarity category from the available set for this re-spin.
2. Randomly choose among remaining rarity categories.
3. Select an eligible tile.
4. Never introduce a duplicate merely to preserve the theoretical one-third probability.

Log this condition for analytics/content diagnostics.

A well-sized theme library should make this rare.

---

## 16.5 Re-Spin Animation

The re-spin should feel like a miniature slot machine.

Flow:

1. User presses re-spin.
2. UI locks that slot temporarily.
3. Final result is determined by game logic/server.
4. Slot rapidly cycles through several tile illustrations/titles.
5. Cycling slows progressively.
6. It lands on the predetermined replacement.
7. Small settle/bounce animation.
8. Remaining re-spin count updates.

The intermediate images are presentation only.

The animation must never determine game state.

Suggested duration:

- Approximately 1.2–2.0 seconds
- Respect `prefers-reduced-motion`

Preload a small set of candidate thumbnails so the animation does not flicker while downloading images.

---

## 16.6 Re-Spin Counter

Initial:

```text
Re-spins: 3
```

After use:

```text
Re-spins: 2
Re-spins: 1
```

After the final re-spin:

```text
Re-spins: 0
```

When zero is reached:

- Remove every re-spin button from the card.
- Do not leave disabled buttons cluttering the UI.
- The optional global counter may also disappear or remain as a subtle `0`.

---

## 16.7 Re-Spins and Difficulty

Initial cards are balanced.

Re-spins are intentionally allowed to make a player's card easier or harder.

Example:

```text
Rare → Common
```

The player benefited.

Example:

```text
Common → Rare
```

The player made the card harder.

Do not rebalance the card after a re-spin.

This risk/reward mechanic is intentional.

---

# 17. Game Completion

When the active win condition is satisfied:

- Freeze or finalize game state as appropriate
- Show a prominent completion animation
- Show game result
- Show relevant stats
- Offer:
  - Play again
  - New card
  - Return to themes

Possible messaging:

- BINGO!
- CARD COMPLETE!
- YOU FOUND THEM ALL!

Multiplayer winners must be validated by the server.

---

# 18. Multiplayer User Flow

## 18.1 Create Game

Host chooses:

- Theme
- Game mode
- Card size
- Win condition
- Optional timer
- Optional public/private settings

Server creates a game and join code.

Example:

```text
DOG42
```

Prefer 5–6 human-readable characters and exclude confusing characters such as:

- 0/O
- 1/I/L

---

## 18.2 Join Game

Players can join by:

- Entering code
- Opening join URL
- Scanning QR code

Example route:

```text
/join/DOG42
```

Require only a nickname for casual play.

Accounts should not be required for MVP multiplayer.

---

## 18.3 Lobby

Show:

- Theme
- Game mode
- Host
- Player list
- Player count
- Ready state if used
- Start button for host

---

## 18.4 Multiplayer Cards

The server generates each player's card.

Each card:

- Uses the same theme
- Uses the same game rules
- Uses the same rarity quota
- Contains unique tiles within that individual card
- May share tiles with other players' cards

Uniqueness is per card, not globally across the whole multiplayer session.

---

# 19. Multiplayer State Authority

The server is authoritative for:

- Game state
- Player card
- Found state
- Re-spin count
- Re-spin result
- Win validation
- Start/end timestamps
- Team assignment
- Score

The browser may optimistically animate or display changes, but it does not own authoritative state.

---

# 20. Multiplayer Re-Spin Transaction

Client sends:

```json
{
  "gameId": "game-id",
  "slotId": "slot-id"
}
```

Server:

1. Authenticates/identifies player session.
2. Confirms game is active.
3. Confirms slot belongs to player.
4. Confirms slot is unfinished.
5. Confirms player has a re-spin remaining.
6. Selects rarity category uniformly.
7. Builds eligible unique replacement pool.
8. Handles empty-pool fallback.
9. Selects replacement.
10. Atomically updates slot.
11. Atomically decrements remaining re-spins.
12. Stores re-spin history.
13. Returns final result.
14. Publishes/broadcasts updated state.

The client plays the animation ending on the server-selected tile.

Use an idempotency key so duplicate mobile requests cannot consume multiple re-spins.

---

# 21. Team Play — Future Architecture

Support later without implementing in the initial multiplayer release.

Potential modes:

## Shared Team Card

All players on a team contribute to one card.

## Individual Cards + Team Score

Each player keeps their own card but findings contribute points.

## Team Race

First team to complete a required objective wins.

Include nullable `team_id` fields now where doing so is low cost.

Do not build complex team UX until required.

---

# 22. Recommended Technology Stack

## Frontend

**Recommended:**

- Next.js
- React
- TypeScript
- Tailwind CSS
- PWA/service worker layer
- Framer Motion or CSS/Web Animations for focused UI animation

Reasons:

- Excellent Claude Code support
- Easy routing
- Strong mobile web ecosystem
- Same codebase for frontend and server routes
- Straightforward deployment
- Good TypeScript tooling

Do not overuse animation libraries for simple effects.

---

## Backend / Database

**Recommended: Supabase**

Use:

- PostgreSQL
- Supabase Auth only if/when accounts are needed
- Supabase Realtime
- Supabase Storage
- Row Level Security
- Edge Functions or trusted Next.js API/server routes for authoritative mutations

Reasons:

- Relational data is a strong fit for themes, tiles, games, players, and cards
- SQL constraints are useful for validation
- Realtime support
- Easy object storage
- Low initial operating cost
- Portable data model
- Better content/admin queries than a deeply nested document database

---

## Hosting

Recommended initial setup:

- Vercel: Next.js application
- Supabase: database/realtime/storage
- Local workstation/server: AI generation worker + ComfyUI

Alternative:

- Cloudflare frontend/server architecture is possible later, but not necessary for MVP.

Prefer the simplest deployable stack.

---

# 23. Suggested Database Schema

Names are illustrative.

## `themes`

```text
id UUID PK
slug TEXT UNIQUE
name TEXT
description TEXT
cover_image_url TEXT
status ENUM(draft,published,archived)
default_game_mode TEXT
default_card_size INT
recommended_age TEXT
created_at
updated_at
```

---

## `theme_config`

```text
theme_id UUID PK/FK
free_center BOOLEAN
default_respins INT DEFAULT 3
rarity_common_count INT
rarity_uncommon_count INT
rarity_rare_count INT
target_rarity_score INT NULL
rarity_tolerance INT NULL
category_rules JSONB
game_rules JSONB
```

---

## `tiles`

```text
id UUID PK
theme_id UUID FK
slug TEXT
name TEXT
short_name TEXT
category TEXT
rarity_score SMALLINT CHECK 1..3
rarity_category TEXT CHECK common|uncommon|rare
description TEXT
identification_tips TEXT
size_notes TEXT
coat_notes TEXT
primary_image_id UUID NULL
active BOOLEAN
sort_order INT
metadata JSONB
created_at
updated_at
UNIQUE(theme_id, slug)
```

---

## `tile_images`

```text
id UUID PK
tile_id UUID FK
image_type TEXT
storage_url TEXT
thumbnail_url TEXT
alt_text TEXT
source_type TEXT
generation_job_id UUID NULL
approved BOOLEAN
display_order INT
metadata JSONB
created_at
```

Possible `image_type`:

- `primary`
- `reference`
- `alternate`
- `cover`

---

## `games`

```text
id UUID PK
theme_id UUID FK
join_code TEXT UNIQUE NULL
game_type TEXT
game_mode TEXT
status TEXT
host_player_id UUID NULL
card_size INT
win_condition JSONB
config JSONB
started_at
ended_at
created_at
```

---

## `players`

```text
id UUID PK
game_id UUID FK
nickname TEXT
session_token_hash TEXT
team_id UUID NULL
respins_remaining INT
joined_at
last_seen_at
status TEXT
```

---

## `cards`

```text
id UUID PK
game_id UUID FK
player_id UUID FK
rarity_score INT
generation_metadata JSONB
created_at
UNIQUE(game_id, player_id)
```

---

## `card_slots`

```text
id UUID PK
card_id UUID FK
position INT
tile_id UUID FK NULL
is_free BOOLEAN
is_found BOOLEAN
found_at TIMESTAMPTZ NULL
version INT
UNIQUE(card_id, position)
UNIQUE(card_id, tile_id)
```

Important:

The `UNIQUE(card_id, tile_id)` constraint provides database-level duplicate protection.

Handle NULL/free-space behavior appropriately.

---

## `respin_events`

```text
id UUID PK
game_id UUID FK
player_id UUID FK
card_id UUID FK
slot_id UUID FK
old_tile_id UUID FK
new_tile_id UUID FK
old_rarity SMALLINT
new_rarity SMALLINT
idempotency_key TEXT UNIQUE
created_at
```

---

# 24. Local Single-Player Persistence

For Phase 1:

- Persist game identity and state locally.
- Use IndexedDB for robust structured persistence.
- `localStorage` can be used only for small preferences or a pointer to current game.
- Cache theme metadata and card thumbnails.

Suggested local data:

- Current theme
- Generated card
- Found states
- Re-spins remaining
- Re-spin history
- Game start time
- App preferences

When multiplayer arrives, the server becomes authoritative.

---

# 25. PWA / Offline Strategy

Goal:

Once a player has loaded a theme, a single-player game should remain usable with poor connectivity.

Cache:

- App shell
- Current theme metadata
- Card images/thumbnails
- Detail text
- Current game state

Do not require every high-resolution reference image in an entire theme to be cached before play.

Use layered caching:

1. App shell
2. Card thumbnails
3. Current-card detail assets
4. Additional content on demand

Show a clear offline indicator when appropriate.

Multiplayer requires network connectivity.

---

# 26. Image Asset Requirements

Primary card images should be:

- Square
- Strong centered composition
- Simple background
- Clear silhouette
- Recognizable at small size
- Consistent illustration style
- No embedded text
- No border baked into the source image

Generate/store a high-quality master image, then derive optimized web variants.

Suggested master:

- 1024 x 1024 or larger

Suggested derived sizes:

- 256 x 256 thumbnail
- 384 x 384 high-DPI card image
- 768+ detail image

Use WebP or AVIF for web delivery, with fallback only if needed.

---

# 27. AI Image Generation Architecture

## 27.1 Principle

AI image generation is an **admin/content production tool**, not part of the normal player game loop.

Players should never wait for image generation while playing.

Images are generated, reviewed, approved, optimized, and published before a theme goes live.

---

# 28. Primary Recommendation: Local ComfyUI Service

Use **ComfyUI** as the primary generation engine.

ComfyUI provides:

- Local GPU inference
- Workflow graphs
- Saved workflow JSON
- HTTP API
- WebSocket progress updates
- Model swapping
- Image-to-image
- Reference workflows
- Custom nodes
- Easy experimentation without rewriting application code

The application should treat ComfyUI as a provider behind an abstraction layer.

Do not couple application logic directly to a specific ComfyUI node graph.

---

# 29. Recommended Local Model: FLUX.2 [klein] 4B

Primary recommendation as of August 2026:

**Black Forest Labs FLUX.2 [klein] 4B**

Reasons:

- Open weights
- Apache 2.0 license
- Commercially usable under that license
- Approximately 13 GB VRAM according to the model publisher
- Suitable for 16 GB-class NVIDIA GPUs
- Text-to-image
- Image editing
- Multi-reference editing
- Supported in ComfyUI
- Supported in Diffusers
- Compact enough for a practical local production pipeline

Use the 4B model, not the 9B version, as the default local target unless testing shows a compelling quality reason to change.

Official model card:
https://huggingface.co/black-forest-labs/FLUX.2-klein-4B

---

# 30. Local Alternative: Stable Diffusion 3.5

Secondary local option:

- Stable Diffusion 3.5 Medium
- Stable Diffusion 3.5 Large/Turbo where hardware permits

Benefits:

- Mature ecosystem
- ComfyUI support
- ControlNet ecosystem
- Strong commercial terms for small businesses under the Stability AI Community License

As of August 2026, Stability states its Community License is free for commercial use by organizations below USD $1M in annual revenue, with Enterprise licensing required above that threshold.

Always re-check licensing before commercial launch.

Official licensing:
https://stability.ai/license

---

# 31. Cloud API Fallbacks

Implement the provider layer so a generation job can use any of the following.

## 31.1 Black Forest Labs API

Good for:

- High-quality production fallback
- Testing FLUX models without local configuration
- Burst generation
- Reference-image workflows

Use when local hardware is unavailable or when a cloud model produces significantly better results.

BFL's hosted API provides commercial-use access according to its API terms/pricing.

---

## 31.2 Stability AI API

Good for:

- Stable Diffusion family
- Straightforward REST integration
- Image-to-image
- Hosted production fallback

Keep API keys server-side.

---

## 31.3 Replicate

Good for:

- Quickly evaluating many models
- Hosted inference
- Temporary production fallback
- Fine-tuning/training experiments

Replicate maintains "official models" with stable APIs and predictable per-output pricing.

It is useful as an experimentation layer but should not become an accidental hard dependency.

---

# 32. Image Provider Abstraction

Define an interface similar to:

```ts
interface ImageGenerationProvider {
  submit(job: GenerationRequest): Promise<GenerationJobRef>;
  getStatus(jobId: string): Promise<GenerationStatus>;
  getResult(jobId: string): Promise<GenerationResult>;
  cancel?(jobId: string): Promise<void>;
}
```

Implement providers:

```text
ComfyUIProvider
BFLProvider
StabilityProvider
ReplicateProvider
```

The admin UI should choose:

- Default provider
- Override provider per job
- Model
- Workflow/template
- Seed
- Reference assets

---

# 33. Do Not Expose the Home ComfyUI Server Publicly

Preferred production architecture:

```text
Admin Web App
    |
    v
Supabase generation_jobs table
    |
    v
Local Generation Worker
    |
    v
ComfyUI on localhost
    |
    v
Generated files
    |
    v
Supabase Storage
    |
    v
Admin review queue
```

This avoids opening the home ComfyUI port to the public internet.

---

# 34. Local Generation Worker

Create a small Node.js or Python service that runs on the machine hosting ComfyUI.

Responsibilities:

1. Authenticate to backend with a dedicated worker credential.
2. Poll or subscribe to pending generation jobs.
3. Claim a job atomically.
4. Convert generation parameters into a ComfyUI API-format workflow.
5. Submit to ComfyUI.
6. Listen/poll for completion.
7. Collect image outputs.
8. Create thumbnails/optimized versions if desired.
9. Upload outputs to Supabase Storage.
10. Update generation job status.
11. Record:
    - Model
    - Prompt
    - Negative prompt
    - Seed
    - Workflow version
    - Provider
    - Generation time
    - Output metadata
12. Handle retries and errors.

Run as a startup service so it can function as an internal render worker.

---

# 35. Image Generation Jobs Table

Suggested:

## `generation_jobs`

```text
id UUID PK
theme_id UUID NULL
tile_id UUID NULL
provider TEXT
model TEXT
workflow_version TEXT
prompt TEXT
negative_prompt TEXT
seed BIGINT NULL
reference_image_ids JSONB
parameters JSONB
status TEXT
claimed_by TEXT NULL
claimed_at TIMESTAMPTZ NULL
started_at TIMESTAMPTZ NULL
completed_at TIMESTAMPTZ NULL
error TEXT NULL
created_by UUID NULL
created_at
```

Statuses:

- `queued`
- `claimed`
- `generating`
- `completed`
- `failed`
- `cancelled`

---

# 36. Art Direction Prompt System

Do not independently hand-write every image prompt.

Create a prompt-template system.

## 36.1 Global Style Prompt

Example concept:

```text
Friendly modern children's picture-book illustration, charming hand-painted feel,
clean readable silhouette, warm natural colors, subtle paper texture,
simple uncluttered background, centered subject, full body visible,
recognizable anatomy, consistent proportions, square composition,
designed for a family visual scavenger-hunt card game, no text, no border.
```

This is a starting point. Tune through tests.

---

## 36.2 Breed-Specific Prompt Data

Each breed should have structured visual characteristics.

Example:

```json
{
  "breed": "French Bulldog",
  "visualTraits": [
    "small compact muscular body",
    "very short muzzle",
    "large upright bat ears",
    "short smooth coat",
    "recognizable French Bulldog proportions"
  ]
}
```

Prompt builder combines:

```text
GLOBAL_STYLE
+
SUBJECT_DESCRIPTION
+
IDENTIFICATION_TRAITS
+
COMPOSITION_RULES
+
NEGATIVE_RULES
```

---

# 37. Identification Accuracy Comes Before Style

For this game, a beautiful image that does not accurately depict the breed is a failed asset.

Every generated breed image must be reviewed for:

- Ear shape
- Head/muzzle shape
- Body proportions
- Coat type
- Typical coloring
- Tail
- Scale/proportion
- Overall recognizability

Do not automatically publish AI output.

---

# 38. Style Consistency Strategy

Use stages.

## Stage 1 — Prompt Consistency

For MVP:

- One master style prompt
- Fixed composition rules
- Consistent aspect ratio
- Consistent background treatment
- Curated seeds where useful

## Stage 2 — Reference Image Consistency

Create 3–5 approved "style anchor" images.

Use reference/multi-reference workflows so new generations imitate the approved visual language without forcing the same dog appearance.

FLUX.2 [klein] supports multi-reference editing, making this particularly useful.

## Stage 3 — Style LoRA

Only if required.

Train a style LoRA after enough approved images exist.

Do not make LoRA training a dependency for MVP.

A 16 GB generation machine may be excellent for inference but insufficient for comfortable FLUX.2 LoRA training at default settings. If training is required, rent a larger GPU temporarily or use a hosted trainer.

---

# 39. Image Admin Workflow

For each tile:

1. Create tile metadata.
2. Assign category.
3. Assign rarity.
4. Enter identification traits.
5. Click `Generate Images`.
6. Generate 4 candidates.
7. Review candidates.
8. Approve best candidate or regenerate.
9. Optionally create alternate/reference images.
10. Crop/optimize automatically.
11. Preview at actual card size.
12. Publish tile only when approved.

Useful admin actions:

- Generate 1
- Generate 4
- Regenerate selected
- Use selected as primary
- Generate alternate view
- Generate from style reference
- Compare candidates
- Reject
- Approve
- Publish

---

# 40. Reference Images for Identification Pages

The primary card illustration may be AI-generated.

For the detail page, consider a mix of:

- Additional approved AI-generated views
- Properly licensed real reference photographs

Real reference photos can improve identification reliability.

If external photographs are used, record:

- Source
- License
- Attribution requirement
- Original URL
- Creator
- Date retrieved

Do not scrape random web images into production.

---

# 41. Image QA Checklist

A tile cannot be published until:

- Subject is identifiable
- Correct breed/type
- No extra limbs
- No malformed anatomy
- No unwanted text
- No watermark
- Clean background
- Subject is not cropped awkwardly
- Works at thumbnail size
- Style matches theme
- Metadata complete
- Rarity assigned
- Detail text complete

---

# 42. Admin Interface

Future-facing admin pages:

## Themes

- Create/edit theme
- Cover art
- Publish/unpublish
- Game defaults
- Rarity quotas
- Category rules

## Tiles

- Search/filter
- Category
- Rarity
- Active status
- Missing image warning
- Missing detail warning

## Tile Editor

- Metadata
- Identification traits
- Rarity
- Generated images
- Approved primary
- Reference images
- Preview

## Generation Queue

- Queued
- Running
- Completed
- Failed
- Provider
- Model
- Retry

## Card Simulator

Generate test cards and display:

- Tile uniqueness
- Category distribution
- Rarity distribution
- Total score

This will be extremely useful during balancing.

---

# 43. Suggested API Surface

Names can change.

## Public / Player

```text
GET  /api/themes
GET  /api/themes/:slug
POST /api/single-player/games
POST /api/single-player/games/:id/restore
```

For Phase 1, some game logic can remain client-side as long as the domain logic is shared/testable.

---

## Multiplayer

```text
POST /api/games
POST /api/games/join
POST /api/games/:gameId/start
GET  /api/games/:gameId/state
POST /api/games/:gameId/slots/:slotId/toggle
POST /api/games/:gameId/slots/:slotId/respin
POST /api/games/:gameId/leave
```

---

## Admin

```text
POST /api/admin/themes
PATCH /api/admin/themes/:id
POST /api/admin/tiles
PATCH /api/admin/tiles/:id
POST /api/admin/generation-jobs
POST /api/admin/generation-jobs/:id/retry
POST /api/admin/images/:id/approve
POST /api/admin/themes/:id/publish
```

---

# 44. Domain Logic Organization

Keep game logic separate from UI.

Suggested structure:

```text
/src
  /app
  /components
  /features
    /game
    /themes
    /multiplayer
    /admin
    /image-generation
  /domain
    card-generation.ts
    rarity.ts
    respin.ts
    win-conditions.ts
    validation.ts
    types.ts
  /services
    supabase
    image-providers
  /workers
```

Pure domain functions should be heavily unit tested.

---

# 45. Realtime Multiplayer Strategy

Recommended:

- Supabase Realtime subscriptions for state updates
- Server/Edge Function/API routes for mutations
- Database transactions for authoritative state changes

For small casual games, this is sufficient and far simpler than operating custom socket infrastructure.

Events to synchronize:

- Player joined
- Player left
- Game started
- Tile found/unfound
- Re-spin result
- Re-spin count
- Progress
- Winner
- Game ended

Avoid broadcasting the entire card state on every event if a small delta is sufficient.

---

# 46. Player Progress Display

Other players can see progress without necessarily seeing exact tile contents.

Example:

```text
Mike    14 / 24
Sky     11 / 24
Jean    17 / 24
```

Potential future privacy/game setting:

- Progress visible
- Progress hidden
- Exact cards visible after game
- Team-only progress

---

# 47. Security

For multiplayer:

- Never trust client-provided tile IDs for replacement outcomes.
- Validate that player owns the slot.
- Validate game is active.
- Use server-authoritative re-spin count.
- Use database transaction/locking for re-spins.
- Use idempotency keys.
- Rate-limit join and mutation endpoints.
- Sanitize nicknames.
- Use RLS where applicable.
- Never expose Supabase service role key to browser.
- Never expose cloud AI API keys to browser.
- Do not expose local ComfyUI directly.

For admin:

- Require authenticated admin role.
- Separate worker credentials from admin credentials.
- Limit storage upload paths by role.

---

# 48. Accessibility

Include:

- Sufficient contrast
- Alt text
- Accessible buttons
- Screen-reader labels
- No information communicated by color alone
- Reduced motion mode
- Large touch targets
- Keyboard support where practical
- Avoid extremely small tile labels

Consider a setting to open a larger card-tile view for users with reduced vision.

---

# 49. Analytics

Useful events:

## Game

- Game started
- Game completed
- Abandoned
- Completion time
- Mode
- Theme

## Tiles

- Tile marked found
- Tile unmarked
- Detail viewed
- Tile re-spun

## Re-Spins

Record:

- Original tile
- Original rarity
- Result tile
- Result rarity
- Re-spin number 1/2/3
- Whether result made rarity easier/same/harder

## Balancing

Track:

- Find rate by tile
- Detail-view rate
- Re-spin rate
- Completion rate
- Average time to find
- Rare-tile completion rates
- Themes with unusually high abandonment

Use analytics for editorial balancing.

---

# 50. Automated Game-Balance Simulation

Create a development script that can generate large numbers of cards.

Example:

```bash
npm run simulate:cards -- --theme dog --count 100000
```

Report:

- Duplicate violations
- Average rarity score
- Min/max rarity
- Rarity quota compliance
- Category distribution
- Tile appearance frequency
- Any tiles never selected

Re-spin simulation should test at least:

- 100,000 re-spins
- Approximate 33.33/33.33/33.33 rarity outcome distribution when all pools are available
- No duplicate tile introduction
- Empty-pool fallback
- Three-use limit

---

# 51. Testing Strategy

## Unit Tests

Required for:

- Rarity quota calculation
- Card generation
- Unique tile invariant
- Re-spin candidate filtering
- Re-spin rarity distribution
- Re-spin limits
- Win conditions
- Serialization/restoration

## Integration Tests

Required for:

- Database card creation
- Multiplayer join
- Re-spin transaction
- Duplicate request/idempotency
- Winner validation
- Reconnect

## E2E

Use Playwright.

Test:

- iPhone-size viewport
- Android-size viewport
- Desktop fallback
- Create game
- Mark tile
- Inspect tile
- Re-spin
- Exhaust re-spins
- Restore game
- Multiplayer join
- Multiplayer progress

---

# 52. Performance Targets

Initial targets:

- App interactive quickly on normal mobile data
- Card interactions at 60fps where device/browser permits
- No full-size source images loaded for all 25 card cells
- Optimized thumbnails
- Lazy-load detail/reference images
- Preload current card assets
- Avoid expensive React rerenders for the whole grid on every slot action

Use browser performance profiling before optimizing prematurely.

---

# 53. Recommended MVP UX Flow

```text
Home
  ↓
Choose Theme
  ↓
Dog Spotting
  ↓
Game Options
  - Bingo
  - Full Card
  ↓
Generate Card
  ↓
Play
  ├── Tap tile → Found
  ├── Info → Identification
  └── Re-spin → Replace tile
  ↓
Win condition
  ↓
Celebration / Results
  ↓
Play Again
```

No account required.

---

# 54. Visual Design Direction

Style:

- Children's picture-book illustration
- Friendly
- Warm
- Colorful
- Slightly whimsical
- Clean silhouettes
- Consistent rendering
- Recognizable real-world features

Avoid:

- Photorealistic primary card art
- Generic stock-image feel
- Busy backgrounds
- Excessive gradients/UI gloss
- Tiny labels
- Overly childish baby imagery
- Visual effects that obscure identification

The game should work for children but still feel attractive to adults.

---

# 55. Implementation Backlog

The backlog has moved to its own file so it can be updated every session without churning this document:

**→ [`docs/BACKLOG.md`](./BACKLOG.md)**

Conventions (P0/P1/P2, milestones 0–11, acceptance intent) are preserved there. Session-by-session progress is recorded in [`docs/devlog/`](./devlog/).

---

# 56. Claude Code Implementation Instructions

Claude Code should:

1. Read this entire document before modifying code.
2. Build milestones in order unless a dependency requires otherwise.
3. Preserve domain logic independently from UI.
4. Add automated tests with each game-system feature.
5. Never weaken the unique-tile invariant.
6. Never change the three-level rarity system without an explicit design decision.
7. Keep re-spin outcome logic separate from its animation.
8. Keep multiplayer mutations server-authoritative.
9. Keep AI provider integrations behind an interface.
10. Never expose AI provider secrets or Supabase service credentials to the browser.
11. Keep local ComfyUI inaccessible from the public application.
12. Prefer straightforward solutions over unnecessary abstractions.
13. Maintain `README.md` setup instructions.
14. Maintain `.env.example`.
15. Add database migrations to source control.
16. Add a running implementation checklist/backlog and mark completed items.
17. Stop and document any requirement conflict rather than silently changing game rules.

---

# 57. Recommended First Build Sequence

The fastest useful sequence is:

1. Build hardcoded mobile card.
2. Perfect touch UX.
3. Implement domain model.
4. Implement rarity-balanced unique card generator.
5. Implement re-spins.
6. Implement details view.
7. Add persistence.
8. Add dog theme data.
9. Add local ComfyUI image pipeline.
10. Generate/approve dog artwork.
11. Ship production single-player.
12. Add Supabase production content backend.
13. Add multiplayer.
14. Add teams.
15. Expand theme authoring.

This ensures a playable product exists early while keeping the architecture aligned with the long-term version.

---

# 58. Local AI Recommendation Summary

**Best starting option:**

```text
ComfyUI
+
FLUX.2 [klein] 4B
+
local generation worker
+
Supabase generation job queue/storage
```

Why:

- Local-first
- No per-image inference cost
- Approximately 13 GB VRAM target
- Apache 2.0 model license
- Commercially practical
- Good API/workflow automation
- Multi-reference support for style consistency
- Cloud provider can be substituted later

**Fallbacks:**

1. BFL hosted API
2. Stability AI API / local SD3.5
3. Replicate

Do not make a cloud provider mandatory for the MVP.

---

# 59. Licensing Note

Model licenses and hosted API terms can change.

Before commercial release, re-check the exact license for the checkpoint and provider actually deployed.

As researched on August 30, 2026:

- FLUX.2 [klein] 4B is published under Apache 2.0.
- BFL states the model can run on consumer hardware at roughly 13 GB VRAM.
- Stability AI's Community License allows commercial use of covered Core Models for organizations below its stated USD $1M annual-revenue threshold.
- Hosted APIs have their own terms and pricing.

Do not assume that one FLUX model's license applies to another FLUX model.

In particular, older/current `[dev]` variants may have different commercial licensing from the Apache-licensed FLUX.2 [klein] 4B.

---

# 60. Reference Links

ComfyUI developer overview:  
https://docs.comfy.org/development/overview

ComfyUI local server routes/API:  
https://docs.comfy.org/development/comfyui-server/comms_routes

FLUX.2 [klein] 4B model card:  
https://huggingface.co/black-forest-labs/FLUX.2-klein-4B

Black Forest Labs pricing/licensing:  
https://bfl.ai/pricing

Stability AI licensing:  
https://stability.ai/license

Stability AI API:  
https://platform.stability.ai/docs/api-reference

Replicate official models/API:  
https://replicate.com/docs/topics/models/official-models

---

# 61. Definition of MVP Complete

The single-player MVP is complete when:

- A mobile user can open the site.
- Choose Dog Spotting.
- Receive a randomized 5x5 card.
- Every playable slot is unique.
- Starting card rarity is balanced.
- Common/Uncommon/Rare are the only rarity levels.
- No intentionally impossible/extremely rare tiles are used.
- The user can mark/unmark a find.
- The user can inspect identification information.
- The user can re-spin up to three unfinished slots.
- Each re-spin has equal rarity-category probability.
- A re-spin never introduces a duplicate.
- Re-spin animation settles on the predetermined result.
- All re-spin controls disappear after the third use.
- Progress survives a browser refresh.
- Bingo/full-card completion works.
- Artwork is consistent and approved.
- The experience is polished on a modern iPhone and Android phone.
- The app can later move into multiplayer without replacing the core domain model.

---

# 62. Implementation Notes (living)

Decisions made during implementation that refine or clarify the design above. Newest first.

## 2026-08-30 — Session 2

- **Portrait tiles / full-screen card:** the play screen is now a fixed-height (`h-dvh`) flex column; the 5×5 grid stretches to fill all remaining space with `1fr` rows, so slots are naturally portrait on phones and the card fills the display (user request). Tile art is 3:4.
- **Interim art pipeline (departure from §28):** rather than standing up ComfyUI first, all 68 tile illustrations were generated with Gemini (`gemini-3.1-flash-image`) through an MCP image tool, using the §36.1 global style prompt plus each tile's identification traits. Style consistency was achieved via prompt consistency (Stage 1 of §38). Masters (~3:4 JPEG, ≈0.5 MB each) are at `C:/git/nanobanana/pictures/`; `scripts/optimize-tiles.mjs` (sharp) derives 384×512 and 768×1024 WebP variants into `public/tiles/` (3.7 MB total). The ComfyUI/FLUX plan in §28–§34 stays the target for the admin generation queue and future themes.
- **Art wiring:** every tile now has `primaryImage` (approved). `TileArt` renders it with the emoji placeholder as an automatic fallback, so a missing/broken image can never blank a slot.
- **QA:** sampled per §41; one image had a baked-in painted frame and was inset-cropped. A full 68-tile QA pass is a new backlog item.

## 2026-08-30 — Session 1

- **Stack as built:** Next.js 16.3 (App Router, Turbopack), React 19, TypeScript strict, Tailwind 4, Vitest + Testing Library, Playwright (iPhone 14 / Pixel 7 / Desktop Chrome projects), zod for env validation. No Framer Motion — CSS keyframes cover current animation needs (§22 "do not overuse animation libraries").
- **Domain layer** lives in `src/domain/` exactly as §44 suggests; every function is pure and takes an injectable `RandomSource` so tests and the simulator are deterministic. Browser uses Web Crypto.
- **Static theme registry** (`src/themes/`) stands in for the database until Milestone 7. `getThemeBySlug()` / `listThemes()` are the seam to replace.
- **Placeholder graphics:** each tile stores `metadata.placeholder = { emoji, hue }`; `PlaceholderArt` renders it. Milestone 5 swaps this for `tile.primaryImage`.
- **Free center off:** the theme quota is tuned for 24 slots (§12.2). When a player disables the free center the extra slot is filled from the common pool (13/8/4 = 41 points). Recorded as P2 in the backlog for a proper per-size quota.
- **Completion freezes the game** (§17 "freeze or finalize"). Tapping tiles after completion is ignored. Re-spin buttons hide. Whether to allow un-marking after a win is an open backlog item.
- **Re-spin animation** is 1.37 s + 200 ms settle (within §16.5's 1.2–2.0 s). The domain result is committed to state _before_ the animation starts; the animation only cycles tiles not on the card and lands on the committed tile.
- **Persistence:** IndexedDB store `dog-bingo/games` keyed by game id; `localStorage` holds only the current game id pointer (§24). Restored state is re-validated for the unique-tile invariant and tile existence before use (§10 "applies to restored games").
- **No service worker yet.** PWA manifest and installability are in place; offline caching is a backlog item.
