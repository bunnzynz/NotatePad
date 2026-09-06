import { useScoreStore } from '../../store/scoreStore.js'
import styles from './Toolbar.module.css'

const DURATIONS = [
  { label: 'W', value: 'w',  title: 'Whole (1)'   },
  { label: 'H', value: 'h',  title: 'Half (2)'    },
  { label: 'Q', value: 'q',  title: 'Quarter (3)' },
  { label: '8', value: '8',  title: '8th (4)'     },
  { label: '16', value: '16', title: '16th (5)'   },
  { label: '32', value: '32', title: '32nd (6)'   },
]

const TIME_SIGS = ['2/4', '3/4', '4/4', '3/8', '6/8', '12/8']

const KEY_SIGS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db']

const CLEF_OPTIONS = [
  { label: 'Treble', value: 'treble' },
  { label: 'Bass',   value: 'bass'   },
]

export default function Toolbar() {
  const undo             = useScoreStore((s) => s.undo)
  const redo             = useScoreStore((s) => s.redo)
  const addMeasure       = useScoreStore((s) => s.addMeasure)
  const removeMeasure    = useScoreStore((s) => s.removeMeasure)
  const setMeta          = useScoreStore((s) => s.setMeta)
  const setDuration      = useScoreStore((s) => s.setDuration)
  const toggleAcc        = useScoreStore((s) => s.toggleAccidental)
  const clearAcc         = useScoreStore((s) => s.clearAccidental)
  const toggleDotted     = useScoreStore((s) => s.toggleDotted)
  const addStaff         = useScoreStore((s) => s.addStaff)
  const removeStaff      = useScoreStore((s) => s.removeStaff)
  const setStaffClef     = useScoreStore((s) => s.setStaffClef)
  const setActiveStaff   = useScoreStore((s) => s.setActiveStaff)
  const loadScore        = useScoreStore((s) => s.loadScore)
  const inputState       = useScoreStore((s) => s.inputState)
  const meta             = useScoreStore((s) => s.meta)
  const staves           = useScoreStore((s) => s.staves)
  const selection        = useScoreStore((s) => s.selection)
  const measures         = useScoreStore((s) => s.measures)

  const activeMeasure  = measures.find((m) => m.id === selection.measureId)
  const timeSigStr     = `${meta.timeSignature[0]}/${meta.timeSignature[1]}`

  function handleTimeSig(str) {
    const [n, d] = str.split('/').map(Number)
    setMeta({ timeSignature: [n, d] })
  }

  function handleSave() {
    const data = JSON.stringify({ meta, staves, measures }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${meta.title || 'Untitled Score'}.notatePad`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleOpen(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.measures && data.staves && data.meta) loadScore(data)
      } catch { /* ignore bad files */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Notation tools">

      {/* History */}
      <div className={styles.group} role="group" aria-label="History">
        <button className={styles.btn} onClick={undo} title="Undo (Ctrl+Z)" aria-label="Undo">↩</button>
        <button className={styles.btn} onClick={redo} title="Redo (Ctrl+Y)" aria-label="Redo">↪</button>
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
          >{d.label}</button>
        ))}
        <button
          className={styles.btn}
          aria-label="Dotted (.)"
          aria-pressed={inputState.dotted}
          title="Dotted (.)"
          onClick={toggleDotted}
        >·</button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Accidentals */}
      <div className={styles.group} role="group" aria-label="Accidentals">
        <button className={styles.btn} aria-pressed={inputState.accidental === '#'} title="Sharp (+)" onClick={() => toggleAcc('#')}>♯</button>
        <button className={styles.btn} aria-pressed={inputState.accidental === 'b'} title="Flat (−)"  onClick={() => toggleAcc('b')}>♭</button>
        <button className={styles.btn} title="Remove accidental (=)" onClick={clearAcc}>♮</button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Time signature */}
      <div className={styles.group} role="group" aria-label="Time signature">
        <span className={styles.label}>Time</span>
        <select
          className={styles.select}
          value={timeSigStr}
          onChange={(e) => handleTimeSig(e.target.value)}
          aria-label="Time signature"
        >
          {TIME_SIGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
          {!TIME_SIGS.includes(timeSigStr) && (
            <option value={timeSigStr}>{timeSigStr}</option>
          )}
        </select>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Key signature */}
      <div className={styles.group} role="group" aria-label="Key signature">
        <span className={styles.label}>Key</span>
        <select
          className={styles.select}
          value={meta.keySignature}
          onChange={(e) => setMeta({ keySignature: e.target.value })}
          aria-label="Key signature"
        >
          {KEY_SIGS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Staves */}
      <div className={styles.group} role="group" aria-label="Staves">
        {staves.map((staff, i) => (
          <button
            key={staff.id}
            className={styles.btn}
            aria-pressed={selection.staffId === staff.id}
            title={`Switch to staff ${i + 1} (${staff.clef})`}
            onClick={() => setActiveStaff(staff.id)}
          >
            {staff.clef === 'treble' ? '𝄞' : '𝄢'}{staves.length > 1 ? ` ${i + 1}` : ''}
          </button>
        ))}
        {staves.length < 4 && (
          <button
            className={styles.btn}
            title="Add bass staff below"
            onClick={() => addStaff(staves.some(s => s.clef === 'bass') ? 'treble' : 'bass')}
            aria-label="Add staff"
          >+Staff</button>
        )}
        {staves.length > 1 && (
          <button
            className={styles.btn}
            title="Remove selected staff"
            onClick={() => removeStaff(selection.staffId)}
            aria-label="Remove selected staff"
          >−Staff</button>
        )}
        <select
          className={styles.select}
          value={staves.find(s => s.id === selection.staffId)?.clef ?? 'treble'}
          onChange={(e) => setStaffClef(selection.staffId, e.target.value)}
          aria-label="Clef for active staff"
          title="Change clef for the selected staff"
        >
          {CLEF_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Bars */}
      <div className={styles.group} role="group" aria-label="Measures">
        <button className={styles.btn} onClick={addMeasure} title="Add bar">+Bar</button>
        <button
          className={styles.btn}
          onClick={() => activeMeasure && removeMeasure(activeMeasure.id)}
          disabled={measures.length <= 1}
          title="Remove current bar"
        >−Bar</button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* File */}
      <div className={styles.group} role="group" aria-label="File">
        <button className={styles.btn} onClick={handleSave} title="Save score to file">Save</button>
        <label className={styles.btn} title="Open score from file" style={{ cursor: 'pointer' }}>
          Open
          <input type="file" accept=".notatePad,application/json" onChange={handleOpen} style={{ display: 'none' }} />
        </label>
      </div>

      <div className={styles.spacer} />

      {/* Accessibility */}
      <button
        className={styles.btn}
        title="Toggle high contrast"
        aria-label="Toggle high contrast mode"
        onClick={() => document.body.classList.toggle('high-contrast')}
      >◑</button>
    </div>
  )
}
