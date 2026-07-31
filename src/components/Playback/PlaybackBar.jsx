import { useScoreStore } from '../../store/scoreStore.js'
import styles from './PlaybackBar.module.css'

export default function PlaybackBar() {
  const tempo = useScoreStore((s) => s.meta.tempo)
  const setMeta = useScoreStore((s) => s.setMeta)

  return (
    <div
      className={styles.bar}
      role="toolbar"
      aria-label="Playback controls"
    >
      <button
        className={styles.playBtn}
        aria-label="Play (Space)"
        title="Play (Space)"
        disabled
      >
        ▶ Play
      </button>

      <button
        className={styles.btn}
        aria-label="Stop"
        title="Stop"
        disabled
      >
        ■ Stop
      </button>

      <div className={styles.divider} aria-hidden="true" />

      <label className={styles.tempoLabel} htmlFor="tempo-input">
        Tempo
      </label>
      <input
        id="tempo-input"
        className={styles.tempoInput}
        type="number"
        min={20}
        max={300}
        value={tempo}
        onChange={(e) => setMeta({ tempo: Number(e.target.value) })}
        aria-label={`Tempo: ${tempo} BPM`}
      />
      <span className={styles.bpmLabel} aria-hidden="true">BPM</span>
    </div>
  )
}
