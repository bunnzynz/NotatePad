# NotatePad — Feature Reference & User Guide

> This document describes exactly what is implemented and how to use it.
> It is updated every time a feature ships or changes.
> **Status key:** ✅ Implemented | 🔜 Planned | ❌ Not yet started

---

## Core Philosophy

NotatePad is a **freestyle notation editor**. The fundamental contract with the user:

- You write freely. The app never corrects you.
- You can put 20 crotchets in a 4/4 bar and it will render them without complaint — notes beyond the bar's capacity are shown in red so you can see them, but nothing is removed or moved.
- Validation is always **opt-in**, never automatic.

---

## The Page

Every score is laid out on **A4 pages** (794 × 1123 px), exactly as it would look printed. Measures are arranged into systems (rows of staves) that fill the full page width — if you have 4 bars, each takes one quarter of the line. When a system is full, the next one starts on a new row. When a page is full, a new page is added automatically.

Page numbers appear at the bottom of page 2 onwards. The score title appears at the top of page 1.

The **active system** (the one containing your cursor) is highlighted with a soft blue background so you always know where you are.

---

## 1. Staves ✅

### Default layout
A new score opens with a **grand staff**: treble clef on top, bass clef below. This is the default for piano-style scoring.

### Switching between staves
The toolbar shows a button for each stave (𝄞 for treble, 𝄢 for bass). Click one to make it the active stave — this is where new notes will be inserted. The active stave button appears highlighted.

### Changing a stave's clef
Select the stave you want to change (click its button in the toolbar), then choose **Treble** or **Bass** from the clef dropdown. The clef updates immediately on every system.

### Adding staves
Click **+Staff** to add a new stave below the existing ones. You can have up to 4 staves. New staves default to bass if you already have a treble stave, otherwise treble.

### Removing a stave
Select the stave you want to delete (click its toolbar button so it is highlighted), then click **−Staff**. The selected stave is removed — not always the bottom one. The minimum is 1 stave.

---

## 2. Adding Notes ✅

### Right-click to place a note
**Right-click anywhere on a stave** to insert a note at that position. The pitch is determined by where you click vertically — higher on the stave = higher pitch. The note slots in at the horizontal position you clicked, pushing later notes to the right.

Dots, accidentals, and duration in the toolbar are applied to the note as it is placed.

### Choose a duration first
Select a duration from the toolbar before placing a note, or change it after by selecting the note and clicking a duration button:

| Key | Duration |
|-----|----------|
| 1 | Whole (semibreve) |
| 2 | Half (minim) |
| 3 | Quarter (crotchet) |
| 4 | 8th (quaver) |
| 5 | 16th (semiquaver) |
| 6 | 32nd (demisemiquaver) |

The toolbar buttons show **W H Q 8 16 32**. The selected duration stays active until you change it.

### Keyboard entry (alternative)
Press **A through G** to insert that pitch at the cursor position. The octave is chosen automatically — the note lands in the octave closest to the previous note on that stave, so runs and scales flow naturally without jumping. If there is no previous note, it defaults to the middle of the stave (B4 for treble, D3 for bass).

For a **rest**, press **R**.

### Accidentals
Set accidentals **before** placing a note, or apply them to a selected note afterwards:

- Click **♯** (or press `+`) — sharp
- Click **♭** (or press `-`) — flat
- Click **♮** (or press `=`) — removes any sharp or flat

An active ♯ or ♭ is shown highlighted. Click it again to deactivate. The ♮ button always clears the accidental — it does not add a natural symbol; it simply removes the sharp or flat.

### Dotted notes
Click the **·** button (or press `.`) to toggle dotted. The dot lengthens a note by half its value. Arm it before placing a note, or click it while a note is selected to add or remove its dot. The dot is always drawn in a space — if the note sits on a stave line, the dot moves up into the space above so it remains visible.

---

## 3. Selecting Notes ✅

### Left-click to select
Left-click directly on a note head to select it. The note turns blue and can be edited via the toolbar or keyboard.

### Deselecting
- **Left-click on empty space** in the score — clears the selection. Toolbar controls then arm for the next note you insert rather than editing the selected one.
- **Escape** — same as clicking empty space, from the keyboard.

### Keyboard navigation
- **← Left arrow** — move selection to the previous note
- **→ Right arrow** — move selection to the next note

---

## 4. Editing a Selected Note ✅

When a note is selected (blue), the following toolbar controls edit it directly:

- **Duration buttons (W H Q 8 16 32)** — change the note's duration
- **· (dot)** — toggle the dot on or off
- **♯ ♭ ♮** — add, change, or remove the accidental
- **Step ↑ / ↓** — move the note up or down one diatonic step
- **Oct ↑ / ↓** — move the note up or down one octave

Keyboard equivalents when a note is selected:
- **↑ / ↓** — step up / down
- **Ctrl + ↑ / ↓** — octave up / down

---

## 5. Deleting Notes ✅

- **Backspace** — deletes the currently selected note. The cursor moves to the note before it.
- **Delete** — deletes the note to the right of the cursor (the next note after the selection).

---

## 6. Measures (Bars) ✅

- **+Bar** — adds a new bar at the end of the score.
- **−Bar** — removes the currently selected bar. Cannot remove the last remaining bar.

Bars never enforce beat counts. Notes that go beyond the time signature's capacity are highlighted in **red** as a visual guide but are never removed.

---

## 7. Score Title ✅

Click the **"Untitled score"** field at the top of the screen and type your title. It appears at the top of page 1.

---

## 8. Time Signature ✅

Choose from the **Time** dropdown in the toolbar. Options: 2/4, 3/4, 4/4, 3/8, 6/8, 12/8. The time signature is shown at the start of the first measure and determines which notes are highlighted red (overflow).

Changing the time signature does not move or remove notes.

---

## 9. Key Signature ✅ (stored, not yet rendered on stave)

Choose a key from the **Key** dropdown. The key is stored with the score and saved to file. Rendering sharps/flats on the stave itself is coming in a future update.

---

## 10. Undo / Redo ✅

- **Ctrl+Z** — undo
- **Ctrl+Y** — redo
- **↩ ↪** buttons in the toolbar do the same

Undo history is not saved between sessions.

---

## 11. Saving and Opening Files ✅

### Save
Click **Save** in the toolbar. Your score downloads as a `.notatePad` file. The filename is your score title, or "Untitled Score" if none is set.

### Open
Click **Open** and choose a `.notatePad` file. The score loads immediately, replacing the current one.

### Session restore
Your score is automatically saved to session storage while you are in the same browser tab. Refreshing the page restores it. Opening a new tab starts a blank score.

### Before you leave
If your score has any content, the browser will warn you before you close or navigate away. Use **Save** first to keep your work.

---

## Quick Reference

### Mouse
| Action | Result |
|--------|--------|
| Right-click on stave | Insert note at that pitch and position |
| Left-click on note head | Select the note (turns blue) |
| Left-click on empty space | Deselect — arms toolbar for next insert |

### Keyboard — note entry
| Key | Action |
|-----|--------|
| A – G | Insert note at that pitch (octave auto-chosen) |
| R | Insert rest |
| 1 | Whole note |
| 2 | Half note |
| 3 | Quarter note |
| 4 | 8th note |
| 5 | 16th note |
| 6 | 32nd note |
| . | Toggle dotted |
| + or # | Sharp |
| - | Flat |
| = | Remove accidental |

### Keyboard — editing
| Key | Action |
|-----|--------|
| ↑ / ↓ | Raise / lower selected note one step |
| Ctrl + ↑ / ↓ | Raise / lower selected note one octave |
| ← / → | Move selection left / right |
| Backspace | Delete selected note |
| Delete | Delete note to the right of cursor |
| Escape | Deselect current note |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |

---

## What's Coming

### Notation
- 🔜 Key signature rendered on the stave
- 🔜 Ties across barlines
- 🔜 Slurs
- 🔜 Chords (multiple noteheads at the same position)
- 🔜 Alto and tenor clef

### Editing
- 🔜 Multi-select (drag to select a range of notes)
- 🔜 Copy / paste notes and measures

### Playback
- 🔜 Play / stop with Tone.js
- 🔜 Tempo control
- 🔜 Active note highlight during playback
- 🔜 Metronome click

### Export
- 🔜 PDF / print
- 🔜 MusicXML (industry-standard format for sharing with other notation apps)

### Score metadata
- 🔜 Composer name
- 🔜 Instrument labels per stave
