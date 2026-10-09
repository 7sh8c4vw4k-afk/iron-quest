# Iron Quest

Gym / strength RPG PWA — log lifts, level up character stats, chase PRs and weekly streaks.

Inspired by Ascend-style progression and Hevy-style workout logging (no Habitica-style punishment).

**Live:** https://7sh8c4vw4k-afk.github.io/iron-quest/

## Features

- **Home:** level + XP bar, 5 stats, weekly streak, daily/weekly quests, last workout, log CTA
- **Workout log:** Push / Pull / Legs / Upper / Full / Custom; exercises with weight × reps × RPE; mark sets done
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

## Stats update rules

| Stat | Grows from |
|------|------------|
| **Strength** | Heavy compound sets (≤8 reps) matching squat / bench / deadlift / OHP / row / pull-up patterns (library `compound` tag or name match) |
| **Conditioning** | Higher-rep sets (≥12 reps) and conditioning-tagged moves (e.g. plank, burpees); bonus if session notes mention circuit/HIIT |
| **Endurance** | Total completed sets in the session |
| **Stamina** | Workouts completed in the current ISO week (scales with weekly count) |
| **Intelligence** | Bonus when you add **RPE** on sets or **form/session notes** |

Stats are soft-capped per session and clamped to a max of **99**.

## XP

- Base **~20 XP** + **2 XP per completed set** + light volume bonus (`min(40, floor(volume/500))` where volume = Σ weight×reps)
- Small bonus for Full/Custom sessions
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
