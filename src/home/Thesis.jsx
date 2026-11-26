import TrendChart from '../charts/TrendChart.jsx'
import { scalingData } from '../charts/scalingData.js'
import './home.css'
import './thesis.css'

const { horizon } = scalingData

const hourLabels = new Map([
  [1 / 3600, '1 s'],
  [1 / 60, '1 min'],
  [1, '1 h'],
  [100, '100 h'],
  [10000, '10,000 h'],
])

function formatHours(hours) {
  if (hourLabels.has(hours)) return hourLabels.get(hours)
  if (hours < 1 / 60) return `${Math.round(hours * 3600)} s`
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} h`
}

const years = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

// METR's own time-horizon figure is 1569 x 893 px; keep its proportions.
const chartAspect = 893 / 1569

// Central estimate of the fitted trend, and when it reaches a year of work (2,004 h).
const horizonAt = (year) => horizon.fit.to[1] * 2 ** ((year - horizon.fit.to[0]) * 365.25 / horizon.doublingDays)
const reachYear = (hours) => horizon.fit.to[0] + Math.log2(hours / horizon.fit.to[1]) * horizon.doublingDays / 365.25

// The chart asks the question; the heading beside it answers.
export default function Thesis() {
  return (
    <section className="thesis" id="approach" aria-labelledby="thesis-title" data-nav-theme="light">
      <div className="thesis-copy">
        <h2 id="thesis-title">Models learn the work they’re trained on.</h2>
        <p>
          So we train them on months of real work. We have recorded more than 20,000 hours of PhD students working on their own projects, following each of them for three to twelve months. And we build everything needed to learn from it, from architectures to training paradigms.
        </p>
      </div>

      <figure className="thesis-figure">
        <TrendChart
          credit={<><a href="https://metr.org/time-horizons/">METR</a>, CC BY 4.0</>}
          title="Length of tasks frontier models complete half the time, with the trend extended to 2030"
          markers={[{ id: 'one-year', x: reachYear(2004), label: 'A year of work', side: 'left', wideOnly: true }]}
          series={[{ id: 'models', tone: 'context', points: horizon.points }]}
          lines={[{ id: 'fit', tone: 'story', ...horizon.fit }]}
          bands={[{ id: 'projection', tone: 'story', ...horizon.band }]}
          annotations={[{
            id: 'keep-going',
            tone: 'story',
            at: [2028.6, 0.25],
          anchor: 'end',
            lines: ['How do we keep', 'this going?'],
            sentence: true,
            from: [-56, -18],
            to: [2027.75, horizonAt(2027.75) / 1.2],
            bend: -10,
            // Narrow plots: right-aligned to the edge, below the projection.
            compact: { at: [2030, 0.4], anchor: 'end', from: [-40, -16], to: [2028.2, horizonAt(2028.2) / 1.2] },
          }]}
          xDomain={[2018, 2030]}
          xTicks={years(2018, 2030)}
          yDomain={[1 / 3600, 10000]}
          yTicks={[1 / 3600, 1 / 60, 1, 100, 10000]}
          yLabel="Task length (50% success)"
          formatY={formatHours}
          aspect={chartAspect}
        />
      </figure>
    </section>
  )
}
