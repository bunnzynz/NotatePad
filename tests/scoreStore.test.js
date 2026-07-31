import { describe, it, expect, beforeEach } from 'vitest'
import { useScoreStore } from '../src/store/scoreStore.js'

beforeEach(() => {
  useScoreStore.getState().reset()
})

describe('scoreStore', () => {
  it('starts with one empty measure', () => {
    const { measures } = useScoreStore.getState()
    expect(measures).toHaveLength(1)
    expect(measures[0].notes).toHaveLength(0)
  })

  it('adds a note to a measure', () => {
    const { measures, addNote } = useScoreStore.getState()
    const measureId = measures[0].id
    addNote(measureId, { pitch: 'C4', duration: 'q' })
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(1)
    expect(useScoreStore.getState().measures[0].notes[0].pitch).toBe('C4')
  })

  it('allows more notes than the time signature (freestyle)', () => {
    const { measures, addNote } = useScoreStore.getState()
    const measureId = measures[0].id
    // Add 20 quarter notes to a 4/4 bar — should not throw or reject
    for (let i = 0; i < 20; i++) {
      addNote(measureId, { pitch: 'C4', duration: 'q' })
    }
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(20)
  })

  it('removes a note', () => {
    const { measures, addNote } = useScoreStore.getState()
    const measureId = measures[0].id
    addNote(measureId, { pitch: 'C4', duration: 'q' })
    const noteId = useScoreStore.getState().measures[0].notes[0].id
    useScoreStore.getState().removeNote(measureId, noteId)
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(0)
  })

  it('undoes and redoes correctly', () => {
    const { measures, addNote } = useScoreStore.getState()
    const measureId = measures[0].id
    addNote(measureId, { pitch: 'C4', duration: 'q' })
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(1)

    useScoreStore.getState().undo()
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(0)

    useScoreStore.getState().redo()
    expect(useScoreStore.getState().measures[0].notes).toHaveLength(1)
  })

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

  it('updates meta', () => {
    useScoreStore.getState().setMeta({ tempo: 90, title: 'Test Score' })
    const { meta } = useScoreStore.getState()
    expect(meta.tempo).toBe(90)
    expect(meta.title).toBe('Test Score')
  })
})
