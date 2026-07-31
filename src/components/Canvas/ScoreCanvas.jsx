import { useEffect, useRef, useCallback } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, StaveConnector } from 'vexflow'
import { useScoreStore } from '../../store/scoreStore.js'
import styles from './ScoreCanvas.module.css'

// Layout constants
const STAVE_HEIGHT  = 40   // VexFlow standard (4 × 10px line spacing)
const FIRST_STAVE_Y = 70   // top of first staff
const STAFF_GAP     = 50   // vertical gap between staves
const NOTE_WIDTH    = 46
const MIN_MEASURE_W = 120
const FIRST_EXTRA   = 80   // extra width for clef + time sig on measure 0

// How wide is a measure?
function measureWidth(noteCount, isFirst) {
  return Math.max(MIN_MEASURE_W, (isFirst ? FIRST_EXTRA : 30) + noteCount * NOTE_WIDTH + 20)
}

// Total SVG height based on number of staves
function svgHeight(staffCount) {
  return FIRST_STAVE_Y + staffCount * STAVE_HEIGHT + (staffCount - 1) * STAFF_GAP + 60
}

// Y position of a staff (0-indexed)
function staffY(staffIndex) {
  return FIRST_STAVE_Y + staffIndex * (STAVE_HEIGHT + STAFF_GAP)
}

// --- Pitch helpers ---
const DIATONIC = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

// Top line of each clef maps to a specific note
const CLEF_TOP_LINE = {
  treble: { noteIdx: 3, octave: 5 }, // F5
  bass:   { noteIdx: 5, octave: 3 }, // A3
  alto:   { noteIdx: 4, octave: 4 }, // G4
  tenor:  { noteIdx: 2, octave: 4 }, // E4
}

// Convert staff Y click position to pitch
function yToPitch(clickY, staveTopY, clef) {
  const ref = CLEF_TOP_LINE[clef] ?? CLEF_TOP_LINE.treble
  // Each line/space = 5px. Step 0 = top line.
  const step = Math.round((clickY - staveTopY) / 5)
  let noteIdx = ref.noteIdx - step
  let octave  = ref.octave
  while (noteIdx < 0) { noteIdx += 7; octave-- }
  while (noteIdx >= 7) { noteIdx -= 7; octave++ }
  return { pitch: DIATONIC[noteIdx], octave: Math.max(1, Math.min(8, octave)) }
}

// --- Duration beat values (as fraction of whole note) ---
const BEAT_VALUES = { w: 1, h: 0.5, q: 0.25, '8': 0.125, '16': 0.0625, '32': 0.03125, '64': 0.015625 }

function noteBeatValue(note) {
  const base = BEAT_VALUES[note.duration] ?? 0.25
  return note.dotted ? base * 1.5 : base
}

// Total beats a time signature holds (as fraction of whole note)
function measureCapacity(timeSignature) {
  return timeSignature[0] / timeSignature[1]
}

// --- VexFlow helpers ---
function vexKey(note) {
  if (note.isRest) return 'b/4'
  const letter = note.pitch.toLowerCase()
  const acc = note.accidental === '#' ? '#' : note.accidental === 'b' ? 'b' : ''
  return `${letter}${acc}/${note.octave}`
}

function vexDuration(note) {
  let d = note.duration || 'q'
  if (note.dotted && !note.isRest) d += 'd'
  if (note.isRest) d += 'r'
  return d
}

export default function ScoreCanvas() {
  const containerRef   = useRef(null)
  const notePositions  = useRef({})  // { noteId: { x, staveY, measureId, staffId } }
  const measureBounds  = useRef({})  // { measureId: { x, width } }
  const staffBounds    = useRef([])  // [{ y, height, staffId }] for click detection

  const measures    = useScoreStore((s) => s.measures)
  const staves      = useScoreStore((s) => s.staves)
  const meta        = useScoreStore((s) => s.meta)
  const selection   = useScoreStore((s) => s.selection)
  const inputState  = useScoreStore((s) => s.inputState)
  const setSelection   = useScoreStore((s) => s.setSelection)
  const setActiveStaff = useScoreStore((s) => s.setActiveStaff)
  const insertNote     = useScoreStore((s) => s.insertNote)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''
    notePositions.current  = {}
    measureBounds.current  = {}
    staffBounds.current    = staves.map((st, i) => ({
      staffId: st.id,
      y: staffY(i),
      bottom: staffY(i) + STAVE_HEIGHT,
    }))

    // Build measure widths (based on max notes across all staves)
    const mwList = measures.map((m, i) => {
      const maxNotes = staves.reduce((max, st) => {
        return Math.max(max, (m.notesByStaff[st.id] ?? []).length)
      }, 0)
      return measureWidth(maxNotes, i === 0)
    })

    const totalWidth = Math.max(mwList.reduce((s, w) => s + w, 0) + 20, 800)
    const height = svgHeight(staves.length)

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(totalWidth, height)
    const ctx = renderer.getContext()
    const svg = container.querySelector('svg')

    // Score title
    if (meta.title) {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      t.setAttribute('x', totalWidth / 2)
      t.setAttribute('y', 24)
      t.setAttribute('text-anchor', 'middle')
      t.setAttribute('font-family', 'var(--font-ui)')
      t.setAttribute('font-size', '14')
      t.setAttribute('font-weight', '600')
      t.setAttribute('fill', 'var(--color-text)')
      t.textContent = meta.title
      svg.appendChild(t)
    }

    // Active measure highlight (behind everything)
    let xAccum = 0
    measures.forEach((measure, mi) => {
      const mw = mwList[mi]
      measureBounds.current[measure.id] = { x: xAccum, width: mw }
      if (measure.id === selection.measureId) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', xAccum + 1)
        rect.setAttribute('y', FIRST_STAVE_Y - 12)
        rect.setAttribute('width', mw - 2)
        rect.setAttribute('height', height - FIRST_STAVE_Y - 10)
        rect.setAttribute('fill', 'var(--color-accent-light)')
        rect.setAttribute('rx', '3')
        svg.insertBefore(rect, svg.firstChild)
      }
      xAccum += mw
    })

    // Render each staff row
    staves.forEach((staff, si) => {
      const sy = staffY(si)
      xAccum = 0

      const staveObjects = [] // keep for StaveConnector

      measures.forEach((measure, mi) => {
        const mw     = mwList[mi]
        const isFirst = mi === 0
        const notes  = measure.notesByStaff[staff.id] ?? []
        const capacity = measureCapacity(meta.timeSignature)

        const stave = new Stave(xAccum, sy, mw)
        if (isFirst) {
          stave.addClef(staff.clef)
          stave.addTimeSignature(`${meta.timeSignature[0]}/${meta.timeSignature[1]}`)
        }
        stave.setContext(ctx).draw()
        staveObjects.push(stave)

        if (notes.length > 0) {
          try {
            let runningBeats = 0
            const staveNotes = notes.map((note) => {
              const sn = new StaveNote({ keys: [vexKey(note)], duration: vexDuration(note) })

              if (note.accidental && !note.isRest) {
                sn.addModifier(new Accidental(note.accidental), 0)
              }

              // Overflow: note pushes past time signature capacity → red
              const beatVal = noteBeatValue(note)
              const isOverflow = runningBeats >= capacity
              runningBeats += beatVal

              if (note.id === selection.noteId) {
                sn.setStyle({ fillStyle: 'var(--color-accent)', strokeStyle: 'var(--color-accent)' })
              } else if (isOverflow) {
                sn.setStyle({ fillStyle: 'var(--color-error)', strokeStyle: 'var(--color-error)' })
              }

              return sn
            })

            const voice = new Voice({ num_beats: meta.timeSignature[0], beat_value: meta.timeSignature[1] })
              .setMode(Voice.Mode.SOFT)
            voice.addTickables(staveNotes)
            new Formatter().joinVoices([voice]).format([voice], mw - (isFirst ? 90 : 30))
            voice.draw(ctx, stave)

            // Capture note x positions
            staveNotes.forEach((sn, idx) => {
              const noteId = notes[idx]?.id
              if (noteId) {
                notePositions.current[noteId] = { x: sn.getAbsoluteX(), staveY: sy, measureId: measure.id, staffId: staff.id }
              }
            })
          } catch (err) {
            console.warn('ScoreCanvas render error:', err)
          }
        }

        xAccum += mw
      })

      // Brace connector for multi-staff: draw on leftmost stave of each measure set
      // (VexFlow StaveConnector connects the first stave to the one below it)
    })

    // Draw brace connecting staves on first measure's left edge
    if (staves.length > 1) {
      const staveRefs = staves.map((_, si) => new Stave(0, staffY(si), 1))
      // Re-create thin staves just for the connector geometry
      const firstStaveObjs = staves.map((_, si) => {
        const s = new Stave(0, staffY(si), mwList[0])
        return s
      })
      try {
        const connector = new StaveConnector(firstStaveObjs[0], firstStaveObjs[staves.length - 1])
        connector.setType(StaveConnector.type.BRACE)
        connector.setContext(ctx).draw()
        // Also draw a straight bracket on the far left
        const bracket = new StaveConnector(firstStaveObjs[0], firstStaveObjs[staves.length - 1])
        bracket.setType(StaveConnector.type.BRACKET)
        bracket.setContext(ctx).draw()
      } catch (e) {
        // ignore connector errors
      }
    }

    // Cursor line (drawn on top)
    if (selection.measureId) {
      let cursorX = null
      const selStaffIdx = staves.findIndex((st) => st.id === selection.staffId)
      const cursorStaveY = selStaffIdx >= 0 ? staffY(selStaffIdx) : FIRST_STAVE_Y

      if (selection.noteId && notePositions.current[selection.noteId]) {
        cursorX = notePositions.current[selection.noteId].x + 18
      } else {
        const bounds = measureBounds.current[selection.measureId]
        if (bounds) {
          const mi = measures.findIndex((m) => m.id === selection.measureId)
          cursorX = bounds.x + (mi === 0 ? FIRST_EXTRA + 10 : 20)
        }
      }

      if (cursorX !== null) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', cursorX)
        line.setAttribute('y1', cursorStaveY - 4)
        line.setAttribute('x2', cursorX)
        line.setAttribute('y2', cursorStaveY + STAVE_HEIGHT + 4)
        line.setAttribute('stroke', 'var(--color-accent)')
        line.setAttribute('stroke-width', '2')
        line.setAttribute('stroke-linecap', 'round')
        line.setAttribute('opacity', '0.85')
        svg.appendChild(line)
      }
    }

  }, [measures, staves, meta, selection])

  const handleClick = useCallback((e) => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return
    const rect  = svg.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // 1. Check if click lands on an existing note (select it)
    let closest = null, minDist = Infinity
    for (const pos of Object.values(notePositions.current)) {
      const dist = Math.abs(pos.x - clickX)
      if (dist < minDist && dist < 26) { minDist = dist; closest = pos }
    }
    if (closest) {
      setSelection(closest.measureId, closest.staffId, closest.noteId)
      return
    }

    // 2. Determine which staff was clicked (by Y)
    let clickedStaff = null
    const threshold = 30 // px above/below staff lines still counts
    for (const sb of staffBounds.current) {
      if (clickY >= sb.y - threshold && clickY <= sb.bottom + threshold) {
        clickedStaff = sb
        break
      }
    }
    if (!clickedStaff) return

    // 3. Determine which measure was clicked (by X)
    let clickedMeasureId = null
    for (const [measureId, bounds] of Object.entries(measureBounds.current)) {
      if (clickX >= bounds.x && clickX < bounds.x + bounds.width) {
        clickedMeasureId = measureId
        break
      }
    }
    if (!clickedMeasureId) return

    // 4. Determine insert position within measure (based on X vs existing note positions)
    const staffId = clickedStaff.staffId
    const staveTopY = clickedStaff.y
    const staffDef = staves.find((st) => st.id === staffId)
    const clef = staffDef?.clef ?? 'treble'
    const { pitch, octave } = yToPitch(clickY, staveTopY, clef)

    // Find the note in this measure+staff whose X is closest but before clickX
    // so we set cursor there before inserting
    const notesInMeasure = Object.values(notePositions.current)
      .filter((p) => p.measureId === clickedMeasureId && p.staffId === staffId)
      .sort((a, b) => a.x - b.x)

    let anchorNoteId = null
    for (const pos of notesInMeasure) {
      if (pos.x < clickX) anchorNoteId = pos.noteId
    }

    // Set cursor, then insert
    setSelection(clickedMeasureId, staffId, anchorNoteId)
    // Use setTimeout 0 so selection state lands before insertNote reads it
    setTimeout(() => {
      useScoreStore.getState().setSelection(clickedMeasureId, staffId, anchorNoteId)
      useScoreStore.getState().insertNote({ pitch, octave, accidental: null })
    }, 0)
  }, [staves, setSelection])

  const isEmpty = measures.length === 1 && staves.every((st) => (measures[0].notesByStaff[st.id] ?? []).length === 0)

  return (
    <div
      className={styles.wrapper}
      role="application"
      aria-label="Score editor"
      tabIndex={0}
    >
      <div
        ref={containerRef}
        className={styles.canvas}
        onClick={handleClick}
      />
      {isEmpty && (
        <p className={styles.hint}>
          Select a duration (1–6), then press A–G or click on the staff to add notes.
        </p>
      )}
    </div>
  )
}
