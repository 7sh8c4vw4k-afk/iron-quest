(() => {
  'use strict';

  const STORAGE_KEY = 'iron-quest-v1';
  const DAILY_XP_CAP = 150;
  const OLD_STAT_KEYS = ['strength', 'conditioning', 'endurance', 'stamina', 'intelligence'];
  const STAT_DEFS = [
    { id: 'chest', label: 'Chest' },
    { id: 'tricep', label: 'Tricep' },
    { id: 'delt', label: 'Delt' },
    { id: 'serratus', label: 'Serratus' },
    { id: 'lat', label: 'Lat' },
    { id: 'bicep', label: 'Bicep' },
    { id: 'trap', label: 'Trap' },
    { id: 'rotator', label: 'Rotator' },
    { id: 'glute', label: 'Glute' },
    { id: 'hamstring', label: 'Hamstring' },
    { id: 'quad', label: 'Quad' },
    { id: 'calve', label: 'Calve' },
    { id: 'core', label: 'Core' },
    { id: 'forearm', label: 'Forearm' },
    { id: 'neck', label: 'Neck' },
    { id: 'stretch', label: 'Stretch' },
    { id: 'meditation', label: 'Meditation' },
    { id: 'cardio', label: 'Cardio' }
  ];
  const STAT_NAMES = STAT_DEFS.map((s) => s.id);
  const STAT_LABELS = Object.fromEntries(STAT_DEFS.map((s) => [s.id, s.label]));
  const ACTIVITY_STATS = new Set(['stretch', 'meditation', 'cardio']);
  const SESSION_TYPES = ['Push', 'Pull', 'Legs', 'Upper', 'Full', 'Stretch', 'Meditation', 'Cardio', 'Custom'];
  const SESSION_ACTIVITY_MAP = {
    Stretch: 'stretch',
    Meditation: 'meditation',
    Cardio: 'cardio'
  };
  const RANKS = [
    [1, 'Novice'], [5, 'Apprentice'], [10, 'Ironhand'],
    [15, 'Veteran'], [20, 'Champion'], [30, 'Titan'], [50, 'Legend']
  ];

  // primary / secondary = body-part or activity ids; tags kept for UI badges
  const EXERCISE_LIBRARY = [
    { name: "Archer Pull-up", primary: ["lat"], secondary: ["bicep", "forearm"], tags: ["compound", "pull"] },
    { name: "Back Extension", primary: ["glute"], secondary: ["hamstring", "core"], tags: ["legs", "core"] },
    { name: "Barbell Row", primary: ["lat"], secondary: ["bicep", "trap"], tags: ["compound", "pull"] },
    { name: "Barbell Trap Row", primary: ["trap"], secondary: ["lat", "bicep"], tags: ["pull", "compound"] },
    { name: "Behind Neck OHP", primary: ["delt"], secondary: ["tricep", "trap"], tags: ["compound", "push"] },
    { name: "Bench Dip", primary: ["tricep"], secondary: ["chest", "delt"], tags: ["push"] },
    { name: "Bench Press", primary: ["chest"], secondary: ["tricep", "delt"], tags: ["compound", "push"] },
    { name: "Bicep Curl", primary: ["bicep"], secondary: ["forearm"], tags: ["pull"] },
    { name: "Bike", primary: ["cardio"], secondary: [], tags: ["activity", "cardio"] },
    { name: "Breathwork", primary: ["meditation"], secondary: [], tags: ["activity", "meditation"] },
    { name: "Bulgarian Squat", primary: ["quad"], secondary: ["glute"], tags: ["legs"] },
    { name: "Burpees", primary: ["cardio"], secondary: ["core", "chest"], tags: ["activity", "cardio"] },
    { name: "Cable Arm Wrestling", primary: ["forearm"], secondary: ["bicep"], tags: ["pull"] },
    { name: "Cable Crunch", primary: ["core"], secondary: [], tags: ["core"] },
    { name: "Cable Fly", primary: ["chest"], secondary: ["delt"], tags: ["push"] },
    { name: "Calf Raise", primary: ["calve"], secondary: [], tags: ["legs"] },
    { name: "Cardio", primary: ["cardio"], secondary: [], tags: ["activity", "cardio"] },
    { name: "Chest Fly", primary: ["chest"], secondary: ["delt"], tags: ["push"] },
    { name: "Chin-Up", primary: ["lat"], secondary: ["bicep", "forearm"], tags: ["compound", "pull"] },
    { name: "Clap Push-up", primary: ["chest"], secondary: ["tricep", "delt"], tags: ["push"] },
    { name: "Copenhagen Plank", primary: ["core"], secondary: ["stretch"], tags: ["core"] },
    { name: "Cuban Press", primary: ["rotator"], secondary: ["delt"], tags: ["pull", "push"] },
    { name: "David Stretch", primary: ["stretch"], secondary: [], tags: ["activity", "stretch"] },
    { name: "Dead Hang", primary: ["forearm"], secondary: ["lat", "stretch"], tags: ["grip", "stretch"] },
    { name: "Deadlift", primary: ["hamstring", "glute"], secondary: ["lat", "trap", "core"], tags: ["compound", "pull", "legs"] },
    { name: "Delt Circle + Drop", primary: ["delt"], secondary: [], tags: ["push"] },
    { name: "Dip", primary: ["chest"], secondary: ["tricep", "delt"], tags: ["compound", "push"] },
    { name: "Dolphin Press", primary: ["delt"], secondary: ["core", "serratus"], tags: ["push"] },
    { name: "Dumbbell Press", primary: ["chest"], secondary: ["tricep", "delt"], tags: ["compound", "push"] },
    { name: "Dumbbell Row", primary: ["lat"], secondary: ["bicep"], tags: ["compound", "pull"] },
    { name: "Face Pull", primary: ["rotator"], secondary: ["delt", "trap"], tags: ["pull"] },
    { name: "Farmer Carry", primary: ["forearm"], secondary: ["trap", "core"], tags: ["carry"] },
    { name: "Finger Hold", primary: ["forearm"], secondary: [], tags: ["grip"] },
    { name: "Forearm Band Roll", primary: ["forearm"], secondary: [], tags: ["forearm"] },
    { name: "Forearm Cable Roll", primary: ["forearm"], secondary: [], tags: ["forearm"] },
    { name: "Forearm Roll", primary: ["forearm"], secondary: [], tags: ["forearm"] },
    { name: "Hammer Curl", primary: ["bicep"], secondary: ["forearm"], tags: ["pull"] },
    { name: "Hanging Leg Raise", primary: ["core"], secondary: ["forearm"], tags: ["core"] },
    { name: "Hip Thrust", primary: ["glute"], secondary: ["hamstring"], tags: ["legs"] },
    { name: "Hollow Body Row", primary: ["lat"], secondary: ["core", "bicep"], tags: ["pull", "core"] },
    { name: "In / Ext Rotation", primary: ["rotator"], secondary: ["delt"], tags: ["pull"] },
    { name: "Incline Bench Press", primary: ["chest"], secondary: ["tricep", "delt"], tags: ["compound", "push"] },
    { name: "Lat Pulldown", primary: ["lat"], secondary: ["bicep"], tags: ["pull"] },
    { name: "Lateral Raise", primary: ["delt"], secondary: [], tags: ["push"] },
    { name: "Leg Curl", primary: ["hamstring"], secondary: [], tags: ["legs"] },
    { name: "Leg Extension", primary: ["quad"], secondary: [], tags: ["legs"] },
    { name: "Leg Press", primary: ["quad"], secondary: ["glute"], tags: ["legs"] },
    { name: "Leg Raise", primary: ["core"], secondary: [], tags: ["core"] },
    { name: "Lunges", primary: ["quad"], secondary: ["glute"], tags: ["legs"] },
    { name: "Meditation", primary: ["meditation"], secondary: [], tags: ["activity", "meditation"] },
    { name: "Mobility Flow", primary: ["stretch"], secondary: [], tags: ["activity", "stretch"] },
    { name: "Neck Curl", primary: ["neck"], secondary: [], tags: ["neck"] },
    { name: "Neck Extension", primary: ["neck"], secondary: [], tags: ["neck"] },
    { name: "Neck Work", primary: ["neck"], secondary: [], tags: ["neck"] },
    { name: "Nordic Curl", primary: ["hamstring"], secondary: [], tags: ["legs"] },
    { name: "Overhead Press", primary: ["delt"], secondary: ["tricep", "trap"], tags: ["compound", "push"] },
    { name: "Plank", primary: ["core"], secondary: [], tags: ["core"] },
    { name: "Plank Up-down", primary: ["core"], secondary: ["delt", "serratus"], tags: ["core"] },
    { name: "Pull-Up", primary: ["lat"], secondary: ["bicep", "forearm"], tags: ["compound", "pull"] },
    { name: "Push-Up", primary: ["chest"], secondary: ["tricep", "serratus", "core"], tags: ["push"] },
    { name: "Rear Delt Row", primary: ["delt"], secondary: ["rotator", "trap"], tags: ["pull"] },
    { name: "Reverse Barbell Curl", primary: ["forearm"], secondary: ["bicep"], tags: ["pull"] },
    { name: "Reverse Nordic Curl", primary: ["quad"], secondary: [], tags: ["legs"] },
    { name: "Romanian Deadlift", primary: ["hamstring"], secondary: ["glute"], tags: ["compound", "legs", "pull"] },
    { name: "Row Erg", primary: ["cardio"], secondary: ["lat", "core"], tags: ["activity", "cardio"] },
    { name: "Run", primary: ["cardio"], secondary: [], tags: ["activity", "cardio"] },
    { name: "Seated Row", primary: ["lat"], secondary: ["bicep"], tags: ["pull", "compound"] },
    { name: "Serratus Punch", primary: ["serratus"], secondary: ["delt"], tags: ["push"] },
    { name: "Shrug", primary: ["trap"], secondary: ["forearm"], tags: ["pull"] },
    { name: "Side Oblique", primary: ["core"], secondary: [], tags: ["core"] },
    { name: "Skull Crusher", primary: ["tricep"], secondary: [], tags: ["push"] },
    { name: "SLRDL", primary: ["hamstring"], secondary: ["glute"], tags: ["legs", "compound"] },
    { name: "Sphinx Push-up", primary: ["tricep"], secondary: ["chest", "core"], tags: ["push"] },
    { name: "Squat", primary: ["quad"], secondary: ["glute", "core"], tags: ["compound", "legs"] },
    { name: "Step Up", primary: ["quad"], secondary: ["glute"], tags: ["legs"] },
    { name: "Stretch", primary: ["stretch"], secondary: [], tags: ["activity", "stretch"] },
    { name: "Swiss Ball Leg Curl", primary: ["hamstring"], secondary: ["glute", "core"], tags: ["legs"] },
    { name: "Teres Pull-up", primary: ["lat"], secondary: ["rotator", "bicep"], tags: ["compound", "pull"] },
    { name: "Towel Homers", primary: ["forearm"], secondary: ["bicep"], tags: ["pull", "grip"] },
    { name: "Tricep Bar Push", primary: ["tricep"], secondary: [], tags: ["push"] },
    { name: "Tricep Extension", primary: ["tricep"], secondary: [], tags: ["push"] },
    { name: "Tricep Fat Grip", primary: ["tricep"], secondary: ["forearm"], tags: ["push"] },
    { name: "Tricep Pushdown", primary: ["tricep"], secondary: [], tags: ["push"] },
    { name: "Turkish Get-up", primary: ["core"], secondary: ["delt", "glute"], tags: ["compound"] },
    { name: "Vacuum", primary: ["core"], secondary: [], tags: ["core"] },
    { name: "Weighted Dip", primary: ["chest"], secondary: ["tricep", "delt"], tags: ["compound", "push"] },
    { name: "Weighted Pull-Up", primary: ["lat"], secondary: ["bicep", "forearm"], tags: ["compound", "pull"] },
    { name: "Zercher Curl", primary: ["bicep"], secondary: ["forearm", "core"], tags: ["pull"] },
    { name: "Zercher Deadlift", primary: ["hamstring", "glute"], secondary: ["core", "trap"], tags: ["compound", "pull", "legs"] },
    { name: "Zercher Squat", primary: ["quad"], secondary: ["core", "glute"], tags: ["compound", "legs"] },
  ];

  const COMPOUND_PATTERNS = [
    /squat/i, /bench/i, /deadlift/i, /\bohp\b/i, /overhead\s*press/i,
    /military\s*press/i, /\brow\b/i, /pull[\s-]?up/i, /chin[\s-]?up/i,
    /rdl/i, /romanian/i
  ];

  const NAME_INFER = [
    { re: /bench|fly|pec\b|push[\s-]?up/i, primary: ['chest'], secondary: ['tricep', 'delt'] },
    { re: /ohp|overhead|military\s*press|lateral\s*raise|delt/i, primary: ['delt'], secondary: ['tricep'] },
    { re: /tricep|pushdown|skull|dip/i, primary: ['tricep'], secondary: [] },
    { re: /serratus/i, primary: ['serratus'], secondary: [] },
    { re: /pulldown|pull[\s-]?up|chin[\s-]?up|\brow\b|lat\b/i, primary: ['lat'], secondary: ['bicep'] },
    { re: /curl|bicep/i, primary: ['bicep'], secondary: ['forearm'] },
    { re: /face\s*pull|rotator|external\s*rot/i, primary: ['rotator'], secondary: ['delt'] },
    { re: /shrug|trap/i, primary: ['trap'], secondary: [] },
    { re: /rdl|romanian|hamstring|leg\s*curl/i, primary: ['hamstring'], secondary: ['glute'] },
    { re: /hip\s*thrust|glute|kickback/i, primary: ['glute'], secondary: ['hamstring'] },
    { re: /squat|leg\s*press|lunge|leg\s*extension|quad/i, primary: ['quad'], secondary: ['glute'] },
    { re: /deadlift/i, primary: ['hamstring', 'glute'], secondary: ['lat', 'trap', 'core'] },
    { re: /calf|calve/i, primary: ['calve'], secondary: [] },
    { re: /plank|crunch|sit[\s-]?up|core|hollow/i, primary: ['core'], secondary: [] },
    { re: /farmer|forearm|grip|wrist/i, primary: ['forearm'], secondary: [] },
    { re: /neck/i, primary: ['neck'], secondary: [] },
    { re: /stretch|mobility|yoga/i, primary: ['stretch'], secondary: [] },
    { re: /meditat|breath|mindful/i, primary: ['meditation'], secondary: [] },
    { re: /cardio|run|bike|erg|burpee|hiit|jog|swim/i, primary: ['cardio'], secondary: [] }
  ];

  // —— state ——
  function defaultStats() {
    const stats = {};
    for (const id of STAT_NAMES) stats[id] = 1;
    return stats;
  }

  function defaultState() {
    return {
      version: 2,
      displayName: 'Long',
      level: 1,
      xp: 0,
      xpToday: 0,
      xpTodayDate: localDateKey(new Date()),
      stats: defaultStats(),
      workouts: [],
      prs: {},
      streakFreezeMonth: null,
      freezeAvailable: true,
      draft: null,
      questsClaimed: { daily: null, weekly: null }
    };
  }

  function normalizeStats(rawStats) {
    if (!rawStats || typeof rawStats !== 'object') return defaultStats();
    const keys = Object.keys(rawStats);
    const hasOld = keys.some((k) => OLD_STAT_KEYS.includes(k));
    const hasNew = keys.some((k) => STAT_NAMES.includes(k));
    if (hasOld && !hasNew) return defaultStats();
    const out = defaultStats();
    for (const id of STAT_NAMES) {
      if (typeof rawStats[id] === 'number' && !Number.isNaN(rawStats[id])) {
        out[id] = Math.min(99, Math.max(0, rawStats[id]));
      }
    }
    return out;
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        version: 2,
        stats: normalizeStats(parsed.stats),
        questsClaimed: { ...base.questsClaimed, ...(parsed.questsClaimed || {}) },
        prs: parsed.prs && typeof parsed.prs === 'object' ? parsed.prs : {},
        workouts: Array.isArray(parsed.workouts) ? parsed.workouts : []
      };
    } catch {
      return defaultState();
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function localDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function isoWeekKey(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  function prevIsoWeek(key) {
    const [y, w] = key.split('-W').map(Number);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const day = jan4.getUTCDay() || 7;
    const monday = new Date(jan4);
    monday.setUTCDate(jan4.getUTCDate() - day + 1 + (w - 1) * 7);
    monday.setUTCDate(monday.getUTCDate() - 7);
    return isoWeekKey(new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()));
  }

  function monthKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function ensureDailyXpReset() {
    const today = localDateKey(new Date());
    if (state.xpTodayDate !== today) {
      state.xpToday = 0;
      state.xpTodayDate = today;
    }
  }

  function xpForLevel(level) {
    return Math.round(100 + (level - 1) * 40 + Math.pow(level - 1, 1.35) * 8);
  }

  function rankForLevel(level) {
    let name = RANKS[0][1];
    for (const [n, r] of RANKS) {
      if (level >= n) name = r;
    }
    return name;
  }

  function addXp(amount) {
    ensureDailyXpReset();
    const room = Math.max(0, DAILY_XP_CAP - state.xpToday);
    const gained = Math.min(room, Math.max(0, Math.round(amount)));
    if (gained <= 0) return 0;
    state.xpToday += gained;
    state.xp += gained;
    while (state.xp >= xpForLevel(state.level)) {
      state.xp -= xpForLevel(state.level);
      state.level += 1;
    }
    return gained;
  }

  function bumpStat(key, amount) {
    if (!STAT_NAMES.includes(key)) return;
    if (!state.stats[key] && state.stats[key] !== 0) state.stats[key] = 1;
    state.stats[key] = Math.min(99, Math.round((state.stats[key] + amount) * 10) / 10);
  }

  function isCompound(name, tags) {
    if (tags && tags.some((t) => t === 'compound')) return true;
    return COMPOUND_PATTERNS.some((re) => re.test(name));
  }

  function estimated1RM(weight, reps) {
    if (!weight || !reps) return 0;
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  }

  function lookupExercise(name) {
    const lib = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === String(name || '').toLowerCase());
    if (lib) {
      return {
        primary: lib.primary.slice(),
        secondary: (lib.secondary || []).slice(),
        tags: lib.tags || []
      };
    }
    for (const rule of NAME_INFER) {
      if (rule.re.test(name || '')) {
        return {
          primary: rule.primary.slice(),
          secondary: (rule.secondary || []).slice(),
          tags: []
        };
      }
    }
    return { primary: [], secondary: [], tags: [] };
  }

  function weeksWithWorkouts() {
    const set = new Set();
    for (const w of state.workouts) {
      if (!w.completedAt) continue;
      set.add(isoWeekKey(new Date(w.completedAt)));
    }
    return set;
  }

  function computeStreak() {
    const weeks = weeksWithWorkouts();
    const now = new Date();
    let cur = isoWeekKey(now);
    let streak = 0;
    if (!weeks.has(cur)) {
      cur = prevIsoWeek(cur);
    }
    while (weeks.has(cur)) {
      streak += 1;
      cur = prevIsoWeek(cur);
      if (streak > 520) break;
    }
    return streak;
  }

  function canUseFreeze() {
    const mk = monthKey(new Date());
    return state.streakFreezeMonth !== mk;
  }

  function applyFreeze() {
    if (!canUseFreeze()) {
      toast('Freeze already used this month');
      return;
    }
    const weeks = weeksWithWorkouts();
    const thisWeek = isoWeekKey(new Date());
    const lastWeek = prevIsoWeek(thisWeek);
    if (weeks.has(thisWeek) || weeks.has(lastWeek)) {
      toast('No gap to freeze — streak is alive');
      return;
    }
    state.workouts.push({
      id: 'freeze-' + Date.now(),
      type: 'Freeze',
      name: 'Streak Freeze',
      exercises: [],
      notes: '',
      completedAt: (() => {
        const [y, w] = lastWeek.split('-W').map(Number);
        const jan4 = new Date(Date.UTC(y, 0, 4));
        const day = jan4.getUTCDay() || 7;
        const monday = new Date(jan4);
        monday.setUTCDate(jan4.getUTCDate() - day + 1 + (w - 1) * 7);
        monday.setUTCDate(monday.getUTCDate() + 2);
        return new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate(), 12).toISOString();
      })(),
      xpAwarded: 0,
      statsDelta: {},
      isFreeze: true
    });
    state.streakFreezeMonth = monthKey(new Date());
    save();
    toast('❄ Streak freeze applied for last week');
    renderHome();
  }

  function workoutsOnDate(dateKey) {
    return state.workouts.filter((w) => !w.isFreeze && w.completedAt && localDateKey(new Date(w.completedAt)) === dateKey).length;
  }

  function workoutsInIsoWeek(weekKey) {
    return state.workouts.filter((w) => !w.isFreeze && w.completedAt && isoWeekKey(new Date(w.completedAt)) === weekKey).length;
  }

  function claimQuestsIfNeeded() {
    ensureDailyXpReset();
    const today = localDateKey(new Date());
    const week = isoWeekKey(new Date());
    let bonus = 0;
    if (workoutsOnDate(today) >= 1 && state.questsClaimed.daily !== today) {
      bonus += addXp(25);
      state.questsClaimed.daily = today;
    }
    if (workoutsInIsoWeek(week) >= 3 && state.questsClaimed.weekly !== week) {
      bonus += addXp(60);
      state.questsClaimed.weekly = week;
    }
    return bonus;
  }

  const PRIMARY_PER_SET = 0.28;
  const SECONDARY_PER_SET = 0.12;
  const VOLUME_SCALE = 0.00035;
  const ACTIVITY_PER_SET = 0.45;
  const PER_STAT_SOFT_CAP = 2.4;
  const SESSION_TOTAL_SOFT_CAP = 12;

  function emptyDelta() {
    const d = {};
    for (const id of STAT_NAMES) d[id] = 0;
    return d;
  }

  function addDelta(delta, key, amount) {
    if (!STAT_NAMES.includes(key) || amount <= 0) return;
    delta[key] = (delta[key] || 0) + amount;
  }

  function softCapDelta(delta) {
    let total = 0;
    for (const id of STAT_NAMES) {
      delta[id] = Math.min(PER_STAT_SOFT_CAP, Math.round((delta[id] || 0) * 100) / 100);
      total += delta[id];
    }
    if (total > SESSION_TOTAL_SOFT_CAP && total > 0) {
      const scale = SESSION_TOTAL_SOFT_CAP / total;
      for (const id of STAT_NAMES) {
        delta[id] = Math.round(delta[id] * scale * 100) / 100;
      }
    }
    return delta;
  }

  function scoreWorkout(draft) {
    let completedSets = 0;
    let volume = 0;
    const prHits = [];
    const statsDelta = emptyDelta();

    for (const ex of draft.exercises) {
      const map = lookupExercise(ex.name);
      let exSets = 0;
      let exVol = 0;

      for (const set of ex.sets) {
        if (!set.done) continue;
        completedSets += 1;
        exSets += 1;
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;
        const setVol = w * r;
        volume += setVol;
        exVol += setVol;

        if (w > 0 && r > 0) {
          const e1 = estimated1RM(w, r);
          const prev = state.prs[ex.name];
          if (!prev || e1 > prev.e1rm) {
            state.prs[ex.name] = {
              weight: w,
              reps: r,
              e1rm: Math.round(e1 * 10) / 10,
              date: new Date().toISOString()
            };
            prHits.push(ex.name);
          }
        }
      }

      if (exSets <= 0) continue;

      const volBonus = Math.min(1.2, exVol * VOLUME_SCALE);
      const isActivity = map.primary.some((p) => ACTIVITY_STATS.has(p)) ||
        (map.tags || []).some((t) => ACTIVITY_STATS.has(t) || t === 'activity');

      if (isActivity) {
        for (const p of map.primary) {
          if (ACTIVITY_STATS.has(p)) {
            addDelta(statsDelta, p, exSets * ACTIVITY_PER_SET + volBonus * 0.3);
          } else {
            addDelta(statsDelta, p, exSets * PRIMARY_PER_SET * 0.5 + volBonus * 0.25);
          }
        }
        for (const s of map.secondary) {
          addDelta(statsDelta, s, exSets * SECONDARY_PER_SET * 0.5);
        }
      } else {
        for (const p of map.primary) {
          addDelta(statsDelta, p, exSets * PRIMARY_PER_SET + volBonus);
        }
        for (const s of map.secondary) {
          addDelta(statsDelta, s, exSets * SECONDARY_PER_SET + volBonus * 0.35);
        }
      }
    }

    const sessionActivity = SESSION_ACTIVITY_MAP[draft.type];
    if (sessionActivity) {
      const base = Math.max(0.6, completedSets * 0.35);
      addDelta(statsDelta, sessionActivity, base);
    }

    softCapDelta(statsDelta);

    let xpRaw = 20 + completedSets * 2 + Math.min(40, Math.floor(volume / 500));
    if (draft.type === 'Full' || draft.type === 'Custom') xpRaw += 5;
    if (sessionActivity) xpRaw += 3;

    const compact = {};
    for (const id of STAT_NAMES) {
      if (statsDelta[id] > 0) compact[id] = statsDelta[id];
    }

    return { xpRaw, statsDelta: compact, completedSets, volume, prHits };
  }

  function completeSession() {
    if (!state.draft || !state.draft.exercises.length) {
      toast('Add at least one exercise');
      return;
    }
    const anyDone = state.draft.exercises.some((e) => e.sets.some((s) => s.done));
    if (!anyDone) {
      toast('Mark at least one set done');
      return;
    }

    const result = scoreWorkout(state.draft);
    for (const k of Object.keys(result.statsDelta)) {
      bumpStat(k, result.statsDelta[k]);
    }

    const workout = {
      id: 'w-' + Date.now(),
      type: state.draft.type,
      name: state.draft.name || state.draft.type,
      exercises: state.draft.exercises,
      notes: state.draft.notes || '',
      completedAt: new Date().toISOString(),
      xpAwarded: 0,
      statsDelta: result.statsDelta,
      volume: result.volume,
      completedSets: result.completedSets
    };

    state.workouts.unshift(workout);

    const gained = addXp(result.xpRaw);
    workout.xpAwarded = gained;
    const questBonus = claimQuestsIfNeeded();

    state.draft = null;
    save();

    let msg = `+${gained} XP`;
    if (questBonus) msg += ` · +${questBonus} quest`;
    if (result.prHits.length) msg += ` · PR: ${result.prHits.slice(0, 2).join(', ')}`;
    const topParts = Object.entries(result.statsDelta)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => STAT_LABELS[k]);
    if (topParts.length) msg += ` · ${topParts.join('/')}`;
    if (gained === 0 && result.xpRaw > 0) msg = 'Daily XP cap reached — session saved';
    toast(msg);

    showView('home');
    renderAll();
  }

  function $(id) { return document.getElementById(id); }
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 2800);
  }

  function showView(name) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    const map = { home: 'view-home', workout: 'view-workout', history: 'view-history', settings: 'view-settings' };
    $(map[name]).classList.add('active');
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.view === name || (name === 'settings' && t.dataset.view === 'home'));
    });
    if (name === 'workout') renderWorkoutView();
    if (name === 'history') renderHistory();
    if (name === 'home') renderHome();
    if (name === 'settings') {
      $('setting-name').value = state.displayName;
    }
  }

  function confirmDialog(title, msg) {
    return new Promise((resolve) => {
      const dlg = $('confirm-dialog');
      $('confirm-title').textContent = title;
      $('confirm-msg').textContent = msg;
      dlg.showModal();
      dlg.addEventListener('close', function onClose() {
        dlg.removeEventListener('close', onClose);
        resolve(dlg.returnValue === 'ok');
      });
    });
  }

  function renderHome() {
    ensureDailyXpReset();
    $('greeting').textContent = `Hey, ${state.displayName}`;
    $('level-badge').textContent = state.level;
    $('level-num').textContent = state.level;
    $('rank-name').textContent = rankForLevel(state.level);
    const need = xpForLevel(state.level);
    $('xp-current').textContent = state.xp;
    $('xp-next').textContent = need;
    $('xp-fill').style.width = `${Math.min(100, (state.xp / need) * 100)}%`;
    $('xp-today').textContent = state.xpToday;
    $('xp-cap').textContent = DAILY_XP_CAP;

    const streak = computeStreak();
    $('streak-weeks').textContent = streak;
    const weeks = weeksWithWorkouts();
    const thisWeek = isoWeekKey(new Date());
    const trained = weeks.has(thisWeek);
    $('streak-detail').textContent = trained
      ? `Trained this week · ${workoutsInIsoWeek(thisWeek)} session(s)`
      : 'Train this week to keep the streak';

    const freezeBtn = $('btn-freeze');
    freezeBtn.hidden = !canUseFreeze();
    freezeBtn.title = canUseFreeze() ? 'Use 1 streak freeze this month' : 'Freeze used this month';

    const grid = $('stats-grid');
    grid.innerHTML = STAT_NAMES.map((k) => {
      const v = state.stats[k] ?? 1;
      const pct = Math.min(100, (v / 50) * 100);
      const activity = ACTIVITY_STATS.has(k) ? ' activity' : '';
      return `<div class="stat-row${activity}">
        <div class="stat-name">${STAT_LABELS[k]}</div>
        <div class="stat-bar"><div class="stat-fill" style="width:${pct}%"></div></div>
        <div class="stat-val">${v}</div>
      </div>`;
    }).join('');

    const today = localDateKey(new Date());
    const week = isoWeekKey(new Date());
    const dailyDone = workoutsOnDate(today) >= 1;
    const weeklyCount = workoutsInIsoWeek(week);
    const weeklyDone = weeklyCount >= 3;
    $('quests-list').innerHTML = `
      <div class="quest ${dailyDone ? 'done' : ''}">
        <div class="quest-icon">${dailyDone ? '✅' : '⚔️'}</div>
        <div class="quest-body">
          <strong>Daily: Complete a workout</strong>
          <div class="muted">${dailyDone ? 'Claimed +25 XP' : 'Log any session today · +25 XP'}</div>
          <div class="quest-progress"><i style="width:${dailyDone ? 100 : 0}%"></i></div>
        </div>
      </div>
      <div class="quest ${weeklyDone ? 'done' : ''}">
        <div class="quest-icon">${weeklyDone ? '🏆' : '🐉'}</div>
        <div class="quest-body">
          <strong>Weekly boss: Hit 3 sessions</strong>
          <div class="muted">${weeklyCount}/3 this week · +60 XP</div>
          <div class="quest-progress"><i style="width:${Math.min(100, (weeklyCount / 3) * 100)}%"></i></div>
        </div>
      </div>`;

    const last = state.workouts.find((w) => !w.isFreeze);
    const lw = $('last-workout');
    if (!last) {
      lw.innerHTML = '<span class="muted">No sessions logged yet. Hit the iron.</span>';
    } else {
      const when = new Date(last.completedAt);
      lw.innerHTML = `<strong>${escapeHtml(last.name)}</strong>
        <div class="muted small">${when.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        · ${last.completedSets || 0} sets · +${last.xpAwarded || 0} XP</div>`;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function partTagsHtml(map) {
    const bits = [];
    for (const p of map.primary) {
      bits.push(`<span class="tag part">${escapeHtml(STAT_LABELS[p] || p)}</span>`);
    }
    for (const s of map.secondary.slice(0, 2)) {
      bits.push(`<span class="tag part secondary">${escapeHtml(STAT_LABELS[s] || s)}</span>`);
    }
    return bits.join('');
  }

  function renderWorkoutView() {
    const pick = $('session-pick');
    const active = $('session-active');
    if (state.draft) {
      pick.classList.add('hidden');
      active.classList.remove('hidden');
      $('workout-title').textContent = state.draft.name || state.draft.type;
      $('active-type').textContent = state.draft.type;
      $('active-time').textContent = 'In progress';
      $('session-notes').value = state.draft.notes || '';
      renderExercises();
    } else {
      pick.classList.remove('hidden');
      active.classList.add('hidden');
      $('workout-title').textContent = 'New session';
      if (!renderWorkoutView._type) renderWorkoutView._type = 'Push';
      $('session-types').innerHTML = SESSION_TYPES.map((t) =>
        `<button type="button" class="chip ${renderWorkoutView._type === t ? 'selected' : ''}" data-type="${t}">${t}</button>`
      ).join('');
      $('session-name').value = '';
    }
    const dl = $('ex-library');
    dl.innerHTML = EXERCISE_LIBRARY.map((e) => `<option value="${escapeHtml(e.name)}"></option>`).join('');
  }

  function renderExercises() {
    const list = $('exercise-list');
    if (!state.draft.exercises.length) {
      list.innerHTML = '<p class="muted small">Add exercises from the library or type a custom name.</p>';
      return;
    }
    list.innerHTML = state.draft.exercises.map((ex, ei) => {
      const map = lookupExercise(ex.name);
      const compound = isCompound(ex.name, map.tags);
      return `<div class="ex-card" data-ei="${ei}">
        <div class="ex-head">
          <div>
            <strong>${escapeHtml(ex.name)}</strong>
            <div class="ex-tags">
              ${compound ? '<span class="tag compound">compound</span>' : ''}
              ${partTagsHtml(map)}
            </div>
          </div>
          <button type="button" class="btn ghost small btn-remove-ex" data-ei="${ei}">✕</button>
        </div>
        <table class="sets-table">
          <thead><tr><th>#</th><th>kg</th><th>reps</th><th>RPE</th><th>✓</th></tr></thead>
          <tbody>
            ${ex.sets.map((s, si) => `<tr>
              <td class="set-num">${si + 1}</td>
              <td><input type="number" inputmode="decimal" min="0" step="0.5" data-ei="${ei}" data-si="${si}" data-f="weight" value="${s.weight ?? ''}" placeholder="0" /></td>
              <td><input type="number" inputmode="numeric" min="0" step="1" data-ei="${ei}" data-si="${si}" data-f="reps" value="${s.reps ?? ''}" placeholder="0" /></td>
              <td><input type="number" inputmode="decimal" min="0" max="10" step="0.5" data-ei="${ei}" data-si="${si}" data-f="rpe" value="${s.rpe ?? ''}" placeholder="—" /></td>
              <td class="set-done"><button type="button" class="set-check ${s.done ? 'on' : ''}" data-ei="${ei}" data-si="${si}">${s.done ? '✓' : ''}</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="ex-actions">
          <button type="button" class="btn ghost small btn-add-set" data-ei="${ei}">+ Set</button>
          <input type="text" class="ex-notes" data-ei="${ei}" placeholder="Form notes…" value="${escapeHtml(ex.notes || '')}" style="flex:1;min-width:120px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:6px 8px;font-size:0.85rem;" />
        </div>
      </div>`;
    }).join('');
  }

  function renderHistory() {
    const real = state.workouts.filter((w) => !w.isFreeze);
    const hl = $('history-list');
    if (!real.length) {
      hl.innerHTML = '<span class="muted">No workouts yet.</span>';
    } else {
      hl.innerHTML = real.map((w) => {
        const when = new Date(w.completedAt);
        const detail = (w.exercises || []).map((e) => {
          const done = e.sets.filter((s) => s.done);
          return `${e.name}: ${done.map((s) => `${s.weight || 0}×${s.reps || 0}`).join(', ') || '—'}`;
        }).join('\n');
        return `<div class="hist-item" data-id="${w.id}">
          <div class="left">
            <strong>${escapeHtml(w.name)}</strong>
            <div class="muted small">${when.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${w.type}</div>
            <div class="hist-detail hidden" data-detail="${w.id}">${escapeHtml(detail)}${w.notes ? '\n\n' + escapeHtml(w.notes) : ''}</div>
          </div>
          <div class="muted small">+${w.xpAwarded || 0} XP</div>
        </div>`;
      }).join('');
    }

    const prs = Object.entries(state.prs).sort((a, b) => b[1].e1rm - a[1].e1rm);
    const pl = $('pr-list');
    if (!prs.length) {
      pl.innerHTML = '<span class="muted">PRs appear when you set a best set.</span>';
    } else {
      pl.innerHTML = prs.map(([name, p]) => `
        <div class="pr-item">
          <div><strong>${escapeHtml(name)}</strong>
            <div class="muted small">est. 1RM ${p.e1rm} · ${new Date(p.date).toLocaleDateString()}</div>
          </div>
          <div><strong>${p.weight} × ${p.reps}</strong></div>
        </div>`).join('');
    }
  }

  function renderAll() {
    renderHome();
    renderHistory();
  }

  function bind() {
    document.querySelectorAll('.tab').forEach((t) => {
      t.addEventListener('click', () => showView(t.dataset.view));
    });
    $('btn-log').addEventListener('click', () => showView('workout'));
    $('btn-settings').addEventListener('click', () => showView('settings'));
    $('btn-settings-back').addEventListener('click', () => showView('home'));
    $('btn-workout-back').addEventListener('click', () => showView('home'));

    $('session-types').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      renderWorkoutView._type = chip.dataset.type;
      renderWorkoutView();
    });

    $('btn-start-session').addEventListener('click', () => {
      const type = renderWorkoutView._type || 'Push';
      const custom = $('session-name').value.trim();
      state.draft = {
        type,
        name: custom || type,
        notes: '',
        startedAt: new Date().toISOString(),
        exercises: []
      };
      save();
      renderWorkoutView();
    });

    $('btn-add-ex').addEventListener('click', () => {
      if (!state.draft) return;
      const name = $('ex-search').value.trim();
      if (!name) return;
      state.draft.exercises.push({
        name,
        notes: '',
        rpe: '',
        sets: [
          { weight: '', reps: '', rpe: '', done: false },
          { weight: '', reps: '', rpe: '', done: false },
          { weight: '', reps: '', rpe: '', done: false }
        ]
      });
      $('ex-search').value = '';
      save();
      renderExercises();
    });

    $('ex-search').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); $('btn-add-ex').click(); }
    });

    $('exercise-list').addEventListener('click', (e) => {
      const rem = e.target.closest('.btn-remove-ex');
      if (rem) {
        state.draft.exercises.splice(Number(rem.dataset.ei), 1);
        save();
        renderExercises();
        return;
      }
      const add = e.target.closest('.btn-add-set');
      if (add) {
        state.draft.exercises[Number(add.dataset.ei)].sets.push({ weight: '', reps: '', rpe: '', done: false });
        save();
        renderExercises();
        return;
      }
      const chk = e.target.closest('.set-check');
      if (chk) {
        const ei = Number(chk.dataset.ei);
        const si = Number(chk.dataset.si);
        const set = state.draft.exercises[ei].sets[si];
        set.done = !set.done;
        save();
        renderExercises();
      }
    });

    $('exercise-list').addEventListener('input', (e) => {
      const t = e.target;
      if (t.matches('input[data-f]')) {
        const ei = Number(t.dataset.ei);
        const si = Number(t.dataset.si);
        state.draft.exercises[ei].sets[si][t.dataset.f] = t.value === '' ? '' : Number(t.value);
        save();
      }
      if (t.matches('.ex-notes')) {
        state.draft.exercises[Number(t.dataset.ei)].notes = t.value;
        clearTimeout(bind._noteT);
        bind._noteT = setTimeout(save, 300);
      }
    });

    $('session-notes').addEventListener('input', () => {
      if (!state.draft) return;
      state.draft.notes = $('session-notes').value;
      clearTimeout(bind._snT);
      bind._snT = setTimeout(save, 300);
    });

    $('btn-complete-session').addEventListener('click', completeSession);
    $('btn-cancel-session').addEventListener('click', async () => {
      const ok = await confirmDialog('Discard session?', 'Unsaved sets will be lost.');
      if (!ok) return;
      state.draft = null;
      save();
      showView('home');
    });

    $('btn-freeze').addEventListener('click', applyFreeze);

    $('history-list').addEventListener('click', (e) => {
      const item = e.target.closest('.hist-item');
      if (!item) return;
      const det = item.querySelector('.hist-detail');
      if (det) det.classList.toggle('hidden');
    });

    $('btn-save-name').addEventListener('click', () => {
      const n = $('setting-name').value.trim() || 'Long';
      state.displayName = n.slice(0, 24);
      save();
      toast('Name saved');
      renderHome();
    });

    $('btn-reset').addEventListener('click', async () => {
      const ok = await confirmDialog('Reset all data?', 'This wipes workouts, XP, stats, PRs, and streak. Cannot undo.');
      if (!ok) return;
      state = defaultState();
      save();
      toast('Data reset');
      showView('home');
      renderAll();
    });
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  ensureDailyXpReset();
  claimQuestsIfNeeded();
  save();
  bind();
  renderAll();
  showView('home');
  registerSW();
})();
