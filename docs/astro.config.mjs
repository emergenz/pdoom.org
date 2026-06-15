// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// crowd-cast documentation.
// Builds into ../public/docs/crowd-cast so it ships with the existing pdoom.org
// GitHub Pages deploy (which uploads ./public) and is served at
// https://pdoom.org/docs/crowd-cast/ (one domain, no extra CI).
export default defineConfig({
  site: 'https://pdoom.org',
  base: '/docs/crowd-cast',
  outDir: '../public/docs/crowd-cast',
  integrations: [
    starlight({
      title: 'crowd-cast docs',
      description:
        'Install, configure and run crowd-cast — the p(doom) screen + input recording agent.',
      // The logo is rendered by the custom SiteTitle component (below), so no
      // `logo:` config here — having both processes the same asset twice and
      // the two image pipelines collide.
      favicon: '/favicon.png',
      customCss: ['./src/styles/pdoom.css'],
      components: {
        // Breadcrumb lockup: p(doom) (→ pdoom.org) › crowd-cast docs (→ docs home).
        SiteTitle: './src/components/SiteTitle.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/p-doom/crowd-cast' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/G4JNuPX2VR' },
        { icon: 'x.com', label: 'Twitter', href: 'https://x.com/prob_doom' },
      ],
      editLink: {
        baseUrl: 'https://github.com/p-doom/crowd-cast/edit/main/',
      },
      sidebar: [
        {
          label: 'Get started',
          items: [
            { label: 'Overview', link: '/' },
            { label: 'Install crowd-cast', slug: 'install' },
            { label: 'First-run setup', slug: 'setup' },
          ],
        },
        {
          label: 'Using crowd-cast',
          items: [
            { label: 'The tray menu', slug: 'tray' },
            { label: 'Recording & capture', slug: 'recording' },
            { label: 'Account, uploads & dashboard', slug: 'account' },
            { label: 'Privacy & data', slug: 'privacy' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Configuration', slug: 'configuration' },
            { label: 'Troubleshooting', slug: 'troubleshooting' },
            { label: 'Known issues', slug: 'known-issues' },
          ],
        },
      ],
    }),
  ],
});
