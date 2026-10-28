import { useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { decorateFormLinks } from '../referral.js'
import './careers.css'

const signUpHref = '/apply.html'
const emailApplicationLabel = 'franz@pdoom.org'
const emailApplicationNote = 'To apply, send five bullet points demonstrating exceptional ability'

const opportunities = [
  {
    id: 'paid-data-collection',
    legacyId: '04_crowd_cast',
    number: '01',
    category: 'Participation',
    title: 'Get paid to record your work',
    summary: 'Join the crowd-cast data collection. We pay up to $1,000 per month for the months-long work we need most.',
    meta: ['Remote', 'up to $1,000 / month'],
    facts: [
      ['Mode', 'Remote'],
      ['Pay', 'up to $1,000 / month'],
    ],
    intro: [
      <>p(doom) is working towards enabling models to perform complex tasks over months. Training on work at that horizon requires data at that horizon.</>,
      <>crowd-cast is a privacy-preserving desktop application built to capture the largest dataset of months-long digital work. Together with early participants around the world, we have already recorded over 13,000 hours of complex theorem proving, spacecraft prototyping, model training across hundreds of GPUs, building design, and much more.</>,
      <>The program is now open to the public. We pay top participants <strong>up to $1,000 per month</strong> to passively record their work. PhD-level research, professional engineering, and other complex months-long projects qualify for the top tier.</>,
      <>Other qualifying months-long work (Bachelor's and Master's projects, design, editing, personal builds) is compensated at <strong>around $300 per month</strong>. Submit the form and the team will follow up within a few days.</>,
      <>Know someone who would be a great fit? You can refer them and earn up to $300 when they join. <a href="/refer.html">Get your referral link</a>.</>,
    ],
    sections: [
      {
        title: 'How it works',
        ordered: true,
        items: [
          <>Apply through the <a href={signUpHref}>signup form</a></>,
          <>If accepted, install <a href="/docs/crowd-cast/">crowd-cast</a> on macOS, Windows, or Linux</>,
          <>On first launch, choose which applications can be recorded. Everything outside that list is automatically excluded.</>,
          <>The recorder captures five-minute segments and uploads them to a private S3 bucket. At the end of each segment, its local copy is deleted.</>,
        ],
      },
      {
        title: 'Privacy and trust',
        paragraphs: [
          <>Choose exactly which applications can be captured. Private applications, pop-ups, and notifications are excluded (guaranteed at OS-level), and recording can be started or stopped at any time. Only record work that you have the right to share; confidential employer or client material does not qualify.</>,
          <>The recorder is <a href="https://github.com/p-doom/crowd-cast" target="_blank" rel="noreferrer">open source</a>. You can review the <a href="/docs/crowd-cast-data-purchase-agreement.pdf">Data Purchase Agreement</a> and <a href="/docs/crowd-cast-privacy-consent.pdf">Privacy and Recording Consent</a> before applying. p(doom) is funded by <a href="https://www.sprind.org" target="_blank" rel="noreferrer">SPRIN-D</a>, the German Federal Agency for Breakthrough Innovation.</>,
        ],
      },
    ],
    applyLabel: 'Apply to participate',
    applyHref: signUpHref,
    applyNote: 'The signup form asks about the work you would record and the applications involved.',
  },
  {
    id: 'fixed-size-state',
    legacyId: '02_fixed_size_state',
    number: '02',
    category: 'Research',
    title: 'Member of Technical Staff, Fixed-size state',
    summary: 'Develop and test fixed-size state architectures for learning across trajectories that span months.',
    meta: [],
    facts: [
      ['Location', 'Munich'],
      ['Commitment', 'Full-time'],
      ['Mode', 'In-person'],
    ],
    intro: [
      <>We train on trajectories that span months. Dense attention makes those horizons infeasible, and context compaction is not the long-term answer.</>,
      <>This role develops fixed-size state architectures to enable trillion-token rollouts.</>,
    ],
    sections: [
      {
        title: 'In this role, you will:',
        items: [
          'Come up with new fixed-size state architectures that support learning and deployment over months-long horizons',
          'Compare rigorously against the strongest versions of existing baselines',
          'Characterize failure modes such as state collapse and loss of long-range dependencies, and measure how they change with sequence length and scale',
          'Take the strongest candidates to trillion-token scale',
        ],
      },
      {
        title: 'You might thrive in this role if you:',
        items: [
          'Love being at the frontier of architecture research',
          'Have strong intuitions for how architectures behave at scale',
          'Are high-agency and own problems from start to finish',
        ],
      },
    ],
    applyLabel: emailApplicationLabel,
    applyHref: 'mailto:franz@pdoom.org?subject=Fixed-size%20state',
    applyNote: emailApplicationNote,
  },
  {
    id: 'long-horizon-data',
    legacyId: '03_data_and_systems',
    number: '03',
    category: 'Engineering and research',
    title: 'Member of Technical Staff, Long-horizon data',
    summary: 'Build the data pipeline for months-long screencasts, from capture and redaction to annotation and release.',
    meta: [],
    facts: [
      ['Location', 'Munich'],
      ['Commitment', 'Full-time'],
      ['Mode', 'In-person'],
    ],
    intro: [
      <>p(doom) collects months-long screencasts through <a href="/docs/crowd-cast/">crowd-cast</a>. The dataset includes over 13,000 hours from over 200 rights-cleared contributors, with task horizons of literal months, far beyond what current models can do.</>,
      <>The screencasts contain precisely what models cannot yet do. As models improve, the distribution of the dataset shifts with them.</>,
      <>You will work across the native desktop app, the backend, the recording-processing pipeline, and PII and redaction workflows. The work requires product and research taste.</>,
    ],
    sections: [
      {
        title: 'In this role, you will:',
        items: [
          'Build the capture and storage stack, from the native desktop app to the backend',
          'Develop automated PII and credential redaction',
          'Annotate screencasts at scale',
        ],
      },
      {
        title: 'You might thrive in this role if you:',
        items: [
          'Can ship products fast and still have research taste',
          'Care about getting PII and redaction right',
          'Are comfortable owning a system end to end, from desktop client to backend',
        ],
      },
    ],
    applyLabel: emailApplicationLabel,
    applyHref: 'mailto:franz@pdoom.org?subject=Long-horizon%20data',
    applyNote: emailApplicationNote,
  },
  {
    id: 'off-policy-learning',
    number: '04',
    category: 'Research',
    title: 'Member of Technical Staff, Off-policy learning',
    summary: 'Develop off-policy learning methods that extract more signal from months-long human screencasts than RL environments can.',
    meta: [],
    facts: [
      ['Location', 'Munich'],
      ['Commitment', 'Full-time'],
      ['Mode', 'In-person'],
    ],
    intro: [
      <>We extract RL environments from our dataset of months-long screencasts, but this captures only part of its signal: it is limited to tasks with verifiable outcomes.</>,
      <>Learning off-policy directly from the recordings can use far more of that signal, but people work on hundreds of things at the same time, which makes it hard. You will design novel training regimes that tackle these challenges, build evals for failure modes, run experiments, and publish the results.</>,
    ],
    sections: [
      {
        title: 'In this role, you will:',
        items: [
          'Come up with off-policy methods for learning from months-long human screencasts',
          'Prototype and evaluate them, including approaches that transform or rewrite the data',
          'Build evals for failure modes',
          'Show that these methods extract more signal than RL environments do',
        ],
      },
      {
        title: 'You might thrive in this role if you:',
        items: [
          'Love being at the frontier of machine learning research',
          'Think carefully about what signal a dataset contains and how to extract it',
          'Can navigate vast search spaces and take a contrarian research direction from 0 to 1',
        ],
      },
    ],
    applyLabel: emailApplicationLabel,
    applyHref: 'mailto:franz@pdoom.org?subject=Off-policy%20learning',
    applyNote: emailApplicationNote,
  },
  {
    id: 'reinforcement-learning',
    legacyId: '06_rl',
    number: '05',
    category: 'Research',
    title: 'Member of Technical Staff, RL',
    summary: 'Scalably extract RL environments from months-long screencasts, build the training stack, and show that training on them improves capabilities.',
    meta: [],
    facts: [
      ['Location', 'Munich'],
      ['Commitment', 'Full-time'],
      ['Mode', 'In-person'],
    ],
    intro: [
      <>We extract RL environments from months-long screencasts of human work, for both verifiable and non-verifiable tasks.</>,
      <>You will build the pipeline that does this at scale, write the training infrastructure and algorithms, and show that training on these environments improves model capabilities.</>,
    ],
    sections: [
      {
        title: 'In this role, you will:',
        items: [
          'Build pipelines that scalably extract RL environments from months-long screencasts',
          'Write the training infrastructure and algorithms',
          'Run experiments showing that training on these environments improves capabilities',
        ],
      },
      {
        title: 'You might thrive in this role if you:',
        items: [
          'Love being at the frontier of RL research',
          'Are comfortable building on large-scale RL infrastructure that is still immature in open source and changes almost daily',
          'Have the creativity and taste to extract useful environments, grounded in a deep understanding of how models fail',
        ],
      },
    ],
    applyLabel: emailApplicationLabel,
    applyHref: 'mailto:franz@pdoom.org?subject=RL',
    applyNote: emailApplicationNote,
  },
  {
    id: 'residency',
    legacyId: '05_residency',
    number: '06',
    category: 'Residency',
    title: 'p(doom) Residency',
    summary: 'A six-month research program for early-career researchers and engineers, with compute, mentorship, and publication freedom.',
    meta: ['Remote', '6 months', 'Rolling'],
    facts: [
      ['Location', 'Remote'],
      ['Term', '6 months'],
      ['Admission', 'Rolling'],
    ],
    intro: [
      <>The p(doom) Residency is a six-month research program for early-career researchers and engineers.</>,
      <>Residents work with members of technical staff on a focused research or engineering project. Projects may cover data, off-policy learning, reinforcement learning, fixed-size state, or a proposal you bring.</>,
      <>No academic pedigree is required. We evaluate technical depth, research taste, and evidence that you can make progress on hard problems.</>,
    ],
    sections: [
      {
        title: 'How it works',
        ordered: true,
        items: [
          'Work with a member of technical staff on a defined project. Suggested projects and independent proposals are both welcome.',
          'Receive compute, mentorship, and publication freedom by default. Codebases are open-sourced and datasets released under CC0 where possible.',
          'Residents may be considered for full-time Member of Technical Staff roles',
        ],
      },
      {
        title: 'What we offer',
        items: [
          'Access to millions of GPU hours for approved projects',
          'Direct mentorship from the team',
          'Publication freedom by default',
        ],
      },
    ],
    applyLabel: emailApplicationLabel,
    applyHref: 'mailto:franz@pdoom.org?subject=Residency',
    applyNote: emailApplicationNote,
  },
]

const overviewGroups = [
  {
    label: 'Research and engineering',
    ids: ['fixed-size-state', 'long-horizon-data', 'off-policy-learning', 'reinforcement-learning'],
  },
  {
    label: 'Programs and participation',
    ids: ['paid-data-collection', 'residency'],
  },
]

const legacyAliases = Object.fromEntries(opportunities.filter((item) => item.legacyId).map((item) => [item.legacyId, item.id]))

function currentOpportunityId() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const lastPart = (parts.at(-1) || '').replace(/\.html$/, '')

  if (parts[0] === 'careers' && parts.length > 1) return lastPart
  if (parts[0] === 'open_calls' && lastPart) return legacyAliases[lastPart] || lastPart
  return null
}

function OpportunityRow({ opportunity }) {
  return (
    <a className="career-row" href={`/careers/${opportunity.id}/`}>
      <strong className="career-row-title">{opportunity.title}</strong>
      <span className="career-row-summary">{opportunity.summary}</span>
      <ArrowRight className="career-row-arrow" size={22} strokeWidth={1.6} aria-hidden="true" />
    </a>
  )
}

function CareersOverview() {
  return (
    <main className="careers-page" id="main" data-nav-theme="light">
      <header className="careers-intro">
        <div className="careers-shell careers-intro-grid">
          <h1>Work on what compute cannot solve.</h1>
          <p>Join p(doom) to address the fundamental bottlenecks toward AGI: new data, months-long horizons, fixed-size state, and continual learning.</p>
        </div>
      </header>

      <div className="careers-shell careers-directory">
        {overviewGroups.map((group) => (
          <section className="career-group" aria-labelledby={`career-group-${group.label.replaceAll(' ', '-')}`} key={group.label}>
            <header className="career-group-heading">
              <h2 id={`career-group-${group.label.replaceAll(' ', '-')}`}>{group.label}</h2>
            </header>
            <div className="career-list">
              {group.ids.map((id) => (
                <OpportunityRow opportunity={opportunities.find((item) => item.id === id)} key={id} />
              ))}
            </div>
          </section>
        ))}

      </div>
    </main>
  )
}

function DetailSection({ section }) {
  const List = section.ordered ? 'ol' : 'ul'

  return (
    <section className="career-detail-section">
      <header>
        <h2>{section.title}</h2>
      </header>
      {section.paragraphs && (
        <div className="career-detail-prose career-detail-prose--section">
          {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      )}
      {section.items && (
        <List className={`career-detail-list ${section.ordered ? 'career-detail-list--ordered' : ''}`}>
          {section.items.map((item, index) => (
            <li key={index}>
              <p>{item}</p>
            </li>
          ))}
        </List>
      )}
    </section>
  )
}

function CareerDetail({ opportunity }) {
  return (
    <main className="career-detail-page" id="main" data-nav-theme="light">
      <header className="career-detail-hero">
        <div className="careers-shell">
          <a className="career-back-link" href="/careers/">
            <ArrowLeft size={17} strokeWidth={1.7} aria-hidden="true" />
            All roles
          </a>
          <div className="career-detail-heading">
            <div className="career-detail-title">
              <h1>{opportunity.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <article className="careers-shell career-detail-layout">
        <aside className="career-facts" aria-label="At a glance">
          <h2>At a glance</h2>
          <dl>
            {opportunity.facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <a
            className="button button--primary career-facts-apply"
            href={opportunity.applyHref}
            {...(opportunity.id === 'paid-data-collection' ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {opportunity.id === 'paid-data-collection' ? opportunity.applyLabel : 'Apply'}
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </a>
          {opportunity.id !== 'paid-data-collection' && (
            <p className="career-facts-note">
              {opportunity.applyNote} to <a href={opportunity.applyHref}>{opportunity.applyLabel}</a>.
            </p>
          )}
        </aside>

        <div className="career-detail-content">
          <div className={`career-detail-prose ${opportunity.id === 'paid-data-collection' ? '' : 'career-detail-prose--lead'}`}>
            {opportunity.intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {opportunity.sections.map((section) => (
            <DetailSection section={section} key={section.title} />
          ))}

        </div>
      </article>
    </main>
  )
}

export default function CareersPage({ opportunityId }) {
  const resolvedId = opportunityId || currentOpportunityId()
  const opportunity = opportunities.find((item) => item.id === resolvedId)

  // If the visitor arrived from a partner, stamp their referral onto every
  // signup-form link on the page, whichever CTA they end up clicking.
  useEffect(() => {
    try {
      decorateFormLinks()
    } catch {
      /* attribution is best-effort; never break the page */
    }
  }, [resolvedId])

  return opportunity ? <CareerDetail opportunity={opportunity} /> : <CareersOverview />
}
