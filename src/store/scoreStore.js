import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'

const DIATONIC = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

// Middle line of each clef — used as reference when no previous note exists
const CLEF_MID = {
  treble: { pitch: 'B', octave: 4 },
  bass:   { pitch: 'D', octave: 3 },
  alto:   { pitch: 'C', octave: 4 },
  tenor:  { pitch: 'A', octave: 3 },
}

// Given a pitch letter, return the octave that places it closest to refPitch/refOctave
function nearestOctave(pitch, refPitch, refOctave) {
  const noteIdx = DIATONIC.indexOf(pitch)
  const refIdx  = DIATONIC.indexOf(refPitch)
  const refSteps = refIdx + refOctave * 7
  let bestOct = refOctave, bestDist = Infinity
  for (let oct = refOctave - 1; oct <= refOctave + 1; oct++) {
    const dist = Math.abs(noteIdx + oct * 7 - refSteps)
    if (dist < bestDist || (dist === bestDist && oct < bestOct)) {
      bestDist = dist; bestOct = oct
    }
  }
  return Math.max(1, Math.min(8, bestOct))
}

// Find the most recent note on a stave and use it as the octave reference.
// Falls back to the clef's middle line if no notes exist yet.
function getSmartOctave(pitch, staves, staveId, measures, selection) {
  const mIdx = measures.findIndex(m => m.id === selection.measureId)
  const currNotes = mIdx >= 0 ? (measures[mIdx].notesByStaff[staveId] ?? []) : []

  let ref = null
  if (selection.noteId) {
    const nIdx = currNotes.findIndex(n => n.id === selection.noteId)
    ref = currNotes[nIdx] ?? currNotes[currNotes.length - 1]
  } else {
    ref = currNotes[currNotes.length - 1]
  }

  if (!ref && mIdx > 0) {
    for (let i = mIdx - 1; i >= 0 && !ref; i--) {
      const prevNotes = measures[i].notesByStaff[staveId] ?? []
      if (prevNotes.length > 0) ref = prevNotes[prevNotes.length - 1]
    }
  }

  const clef = staves.find(s => s.id === staveId)?.clef ?? 'treble'
  const mid  = CLEF_MID[clef] ?? CLEF_MID.treble
  return ref ? nearestOctave(pitch, ref.pitch, ref.octave) : nearestOctave(pitch, mid.pitch, mid.octave)
}

function snapshot(state) {
  return JSON.parse(JSON.stringify({ measures: state.measures, staves: state.staves }))
}

const firstStaffId  = uuid()
const secondStaffId = uuid()
const firstMeasureId = uuid()

function emptyMeasure(staveIds) {
  const notesByStaff = {}
  staveIds.forEach((id) => { notesByStaff[id] = [] })
  return { id: uuid(), notesByStaff }
}

export const useScoreStore = create(
  persist(
    (set) => ({
  meta: {
    title: '',
    tempo: 120,
    timeSignature: [4, 4],
    keySignature: 'C',
  },

  // Staff definitions (order = top to bottom)
  staves: [
    { id: firstStaffId,  clef: 'treble', label: '' },
    { id: secondStaffId, clef: 'bass',   label: '' },
  ],

  inputState: {
    duration: 'q',
    accidental: null,
    octave: 4,
    dotted: false,
    isRest: false,
  },

  measures: [{ id: firstMeasureId, notesByStaff: { [firstStaffId]: [], [secondStaffId]: [] } }],

  selection: {
    measureId: firstMeasureId,
    staffId: firstStaffId,
    noteId: null,       // which note is highlighted blue (null = none selected)
    cursorNoteId: null, // where the cursor line sits (survives deselection)
  },

  history: { past: [], future: [] },

  // --- Meta ---
  setMeta: (updates) => set((s) => ({ meta: { ...s.meta, ...updates } })),

  // --- Input state ---
  setDuration: (duration) =>
    set((s) => {
      const newInput = { ...s.inputState, duration }
      if (!s.selection.noteId) return { inputState: newInput }
      const snap = snapshot(s)
      const newMeasures = s.measures.map((m) => {
        if (m.id !== s.selection.measureId) return m
        const notes = m.notesByStaff[s.selection.staffId] ?? []
        return { ...m, notesByStaff: { ...m.notesByStaff, [s.selection.staffId]: notes.map((n) => n.id === s.selection.noteId ? { ...n, duration } : n) } }
      })
      return { inputState: newInput, measures: newMeasures, history: { past: [...s.history.past, snap], future: [] } }
    }),

  toggleAccidental: (acc) =>
    set((s) => {
      const newAcc = s.inputState.accidental === acc ? null : acc
      const newInput = { ...s.inputState, accidental: newAcc }
      if (!s.selection.noteId) return { inputState: newInput }
      const snap = snapshot(s)
      const newMeasures = s.measures.map((m) => {
        if (m.id !== s.selection.measureId) return m
        const notes = m.notesByStaff[s.selection.staffId] ?? []
        return { ...m, notesByStaff: { ...m.notesByStaff, [s.selection.staffId]: notes.map((n) => n.id === s.selection.noteId ? { ...n, accidental: n.accidental === acc ? null : acc } : n) } }
      })
      return { inputState: newInput, measures: newMeasures, history: { past: [...s.history.past, snap], future: [] } }
    }),

  toggleDotted: () =>
    set((s) => {
      const newInput = { ...s.inputState, dotted: !s.inputState.dotted }
      if (!s.selection.noteId) return { inputState: newInput }
      const snap = snapshot(s)
      const newMeasures = s.measures.map((m) => {
        if (m.id !== s.selection.measureId) return m
        const notes = m.notesByStaff[s.selection.staffId] ?? []
        return { ...m, notesByStaff: { ...m.notesByStaff, [s.selection.staffId]: notes.map((n) => n.id === s.selection.noteId ? { ...n, dotted: !n.dotted } : n) } }
      })
      return { inputState: newInput, measures: newMeasures, history: { past: [...s.history.past, snap], future: [] } }
    }),

  setOctave: (octave) => set((s) => ({ inputState: { ...s.inputState, octave: Math.max(1, Math.min(8, octave)) } })),

  toggleRestMode: () =>
    set((s) => ({ inputState: { ...s.inputState, isRest: !s.inputState.isRest } })),

  // --- Staff management ---
  addStaff: (clef) =>
    set((s) => {
      const newStaff = { id: uuid(), clef, label: '' }
      const snap = snapshot(s)
      const newMeasures = s.measures.map((m) => ({
        ...m,
        notesByStaff: { ...m.notesByStaff, [newStaff.id]: [] },
      }))
      return {
        staves: [...s.staves, newStaff],
        measures: newMeasures,
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

  removeStaff: (staffId) =>
    set((s) => {
      if (s.staves.length <= 1) return s
      const snap = snapshot(s)
      const newStaves = s.staves.filter((st) => st.id !== staffId)
      const newMeasures = s.measures.map((m) => {
        const nbs = { ...m.notesByStaff }
        delete nbs[staffId]
        return { ...m, notesByStaff: nbs }
      })
      const newStaffId = newStaves[0].id
      return {
        staves: newStaves,
        measures: newMeasures,
        selection: { ...s.selection, staffId: newStaffId, noteId: null, cursorNoteId: null },
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

  setStaffClef: (staffId, clef) =>
    set((s) => ({
      staves: s.staves.map((st) => st.id === staffId ? { ...st, clef } : st),
    })),

  setActiveStaff: (staffId) =>
    set((s) => ({
      selection: { ...s.selection, staffId, noteId: null, cursorNoteId: null },
    })),

  // --- Selection / cursor ---
  // noteId = which note is highlighted blue. cursorNoteId = where the cursor line sits.
  // They stay in sync normally; deselecting only clears noteId, leaving cursorNoteId alone.
  setSelection: (measureId, staffId, noteId) =>
    set({ selection: { measureId, staffId, noteId, cursorNoteId: noteId } }),

  // Move cursor without selecting — left-click on empty space uses this.
  setCursorPosition: (measureId, staffId, cursorNoteId) =>
    set((s) => ({ selection: { ...s.selection, measureId, staffId, noteId: null, cursorNoteId } })),

  // Clear note selection while keeping cursor where it is — Escape uses this.
  clearNoteSelection: () =>
    set((s) => ({
      selection: {
        ...s.selection,
        noteId: null,
        cursorNoteId: s.selection.noteId ?? s.selection.cursorNoteId,
      },
    })),

  moveSelection: (direction) =>
    set((s) => {
      const { selection, measures } = s
      const mIdx = measures.findIndex((m) => m.id === selection.measureId)
      if (mIdx === -1) return s
      const measure = measures[mIdx]
      const notes = measure.notesByStaff[selection.staffId] ?? []
      const nIdx = notes.findIndex((n) => n.id === selection.noteId)

      if (direction === 'right') {
        if (nIdx < notes.length - 1) {
          const id = notes[nIdx + 1].id
          return { selection: { ...selection, noteId: id, cursorNoteId: id } }
        }
        if (mIdx < measures.length - 1) {
          const next = measures[mIdx + 1]
          const nextNotes = next.notesByStaff[selection.staffId] ?? []
          const id = nextNotes[0]?.id ?? null
          return { selection: { ...selection, measureId: next.id, noteId: id, cursorNoteId: id } }
        }
      }
      if (direction === 'left') {
        if (nIdx > 0) {
          const id = notes[nIdx - 1].id
          return { selection: { ...selection, noteId: id, cursorNoteId: id } }
        }
        if (nIdx === 0) return { selection: { ...selection, noteId: null, cursorNoteId: null } }
        if (mIdx > 0) {
          const prev = measures[mIdx - 1]
          const prevNotes = prev.notesByStaff[selection.staffId] ?? []
          const id = prevNotes[prevNotes.length - 1]?.id ?? null
          return { selection: { ...selection, measureId: prev.id, noteId: id, cursorNoteId: id } }
        }
      }
      return s
    }),

  // --- Notes ---
  insertNote: (overrides = {}) => {
    const newId = uuid()
    set((s) => {
      const { selection, measures, inputState, staves } = s
      // Click-to-insert can pass explicit measureId/staffId; keyboard entry uses selection.
      const measureId = overrides.measureId ?? selection.measureId ?? measures[measures.length - 1]?.id
      const staffId   = overrides.staffId   ?? selection.staffId   ?? staves[0]?.id
      if (!measureId || !staffId) return s

      // Auto-pick octave via voice-leading when pitch given but no explicit octave.
      // Click-to-insert always passes an explicit octave (from yToPitch) so this branch
      // is only used for keyboard A-G entry.
      let octave = overrides.octave
      if (octave === undefined) {
        octave = (overrides.pitch && !overrides.isRest)
          ? getSmartOctave(overrides.pitch, staves, staffId, measures, selection)
          : inputState.octave
      }

      const newNote = {
        id:          newId,
        pitch:       overrides.pitch       ?? 'C',
        octave,
        accidental:  overrides.accidental  !== undefined ? overrides.accidental : inputState.accidental,
        duration:    overrides.duration    ?? inputState.duration,
        dotted:      overrides.dotted      ?? inputState.dotted,
        isRest:      overrides.isRest      ?? false,
      }

      const snap = snapshot(s)
      const newMeasures = measures.map((m) => {
        if (m.id !== measureId) return m
        const notes = m.notesByStaff[staffId] ?? []
        let newNotes
        if (overrides.insertIndex !== undefined) {
          // Click-to-insert: place at a specific index within the measure.
          const idx = Math.max(0, Math.min(overrides.insertIndex, notes.length))
          newNotes = [...notes.slice(0, idx), newNote, ...notes.slice(idx)]
        } else {
          // Keyboard entry: insert after selected note, or after cursorNoteId if only cursor is set,
          // or at end if there is no anchor at all.
          const anchorId = selection.noteId ?? selection.cursorNoteId
          const idx = anchorId ? notes.findIndex((n) => n.id === anchorId) : -1
          if (idx === -1) {
            newNotes = [...notes, newNote]
          } else {
            newNotes = [...notes.slice(0, idx + 1), newNote, ...notes.slice(idx + 1)]
          }
        }
        return { ...m, notesByStaff: { ...m.notesByStaff, [staffId]: newNotes } }
      })

      return {
        measures: newMeasures,
        selection: { measureId, staffId, noteId: newId, cursorNoteId: newId },
        history: { past: [...s.history.past, snap], future: [] },
      }
    })
  },

  deleteSelectedNote: () =>
    set((s) => {
      const { selection, measures } = s
      if (!selection.noteId) return s
      const snap = snapshot(s)
      let prevNoteId = null

      const newMeasures = measures.map((m) => {
        if (m.id !== selection.measureId) return m
        const notes = m.notesByStaff[selection.staffId] ?? []
        const idx = notes.findIndex((n) => n.id === selection.noteId)
        prevNoteId = notes[idx - 1]?.id ?? null
        return { ...m, notesByStaff: { ...m.notesByStaff, [selection.staffId]: notes.filter((n) => n.id !== selection.noteId) } }
      })

      return {
        measures: newMeasures,
        selection: { ...selection, noteId: prevNoteId, cursorNoteId: prevNoteId },
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

  // Delete the note that comes AFTER the currently selected note (for Delete key).
  // If nothing is selected, deletes the first note in the active measure.
  deleteNextNote: () =>
    set((s) => {
      const { selection, measures } = s
      const snap = snapshot(s)

      const mIdx = measures.findIndex(m => m.id === selection.measureId)
      if (mIdx === -1) return s
      const notes = measures[mIdx].notesByStaff[selection.staffId] ?? []
      const nIdx  = selection.noteId ? notes.findIndex(n => n.id === selection.noteId) : -1
      const targetNote = notes[nIdx + 1] ?? null
      if (!targetNote) return s

      const newMeasures = measures.map((m) => {
        if (m.id !== selection.measureId) return m
        const mNotes = m.notesByStaff[selection.staffId] ?? []
        return { ...m, notesByStaff: { ...m.notesByStaff, [selection.staffId]: mNotes.filter(n => n.id !== targetNote.id) } }
      })

      return {
        measures: newMeasures,
        selection,  // cursor stays on the same note
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

  // Remove any accidental from the selected note, or clear inputState accidental.
  clearAccidental: () =>
    set((s) => {
      const newInput = { ...s.inputState, accidental: null }
      if (!s.selection.noteId) return { inputState: newInput }
      const snap = snapshot(s)
      const newMeasures = s.measures.map((m) => {
        if (m.id !== s.selection.measureId) return m
        const notes = m.notesByStaff[s.selection.staffId] ?? []
        return { ...m, notesByStaff: { ...m.notesByStaff, [s.selection.staffId]: notes.map((n) => n.id === s.selection.noteId ? { ...n, accidental: null } : n) } }
      })
      return { inputState: newInput, measures: newMeasures, history: { past: [...s.history.past, snap], future: [] } }
    }),

  // --- Measures ---
  addMeasure: () =>
    set((s) => {
      const snap = snapshot(s)
      const staveIds = s.staves.map((st) => st.id)
      const newMeasure = emptyMeasure(staveIds)
      return {
        measures: [...s.measures, newMeasure],
        selection: { ...s.selection, measureId: newMeasure.id, noteId: null, cursorNoteId: null },
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

  removeMeasure: (measureId) =>
    set((s) => {
      if (s.measures.length <= 1) return s
      const snap = snapshot(s)
      const newMeasures = s.measures.filter((m) => m.id !== measureId)
      const last = newMeasures[newMeasures.length - 1]
      return {
        measures: newMeasures,
        selection: { ...s.selection, measureId: last.id, noteId: null, cursorNoteId: null },
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

  // --- Pitch adjustment ---
  shiftNoteStep: (direction) =>
    set((s) => {
      const { selection, measures } = s
      if (!selection.noteId) return s
      const snap = snapshot(s)
      const delta = direction === 'up' ? 1 : -1
      const newMeasures = measures.map((m) => {
        if (m.id !== selection.measureId) return m
        const notes = m.notesByStaff[selection.staffId] ?? []
        const newNotes = notes.map((n) => {
          if (n.id !== selection.noteId || n.isRest) return n
          let idx = DIATONIC.indexOf(n.pitch) + delta
          let oct = n.octave
          if (idx >= 7) { idx = 0; oct++ }
          if (idx < 0)  { idx = 6; oct-- }
          return { ...n, pitch: DIATONIC[idx], octave: Math.max(1, Math.min(8, oct)) }
        })
        return { ...m, notesByStaff: { ...m.notesByStaff, [selection.staffId]: newNotes } }
      })
      return { measures: newMeasures, history: { past: [...s.history.past, snap], future: [] } }
    }),

  shiftNoteOctave: (direction) =>
    set((s) => {
      const { selection, measures } = s
      if (!selection.noteId) return s
      const snap = snapshot(s)
      const delta = direction === 'up' ? 1 : -1
      const newMeasures = measures.map((m) => {
        if (m.id !== selection.measureId) return m
        const notes = m.notesByStaff[selection.staffId] ?? []
        const newNotes = notes.map((n) => {
          if (n.id !== selection.noteId || n.isRest) return n
          return { ...n, octave: Math.max(1, Math.min(8, n.octave + delta)) }
        })
        return { ...m, notesByStaff: { ...m.notesByStaff, [selection.staffId]: newNotes } }
      })
      return { measures: newMeasures, history: { past: [...s.history.past, snap], future: [] } }
    }),

  // --- Load from file ---
  loadScore: (data) => {
    set({
      meta:      data.meta,
      staves:    data.staves,
      measures:  data.measures,
      selection: { measureId: data.measures[0]?.id ?? null, staffId: data.staves[0]?.id ?? null, noteId: null, cursorNoteId: null },
      inputState: { duration: 'q', accidental: null, octave: 4, dotted: false, isRest: false },
      history:   { past: [], future: [] },
    })
  },

  // --- Undo / Redo ---
  undo: () =>
    set((s) => {
      const { past, future } = s.history
      if (past.length === 0) return s
      const prev = past[past.length - 1]
      return {
        measures: prev.measures,
        staves:   prev.staves,
        history: { past: past.slice(0, -1), future: [snapshot(s), ...future] },
      }
    }),

  redo: () =>
    set((s) => {
      const { past, future } = s.history
      if (future.length === 0) return s
      return {
        measures: future[0].measures,
        staves:   future[0].staves,
        history: { past: [...past, snapshot(s)], future: future.slice(1) },
      }
    }),

  // --- Reset ---
  reset: () => {
    const sid1 = uuid()
    const sid2 = uuid()
    const mid  = uuid()
    set({
      meta: { title: '', tempo: 120, timeSignature: [4, 4], keySignature: 'C' },
      staves: [
        { id: sid1, clef: 'treble', label: '' },
        { id: sid2, clef: 'bass',   label: '' },
      ],
      inputState: { duration: 'q', accidental: null, octave: 4, dotted: false, isRest: false },
      measures: [{ id: mid, notesByStaff: { [sid1]: [], [sid2]: [] } }],
      selection: { measureId: mid, staffId: sid1, noteId: null, cursorNoteId: null },
      history: { past: [], future: [] },
    })
  },
}),
{
  name: 'notatepad-score',
  storage: createJSONStorage(() => sessionStorage),
  partialize: (state) => ({
    meta:       state.meta,
    staves:     state.staves,
    measures:   state.measures,
    selection:  state.selection,
    inputState: state.inputState,
  }),
}
)
)
