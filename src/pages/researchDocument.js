import bibtexParse from '@orcid/bibtex-parse-js'
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'

function sourceFrontMatter(documentNode) {
  const element = documentNode.querySelector('#distill-front-matter')
  if (!element) return null
  try {
    return JSON.parse(element.textContent)
  } catch {
    return null
  }
}

function normalizeBibtexValue(value = '') {
  return value
    .replace(/[\t\n ]+/g, ' ')
    .replace(/{\\["^`.'acu~Hvs]( )?([a-zA-Z])}/g, '$2')
    .replace(/{\\([a-zA-Z])}/g, '$1')
    .replace(/[{}]/g, '')
    .trim()
}

function bibliographyMap(source) {
  const entries = bibtexParse.toJSON(source)
  return new Map(entries.map((entry) => {
    const fields = Object.fromEntries(
      Object.entries(entry.entryTags || {}).map(([key, value]) => [
        key.toLowerCase(),
        normalizeBibtexValue(value),
      ]),
    )
    return [entry.citationKey, { ...fields, type: entry.entryType }]
  }))
}

function authorString(entry) {
  if (!entry?.author) return ''

  const names = entry.author.split(/\s+and\s+/).map((name) => {
    const parts = name.trim().split(',')
    if (parts.length > 1) {
      const last = parts.shift().trim()
      const initials = parts
        .join(',')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => `${part[0]}.`)
        .join('')
      return `${last}, ${initials}`
    }

    const words = name.trim().split(/\s+/)
    const last = words.pop() || ''
    const initials = words.map((part) => `${part[0]}.`).join('')
    return initials ? `${last}, ${initials}` : last
  })

  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

function venueString(entry) {
  let venue = entry.journal || entry.booktitle || ''
  if (entry.volume) {
    const issue = entry.issue || entry.number
    venue += `${venue ? ', ' : ''}Vol ${entry.volume}${issue ? `(${issue})` : ''}`
  }
  if (entry.pages) venue += `${venue ? ', ' : ''}pp. ${entry.pages}`
  if (venue) venue += '. '
  if (entry.publisher) venue += `${entry.publisher}${entry.publisher.endsWith('.') ? '' : '.'}`
  return venue.trim()
}

function referenceUrl(entry) {
  if (entry.url) {
    const arxiv = /arxiv\.org\/abs\/([0-9.]+)/.exec(entry.url)
    return arxiv ? `https://arxiv.org/pdf/${arxiv[1]}.pdf` : entry.url
  }
  if (entry.doi) return `https://doi.org/${entry.doi}`
  return ''
}

function citationLabel(entry) {
  if (!entry) return 'Reference not found'
  return [authorString(entry), entry.year || entry.date, entry.title]
    .filter(Boolean)
    .join('. ')
}

function appendReference(documentNode, list, entry, number, key) {
  const item = documentNode.createElement('li')
  item.id = `reference-${number}`
  item.dataset.citationKey = key

  const title = documentNode.createElement('span')
  title.className = 'blog-reference-title'
  title.textContent = entry?.title || key
  item.appendChild(title)

  const url = entry && referenceUrl(entry)
  if (url) {
    const link = documentNode.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.textContent = entry.doi ? 'DOI' : 'Source'
    item.append(' ', link)
  }

  if (entry) {
    const details = documentNode.createElement('span')
    details.className = 'blog-reference-details'
    details.textContent = [
      authorString(entry),
      entry.year || entry.date,
      venueString(entry),
    ].filter(Boolean).join(', ')
    item.appendChild(details)
  }

  list.appendChild(item)
}

export function renderCitations(documentNode, article, appendix, bibtexSource) {
  const bibliography = bibliographyMap(bibtexSource)
  const citationNodes = [
    ...article.querySelectorAll('d-cite'),
    ...(appendix ? appendix.querySelectorAll('d-cite') : []),
  ]
  const orderedKeys = []

  for (const citation of citationNodes) {
    const keys = (citation.getAttribute('key') || citation.getAttribute('bibtex-key') || '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean)

    for (const key of keys) {
      if (!orderedKeys.includes(key)) orderedKeys.push(key)
    }

    const existingText = citation.textContent.trim()
    citation.replaceChildren()
    citation.className = 'blog-citation'
    citation.setAttribute('role', 'doc-biblioref')
    if (existingText) citation.append(`${existingText} `)
    citation.append('[')

    keys.forEach((key, index) => {
      if (index) citation.append(', ')
      const number = orderedKeys.indexOf(key) + 1
      const entry = bibliography.get(key)
      const link = documentNode.createElement('a')
      link.href = `#reference-${number}`
      link.textContent = entry ? String(number) : '?'
      link.title = citationLabel(entry)
      link.setAttribute('aria-label', entry ? `Reference ${number}: ${citationLabel(entry)}` : `Missing reference: ${key}`)
      citation.appendChild(link)
    })

    citation.append(']')
  }

  const bibliographyElement = appendix?.querySelector('d-bibliography')
  if (!bibliographyElement || orderedKeys.length === 0) return

  bibliographyElement.replaceChildren()
  bibliographyElement.className = 'blog-bibliography'
  const heading = documentNode.createElement('h3')
  heading.textContent = 'References'
  bibliographyElement.appendChild(heading)

  const list = documentNode.createElement('ol')
  for (const [index, key] of orderedKeys.entries()) {
    appendReference(documentNode, list, bibliography.get(key), index + 1, key)
  }
  bibliographyElement.appendChild(list)
}

function sourceAuthor(author) {
  const name = author.author || ''
  if (author.citationAuthor) {
    return {
      citation: author.citationAuthor,
      bibtex: author.bibtexAuthor || `{${author.citationAuthor}}`,
    }
  }

  const parts = name.trim().split(/\s+/)
  const last = parts.pop() || ''
  const first = parts.join(' ')
  return {
    citation: last,
    bibtex: author.bibtexAuthor || (first ? `${last}, ${first}` : last),
  }
}

function bibtexKeyPart(value) {
  return String(value).replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()
}

export function renderSourceCitation(documentNode, appendix) {
  const frontMatter = sourceFrontMatter(documentNode)
  const container = appendix?.querySelector('distill-appendix')
  if (!frontMatter?.published || !frontMatter.title || !frontMatter.url || !frontMatter.authors?.length || !container) return

  const year = new Date(frontMatter.published).getFullYear()
  if (!Number.isFinite(year)) return

  const authors = frontMatter.authors.map(sourceAuthor)
  let shortAuthors = authors[0].citation
  if (authors.length === 2) shortAuthors = `${authors[0].citation} & ${authors[1].citation}`
  if (authors.length > 2) shortAuthors = `${authors[0].citation}, et al.`

  const key = frontMatter.bibtexKey || [
    bibtexKeyPart(authors[0].citation),
    year,
    bibtexKeyPart(frontMatter.title.split(' ')[0]),
  ].join('') || 'Untitled'

  const shortCitation = `${shortAuthors}, "${frontMatter.title}", p(doom), ${year}.`
  const bibtexCitation = `@article{${key},
  author = {${authors.map((author) => author.bibtex).join(' and ')}},
  title = {${frontMatter.title}},
  journal = {p(doom) blog},
  year = {${year}},
  note = {${frontMatter.url}}
}`

  container.replaceChildren()
  container.className = 'blog-cite-us'

  const heading = documentNode.createElement('h3')
  heading.id = 'cite-us-as'
  heading.textContent = 'Cite us as'
  container.appendChild(heading)

  const instruction = documentNode.createElement('p')
  instruction.textContent = 'For attribution in academic contexts, please cite this work as'
  container.appendChild(instruction)

  const short = documentNode.createElement('pre')
  short.className = 'blog-source-citation'
  short.textContent = shortCitation
  container.appendChild(short)

  const format = documentNode.createElement('p')
  format.className = 'blog-citation-format'
  format.textContent = 'BibTeX citation'
  container.appendChild(format)

  const bibtex = documentNode.createElement('pre')
  bibtex.className = 'blog-source-citation blog-source-citation--bibtex'
  bibtex.textContent = bibtexCitation
  container.appendChild(bibtex)
}

export function renderDocumentMath(documentNode, article, appendix) {
  let delimiters = [{ left: '$$', right: '$$', display: false }]

  const configured = sourceFrontMatter(documentNode)?.katex?.delimiters
  if (Array.isArray(configured) && configured.length) delimiters = configured

  const options = {
    delimiters,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'svg'],
    throwOnError: false,
    strict: 'ignore',
  }

  renderMathInElement(article, options)
  if (appendix) renderMathInElement(appendix, options)
}
