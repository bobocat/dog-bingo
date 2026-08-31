"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getCurrentThemeSlug } from "@/features/game/storage";

function subscribeNoop() {
  return () => {};
}

/**
 * Shown on the home screen when a game is in progress, so reopening the
 * app (PWA start_url is "/") always offers a way back to the card.
 */
export function ContinueCard() {
  const slug = useSyncExternalStore(
    subscribeNoop,
    getCurrentThemeSlug,
    () => null,
  );
  if (!slug) return null;
  return (
    <Link
      href={`/play/${slug}`}
      data-testid="continue-game"
      className="bg-accent mb-4 flex min-h-[var(--touch-min)] items-center justify-between rounded-[var(--radius-card)] p-4 text-white shadow-[var(--shadow-pop)] active:scale-[0.98]"
    >
      <span>
        <span className="block text-xl font-black">Continue your game</span>
        <span className="block text-sm opacity-90">
          Your card is right where you left it.
        </span>
      </span>
      <span aria-hidden className="text-2xl font-black">
        →
      </span>
    </Link>
  );
}
