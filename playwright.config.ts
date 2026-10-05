import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  reporter: [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 1 : 0,
  testMatch: "browser.spec.ts",
  use: { baseURL: "http://127.0.0.1:4321", trace: "retain-on-failure" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 360, height: 800 } } },
  ],
});
