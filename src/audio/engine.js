import * as Tone from 'tone'
import { useScoreStore } from '../store/scoreStore.js'

// Beat values in quarter-note units (q = 1 beat)
const BEAT_VAL = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25, '32': 0.125 }

function noteSecs(note, bpm) {
  const beats = BEAT_VAL[note.duration] ?? 1
  return (60 / bpm) * beats * (note.dotted ? 1.5 : 1)
}

function toPitch(note) {
  if (note.isRest) return null
  const acc = note.accidental === '#' ? '#'
            : note.accidental === 'b' ? 'b'
            : ''
  return `${note.pitch}${acc}${note.octave}`
}

// ── Singletons ────────────────────────────────────────────────────────────────

let synth = null
let metronomeId = null
let metronomeClick = null

function getSynth() {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
    }).toDestination()
  }
  return synth
}

function getClick() {
  if (!metronomeClick) {
    metronomeClick = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
    }).toDestination()
    metronomeClick.volume.value = -14
  }
  return metronomeClick
}

// ── Metronome ─────────────────────────────────────────────────────────────────

function stopMetronome() {
  if (metronomeId !== null) {
    Tone.Transport.clear(metronomeId)
    metronomeId = null
  }
}

function startMetronome(timeSig) {
  stopMetronome()
  const beatDuration = `${timeSig[1]}n`
  metronomeId = Tone.Transport.scheduleRepeat((time) => {
    getClick().triggerAttackRelease('C1', '32n', time)
  }, beatDuration)
}

// ── Note event builder ────────────────────────────────────────────────────────

function buildEvents(measures, staves, bpm, fromNoteId) {
  let startOffset = 0

  // First pass — find the time offset of the start note
  if (fromNoteId) {
    outer: for (const staff of staves) {
      let t = 0
      for (const measure of measures) {
        for (const note of measure.notesByStaff[staff.id] ?? []) {
          if (note.id === fromNoteId) { startOffset = t; break outer }
          t += noteSecs(note, bpm)
        }
      }
    }
  }

  // Second pass — build sound + highlight events, grouped by absolute time
  // Key: time string → { pitches[], noteIds[], maxDuration }
  const slots = new Map()

  staves.forEach((staff) => {
    let t = 0
    measures.forEach((measure) => {
      ;(measure.notesByStaff[staff.id] ?? []).forEach((note) => {
        const absTime = t - startOffset
        t += noteSecs(note, bpm)
        if (absTime < -0.001) return // before playback start

        const key = absTime.toFixed(6)
        if (!slots.has(key)) slots.set(key, { time: absTime, pitches: [], noteIds: [], dur: 0 })
        const slot = slots.get(key)
        const pitch = toPitch(note)
        if (pitch) slot.pitches.push(pitch)
        slot.noteIds.push(note.id)
        slot.dur = Math.max(slot.dur, noteSecs(note, bpm))
      })
    })
  })

  return { slots, startOffset }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function play(fromNoteId = null) {
  await Tone.start()

  const { measures, staves, meta, setPlayback } = useScoreStore.getState()
  const bpm = meta.tempo

  // Reset transport
  Tone.Transport.stop()
  Tone.Transport.cancel()
  getSynth().releaseAll()
  Tone.Transport.bpm.value = bpm

  const { slots } = buildEvents(measures, staves, bpm, fromNoteId)

  if (slots.size === 0) return

  let lastEnd = 0
  slots.forEach(({ time, pitches, noteIds, dur }) => {
    const t = Math.max(0, time)

    if (pitches.length > 0) {
      Tone.Transport.schedule((now) => {
        getSynth().triggerAttackRelease(pitches, dur, now)
      }, t)
    }

    Tone.Transport.schedule(() => {
      useScoreStore.getState().setPlayback({ playingNoteIds: noteIds })
    }, t)

    lastEnd = Math.max(lastEnd, time + dur)
  })

  // Clear highlight + flag after last note finishes
  Tone.Transport.schedule(() => {
    useScoreStore.getState().setPlayback({ isPlaying: false, playingNoteIds: [] })
    stopMetronome()
  }, lastEnd + 0.05)

  setPlayback({ isPlaying: true, playingNoteIds: [] })

  const { metronomeEnabled } = useScoreStore.getState().playback
  if (metronomeEnabled) startMetronome(meta.timeSignature)

  Tone.Transport.start()
}

export function stop() {
  Tone.Transport.stop()
  Tone.Transport.cancel()
  stopMetronome()
  synth?.releaseAll()
  useScoreStore.getState().setPlayback({ isPlaying: false, playingNoteIds: [] })
}

export function setVolume(db) {
  Tone.Destination.volume.value = db
}
