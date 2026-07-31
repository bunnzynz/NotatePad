# NotatePad — Ideas Parking Lot

> This is a holding space for ideas that aren't on the current roadmap.
> Nothing here is a commitment. Everything here is fair game for future phases.
> Add new ideas freely. Tag each with a rough category and source.

---

## How to Use This File

- Drop ideas here as they come up — no filter needed at intake
- Tag with: `[UX]` `[Feature]` `[Audio]` `[Accessibility]` `[Export]` `[Import]` `[Community]` `[AI]` `[Tech]` `[Business]`
- When an idea moves to the roadmap, mark it `→ ROADMAP` and link the phase
- When an idea is ruled out, mark it `✗ REJECTED` and briefly say why

---

## Input & Editing

- `[Feature]` **Chord entry mode** — press multiple letter keys together to build a chord on one stem
- `[Feature]` **Tuplet entry** — triplets, quintuplets etc. (3 notes in the space of 2), with bracket notation
- `[Feature]` **Grace notes** — small acciaccatura / appoggiatura notation
- `[Feature]` **Glissando / portamento** — wavy line between notes
- `[Feature]` **Tremolo** — repeated note markings (beam slashes on stem)
- `[Feature]` **Cue notes** — small noteheads indicating a cue from another part
- `[Feature]` **Ossia staves** — small alternate passage shown above main staff
- `[Feature]` **Custom noteheads** — X noteheads for percussion, diamond for harmonics etc.
- `[Feature]` **Multiple voices per staff** — voice 1 stems up, voice 2 stems down on same staff
- `[Feature]` **Cross-staff beaming** — beam a note from one staff to the adjacent one (piano writing)
- `[UX]` **Lasso select** — click-drag to select a rectangular region of notes
- `[UX]` **Smart paste** — paste and optionally remap pitches to target key
- `[UX]` **Freehand drawing mode** — sketch a rough notation shape and have it snapped to nearest note (optional, never forced)

---

## Articulations & Expressions

- `[Feature]` **Dynamics** — pp, p, mp, mf, f, ff, fff, ppp and hairpins (crescendo/diminuendo)
- `[Feature]` **Articulations** — staccato, tenuto, accent, marcato, fermata, trill
- `[Feature]` **Slurs and phrase marks** — curved lines spanning notes
- `[Feature]` **Pedal marks** — piano sustain pedal notation
- `[Feature]` **Bow markings** — up-bow, down-bow for strings
- `[Feature]` **Breath marks** — for wind and voice
- `[Feature]` **Tempo markings** — Allegro, Andante, rit., accel. etc. as text above staff
- `[Feature]` **Expression text** — dolce, con fuoco, espressivo etc.

---

## Structure & Form

- `[Feature]` **Repeats** — repeat barlines, 1st/2nd endings (volta brackets)
- `[Feature]` **D.C. / D.S. / Coda / Fine** — navigation marks
- `[Feature]` **Rehearsal marks** — circled letters or numbers for rehearsal references
- `[Feature]` **Section breaks** — visual separator with optional label ("Verse", "Chorus", "Bridge")
- `[Feature]` **Multi-measure rests** — collapsed rest notation for long rests
- `[Feature]` **Pick-up (anacrusis) bars** — incomplete first bar, does not trigger beat-count warning
- `[Feature]` **Mid-score time signature change** — change time signature at any barline
- `[Feature]` **Mid-score key change** — with courtesy accidentals option
- `[Feature]` **Mid-score clef change** — small clef change notation
- `[Feature]` **Mid-score tempo change** — new BPM marking inline

---

## Lyrics & Text

- `[Feature]` **Lyric entry** — attach syllables below notes, hyphen-link across notes
- `[Feature]` **Chord symbols** — guitar/jazz chord names above staff (C, Am, F#7, Cmaj9 etc.)
- `[Feature]` **Nashville number system** — chord numerals instead of letter names
- `[Feature]` **Roman numeral analysis** — harmonic analysis notation below staff
- `[Feature]` **Fingering numbers** — attach finger numbers above/below notes
- `[Feature]` **String numbers** — circled numerals for string instrument position
- `[Feature]` **Bowing / fingering for woodwind** — breath control and fingering charts

---

## Alternate Notation Styles

- `[Feature]` **Guitar tablature** — 6-line tab staff with fret numbers
- `[Feature]` **Drum notation** — unpitched percussion staff with instrument key
- `[Feature]` **Figured bass** — numbers below bass line for continuo
- `[Feature]` **Lead sheet format** — melody + chord symbols only, auto-minimise layout
- `[Feature]` **Choral score** — SATB on two staves with lyrics
- `[Feature]` **Orchestral score** — multiple instruments, conductor layout

---

## Playback & Audio

- `[Audio]` **Soundfont-based playback** — use a GM soundfont for more realistic instrument sounds
- `[Audio]` **Per-note velocity** — control how loud each note plays
- `[Audio]` **Humanisation** — slight timing/velocity randomisation for more natural sound
- `[Audio]` **Mute / solo per staff** — standard mixer controls
- `[Audio]` **Click track export** — export metronome click as audio
- `[Audio]` **Audio export** — export playback as .wav or .mp3
- `[Audio]` **MIDI device output** — route playback to an external MIDI device or DAW
- `[Audio]` **MIDI device input** — record notes from a MIDI keyboard in real time
- `[Audio]` **Count-in** — optional 1-bar metronome count before playback starts

---

## Transposition & Theory

- `[Feature]` **Interval transposition** — transpose by specific interval (e.g. up a perfect fifth)
- `[Feature]` **Enharmonic respelling** — flip C# to Db, F## to G etc.
- `[Feature]` **Chord detection** — highlight selected notes and show chord name
- `[Feature]` **Scale highlighter** — show which notes in score match a selected scale
- `[Feature]` **Interval display** — show interval between two selected notes
- `[Feature]` **Harmonic analysis** — basic Roman numeral analysis overlay

---

## Import & Export

- `[Import]` **MuseScore (.mscz) import** — via MusicXML as intermediate (MuseScore can export)
- `[Import]` **Sibelius import** — via MusicXML
- `[Import]` **Lilypond import** — parse .ly files (complex, low priority)
- `[Export]` **Lilypond export** — text-based notation for engravers
- `[Export]` **ABC notation export** — lightweight text format, great for folk music
- `[Export]` **PNG / image export** — rasterise score for embedding in documents
- `[Export]` **Braille music export** — accessibility for blind musicians
- `[Export]` **Audio export (WAV/MP3)** — render playback to audio file

---

## Layout & Display

- `[UX]` **Continuous scroll vs. page view** — toggle between modes
- `[UX]` **Adjustable system spacing** — more/less space between staves
- `[UX]` **Note colour coding** — optionally colour notes by pitch class or voice
- `[UX]` **Piano keyboard overlay** — show a keyboard at bottom highlighting the current note
- `[UX]` **Fretboard overlay** — guitar fretboard view showing current note position
- `[UX]` **Focus mode** — dim everything except the active measure
- `[UX]` **Minimap** — small overview of full score for navigation in long pieces

---

## Accessibility

- `[Accessibility]` **Braille music output** — see Export above
- `[Accessibility]` **Colour blindness modes** — alternative palettes for common types
- `[Accessibility]` **Large print mode** — greatly enlarged notation for low vision
- `[Accessibility]` **Audio description of score** — describe entire score structure in text
- `[Accessibility]` **Switch access support** — single-switch scanning navigation

---

## AI / Smart Features (Optional, Never Forced)

- `[AI]` **"Suggest continuation"** — AI suggests next few notes based on context (opt-in)
- `[AI]` **Handwriting recognition** — photograph handwritten notation and import it
- `[AI]` **Hum-to-notation** — hum a melody into the microphone and it gets transcribed
- `[AI]` **Style analysis** — "this passage is similar to Baroque counterpoint" type annotation
- `[AI]` **Auto-chord-symbol detection** — analyse notes and suggest chord names
- `[AI]` **Orchestration suggestions** — "these notes would work well for horn" type hints

---

## Collaboration & Sharing

- `[Community]` **Shareable link** — generate a read-only link to a score
- `[Community]` **Editable share** — share with specific people who can edit
- `[Community]` **Comments** — annotate specific measures with text comments
- `[Community]` **Version history** — see and restore previous versions of a score
- `[Community]` **Public gallery** — optional public showcase of scores
- `[Community]` **Score templates** — start from a pre-built template (lead sheet, string quartet etc.)
- `[Community]` **User accounts** — login, cloud storage, cross-device sync

---

## Business / Platform

- `[Business]` **Freemium model** — free core, paid for export/cloud/advanced features
- `[Business]` **Teacher / student mode** — teacher can annotate student's score
- `[Business]` **Classroom management** — batch assign, collect, and grade notation exercises
- `[Business]` **API** — allow third-party apps to load scores into NotatePad
- `[Business]` **Plugin / extension system** — let developers add tools to the toolbar
- `[Business]` **Offline app (PWA)** — installable, works without internet
- `[Business]` **Desktop app (Electron/Tauri)** — native app for Mac/Windows/Linux
- `[Business]` **Mobile app** — iOS/Android for viewing/annotating (not full editing)

---

## Tech Debt / Infrastructure

- `[Tech]` **Worker-based rendering** — move VexFlow render to a Web Worker to avoid UI jank on large scores
- `[Tech]` **Virtual scrolling** — only render visible measures for performance on very long scores
- `[Tech]` **WASM notation engine** — replace JS notation logic with a compiled WASM core for speed
- `[Tech]` **Server-side PDF generation** — fallback for browsers with weak SVG-to-PDF support
- `[Tech]` **E2E test suite** — Playwright tests covering the full user journey
