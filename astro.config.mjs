import { defineConfig } from 'astro/config';
import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'always',
});
