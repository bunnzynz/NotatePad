import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

const initialMeasure = () => ({
  id: uuid(),
  notes: [],
})

const initialState = {
  meta: {
    title: '',
    tempo: 120,
    timeSignature: [4, 4],
    keySignature: 'C',
  },
  measures: [initialMeasure()],
  selection: {
    measureId: null,
    noteId: null,
  },
  history: {
    past: [],
    future: [],
  },
}

function snapshot(measures) {
  return JSON.parse(JSON.stringify(measures))
}

export const useScoreStore = create((set, get) => ({
  ...initialState,

  // --- Meta ---
  setMeta: (updates) =>
    set((state) => ({ meta: { ...state.meta, ...updates } })),

  // --- Selection ---
  setSelection: (measureId, noteId) =>
    set({ selection: { measureId, noteId } }),

  // --- Measures ---
  addMeasure: () =>
    set((state) => {
      const past = [...state.history.past, snapshot(state.measures)]
      return {
        measures: [...state.measures, initialMeasure()],
        history: { past, future: [] },
      }
    }),

  removeMeasure: (measureId) =>
    set((state) => {
      if (state.measures.length <= 1) return state
      const past = [...state.history.past, snapshot(state.measures)]
      return {
        measures: state.measures.filter((m) => m.id !== measureId),
        history: { past, future: [] },
      }
    }),

  // --- Notes ---
  addNote: (measureId, note) =>
    set((state) => {
      const past = [...state.history.past, snapshot(state.measures)]
      const measures = state.measures.map((m) =>
        m.id === measureId
          ? { ...m, notes: [...m.notes, { id: uuid(), ...note }] }
          : m
      )
      return { measures, history: { past, future: [] } }
    }),

  removeNote: (measureId, noteId) =>
    set((state) => {
      const past = [...state.history.past, snapshot(state.measures)]
      const measures = state.measures.map((m) =>
        m.id === measureId
          ? { ...m, notes: m.notes.filter((n) => n.id !== noteId) }
          : m
      )
      return { measures, history: { past, future: [] } }
    }),

  updateNote: (measureId, noteId, updates) =>
    set((state) => {
      const past = [...state.history.past, snapshot(state.measures)]
      const measures = state.measures.map((m) =>
        m.id === measureId
          ? {
              ...m,
              notes: m.notes.map((n) =>
                n.id === noteId ? { ...n, ...updates } : n
              ),
            }
          : m
      )
      return { measures, history: { past, future: [] } }
    }),

  // --- Undo / Redo ---
  undo: () =>
    set((state) => {
      const { past, future } = state.history
      if (past.length === 0) return state
      const previous = past[past.length - 1]
      const newPast = past.slice(0, -1)
      return {
        measures: previous,
        history: {
          past: newPast,
          future: [snapshot(state.measures), ...future],
        },
      }
    }),

  redo: () =>
    set((state) => {
      const { past, future } = state.history
      if (future.length === 0) return state
      const next = future[0]
      const newFuture = future.slice(1)
      return {
        measures: next,
        history: {
          past: [...past, snapshot(state.measures)],
          future: newFuture,
        },
      }
    }),

  // --- Reset ---
  reset: () => set({ ...initialState, measures: [initialMeasure()] }),
}))
