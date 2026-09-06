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

### Step 1 — Position the cursor
**Click anywhere in a measure** to move the cursor there. Click within the note area to position between existing notes — the cursor lands after the note nearest to your click on the left.

Clicking does not insert a note. It only moves the cursor.

### Step 2 — Choose a duration
Select a duration from the toolbar or press a number key:

| Key | Duration |
|-----|----------|
| 1 | Whole (semibreve) |
| 2 | Half (minim) |
| 3 | Quarter (crotchet) |
| 4 | 8th (quaver) |
| 5 | 16th (semiquaver) |
| 6 | 32nd (demisemiquaver) |

The toolbar buttons show **W H Q 8 16 32**. The selected duration stays active until you change it.

### Step 3 — Enter the note
Press **A through G** on your keyboard to insert the note at that pitch, on the active stave.

**Octave is chosen automatically.** When you type a pitch letter, NotatePad places the note in the octave closest to the previous note you entered on that stave. This means notes flow naturally up and down the stave as you type — just like voice leading. If there is no previous note, the note is placed near the middle of the stave (B4 for treble, D3 for bass).

To move a note up or down by octave after it is entered, use **Ctrl + ↑ / ↓**.

For a **rest**, press **R**. A rest of the current duration is inserted.

Notes are always inserted **after** the cursor position. The cursor then advances to the new note.

### Accidentals
Toggle accidentals **before or after** entering a note:

- Click **♯** (or press `+`) — sharp
- Click **♭** (or press `-`) — flat
- Click **♮** (or press `=`) — **removes** any sharp or flat (from selected note or next note to be entered)

An active ♯ or ♭ is shown highlighted. Click it again to deactivate. The accidental applies to the next note you enter, or to the currently selected note if one is selected.

The ♮ button always clears accidentals — it removes the sharp or flat rather than adding a natural symbol.

### Dotted notes
Click the **·** button (or press `.`) to toggle dotted. When active, all notes entered will be dotted. The dot lengthens a note by half its value. You can also click **·** while a note is selected to add or remove its dot.

---

## 3. Adjusting Pitch After Entry ✅

Once a note is selected (blue), you can change its pitch without re-entering it:

### Move by step (one diatonic step at a time)
- **↑ Up arrow** — raises the note one step (e.g. C → D, E → F)
- **↓ Down arrow** — lowers the note one step

### Move by octave
- **Ctrl + ↑** — raises the note one octave
- **Ctrl + ↓** — lowers the note one octave

---

## 4. Selecting Notes ✅

### Click to select
Click directly on a note head to select it. The note turns blue and the cursor line appears at that position.

Click-to-select checks both horizontal and vertical position, so clicking near a note on the treble stave will not accidentally select a note on the bass stave.

### Keyboard navigation
- **← Left arrow** — move selection to the previous note in the measure, or to the last note of the previous measure
- **→ Right arrow** — move selection to the next note, or to the first note of the next measure

### Deselect
Click in an empty part of a measure (not on a note) to move the cursor there without selecting a note.

---

## 5. Deleting Notes ✅

- **Backspace** — deletes the currently selected note. The cursor moves to the note before it.
- **Delete** — deletes the note to the **right** of the cursor (the next note after the selection). The cursor stays on the selected note.

This matches standard text-editor conventions: Backspace removes what's behind the cursor, Delete removes what's in front.

---

## 6. Measures (Bars) ✅

- **+Bar** — adds a new bar at the end of the score. The cursor moves to the new bar.
- **−Bar** — removes the currently selected bar. Cannot remove the last remaining bar.

Bars never enforce beat counts. You can put any number of notes in any bar. Notes that go beyond the time signature's capacity are highlighted in **red** as a visual guide, but are not removed.

---

## 7. Score Title ✅

Click the **"Untitled score"** field at the top of the screen and type your title. It appears at the top of page 1.

---

## 8. Time Signature ✅

Choose from the **Time** dropdown in the toolbar. Options: 2/4, 3/4, 4/4, 3/8, 6/8, 12/8. The time signature is shown at the start of the first measure and is used to calculate which notes appear in red (overflow).

Changing the time signature does not move or remove notes.

---

## 9. Key Signature ✅ (display only)

Choose a key from the **Key** dropdown. The key is stored with the score and saved to file, but is not yet rendered on the stave itself. Key signature rendering on the staff is coming in the next update.

---

## 10. Undo / Redo ✅

- **Ctrl+Z** — undo the last action (unlimited steps)
- **Ctrl+Y** — redo

Or use the **↩ ↪** buttons in the toolbar. Undo history is not saved between sessions.

---

## 11. Saving and Opening Files ✅

### Save
Click **Save** in the toolbar. Your score is downloaded as a `.notatePad` file (a JSON file). You can save this anywhere on your computer.

The filename is your score title, or "Untitled Score" if no title is set.

### Open
Click **Open** in the toolbar and choose a `.notatePad` file. The score loads immediately, replacing the current score.

### Session restore
While you are in the same browser tab, your score is automatically saved to session storage. If the page refreshes accidentally, your score will be restored. Closing the tab or opening a new tab starts a fresh score.

### Before you leave
If your score has any content (notes, title, or more than one bar), the browser will warn you before you close the tab or navigate away. Use **Save** first if you want to keep your work.

---

## Keyboard Shortcut Reference

### Note entry
| Key | Action |
|-----|--------|
| A – G | Insert note with that pitch (octave auto-chosen) |
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
| = | Remove accidental (♮ / clear) |

### Editing
| Key | Action |
|-----|--------|
| ↑ | Raise selected note one step |
| ↓ | Lower selected note one step |
| Ctrl + ↑ | Raise selected note one octave |
| Ctrl + ↓ | Lower selected note one octave |
| ← | Move selection left |
| → | Move selection right |
| Backspace | Delete selected note (cursor moves left) |
| Delete | Delete the note to the right of cursor |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |

---

## What's Coming

The following features are planned but not yet built. See ROADMAP.md for the full phase plan.

### Notation rendering
- 🔜 Key signature shown on the stave
- 🔜 Ties across barlines
- 🔜 Alto and tenor clef

### Note entry
- 🔜 Copy / paste notes and measures
- 🔜 Change a note's duration after entry (select + press duration key)
- 🔜 Insert mode (insert before cursor, not after)

### Playback
- 🔜 Play from beginning
- 🔜 Play from selection
- 🔜 Tempo slider
- 🔜 Active note highlight during playback
- 🔜 Metronome click

### Export
- 🔜 PDF export
- 🔜 Print layout
- 🔜 SVG export
- 🔜 MusicXML export

### Layout
- 🔜 Zoom in / out
- 🔜 Manual system breaks

### Score metadata
- 🔜 Composer name
- 🔜 Instrument labels per stave

### Optional notation checker
- 🔜 Manually triggered beat-count validation ("Check my notation" button)
- 🔜 Results panel with jump-to-measure
