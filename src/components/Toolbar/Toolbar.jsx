import { useScoreStore } from '../../store/scoreStore.js'
import styles from './Toolbar.module.css'

const DURATIONS = [
  { label: 'Whole',    key: 'w', shortcut: '1' },
  { label: 'Half',     key: 'h', shortcut: '2' },
  { label: 'Quarter',  key: 'q', shortcut: '3' },
  { label: '8th',      key: '8', shortcut: '4' },
  { label: '16th',     key: '16', shortcut: '5' },
]

export default function Toolbar() {
  const undo = useScoreStore((s) => s.undo)
  const redo = useScoreStore((s) => s.redo)

  return (
    <div
      className={styles.toolbar}
      role="toolbar"
      aria-label="Notation tools"
    >
      <div className={styles.group} role="group" aria-label="History">
        <button
          className={styles.btn}
          onClick={undo}
          aria-label="Undo (Ctrl+Z)"
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          className={styles.btn}
          onClick={redo}
          aria-label="Redo (Ctrl+Y)"
          title="Redo (Ctrl+Y)"
        >
          ↪
        </button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.group} role="group" aria-label="Note duration">
        {DURATIONS.map((d) => (
          <button
            key={d.key}
            className={styles.btn}
            aria-label={`${d.label} note (${d.shortcut})`}
            title={`${d.label} note`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.group} role="group" aria-label="Accidentals">
        <button className={styles.btn} aria-label="Sharp (+)" title="Sharp (+)">♯</button>
        <button className={styles.btn} aria-label="Flat (−)" title="Flat (−)">♭</button>
        <button className={styles.btn} aria-label="Natural (=)" title="Natural (=)">♮</button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.group} role="group" aria-label="Accessibility">
        <button
          className={styles.btn}
          aria-label="Toggle high contrast mode"
          title="High contrast"
          onClick={() => document.body.classList.toggle('high-contrast')}
        >
          ◑
        </button>
      </div>
    </div>
  )
}
