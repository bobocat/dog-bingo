import type { Theme } from "@/domain/types";
import { DOG_THEME } from "./dog";

/**
 * Static theme registry for Phase 1. Milestone 7 replaces this with
 * database-backed loading; keep the accessor shape stable.
 */
const THEMES: Theme[] = [DOG_THEME];

export function listThemes(): Theme[] {
  return THEMES.filter((t) => t.status === "published");
}

export function getThemeBySlug(slug: string): Theme | undefined {
  return THEMES.find((t) => t.slug === slug);
}

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}
