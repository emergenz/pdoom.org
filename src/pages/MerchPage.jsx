import { useEffect, useState } from 'react'
import './merch.css'

const products = [
  {
    id: 'meta-learner',
    name: 'Meta-learner',
    type: 'T-shirt',
    images: [
      { src: '/merch/shirt1-front.webp', label: 'Front' },
      { src: '/merch/shirt1-back.webp', label: 'Back' },
      { src: '/merch/shirt1-combo.webp', label: 'Front + back' },
    ],
  },
  {
    id: 'fixed-size-state',
    name: 'Fixed-size state',
    type: 'T-shirt',
    images: [
      { src: '/merch/shirt2-front.webp', label: 'Front' },
      { src: '/merch/shirt2-back.webp', label: 'Back' },
      { src: '/merch/shirt2-combo.webp', label: 'Front + back' },
    ],
  },
  {
    id: 'corduroy-hat',
    name: 'Corduroy Hat',
    type: 'Cap',
    images: [
      { src: '/merch/hat-side.webp', label: 'Side' },
      { src: '/merch/hat-front.webp', label: 'Front' },
      { src: '/merch/hat-back.webp', label: 'Back' },
      { src: '/merch/hat-detail.webp', label: 'Detail' },
    ],
  },
  {
    id: 'ribbed-beanie',
    name: 'Ribbed Beanie',
    type: 'Beanie',
    images: [
      { src: '/merch/beanie-front.webp', label: 'Front' },
      { src: '/merch/beanie-detail.webp', label: 'Detail' },
    ],
  },
]

function ProductEntry({ product, index }) {
  const [activeView, setActiveView] = useState(0)
  const image = product.images[activeView]

  return (
    <article className="merch-product" id={product.id}>
      <figure className="merch-product-media">
        <img
          src={image.src}
          alt={`${product.name}, ${image.label.toLowerCase()} view`}
          decoding="async"
          height="1200"
          loading={index === 0 ? 'eager' : 'lazy'}
          width="1200"
        />
      </figure>

      <div className="merch-product-copy">
        <div className="merch-product-title">
          <div>
            <p className="merch-product-type">{product.type}</p>
            <h2>{product.name}</h2>
          </div>
        </div>

        <div className="merch-view-group">
          <span className="merch-view-label">View</span>
          <div className="merch-view-list" role="group" aria-label={`${product.name} views`}>
            {product.images.map((view, viewIndex) => (
              <button
                type="button"
                className={viewIndex === activeView ? 'is-active' : ''}
                aria-pressed={viewIndex === activeView}
                onClick={() => setActiveView(viewIndex)}
                key={view.label}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function MerchPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Merch | p(doom)'
    return () => { document.title = previousTitle }
  }, [])

  const productRows = Array.from(
    { length: Math.ceil(products.length / 2) },
    (_, rowIndex) => products.slice(rowIndex * 2, rowIndex * 2 + 2),
  )

  return (
    <main className="merch-page" id="main" data-nav-theme="light">
      <header className="merch-intro" data-nav-theme="light">
        <div className="merch-shell">
          <h1>Merch</h1>
        </div>
      </header>

      <section className="merch-catalog" data-nav-theme="light" aria-label="Merch catalog">
        <div className="merch-shell merch-product-grid">
          {productRows.map((row, rowIndex) => (
            <div className="merch-product-row" key={row.map((product) => product.id).join('-')}>
              {row.map((product, columnIndex) => (
                <ProductEntry
                  product={product}
                  index={(rowIndex * 2) + columnIndex}
                  key={product.id}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
