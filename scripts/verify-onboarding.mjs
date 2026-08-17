/* global Buffer, WebSocket, console, fetch, process, setTimeout */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'

const baseUrl = process.argv[2] || 'http://127.0.0.1:5175'
const cdpPort = process.env.CDP_PORT || '9233'
const apiBase = 'https://ob3iugfiy2.execute-api.us-east-1.amazonaws.com/v1'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function verifyStaticParity() {
  const html = readFileSync('public/onboard.html', 'utf8')
  const section = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)))
  assert(sha256(section('<div class="agreement-box" id="agreement-1">', '</div>\n\n                <div style="margin-bottom: var(--s-4);">')) === 'cd2d6e36c4b6d20d684970788ba890370b76e761583a9ebddaae2a125901bf15', 'Data Purchase Agreement copy changed')
  const privacyStart = '<div class="agreement-box" id="agreement-2">'
  assert(sha256(html.slice(html.indexOf(privacyStart), html.indexOf('</div>\n\n                <div style="margin-bottom: var(--s-4);">', html.indexOf(privacyStart)))) === '9ccd9c238c9d6c37c48c00632067b1dd2663aa14c14a49ba317ea501f3697b01', 'Privacy Consent copy changed')
  assert(sha256(section('    <script>', '    </script>')) === '9f38918df0459f7da74d25c6a5fa7c3e312e2ce9b91d31e128ebf2d507335cdb', 'Legacy API, validation, or payload logic changed')
  assert(sha256(readFileSync('public/docs/crowd-cast-data-purchase-agreement.pdf')) === '361287df9b49fd60c073600b8b3fdf70b53fab73e4f65b48cbca9f6d107405d0', 'Data Purchase Agreement PDF changed')
  assert(sha256(readFileSync('public/docs/crowd-cast-privacy-consent.pdf')) === 'c306db0695c0d6ff13d8c50378b2974d5a0cc0b13c8684b3f1595832c86393c7', 'Privacy Consent PDF changed')
}

class CdpClient {
  constructor(url) {
    this.url = url
    this.id = 0
    this.pending = new Map()
    this.listeners = new Map()
  }

  async connect() {
    this.socket = new WebSocket(this.url)
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })
    this.socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data)
      if (message.id) {
        const pending = this.pending.get(message.id)
        if (!pending) return
        this.pending.delete(message.id)
        if (message.error) pending.reject(new Error(message.error.message))
        else pending.resolve(message.result)
        return
      }
      for (const listener of this.listeners.get(message.method) || []) {
        listener(message.params)
      }
    })
  }

  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || []
    listeners.push(listener)
    this.listeners.set(method, listeners)
  }

  close() {
    this.socket.close()
  }
}

async function createPage({ width = 1440, height = 1000, validate, submissions = [] } = {}) {
  const target = await (await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: 'PUT' })).json()
  const client = new CdpClient(target.webSocketDebuggerUrl)
  await client.connect()
  const requests = []
  const dialogs = []
  let submissionIndex = 0

  client.on('Page.javascriptDialogOpening', ({ message }) => {
    dialogs.push(message)
    client.send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {})
  })

  client.on('Fetch.requestPaused', async ({ requestId, request }) => {
    requests.push({ url: request.url, method: request.method, postData: request.postData })
    if (request.method === 'OPTIONS') {
      await client.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 204,
        responseHeaders: [
          { name: 'Access-Control-Allow-Origin', value: '*' },
          { name: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { name: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      })
      return
    }
    let response = { status: 500, body: { error: 'Unconfigured mock' } }
    if (request.url === `${apiBase}/onboard/validate-token`) {
      response = validate || { status: 200, body: { valid: true, email: 'invitee@example.com' } }
    } else if (request.url === `${apiBase}/onboard/submit`) {
      response = submissions[Math.min(submissionIndex, submissions.length - 1)] || { status: 200, body: { ok: true } }
      submissionIndex += 1
    }
    if (response.delay) await delay(response.delay)
    if (response.fail) {
      await client.send('Fetch.failRequest', { requestId, errorReason: 'Failed' })
      return
    }
    await client.send('Fetch.fulfillRequest', {
      requestId,
      responseCode: response.status,
      responseHeaders: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: '*' },
      ],
      body: Buffer.from(JSON.stringify(response.body)).toString('base64'),
    })
  })

  await Promise.all([
    client.send('Page.enable'),
    client.send('Runtime.enable'),
    client.send('Fetch.enable', { patterns: [{ urlPattern: `${apiBase}/*`, requestStage: 'Request' }] }),
    client.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 }),
  ])

  const evaluate = async (expression) => {
    const result = await client.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result.value
  }

  const waitFor = async (expression, timeout = 5000) => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (await evaluate(expression)) return
      await delay(30)
    }
    throw new Error(`Timed out waiting for: ${expression}`)
  }

  const navigate = async (path) => {
    await client.send('Page.navigate', { url: `${baseUrl}${path}` })
    await waitFor(`document.readyState === 'complete'`)
  }

  const screenshot = async (path) => {
    const { data } = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(path, Buffer.from(data, 'base64'))
  }

  return { client, dialogs, evaluate, navigate, requests, screenshot, waitFor }
}

async function testTokenState({ reason, expected }) {
  const page = await createPage({ validate: { status: 200, body: { valid: false, reason } } })
  await page.navigate(`/onboard.html?token=${encodeURIComponent(reason || 'invalid')}`)
  await page.waitFor(`document.querySelector('.token-error')`)
  const copy = await page.evaluate(`document.querySelector('.token-error').innerText`)
  assert(copy.includes(expected), `Unexpected token error for ${reason}: ${copy}`)
  const validation = page.requests.find(({ method }) => method === 'POST')
  assert(validation, `Expected one validation request for ${reason}`)
  assert(JSON.parse(validation.postData).token === (reason || 'invalid'), `Token was not preserved for ${reason}`)
  page.client.close()
}

async function testMissingToken() {
  const page = await createPage()
  await page.navigate('/onboard.html')
  await page.waitFor(`document.querySelector('.token-error')`)
  const copy = await page.evaluate(`document.querySelector('.token-error').innerText`)
  assert(copy.includes('No invite token provided.'), 'Missing-token state did not render')
  assert(page.requests.length === 0, 'Missing token should not call the API')
  page.client.close()
}

async function testLoadingAndValidationFailure() {
  const loading = await createPage({ validate: { status: 200, body: { valid: true, email: 'invitee@example.com' }, delay: 250 } })
  await loading.navigate('/onboard.html?token=slow-token')
  const loadingCopy = await loading.evaluate(`document.querySelector('#token-loading').innerText`)
  assert(loadingCopy.includes('Validating invitation...') && loadingCopy.includes('Please wait.'), 'Token loading state changed')
  await loading.waitFor(`document.querySelector('#step-0.active')`)
  loading.client.close()

  const failure = await createPage({ validate: { fail: true } })
  await failure.navigate('/onboard.html?token=network-failure')
  await failure.waitFor(`document.querySelector('.token-error')`)
  const failureCopy = await failure.evaluate(`document.querySelector('.token-error').innerText`)
  assert(failureCopy.includes('Could not validate your invitation.'), 'Validation network failure state changed')
  failure.client.close()
}

async function testAliasAndRefresh() {
  const page = await createPage()
  await page.navigate('/onboard?token=alias%20token#details')
  await page.waitFor(`location.pathname === '/onboard.html' && document.querySelector('#step-0.active')`)
  const location = await page.evaluate(`({ pathname: location.pathname, search: location.search, hash: location.hash })`)
  assert(location.pathname === '/onboard.html', '/onboard alias did not resolve to the standalone page')
  assert(location.search === '?token=alias%20token', '/onboard alias did not preserve the query string')
  assert(location.hash === '#details', '/onboard alias did not preserve the hash')
  assert(JSON.parse(page.requests.find(({ method }) => method === 'POST').postData).token === 'alias token', 'Encoded token was not decoded by URLSearchParams')
  await page.client.send('Page.reload', { ignoreCache: true })
  await page.waitFor(`document.readyState === 'complete' && document.querySelector('#step-0.active')`)
  await page.waitFor(`window.location.pathname === '/onboard.html'`)
  assert(page.requests.filter(({ method, url }) => method === 'POST' && url.endsWith('/validate-token')).length === 2, 'Refresh should revalidate the invitation token')
  page.client.close()
}

async function testValidFlow() {
  const page = await createPage({
    submissions: [
      { status: 400, body: { error: 'Mock submission failure' } },
      { fail: true },
      { status: 200, body: { ok: true } },
    ],
  })
  await page.navigate('/onboard.html?token=valid-token')
  await page.waitFor(`document.querySelector('#step-0.active')`)

  const initial = await page.evaluate(`({
    email: document.querySelector('#f-email').value,
    readOnly: document.querySelector('#f-email').readOnly,
    overflow: document.documentElement.scrollWidth > innerWidth,
    title: document.title
  })`)
  assert(initial.email === 'invitee@example.com' && initial.readOnly, 'Invite email was not populated and locked')
  assert(!initial.overflow, 'Desktop onboarding page has horizontal overflow')
  assert(initial.title === 'crowd-cast · onboarding', 'Standalone onboarding title changed')
  const fieldInventory = await page.evaluate(`({
    missing: ['f-name','f-email','f-address','f-country','f-age','f-private','f-tax','f-sanctions','f-ip','f-holder','f-iban','f-routing','f-institution','f-transit','f-bsb','f-bankcode','f-branchcode','f-account-type','f-bic','f-bank','f-agree-purchase','f-agree-privacy','f-agree-special'].filter(id => !document.getElementById(id)),
    countries: Array.from(document.querySelector('#f-country').options).slice(1).map(option => option.value)
  })`)
  assert(fieldInventory.missing.length === 0, `Missing fields: ${fieldInventory.missing.join(', ')}`)
  assert(fieldInventory.countries.length === 31 && fieldInventory.countries[0] === 'Germany' && fieldInventory.countries.at(-1) === 'Mexico', 'Country inventory changed')
  await page.screenshot('/tmp/pdoom-onboarding-desktop.png')

  await page.evaluate(`document.querySelector('#step-0 .btn-next').click()`)
  await page.waitFor(`window.__unused !== true && document.querySelector('#step-0.active')`)
  assert(page.dialogs.at(-1)?.includes('Please enter your full legal name'), 'Step-one invalid state did not report field errors')

  const bankModes = await page.evaluate(`(() => {
    const cases = ['Germany','United States','India','Canada','Australia','Japan','Singapore','Hong Kong','Mexico'];
    return cases.map(country => {
      document.querySelector('#f-country').value = country;
      updateBankFields();
      return {
        country,
        mode: bankMode(),
        label: document.querySelector('#l-iban').textContent,
        bicLabel: document.querySelector('#l-bic').textContent,
        routing: document.querySelector('#w-routing').style.display !== 'none',
        institution: document.querySelector('#w-institution').style.display !== 'none',
        transit: document.querySelector('#w-transit').style.display !== 'none',
        bsb: document.querySelector('#w-bsb').style.display !== 'none',
        bankcode: document.querySelector('#w-bankcode').style.display !== 'none',
        branchcode: document.querySelector('#w-branchcode').style.display !== 'none',
        accountType: document.querySelector('#w-account-type').style.display !== 'none',
        bic: document.querySelector('#w-bic').style.display !== 'none',
      };
    });
  })()`)
  const byCountry = Object.fromEntries(bankModes.map((entry) => [entry.country, entry]))
  assert(byCountry.Germany.mode === 'iban' && byCountry.Germany.bic, 'IBAN mode mismatch')
  assert(byCountry['United States'].routing && byCountry['United States'].accountType && !byCountry['United States'].bic, 'US fields mismatch')
  assert(byCountry.India.bic && byCountry.India.bicLabel === 'IFSC code *', 'India fields mismatch')
  assert(byCountry.Canada.institution && byCountry.Canada.transit, 'Canada fields mismatch')
  assert(byCountry.Australia.bsb, 'Australia fields mismatch')
  assert(byCountry.Japan.bankcode && byCountry.Japan.branchcode && byCountry.Japan.accountType, 'Japan fields mismatch')
  assert(byCountry.Singapore.bankcode && byCountry['Hong Kong'].bankcode, 'Singapore/Hong Kong fields mismatch')
  assert(byCountry.Mexico.label === 'CLABE *', 'Mexico fields mismatch')

  await page.evaluate(`(() => {
    const set = (id, value) => { document.querySelector(id).value = value; };
    set('#f-name', 'Jane Doe');
    set('#f-address', 'Street 123, 80636 Munich');
    set('#f-country', 'Germany');
    document.querySelector('#f-country').dispatchEvent(new Event('change', { bubbles: true }));
    set('#f-holder', 'Jane Doe');
    set('#f-iban', 'DE89 3704 0044 0532 0130 00');
    set('#f-bic', 'coba deff xxx');
    set('#f-bank', 'Commerzbank, Germany');
    set('#f-routing', '021000021');
    for (const id of ['#f-age','#f-private','#f-tax','#f-sanctions','#f-ip']) document.querySelector(id).checked = true;
    document.querySelector('#step-0 .btn-next').click();
  })()`)
  await page.waitFor(`document.querySelector('#step-1.active')`)

  await page.evaluate(`document.querySelector('#step-1 .btn-next').click()`)
  await delay(30)
  assert(page.dialogs.at(-1) === 'Please read and accept the Data Purchase Agreement to continue.', 'Purchase agreement was not required')
  await page.evaluate(`(() => { document.querySelector('#f-agree-purchase').checked = true; document.querySelector('#step-1 .btn-next').click(); })()`)
  await page.waitFor(`document.querySelector('#step-2.active')`)

  await page.evaluate(`document.querySelector('#step-2 .btn-row .btn-back').click()`)
  await page.waitFor(`document.querySelector('#step-1.active')`)
  const retainedName = await page.evaluate(`document.querySelector('#f-name').value`)
  assert(retainedName === 'Jane Doe', 'Back navigation lost field state')
  await page.evaluate(`document.querySelector('#step-1 .btn-next').click()`)
  await page.waitFor(`document.querySelector('#step-2.active')`)

  await page.evaluate(`document.querySelector('#step-2 .btn-next').click()`)
  await delay(30)
  assert(page.dialogs.at(-1)?.includes('Please accept both'), 'Both privacy consents were not required')
  await page.evaluate(`(() => {
    document.querySelector('#f-agree-privacy').checked = true;
    document.querySelector('#f-agree-special').checked = true;
    document.querySelector('#step-2 .btn-next').click();
  })()`)
  await page.waitFor(`document.querySelector('#step-2 .btn-next').disabled === false`)
  assert(page.dialogs.at(-1) === 'Mock submission failure', 'Backend submission error was not surfaced')
  const retryText = await page.evaluate(`document.querySelector('#step-2 .btn-next').textContent`)
  assert(retryText === 'Complete onboarding', 'Submission failure did not restore retry state')
  await page.screenshot('/tmp/pdoom-onboarding-submit-failure.png')

  await page.evaluate(`document.querySelector('#step-2 .btn-next').click()`)
  await page.waitFor(`document.querySelector('#step-2 .btn-next').disabled === false`)
  assert(page.dialogs.at(-1) === 'Network error. Please check your connection and try again.', 'Network submission error was not surfaced')
  await page.evaluate(`document.querySelector('#step-2 .btn-next').click()`)
  await page.waitFor(`document.querySelector('#step-done.active')`)
  const submitRequests = page.requests.filter(({ method, url }) => method === 'POST' && url.endsWith('/onboard/submit'))
  assert(submitRequests.length === 3, 'Submission retries did not preserve the request path')
  const payload = JSON.parse(submitRequests[0].postData)
  assert(payload.token === 'valid-token', 'Submission token mismatch')
  assert(payload.name === 'Jane Doe' && payload.email === 'invitee@example.com', 'Identity payload mismatch')
  assert(payload.address === 'Street 123, 80636 Munich' && payload.country === 'Germany', 'Address payload mismatch')
  assert(payload.payout_method === 'bank_transfer', 'Payout method contract changed')
  assert(JSON.stringify(payload.payout_details) === JSON.stringify({
    holder: 'Jane Doe',
    iban: 'DE89370400440532013000',
    bank: 'Commerzbank, Germany',
    bic: 'COBADEFFXXX',
  }), 'Payout payload was not sanitized or included hidden-field leftovers')
  assert(Object.values(payload.agreements).every(Boolean), 'Agreement payload mismatch')
  assert(payload.agreement_version === 'v2026-06-26', 'Agreement version changed')
  assert(!Number.isNaN(Date.parse(payload.accepted_at)) && payload.user_agent, 'Submission metadata missing')
  await page.screenshot('/tmp/pdoom-onboarding-success.png')
  page.client.close()
}

async function testMobile() {
  const page = await createPage({
    width: 390,
    height: 844,
    submissions: [
      { status: 400, body: { error: 'Mobile mock failure' } },
      { status: 200, body: { ok: true } },
    ],
  })
  await page.navigate('/onboard.html?token=mobile-token')
  await page.waitFor(`document.querySelector('#step-0.active')`)
  const layout = await page.evaluate(`({
    overflow: document.documentElement.scrollWidth > innerWidth,
    inputWidth: document.querySelector('#f-name').getBoundingClientRect().width,
    viewport: innerWidth
  })`)
  assert(!layout.overflow, 'Mobile onboarding page has horizontal overflow')
  assert(layout.inputWidth < layout.viewport, 'Mobile form fields exceed the viewport')
  await page.screenshot('/tmp/pdoom-onboarding-mobile.png')

  await page.evaluate(`document.querySelector('#step-0 .btn-next').click()`)
  await delay(30)
  assert(page.dialogs.at(-1)?.includes('Please enter your full legal name'), 'Mobile step validation did not run')
  await page.evaluate(`(() => {
    const set = (id, value) => { document.querySelector(id).value = value; };
    set('#f-name', 'Jane Doe');
    set('#f-address', 'Street 123, 80636 Munich');
    set('#f-country', 'Germany');
    document.querySelector('#f-country').dispatchEvent(new Event('change', { bubbles: true }));
    set('#f-holder', 'Jane Doe');
    set('#f-iban', 'DE89 3704 0044 0532 0130 00');
    set('#f-bic', 'COBADEFFXXX');
    set('#f-bank', 'Commerzbank, Germany');
    for (const id of ['#f-age','#f-private','#f-tax','#f-sanctions','#f-ip']) document.querySelector(id).checked = true;
    document.querySelector('#step-0 .btn-next').click();
  })()`)
  await page.waitFor(`document.querySelector('#step-1.active')`)
  await page.evaluate(`(() => {
    document.querySelector('#f-agree-purchase').checked = true;
    document.querySelector('#step-1 .btn-next').click();
  })()`)
  await page.waitFor(`document.querySelector('#step-2.active')`)
  await page.evaluate(`(() => {
    document.querySelector('#f-agree-privacy').checked = true;
    document.querySelector('#f-agree-special').checked = true;
    document.querySelector('#step-2 .btn-next').click();
  })()`)
  await page.waitFor(`document.querySelector('#step-2 .btn-next').disabled === false`)
  assert(page.dialogs.at(-1) === 'Mobile mock failure', 'Mobile failure state did not restore retry behavior')
  await page.evaluate(`document.querySelector('#step-2 .btn-next').click()`)
  await page.waitFor(`document.querySelector('#step-done.active')`)
  await page.screenshot('/tmp/pdoom-onboarding-mobile-success.png')
  page.client.close()

  const invalid = await createPage({ width: 390, height: 844, validate: { status: 200, body: { valid: false, reason: 'Unknown token' } } })
  await invalid.navigate('/onboard.html?token=mobile-invalid')
  await invalid.waitFor(`document.querySelector('.token-error')`)
  const invalidOverflow = await invalid.evaluate(`document.documentElement.scrollWidth > innerWidth`)
  assert(!invalidOverflow, 'Mobile invalid-token state has horizontal overflow')
  invalid.client.close()
}

verifyStaticParity()
await testMissingToken()
await testLoadingAndValidationFailure()
await testTokenState({ reason: 'Token already used', expected: 'already been used' })
await testTokenState({ reason: 'Token expired', expected: 'has expired' })
await testTokenState({ reason: 'Unknown token', expected: 'Invalid invitation link' })
await testAliasAndRefresh()
await testValidFlow()
await testMobile()

console.log('Onboarding browser parity checks passed.')
