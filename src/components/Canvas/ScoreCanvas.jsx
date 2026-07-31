import { useEffect, useRef, useCallback } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow'
import { useScoreStore } from '../../store/scoreStore.js'
import styles from './ScoreCanvas.module.css'

const STAVE_Y       = 80   // top of stave within the SVG
const STAVE_HEIGHT  = 40   // VexFlow standard stave height
const SVG_HEIGHT    = 200
const MEASURE_PAD_L = 12   // left padding inside each measure
const MEASURE_PAD_R = 12
const NOTE_WIDTH    = 48   // estimated width per note
const MIN_MEASURE_W = 160  // minimum measure width (pixels)

function measureWidth(measure, isFirst) {
  const base = isFirst ? 80 : 30 // first measure carries clef + time sig
  return Math.max(MIN_MEASURE_W, base + MEASURE_PAD_L + measure.notes.length * NOTE_WIDTH + MEASURE_PAD_R)
}

// Store note → pitch: 'C#4', 'Bb3', etc. → VexFlow key: 'c#/4', 'bb/3'
function vexKey(note) {
  if (note.isRest) return 'b/4'
  const letter = note.pitch.toLowerCase()
  const acc = note.accidental === '#' ? '#'
             : note.accidental === 'b' ? 'b'
             : ''
  return `${letter}${acc}/${note.octave}`
}

// Build VexFlow duration string: 'q', 'qd' (dotted), 'qr' (rest)
function vexDuration(note) {
  let dur = note.duration || 'q'
  if (note.dotted && !note.isRest) dur += 'd'
  if (note.isRest) dur += 'r'
  return dur
}

export default function ScoreCanvas() {
  const containerRef    = useRef(null)
  const notePositions   = useRef({})  // { noteId: { x, measureId } }
  const measureBounds   = useRef({})  // { measureId: { x, width } }

  const measures   = useScoreStore((s) => s.measures)
  const meta       = useScoreStore((s) => s.meta)
  const selection  = useScoreStore((s) => s.selection)
  const setSelection = useScoreStore((s) => s.setSelection)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''
    notePositions.current = {}
    measureBounds.current = {}

    // Compute total SVG width
    const totalWidth = measures.reduce(
      (sum, m, i) => sum + measureWidth(m, i === 0), 0
    ) + 20

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(Math.max(totalWidth, container.clientWidth || 800), SVG_HEIGHT)
    const context = renderer.getContext()

    // Active measure highlight — drawn first (behind everything)
    let xCursor = 0
    measures.forEach((measure, i) => {
      const mw = measureWidth(measure, i === 0)
      if (measure.id === selection.measureId) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', xCursor)
        rect.setAttribute('y', STAVE_Y - 14)
        rect.setAttribute('width', mw)
        rect.setAttribute('height', STAVE_HEIGHT + 28)
        rect.setAttribute('fill', 'var(--color-accent-light)')
        rect.setAttribute('rx', '4')
        container.querySelector('svg').appendChild(rect)
      }
      measureBounds.current[measure.id] = { x: xCursor, width: mw }
      xCursor += mw
    })

    // Render staves and notes
    xCursor = 0
    measures.forEach((measure, i) => {
      const mw = measureWidth(measure, i === 0)
      const staveX = xCursor + MEASURE_PAD_L
      const staveWidth = mw - MEASURE_PAD_L - MEASURE_PAD_R

      const stave = new Stave(staveX, STAVE_Y, staveWidth)
      if (i === 0) {
        stave.addClef(meta.clef)
        stave.addTimeSignature(`${meta.timeSignature[0]}/${meta.timeSignature[1]}`)
      } else {
        // Show clef again if it changes — Phase 1 just repeats at measure 0
      }
      stave.setContext(context).draw()

      // Score title above first measure
      if (i === 0 && meta.title) {
        context.save()
        const svg = container.querySelector('svg')
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', staveX + staveWidth / 2)
        text.setAttribute('y', STAVE_Y - 28)
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('font-family', 'var(--font-ui)')
        text.setAttribute('font-size', '15')
        text.setAttribute('font-weight', '600')
        text.setAttribute('fill', 'var(--color-text)')
        text.textContent = meta.title
        svg.appendChild(text)
        context.restore()
      }

      // Notes
      if (measure.notes.length > 0) {
        try {
          const staveNotes = measure.notes.map((note) => {
            const sn = new StaveNote({
              keys: [vexKey(note)],
              duration: vexDuration(note),
            })

            // Explicitly render accidental symbol
            if (note.accidental && !note.isRest) {
              sn.addModifier(new Accidental(note.accidental), 0)
            }

            // Highlight selected note
            if (note.id === selection.noteId) {
              sn.setStyle({ fillStyle: 'var(--color-accent)', strokeStyle: 'var(--color-accent)' })
            }

            return sn
          })

          // SOFT mode: never throws on beat-count mismatch — the freestyle guarantee
          const voice = new Voice({
            num_beats: meta.timeSignature[0],
            beat_value: meta.timeSignature[1],
          }).setMode(Voice.Mode.SOFT)

          voice.addTickables(staveNotes)
          new Formatter().joinVoices([voice]).format([voice], staveWidth - (i === 0 ? 60 : 20))
          voice.draw(context, stave)

          // Capture note x positions for click detection
          staveNotes.forEach((sn, idx) => {
            const noteId = measure.notes[idx]?.id
            if (noteId) {
              notePositions.current[noteId] = {
                x: sn.getAbsoluteX(),
                measureId: measure.id,
                noteId,
              }
            }
          })

        } catch (err) {
          // A render failure on one measure should never crash the whole score
          console.warn('ScoreCanvas: render error in measure', measure.id, err)
        }
      }

      xCursor += mw
    })

    // Cursor line — drawn last (on top)
    const svg = container.querySelector('svg')
    if (svg && selection.measureId) {
      let cursorX = null

      if (selection.noteId && notePositions.current[selection.noteId]) {
        // After selected note
        cursorX = notePositions.current[selection.noteId].x + 18
      } else {
        // Start of active measure
        const bounds = measureBounds.current[selection.measureId]
        if (bounds) cursorX = bounds.x + MEASURE_PAD_L + (measures.find(m => m.id === selection.measureId)?.notes.length === 0 ? (measures.findIndex(m => m.id === selection.measureId) === 0 ? 70 : 20) : 0)
      }

      if (cursorX !== null) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', cursorX)
        line.setAttribute('y1', STAVE_Y - 4)
        line.setAttribute('x2', cursorX)
        line.setAttribute('y2', STAVE_Y + STAVE_HEIGHT + 4)
        line.setAttribute('stroke', 'var(--color-accent)')
        line.setAttribute('stroke-width', '2')
        line.setAttribute('stroke-linecap', 'round')
        line.setAttribute('opacity', '0.8')
        svg.appendChild(line)
      }
    }

  }, [measures, meta, selection])

  const handleClick = useCallback((e) => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const clickX = e.clientX - rect.left

    // Try to find a note within 28px
    let closest = null
    let minDist = Infinity
    for (const pos of Object.values(notePositions.current)) {
      const dist = Math.abs(pos.x - clickX)
      if (dist < minDist && dist < 28) {
        minDist = dist
        closest = pos
      }
    }

    if (closest) {
      setSelection(closest.measureId, closest.noteId)
      return
    }

    // Click in a measure's empty area — activate that measure
    for (const [measureId, bounds] of Object.entries(measureBounds.current)) {
      if (clickX >= bounds.x && clickX < bounds.x + bounds.width) {
        setSelection(measureId, null)
        return
      }
    }
  }, [setSelection])

  return (
    <div
      className={styles.wrapper}
      role="application"
      aria-label="Score editor — press A through G to enter notes, 1–6 for duration"
      tabIndex={0}
    >
      <div
        ref={containerRef}
        className={styles.canvas}
        onClick={handleClick}
        aria-label="Music score"
      />
      {measures.length === 1 && measures[0].notes.length === 0 && (
        <p className={styles.hint}>
          Select a duration (1–6), then press a note letter (A–G) to start writing.
        </p>
      )}
    </div>
  )
}
