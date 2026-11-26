import { useEffect } from 'react'
import './about.css'

function AboutSection({ title, children }) {
  return (
    <section className="about-section">
      <h2>{title}</h2>
      <div className="about-section-body">{children}</div>
    </section>
  )
}

function AboutPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'About | p(doom)'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="about-page" id="main">
      <header className="page-header" data-nav-theme="light" aria-labelledby="about-thesis-title">
        <div className="page-shell">
          <h1 id="about-thesis-title">Scaling advances when new methods remove what blocks it.</h1>
          <p>
            Pretraining unlocked one direction to scale. As did self-play, RLHF and RLVR. We work on the scalable methods of the future: learning from real-world human behavior, continual improvement through deployment, architectures that carry memory forever.
          </p>
        </div>
      </header>

      <div className="page-shell about-sections">
        <AboutSection title="Compute will keep scaling">
          <p>
            We expect compute to keep growing exponentially. The question we care about is what has to change for that compute to turn into capability on its own, without something else having to grow alongside it.
          </p>
        </AboutSection>

        <AboutSection title="Where compute alone stops helping">
          <p>
            Each way of scaling has depended on a supply that compute does not produce. Pretraining ran on text, which is finite. Reinforcement learning with verifiable rewards runs on environments, which are still written by hand, so its training signal grows with human effort rather than with compute.
          </p>
          <p>
            We go beyond handcrafted environments by capturing people as they work, day to day, over months.
          </p>
        </AboutSection>
      </div>
    </main>
  )
}

export default AboutPage
