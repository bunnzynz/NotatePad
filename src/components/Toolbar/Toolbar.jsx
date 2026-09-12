import { useScoreStore } from '../../store/scoreStore.js'
import styles from './Toolbar.module.css'

const DURATIONS = [
  { label: 'W',  value: 'w',  title: 'Whole (1)'   },
  { label: 'H',  value: 'h',  title: 'Half (2)'    },
  { label: 'Q',  value: 'q',  title: 'Quarter (3)' },
  { label: '8',  value: '8',  title: '8th (4)'     },
  { label: '16', value: '16', title: '16th (5)'    },
]

const RESTS = [
  { label: 'W',  value: 'w',  title: 'Whole rest'   },
  { label: 'H',  value: 'h',  title: 'Half rest'    },
  { label: 'Q',  value: 'q',  title: 'Quarter rest' },
  { label: '8',  value: '8',  title: '8th rest'     },
  { label: '16', value: '16', title: '16th rest'    },
]

const TIME_SIGS    = ['2/4', '3/4', '4/4', '3/8', '6/8', '12/8']
const KEY_SIGS     = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db']
const CLEF_OPTIONS = [{ label: 'Treble', value: 'treble' }, { label: 'Bass', value: 'bass' }]

function Group({ label, children, className }) {
  return (
    <div className={`${styles.group}${className ? ` ${className}` : ''}`}>
      <div className={styles.groupButtons}>{children}</div>
      <span className={styles.groupLabel}>{label}</span>
    </div>
  )
}


export default function Toolbar({ activeTab, setActiveTab }) {

  const undo            = useScoreStore((s) => s.undo)
  const redo            = useScoreStore((s) => s.redo)
  const addMeasure      = useScoreStore((s) => s.addMeasure)
  const removeMeasure   = useScoreStore((s) => s.removeMeasure)
  const setMeta         = useScoreStore((s) => s.setMeta)
  const setDuration     = useScoreStore((s) => s.setDuration)
  const setRestDuration = useScoreStore((s) => s.setRestDuration)
  const insertNote      = useScoreStore((s) => s.insertNote)
  const toggleAcc       = useScoreStore((s) => s.toggleAccidental)
  const toggleNatural   = useScoreStore((s) => s.toggleNatural)
  const toggleDotted    = useScoreStore((s) => s.toggleDotted)
  const shiftNoteStep   = useScoreStore((s) => s.shiftNoteStep)
  const shiftNoteOctave = useScoreStore((s) => s.shiftNoteOctave)
  const addStaff        = useScoreStore((s) => s.addStaff)
  const removeStaff     = useScoreStore((s) => s.removeStaff)
  const setStaffClef    = useScoreStore((s) => s.setStaffClef)
  const setActiveStaff  = useScoreStore((s) => s.setActiveStaff)
  const loadScore       = useScoreStore((s) => s.loadScore)
  const inputState      = useScoreStore((s) => s.inputState)
  const meta            = useScoreStore((s) => s.meta)
  const staves          = useScoreStore((s) => s.staves)
  const selection       = useScoreStore((s) => s.selection)
  const measures        = useScoreStore((s) => s.measures)

  const activeMeasure = measures.find((m) => m.id === selection.measureId)
  const selectedNote  = activeMeasure?.notesByStaff[selection.staffId]?.find((n) => n.id === selection.noteId)
  const timeSigStr    = `${meta.timeSignature[0]}/${meta.timeSignature[1]}`

  const accDisabled   = (!selectedNote && inputState.isRest) || !!selectedNote?.isRest
  const pitchDisabled = !selectedNote || selectedNote.isRest

  function handleRestClick(duration) {
    if (selection.noteId) {
      setRestDuration(duration)          // convert selected note → rest
    } else {
      insertNote({ isRest: true, duration })  // insert rest at cursor immediately
    }
  }

  function handleTimeSig(str) {
    const [n, d] = str.split('/').map(Number)
    setMeta({ timeSignature: [n, d] })
  }

  function handleSave() {
    const data = JSON.stringify({ meta, staves, measures }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
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
    <div className={styles.ribbon} role="toolbar" aria-label="Notation tools">

      {/* Tab strip */}
      <div className={styles.tabStrip} role="tablist">
        <button role="tab" className={styles.tab} aria-selected={activeTab === 'notation'} onClick={() => setActiveTab('notation')}>Notation</button>
        <button role="tab" className={styles.tab} aria-selected={activeTab === 'file'}     onClick={() => setActiveTab('file')}>File</button>
        <button role="tab" className={styles.tab} aria-selected={activeTab === 'guide'}    onClick={() => setActiveTab('guide')}>Guide</button>
      </div>

      {/* Ribbon content */}
      <div className={styles.ribbonContent}>

        {activeTab === 'notation' && (<>

          <Group label="History">
            <button className={styles.btn} data-tooltip="Undo · Ctrl+Z" onClick={undo}>↩</button>
            <button className={styles.btn} data-tooltip="Redo · Ctrl+Y" onClick={redo}>↪</button>
          </Group>

          <Group label="Notes">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                className={styles.btn}
                aria-label={d.title}
                aria-pressed={!inputState.isRest && inputState.duration === d.value}
                data-tooltip={`${d.title.split(' (')[0]} · ${d.value === 'w' ? '1' : d.value === 'h' ? '2' : d.value === 'q' ? '3' : d.value === '8' ? '4' : '5'}`}
                onClick={() => setDuration(d.value)}
              >{d.label}</button>
            ))}
            <button className={styles.btn} aria-pressed={inputState.dotted} data-tooltip="Dotted · ." onClick={toggleDotted}>·</button>
          </Group>

          <Group label="Accidentals">
            <button className={styles.btn} aria-pressed={inputState.accidental === '#'} data-tooltip="Sharp · +" disabled={accDisabled} onClick={() => toggleAcc('#')}>♯</button>
            <button className={styles.btn} aria-pressed={inputState.accidental === 'b'} data-tooltip="Flat · −"  disabled={accDisabled} onClick={() => toggleAcc('b')}>♭</button>
            <button className={styles.btn} aria-pressed={inputState.accidental === 'n'} data-tooltip="Natural · =" disabled={accDisabled} onClick={toggleNatural}>♮</button>
          </Group>

          <Group label="Pitch">
            <span className={styles.label}>Step</span>
            <button className={styles.btn} data-tooltip="Step up · ↑"        disabled={pitchDisabled} onClick={() => shiftNoteStep('up')}>↑</button>
            <button className={styles.btn} data-tooltip="Step down · ↓"      disabled={pitchDisabled} onClick={() => shiftNoteStep('down')}>↓</button>
            <span className={styles.divider} aria-hidden="true" />
            <span className={styles.label}>Oct</span>
            <button className={styles.btn} data-tooltip="Octave up · Ctrl+↑" disabled={pitchDisabled} onClick={() => shiftNoteOctave('up')}>↑</button>
            <button className={styles.btn} data-tooltip="Octave down · Ctrl+↓" disabled={pitchDisabled} onClick={() => shiftNoteOctave('down')}>↓</button>
          </Group>

          <Group label="Rests">
            {RESTS.map((r, i) => (
              <button
                key={r.value}
                className={styles.btn}
                aria-label={r.title}
                aria-pressed={inputState.isRest && inputState.duration === r.value}
                data-tooltip={`${r.title} · ${i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : i === 3 ? '4' : '5'} then R`}
                onClick={() => handleRestClick(r.value)}
              >{r.label}</button>
            ))}
          </Group>

          <Group label="Score">
            <span className={styles.label}>Time</span>
            <select className={styles.select} value={timeSigStr} onChange={(e) => handleTimeSig(e.target.value)} aria-label="Time signature">
              {TIME_SIGS.map((t) => <option key={t} value={t}>{t}</option>)}
              {!TIME_SIGS.includes(timeSigStr) && <option value={timeSigStr}>{timeSigStr}</option>}
            </select>
            <span className={styles.label}>Key</span>
            <select className={styles.select} value={meta.keySignature} onChange={(e) => setMeta({ keySignature: e.target.value })} aria-label="Key signature">
              {KEY_SIGS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Group>

          <Group label="Staves">
            {staves.map((staff, i) => (
              <button key={staff.id} className={styles.btn} aria-pressed={selection.staffId === staff.id} data-tooltip={`Select staff ${i + 1} (${staff.clef})`} onClick={() => setActiveStaff(staff.id)}>
                {staff.clef === 'treble' ? '𝄞' : '𝄢'}{staves.length > 1 ? ` ${i + 1}` : ''}
              </button>
            ))}
            {staves.length < 4 && <button className={styles.btn} data-tooltip="Add staff" onClick={() => addStaff(staves.some(s => s.clef === 'bass') ? 'treble' : 'bass')}>+Staff</button>}
            {staves.length > 1 && <button className={styles.btn} data-tooltip="Remove selected staff" onClick={() => removeStaff(selection.staffId)}>−Staff</button>}
            <select className={styles.select} value={staves.find(s => s.id === selection.staffId)?.clef ?? 'treble'} onChange={(e) => setStaffClef(selection.staffId, e.target.value)} aria-label="Clef">
              {CLEF_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Group>

          <Group label="Bars">
            <button className={styles.btn} data-tooltip="Add bar" onClick={addMeasure}>+Bar</button>
            <button className={styles.btn} data-tooltip="Remove current bar" onClick={() => activeMeasure && removeMeasure(activeMeasure.id)} disabled={measures.length <= 1}>−Bar</button>
          </Group>

        </>)}

        {activeTab === 'file' && (<>

          <Group label="File">
            <button className={styles.btn} data-tooltip="Save score to file" onClick={handleSave}>Save</button>
            <label className={styles.btn} data-tooltip="Open score from file" style={{ cursor: 'pointer' }}>
              Open
              <input type="file" accept=".notatePad,application/json" onChange={handleOpen} style={{ display: 'none' }} />
            </label>
          </Group>

          <Group label="Display">
            <button className={styles.btn} data-tooltip="Toggle high contrast" onClick={() => document.body.classList.toggle('high-contrast')}>◑ High Contrast</button>
          </Group>

        </>)}


      </div>
    </div>
  )
}
