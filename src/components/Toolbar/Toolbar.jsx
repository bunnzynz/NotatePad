import { useScoreStore } from '../../store/scoreStore.js'
import styles from './Toolbar.module.css'

const DURATIONS = [
  { label: 'W',   value: 'w',  title: 'Whole (1)'   },
  { label: 'H',   value: 'h',  title: 'Half (2)'    },
  { label: 'Q',   value: 'q',  title: 'Quarter (3)' },
  { label: '8',   value: '8',  title: '8th (4)'     },
  { label: '16',  value: '16', title: '16th (5)'    },
  { label: '32',  value: '32', title: '32nd (6)'    },
]

const CLEFS = [
  { label: 'Treble', value: 'treble' },
  { label: 'Bass',   value: 'bass'   },
]

export default function Toolbar() {
  const undo          = useScoreStore((s) => s.undo)
  const redo          = useScoreStore((s) => s.redo)
  const addMeasure    = useScoreStore((s) => s.addMeasure)
  const removeMeasure = useScoreStore((s) => s.removeMeasure)
  const setMeta       = useScoreStore((s) => s.setMeta)
  const setDuration   = useScoreStore((s) => s.setDuration)
  const toggleAcc     = useScoreStore((s) => s.toggleAccidental)
  const toggleDotted  = useScoreStore((s) => s.toggleDotted)
  const setOctave     = useScoreStore((s) => s.setOctave)
  const inputState    = useScoreStore((s) => s.inputState)
  const meta          = useScoreStore((s) => s.meta)
  const selection     = useScoreStore((s) => s.selection)
  const measures      = useScoreStore((s) => s.measures)

  const activeMeasure = measures.find((m) => m.id === selection.measureId)

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Notation tools">

      {/* History */}
      <div className={styles.group} role="group" aria-label="History">
        <button className={styles.btn} onClick={undo} aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)">↩</button>
        <button className={styles.btn} onClick={redo} aria-label="Redo (Ctrl+Y)" title="Redo (Ctrl+Y)">↪</button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Duration */}
      <div className={styles.group} role="group" aria-label="Note duration">
        {DURATIONS.map((d) => (
          <button
            key={d.value}
            className={styles.btn}
            aria-label={d.title}
            aria-pressed={inputState.duration === d.value}
            title={d.title}
            onClick={() => setDuration(d.value)}
          >
            {d.label}
          </button>
        ))}
        <button
          className={styles.btn}
          aria-label="Toggle dotted (.)"
          aria-pressed={inputState.dotted}
          title="Dotted (.)"
          onClick={toggleDotted}
        >
          •
        </button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Accidentals */}
      <div className={styles.group} role="group" aria-label="Accidentals">
        <button
          className={styles.btn}
          aria-label="Sharp (+)"
          aria-pressed={inputState.accidental === '#'}
          title="Sharp (+)"
          onClick={() => toggleAcc('#')}
        >♯</button>
        <button
          className={styles.btn}
          aria-label="Flat (−)"
          aria-pressed={inputState.accidental === 'b'}
          title="Flat (−)"
          onClick={() => toggleAcc('b')}
        >♭</button>
        <button
          className={styles.btn}
          aria-label="Natural (=)"
          aria-pressed={inputState.accidental === 'n'}
          title="Natural (=)"
          onClick={() => toggleAcc('n')}
        >♮</button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Octave */}
      <div className={styles.group} role="group" aria-label="Octave">
        <span className={styles.label}>Oct</span>
        <button
          className={styles.btn}
          aria-label="Octave down (Ctrl+Down)"
          title="Octave down (Ctrl+↓)"
          onClick={() => setOctave(inputState.octave - 1)}
        >↓</button>
        <span className={styles.octaveDisplay} aria-live="polite" aria-label={`Octave ${inputState.octave}`}>
          {inputState.octave}
        </span>
        <button
          className={styles.btn}
          aria-label="Octave up (Ctrl+Up)"
          title="Octave up (Ctrl+↑)"
          onClick={() => setOctave(inputState.octave + 1)}
        >↑</button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Clef */}
      <div className={styles.group} role="group" aria-label="Clef">
        {CLEFS.map((c) => (
          <button
            key={c.value}
            className={styles.btn}
            aria-label={`${c.label} clef`}
            aria-pressed={meta.clef === c.value}
            title={`${c.label} clef`}
            onClick={() => setMeta({ clef: c.value })}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Measures */}
      <div className={styles.group} role="group" aria-label="Measures">
        <button
          className={styles.btn}
          aria-label="Add measure"
          title="Add measure"
          onClick={addMeasure}
        >+ Bar</button>
        <button
          className={styles.btn}
          aria-label="Remove current measure"
          title="Remove current measure"
          onClick={() => activeMeasure && removeMeasure(activeMeasure.id)}
          disabled={measures.length <= 1}
        >− Bar</button>
      </div>

      {/* Spacer pushes accessibility toggle to the right */}
      <div className={styles.spacer} aria-hidden="true" />

      {/* Accessibility */}
      <div className={styles.group} role="group" aria-label="Accessibility">
        <button
          className={styles.btn}
          aria-label="Toggle high contrast mode"
          title="High contrast"
          onClick={() => document.body.classList.toggle('high-contrast')}
        >◑</button>
      </div>
    </div>
  )
}
