import { useEffect, useRef } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow'
import { useScoreStore } from '../../store/scoreStore.js'
import styles from './ScoreCanvas.module.css'

const STAVE_WIDTH = 400
const STAVE_X = 20
const STAVE_Y = 60
const STAVE_GAP = 120

export default function ScoreCanvas() {
  const containerRef = useRef(null)
  const measures = useScoreStore((s) => s.measures)
  const meta = useScoreStore((s) => s.meta)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous render
    container.innerHTML = ''

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    const totalWidth = Math.max(
      800,
      STAVE_X + measures.length * (STAVE_WIDTH + 20) + 40
    )
    renderer.resize(totalWidth, 200)

    const context = renderer.getContext()
    context.setFont('Arial', 10)

    // Score title
    if (meta.title) {
      context.save()
      context.setFont('Arial', 16, 'bold')
      context.fillText(meta.title, totalWidth / 2 - (meta.title.length * 5), 30)
      context.restore()
    }

    measures.forEach((measure, index) => {
      const x = STAVE_X + index * (STAVE_WIDTH + 20)
      const stave = new Stave(x, STAVE_Y, STAVE_WIDTH)

      // First measure gets clef and time signature
      if (index === 0) {
        stave.addClef('treble')
        stave.addTimeSignature(`${meta.timeSignature[0]}/${meta.timeSignature[1]}`)
      }

      stave.setContext(context).draw()

      // Render notes if the measure has any
      if (measure.notes.length > 0) {
        try {
          const staveNotes = measure.notes.map((note) =>
            new StaveNote({
              keys: [vexKey(note.pitch)],
              duration: note.duration,
            })
          )

          const voice = new Voice({
            num_beats: meta.timeSignature[0],
            beat_value: meta.timeSignature[1],
          }).setMode(Voice.Mode.SOFT) // SOFT mode: never throws on beat count mismatch

          voice.addTickables(staveNotes)

          new Formatter()
            .joinVoices([voice])
            .format([voice], STAVE_WIDTH - 40)

          voice.draw(context, stave)
        } catch (e) {
          // Render failed for this measure — show it empty rather than crashing
          console.warn('ScoreCanvas: could not render measure', measure.id, e)
        }
      }
    })
  }, [measures, meta])

  return (
    <div
      className={styles.wrapper}
      role="application"
      aria-label="Score editor"
    >
      <div
        ref={containerRef}
        className={styles.canvas}
        aria-label="Music score"
      />
      {measures.length === 0 && (
        <p className={styles.empty}>
          Your score is empty. Start by selecting a note duration and pressing a letter key (A–G).
        </p>
      )}
    </div>
  )
}

// Convert scientific pitch (e.g. "C4", "F#3") to VexFlow key format ("c/4", "f#/3")
function vexKey(pitch) {
  if (!pitch) return 'b/4'
  const match = pitch.match(/^([A-Ga-g])([#b]?)(\d+)$/)
  if (!match) return 'b/4'
  const [, letter, accidental, octave] = match
  return `${letter.toLowerCase()}${accidental}/${octave}`
}
