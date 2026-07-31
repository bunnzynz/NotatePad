import { describe, it, expect, beforeEach } from 'vitest'
import { useScoreStore } from '../src/store/scoreStore.js'

// Helpers
function store() { return useScoreStore.getState() }
function firstStaffId() { return store().staves[0].id }
function firstMeasure() { return store().measures[0] }
function notes() { return firstMeasure().notesByStaff[firstStaffId()] ?? [] }

beforeEach(() => store().reset())

describe('initial state', () => {
  it('starts with one treble staff and one empty measure', () => {
    expect(store().staves).toHaveLength(1)
    expect(store().staves[0].clef).toBe('treble')
    expect(store().measures).toHaveLength(1)
    expect(notes()).toHaveLength(0)
  })

  it('cursor starts in first measure, first staff', () => {
    const { selection, measures, staves } = store()
    expect(selection.measureId).toBe(measures[0].id)
    expect(selection.staffId).toBe(staves[0].id)
    expect(selection.noteId).toBeNull()
  })
})

describe('note insertion', () => {
  it('inserts a note and advances cursor', () => {
    store().insertNote({ pitch: 'C' })
    expect(notes()).toHaveLength(1)
    expect(notes()[0].pitch).toBe('C')
    expect(store().selection.noteId).toBe(notes()[0].id)
  })

  it('uses inputState defaults', () => {
    store().setDuration('h')
    store().toggleAccidental('#')
    store().insertNote({ pitch: 'F' })
    const n = notes()[0]
    expect(n.duration).toBe('h')
    expect(n.accidental).toBe('#')
  })

  it('inserts after the cursor note, not always at end', () => {
    store().insertNote({ pitch: 'C' })
    store().insertNote({ pitch: 'D' })
    store().insertNote({ pitch: 'E' })
    // Move cursor back to first note
    const firstId = notes()[0].id
    store().setSelection(firstMeasure().id, firstStaffId(), firstId)
    store().insertNote({ pitch: 'X' })
    const ns = notes()
    expect(ns.map(n => n.pitch)).toEqual(['C', 'X', 'D', 'E'])
  })

  it('allows 20 notes in one bar — freestyle guarantee', () => {
    for (let i = 0; i < 20; i++) store().insertNote({ pitch: 'C' })
    expect(notes()).toHaveLength(20)
  })
})

describe('note deletion', () => {
  it('deletes the selected note and steps cursor back', () => {
    store().insertNote({ pitch: 'C' })
    store().insertNote({ pitch: 'D' })
    store().deleteSelectedNote()
    expect(notes()).toHaveLength(1)
    expect(notes()[0].pitch).toBe('C')
  })

  it('does nothing when no note is selected', () => {
    store().insertNote({ pitch: 'C' })
    store().setSelection(firstMeasure().id, firstStaffId(), null)
    store().deleteSelectedNote()
    expect(notes()).toHaveLength(1)
  })
})

describe('navigation', () => {
  it('moves right and left within a measure', () => {
    store().insertNote({ pitch: 'C' })
    store().insertNote({ pitch: 'D' })
    store().moveSelection('left')
    expect(store().selection.noteId).toBe(notes()[0].id)
    store().moveSelection('right')
    expect(store().selection.noteId).toBe(notes()[1].id)
  })

  it('moves across measure boundaries', () => {
    store().insertNote({ pitch: 'C' })
    store().addMeasure()
    store().insertNote({ pitch: 'D' })
    // Cursor is in measure 2. Move left twice to reach measure 1.
    store().moveSelection('left')
    store().moveSelection('left')
    expect(store().selection.measureId).toBe(store().measures[0].id)
  })
})

describe('input state', () => {
  it('sets duration', () => {
    store().setDuration('w')
    expect(store().inputState.duration).toBe('w')
  })

  it('toggles accidental on/off', () => {
    store().toggleAccidental('#')
    expect(store().inputState.accidental).toBe('#')
    store().toggleAccidental('#')
    expect(store().inputState.accidental).toBeNull()
  })

  it('switches accidental without double-toggle', () => {
    store().toggleAccidental('#')
    store().toggleAccidental('b')
    expect(store().inputState.accidental).toBe('b')
  })

  it('toggles dotted', () => {
    expect(store().inputState.dotted).toBe(false)
    store().toggleDotted()
    expect(store().inputState.dotted).toBe(true)
  })

  it('clamps octave to 1–8', () => {
    store().setOctave(99)
    expect(store().inputState.octave).toBe(8)
    store().setOctave(-99)
    expect(store().inputState.octave).toBe(1)
  })
})

describe('multi-staff', () => {
  it('adds a second staff', () => {
    store().addStaff('bass')
    expect(store().staves).toHaveLength(2)
    expect(store().staves[1].clef).toBe('bass')
  })

  it('new measures include all staves', () => {
    store().addStaff('bass')
    store().addMeasure()
    const m = store().measures[1]
    expect(Object.keys(m.notesByStaff)).toHaveLength(2)
  })

  it('notes on different staves are independent', () => {
    store().addStaff('bass')
    const trebleId = store().staves[0].id
    const bassId   = store().staves[1].id
    store().setActiveStaff(trebleId)
    store().insertNote({ pitch: 'C' })
    store().setActiveStaff(bassId)
    store().insertNote({ pitch: 'G' })
    const m = store().measures[0]
    expect(m.notesByStaff[trebleId]).toHaveLength(1)
    expect(m.notesByStaff[bassId]).toHaveLength(1)
    expect(m.notesByStaff[trebleId][0].pitch).toBe('C')
    expect(m.notesByStaff[bassId][0].pitch).toBe('G')
  })

  it('does not remove the last staff', () => {
    store().removeStaff(store().staves[0].id)
    expect(store().staves).toHaveLength(1)
  })
})

describe('measures', () => {
  it('adds and removes measures', () => {
    store().addMeasure()
    expect(store().measures).toHaveLength(2)
    store().removeMeasure(store().measures[1].id)
    expect(store().measures).toHaveLength(1)
  })

  it('does not remove the last measure', () => {
    store().removeMeasure(store().measures[0].id)
    expect(store().measures).toHaveLength(1)
  })

  it('cursor moves to new measure after addMeasure', () => {
    store().addMeasure()
    expect(store().selection.measureId).toBe(store().measures[1].id)
  })
})

describe('undo / redo', () => {
  it('undoes a note insertion', () => {
    store().insertNote({ pitch: 'C' })
    store().undo()
    expect(notes()).toHaveLength(0)
  })

  it('redoes after undo', () => {
    store().insertNote({ pitch: 'C' })
    store().undo()
    store().redo()
    expect(notes()).toHaveLength(1)
  })

  it('clears redo stack on new action', () => {
    store().insertNote({ pitch: 'C' })
    store().undo()
    store().insertNote({ pitch: 'D' })
    store().redo() // no-op
    expect(notes()).toHaveLength(1)
    expect(notes()[0].pitch).toBe('D')
  })
})
