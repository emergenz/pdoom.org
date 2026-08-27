// Partner referral attribution.
//
// A partner (podcast, newsletter) sends people to pdoom.org/participate?ref=<slug>.
// The visitor lands on the paid-data-collection page, reads it, and only then
// clicks through to the signup form. Attribution therefore has to survive that
// hop, so the slug is remembered and stamped onto every link to the form as a
// prefilled "How did you hear about us?" answer, which the vetting pipeline
// parses back out as ref:<slug>.

const REF_KEY = 'cc_ref'
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000 // a month: people read now, apply later
const SLUG_RE = /^[a-z0-9][a-z0-9_-]{1,38}$/
const FORM_HOST = 'docs.google.com/forms'
const HEAR_ENTRY = 'entry.1186763823' // "How did you hear about us?"
const COUNT_ENDPOINT = 'https://ob3iugfiy2.execute-api.us-east-1.amazonaws.com/v1/r/'

function readStored() {
  try {
    const raw = window.localStorage.getItem(REF_KEY)
    if (!raw) return null
    const { slug, name, ts, counted } = JSON.parse(raw)
    if (!slug || !SLUG_RE.test(slug)) return null
    if (!ts || Date.now() - ts > REF_TTL_MS) return null
    return { slug, name: name || slug, counted: Boolean(counted) }
  } catch {
    return null // private mode, blocked storage: attribution degrades, page still works
  }
}

/**
 * Read ?ref= from the current URL, remember it, and count the click once.
 * Safe to call on every page load.
 */
export function captureReferral() {
  let slug = null
  try {
    slug = new URLSearchParams(window.location.search).get('ref')
  } catch {
    return readStored()
  }
  if (!slug) return readStored()

  slug = String(slug).toLowerCase()
  if (!SLUG_RE.test(slug)) return readStored()

  const stored = readStored()
  const sameSlug = stored && stored.slug === slug
  // Count a click once per slug. Resolve the display name whenever it is still
  // missing: the first attempt is usually made on /participate, which redirects
  // onward before the response lands.
  const shouldCount = !sameSlug || !stored.counted
  const needsName = !sameSlug || !stored.name || stored.name === slug
  try {
    window.localStorage.setItem(REF_KEY, JSON.stringify({
      slug,
      name: sameSlug ? stored.name : undefined,
      counted: sameSlug ? stored.counted : false,
      ts: Date.now(),
    }))
  } catch {
    /* attribution falls back to the URL param for this visit */
  }
  // Count the click and learn the partner's display name, so the prefilled
  // answer reads the same as it would via the direct link. Fire-and-forget:
  // attribution already works from the slug alone if this never resolves.
  if (shouldCount || needsName) {
    const q = shouldCount ? '?count=1' : '?info=1&count=0'
    try {
      // keepalive: the request must survive the redirect off /participate, or
      // the click is never counted.
      fetch(`${COUNT_ENDPOINT}${encodeURIComponent(slug)}${q}`, { cache: 'no-store', keepalive: true })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          try {
            window.localStorage.setItem(REF_KEY, JSON.stringify({
              slug,
              name: (data && data.name) || (stored && stored.name) || undefined,
              counted: shouldCount || Boolean(stored && stored.counted),
              ts: Date.now(),
            }))
          } catch {
            /* ignore */
          }
          if (data && data.name) decorateFormLinks() // restamp with the real name
        })
        .catch(() => {})
    } catch {
      /* counting is best-effort */
    }
  }
  return { slug, name: (stored && stored.name) || slug }
}

/** The referral in effect right now: this visit's ?ref=, else a remembered one. */
export function activeReferral() {
  const stored = readStored()
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('ref')
    if (fromUrl) {
      const slug = String(fromUrl).toLowerCase()
      if (SLUG_RE.test(slug)) {
        // This visit's slug wins, but keep the cached display name if it matches.
        return { slug, name: stored && stored.slug === slug ? stored.name : slug }
      }
    }
  } catch {
    /* fall through to storage */
  }
  return stored
}

/** Append ?ref= to an internal path, so the slug survives an in-site redirect. */
export function withReferral(path) {
  const ref = activeReferral()
  if (!ref) return path
  return path + (path.includes('?') ? '&' : '?') + 'ref=' + encodeURIComponent(ref.slug)
}

/**
 * Stamp the referral onto every link to the signup form on the page.
 * Called after render, so it covers each CTA without every link having to know
 * about referrals. Idempotent.
 */
export function decorateFormLinks(root) {
  const ref = activeReferral()
  if (!ref) return 0
  const scope = root || document
  let n = 0
  scope.querySelectorAll('a[href]').forEach((a) => {
    // Rebuild from the pristine href each time, so a later restamp (once the
    // partner's display name arrives) replaces rather than doubles the param.
    let base = a.getAttribute('data-form-href')
    if (!base) {
      base = a.getAttribute('href') || ''
      if (!base.includes(FORM_HOST)) return
      a.setAttribute('data-form-href', base)
    }
    const answer = `${ref.name || ref.slug} (ref:${ref.slug})`
    const sep = base.includes('?') ? '&' : '?'
    a.setAttribute('href', `${base}${sep}usp=pp_url&${HEAR_ENTRY}=${encodeURIComponent(answer)}`)
    n += 1
  })
  return n
}
