# Iron Quest

Gym / strength RPG PWA — log lifts, level **body-part & activity** stats, chase PRs and weekly streaks.

Inspired by Ascend-style progression and Hevy-style workout logging (no Habitica-style punishment).

**Live:** https://7sh8c4vw4k-afk.github.io/iron-quest/

## Features

- **Home:** level + XP bar, body-part / activity stats (scrollable compact bars), weekly streak, daily/weekly quests, last workout, log CTA
- **Workout log:** Push / Pull / Legs / Upper / Full / Stretch / Meditation / Cardio / Custom; exercises with weight × reps × RPE; mark sets done
- **Weekly streak:** consecutive ISO weeks with ≥1 completed workout; optional **1 streak freeze / month**
- **PRs:** best estimated 1RM (Epley-ish: `weight × (1 + reps/30)`) per exercise name
- **Quests:** daily “complete a workout” (+25 XP) · weekly boss “3 sessions” (+60 XP)
- **History** of sessions + PR list
- **Settings:** display name (default **Long**), full reset with confirm
- **PWA:** manifest, service worker, Apple meta, installable on iPhone

## Storage

All data stays in the browser:

```
localStorage key: iron-quest-v1
```

State `version` is **2** (body-part stats). If an older Ascend-style `stats` object is found (`strength` / `conditioning` / `endurance` / `stamina` / `intelligence`), those keys are **ignored and reset** to the new body-part shape. XP, workouts, and PRs are kept.

## Body-part & activity stats

Stable ids → labels on Home:

| Id | Label | Id | Label |
|----|-------|----|-------|
| `chest` | Chest | `hamstring` | Hamstring |
| `tricep` | Tricep | `quad` | Quad |
| `delt` | Delt | `calve` | Calve |
| `serratus` | Serratus | `core` | Core |
| `lat` | Lat | `forearm` | Forearm |
| `bicep` | Bicep | `neck` | Neck |
| `trap` | Trap | `stretch` | Stretch |
| `rotator` | Rotator | `meditation` | Meditation |
| `glute` | Glute | `cardio` | Cardio |

### How mapping works

Each library exercise has **primary** (+ optional **secondary**) body-part ids. Completing sets bumps those stats:

- **Primary:** ~0.28 per completed set + light volume bonus (`weight × reps`)
- **Secondary:** ~0.12 per set + smaller volume share
- **Soft caps:** ≤ ~2.4 per stat per session, and ≤ ~12 total across all parts — one session cannot max everything
- **Clamp:** each stat is capped at **99**

Examples from the seed library:

| Exercise | Primary | Secondary |
|----------|---------|-----------|
| Bench Press | Chest | Tricep, Delt |
| Barbell / Dumbbell Row | Lat | Bicep (+ Trap on barbell) |
| Romanian Deadlift | Hamstring | Glute |
| Plank | Core | — |
| Face Pull | Rotator | Delt, Trap |
| Calf Raise | Calve | — |

Custom names not in the library are inferred from name patterns (e.g. “incline fly” → Chest).

### Stretch / Meditation / Cardio

These are first-class **activity** stats:

1. Log library entries tagged as activities (`Stretch`, `Meditation`, `Cardio`, `Run`, `Mobility Flow`, …), **or**
2. Pick session type **Stretch** / **Meditation** / **Cardio** (adds a session-level bump on top of any mapped exercises)

RPE and form/session notes remain optional fields only — they no longer feed a special Intelligence stat.

## XP

- Base **~20 XP** + **2 XP per completed set** + light volume bonus (`min(40, floor(volume/500))` where volume = Σ weight×reps)
- Small bonus for Full/Custom sessions (and activity session types)
- **Daily soft cap: 150 XP** (sessions still save after the cap)
- Extra from quests when first completed in the period
- Level curve: need ≈ `100 + (level-1)×40 + (level-1)^1.35×8` XP to level up

## Tech

Vanilla HTML / CSS / JS — no build step. Mobile-first, dark navy + amber athletic UI.

```
index.html  styles.css  app.js  sw.js  manifest.webmanifest  icons/
```

## Local use

Open `index.html` over HTTPS or localhost (service worker needs a secure context), or deploy with GitHub Pages from `/` on `main`.

## License

Personal project for Long.
