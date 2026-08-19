import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import './careers.css'

const signUpHref = 'https://docs.google.com/forms/d/e/1FAIpQLSd50ZarNRKoIWDmy5xAn8K8FVGM2Jbk1T52er4YLHiP2P28rQ/viewform'
const emailApplicationLabel = 'franz@pdoom.org'
const emailApplicationNote = 'Five bullet points demonstrating exceptional ability.'

const opportunities = [
  {
    id: 'paid-data-collection',
    legacyId: '04_crowd_cast',
    number: '01',
    category: 'Participation',
    title: 'Get paid to record your work',
    summary: 'Join the crowd-cast data collection. Record approved long-horizon work and earn $300 per month while active.',
    meta: ['Remote', '$300 / month'],
    facts: [
      ['Mode', 'Remote'],
      ['Pay', '$300 / month'],
    ],
    intro: [
      <>p(doom) is working towards enabling models to perform complex tasks over weeks and months. Training on work at that horizon requires data at that horizon.</>,
      <>crowd-cast is a privacy-preserving desktop application built to capture the largest long-horizon dataset of digital work. Together, the p(doom) team and early participants have already recorded more than 5,000 hours of work.</>,
      <>The program is now open to the public. Accepted participants are compensated <strong>$300 per month</strong> for passively recording eligible work.</>,
      <>Research, engineering, design, editing, academic projects, and other long-horizon computer work can qualify. Submit the form and the team will follow up.</>,
    ],
    sections: [
      {
        title: 'How it works',
        ordered: true,
        items: [
          <>Apply through the <a href={signUpHref} target="_blank" rel="noreferrer">signup form</a>.</>,
          <>If accepted, install <a href="https://github.com/p-doom/crowd-cast/releases" target="_blank" rel="noreferrer">crowd-cast</a> on macOS, Windows, or Linux.</>,
          <>On first launch, choose which applications can be recorded. Everything outside that list is automatically excluded.</>,
          <>The recorder captures five-minute segments and uploads them to a private S3 bucket. At the end of each segment, its local copy is deleted.</>,
        ],
      },
      {
        title: 'Privacy and trust',
        paragraphs: [
          <>Choose exactly which applications can be captured. Private applications, pop-ups, and notifications are excluded (guaranteed at OS-level), and recording can be started or stopped at any time. Only record work that you have the right to share; confidential employer or client material does not qualify.</>,
          <>The recorder is <a href="https://github.com/p-doom/crowd-cast" target="_blank" rel="noreferrer">open source</a>. You can review the <a href="/docs/crowd-cast-data-purchase-agreement.pdf">Data Purchase Agreement</a> and <a href="/docs/crowd-cast-privacy-consent.pdf">Privacy and Recording Consent</a> before applying. p(doom) is funded by <a href="https://www.sprind.org" target="_blank" rel="noreferrer">SPRIND</a>, the German Federal Agency for Breakthrough Innovation.</>,
        ],
      },
    ],
    applyLabel: 'Sign up',
    applyHref: signUpHref,
    externalApply: true,
    applyNote: 'The signup form asks about the work you would record and the applications involved.',
  },
  {
    id: 'fixed-size-state',
    legacyId: '02_fixed_size_state',
    number: '02',
    category: 'Research',
    title: 'Member of Technical Staff, Fixed-size state',
    summary: 'Develop and test fixed-size state architectures for learning across trajectories that span weeks or months.',
    meta: [],
    facts: [
      ['Location', 'Munich'],
      ['Commitment', 'Full-time'],
      ['Mode', 'In-person'],
    ],
    intro: [
      <>We train on trajectories that can span weeks or months. Dense attention makes those horizons infeasible, and context compression is not enough for reliable memory.</>,
      <>This role develops fixed-size state architectures for models trained on long-horizon computer-use trajectories.</>,
    ],
    sections: [
      {
        title: "What you'll do",
        items: [
          'Run architecture ablations.',
          'Test scaling behavior.',
          'Study failure modes such as state collapse and loss of long-range dependencies.',
          'Publish the results.',
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
    summary: 'Build the data pipeline for long-horizon computer-use traces, from capture and redaction to enrichment and release.',
    meta: [],
    facts: [
      ['Location', 'Munich'],
      ['Commitment', 'Full-time'],
      ['Mode', 'In-person'],
    ],
    intro: [
      <>p(doom) collects long-horizon computer-use data through <a href="/docs/crowd-cast/">crowd-cast</a>. The dataset includes more than 2,600 hours from over 35 rights-cleared contributors.</>,
      <>You will work across the native desktop app, backend, enrichment models, and privacy-preserving workflows. The work requires production engineering and research taste.</>,
    ],
    sections: [
      {
        title: "What you'll do",
        items: [
          'Desktop capture and storage.',
          'Automated PII and credential redaction.',
          'Action annotation.',
          'Model-based hindsight goals and synthetic thinking traces.',
        ],
      },
    ],
    applyLabel: emailApplicationLabel,
    applyHref: 'mailto:franz@pdoom.org?subject=Long-horizon%20data',
    applyNote: emailApplicationNote,
  },
  {
    id: 'mid-training',
    legacyId: '07_midtrain',
    number: '04',
    category: 'Research',
    title: 'Member of Technical Staff, Mid-training',
    summary: 'Adapt instruction-tuned models to human computer-use trajectories and produce initializations for downstream RL.',
    meta: [],
    facts: [
      ['Location', 'Munich'],
      ['Commitment', 'Full-time'],
      ['Mode', 'In-person'],
    ],
    intro: [
      <>Instruction-tuned models are not directly suited to raw computer-use trajectories. Mid-training adapts the base model to our data before downstream RL.</>,
      <>You will design the SFT corpus, maintain the training recipe, build the eval loop, and decide when an initialization is ready for downstream training.</>,
    ],
    sections: [
      {
        title: "What you'll do",
        items: [
          'Domain adaptation to human screencasts.',
          'Supervised fine-tuning on hindsight-enriched trajectories.',
          'Catastrophic-forgetting mitigation.',
          'Optimizer choices and data mixtures.',
        ],
      },
    ],
    applyLabel: emailApplicationLabel,
    applyHref: 'mailto:franz@pdoom.org?subject=Mid-training',
    applyNote: emailApplicationNote,
  },
  {
    id: 'reinforcement-learning',
    legacyId: '06_rl',
    number: '05',
    category: 'Research',
    title: 'Member of Technical Staff, RL',
    summary: 'Build the RL training stack for long-horizon computer-use tasks, including environments, algorithms, evals, and stability.',
    meta: [],
    facts: [
      ['Location', 'Munich'],
      ['Commitment', 'Full-time'],
      ['Mode', 'In-person'],
    ],
    intro: [
      <>We use RL on computer-use tasks to train models for long-horizon work. The interface is streaming visual observation and low-level actions. Rewards come from task completion or rubric-based generative reward models.</>,
      <>You will design training procedures, build evals for failure modes, run experiments, and publish the results.</>,
    ],
    sections: [
      {
        title: "What you'll do",
        items: [
          'Training infrastructure.',
          'Environment selection.',
          'Algorithms and capability retention.',
          'Evals and stability at long horizons.',
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
      <>Residents work with members of technical staff on a focused research or engineering project. Projects may cover data, mid-training, reinforcement learning, fixed-size state, or a proposal you bring.</>,
      <>No academic pedigree is required. We evaluate technical depth, research taste, and evidence that you can make progress on hard problems.</>,
    ],
    sections: [
      {
        title: 'How it works',
        ordered: true,
        items: [
          'Work with a member of technical staff on a defined project. Suggested projects and independent proposals are both welcome.',
          'Receive compute, mentorship, and publication freedom by default. Codebases are open-sourced and datasets released under CC0 where possible.',
          'Residents may be considered for full-time Member of Technical Staff roles.',
        ],
      },
      {
        title: 'What we offer',
        items: [
          'Access to millions of GPU hours for approved projects.',
          'Direct mentorship from the team.',
          'Publication freedom by default.',
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
    ids: ['fixed-size-state', 'long-horizon-data', 'mid-training', 'reinforcement-learning'],
  },
  {
    label: 'Programs and participation',
    ids: ['paid-data-collection', 'residency'],
  },
]

const legacyAliases = Object.fromEntries(opportunities.map((item) => [item.legacyId, item.id]))

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
          <p>Join p(doom) to address the fundamental bottlenecks toward AGI: new data, long horizons, fixed-sized state, and continual learning.</p>
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
          <span className="careers-kicker">At a glance</span>
          <dl>
            {opportunity.facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {opportunity.id === 'paid-data-collection' && (
            <a
              className="career-apply-link career-facts-apply"
              href={opportunity.applyHref}
              target="_blank"
              rel="noreferrer"
            >
              {opportunity.applyLabel}
              <ArrowUpRight size={22} strokeWidth={1.6} aria-hidden="true" />
            </a>
          )}
        </aside>

        <div className="career-detail-content">
          <div className="career-detail-prose">
            {opportunity.intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {opportunity.sections.map((section) => (
            <DetailSection section={section} key={section.title} />
          ))}

          {opportunity.id !== 'paid-data-collection' && (
            <div className="career-inline-apply">
              <p>{opportunity.applyNote}</p>
              <a
                className="career-apply-link"
                href={opportunity.applyHref}
                {...(opportunity.externalApply ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {opportunity.applyLabel}
                {opportunity.externalApply
                  ? <ArrowUpRight size={22} strokeWidth={1.6} aria-hidden="true" />
                  : <ArrowRight size={22} strokeWidth={1.6} aria-hidden="true" />}
              </a>
            </div>
          )}
        </div>
      </article>
    </main>
  )
}

export default function CareersPage({ opportunityId }) {
  const resolvedId = opportunityId || currentOpportunityId()
  const opportunity = opportunities.find((item) => item.id === resolvedId)

  return opportunity ? <CareerDetail opportunity={opportunity} /> : <CareersOverview />
}
