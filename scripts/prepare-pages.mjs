import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { allResearch, legacyResearchRoutes } from '../src/pages/blogData.js'

await mkdir('dist', { recursive: true })

const careerIds = [
  'paid-data-collection',
  'fixed-size-state',
  'long-horizon-data',
  'mid-training',
  'reinforcement-learning',
  'residency',
]

const appRoutes = [
  'about',
  'blog',
  'careers',
  ...careerIds.map((id) => `careers/${id}`),
  'imprint',
  'merch',
  'participate',
  'research',
  ...allResearch.flatMap(({ slug }) => [`research/${slug}`, `blog/${slug}`]),
]

for (const route of appRoutes) {
  const routeDirectory = `dist/${route}`
  await mkdir(routeDirectory, { recursive: true })
  await copyFile('dist/index.html', `${routeDirectory}/index.html`)
}

const careerLegacyRoutes = {
  '02_fixed_size_state': '/careers/fixed-size-state/',
  '03_data_and_systems': '/careers/long-horizon-data/',
  '04_crowd_cast': '/careers/paid-data-collection/',
  '05_residency': '/careers/residency/',
  '06_rl': '/careers/reinforcement-learning/',
  '07_midtrain': '/careers/mid-training/',
}

const legacyRoutes = {
  ...Object.fromEntries(
    Object.entries(legacyResearchRoutes).map(([source, target]) => [source, `${target}/`]),
  ),
  'about.html': '/about/',
  'blog.html': '/research/',
  'imprint.html': '/imprint/',
  'open_calls.html': '/careers/',
  'participate.html': '/careers/paid-data-collection/',
  'research.html': '/research/',
  'supply.html': '/merch/',
  ...Object.fromEntries(
    Object.entries(careerLegacyRoutes).map(([source, target]) => [`open_calls/${source}.html`, target]),
  ),
}

for (const [source, target] of Object.entries(legacyRoutes)) {
  const outputPath = `dist/${source}`
  await mkdir(outputPath.slice(0, outputPath.lastIndexOf('/')), { recursive: true })
  await writeFile(outputPath, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=${target}">
    <link rel="canonical" href="https://pdoom.org${target}">
    <title>Redirecting | p(doom)</title>
  </head>
  <body>
    <p>Redirecting to <a href="${target}">${target}</a>.</p>
    <script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
  </body>
</html>
`)
}

// Unknown clean URLs still boot the application, which renders its fallback route.
await copyFile('dist/index.html', 'dist/404.html')
