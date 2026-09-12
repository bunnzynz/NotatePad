import styles from './GuidePage.module.css'

function Row({ k, label, note }) {
  return (
    <div className={styles.row}>
      <kbd className={styles.kbd}>{k}</kbd>
      <span className={styles.label}>{label}</span>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  )
}

export default function GuidePage() {
  return (
    <div className={styles.page}>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>How it works</div>
        <div className={styles.prose}>
          <p className={styles.p}>
            NotatePad is a freestyle notation editor — nothing autocorrects. You can put any notes in any bar
            and the app renders them without complaint. Bars do not enforce beat counts; that is always your choice.
          </p>
          <p className={styles.p}>
            Type a letter key (A–G) to insert a note. The pitch is placed near the previous note automatically.
            Use the arrow keys to move the cursor, then type to insert after it.
            Select a note by clicking it or navigating to it — it turns blue. Edits apply to the selected note.
          </p>
          <p className={styles.p}>
            Choose a duration before or after typing a note. Pressing a duration key when a note is selected
            changes that note's duration. The toolbar Rests section inserts a rest immediately at the cursor.
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Note entry</div>
        <div className={styles.grid}>
          <Row k="A – G" label="Insert a note at that pitch" />
          <Row k="R" label="Insert a rest, or convert selected note to a rest" />
          <Row k="1" label="Whole duration" />
          <Row k="2" label="Half duration" />
          <Row k="3" label="Quarter duration" />
          <Row k="4" label="8th duration" />
          <Row k="5" label="16th duration" />
          <Row k="." label="Toggle dot on selected note" />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Accidentals</div>
        <div className={styles.grid}>
          <Row k="+" label="Sharp — add or remove ♯" />
          <Row k="−" label="Flat — add or remove ♭" />
          <Row k="=" label="Natural — add or remove ♮" />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Pitch (note must be selected)</div>
        <div className={styles.grid}>
          <Row k="↑" label="Move note up one step" />
          <Row k="↓" label="Move note down one step" />
          <Row k="Ctrl+↑" label="Move note up one octave" />
          <Row k="Ctrl+↓" label="Move note down one octave" />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Navigation</div>
        <div className={styles.grid}>
          <Row k="←" label="Move cursor left" />
          <Row k="→" label="Move cursor right" />
          <Row k="Esc" label="Deselect — cursor stays in place" />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Editing</div>
        <div className={styles.grid}>
          <Row k="⌫ Backspace" label="Delete the note at the cursor" />
          <Row k="Delete" label="Delete selected note, or next note if none selected" />
          <Row k="Ctrl+Z" label="Undo" />
          <Row k="Ctrl+Y" label="Redo" />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Playback</div>
        <div className={styles.grid}>
          <Row k="Space" label="Play from cursor, or stop if playing" />
        </div>
      </div>

    </div>
  )
}
