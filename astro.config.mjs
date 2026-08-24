import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 개인 도메인을 연결하면 이 주소만 새 도메인으로 변경하세요.
  site: 'https://jaeho99.github.io',
  integrations: [sitemap()],
});
