import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { allResearch, legacyResearchRoutes } from '../src/pages/blogData.js'

const siteOrigin = 'https://pdoom.org'
const defaultDescription = 'p(doom) addresses the fundamental bottlenecks toward AGI that scaling compute cannot solve.'

const defaultMetadata = {
  title: 'p(doom) | AGI research',
  description: defaultDescription,
  url: `${siteOrigin}/`,
  image: `${siteOrigin}/assets/hero-explorations/umbra-mountain.png`,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: 'A mountain range rising above a sea of clouds at dawn.',
  card: 'summary_large_image',
  type: 'website',
}

const participationMetadata = {
  title: 'Get paid to record your work · p(doom)',
  description: 'We pay $300/month to record your screen for AI research.',
  url: `${siteOrigin}/participate`,
  image: `${siteOrigin}/participate-preview.png`,
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: 'A halftone illustration of a desktop computer.',
  card: 'summary_large_image',
  type: 'website',
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

function renderSocialMetadata(metadata) {
  const tags = [
    '<meta property="og:site_name" content="p(doom)" />',
    `<meta property="og:type" content="${escapeHtml(metadata.type)}" />`,
    `<meta property="og:url" content="${escapeHtml(metadata.url)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(metadata.image)}" />`,
    `<meta property="og:image:width" content="${metadata.imageWidth}" />`,
    `<meta property="og:image:height" content="${metadata.imageHeight}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(metadata.imageAlt)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(metadata.card)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(metadata.imageAlt)}" />`,
  ]

  if (metadata.publishedTime) {
    tags.push(`<meta property="article:published_time" content="${escapeHtml(metadata.publishedTime)}" />`)
  }

  return tags.join('\n    ')
}

function renderPage(template, metadata) {
  return template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    )
    .replace(
      /<link rel="canonical" href=".*?" \/>/,
      `<link rel="canonical" href="${escapeHtml(metadata.url)}" />`,
    )
    .replace(
      /<!-- social-meta:start -->[\s\S]*?<!-- social-meta:end -->/,
      `<!-- social-meta:start -->\n    ${renderSocialMetadata(metadata)}\n    <!-- social-meta:end -->`,
    )
}

function researchMetadata(item) {
  const hasImage = Boolean(item.media?.src)
  return {
    title: `${item.title} | p(doom)`,
    description: item.summary || item.description,
    url: `${siteOrigin}/research/${item.slug}/`,
    image: hasImage ? `${siteOrigin}${item.media.src}` : defaultMetadata.image,
    imageWidth: hasImage ? 960 : defaultMetadata.imageWidth,
    imageHeight: hasImage ? 960 : defaultMetadata.imageHeight,
    imageAlt: hasImage ? `Artwork for ${item.shortTitle || item.title}.` : defaultMetadata.imageAlt,
    card: hasImage ? 'summary' : defaultMetadata.card,
    type: 'article',
    publishedTime: new Date(`${item.date} 00:00:00 UTC`).toISOString(),
  }
}

const careerTitles = {
  'fixed-size-state': 'Member of Technical Staff, Fixed-size state | p(doom)',
  'long-horizon-data': 'Member of Technical Staff, Long-horizon data | p(doom)',
  'mid-training': 'Member of Technical Staff, Mid-training | p(doom)',
  'reinforcement-learning': 'Member of Technical Staff, RL | p(doom)',
  residency: 'p(doom) Residency',
}

const appRoutes = [
  {
    route: 'about',
    metadata: {
      ...defaultMetadata,
      title: 'About | p(doom)',
      description: 'p(doom) works on new data, long-horizon learning, fixed-sized state, continual learning, and credit assignment.',
      url: `${siteOrigin}/about/`,
    },
  },
  {
    route: 'blog',
    metadata: {
      ...defaultMetadata,
      title: 'Research | p(doom)',
      description: 'Research and releases from p(doom).',
      url: `${siteOrigin}/research/`,
    },
  },
  {
    route: 'careers',
    metadata: {
      ...defaultMetadata,
      title: 'Careers | p(doom)',
      description: 'Work on the fundamental bottlenecks toward AGI that scaling compute cannot solve.',
      url: `${siteOrigin}/careers/`,
    },
  },
  { route: 'careers/paid-data-collection', metadata: { ...participationMetadata, url: `${siteOrigin}/careers/paid-data-collection/` } },
  ...Object.entries(careerTitles).map(([id, title]) => ({
    route: `careers/${id}`,
    metadata: {
      ...defaultMetadata,
      title,
      description: 'Work on the fundamental bottlenecks toward AGI that scaling compute cannot solve.',
      url: `${siteOrigin}/careers/${id}/`,
    },
  })),
  {
    route: 'imprint',
    metadata: {
      ...defaultMetadata,
      title: 'Imprint | p(doom)',
      description: 'Company and legal information for p(doom).',
      url: `${siteOrigin}/imprint/`,
    },
  },
  {
    route: 'merch',
    metadata: {
      ...defaultMetadata,
      title: 'Merch | p(doom)',
      description: 'Objects from p(doom).',
      url: `${siteOrigin}/merch/`,
    },
  },
  { route: 'participate', metadata: participationMetadata },
  {
    route: 'research',
    metadata: {
      ...defaultMetadata,
      title: 'Research | p(doom)',
      description: 'Research and releases from p(doom).',
      url: `${siteOrigin}/research/`,
    },
  },
  ...allResearch.flatMap((item) => {
    const metadata = researchMetadata(item)
    return [
      { route: `research/${item.slug}`, metadata },
      { route: `blog/${item.slug}`, metadata },
    ]
  }),
]

await mkdir('dist', { recursive: true })

const entryTemplate = await readFile('dist/index.html', 'utf8')
await writeFile('dist/index.html', renderPage(entryTemplate, defaultMetadata))

for (const { route, metadata } of appRoutes) {
  const routeDirectory = `dist/${route}`
  await mkdir(routeDirectory, { recursive: true })
  await writeFile(`${routeDirectory}/index.html`, renderPage(entryTemplate, metadata))
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

const routeMetadata = new Map(appRoutes.map(({ route, metadata }) => [route, metadata]))
const researchBySource = new Map(allResearch.map((item) => [`${item.source}.html`, researchMetadata(item)]))

function legacyMetadata(source, target) {
  if (source === 'participate.html') return participationMetadata
  if (source === 'open_calls/04_crowd_cast.html') {
    return { ...participationMetadata, url: `${siteOrigin}/open_calls/04_crowd_cast.html` }
  }
  if (researchBySource.has(source)) return researchBySource.get(source)
  return routeMetadata.get(target.replace(/^\/+|\/+$/g, '')) || defaultMetadata
}

for (const [source, target] of Object.entries(legacyRoutes)) {
  const outputPath = `dist/${source}`
  const metadata = legacyMetadata(source, target)
  await mkdir(outputPath.slice(0, outputPath.lastIndexOf('/')), { recursive: true })
  await writeFile(outputPath, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(metadata.description)}">
    <meta http-equiv="refresh" content="0; url=${target}">
    <link rel="canonical" href="${siteOrigin}${target}">
    <title>${escapeHtml(metadata.title)}</title>
    ${renderSocialMetadata(metadata)}
  </head>
  <body>
    <p>Redirecting to <a href="${target}">${target}</a>.</p>
    <script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
  </body>
</html>
`)
}

// Unknown clean URLs still boot the application, which renders its fallback route.
await writeFile('dist/404.html', renderPage(entryTemplate, defaultMetadata))
