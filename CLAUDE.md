# NotatePad — Claude Code Context

## What This Is

A browser-based freestyle music notation editor. The core rule: **nothing autocorrects**. The user can put any number of notes in any bar and the app renders them without complaint. Validation is always opt-in via "Check my notation".

## Stack

- React 18 + Vite
- VexFlow 4 (SVG notation rendering)
- Tone.js (audio playback — not wired up until Phase 2)
- Zustand (state — `src/store/scoreStore.js`)
- CSS Modules (scoped styles, no runtime CSS-in-JS)
- Vitest + Testing Library

## Key Constraints

- **No beat enforcement** — `Voice.Mode.SOFT` in VexFlow, store accepts any notes
- **No autocorrect** — never modify the user's score without explicit action
- **No modals** — all panels are inline collapsible
- **No backend** — fully client-side, localStorage for persistence

## File Layout

```
src/
  store/scoreStore.js     ← all score state + undo/redo
  components/
    Toolbar/              ← note input controls
    Canvas/               ← VexFlow render target
    Playback/             ← play/stop/tempo
  hooks/useKeyboard.js    ← global key bindings
  a11y/announcer.js       ← ARIA live region
  styles/tokens.css       ← design tokens (colours, spacing, radii)
  styles/global.css       ← reset + base styles
tests/                    ← Vitest tests
```

## Data Model (scoreStore)

```js
{
  meta: { title, tempo, timeSignature, keySignature },
  measures: [{ id, notes: [{ id, pitch, duration, accidental, dotted }] }],
  selection: { measureId, noteId },
  history: { past: [], future: [] }
}
```

Pitch is scientific notation: `C4`, `F#3`, `Bb5`.
Duration keys: `w h q 8 16 32` (VexFlow format).

## Commands

```
npm run dev       # start dev server
npm run build     # production build → dist/
npm run preview   # preview production build
npm test          # run Vitest tests
```

## Design Tokens

See `src/styles/tokens.css`. Key vars: `--color-accent` (#6B9FD4 soft blue), `--color-bg` (#FAFAF8 cream), `--radius-md` (10px).

## Current Phase

Phase 0 — Foundation. See ROADMAP.md for what's next.
