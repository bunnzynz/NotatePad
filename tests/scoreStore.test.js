import { describe, it, expect, beforeEach } from 'vitest'
import { useScoreStore } from '../src/store/scoreStore.js'

beforeEach(() => {
  useScoreStore.getState().reset()
})

describe('scoreStore — core', () => {
  it('starts with one empty measure and a cursor in it', () => {
    const { measures, selection } = useScoreStore.getState()
    expect(measures).toHaveLength(1)
    expect(measures[0].notes).toHaveLength(0)
    expect(selection.measureId).toBe(measures[0].id)
    expect(selection.noteId).toBeNull()
  })

  it('inserts a note and advances the cursor', () => {
    const store = useScoreStore.getState()
    const measureId = store.measures[0].id

    store.insertNote({ pitch: 'C' })

    const { measures, selection } = useScoreStore.getState()
    expect(measures[0].notes).toHaveLength(1)
    expect(measures[0].notes[0].pitch).toBe('C')
    expect(selection.noteId).toBe(measures[0].notes[0].id)
    expect(selection.measureId).toBe(measureId)
  })

  it('uses inputState defaults when inserting', () => {
    useScoreStore.getState().setDuration('h')
    useScoreStore.getState().toggleAccidental('#')
    useScoreStore.getState().insertNote({ pitch: 'F' })

    const note = useScoreStore.getState().measures[0].notes[0]
    expect(note.pitch).toBe('F')
    expect(note.duration).toBe('h')
    expect(note.accidental).toBe('#')
  })

  it('inserts after the selected note, not always at end', () => {
    const store = useScoreStore.getState()
    store.insertNote({ pitch: 'C' })
    store.insertNote({ pitch: 'D' })
    store.insertNote({ pitch: 'E' })

    // Select the first note
    const firstNoteId = useScoreStore.getState().measures[0].notes[0].id
    useScoreStore.getState().setSelection(useScoreStore.getState().measures[0].id, firstNoteId)

    // Insert after first note
    useScoreStore.getState().insertNote({ pitch: 'X' })
    const notes = useScoreStore.getState().measures[0].notes
    expect(notes[0].pitch).toBe('C')
    expect(notes[1].pitch).toBe('X')
    expect(notes[2].pitch).toBe('D')
    expect(notes[3].pitch).toBe('E')
  })

  it('allows 20 notes in one bar — the freestyle guarantee', () => {
    const store = useScoreStore.getState()
    for (let i = 0; i < 20; i++) {
      store.insertNote({ pitch: 'C' })
    }
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(20)
  })

  it('deletes the selected note and moves cursor back', () => {
    const store = useScoreStore.getState()
    store.insertNote({ pitch: 'C' })
    store.insertNote({ pitch: 'D' })

    // D is selected (cursor on second note)
    useScoreStore.getState().deleteSelectedNote()

    const { measures, selection } = useScoreStore.getState()
    expect(measures[0].notes).toHaveLength(1)
    expect(measures[0].notes[0].pitch).toBe('C')
    expect(selection.noteId).toBe(measures[0].notes[0].id)
  })

  it('does nothing when deleting with no note selected', () => {
    useScoreStore.getState().insertNote({ pitch: 'C' })
    useScoreStore.getState().setSelection(useScoreStore.getState().measures[0].id, null)
    useScoreStore.getState().deleteSelectedNote()
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(1)
  })
})

describe('scoreStore — navigation', () => {
  it('moves selection right through notes', () => {
    const store = useScoreStore.getState()
    store.insertNote({ pitch: 'C' })
    store.insertNote({ pitch: 'D' })

    // Cursor is on D (last inserted). Move left to C.
    useScoreStore.getState().moveSelection('left')
    const noteAfterLeft = useScoreStore.getState().selection.noteId
    expect(useScoreStore.getState().measures[0].notes.find(n => n.id === noteAfterLeft)?.pitch).toBe('C')

    // Move right back to D
    useScoreStore.getState().moveSelection('right')
    const noteAfterRight = useScoreStore.getState().selection.noteId
    expect(useScoreStore.getState().measures[0].notes.find(n => n.id === noteAfterRight)?.pitch).toBe('D')
  })

  it('moves selection across measure boundaries', () => {
    useScoreStore.getState().insertNote({ pitch: 'C' })
    useScoreStore.getState().addMeasure()
    useScoreStore.getState().insertNote({ pitch: 'D' })

    // Currently in measure 2 on D. Move left → should go to measure 1.
    useScoreStore.getState().moveSelection('left')
    useScoreStore.getState().moveSelection('left')

    const { selection, measures } = useScoreStore.getState()
    expect(selection.measureId).toBe(measures[0].id)
  })
})

describe('scoreStore — input state', () => {
  it('sets duration', () => {
    useScoreStore.getState().setDuration('w')
    expect(useScoreStore.getState().inputState.duration).toBe('w')
  })

  it('toggles accidental on and off', () => {
    useScoreStore.getState().toggleAccidental('#')
    expect(useScoreStore.getState().inputState.accidental).toBe('#')
    useScoreStore.getState().toggleAccidental('#')
    expect(useScoreStore.getState().inputState.accidental).toBeNull()
  })

  it('switches accidental without double-toggle', () => {
    useScoreStore.getState().toggleAccidental('#')
    useScoreStore.getState().toggleAccidental('b')
    expect(useScoreStore.getState().inputState.accidental).toBe('b')
  })

  it('toggles dotted', () => {
    expect(useScoreStore.getState().inputState.dotted).toBe(false)
    useScoreStore.getState().toggleDotted()
    expect(useScoreStore.getState().inputState.dotted).toBe(true)
  })

  it('clamps octave to 1–8', () => {
    useScoreStore.getState().setOctave(10)
    expect(useScoreStore.getState().inputState.octave).toBe(8)
    useScoreStore.getState().setOctave(-5)
    expect(useScoreStore.getState().inputState.octave).toBe(1)
  })
})

describe('scoreStore — measures', () => {
  it('adds and removes measures', () => {
    useScoreStore.getState().addMeasure()
    expect(useScoreStore.getState().measures).toHaveLength(2)

    const id = useScoreStore.getState().measures[1].id
    useScoreStore.getState().removeMeasure(id)
    expect(useScoreStore.getState().measures).toHaveLength(1)
  })

  it('does not remove the last measure', () => {
    const id = useScoreStore.getState().measures[0].id
    useScoreStore.getState().removeMeasure(id)
    expect(useScoreStore.getState().measures).toHaveLength(1)
  })

  it('moves cursor to new measure after addMeasure', () => {
    useScoreStore.getState().addMeasure()
    const { selection, measures } = useScoreStore.getState()
    expect(selection.measureId).toBe(measures[1].id)
  })
})

describe('scoreStore — undo / redo', () => {
  it('undoes a note insertion', () => {
    useScoreStore.getState().insertNote({ pitch: 'C' })
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(1)

    useScoreStore.getState().undo()
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(0)
  })

  it('redoes after undo', () => {
    useScoreStore.getState().insertNote({ pitch: 'C' })
    useScoreStore.getState().undo()
    useScoreStore.getState().redo()
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(1)
  })

  it('clears redo stack when new action is taken', () => {
    useScoreStore.getState().insertNote({ pitch: 'C' })
    useScoreStore.getState().undo()
    useScoreStore.getState().insertNote({ pitch: 'D' })
    useScoreStore.getState().redo() // should be no-op
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(1)
    expect(useScoreStore.getState().measures[0].notes[0].pitch).toBe('D')
  })
})
