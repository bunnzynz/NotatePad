import { useScoreStore } from '../../store/scoreStore.js'
import { play, stop, setVolume, startMetronome, stopMetronome } from '../../audio/engine.js'
import styles from './PlaybackBar.module.css'

export default function PlaybackBar() {
  const tempo           = useScoreStore((s) => s.meta.tempo)
  const setMeta         = useScoreStore((s) => s.setMeta)
  const selection       = useScoreStore((s) => s.selection)
  const isPlaying       = useScoreStore((s) => s.playback.isPlaying)
  const metronomeEnabled = useScoreStore((s) => s.playback.metronomeEnabled)
  const setPlayback     = useScoreStore((s) => s.setPlayback)

  const fromHereId = selection.noteId ?? selection.cursorNoteId ?? null

  function handlePlay() {
    play(null)
  }

  function handlePlayFromHere() {
    play(fromHereId)
  }

  function handleStop() {
    stop()
  }

  function handleVolume(e) {
    // Slider 0–100 → dB range -40 to 0
    const pct = Number(e.target.value)
    const db  = pct === 0 ? -Infinity : -40 + pct * 0.4
    setVolume(db)
  }

  function handleMetronome() {
    const newEnabled = !metronomeEnabled
    setPlayback({ metronomeEnabled: newEnabled })
    if (isPlaying) {
      if (newEnabled) startMetronome(useScoreStore.getState().meta.timeSignature)
      else stopMetronome()
    }
  }

  return (
    <div className={styles.bar} role="toolbar" aria-label="Playback controls">

      {isPlaying ? (
        <button className={styles.stopBtn} onClick={handleStop} title="Stop (Space)">
          ■ Stop
        </button>
      ) : (
        <>
          <button className={styles.playBtn} onClick={handlePlay} title="Play from beginning (Space)">
            ▶ Play
          </button>
          <button
            className={styles.btn}
            onClick={handlePlayFromHere}
            disabled={!fromHereId}
            title="Play from selected note or cursor"
          >
            ▶ From here
          </button>
        </>
      )}

      <div className={styles.divider} aria-hidden="true" />

      <label className={styles.tempoLabel} htmlFor="tempo-input">Tempo</label>
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

      <div className={styles.divider} aria-hidden="true" />

      <label className={styles.label} htmlFor="volume-input">Vol</label>
      <input
        id="volume-input"
        className={styles.volumeSlider}
        type="range"
        min={0}
        max={100}
        defaultValue={80}
        onChange={handleVolume}
        aria-label="Master volume"
      />

      <div className={styles.divider} aria-hidden="true" />

      <button
        className={styles.btn}
        aria-pressed={metronomeEnabled}
        onClick={handleMetronome}
        title="Metronome"
      >
        ♩ Click
      </button>

      {/* eslint-disable-next-line no-undef */}
      <span className={styles.buildStamp} title={`Built ${__BUILD_TIME__}`}>
        {/* eslint-disable-next-line no-undef */}
        {__COMMIT_HASH__}
      </span>

    </div>
  )
}
