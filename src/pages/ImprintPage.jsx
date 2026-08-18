import { useEffect } from 'react'
import './imprint.css'

const imprintFields = [
  {
    label: 'Company',
    value: 'pdoom UG (haftungsbeschränkt)',
  },
  {
    label: 'Registered address',
    value: (
      <>
        Volkartstr. 43<br />
        80636 Munich<br />
        Germany
      </>
    ),
  },
  {
    label: 'Commercial register',
    value: (
      <>
        Amtsgericht München<br />
        HRB 311706
      </>
    ),
  },
  {
    label: 'Managing directors',
    value: 'Franz Srambical',
  },
  {
    label: 'VAT ID (USt.-IdNr.)',
    value: 'DE461807443',
  },
  {
    label: 'Contact',
    value: <a href="mailto:franz@pdoom.org">franz@pdoom.org</a>,
  },
]

function ImprintPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Imprint | p(doom)'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="imprint-page" id="main" data-nav-theme="light">
      <header className="imprint-intro" aria-labelledby="imprint-title">
        <div className="imprint-shell">
          <h1 id="imprint-title">Imprint</h1>
        </div>
      </header>

      <section className="imprint-details" aria-label="Company information">
        <div className="imprint-shell">
          <dl className="imprint-fields">
            {imprintFields.map((field) => (
              <div className="imprint-field" key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  )
}

export default ImprintPage
