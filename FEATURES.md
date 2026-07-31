# NotatePad — Feature Reference

> Living document. Update this as features are added, changed, or removed.
> Status: Draft | In Progress | Implemented | Deprecated

---

## Core Philosophy

NotatePad is a **freestyle notation editor**. The fundamental contract with the user:

- You write freely. The app does not correct you.
- Bar structure is descriptive, not enforced. You can put 20 crotchets in one bar and it will render them, no questions asked.
- Validation is always **opt-in**, never automatic.
- Every autocorrect-style behaviour that exists in Sibelius, MuseScore, Noteflight etc. is either absent or optional here.

---

## Feature Areas

### 1. Score Canvas (Notation Editor)

| Feature | Description | Status |
|---|---|---|
| Staff rendering | Clean treble/bass/grand staff rendered as SVG via VexFlow | Draft |
| Free-form note entry | Place notes without bar beat enforcement | Draft |
| Unlimited notes per bar | Any number of notes in any bar, no overflow errors | Draft |
| Note selection | Click or keyboard-navigate to select a note | Draft |
| Note deletion | Backspace/Delete removes selected note | Draft |
| Rest entry | Enter rests explicitly; no auto-fill rests | Draft |
| Barline insertion | Manual barline placement, never automatic | Draft |
| Dotted notes | Augmentation dots on any note value | Draft |
| Ties | Connect notes across barlines | Draft |
| Accidentals | Sharp, flat, natural — applied manually | Draft |
| Clef selection | Treble, Bass, Alto, Tenor per staff | Draft |
| Multiple staves | Add/remove staves (e.g. grand staff for piano) | Draft |
| Zoom in/out | Scale the canvas view | Draft |
| Scroll | Horizontal and vertical scroll for long scores | Draft |

---

### 2. Note Input

| Feature | Description | Status |
|---|---|---|
| Keyboard entry | Letter keys A–G enter the named pitch | Draft |
| Duration shortcuts | Keys 1–7 or W/H/Q/E/S/T for whole–64th | Draft |
| Octave shift | Ctrl+Up / Ctrl+Down shift pitch by octave | Draft |
| Accidental toggle | + for sharp, - for flat, = for natural | Draft |
| Rest toggle | R key inserts a rest of current duration | Draft |
| Dot toggle | . key toggles dotted on current duration | Draft |
| Click-to-place | Click on staff line/space to place note at that pitch | Draft |
| Step-time input | Move cursor forward after each note entry | Draft |
| Insert mode | Insert a note before the selected note | Draft |

---

### 3. Editing

| Feature | Description | Status |
|---|---|---|
| Undo | Ctrl+Z — unlimited undo steps | Draft |
| Redo | Ctrl+Y / Ctrl+Shift+Z | Draft |
| Copy | Ctrl+C — copy selected note(s) or measure(s) | Draft |
| Paste | Ctrl+V — paste at cursor | Draft |
| Cut | Ctrl+X | Draft |
| Multi-select | Shift+click or Shift+arrow to select a range | Draft |
| Drag to reorder | Drag notes or measures to reposition | Draft |
| Transpose selection | Shift pitch of selected notes up/down by interval | Draft |
| Change duration | Select note(s), press new duration key to retype | Draft |
| Add/remove measure | Insert or delete a bar | Draft |

---

### 4. Score Metadata

| Feature | Description | Status |
|---|---|---|
| Title | Editable score title | Draft |
| Composer name | Optional composer/arranger field | Draft |
| Tempo (BPM) | Numeric BPM field | Draft |
| Time signature | Displayed at start; can be changed per measure | Draft |
| Key signature | Set globally or per section | Draft |
| Instrument name | Label per staff | Draft |
| Copyright / notes | Footer text field | Draft |

---

### 5. Playback

| Feature | Description | Status |
|---|---|---|
| Basic playback | Play score from beginning using Tone.js synthesis | Draft |
| Stop / Pause | Stop or pause playback | Draft |
| Playback from selection | Play from the currently selected note or measure | Draft |
| Note cursor highlight | Active note highlighted during playback | Draft |
| Tempo control | Slider or numeric field to change BPM | Draft |
| Loop | Loop a selected range | Draft |
| Metronome click | Optional audible metronome during playback | Draft |
| Slow playback | Reduce tempo without affecting pitch | Draft |
| Instrument sounds | Select playback instrument per staff (piano, violin, etc.) | Draft |
| Volume control | Master volume and per-staff volume | Draft |

---

### 6. Transposition

| Feature | Description | Status |
|---|---|---|
| Transpose score | Shift entire score up or down by semitones or interval | Draft |
| Transpose selection | Transpose only selected notes/measures | Draft |
| Concert pitch toggle | Toggle between concert and transposing instrument pitch | Draft |
| Key-aware transposition | Optionally adjust key signature when transposing | Draft |

---

### 7. Optional Notation Checker

| Feature | Description | Status |
|---|---|---|
| "Check my notation" button | Manually triggered — never runs automatically | Draft |
| Bar beat validation | Flags bars where note durations don't match time sig | Draft |
| Voice overlap detection | Warns if notes on same stem collide strangely | Draft |
| Missing accidental warnings | Flags chromatic notes that may need accidentals | Draft |
| Results panel | Inline (no modal), lists each issue with measure reference | Draft |
| Jump to issue | Click issue in panel → score scrolls to that measure | Draft |
| Dismiss individual issues | Mark an issue as intentional and hide it | Draft |
| Dismiss all | Clear all checker results | Draft |

---

### 8. Export & Print

| Feature | Description | Status |
|---|---|---|
| PDF export | Render score as PDF (client-side, no server) | Draft |
| SVG export | Export raw SVG of the score | Draft |
| MusicXML export | Standard interchange format for other notation apps | Draft |
| MIDI export | Export playable MIDI file | Draft |
| Print | Browser print with score-appropriate page layout | Draft |
| Page size options | A4, Letter, A3 | Draft |
| Margin control | Adjust score margins before export | Draft |

---

### 9. Import

| Feature | Description | Status |
|---|---|---|
| MusicXML import | Import .xml / .mxl files into the editor | Draft |
| MIDI import | Import .mid and convert to notation | Draft |

---

### 10. Layout & Display

| Feature | Description | Status |
|---|---|---|
| Bars per line | Manual control over how many bars appear per line | Draft |
| Page view / scroll view | Switch between paginated view and continuous scroll | Draft |
| System breaks | Force a new line at any barline | Draft |
| High-contrast mode | Accessibility toggle, persisted to localStorage | Draft |
| Dark mode | Optional dark theme | Draft |
| Font size / notation scale | Global zoom | Draft |

---

### 11. Accessibility

| Feature | Description | Status |
|---|---|---|
| ARIA labels on all controls | Every button, input, and toggle is labelled | Draft |
| Screen reader score narration | Focused note announced: "Quarter note C4, measure 2, beat 1" | Draft |
| ARIA live region | Dynamic announcements for playback, errors, actions | Draft |
| Full keyboard navigation | Every feature reachable without a mouse | Draft |
| High-contrast mode | See Layout & Display above | Draft |
| Focus indicators | Visible focus ring on all interactive elements | Draft |
| Keyboard shortcut reference | ? key opens inline shortcut list | Draft |
| Skip-to-content link | Bypass toolbar for screen reader users | Draft |

---

### 12. Persistence

| Feature | Description | Status |
|---|---|---|
| Auto-save to localStorage | Score saved in browser automatically | Draft |
| Manual save to file | Download score as a .notatePad JSON file | Draft |
| Open from file | Load a .notatePad file back into the editor | Draft |
| Session restore | On page reload, restore last session | Draft |

---

## Keyboard Shortcut Reference

| Key | Action |
|---|---|
| A–G | Enter note with that letter name |
| R | Insert rest |
| 1–7 | Set duration (1=whole, 2=half, 3=quarter, 4=8th, 5=16th, 6=32nd, 7=64th) |
| . | Toggle dotted |
| + / - | Sharp / Flat |
| = | Natural |
| Ctrl+Up / Down | Octave up / down |
| Arrow keys | Navigate between notes |
| Delete / Backspace | Delete selected note |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+C / X / V | Copy / Cut / Paste |
| Space | Play / Stop |
| Ctrl+P | Print |
| Ctrl+E | Export PDF |
| ? | Show keyboard shortcut reference |

---

## Out of Scope (v1)

These are deliberately excluded from v1. See IDEAS.md for future consideration.

- Real-time collaboration
- Cloud account / login
- AI-assisted notation
- Mobile touch input
- Guitar tablature
- Drum notation
- Figured bass
- Ossia staves
- Custom noteheads
- Extended techniques notation
