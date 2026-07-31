# NotatePad — Product Roadmap

> Phases are sequential. Each phase ships a usable, stable product before the next begins.
> Features marked `[stretch]` are included if the phase comes in ahead of time.
> See FEATURES.md for detailed feature specs. See IDEAS.md for the parking lot.

---

## Guiding Principle

Every phase must produce something that is **usable on its own**.
We do not build half-features. We do not defer basic quality.
A user who tries NotatePad at the end of any phase should have a positive experience.

---

## Phase 0 — Foundation ✓ COMPLETE
**Goal:** Running app, working toolchain, blank canvas with a staff.

The scaffolding phase. Nothing the end user would call a "feature" ships, but everything is set up correctly so that all future work is clean.

### Deliverables
- [x] Vite + React 18 project scaffold
- [x] VexFlow installed and rendering a basic treble staff with a few hardcoded notes
- [x] Zustand store wired up with basic score data model
- [x] CSS design tokens (colours, spacing, radii, typography)
- [x] Global layout: Toolbar shell, Canvas area, Playback bar shell
- [x] No-op undo/redo hooks in place
- [x] Vitest + Testing Library configured, 8 tests passing
- [x] CLAUDE.md project documentation written
- [ ] README.md with setup instructions ← Phase 0.1

### Done When
A developer can `npm run dev` and see a staff with notes rendering in a browser.

**Result:** `npm run dev` → http://localhost:5173 — staff renders, layout complete, 8/8 tests passing, production build clean.

---

## Phase 1 — Freestyle Canvas ✓ COMPLETE
**Goal:** A user can place notes freely, with no enforcement, and edit them.

This is the **core differentiator** of NotatePad. The thing no other tool does properly.

### Deliverables
- [x] Note entry via keyboard (A–G keys)
- [x] Duration selection (1–6 keys or toolbar buttons)
- [x] Accidental entry (+ / - / = keys, toolbar buttons)
- [x] Rest entry (R key)
- [x] Dotted note toggle (. key, toolbar button)
- [x] Octave shift (Ctrl+Up / Ctrl+Down, toolbar buttons)
- [x] Notes render correctly on the staff via VexFlow
- [x] **No beat enforcement** — 20 crotchets in a bar renders, no error, no warning
- [x] Barlines are manual — user adds them when they want (+ Bar / − Bar)
- [x] Note selection via arrow keys and click
- [x] Note deletion (Delete / Backspace)
- [x] Working undo/redo (Ctrl+Z / Ctrl+Y, full history)
- [x] Measures can be added and removed
- [x] Treble and bass clef support
- [x] Score title editable inline in header
- [ ] Key signature and time signature editing in toolbar `← Phase 1.1`

### Done When
A user can freestyle-write a passage of music with no interference from the app.

**Result:** 20/20 tests passing. Live at https://notatepad.vercel.app

---

## Phase 2 — Playback
**Goal:** Hit play, hear the music.

Playback gives the user immediate feedback on what they've written. It must work reliably and feel snappy.

### Deliverables
- [ ] Tone.js integrated
- [ ] "Play from beginning" button works
- [ ] "Stop" button works
- [ ] "Play from selection" — play from the currently selected note
- [ ] Active note highlighted during playback
- [ ] Tempo slider (BPM)
- [ ] Metronome click option (on/off toggle)
- [ ] Basic piano sound for all staves
- [ ] Volume control (master)
- [ ] Loop toggle for a selected range `[stretch]`
- [ ] Slow playback mode (reduce BPM without changing pitch) `[stretch]`

### Done When
A user can write a passage and immediately hear it played back at a chosen tempo.

---

## Phase 3 — Export & Save
**Goal:** Get your work out of the app and keep it safe.

Without export, nothing the user writes has permanence. This phase makes NotatePad genuinely useful.

### Deliverables
- [ ] Auto-save to localStorage (silent, automatic)
- [ ] Session restore on page reload
- [ ] Save score to .notatePad file (JSON download)
- [ ] Open .notatePad file (load from disk)
- [ ] PDF export (client-side, SVG → PDF via jsPDF)
- [ ] Print support (browser print with score layout)
- [ ] SVG export `[stretch]`
- [ ] Page size options: A4 / Letter `[stretch]`

### Done When
A user can write music, save it to their disk, reload it, and export a print-ready PDF.

---

## Phase 4 — Optional Notation Checker
**Goal:** Let the user check their work — on their terms.

The checker must never run automatically. It is a tool the user picks up when they're ready.

### Deliverables
- [ ] "Check my notation" button in toolbar
- [ ] Validator analyses measures and returns issues (bar beat counts, basic voice issues)
- [ ] Inline results panel (no modal) lists each issue with measure reference
- [ ] Click an issue → score scrolls to and highlights that measure
- [ ] Dismiss individual issues (mark as intentional)
- [ ] Dismiss all / recheck
- [ ] Checker never modifies the score — read-only analysis only
- [ ] Missing accidental detection `[stretch]`

### Done When
A user can voluntarily review their score for notation issues and choose which ones to fix.

---

## Phase 5 — Transposition & Key Tools
**Goal:** Change the key of a passage without rewriting it.

Transposition is one of the most-used features on every sheet music tool. It needs to work correctly and handle edge cases.

### Deliverables
- [ ] Transpose entire score by semitone / interval
- [ ] Transpose selected notes/measures only
- [ ] Key-aware transposition: update key signature along with notes
- [ ] Enharmonic respelling (C# ↔ Db)
- [ ] Concert pitch toggle for transposing instruments `[stretch]`

### Done When
A user can take a score written in C and instantly produce the same piece in Eb.

---

## Phase 6 — Articulations & Dynamics
**Goal:** Express how the music should be played, not just what the notes are.

### Deliverables
- [ ] Dynamics: pp, p, mp, mf, f, ff, ppp, fff
- [ ] Hairpins: crescendo and diminuendo
- [ ] Slurs (curved phrase lines)
- [ ] Ties (connect same pitch across barlines — already partially in Phase 1)
- [ ] Basic articulations: staccato, tenuto, accent, fermata
- [ ] Dynamics reflected in playback (louder/softer)
- [ ] Trill marking `[stretch]`
- [ ] Tempo markings as text (Allegro, Andante etc.) `[stretch]`

### Done When
A user can produce an expressive score that communicates dynamics and phrasing.

---

## Phase 7 — Lyrics & Chord Symbols
**Goal:** Support lead sheet and song writing use cases.

### Deliverables
- [ ] Lyric entry — attach syllable text below notes
- [ ] Hyphen continuation across syllables
- [ ] Melisma extender lines
- [ ] Chord symbols above staff (C, Am, G7, Cmaj9 etc.)
- [ ] Chord symbol transposition follows score transposition
- [ ] Lead sheet layout mode (compact, melody + chords only) `[stretch]`

### Done When
A user can write a complete lead sheet with melody, lyrics, and chord symbols.

---

## Phase 8 — Import
**Goal:** Bring work in from other tools.

### Deliverables
- [ ] MusicXML import (.xml / .mxl)
- [ ] MIDI import (.mid) — converted to notation
- [ ] MusicXML export (complement to import)
- [ ] MIDI export

### Done When
A user can move scores between NotatePad and other notation apps.

---

## Phase 9 — Advanced Playback & Audio
**Goal:** Better-sounding, more controllable playback.

### Deliverables
- [ ] Instrument sound selection per staff (GM soundfont)
- [ ] Per-staff volume and mute/solo
- [ ] Velocity-aware playback (dynamics reflected in volume)
- [ ] MIDI output to external device `[stretch]`
- [ ] MIDI keyboard real-time input `[stretch]`
- [ ] Audio export (WAV) `[stretch]`

### Done When
A user can mix a small ensemble and export audio for sharing.

---

## Phase 10 — Accessibility Pass
**Goal:** NotatePad works for blind and low-vision users, keyboard-only users, and users with motor impairments.

This is not an afterthought — groundwork is laid in every phase. Phase 10 is the full review and completion pass.

### Deliverables
- [ ] Full ARIA audit of all components
- [ ] Screen reader narration of score: every note readable via keyboard navigation
- [ ] ARIA live region announcements for all dynamic events
- [ ] High-contrast mode (complete, polished)
- [ ] Colour blindness safe palette option
- [ ] All features reachable via keyboard only
- [ ] Focus management audit
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard shortcut reference panel (? key)
- [ ] Large print mode `[stretch]`
- [ ] Skip-to-content link

### Done When
A NVDA/JAWS/VoiceOver user can write and play back a simple passage using only the keyboard and screen reader.

---

## Phase 11 — Collaboration & Cloud
**Goal:** Save to the cloud, share with others.

### Deliverables
- [ ] User accounts (email/password + OAuth)
- [ ] Cloud save / sync
- [ ] Shareable read-only links
- [ ] Collaborative editing (multiple users in same score)
- [ ] Comments on measures
- [ ] Version history

### Done When
A user can share a link to their score and a colleague can open it and comment.

---

## Phase 12 — Platform Expansion
**Goal:** NotatePad anywhere.

### Deliverables
- [ ] PWA (installable, offline-capable)
- [ ] Desktop app via Tauri (Mac, Windows, Linux)
- [ ] Mobile view (read-only / annotate on iOS + Android)
- [ ] API for third-party integrations

---

## Deployment

**Host:** Vercel (free tier)
**Live URL:** https://notatepad.vercel.app
**Build command:** `npm run build`
**Output directory:** `dist`

Deployment is automatic — every push to the `main` branch triggers a new production deploy via Vercel's GitHub integration. Preview deployments are generated automatically for every pull request.

### Deployment Phases

| Milestone | Deploy target | Notes |
|---|---|---|
| End of Phase 0 | `notatePad.vercel.app` | First live deploy — blank canvas only, not publicised |
| End of Phase 1 | `notatePad.vercel.app` | Private alpha — share with testers manually |
| End of Phase 3 | `notatePad.vercel.app` | Public beta — ready to share the link |
| v1.0 (Phase 6) | `notatePad.vercel.app` | Public launch |
| Future | Custom domain (optional) | e.g. `notatePad.app` if purchased |

### First Deploy Checklist (Phase 0)
- [ ] Create free Vercel account at vercel.com
- [ ] Push project to a GitHub repository
- [ ] Connect GitHub repo to Vercel via the Vercel dashboard
- [ ] Confirm build succeeds and URL is live
- [ ] Add `vercel.json` config for SPA routing

---

## Version Summary

| Version | Phase(s) | Public label |
|---|---|---|
| v0.1 | Phase 0 | Internal / first Vercel deploy |
| v0.2 | Phase 1 | Private alpha |
| v0.3 | Phase 2 | Private alpha |
| v0.5 | Phase 3 | Public beta |
| v0.6 | Phase 4 | Public beta |
| v0.7 | Phase 5 | Public beta |
| **v1.0** | **Phase 6** | **Public launch on notatePad.vercel.app** |
| v1.1 | Phase 7 | Release |
| v1.2 | Phase 8 | Release |
| v1.3 | Phase 9 | Release |
| v1.4 | Phase 10 | Release |
| v2.0 | Phase 11 | Major release |
| v2.1 | Phase 12 | Major release |

---

## What "Done" Means for Every Phase

Before a phase is marked complete:
- All non-`[stretch]` deliverables are implemented
- No regressions in features from previous phases
- Manual smoke test completed on Chrome, Firefox, and Safari
- Accessibility not broken (keyboard nav, ARIA labels in place)
- FEATURES.md updated to mark implemented items
- A brief changelog entry written
