import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

function snapshot(measures) {
  return JSON.parse(JSON.stringify(measures))
}

const firstId = uuid()

export const useScoreStore = create((set) => ({
  meta: {
    title: '',
    tempo: 120,
    timeSignature: [4, 4],
    keySignature: 'C',
    clef: 'treble',
  },

  // What the next entered note will use
  inputState: {
    duration: 'q',
    accidental: null, // null | '#' | 'b' | 'n'
    octave: 4,
    dotted: false,
  },

  measures: [{ id: firstId, notes: [] }],

  // Cursor: which measure + which note is selected (null noteId = end of measure)
  selection: {
    measureId: firstId,
    noteId: null,
  },

  history: {
    past: [],
    future: [],
  },

  // --- Meta ---
  setMeta: (updates) =>
    set((s) => ({ meta: { ...s.meta, ...updates } })),

  // --- Input state ---
  setDuration: (duration) =>
    set((s) => ({ inputState: { ...s.inputState, duration } })),

  toggleAccidental: (acc) =>
    set((s) => ({
      inputState: {
        ...s.inputState,
        accidental: s.inputState.accidental === acc ? null : acc,
      },
    })),

  toggleDotted: () =>
    set((s) => ({ inputState: { ...s.inputState, dotted: !s.inputState.dotted } })),

  setOctave: (octave) =>
    set((s) => ({
      inputState: { ...s.inputState, octave: Math.max(1, Math.min(8, octave)) },
    })),

  // --- Selection / cursor ---
  setSelection: (measureId, noteId) =>
    set({ selection: { measureId, noteId } }),

  moveSelection: (direction) =>
    set((s) => {
      const { selection, measures } = s
      const mIdx = measures.findIndex((m) => m.id === selection.measureId)
      if (mIdx === -1) return s
      const measure = measures[mIdx]
      const notes = measure.notes
      const nIdx = notes.findIndex((n) => n.id === selection.noteId)

      if (direction === 'right') {
        if (nIdx < notes.length - 1) {
          return { selection: { measureId: measure.id, noteId: notes[nIdx + 1].id } }
        }
        if (mIdx < measures.length - 1) {
          const next = measures[mIdx + 1]
          return { selection: { measureId: next.id, noteId: next.notes[0]?.id ?? null } }
        }
      }

      if (direction === 'left') {
        if (nIdx > 0) {
          return { selection: { measureId: measure.id, noteId: notes[nIdx - 1].id } }
        }
        if (nIdx === 0) {
          return { selection: { measureId: measure.id, noteId: null } }
        }
        if (mIdx > 0) {
          const prev = measures[mIdx - 1]
          const last = prev.notes[prev.notes.length - 1]
          return { selection: { measureId: prev.id, noteId: last?.id ?? null } }
        }
      }

      return s
    }),

  // --- Notes ---
  // Inserts after the selected note (or at end if nothing selected), then advances cursor.
  insertNote: (overrides = {}) => {
    const newId = uuid()
    set((s) => {
      const { selection, measures, inputState } = s
      const measureId = selection.measureId ?? measures[measures.length - 1]?.id
      if (!measureId) return s

      const newNote = {
        id: newId,
        pitch: overrides.pitch ?? 'C',
        octave: overrides.octave ?? inputState.octave,
        accidental: overrides.accidental !== undefined ? overrides.accidental : inputState.accidental,
        duration: overrides.duration ?? inputState.duration,
        dotted: overrides.dotted ?? inputState.dotted,
        isRest: overrides.isRest ?? false,
      }

      const past = [...s.history.past, snapshot(s.measures)]
      const newMeasures = measures.map((m) => {
        if (m.id !== measureId) return m
        if (!selection.noteId) {
          return { ...m, notes: [...m.notes, newNote] }
        }
        const idx = m.notes.findIndex((n) => n.id === selection.noteId)
        const notes = [
          ...m.notes.slice(0, idx + 1),
          newNote,
          ...m.notes.slice(idx + 1),
        ]
        return { ...m, notes }
      })

      return {
        measures: newMeasures,
        selection: { measureId, noteId: newId },
        history: { past, future: [] },
      }
    })
  },

  deleteSelectedNote: () =>
    set((s) => {
      const { selection, measures } = s
      if (!selection.noteId) return s

      const past = [...s.history.past, snapshot(s.measures)]
      let prevNoteId = null

      const newMeasures = measures.map((m) => {
        if (m.id !== selection.measureId) return m
        const idx = m.notes.findIndex((n) => n.id === selection.noteId)
        prevNoteId = m.notes[idx - 1]?.id ?? null
        return { ...m, notes: m.notes.filter((n) => n.id !== selection.noteId) }
      })

      return {
        measures: newMeasures,
        selection: { measureId: selection.measureId, noteId: prevNoteId },
        history: { past, future: [] },
      }
    }),

  // --- Measures ---
  addMeasure: () =>
    set((s) => {
      const newMeasure = { id: uuid(), notes: [] }
      const past = [...s.history.past, snapshot(s.measures)]
      return {
        measures: [...s.measures, newMeasure],
        selection: { measureId: newMeasure.id, noteId: null },
        history: { past, future: [] },
      }
    }),

  removeMeasure: (measureId) =>
    set((s) => {
      if (s.measures.length <= 1) return s
      const past = [...s.history.past, snapshot(s.measures)]
      const newMeasures = s.measures.filter((m) => m.id !== measureId)
      const lastMeasure = newMeasures[newMeasures.length - 1]
      return {
        measures: newMeasures,
        selection: { measureId: lastMeasure.id, noteId: null },
        history: { past, future: [] },
      }
    }),

  // --- Undo / Redo ---
  undo: () =>
    set((s) => {
      const { past, future } = s.history
      if (past.length === 0) return s
      return {
        measures: past[past.length - 1],
        history: {
          past: past.slice(0, -1),
          future: [snapshot(s.measures), ...future],
        },
      }
    }),

  redo: () =>
    set((s) => {
      const { past, future } = s.history
      if (future.length === 0) return s
      return {
        measures: future[0],
        history: {
          past: [...past, snapshot(s.measures)],
          future: future.slice(1),
        },
      }
    }),

  // --- Reset ---
  reset: () => {
    const id = uuid()
    set({
      meta: { title: '', tempo: 120, timeSignature: [4, 4], keySignature: 'C', clef: 'treble' },
      inputState: { duration: 'q', accidental: null, octave: 4, dotted: false },
      measures: [{ id, notes: [] }],
      selection: { measureId: id, noteId: null },
      history: { past: [], future: [] },
    })
  },
}))
