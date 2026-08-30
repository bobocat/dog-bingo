import { notFound } from "next/navigation";
import { PlayScreen } from "@/components/PlayScreen";
import { getThemeBySlug, listThemes } from "@/themes";

export function generateStaticParams() {
  return listThemes().map((t) => ({ slug: t.slug }));
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const theme = getThemeBySlug(slug);
  if (!theme || theme.status !== "published") notFound();
  return <PlayScreen theme={theme} />;
}
