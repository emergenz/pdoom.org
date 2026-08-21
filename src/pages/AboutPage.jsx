import { useEffect } from 'react'
import './about.css'

function AboutPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'About | p(doom)'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="about-page" id="main">
      <section className="about-thesis" data-nav-theme="light" aria-labelledby="about-thesis-title">
        <div className="about-thesis-grid">
          <h1 id="about-thesis-title">Scaling advances when new methods remove what blocks it.</h1>
          <p>
            Pretraining unlocked one direction to scale. As did self-play, RLHF and RLVR. We work on the scalable methods of the future: learning from real-world human behavior, continual improvement through deployment, architectures that carry memory forever.
          </p>
        </div>
      </section>

    </main>
  )
}

export default AboutPage
