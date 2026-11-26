import { useEffect, useId, useRef, useState } from 'react'
import './trend-chart.css'

// A log-scale trend chart in the site's style. Measured data is steel, the
// series the story is about is signal red, projections are dashed or a light
// band. Every series is labelled at its end, so identity never rests on color
// alone. Every point is focusable and announces its name, date and value.
//
// x is a decimal year; y is plotted on a log10 scale.
// series: [{ id, label, tone, points: [{ x, y, name, low?, high? }] }]  low/high draw a range
// lines:  [{ id, label, tone, from: [x, y], to: [x, y], projected }]
// bands:  [{ id, label, tone, upper: [[x, y], [x, y]], lower: [[x, y], [x, y]] }]
// refs:   [{ id, y, label }]           horizontal reference lines
// spans:  [{ id, from, to, label }]    a shaded range of years
// markers: [{ id, x, label, sublabel, side, row }]   a vertical line at a date, labelled at the top (row staggers labels)
// notes:  [{ id, x, y, text, tone, anchor, dx, dy }]  labels inside the plot
// annotations: [{ id, tone, at: [x, y], lines: [..], anchor, to: [x, y],
//   bend?, from?: [dx, dy] (start offset from `at`, px), sentence? (one weight),
//   compact?: { ...overrides on narrow screens } }]
// markers: `wideOnly` hides a marker on narrow screens.
//   a text block in the series color with a curved arrow to `to`, as Epoch AI does
// points may carry `label`, `labelDx`, `labelDy`, `labelAnchor` to name them in the plot
// footnote: a short note inside the plot, bottom left

const log = Math.log10

function useWidth(fallback) {
  const ref = useRef(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    const node = ref.current
    if (!node || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

// A gentle arc from `a` to `b`: the control point sits `bend` px off the
// midpoint, perpendicular to the chord, and the end stops short for the head.
function bentPath([ax, ay], [bx, by], bend) {
  const dx = bx - ax
  const dy = by - ay
  const length = Math.hypot(dx, dy) || 1
  const cx = (ax + bx) / 2 - (dy / length) * bend
  const cy = (ay + by) / 2 + (dx / length) * bend
  const ex = bx - ((bx - cx) / Math.hypot(bx - cx, by - cy)) * 3
  const ey = by - ((by - cy) / Math.hypot(bx - cx, by - cy)) * 3
  return `M${ax} ${ay} Q${cx} ${cy} ${ex} ${ey}`
}

export default function TrendChart({
  title,
  heading,
  credit,
  series = [],
  lines = [],
  bands = [],
  refs = [],
  spans = [],
  markers = [],
  notes = [],
  annotations = [],
  footnote,
  footnoteAnchor = 'start',
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  formatY = (v) => String(v),
  formatX = (v) => String(Math.round(v)),
  formatPointX,
  yLabel,
  aspect,
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const [plotRef, width] = useWidth(760)
  const [active, setActive] = useState(null)
  const compact = width < 560
  const hasEndLabels = [...bands, ...lines, ...series].some((item) => item.label)
  const pad = { top: 30, right: hasEndLabels ? (compact ? 84 : 150) : 12, bottom: 36, left: 66 }
  // `aspect` (height / width) keeps a chart's proportions on wide screens;
  // narrow screens keep the fixed compact height so the plot never gets flat.
  const height = aspect && !compact
    ? Math.round(width * aspect)
    : compact ? 340 : Math.min(460, Math.max(360, width * 0.52))

  const x = (v) => pad.left + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * (width - pad.left - pad.right)
  const y = (v) => height - pad.bottom - ((log(v) - log(yDomain[0])) / (log(yDomain[1]) - log(yDomain[0]))) * (height - pad.top - pad.bottom)
  const pointsAttr = (pairs) => pairs.map(([px, py]) => `${x(px)},${y(py)}`).join(' ')

  const ends = [
    ...bands.filter((b) => b.label).map((b) => ({
      id: b.id, label: b.label, tone: b.tone,
      at: b.labelAt || [b.upper[1][0], Math.sqrt(b.upper[1][1] * b.lower[1][1])],
    })),
    ...lines.filter((l) => l.label).map((l) => ({ id: l.id, label: l.label, tone: l.tone, at: l.to })),
    ...series.filter((s) => s.label).map((s) => {
      const last = s.points[s.points.length - 1]
      return { id: s.id, label: s.label, tone: s.tone, at: [last.x, last.y] }
    }),
  ]

  const tickStep = compact ? Math.ceil(xTicks.length / 4) : 1
  const visibleXTicks = xTicks.filter((_, i) => i % tickStep === 0)

  return (
    <figure className="trend-chart">
      {(heading || credit) && (
        <figcaption className={`trend-chart-heading${heading ? '' : ' is-bare'}`}>
          <span>{heading}</span>
          {credit && (
            <span className="trend-chart-credit">
              <button type="button" aria-describedby={`${id}-credit`}>Source</button>
              <span className="trend-chart-credit-pop" id={`${id}-credit`} role="tooltip">{credit}</span>
            </span>
          )}
        </figcaption>
      )}
      <div className="trend-chart-plot" ref={plotRef}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title`}>
          <title id={`${id}-title`}>{title}</title>
          <defs>
            {['story', 'context'].map((tone) => (
              <marker key={tone} id={`${id}-arrow-${tone}`} className={`trend-chart-arrowhead--${tone}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1 1 L7 4 L1 7" />
              </marker>
            ))}
            <clipPath id={`${id}-clip`}>
              <rect x={pad.left} y={pad.top} width={width - pad.left - pad.right} height={height - pad.top - pad.bottom} />
            </clipPath>
          </defs>

          {spans.map((span) => (
            <g key={span.id} className="trend-chart-span">
              <rect x={x(span.from)} y={pad.top} width={x(span.to) - x(span.from)} height={height - pad.top - pad.bottom} />
              <text x={(x(span.from) + x(span.to)) / 2} y={pad.top - 10} textAnchor="middle">{span.label}</text>
            </g>
          ))}

          {markers.filter((marker) => !(compact && marker.wideOnly)).map((marker) => (
            <g key={marker.id} className="trend-chart-marker">
              <line x1={x(marker.x)} x2={x(marker.x)} y1={pad.top} y2={height - pad.bottom} />
              <text
                x={x(marker.x) + (marker.side === 'left' ? -4 : 4)}
                y={pad.top + 11 + (marker.row ?? 0) * 13}
                textAnchor={marker.side === 'left' ? 'end' : 'start'}
              >
                {marker.label}
              </text>
              {marker.sublabel && (
                <text
                  className="trend-chart-marker-sub"
                  x={x(marker.x) + (marker.side === 'left' ? -4 : 4)}
                  y={pad.top + 24 + (marker.row ?? 0) * 13}
                  textAnchor={marker.side === 'left' ? 'end' : 'start'}
                >
                  {marker.sublabel}
                </text>
              )}
            </g>
          ))}

          {yTicks.map((tick) => (
            <g key={`y${tick}`} className="trend-chart-grid">
              <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} />
              <line className="trend-chart-tickmark" x1={pad.left - 4} x2={pad.left} y1={y(tick)} y2={y(tick)} />
              <text x={pad.left - 8} y={y(tick)} dy="0.32em" textAnchor="end">{formatY(tick)}</text>
            </g>
          ))}
          {visibleXTicks.map((tick) => (
            <g key={`x${tick}`} className="trend-chart-grid">
              <line x1={x(tick)} x2={x(tick)} y1={pad.top} y2={height - pad.bottom} />
              <line className="trend-chart-tickmark" x1={x(tick)} x2={x(tick)} y1={height - pad.bottom} y2={height - pad.bottom + 4} />
              <text x={x(tick)} y={height - pad.bottom + 19} textAnchor="middle">{formatX(tick)}</text>
            </g>
          ))}
          <path className="trend-chart-axis" d={`M${pad.left} ${pad.top} V${height - pad.bottom} H${width - pad.right}`} />
          {yLabel && (
            <text className="trend-chart-axis-title" x={0} y={pad.top - 14} textAnchor="start">{yLabel}</text>
          )}

          {refs.map((ref) => (
            <g key={ref.id} className="trend-chart-ref">
              <line x1={pad.left} x2={width - pad.right} y1={y(ref.y)} y2={y(ref.y)} />
              <text x={pad.left + 8} y={y(ref.y) - 8}>{ref.label}</text>
            </g>
          ))}

          <g clipPath={`url(#${id}-clip)`}>
          {bands.map((band) => (
            <polygon
              key={band.id}
              className={`trend-chart-band trend-chart-band--${band.tone}`}
              points={pointsAttr([...band.upper, ...[...band.lower].reverse()])}
            />
          ))}

          {lines.map((line) => (
            <line
              key={line.id}
              className={`trend-chart-line trend-chart-line--${line.tone}${line.projected ? ' is-projected' : ''}`}
              x1={x(line.from[0])}
              y1={y(line.from[1])}
              x2={x(line.to[0])}
              y2={y(line.to[1])}
            />
          ))}
          </g>

          {series.map((s) => s.points.map((point) => {
            const key = `${s.id}-${point.name}`
            const show = () => setActive({ key, point })
            return (
              <g
                key={key}
                className={`trend-chart-point trend-chart-point--${s.tone}${active?.key === key ? ' is-active' : ''}`}
                tabIndex={0}
                aria-label={`${point.name}${formatPointX ? `, ${formatPointX(point.x)}` : ''}: ${formatY(point.y)}`}
                onPointerEnter={show}
                onPointerLeave={() => setActive(null)}
                onFocus={show}
                onBlur={() => setActive(null)}
              >
                {point.low != null && point.high != null && (
                  <line className="trend-chart-whisker" x1={x(point.x)} x2={x(point.x)} y1={y(point.low)} y2={y(point.high)} />
                )}
                <circle className="trend-chart-hit" cx={x(point.x)} cy={y(point.y)} r="12" />
                <circle className="trend-chart-dot" cx={x(point.x)} cy={y(point.y)} r="4.5" />
                {point.label && (
                  <text
                    className={`trend-chart-point-label trend-chart-point-label--${s.tone}`}
                    x={x(point.x) + (point.labelDx ?? 8)}
                    y={y(point.y) + (point.labelDy ?? 0)}
                    dy="0.32em"
                    textAnchor={point.labelAnchor || 'start'}
                  >
                    {point.label}
                  </text>
                )}
              </g>
            )
          }))}

          {annotations.map((base) => {
            const note = compact && base.compact ? { ...base, ...base.compact } : base
            const tx = x(note.at[0])
            const ty = y(note.at[1])
            const lineHeight = 16
            const bottom = ty + (note.lines.length - 1) * lineHeight + 4
            const tox = x(note.to[0])
            const toy = y(note.to[1])
            const startX = note.anchor === 'end' ? tx - 12 : note.anchor === 'middle' ? tx : tx + 12
            const below = toy > bottom
            const startY = below ? bottom + 2 : ty - 12
            return (
              <g key={`annotation-${note.id}`} className={`trend-chart-annotation trend-chart-annotation--${note.tone}`}>
                <text x={tx} y={ty} textAnchor={note.anchor || 'start'}>
                  {note.lines.map((line, index) => (
                    <tspan key={line} x={tx} dy={index === 0 ? 0 : lineHeight} className={index === 0 || note.sentence ? 'is-lead' : undefined}>{line}</tspan>
                  ))}
                </text>
                <path
                  d={note.bend === undefined
                    ? `M${startX} ${startY} Q${startX} ${toy} ${tox + (tox > startX ? -3 : 3)} ${toy}`
                    : bentPath(note.from ? [tx + note.from[0], ty + note.from[1]] : [startX, startY], [tox, toy], note.bend)}
                  markerEnd={`url(#${id}-arrow-${note.tone})`}
                />
              </g>
            )
          })}

          {footnote && (
            <text
              className="trend-chart-footnote"
              x={footnoteAnchor === 'end' ? width - pad.right - 6 : pad.left + 6}
              y={height - pad.bottom - 7}
              textAnchor={footnoteAnchor}
            >
              {footnote}
            </text>
          )}

          {notes.map((note) => (
            <text
              key={`note-${note.id}`}
              className={`trend-chart-end trend-chart-end--${note.tone}`}
              x={x(note.x)}
              y={y(note.y)}
              dx={note.dx ?? 0}
              dy={note.dy ?? '0.32em'}
              textAnchor={note.anchor || 'start'}
            >
              {note.text}
            </text>
          ))}

          {ends.map((end) => (
            <text
              key={`end-${end.id}`}
              className={`trend-chart-end trend-chart-end--${end.tone}`}
              x={x(end.at[0]) + 10}
              y={y(end.at[1])}
              dy="0.32em"
            >
              {end.label.split('\n').map((part, index) => (
                <tspan key={part} x={x(end.at[0]) + 10} dy={index === 0 ? '0.32em' : '1.2em'}>{part}</tspan>
              ))}
            </text>
          ))}
        </svg>

        {active && (
          <div
            className="trend-chart-tooltip"
            style={{ left: `${x(active.point.x)}px`, top: `${y(active.point.y)}px` }}
          >
            <span>{active.point.name}{formatPointX && `, ${formatPointX(active.point.x)}`}</span>
          </div>
        )}
      </div>


    </figure>
  )
}
