# crowd-cast documentation

This directory is the migrated crowd-cast documentation site. It remains an
independent Astro Starlight project so documentation content, components, routes,
and authoring conventions do not need to change.

## Local development

From `new-website`, build the documentation and start the landing site together:

```bash
npm run dev
```

The landing-site development server serves the generated documentation through
the same public path at `http://localhost:5173/docs/crowd-cast/`. Run
`npm run build:docs` after editing documentation shell files. For live
documentation-only development, from `new-website/docs` run:

```bash
npm ci
npm run check
npm run dev
```

Astro serves the documentation at
`http://localhost:4321/docs/crowd-cast/`.

## Production build

From `new-website`:

```bash
npm run build
```

The root build runs Vite first because it recreates `new-website/dist`, then
builds Starlight into `new-website/dist/docs/crowd-cast`. This preserves the
public route at `/docs/crowd-cast/`.

Preview only the documentation build from `new-website/docs`:

```bash
npm run preview
```

## Content boundary

Documentation content lives in `src/content/docs`. Those MDX files are copied
unchanged from the previous site. Visual changes belong in
`src/styles/pdoom.css`, `src/components`, or `astro.config.mjs`.
