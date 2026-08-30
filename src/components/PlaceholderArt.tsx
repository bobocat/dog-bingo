import type { Tile } from "@/domain/types";

/**
 * Placeholder tile artwork until Milestone 5 delivers approved illustrations.
 * Uses the emoji + hue stored in tile.metadata.placeholder. Swap this component
 * for an <img> of tile.primaryImage when art exists.
 */
export function placeholderOf(tile: Tile): { emoji: string; hue: number } {
  const p = (
    tile.metadata as
      { placeholder?: { emoji?: string; hue?: number } } | undefined
  )?.placeholder;
  return { emoji: p?.emoji ?? "🐾", hue: p?.hue ?? 30 };
}

export function PlaceholderArt({
  tile,
  size = "card",
}: {
  tile: Tile;
  size?: "card" | "detail" | "thumb";
}) {
  const { emoji, hue } = placeholderOf(tile);
  const fontSize =
    size === "detail"
      ? "clamp(96px, 30vw, 160px)"
      : size === "thumb"
        ? "20px"
        : "clamp(22px, 7vw, 40px)";
  return (
    <div
      aria-hidden
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 40%, hsl(${hue} 80% 90%), hsl(${hue} 55% 78%))`,
        fontSize,
        lineHeight: 1,
      }}
    >
      <span style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,.15))" }}>
        {emoji}
      </span>
    </div>
  );
}
