import { useEffect, useRef, useState } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import AboutPage from './pages/AboutPage.jsx'
import BlogIndexPage from './pages/BlogIndexPage.jsx'
import BlogPostPage from './pages/BlogPostPage.jsx'
import CareersPage from './pages/CareersPage.jsx'
import ImprintPage from './pages/ImprintPage.jsx'
import MerchPage from './pages/MerchPage.jsx'
import { legacyResearchRoutes } from './pages/blogData.js'
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  {
    label: 'Research',
    href: '/research/',
  },
  {
    label: 'Releases',
    groups: [
      {
        label: 'Latest releases',
        items: [
          { label: 'Inverse Dynamics Model', description: 'Action-labeling unlabeled videos', href: '/research/inverse-dynamics-model/' },
          { label: 'omegalax', description: 'VLM training codebase', href: 'https://github.com/p-doom/omegalax' },
          { label: 'crowd-cast', description: 'Screen capture infrastructure', href: '/research/crowd-cast/' },
          { label: 'AGI-CAST', description: 'Long-horizon research dataset', href: '/research/agi-cast/' },
          { label: 'crowd-code', description: 'Data for product-feedback loops', href: '/research/crowd-code/' },
          { label: 'Jasmine', description: 'JAX world-modeling codebase and dataset', href: '/research/jasmine/' },
        ],
      },
      {
        label: 'Browse',
        items: [
          { label: 'All research', description: 'Publications and release notes', href: '/research/' },
          { label: 'Models and datasets', description: 'Weights and open data', href: 'https://huggingface.co/p-doom' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    groups: [
      {
        label: 'Resources',
        items: [
          { label: 'Documentation', description: 'Guides and reference', href: '/docs/crowd-cast/' },
          { label: 'Research', description: 'Publications and releases', href: '/research/' },
          { label: 'GitHub', description: 'Open source code', href: 'https://github.com/p-doom' },
          { label: 'Hugging Face', description: 'Models and datasets', href: 'https://huggingface.co/p-doom' },
          { label: 'Discord', description: 'Community and discussion', href: 'https://discord.gg/G4JNuPX2VR' },
        ],
      },
      {
        label: 'Company',
        items: [
          { label: 'About us', description: 'Methods that unblock scaling', href: '/about/' },
          { label: 'Careers', description: 'Work with us', href: '/careers/' },
          { label: 'Merch', description: 'Support the work', href: '/merch/' },
          { label: 'Imprint', description: 'Legal information', href: '/imprint/' },
        ],
      },
    ],
  },
]

const modalities = [
  {
    label: 'Meta-Learning from Humans',
    description: 'Unlock data troves that existing training paradigms cannot reach. These trajectories capture people as they learn: acting, receiving feedback, adapting, and improving over time.',
  },
  {
    label: 'Month-Long Horizons',
    description: 'Learn, reason, and act across trajectories that last hours, days, and eventually lifetimes.',
  },
  {
    label: 'Fixed-Size State',
    description: 'Carry useful state indefinitely while keeping memory and computation bounded as experience accumulates.',
  },
  {
    label: 'Learning from Experience',
    description: 'Build systems that improve through experience: continual learning, product feedback loops, temporal-difference learning, and credit assignment across long horizons.',
  },
]

const readyCards = [
  {
    title: 'Capture',
    image: '/assets/human-work/capture.webp',
    tags: ['Human work', 'Month-long horizons', 'Passive recordings'],
    body: 'Capture months-long human computer work as aligned streams of video and human inputs.',
    links: [
      { label: 'crowd-cast', href: '/research/crowd-cast/' },
      { label: 'AGI-CAST', href: '/research/agi-cast/' },
    ],
    cta: 'Read the project',
    ctaHref: '/research/crowd-cast/',
  },
  {
    title: 'Recover',
    image: '/assets/human-work/recover.webp',
    tags: ['Low-level actions', 'Goals', 'Thinking traces'],
    body: 'Turn passive recordings of human work into useful training signal.',
    links: [
      { label: 'IDM', href: '/research/inverse-dynamics-model/' },
      { label: 'Hugging Face', href: 'https://huggingface.co/p-doom' },
    ],
    cta: 'Explore the IDM',
    ctaHref: '/research/inverse-dynamics-model/',
  },
  {
    title: 'Train',
    image: '/assets/human-work/train.webp',
    tags: ['Extending task horizons', 'Fixed-size state', 'Billion-token trajectories'],
    body: 'Train models on months-long human trajectories to extend their task horizons.',
    links: [
      { label: 'Research', href: '/research/' },
      { label: 'omegalax', href: 'https://github.com/p-doom/omegalax' },
    ],
    cta: 'Explore the training codebase',
    ctaHref: 'https://github.com/p-doom/omegalax',
  },
  {
    title: 'Participate',
    image: '/assets/human-work/participate.webp',
    tags: ['Careers', 'Collaborate', 'Contribute data'],
    body: 'Work with us on the broader set of bottlenecks that scaling compute alone cannot solve.',
    links: [
      { label: 'Careers', href: '/careers/' },
      { label: 'Documentation', href: '/docs/crowd-cast/' },
    ],
    cta: 'Get paid to contribute data',
    ctaHref: '/careers/paid-data-collection/',
  },
]

const announcements = [
  {
    title: 'Annotating Unlabeled Screencasts with an IDM',
    subtitle: 'An inverse dynamics model trained to recover raw input events from screen recordings, released alongside 600 hours of action-labeled screencasts.',
    image: '/assets/releases/idm.webp',
    href: '/research/inverse-dynamics-model/',
  },
  {
    title: 'Capturing Long-Horizon Human Work',
    subtitle: 'The largest long-horizon screencast dataset in the world, with open-source infrastructure for action-annotated crowd-sourcing.',
    image: '/assets/releases/crowd-cast.webp',
    href: '/research/crowd-cast/',
  },
  {
    title: 'AGI-CAST: 600 Hours of AGI Research',
    subtitle: 'A continually growing, openly released dataset of long-horizon screen recordings of AGI research.',
    image: '/assets/releases/agi-cast.webp',
    href: '/research/agi-cast/',
  },
  {
    title: 'Jasmine: A JAX World-Modeling Codebase',
    subtitle: 'A production-ready JAX codebase and the largest open dataset of Minecraft Let\'s Plays for world modeling from unlabeled video.',
    image: '/assets/releases/jasmine.webp',
    href: '/research/jasmine/',
  },
]

const footerGroups = [
  ['Research', [
    { label: 'RESEARCH AGENDA', href: '/#console' },
    { label: 'ALL RESEARCH', href: '/research/' },
  ]],
  ['Releases', [
    { label: 'CROWD-CAST', href: '/research/crowd-cast/' },
    { label: 'INVERSE DYNAMICS MODEL', href: '/research/inverse-dynamics-model/' },
    { label: 'AGI-CAST', href: '/research/agi-cast/' },
    { label: 'CROWD-CODE', href: '/research/crowd-code/' },
    { label: 'JASMINE', href: '/research/jasmine/' },
  ]],
  ['Resources', [
    { label: 'DOCUMENTATION', href: '/docs/crowd-cast/' },
    { label: 'GITHUB', href: 'https://github.com/p-doom' },
    { label: 'HUGGING FACE', href: 'https://huggingface.co/p-doom' },
  ]],
  ['Opportunities', [
    { label: 'CAREERS', href: '/careers/' },
    { label: 'PAID DATA COLLECTION', href: '/careers/paid-data-collection/' },
    { label: 'RESEARCH RESIDENCY', href: '/careers/residency/' },
  ]],
  ['Lab', [
    { label: 'ABOUT', href: '/about/' },
    { label: 'MERCH', href: '/merch/' },
  ]],
  ['Connect', [
    { label: 'DISCORD', href: 'https://discord.gg/G4JNuPX2VR' },
    { label: 'X', href: 'https://x.com/prob_doom' },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/company/p-doom' },
  ]],
]

const paidDataCollectionPath = '/careers/paid-data-collection/'

function editDistance(first, second) {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index)

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex]
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const substitution = first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1
      current[secondIndex] = Math.min(
        previous[secondIndex] + 1,
        current[secondIndex - 1] + 1,
        previous[secondIndex - 1] + substitution,
      )
    }
    previous.splice(0, previous.length, ...current)
  }

  return previous[second.length]
}

function isParticipationShortlink(pathname) {
  const path = pathname.replace(/^\/+|\/+$/g, '')
  if (!path || path.includes('/')) return false

  const slug = path.replace(/\.html?$/i, '').toLowerCase()
  const canonical = 'participate'
  if (slug.slice(0, 2) !== canonical.slice(0, 2)) return false

  return editDistance(slug, canonical) <= Math.max(3, Math.floor(canonical.length * 0.3))
}

function ParticipationRedirect() {
  useEffect(() => {
    window.location.replace(paidDataCollectionPath)
  }, [])

  return null
}

function OnboardingRedirect() {
  useEffect(() => {
    window.location.replace(`/onboard.html${window.location.search}${window.location.hash}`)
  }, [])

  return null
}

function RouteRedirect({ href }) {
  useEffect(() => {
    window.location.replace(href)
  }, [href])

  return null
}

function PdoomBrand({ className = '', large = false, markOnly = false }) {
  return (
    <span className={`pdoom-brand ${large ? 'pdoom-brand--large' : ''} ${className}`}>
      <img src="/assets/pdoom-mark.png" alt="" aria-hidden="true" />
      {!markOnly && <span>p(doom)</span>}
    </span>
  )
}

function ArrowLink({ children, className = '', href = '#', external = false }) {
  return (
    <a className={`arrow-link ${className}`} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
      <span>{children}</span>
    </a>
  )
}

function AnnouncementBar() {
  const [visible, setVisible] = useState(
    () => !document.documentElement.classList.contains('paid-announcement-dismissed'),
  )

  const dismiss = () => {
    try {
      localStorage.setItem('pdoom-paid-data-announcement-dismissed', '1')
    } catch {
      // Dismissal still applies for the current page when storage is unavailable.
    }
    document.documentElement.classList.add('paid-announcement-dismissed')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside className="site-announcement" aria-label="Paid data collection" data-nosnippet="">
      <a href="/careers/paid-data-collection/">
        <span>We pay <strong>$300/month</strong> to record your screen for AI research</span>
      </a>
      <button type="button" aria-label="Dismiss announcement" title="Dismiss announcement" onClick={dismiss}>
        <X size={17} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </aside>
  )
}

function Header() {
  const [theme, setTheme] = useState('dark')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 12)
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0
      const probe = document.elementFromPoint(
        Math.min(window.innerWidth / 2, 720),
        Math.min(window.innerHeight - 1, headerBottom + 1),
      )
      setTheme(probe?.closest('[data-nav-theme]')?.dataset.navTheme || 'dark')
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-locked', menuOpen)
    return () => document.body.classList.remove('menu-locked')
  }, [menuOpen])

  return (
    <>
      <header className={`site-header site-header--${theme} ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="header-brand" href="/" aria-label="p(doom) home">
          <PdoomBrand />
        </a>

        <NavigationMenu.Root className="desktop-nav" aria-label="Primary navigation" delayDuration={0} skipDelayDuration={250}>
          <NavigationMenu.List className="nav-list">
            {navItems.map((item) => (
              <NavigationMenu.Item className="nav-entry" key={item.label}>
                {item.groups ? (
                  <>
                    <NavigationMenu.Trigger className="nav-trigger">
                      {item.label}<ChevronDown size={13} aria-hidden="true" />
                    </NavigationMenu.Trigger>
                    <NavigationMenu.Content className="nav-dropdown nav-dropdown--grouped">
                      {item.groups.map((group) => (
                        <section className="nav-dropdown-group" aria-label={group.label} key={group.label}>
                          <span className="nav-dropdown-heading">{group.label}</span>
                          <ul>
                            {group.items.map((entry) => (
                              <li key={entry.label}>
                                <NavigationMenu.Link asChild>
                                  <a href={entry.href}>
                                    <span className="nav-dropdown-copy">
                                      <strong>{entry.label}</strong>
                                      <small>{entry.description}</small>
                                    </span>
                                  </a>
                                </NavigationMenu.Link>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </NavigationMenu.Content>
                  </>
                ) : (
                  <NavigationMenu.Link asChild>
                    <a href={item.href}>{item.label}</a>
                  </NavigationMenu.Link>
                )}
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="header-actions">
          <button className="menu-toggle" type="button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </header>

      <div className={`mobile-drawer ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="drawer-top">
          <PdoomBrand />
          <button type="button" className="icon-button light" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X /></button>
        </div>
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => (
            item.groups ? (
              <section className="drawer-nav-section" key={item.label}>
                <h2>{item.label}</h2>
                {item.groups.map((group) => (
                  <div className="drawer-nav-group" key={group.label}>
                    <span>{group.label}</span>
                    {group.items.map((entry) => (
                      <a href={entry.href} key={entry.label} onClick={() => setMenuOpen(false)}>
                        <span>
                          <strong>{entry.label}</strong>
                          <small>{entry.description}</small>
                        </span>
                        <ArrowRight size={17} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                ))}
              </section>
            ) : (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowRight size={18} /></a>
            )
          ))}
        </nav>
      </div>
    </>
  )
}

function AmbientVideo({ className = '', poster, sources, videoClassName = '' }) {
  const [playing, setPlaying] = useState(false)

  return (
    <>
      <img
        className={`${className} ambient-video-poster ${playing ? 'is-hidden' : ''}`}
        src={poster}
        alt=""
        aria-hidden="true"
      />
      <video
        className={`${className} ${videoClassName} ambient-video-media ${playing ? 'is-playing' : ''}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
        onError={() => setPlaying(false)}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
    </>
  )
}

function Hero() {
  return (
    <section className="hero" id="top" data-nav-theme="dark">
      <AmbientVideo
        className="hero-media"
        videoClassName="hero-video"
        poster="/assets/hero-explorations/copper-growth-v3.png"
        sources={[
          { src: '/media/hero-electrolyte-loop.webm', type: 'video/webm' },
        ]}
      />
      <div className="hero-shade hero-shade--top" />
      <div className="hero-shade hero-shade--bottom" />
      <div className="hero-content">
        <h1>Turning sand into intelligence.</h1>
        <div className="hero-description">
          <span>Addressing the fundamental bottlenecks toward AGI that scaling compute cannot solve.</span>
        </div>
      </div>
    </section>
  )
}

function MediaConsole() {
  return (
    <section className="console-section" id="console" data-nav-theme="light">
      <div className="console-grid">
        <div className="console-left">
          <h2>Unblocking the<br />exponential.</h2>
        </div>
        <ol className="research-agenda">
          {modalities.map((item) => (
            <li className="research-agenda-item" key={item.label}>
              <div>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function FilmSection() {
  return (
    <section className="film-section" aria-labelledby="film-title" data-nav-theme="dark">
      <h2 id="film-title" className="sr-only">Learning from human work</h2>
      <div className="film-frame">
        <AmbientVideo
          className="film-media"
          poster="/assets/learning-from-human-work-film-poster.jpg"
          sources={[
            { src: '/media/learning-from-human-work-film.webm', type: 'video/webm' },
          ]}
        />
        <div className="film-vignette" />
      </div>
    </section>
  )
}

function ReadySection() {
  return (
    <section className="ready-section" id="ready" data-nav-theme="dark">
      <div className="ready-layout">
        <div className="ready-intro">
          <h2>Learning from Human Work.</h2>
          <p>We are building a new data and training regime from real, long-horizon human computer work.</p>
        </div>
        <div className="ready-stack">
          {readyCards.map((card, index) => (
            <article className="ready-stage" key={card.title} style={{ zIndex: index + 1 }}>
              <div className="ready-plate">
                <img src={card.image} alt="" loading="lazy" />
                <div className="ready-card">
                  <h3>{card.title}</h3>
                  <div className="ready-card-body">
                    <ul>{card.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                    <p>{card.body}</p>
                  </div>
                  <div className="ready-card-actions">
                    <div className="ready-links">
                      {card.links.map((link) => <a href={link.href} key={link.label}><ArrowRight size={14} />{link.label}</a>)}
                    </div>
                    <a className="button button--primary" href={card.ctaHref}>{card.cta}<ArrowRight size={16} /></a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsCard({ item }) {
  const external = /^https?:\/\//.test(item.href)

  return (
    <a
      className="news-card"
      href={item.href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <span className="news-media"><img src={item.image} alt="" loading="lazy" /></span>
      <span className="news-content">
        <strong>{item.title}</strong>
        {item.subtitle && <span>{item.subtitle}</span>}
        <span className="read-more">Read release <ArrowRight size={16} /></span>
      </span>
    </a>
  )
}

function NewsSection() {
  return (
    <section className="news-section" id="news" data-nav-theme="light">
      <div className="section-heading-row">
        <h2>Research and releases</h2>
        <ArrowLink href="/research/">Explore all research</ArrowLink>
      </div>
      <div className="news-grid">
        {announcements.map((item) => <NewsCard item={item} key={item.title} />)}
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section className="closing-cta" data-nav-theme="light">
      <PdoomBrand className="closing-mark" markOnly />
      <h2>Work with us.</h2>
      <div>
        <a className="button button--primary" href="/careers/">Careers <ArrowRight size={17} /></a>
        <a className="button button--outline" href="/research/">Read research</a>
      </div>
    </section>
  )
}

function Footer() {
  const footerRef = useRef(null)
  const backdropRef = useRef(null)

  useEffect(() => {
    const footer = footerRef.current
    const backdrop = backdropRef.current
    if (!footer || !backdrop || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const rect = footer.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)))
      backdrop.style.transform = `translate3d(0, ${-36 + progress * 36}px, 0) scale(1.08)`
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <footer ref={footerRef} className="site-footer" data-nav-theme="light">
      <img ref={backdropRef} className="footer-backdrop" src="/assets/footer-delta.webp" alt="" aria-hidden="true" />
      <div className="footer-wordmark"><PdoomBrand large /></div>
      <div className="footer-groups">
        {footerGroups.map(([heading, links]) => (
          <div className="footer-group" key={heading}>
            <h3>{heading}</h3>
            {links.map((link) => <a href={link.href} key={link.label}>{link.label}</a>)}
          </div>
        ))}
        <div className="footer-legal">
          <h3>Legal</h3>
          <div>
            <a href="/imprint/">IMPRINT</a>
            <a href="/docs/crowd-cast-data-purchase-agreement.pdf">DATA PURCHASE AGREEMENT</a>
            <a href="/docs/crowd-cast-privacy-consent.pdf">PRIVACY CONSENT</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>©2026 P(DOOM).</span>
        <div className="social-links">
          <a href="https://x.com/prob_doom" aria-label="X"><span aria-hidden="true">X</span></a>
          <a href="https://github.com/p-doom" aria-label="GitHub"><span aria-hidden="true">GH</span></a>
          <a href="https://huggingface.co/p-doom" aria-label="Hugging Face"><span aria-hidden="true">HF</span></a>
          <a href="https://www.linkedin.com/company/p-doom" aria-label="LinkedIn"><span aria-hidden="true">in</span></a>
        </div>
        <span>ALL RIGHTS RESERVED.</span>
      </div>
    </footer>
  )
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const legacyPath = path.slice(1)
  const researchPostMatch = path.match(/^\/(?:research|blog)\/([^/]+)$/)
  let interiorPage = null

  if (isParticipationShortlink(window.location.pathname)) {
    return <ParticipationRedirect />
  }

  if (path === '/onboard') {
    return <OnboardingRedirect />
  }

  const legacyRoute = legacyResearchRoutes[legacyPath] || {
    'about.html': '/about/',
    'blog.html': '/research/',
    'imprint.html': '/imprint/',
    'open_calls.html': '/careers/',
    'research.html': '/research/',
    'supply.html': '/merch/',
  }[legacyPath]

  if (legacyRoute) {
    return <RouteRedirect href={legacyRoute} />
  }

  if (path === '/about') interiorPage = <AboutPage />
  if (path === '/research' || path === '/blog') interiorPage = <BlogIndexPage />
  if (researchPostMatch) interiorPage = <BlogPostPage slug={researchPostMatch[1]} />
  if (path === '/careers' || path.startsWith('/careers/') || path.startsWith('/open_calls/')) interiorPage = <CareersPage />
  if (path === '/imprint') interiorPage = <ImprintPage />
  if (path === '/merch') interiorPage = <MerchPage />

  if (interiorPage) {
    const archiveFooter = path === '/research' || path === '/blog'

    return (
      <>
        <a className="skip-link" href="#main">Skip to content</a>
        <AnnouncementBar />
        <Header />
        {interiorPage}
        <div className={`footer-canvas ${archiveFooter ? 'footer-canvas--archive' : ''}`}>
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main">
        <div className="dark-page">
          <Hero />
          <MediaConsole />
          <FilmSection />
          <ReadySection />
        </div>
        <NewsSection />
        <ClosingCta />
        <Footer />
      </main>
    </>
  )
}

export default App
