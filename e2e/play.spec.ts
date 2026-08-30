import { expect, test, type Page } from "@playwright/test";

async function dealCard(page: Page, mode: "bingo" | "full_card" = "bingo") {
  await page.goto("/");
  await page.getByTestId("theme-dog").click();
  await page.getByTestId(`mode-${mode}`).click();
  await page.getByTestId("start-game").click();
  await expect(page.getByTestId("respins")).toHaveText("Re-spins: 3");
}

test("home page has no horizontal scroll and shows the dog theme", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("theme-dog")).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("deal a card: 16 unique playable tiles, no free space", async ({
  page,
}) => {
  await dealCard(page);
  await expect(page.getByLabel("Free space")).toHaveCount(0);
  const tiles = page.locator('[data-testid^="slot-"]');
  await expect(tiles).toHaveCount(16);
  const labels = await tiles.evaluateAll((els) =>
    els.map((e) => e.getAttribute("aria-label")),
  );
  expect(new Set(labels).size).toBe(16);
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("mark, unmark, and info do not interfere", async ({ page }) => {
  await dealCard(page);
  const slot = page.getByTestId("slot-0");
  await slot.click();
  await expect(slot).toHaveAttribute("data-found", "true");
  await expect(page.getByTestId("progress")).toHaveText("1 / 16");
  await slot.click();
  await expect(slot).toHaveAttribute("data-found", "false");

  await slot.getByRole("button", { name: /^About / }).click();
  await expect(page.getByTestId("tile-detail")).toBeVisible();
  await expect(slot).toHaveAttribute("data-found", "false");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByTestId("tile-detail")).toBeHidden();
});

test("re-spin replaces the tile, keeps uniqueness, and controls vanish at zero", async ({
  page,
}) => {
  await dealCard(page);
  const before = await page.getByTestId("slot-0").getAttribute("aria-label");
  await page.getByTestId("respin-0").click();
  await expect(page.getByTestId("respins")).toHaveText("Re-spins: 2");
  await expect(page.getByTestId("slot-0")).toHaveAttribute(
    "data-found",
    "false",
  );
  await expect
    .poll(() => page.getByTestId("slot-0").getAttribute("aria-label"))
    .not.toBe(before);

  await page.getByTestId("respin-1").click();
  await expect(page.getByTestId("respins")).toHaveText("Re-spins: 1");
  await page.getByTestId("respin-2").click();
  await expect(page.getByTestId("respins")).toHaveText("Re-spins: 0");
  await expect(
    page.getByRole("button", { name: "Re-spin this tile" }),
  ).toHaveCount(0);

  const labels = await page
    .locator('[data-testid^="slot-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  expect(new Set(labels).size).toBe(16);
});

test("progress survives a reload", async ({ page }) => {
  await dealCard(page);
  await page.getByTestId("slot-3").click();
  await page.getByTestId("respin-8").click();
  await expect(page.getByTestId("respins")).toHaveText("Re-spins: 2");
  const label8 = await page.getByTestId("slot-8").getAttribute("aria-label");
  const all = await page
    .locator('[data-testid^="slot-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));

  await page.reload();
  await expect(page.getByTestId("respins")).toHaveText("Re-spins: 2");
  await expect(page.getByTestId("slot-3")).toHaveAttribute(
    "data-found",
    "true",
  );
  await expect(page.getByTestId("slot-8")).toHaveAttribute(
    "aria-label",
    label8!,
  );
  const after = await page
    .locator('[data-testid^="slot-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  expect(after).toEqual(all);
});

test("bingo completes on a full row and can play again", async ({ page }) => {
  await dealCard(page, "bingo");
  for (const i of [0, 1, 2, 3]) await page.getByTestId(`slot-${i}`).click();
  await expect(page.getByTestId("completion")).toBeVisible();
  await expect(page.getByText("BINGO!")).toBeVisible();
  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.getByTestId("completion")).toBeHidden();
  await expect(page.getByTestId("progress")).toHaveText("0 / 16");
});
