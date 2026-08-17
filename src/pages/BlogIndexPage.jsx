import { ArrowRight, ArrowUpRight } from 'lucide-react'
import {
  externalPublications,
  researchHref,
  researchPosts,
  researchReleases,
} from './blogData'
import './blog.css'

function ResearchMedia({ media, title }) {
  if (!media) return null

  if (media.type === 'video') {
    return (
      <video
        src={media.src}
        aria-label={`${title} preview`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    )
  }

  return <img src={media.src} alt="" loading="lazy" />
}

function ReleaseCard({ release }) {
  return (
    <a className="blog-release-card" href={researchHref(release)}>
      <figure className="blog-release-media">
        <ResearchMedia media={release.media} title={release.shortTitle} />
      </figure>
      <div className="blog-release-copy">
        <h2>{release.shortTitle}</h2>
        <p>{release.summary}</p>
        <span className="blog-card-link">
          Read release <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
        </span>
      </div>
    </a>
  )
}

function ArchiveRow({ item, external = false }) {
  return (
    <a
      className="blog-archive-row"
      href={external ? item.href : researchHref(item)}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <span className="blog-archive-date">{item.dateShort}</span>
      <span className="blog-archive-title">
        {item.title}
        {external && <small>{item.kind}</small>}
      </span>
      <span className="blog-archive-category">{item.category}</span>
      {external ? (
        <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
      ) : (
        <ArrowRight size={18} strokeWidth={1.7} aria-hidden="true" />
      )}
    </a>
  )
}

export default function BlogIndexPage() {
  return (
    <main className="blog-page blog-index-page" id="main" data-nav-theme="light">
      <section className="blog-index-hero" data-nav-theme="light">
        <div className="blog-index-title-row">
          <h1>Research</h1>
          <p>
            Models, datasets, infrastructure, and research notes from p(doom).
          </p>
        </div>
      </section>

      <section className="blog-release-section" aria-label="Releases">
        <div className="blog-release-grid">
          {researchReleases.map((release) => (
            <ReleaseCard release={release} key={release.slug} />
          ))}
        </div>
      </section>

      <section className="blog-archive-section" aria-labelledby="archive-heading">
        <header className="blog-archive-heading">
          <h2 id="archive-heading">Research notes and publications</h2>
        </header>

        <div className="blog-archive-list">
          {externalPublications.map((item) => (
            <ArchiveRow item={item} external key={item.href} />
          ))}
          {researchPosts.map((item) => (
            <ArchiveRow item={item} key={item.slug} />
          ))}
        </div>
      </section>
    </main>
  )
}
