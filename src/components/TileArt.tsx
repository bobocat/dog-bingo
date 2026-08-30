"use client";

import { useState } from "react";
import type { Tile } from "@/domain/types";
import { PlaceholderArt } from "./PlaceholderArt";

/**
 * Tile artwork: approved primary image when available, emoji placeholder
 * otherwise (or if the image fails to load).
 */
export function TileArt({
  tile,
  size = "card",
}: {
  tile: Tile;
  size?: "card" | "detail" | "thumb";
}) {
  const [failed, setFailed] = useState(false);
  const img = tile.primaryImage;
  if (!img || !img.approved || failed)
    return <PlaceholderArt tile={tile} size={size} />;
  const src = size === "detail" ? img.url : (img.thumbnailUrl ?? img.url);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={img.altText}
      className="h-full w-full object-cover"
      loading={size === "detail" ? "lazy" : "eager"}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
