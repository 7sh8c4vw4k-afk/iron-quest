# Iron Quest

Gym / strength RPG PWA — Hevy-inspired logging with body-part RPG progression.

**Live:** https://7sh8c4vw4k-afk.github.io/iron-quest/

## Features (v2.0)

### Bottom nav (5 tabs)
1. **Profile** — level/XP, weekly streak, compact body-part stats, dashboard widgets (+ Widget toggles)
2. **History** — chronological workouts with exercise summary + XP; PR list
3. **Start (+)** — empty workout + template grid (Back / Chest / Leg / Shoulder / Grip Test); searchable add-exercise picker; create custom templates
4. **Exercises** — searchable A–Z library (90 mapped lifts + customs), body-part & category filters, last/best performance
5. **Measure** — body circumference list (cm, L/R where shown) + body weight log

### RPG (unchanged core)
- 18 body-part / activity stats with primary/secondary exercise maps
- XP + daily cap, weekly streak + monthly freeze, daily/weekly quests
- Soft-capped stat gains per session; PRs via estimated 1RM

### Storage
`localStorage` key **`iron-quest-v1`** (backward-compatible; state `version` 3). New fields: widgets, bodyWeightLog, measurements, templates, customExercises. Existing workouts/XP/stats/PRs kept.

### PWA
Service worker **`iron-quest-v7`**. Installable on iPhone (Add to Home Screen).

## Tech
Vanilla HTML / CSS / JS — dark UI with orange accents. No build step.

## License
Personal project for Long.
