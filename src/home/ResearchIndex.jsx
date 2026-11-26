import { ArrowRight } from 'lucide-react'
import TitleEnd from '../pages/TitleEnd.jsx'
import ResearchArt from './ResearchArt.jsx'
import './home.css'
import './research-index.css'

// Everything we work on, one card per area. Published work links to its post;
// open problems are listed as "In progress" without a link, and never state
// unpublished results.
const areas = [
  {
    id: 'data',
    art: { seed: 4 },
    title: 'Data',
    items: [
      { text: 'Auto-extracting RL environments from months-long recordings', open: true },
      { text: 'Recovering keyboard and mouse actions from any screen recording', href: '/research/inverse-dynamics-model/' },
      { text: 'Crowd-sourcing months of action-annotated computer work', href: '/research/crowd-cast/' },
    ],
  },
  {
    id: 'infrastructure',
    art: { seed: 11 },
    title: 'Infrastructure',
    items: [
      { text: 'A highly efficient JAX codebase for training vision-language models', href: 'https://github.com/p-doom/omegalax' },
      { text: 'A highly scalable JAX codebase for world modeling', href: '/research/jasmine/' },
    ],
  },
  {
    id: 'architecture',
    art: { seed: 23 },
    title: 'Architecture',
    items: [
      { text: 'A fixed-size latent state for tasks that span months', open: true },
      { text: 'Going beyond the causal mask in language modeling', href: '/research/beyond-the-causal-mask/' },
    ],
  },
  {
    id: 'training',
    art: { seed: 37 },
    title: 'Training',
    items: [
      { text: 'Learning off-policy from months of recordings', open: true },
      { text: 'RL on environments auto-extracted from our recordings', open: true },
      { text: 'Model-based credit assignment over months', open: true },
    ],
  },
]

export default function ResearchIndex() {
  return (
    <section className="home-research research-index" id="research" aria-labelledby="research-index-title" data-nav-theme="light">
      <div className="research-index-head">
        <h2 id="research-index-title">From human experience to model capability.</h2>
        <a className="scaling-more" href="/research/">
          <TitleEnd text="All research">
            <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </TitleEnd>
        </a>
      </div>

      <div className="research-route" aria-hidden="true" />

      <ol className="research-index-grid">
        {areas.map((area) => (
          <li className={`research-card research-card--${area.id}`} key={area.id}>
            <div className="research-card-figure">
              <ResearchArt {...area.art} />
            </div>
            <h3 id={`area-${area.id}`}>{area.title}</h3>
            <ul aria-labelledby={`area-${area.id}`}>
              {area.items.map((item) => (
                <li key={item.text}>
                  {item.open ? (
                    <span className="research-card-open">
                      <span>{item.text}</span>
                      <em>In progress</em>
                    </span>
                  ) : (
                    <a href={item.href}>
                      <span>{item.text}</span>
                      <ArrowRight size={16} strokeWidth={1.7} aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
