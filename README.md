# p(doom) website

The public p(doom) website, research archive, crowd-cast documentation, and participant onboarding flow.

## Development

```sh
npm ci
npm ci --prefix docs
npm run dev
```

The combined development command builds the Starlight documentation first and then starts Vite. Use `npm run dev:site` or `npm run dev:docs` to work on either surface independently.

## Verification

```sh
npm run lint
npm --prefix docs run check
npm run build
npm audit --omit=dev
npm audit --prefix docs --omit=dev
```

`npm run build` writes the complete GitHub Pages artifact to `dist/`, including the site, documentation under `/docs/crowd-cast/`, the standalone onboarding flow, the crowd-cast dashboard, and the SPA fallback used by clean routes.

## Deployment

GitHub Pages deploys `dist/` through `.github/workflows/deploy-pages.yml` after changes reach `main`. The custom domain is declared in `public/CNAME`.
