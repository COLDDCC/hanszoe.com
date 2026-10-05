import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/merch/",
  "/merch/nendoroid-hange-1123/",
  "/merch/lookup-hange/",
  "/merch/cospa-tsumamare-final/",
  "/series/",
  "/series/nendoroid/",
  "/series/lookup/",
  "/series/tsumamare-final/",
  "/news/",
  "/news/nendoroid-2026-reissue/",
  "/news/cospa-tsumamare-2024/",
  "/wiki/",
  "/wiki/names-and-search/",
  "/wiki/appearance-index/",
  "/about/",
];
test("所有路由有标题且没有横向溢出", async ({ page }, testInfo) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (route === "/")
      await page.screenshot({
        path: testInfo.outputPath("home.png"),
        fullPage: true,
      });
  }
});
test("搜索、筛选、刷新、返回与清空恢复 URL", async ({ page }) => {
  await page.goto("/merch/?q=1123");
  await expect(page.locator("#result-count")).toHaveText("1");
  await expect(page.locator("#q")).toHaveValue("1123");
  await page.locator("#q").fill("unfindable");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  await expect(page.locator("#no-results")).toBeVisible();
  await page.reload();
  await expect(page.locator("#no-results")).toBeVisible();
  await page.goBack();
  await expect(page.locator("#q")).toHaveValue("1123");
  await expect(page.locator("#result-count")).toHaveText("1");
  await page.locator("#q").fill("");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  if (page.viewportSize()!.width < 700)
    await page.locator("#filter-details summary").click();
  await page.locator('input[name="type"][value="亚克力"]').check();
  await expect(page.locator("#result-count")).toHaveText("1");
  await page.reload();
  await expect(
    page.locator('input[name="type"][value="亚克力"]'),
  ).toBeChecked();
  if (page.viewportSize()!.width < 700)
    await page.locator("#filter-details summary").click();
  await page.getByRole("button", { name: "清空全部条件" }).click();
  await expect(page.locator("#result-count")).toHaveText("3");
  await expect(page).toHaveURL(/\/merch\/$/);
});
test("剧透折叠且正式内容不包含 demo", async ({ page }) => {
  await page.goto("/wiki/appearance-index/");
  await expect(page.locator("details.spoiler")).not.toHaveAttribute("open", "");
  await page.goto("/merch/");
  await expect(page.locator(".demo-banner")).toHaveCount(0);
  expect(await page.locator("#catalog-data").textContent()).not.toContain(
    "demo-",
  );
});
