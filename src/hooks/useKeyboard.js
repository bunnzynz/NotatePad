import { useEffect } from 'react'
import { useScoreStore } from '../store/scoreStore.js'

export function useKeyboard() {
  const undo = useScoreStore((s) => s.undo)
  const redo = useScoreStore((s) => s.redo)

  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore when typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo() }
        if (e.key === 'y') { e.preventDefault(); redo() }
        if (e.key === 'Z' && e.shiftKey) { e.preventDefault(); redo() }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])
}
