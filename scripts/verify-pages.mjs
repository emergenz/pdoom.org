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

stdout.write(`Verified ${requiredFiles.length} GitHub Pages artifacts.\n`)
