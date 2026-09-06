import { useEffect, useRef, useMemo, useCallback } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, StaveConnector, Dot } from 'vexflow'
import { useScoreStore } from '../../store/scoreStore.js'
import {
  computeLayout,
  PAGE_W, PAGE_H, MAR_L, MAR_T, CONTENT_W,
  STAVE_H, STAFF_GAP, SYS_ABOVE,
  systemHeight,
} from '../../notation/layout.js'
import styles from './ScoreCanvas.module.css'

// VexFlow places its stave's top line at (y + VEX_HEADROOM), not at y itself.
// space_above_staff_ln=4 × spacing_between_lines=10px → 40px headroom.
// STAVE_LINE_H is the distance from top line to bottom line (4 gaps × 10px).
const VEX_HEADROOM   = 40
const STAVE_LINE_H   = 40

// ── Pitch helpers ─────────────────────────────────────────────────────────────

const DIATONIC = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const CLEF_TOP = {
  treble: { idx: 3, oct: 5 },
  bass:   { idx: 5, oct: 3 },
  alto:   { idx: 4, oct: 4 },
  tenor:  { idx: 2, oct: 4 },
}

function yToPitch(clickY, topLineY, clef) {
  const ref  = CLEF_TOP[clef] ?? CLEF_TOP.treble
  const step = Math.round((clickY - topLineY) / 5)
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
  r.setAttribute('stroke', 'none')
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
  const insertNote   = useScoreStore((s) => s.insertNote)

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
          const hlTop    = sysY + VEX_HEADROOM - 8
          const hlBottom = sysY + (staves.length - 1) * (STAVE_H + STAFF_GAP) + VEX_HEADROOM + STAVE_LINE_H + 8
          bgGroup.appendChild(mkRect(
            sysX - 4, hlTop,
            CONTENT_W + 8, hlBottom - hlTop,
            'var(--color-accent-light)', 4
          ))
        }

        // Measure number
        if (system.firstMeasureNumber > 1) {
          const mn = mkText(`${system.firstMeasureNumber}`, sysX, sysY + VEX_HEADROOM - 6, '10', '400', 'start')
          mn.setAttribute('fill', '#999')
          svg.appendChild(mn)
        }

        const firstStavePerStaff = []

        // ── Staff rows ────────────────────────────────────────────────────
        staves.forEach((staff, sti) => {
          const staveTopY  = sysY + sti * (STAVE_H + STAFF_GAP)
          const topLineY   = staveTopY + VEX_HEADROOM
          const bottomLineY = topLineY + STAVE_LINE_H

          staffInfo.current.push({
            staffId: staff.id, clef: staff.clef, pageIdx: pi, systemIdx: si,
            y: topLineY, bottom: bottomLineY,
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
                const sn = new StaveNote({
                  keys: [vexKey(note)],
                  duration: vexDuration(note),
                  clef: staff.clef,
                })
                if (note.dotted && !note.isRest) Dot.buildAndAttach([sn], { all: true })
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
                  const ys = sn.getYs()
                  notePositions.current[nid] = {
                    x: sn.getAbsoluteX(),
                    y: ys.length > 0 ? ys[0] : topLineY + STAVE_LINE_H / 2,
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
          const selStaffIdx  = staves.findIndex(s => s.id === selection.staffId)
          const cursorOriginY = sysY + (selStaffIdx >= 0 ? selStaffIdx : 0) * (STAVE_H + STAFF_GAP)
          const cursorTopY    = cursorOriginY + VEX_HEADROOM
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
            cur.setAttribute('y1', cursorTopY - 4)
            cur.setAttribute('y2', cursorTopY + STAVE_LINE_H + 4)
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

  // ── Shared stave/measure hit detection ────────────────────────────────────

  function hitTest(pi, clickX, clickY) {
    // Find closest existing note
    let closest = null, minDist = Infinity
    for (const pos of Object.values(notePositions.current)) {
      if (pos.pageIdx !== pi) continue
      const dx = Math.abs(pos.x - clickX)
      const dy = Math.abs(pos.y - clickY)
      if (dx < 20 && dy < 20) {
        const d = dx + dy
        if (d < minDist) { minDist = d; closest = pos }
      }
    }

    // Find closest stave
    let hitStaff = null, minStaveDist = Infinity
    for (const sb of staffInfo.current) {
      if (sb.pageIdx !== pi) continue
      const mid  = (sb.y + sb.bottom) / 2
      const dist = Math.abs(clickY - mid)
      if (dist < minStaveDist) { minStaveDist = dist; hitStaff = sb }
    }

    // Find measure at click X
    let hitMeasureId = null
    if (hitStaff && minStaveDist <= 60) {
      for (const [measureId, infoArr] of Object.entries(measureInfo.current)) {
        const info = infoArr.find(i => i.pageIdx === pi && i.staffId === hitStaff.staffId)
        if (info && clickX >= info.staveX && clickX < info.staveX + info.staveW) {
          hitMeasureId = measureId; break
        }
      }
    }

    return { closest, hitStaff, hitMeasureId }
  }

  // ── Left click → select / navigate ───────────────────────────────────────

  const handlePageClick = useCallback((e, pi) => {
    const svg = pageRefs.current[pi]?.querySelector('svg')
    if (!svg) return
    const rect   = svg.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const { closest, hitStaff, hitMeasureId } = hitTest(pi, clickX, clickY)

    if (closest) { setSelection(closest.measureId, closest.staffId, closest.noteId); return }
    if (!hitStaff || !hitMeasureId) return

    // Clicking empty space switches to this stave/measure but clears any note selection,
    // so toolbar controls arm for the next insertion rather than editing an existing note.
    setSelection(hitMeasureId, hitStaff.staffId, null)
  }, [setSelection])

  // ── Right click → insert note at clicked pitch ────────────────────────────

  const handlePageRightClick = useCallback((e, pi) => {
    e.preventDefault()  // suppress browser context menu
    const svg = pageRefs.current[pi]?.querySelector('svg')
    if (!svg) return
    const rect   = svg.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const { hitStaff, hitMeasureId } = hitTest(pi, clickX, clickY)
    if (!hitStaff || !hitMeasureId) return

    const notesInMeasure = Object.values(notePositions.current)
      .filter(p => p.measureId === hitMeasureId && p.staffId === hitStaff.staffId && p.pageIdx === pi)
      .sort((a, b) => a.x - b.x)

    const { pitch, octave } = yToPitch(clickY, hitStaff.y, hitStaff.clef)
    const insertIndex = notesInMeasure.filter(p => p.x < clickX).length
    insertNote({ pitch, octave, measureId: hitMeasureId, staffId: hitStaff.staffId, insertIndex })
  }, [insertNote])

  const isEmpty = measures.length === 1 && staves.every(st => (measures[0].notesByStaff[st.id] ?? []).length === 0)

  return (
    <div className={styles.scoreArea}>
      {layout.pages.map((page, pi) => (
        <div key={pi} className={styles.page}>
          <div
            ref={el => { pageRefs.current[pi] = el }}
            className={styles.pageContent}
            onClick={(e) => handlePageClick(e, pi)}
            onContextMenu={(e) => handlePageRightClick(e, pi)}
          />
        </div>
      ))}
      {isEmpty && (
        <p className={styles.hint}>
          Right-click the staff to place a note · Left-click to select
        </p>
      )}
    </div>
  )
}
