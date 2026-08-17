import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import {
  allResearch,
  legacyResearchRoutes,
  researchBySlug,
  researchHref,
} from './blogData'
import './blog.css'

function currentSlug() {
  if (typeof window === 'undefined') return ''
  const parts = window.location.pathname.split('/').filter(Boolean)
  return parts.at(-1) || ''
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function localArticleRoute(href) {
  try {
    const url = new URL(href, 'https://pdoom.org')
    if (url.hostname !== 'pdoom.org' && url.hostname !== 'www.pdoom.org') return null

    const filename = url.pathname.split('/').filter(Boolean).at(-1)
    if (filename === 'blog.html' || url.pathname === '/') {
      return filename === 'blog.html' ? '/research' : '/'
    }
    if (filename && legacyResearchRoutes[filename]) return legacyResearchRoutes[filename]
    return null
  } catch {
    return null
  }
}

function prepareLegacyArticle(source, bibtexSource, renderer) {
  const documentNode = new DOMParser().parseFromString(source, 'text/html')
  const article = documentNode.querySelector('d-article')
  const appendix = documentNode.querySelector('d-appendix')

  if (!article) throw new Error('Article body is missing')

  const embeddedScripts = [...article.querySelectorAll('script')].map((script) => {
    let scriptSource = script.textContent

    if (scriptSource.includes("var BASE_PATH = 'idm-demo/';")) {
      scriptSource = scriptSource
        .replace("var BASE_PATH = 'idm-demo/';", "var BASE_PATH = '/blog-content/idm-demo/';")
        .replace(
          "'use strict';",
          "'use strict'; var demoRoot = document.getElementById('idm-demo'); if (!demoRoot || demoRoot.dataset.initialized === 'true') return; demoRoot.dataset.initialized = 'true';",
        )
    }

    if (scriptSource.includes("var OOD_BASE_PATH = 'idm-ood-demo/agentnet_ubuntu/';")) {
      scriptSource = scriptSource
        .replace(
          "var OOD_BASE_PATH = 'idm-ood-demo/agentnet_ubuntu/';",
          "var OOD_BASE_PATH = '/blog-content/idm-ood-demo/agentnet_ubuntu/';",
        )
        .replace(
          "'use strict';",
          "'use strict'; var oodRoot = document.getElementById('ood-positive-demo'); if (!oodRoot || oodRoot.dataset.initialized === 'true') return; oodRoot.dataset.initialized = 'true';",
        )
    }

    return scriptSource
  })

  for (const script of article.querySelectorAll('script')) script.remove()
  for (const aside of article.querySelectorAll('aside')) {
    if (/^\*?\s*equal contribution$/i.test(aside.textContent.trim())) aside.remove()
  }
  for (const block of article.querySelectorAll('d-code[block]')) {
    const lines = block.textContent.replace(/\r\n/g, '\n').split('\n')
    while (lines.length && !lines[0].trim()) lines.shift()
    while (lines.length && !lines.at(-1).trim()) lines.pop()
    const contentLines = lines.filter((line) => line.trim())
    const indentation = contentLines.length
      ? Math.min(...contentLines.map((line) => line.match(/^\s*/)[0].length))
      : 0
    block.textContent = lines.map((line) => line.slice(indentation)).join('\n')
  }
  const readingCopy = article.cloneNode(true)
  for (const element of readingCopy.querySelectorAll('style, noscript, svg')) element.remove()
  const wordCount = readingCopy.textContent.trim().split(/\s+/).filter(Boolean).length

  for (const element of documentNode.querySelectorAll('[onclick], [onload], [onerror]')) {
    element.removeAttribute('onclick')
    element.removeAttribute('onload')
    element.removeAttribute('onerror')
  }

  for (const element of documentNode.querySelectorAll('[src]')) {
    const value = element.getAttribute('src')
    if (!value || value.startsWith('/') || value.startsWith('http') || value.startsWith('data:')) continue
    element.setAttribute('src', `/blog-content/${value}`)
  }

  for (const sourceElement of documentNode.querySelectorAll('source[src]')) {
    const value = sourceElement.getAttribute('src')
    if (value && !value.startsWith('/') && !value.startsWith('http')) {
      sourceElement.setAttribute('src', `/blog-content/${value}`)
    }
  }

  for (const link of documentNode.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) continue
    const route = localArticleRoute(href)
    if (route) {
      link.setAttribute('href', route)
      continue
    }
    if (/^https?:\/\//.test(href)) {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noreferrer')
    }
  }

  const firstSectionHeading = article.querySelector('h2')
  const firstSectionMarker = article.querySelector('.marker')
  const firstSectionBoundary = firstSectionMarker || firstSectionHeading
  const hasFigureBeforeFirstSection = firstSectionBoundary && [...article.querySelectorAll('figure')]
    .some((figure) => figure.compareDocumentPosition(firstSectionBoundary) & 4)

  if (firstSectionBoundary && !hasFigureBeforeFirstSection) {
    firstSectionMarker?.classList.add('blog-first-section-marker--unruled')
    if (!firstSectionMarker || firstSectionMarker.nextElementSibling === firstSectionHeading) {
      firstSectionHeading?.classList.add('blog-first-section--unruled')
    }
  }

  const seenIds = new Set()
  const sections = [...article.querySelectorAll('h2')].map((heading, index) => {
    const base = slugify(heading.textContent) || `section-${index + 1}`
    let id = base
    let suffix = 2
    while (seenIds.has(id)) id = `${base}-${suffix++}`
    seenIds.add(id)
    heading.id = id
    return { id, title: heading.textContent.trim() }
  })

  renderer.renderCitations(documentNode, article, appendix, bibtexSource)
  renderer.renderSourceCitation(documentNode, appendix)
  renderer.renderDocumentMath(documentNode, article, appendix)

  return {
    articleHtml: article.innerHTML,
    appendixHtml: appendix?.innerHTML || '',
    embeddedScripts,
    minutes: Math.max(2, Math.round(wordCount / 210)),
    sections,
  }
}

function ArticleContents({ post }) {
  const articleRef = useRef(null)
  const [documentContent, setDocumentContent] = useState({
    articleHtml: '',
    appendixHtml: '',
    embeddedScripts: [],
    minutes: null,
    sections: [],
  })
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus('loading')
      try {
        const [articleResponse, bibliographyResponse, renderer] = await Promise.all([
          fetch(`/blog-content/${post.source}.html`, { signal: controller.signal }),
          fetch('/blog-content/bibliography.bib', { signal: controller.signal }),
          import('./researchDocument'),
        ])
        if (!articleResponse.ok) throw new Error(`Could not load article (${articleResponse.status})`)
        if (!bibliographyResponse.ok) throw new Error(`Could not load bibliography (${bibliographyResponse.status})`)
        const [source, bibtexSource] = await Promise.all([
          articleResponse.text(),
          bibliographyResponse.text(),
        ])
        setDocumentContent(prepareLegacyArticle(source, bibtexSource, renderer))
        setStatus('ready')
      } catch (error) {
        if (error.name !== 'AbortError') setStatus('error')
      }
    }

    load()
    return () => controller.abort()
  }, [post])

  useEffect(() => {
    if (status !== 'ready' || !articleRef.current) return undefined

    const scripts = documentContent.embeddedScripts.map((source) => {
      const script = document.createElement('script')
      script.textContent = source
      articleRef.current.appendChild(script)
      return script
    })

    return () => scripts.forEach((script) => script.remove())
  }, [documentContent.embeddedScripts, status])

  if (status === 'loading') {
    return <p className="blog-document-status">Loading research document...</p>
  }

  if (status === 'error') {
    return (
      <p className="blog-document-status blog-document-status--error">
        The research document could not be loaded.
      </p>
    )
  }

  return (
    <div className="blog-document-grid">
      <aside className="blog-document-rail" aria-label="Article details">
        <div className="blog-document-rail-sticky">
          <dl>
            <div>
              <dt>Published</dt>
              <dd>{post.date}</dd>
            </div>
            <div>
              <dt>Reading time</dt>
              <dd>{documentContent.minutes} min</dd>
            </div>
          </dl>

          {documentContent.sections.length > 1 && (
            <nav className="blog-table-of-contents" aria-label="Table of contents">
              <span>In this document</span>
              {documentContent.sections.map((section) => (
                <a href={`#${section.id}`} key={section.id}>
                  {section.title}
                </a>
              ))}
            </nav>
          )}
        </div>
      </aside>

      <div className="blog-document-main">
        <article
          ref={articleRef}
          className="blog-article-body"
          dangerouslySetInnerHTML={{ __html: documentContent.articleHtml }}
        />
        {documentContent.appendixHtml && (
          <aside
            className="blog-article-appendix"
            dangerouslySetInnerHTML={{ __html: documentContent.appendixHtml }}
          />
        )}
      </div>
    </div>
  )
}

function ArticleNavigation({ post }) {
  const index = allResearch.findIndex((item) => item.slug === post.slug)
  const previous = index > 0 ? allResearch[index - 1] : null
  const next = index < allResearch.length - 1 ? allResearch[index + 1] : null
  const isSingle = !previous || !next

  return (
    <nav className={`blog-post-navigation${isSingle ? ' blog-post-navigation--single' : ''}`} aria-label="Research navigation">
      {previous && (
        <a className="blog-post-navigation-link--previous" href={researchHref(previous)}>
          <span><ArrowLeft size={18} aria-hidden="true" /> Previous</span>
          <strong>{previous.shortTitle || previous.title}</strong>
        </a>
      )}
      {next && (
        <a className="blog-post-navigation-link--next" href={researchHref(next)}>
          <span>Next <ArrowRight size={18} aria-hidden="true" /></span>
          <strong>{next.shortTitle || next.title}</strong>
        </a>
      )}
    </nav>
  )
}

function MissingResearchPost() {
  return (
    <main className="blog-page blog-missing-page" id="main" data-nav-theme="light">
      <p className="blog-eyebrow">404</p>
      <h1>Research document not found.</h1>
      <a href="/research">
        <ArrowLeft size={18} aria-hidden="true" /> Return to all research
      </a>
    </main>
  )
}

export default function BlogPostPage({ slug: slugProp }) {
  const slug = slugProp || currentSlug()
  const post = researchBySlug[slug]

  useEffect(() => {
    if (!post) return undefined
    const previousTitle = document.title
    document.title = `${post.title} | p(doom)`
    return () => { document.title = previousTitle }
  }, [post])

  if (!post) return <MissingResearchPost />

  const equalContributionAuthors = post.authors.map((author, index) => (
    post.authors.length > 1
    && author !== 'p(doom) Team'
    && !(author === 'Stefan Bauer' && index === post.authors.length - 1)
  ))
  const hasEqualContributors = equalContributionAuthors.some(Boolean)

  return (
    <main className="blog-page blog-post-page" id="main" data-nav-theme="light">
      <header className="blog-post-hero" data-nav-theme="light">
        <a className="blog-back-link" href="/research">
          <ArrowLeft size={17} strokeWidth={1.8} aria-hidden="true" />
          All research
        </a>

        <div className="blog-post-hero-spacer" aria-hidden="true" />

        <h1>{post.title}</h1>

        <div className="blog-post-intro">
          <p>{post.description}</p>
          <div className="blog-post-byline">
            <strong className="blog-post-authors">
              {post.authors.map((author, index) => {
                return (
                  <span key={author}>
                    {author}{equalContributionAuthors[index] && <sup>*</sup>}
                  </span>
                )
              })}
            </strong>
            {hasEqualContributors && <span className="blog-equal-contribution">* Equal contribution</span>}
            <time>{post.date}</time>
          </div>
        </div>
      </header>

      <ArticleContents post={post} />
      <ArticleNavigation post={post} />
    </main>
  )
}
