import { useEffect, useRef, useMemo, useCallback } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, StaveConnector } from 'vexflow'
import { useScoreStore } from '../../store/scoreStore.js'
import {
  computeLayout,
  PAGE_W, PAGE_H, MAR_L, MAR_T, CONTENT_W,
  STAVE_H, STAFF_GAP, SYS_ABOVE,
  systemHeight,
} from '../../notation/layout.js'
import styles from './ScoreCanvas.module.css'

// ── Pitch helpers ─────────────────────────────────────────────────────────────

const DIATONIC = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const CLEF_TOP = {
  treble: { idx: 3, oct: 5 },
  bass:   { idx: 5, oct: 3 },
  alto:   { idx: 4, oct: 4 },
  tenor:  { idx: 2, oct: 4 },
}

function yToPitch(clickY, staveTopY, clef) {
  const ref  = CLEF_TOP[clef] ?? CLEF_TOP.treble
  const step = Math.round((clickY - staveTopY) / 5)
  let ni = ref.idx - step, oct = ref.oct
  while (ni < 0)  { ni += 7; oct-- }
  while (ni >= 7) { ni -= 7; oct++ }
  return { pitch: DIATONIC[ni], octave: Math.max(1, Math.min(8, oct)) }
}

// ── Duration / beat helpers ───────────────────────────────────────────────────

const BEAT_VAL = { w: 1, h: 0.5, q: 0.25, '8': 0.125, '16': 0.0625, '32': 0.03125, '64': 0.015625 }

function noteBeatValue(note) {
  const base = BEAT_VAL[note.duration] ?? 0.25
  return note.dotted ? base * 1.5 : base
}

function measureCapacity([num, denom]) {
  return num / denom
}

// ── VexFlow helpers ───────────────────────────────────────────────────────────

function vexKey(note) {
  if (note.isRest) return 'b/4'
  const acc = note.accidental === '#' ? '#' : note.accidental === 'b' ? 'b' : ''
  return `${note.pitch.toLowerCase()}${acc}/${note.octave}`
}

function vexDuration(note) {
  let d = note.duration || 'q'
  if (note.dotted && !note.isRest) d += 'd'
  if (note.isRest) d += 'r'
  return d
}

// ── SVG primitives ────────────────────────────────────────────────────────────

function svgEl(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag)
}

function mkRect(x, y, w, h, fill, rx = 0) {
  const r = svgEl('rect')
  r.setAttribute('x', x); r.setAttribute('y', y)
  r.setAttribute('width', w); r.setAttribute('height', h)
  r.setAttribute('fill', fill); r.setAttribute('rx', rx)
  return r
}

function mkText(content, x, y, fontSize, fontWeight, anchor) {
  const t = svgEl('text')
  t.setAttribute('x', x); t.setAttribute('y', y)
  t.setAttribute('text-anchor', anchor)
  t.setAttribute('font-family', 'var(--font-ui)')
  t.setAttribute('font-size', fontSize)
  t.setAttribute('font-weight', fontWeight)
  t.setAttribute('fill', 'var(--color-text)')
  t.textContent = content
  return t
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScoreCanvas() {
  const measures     = useScoreStore((s) => s.measures)
  const staves       = useScoreStore((s) => s.staves)
  const meta         = useScoreStore((s) => s.meta)
  const selection    = useScoreStore((s) => s.selection)
  const setSelection = useScoreStore((s) => s.setSelection)

  const pageRefs      = useRef([])
  const notePositions = useRef({})
  const measureInfo   = useRef({})
  const staffInfo     = useRef([])

  const layout = useMemo(
    () => computeLayout(measures, staves, meta),
    [measures, staves, meta]
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    notePositions.current = {}
    measureInfo.current   = {}
    staffInfo.current     = []
    pageRefs.current      = pageRefs.current.slice(0, layout.pages.length)

    const sysH = systemHeight(staves.length)
    const cap  = measureCapacity(meta.timeSignature)

    layout.pages.forEach((page, pi) => {
      const container = pageRefs.current[pi]
      if (!container) return
      container.innerHTML = ''

      const renderer = new Renderer(container, Renderer.Backends.SVG)
      renderer.resize(PAGE_W, PAGE_H)
      const ctx = renderer.getContext()
      ctx.setFont('Bravura,Arial', 10)
      const svg = container.querySelector('svg')

      // ── Background group ──────────────────────────────────────────────────
      // Inserted as the FIRST child of the SVG so everything VexFlow draws
      // after (into its own root <g>) renders on top of our highlights.
      const bgGroup = svgEl('g')
      svg.insertBefore(bgGroup, svg.firstChild)

      // ── Title (page 0) ────────────────────────────────────────────────────
      if (pi === 0 && meta.title) {
        svg.appendChild(mkText(meta.title, PAGE_W / 2, MAR_T - 28, '18', '600', 'middle'))
      }

      // ── Page number (page 2+) ─────────────────────────────────────────────
      if (pi > 0) {
        const pn = mkText(`${pi + 1}`, PAGE_W / 2, PAGE_H - 24, '11', '400', 'middle')
        pn.setAttribute('fill', '#888')
        svg.appendChild(pn)
      }

      // ── Systems ───────────────────────────────────────────────────────────
      page.systems.forEach((system, si) => {
        const sysX = MAR_L
        const sysY = MAR_T + system.yTop

        // Active system highlight — drawn into bgGroup so it's behind all staves
        const isActiveSys = system.measures.some(ml => ml.measure.id === selection.measureId)
        if (isActiveSys) {
          bgGroup.appendChild(mkRect(
            sysX - 4, sysY - SYS_ABOVE,
            CONTENT_W + 8, sysH,
            'var(--color-accent-light)', 4
          ))
        }

        // Measure number
        if (system.firstMeasureNumber > 1) {
          const mn = mkText(`${system.firstMeasureNumber}`, sysX, sysY - SYS_ABOVE + 12, '10', '400', 'start')
          mn.setAttribute('fill', '#999')
          svg.appendChild(mn)
        }

        const firstStavePerStaff = []

        // ── Staff rows ────────────────────────────────────────────────────
        staves.forEach((staff, sti) => {
          const staveTopY = sysY + sti * (STAVE_H + STAFF_GAP)

          staffInfo.current.push({
            staffId: staff.id, pageIdx: pi, systemIdx: si,
            y: staveTopY, bottom: staveTopY + STAVE_H,
          })

          system.measures.forEach((ml, mi) => {
            const staveX = sysX + ml.x
            const stave  = new Stave(staveX, staveTopY, ml.width)

            if (ml.isFirstInSystem) stave.addClef(staff.clef)
            if (ml.isFirstInPiece)  stave.addTimeSignature(`${meta.timeSignature[0]}/${meta.timeSignature[1]}`)

            stave.setContext(ctx).draw()
            if (mi === 0) firstStavePerStaff.push(stave)

            if (!measureInfo.current[ml.measure.id]) measureInfo.current[ml.measure.id] = []
            measureInfo.current[ml.measure.id].push({ pageIdx: pi, staveX, staveW: ml.width, staveTopY, staffId: staff.id })

            const notes = ml.measure.notesByStaff[staff.id] ?? []
            if (notes.length === 0) return

            try {
              let beats = 0
              const staveNotes = notes.map((note) => {
                const sn = new StaveNote({ keys: [vexKey(note)], duration: vexDuration(note) })
                if (note.accidental && !note.isRest) sn.addModifier(new Accidental(note.accidental), 0)

                const overflow = beats >= cap
                beats += noteBeatValue(note)

                if (note.id === selection.noteId) {
                  sn.setStyle({ fillStyle: 'var(--color-accent)', strokeStyle: 'var(--color-accent)' })
                } else if (overflow) {
                  sn.setStyle({ fillStyle: 'var(--color-error)', strokeStyle: 'var(--color-error)' })
                }
                return sn
              })

              const voice = new Voice({ num_beats: meta.timeSignature[0], beat_value: meta.timeSignature[1] })
                .setMode(Voice.Mode.SOFT)
              voice.addTickables(staveNotes)

              const noteAreaW = Math.max(20, (stave.getX() + stave.getWidth()) - stave.getNoteStartX() - 6)
              new Formatter().joinVoices([voice]).format([voice], noteAreaW)
              voice.draw(ctx, stave)

              staveNotes.forEach((sn, idx) => {
                const nid = notes[idx]?.id
                if (nid) {
                  notePositions.current[nid] = {
                    x: sn.getAbsoluteX(), y: staveTopY,
                    pageIdx: pi, measureId: ml.measure.id, staffId: staff.id, noteId: nid,
                  }
                }
              })
            } catch (err) {
              console.warn('ScoreCanvas render error', err)
            }
          })
        })

        // System connectors
        if (staves.length > 1 && firstStavePerStaff.length >= 2) {
          try {
            new StaveConnector(firstStavePerStaff[0], firstStavePerStaff[staves.length - 1])
              .setType(StaveConnector.type.BRACE).setContext(ctx).draw()
            new StaveConnector(firstStavePerStaff[0], firstStavePerStaff[staves.length - 1])
              .setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw()
          } catch (_) {}
        } else if (staves.length === 1 && firstStavePerStaff.length > 0) {
          try {
            new StaveConnector(firstStavePerStaff[0], firstStavePerStaff[0])
              .setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw()
          } catch (_) {}
        }

        // Cursor line — appended to svg (after VexFlow's root <g>) so it's on top
        if (selection.measureId && isActiveSys) {
          const selStaffIdx = staves.findIndex(s => s.id === selection.staffId)
          const cursorStaveY = sysY + (selStaffIdx >= 0 ? selStaffIdx : 0) * (STAVE_H + STAFF_GAP)
          let cursorX = null

          if (selection.noteId && notePositions.current[selection.noteId]?.pageIdx === pi) {
            cursorX = notePositions.current[selection.noteId].x + 16
          } else {
            const mInfo = measureInfo.current[selection.measureId]
              ?.find(i => i.pageIdx === pi && i.staffId === selection.staffId)
            if (mInfo) {
              const sysFirstMeasure = layout.pages[pi].systems[si].measures[0]
              cursorX = mInfo.staveX + (sysFirstMeasure?.isFirstInPiece ? 80 : 18)
            }
          }

          if (cursorX !== null) {
            const cur = svgEl('line')
            cur.setAttribute('x1', cursorX); cur.setAttribute('x2', cursorX)
            cur.setAttribute('y1', cursorStaveY - 4)
            cur.setAttribute('y2', cursorStaveY + STAVE_H + 4)
            cur.setAttribute('stroke', 'var(--color-accent)')
            cur.setAttribute('stroke-width', '2')
            cur.setAttribute('stroke-linecap', 'round')
            cur.setAttribute('opacity', '0.85')
            svg.appendChild(cur)
          }
        }
      })
    })
  }, [layout, measures, staves, meta, selection])

  // ── Click handler ─────────────────────────────────────────────────────────

  const handlePageClick = useCallback((e, pi) => {
    const svg = pageRefs.current[pi]?.querySelector('svg')
    if (!svg) return
    const rect   = svg.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // 1. Select existing note
    let closest = null, minDist = Infinity
    for (const pos of Object.values(notePositions.current)) {
      if (pos.pageIdx !== pi) continue
      const d = Math.abs(pos.x - clickX)
      if (d < minDist && d < 24) { minDist = d; closest = pos }
    }
    if (closest) { setSelection(closest.measureId, closest.staffId, closest.noteId); return }

    // 2. Find clicked staff
    const THRESHOLD = 28
    const hitStaff = staffInfo.current.find(
      sb => sb.pageIdx === pi && clickY >= sb.y - THRESHOLD && clickY <= sb.bottom + THRESHOLD
    )
    if (!hitStaff) return

    // 3. Find clicked measure
    let hitMeasureId = null
    for (const [measureId, infoArr] of Object.entries(measureInfo.current)) {
      const info = infoArr.find(i => i.pageIdx === pi && i.staffId === hitStaff.staffId)
      if (info && clickX >= info.staveX && clickX < info.staveX + info.staveW) {
        hitMeasureId = measureId; break
      }
    }
    if (!hitMeasureId) return

    // 4. Pitch from Y
    const staffDef = staves.find(s => s.id === hitStaff.staffId)
    const { pitch, octave } = yToPitch(clickY, hitStaff.y, staffDef?.clef ?? 'treble')

    // 5. Insert position from X
    const notesInMeasure = Object.values(notePositions.current)
      .filter(p => p.measureId === hitMeasureId && p.staffId === hitStaff.staffId && p.pageIdx === pi)
      .sort((a, b) => a.x - b.x)

    let anchorNoteId = null
    for (const p of notesInMeasure) {
      if (p.x < clickX) anchorNoteId = p.noteId
    }

    setSelection(hitMeasureId, hitStaff.staffId, anchorNoteId)
    setTimeout(() => {
      const s = useScoreStore.getState()
      s.setSelection(hitMeasureId, hitStaff.staffId, anchorNoteId)
      s.insertNote({ pitch, octave, accidental: null })
    }, 0)
  }, [staves, setSelection])

  const isEmpty = measures.length === 1 && staves.every(st => (measures[0].notesByStaff[st.id] ?? []).length === 0)

  return (
    <div className={styles.scoreArea}>
      {layout.pages.map((page, pi) => (
        <div key={pi} className={styles.page}>
          <div
            ref={el => { pageRefs.current[pi] = el }}
            className={styles.pageContent}
            onClick={(e) => handlePageClick(e, pi)}
          />
        </div>
      ))}
      {isEmpty && (
        <p className={styles.hint}>
          Select a duration (1–6), then press A–G or click the staff to add notes.
        </p>
      )}
    </div>
  )
}
