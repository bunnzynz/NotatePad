// Pure layout calculation — no React, no VexFlow, no side effects.
// Takes score data and returns a page/system/measure layout description.

export const PAGE_W    = 794    // A4 at 96 dpi
export const PAGE_H    = 1123
export const MAR_L     = 72
export const MAR_R     = 72
export const MAR_T     = 80
export const MAR_B     = 64
export const CONTENT_W = PAGE_W - MAR_L - MAR_R   // 650
export const CONTENT_H = PAGE_H - MAR_T - MAR_B   // 979

export const STAVE_H      = 40   // VexFlow stave height (4 × 10 px line spacing)
export const STAFF_GAP    = 46   // vertical gap between staves in a grand staff
export const SYS_ABOVE    = 40   // space above first stave in a system
export const SYS_BELOW    = 16   // space below last stave in a system
export const SYS_SPACING  = 52   // extra gap between systems

const NOTE_W_EST     = 28   // estimated px per note (layout only — VexFlow spaces them exactly)
const FIRST_OVERHEAD = 76   // extra width reserved for clef + time sig (first measure of system)
const MIN_MEAS_W     = 60   // minimum measure width

export function systemHeight(numStaves) {
  return SYS_ABOVE + numStaves * STAVE_H + Math.max(0, numStaves - 1) * STAFF_GAP + SYS_BELOW
}

function estimateW(measure, staves, isFirstInSystem) {
  const maxNotes = staves.reduce((mx, st) => Math.max(mx, (measure.notesByStaff[st.id] ?? []).length), 0)
  return Math.max(MIN_MEAS_W, (isFirstInSystem ? FIRST_OVERHEAD : 10) + maxNotes * NOTE_W_EST + 18)
}

/**
 * Returns:
 * {
 *   pages: [{
 *     systems: [{
 *       yTop: number,               // y within page content area (0-based, add MAR_T to get SVG y)
 *       firstMeasureNumber: number, // 1-based
 *       measures: [{
 *         measureIndex: number,     // index into global measures[]
 *         measure: object,
 *         x: number,                // x within page content area (0-based, add MAR_L to get SVG x)
 *         width: number,
 *         isFirstInSystem: boolean,
 *         isFirstInPiece: boolean,
 *       }]
 *     }]
 *   }]
 * }
 */
export function computeLayout(measures, staves, meta) {
  if (measures.length === 0) return { pages: [{ systems: [] }] }

  const sysH   = systemHeight(staves.length)
  const titleH = meta.title ? 56 : 0

  // ── 1. Greedy pack measures into systems ──────────────────────────────────
  const systems = []
  let curSys = [], curW = 0

  measures.forEach((m, mi) => {
    const firstInSys = curSys.length === 0
    const w = estimateW(m, staves, firstInSys)

    if (!firstInSys && curW + w > CONTENT_W) {
      // Start a new system
      systems.push(curSys)
      const w0 = estimateW(m, staves, true)
      curSys = [{ mi, m, w: w0 }]
      curW = w0
    } else {
      curSys.push({ mi, m, w })
      curW += w
    }
  })
  if (curSys.length > 0) systems.push(curSys)

  // ── 2. Justify widths so each system (except last) fills CONTENT_W ────────
  const justified = systems.map((sys, si) => {
    const isLast  = si === systems.length - 1
    const totalW  = sys.reduce((s, m) => s + m.w, 0)
    const scale   = isLast && systems.length > 1 ? 1 : CONTENT_W / totalW
    let x = 0
    return sys.map((item, idx) => {
      const width = Math.round(item.w * scale)
      const entry = {
        measureIndex:    item.mi,
        measure:         item.m,
        x,
        width,
        isFirstInSystem: idx === 0,
        isFirstInPiece:  item.mi === 0,
      }
      x += width
      return entry
    })
  })

  // ── 3. Pack systems into pages ────────────────────────────────────────────
  const pages = []
  let curPage = [], curY = titleH + (titleH > 0 ? 24 : 8)

  justified.forEach((sys) => {
    if (curPage.length > 0 && curY + sysH > CONTENT_H) {
      pages.push(curPage)
      curPage = []
      curY = 16
    }
    curPage.push({
      measures: sys,
      yTop: curY,
      firstMeasureNumber: sys[0].measureIndex + 1,
    })
    curY += sysH + SYS_SPACING
  })

  if (curPage.length > 0 || pages.length === 0) pages.push(curPage)

  return { pages }
}
