import Link from "next/link";
import { ContinueCard } from "@/components/ContinueCard";
import { InviteButton } from "@/components/InviteButton";
import { listThemes } from "@/themes";

export default function HomePage() {
  const themes = listThemes();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[calc(var(--safe-top)+32px)] pb-[calc(var(--safe-bottom)+24px)]">
      <p className="text-accent-strong text-sm font-black tracking-widest uppercase">
        Visual Bingo
      </p>
      <h1 className="pt-1 text-5xl font-black tracking-tight">
        Spot it. Tap it. Bingo.
      </h1>
      <p className="text-muted pt-3 text-lg">
        A real-world scavenger hunt on a bingo card. Pick a theme, deal a card,
        and go for a walk.
      </p>

      <div className="pt-10">
        <ContinueCard />
      </div>
      <h2 className="text-sm font-black tracking-wide uppercase">Themes</h2>
      <ul className="flex flex-col gap-3 pt-3">
        {themes.map((t) => (
          <li key={t.id}>
            <Link
              href={`/play/${t.slug}`}
              data-testid={`theme-${t.slug}`}
              className="bg-surface flex items-center gap-4 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-tile)] active:scale-[0.98]"
            >
              <span
                className="bg-accent flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl"
                aria-hidden
              >
                🐕
              </span>
              <span>
                <span className="block text-2xl font-black">{t.name}</span>
                <span className="text-muted block">{t.description}</span>
                <span className="text-muted block pt-1 text-xs font-bold">
                  {t.tiles.filter((x) => x.active).length} tiles ·{" "}
                  {t.recommendedAge}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <InviteButton />

      <div className="flex-1" />
      <p className="text-muted pt-10 text-center text-xs">
        Add to your home screen for the best experience.
      </p>
    </main>
  );
}
