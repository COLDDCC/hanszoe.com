import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";
const routes = readdirSync("dist", { recursive: true })
  .filter(
    (path): path is string =>
      typeof path === "string" && path.endsWith(".html"),
  )
  .map((path) => "/" + path.replaceAll("\\", "/").replace(/index\.html$/, ""));
test("所有路由有标题且没有横向溢出", async ({ page }, testInfo) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (
      [
        "/",
        "/merch/",
        "/merch/nendoroid-hange-1123/",
        "/series/",
        "/news/",
        "/wiki/",
      ].includes(route)
    )
      await page.screenshot({
        path: testInfo.outputPath(
          (route === "/"
            ? "home"
            : route.replaceAll("/", "-").replace(/^-|-$/g, "")) + ".png",
        ),
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
  const total = await page
    .locator("#catalog-data")
    .evaluate((element) => JSON.parse(element.textContent!).products.length);
  await expect(page.locator("#result-count")).toHaveText(String(total));
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

test("重复搜索不增加历史记录；前进后退恢复排序", async ({ page }) => {
  await page.goto("/merch/?q=1123");
  const initial = await page.evaluate(() => history.length);
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  expect(await page.evaluate(() => history.length)).toBe(initial);
  await page.locator("#sort").selectOption("name");
  await expect(page).toHaveURL(/sort=name/);
  await page.goBack();
  await expect(page.locator("#sort")).toHaveValue("added");
  await page.goForward();
  await expect(page.locator("#sort")).toHaveValue("name");
});
