import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { stdout } from 'node:process'

const requiredFiles = [
  'dist/index.html',
  'dist/404.html',
  'dist/CNAME',
  'dist/about/index.html',
  'dist/research/index.html',
  'dist/research/inverse-dynamics-model/index.html',
  'dist/careers/index.html',
  'dist/careers/paid-data-collection/index.html',
  'dist/participate/index.html',
  'dist/onboard.html',
  'dist/crowd_cast_dashboard.html',
  'dist/crowd-cast-quickstart.html',
  'dist/docs/crowd-cast/index.html',
  'dist/docs/crowd-cast/install/index.html',
  'dist/about.html',
  'dist/blog.html',
  'dist/participate.html',
  'dist/participate-preview.png',
  'dist/open_calls/04_crowd_cast.html',
  'dist/media/hero-umbra-mountain-fade-loop.webm',
  'dist/media/learning-from-human-work-film.webm',
]

const contents = new Map()

for (const file of requiredFiles) {
  try {
    contents.set(file, await readFile(file))
  } catch {
    throw new Error(`Missing Pages artifact: ${file}`)
  }
}

const assertEqual = (actual, expected, message) => {
  if (!actual.equals(expected)) throw new Error(message)
}

if (contents.get('dist/CNAME').toString().trim() !== 'pdoom.org') {
  throw new Error('dist/CNAME must contain pdoom.org')
}

const participationPreviewHash = createHash('sha256')
  .update(contents.get('dist/participate-preview.png'))
  .digest('hex')

if (participationPreviewHash !== 'e6fd4f648e284c59e48f1c149fca9ae18c8225765b5c5989d7fda5be6fad34a3') {
  throw new Error('The recruitment social preview no longer matches d379038')
}

assertEqual(
  contents.get('dist/crowd_cast_dashboard.html'),
  await readFile('public/crowd_cast_dashboard.html'),
  'The production build changed the crowd-cast dashboard',
)

assertEqual(
  contents.get('dist/onboard.html'),
  await readFile('public/onboard.html'),
  'The production build changed the onboarding page',
)

const redirects = [
  ['dist/about.html', '/about/'],
  ['dist/blog.html', '/research/'],
  ['dist/participate.html', '/careers/paid-data-collection/'],
  ['dist/open_calls/04_crowd_cast.html', '/careers/paid-data-collection/'],
]

for (const [file, target] of redirects) {
  if (!contents.get(file).toString().includes(`url=${target}`)) {
    throw new Error(`${file} does not redirect to ${target}`)
  }
}

const socialPages = [
  {
    file: 'dist/index.html',
    url: 'https://pdoom.org/',
    image: 'https://pdoom.org/assets/hero-explorations/umbra-mountain.png',
    card: 'summary_large_image',
  },
  {
    file: 'dist/participate.html',
    url: 'https://pdoom.org/participate',
    image: 'https://pdoom.org/participate-preview.png',
    card: 'summary_large_image',
  },
  {
    file: 'dist/open_calls/04_crowd_cast.html',
    url: 'https://pdoom.org/open_calls/04_crowd_cast.html',
    image: 'https://pdoom.org/participate-preview.png',
    card: 'summary_large_image',
  },
  {
    file: 'dist/research/inverse-dynamics-model/index.html',
    url: 'https://pdoom.org/research/inverse-dynamics-model/',
    image: 'https://pdoom.org/assets/releases/idm.webp',
    card: 'summary',
  },
]

for (const { file, url, image, card } of socialPages) {
  const html = contents.get(file).toString()
  const expectedTags = [
    `property="og:url" content="${url}"`,
    `property="og:image" content="${image}"`,
    `name="twitter:card" content="${card}"`,
    'property="og:title"',
    'property="og:description"',
    'name="twitter:title"',
    'name="twitter:description"',
  ]

  for (const tag of expectedTags) {
    if (!html.includes(tag)) throw new Error(`${file} is missing social metadata: ${tag}`)
  }
}

stdout.write(`Verified ${requiredFiles.length} GitHub Pages artifacts.\n`)
