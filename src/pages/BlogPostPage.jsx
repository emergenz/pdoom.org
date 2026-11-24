import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
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
      return filename === 'blog.html' ? '/research/' : '/'
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
    let rootId = null

    if (scriptSource.includes("var BASE_PATH = 'idm-demo/';")) {
      rootId = 'idm-demo'
      scriptSource = scriptSource
        .replace("var BASE_PATH = 'idm-demo/';", "var BASE_PATH = '/blog-content/idm-demo/';")
        .replace(
          "'use strict';",
          "'use strict'; var demoRoot = document.getElementById('idm-demo'); if (!demoRoot || demoRoot.dataset.initialized === 'true') return; demoRoot.dataset.initialized = 'true';",
        )
    }

    if (scriptSource.includes("var OOD_BASE_PATH = 'idm-ood-demo/agentnet_ubuntu/';")) {
      rootId = 'ood-positive-demo'
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

    scriptSource = scriptSource
      .replaceAll(
        "playBtn.title = 'Play / Pause (Space)';",
        "playBtn.title = 'Play / Pause (Space)'; playBtn.setAttribute('aria-label', 'Play or pause animation');",
      )
      .replace(
        "prevBtn.title = 'Previous clip (Up)';",
        "prevBtn.title = 'Previous clip (Up)'; prevBtn.setAttribute('aria-label', 'Previous clip');",
      )
      .replace(
        "nextBtn.title = 'Next clip (Down)';",
        "nextBtn.title = 'Next clip (Down)'; nextBtn.setAttribute('aria-label', 'Next clip');",
      )
      .replaceAll(
        "scrubber.className = 'idm-scrubber';",
        "scrubber.className = 'idm-scrubber'; scrubber.setAttribute('aria-label', 'Animation frame');",
      )
      .replaceAll(
        "scrubber.className = 'ood-scrubber';",
        "scrubber.className = 'ood-scrubber'; scrubber.setAttribute('aria-label', 'Animation frame');",
      )
      .replaceAll(
        'ce.el.style.opacity = opacity;',
        "ce.el.style.opacity = opacity; ce.el.setAttribute('aria-hidden', dist > 1 ? 'true' : 'false');",
      )

    return { rootId, source: scriptSource }
  })

  for (const script of article.querySelectorAll('script')) script.remove()
  for (const marker of article.querySelectorAll('a.marker')) {
    marker.removeAttribute('href')
    marker.setAttribute('aria-hidden', 'true')
  }
  // The announcement block some posts open with (preprint out, install, pay) is a
  // hand-styled paragraph. Drop its inline styles so it follows the note style.
  for (const note of article.querySelectorAll('p[style*="border-top"][style*="text-align: center"]')) {
    note.removeAttribute('style')
    note.classList.add('blog-callout')
    for (const link of note.querySelectorAll('a[style]')) link.removeAttribute('style')
  }
  for (const aside of article.querySelectorAll('aside')) {
    if (/^\*?\s*equal contribution$/i.test(aside.textContent.trim())) {
      aside.remove()
    } else if (aside.textContent.trim().length > 400) {
      // Too long for the margin; keeps the inline note style.
      aside.classList.add('blog-aside--long')
    }
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

// Owns the scroll state for the active-section highlight. It lives in its own
// component so scrolling never re-renders the article, which would rebuild its
// DOM and throw away the interactive demos the post scripts have added.
function ArticleRail({ sections, minutes }) {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    if (sections.length < 2) return undefined

    const update = () => {
      let current = ''
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= 160) current = section.id
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) current = sections[sections.length - 1].id
      setActiveSection(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [sections])

  return (
    <aside className="blog-document-rail" aria-label="Article details">
      <div className="blog-document-rail-sticky">
        {minutes && <p className="blog-reading-time">{minutes} min read</p>}

        {sections.length > 1 && (
          <nav className="blog-table-of-contents" aria-label="Table of contents">
            <span>On this page</span>
            {sections.map((section) => (
              <a
                href={`#${section.id}`}
                key={section.id}
                className={activeSection === section.id ? 'is-active' : undefined}
                aria-current={activeSection === section.id ? 'true' : undefined}
              >
                {section.title}
              </a>
            ))}
          </nav>
        )}
      </div>
    </aside>
  )
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

    const scripts = []
    const observers = []
    const appendScript = (source) => {
      const script = document.createElement('script')
      script.textContent = source
      articleRef.current.appendChild(script)
      scripts.push(script)
    }

    for (const { rootId, source } of documentContent.embeddedScripts) {
      const root = rootId ? document.getElementById(rootId) : null
      if (!root || !('IntersectionObserver' in window)) {
        appendScript(source)
        continue
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          appendScript(source)
          observer.disconnect()
        },
        { rootMargin: '800px 0px' },
      )
      observer.observe(root)
      observers.push(observer)
    }

    return () => {
      observers.forEach((observer) => observer.disconnect())
      scripts.forEach((script) => script.remove())
    }
  }, [documentContent.embeddedScripts, status])

  const articleMarkup = useMemo(() => ({ __html: documentContent.articleHtml }), [documentContent.articleHtml])
  const appendixMarkup = useMemo(() => ({ __html: documentContent.appendixHtml }), [documentContent.appendixHtml])

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
      <ArticleRail sections={documentContent.sections} minutes={documentContent.minutes} />

      <div className="blog-document-main">
        <article
          ref={articleRef}
          className="blog-article-body"
          dangerouslySetInnerHTML={articleMarkup}
        />
        {documentContent.appendixHtml && (
          <aside
            className="blog-article-appendix"
            dangerouslySetInnerHTML={appendixMarkup}
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
      <a href="/research/">
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
        <div className={`blog-post-hero-inner${post.media?.type === 'image' ? ' blog-post-hero-inner--art' : ''}`}>
          <a className="blog-back-link" href="/research/">
            <ArrowLeft size={17} strokeWidth={1.8} aria-hidden="true" />
            All research
          </a>

          <h1>{post.title}</h1>

          <p className="blog-post-abstract">{post.description}</p>

          <div className="blog-post-byline">
            <p className="blog-post-authors-line">
              <span className="blog-post-authors">
                {post.authors.map((author, index) => {
                  return (
                    <span key={author}>
                      {author}{equalContributionAuthors[index] && <sup>*</sup>}
                    </span>
                  )
                })}
              </span>
              {hasEqualContributors && <span className="blog-equal-contribution">* Equal contribution</span>}
            </p>
            <time>{post.date}</time>
          </div>

          <nav className="blog-post-links" aria-label="Links">
            {(post.links || []).map((link) => {
              const external = link.href.startsWith('http')
              return (
                <a
                  href={link.href}
                  key={link.label}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {link.label}
                  {external && <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />}
                </a>
              )
            })}
            <a href="#cite-us-as">Cite this article</a>
          </nav>

          {post.media?.type === 'image' && (
            <img
              className="blog-post-hero-art"
              src={post.media.src}
              alt=""
              width="960"
              height="960"
              decoding="async"
            />
          )}
        </div>
      </header>

      <ArticleContents post={post} />
      <ArticleNavigation post={post} />
    </main>
  )
}
