import { useEffect } from 'react'
import { useScoreStore } from '../store/scoreStore.js'

const DURATION_MAP = {
  '1': 'w', '2': 'h', '3': 'q', '4': '8', '5': '16', '6': '32', '7': '64',
}
const NOTE_LETTERS = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g'])

export function useKeyboard() {
  useEffect(() => {
    function onKeyDown(e) {
      // Never intercept when typing in a form field
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const key = e.key
      const lower = key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey

      // Read fresh state on every key press — no stale closure risk
      const store = useScoreStore.getState()

      // Undo / Redo
      if (ctrl && lower === 'z' && !e.shiftKey) { e.preventDefault(); store.undo(); return }
      if (ctrl && (lower === 'y' || (lower === 'z' && e.shiftKey))) { e.preventDefault(); store.redo(); return }

      if (ctrl) return // don't intercept other Ctrl combos (Ctrl+C, Ctrl+S, etc.)

      // Octave shift (Ctrl is gone at this point — these are bare arrow keys)
      // We handle Ctrl+Arrow before the ctrl guard above, so re-check:
      // Actually octave uses Ctrl — let's handle them before the ctrl guard.
      // (Re-check: already handled above via ctrl guard — so add them here separately)

      // Note letters A–G
      if (NOTE_LETTERS.has(lower) && !e.altKey) {
        e.preventDefault()
        store.insertNote({ pitch: key.toUpperCase() })
        return
      }

      // Rest
      if (lower === 'r' && !e.altKey) {
        e.preventDefault()
        store.insertNote({ pitch: 'B', isRest: true })
        return
      }

      // Durations 1–7
      if (DURATION_MAP[key]) {
        e.preventDefault()
        store.setDuration(DURATION_MAP[key])
        return
      }

      // Accidentals: + (sharp), - (flat), = (natural)
      if (key === '+' || key === '#') { e.preventDefault(); store.toggleAccidental('#'); return }
      if (key === '-')                { e.preventDefault(); store.toggleAccidental('b'); return }
      if (key === '=')                { e.preventDefault(); store.toggleAccidental('n'); return }

      // Dotted
      if (key === '.') { e.preventDefault(); store.toggleDotted(); return }

      // Navigation
      if (key === 'ArrowLeft')  { e.preventDefault(); store.moveSelection('left');  return }
      if (key === 'ArrowRight') { e.preventDefault(); store.moveSelection('right'); return }

      // Delete selected note
      if (key === 'Delete' || key === 'Backspace') {
        e.preventDefault()
        store.deleteSelectedNote()
        return
      }
    }

    function onKeyDownCtrl(e) {
      // Separate handler for Ctrl+Arrow (octave shift) so it fires before the main handler
      if (!(e.ctrlKey || e.metaKey)) return
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const store = useScoreStore.getState()
      if (e.key === 'ArrowUp')   { e.preventDefault(); store.setOctave(store.inputState.octave + 1); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); store.setOctave(store.inputState.octave - 1); return }
    }

    window.addEventListener('keydown', onKeyDownCtrl)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDownCtrl)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, []) // register once — reads fresh store state on every keypress via getState()
}
