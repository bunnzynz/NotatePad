import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

function snapshot(state) {
  return JSON.parse(JSON.stringify({ measures: state.measures, staves: state.staves }))
}

const firstStaffId = uuid()
const firstMeasureId = uuid()

function emptyMeasure(staveIds) {
  const notesByStaff = {}
  staveIds.forEach((id) => { notesByStaff[id] = [] })
  return { id: uuid(), notesByStaff }
}

export const useScoreStore = create((set) => ({
  meta: {
    title: '',
    tempo: 120,
    timeSignature: [4, 4],
    keySignature: 'C',
  },

  // Staff definitions (order = top to bottom)
  staves: [{ id: firstStaffId, clef: 'treble', label: '' }],

  inputState: {
    duration: 'q',
    accidental: null,
    octave: 4,
    dotted: false,
  },

  measures: [{ id: firstMeasureId, notesByStaff: { [firstStaffId]: [] } }],

  selection: {
    measureId: firstMeasureId,
    staffId: firstStaffId,
    noteId: null,
  },

  history: { past: [], future: [] },

  // --- Meta ---
  setMeta: (updates) => set((s) => ({ meta: { ...s.meta, ...updates } })),

  // --- Input state ---
  setDuration:       (duration)  => set((s) => ({ inputState: { ...s.inputState, duration } })),
  toggleAccidental:  (acc)       => set((s) => ({ inputState: { ...s.inputState, accidental: s.inputState.accidental === acc ? null : acc } })),
  toggleDotted:      ()          => set((s) => ({ inputState: { ...s.inputState, dotted: !s.inputState.dotted } })),
  setOctave:         (octave)    => set((s) => ({ inputState: { ...s.inputState, octave: Math.max(1, Math.min(8, octave)) } })),

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
        selection: { ...s.selection, staffId: newStaffId, noteId: null },
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

  setStaffClef: (staffId, clef) =>
    set((s) => ({
      staves: s.staves.map((st) => st.id === staffId ? { ...st, clef } : st),
    })),

  setActiveStaff: (staffId) =>
    set((s) => ({ selection: { ...s.selection, staffId, noteId: null } })),

  // --- Selection / cursor ---
  setSelection: (measureId, staffId, noteId) =>
    set({ selection: { measureId, staffId, noteId } }),

  moveSelection: (direction) =>
    set((s) => {
      const { selection, measures } = s
      const mIdx = measures.findIndex((m) => m.id === selection.measureId)
      if (mIdx === -1) return s
      const measure = measures[mIdx]
      const notes = measure.notesByStaff[selection.staffId] ?? []
      const nIdx = notes.findIndex((n) => n.id === selection.noteId)

      if (direction === 'right') {
        if (nIdx < notes.length - 1) return { selection: { ...selection, noteId: notes[nIdx + 1].id } }
        if (mIdx < measures.length - 1) {
          const next = measures[mIdx + 1]
          const nextNotes = next.notesByStaff[selection.staffId] ?? []
          return { selection: { ...selection, measureId: next.id, noteId: nextNotes[0]?.id ?? null } }
        }
      }
      if (direction === 'left') {
        if (nIdx > 0)  return { selection: { ...selection, noteId: notes[nIdx - 1].id } }
        if (nIdx === 0) return { selection: { ...selection, noteId: null } }
        if (mIdx > 0) {
          const prev = measures[mIdx - 1]
          const prevNotes = prev.notesByStaff[selection.staffId] ?? []
          return { selection: { ...selection, measureId: prev.id, noteId: prevNotes[prevNotes.length - 1]?.id ?? null } }
        }
      }
      return s
    }),

  // --- Notes ---
  insertNote: (overrides = {}) => {
    const newId = uuid()
    set((s) => {
      const { selection, measures, inputState } = s
      const measureId = selection.measureId ?? measures[measures.length - 1]?.id
      const staffId   = selection.staffId   ?? s.staves[0]?.id
      if (!measureId || !staffId) return s

      const newNote = {
        id:          newId,
        pitch:       overrides.pitch       ?? 'C',
        octave:      overrides.octave      ?? inputState.octave,
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
        if (!selection.noteId) {
          newNotes = [...notes, newNote]
        } else {
          const idx = notes.findIndex((n) => n.id === selection.noteId)
          newNotes = [...notes.slice(0, idx + 1), newNote, ...notes.slice(idx + 1)]
        }
        return { ...m, notesByStaff: { ...m.notesByStaff, [staffId]: newNotes } }
      })

      return {
        measures: newMeasures,
        selection: { measureId, staffId, noteId: newId },
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
        selection: { ...selection, noteId: prevNoteId },
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

  // --- Measures ---
  addMeasure: () =>
    set((s) => {
      const snap = snapshot(s)
      const staveIds = s.staves.map((st) => st.id)
      const newMeasure = emptyMeasure(staveIds)
      return {
        measures: [...s.measures, newMeasure],
        selection: { ...s.selection, measureId: newMeasure.id, noteId: null },
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
        selection: { ...s.selection, measureId: last.id, noteId: null },
        history: { past: [...s.history.past, snap], future: [] },
      }
    }),

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
    const sid = uuid()
    const mid = uuid()
    set({
      meta: { title: '', tempo: 120, timeSignature: [4, 4], keySignature: 'C' },
      staves: [{ id: sid, clef: 'treble', label: '' }],
      inputState: { duration: 'q', accidental: null, octave: 4, dotted: false },
      measures: [{ id: mid, notesByStaff: { [sid]: [] } }],
      selection: { measureId: mid, staffId: sid, noteId: null },
      history: { past: [], future: [] },
    })
  },
}))
