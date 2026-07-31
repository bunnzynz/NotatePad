import { useRef } from 'react'
import Toolbar from './components/Toolbar/Toolbar.jsx'
import ScoreCanvas from './components/Canvas/ScoreCanvas.jsx'
import PlaybackBar from './components/Playback/PlaybackBar.jsx'
import { useKeyboard } from './hooks/useKeyboard.js'
import { useScoreStore } from './store/scoreStore.js'
import styles from './App.module.css'

export default function App() {
  useKeyboard()

  const title   = useScoreStore((s) => s.meta.title)
  const setMeta = useScoreStore((s) => s.setMeta)

  return (
    <div className={styles.app}>
      <header className={styles.header} role="banner">
        <span className={styles.logo} aria-label="NotatePad">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="7" fill="var(--color-accent)" />
            <line x1="6" y1="10" x2="22" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="14" x2="22" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="18" x2="22" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="17" cy="14" r="3" fill="white" />
            <line x1="20" y1="14" x2="20" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          NotatePad
        </span>
        <input
          className={styles.titleInput}
          type="text"
          value={title}
          onChange={(e) => setMeta({ title: e.target.value })}
          placeholder="Untitled score"
          aria-label="Score title"
          maxLength={120}
        />
        <span className={styles.tagline}>Music notation, minus the fuss.</span>
      </header>

      <Toolbar />

      <main id="main-content" className={styles.main}>
        <ScoreCanvas />
      </main>

      <PlaybackBar />
    </div>
  )
}
