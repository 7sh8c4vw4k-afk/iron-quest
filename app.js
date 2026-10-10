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

  const MEASURE_PARTS = [
    { id: 'neck', label: 'Neck' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'chest', label: 'Chest' },
    { id: 'leftBicep', label: 'Left Bicep' },
    { id: 'rightBicep', label: 'Right Bicep' },
    { id: 'leftForearm', label: 'Left Forearm' },
    { id: 'rightForearm', label: 'Right Forearm' },
    { id: 'upperAbs', label: 'Upper Abs' },
    { id: 'waist', label: 'Waist' },
    { id: 'lowerAbs', label: 'Lower Abs' },
    { id: 'hips', label: 'Hips' },
    { id: 'leftThigh', label: 'Left Thigh' },
    { id: 'rightThigh', label: 'Right Thigh' },
    { id: 'leftCalf', label: 'Left Calf' },
    { id: 'rightCalf', label: 'Right Calf' }
  ];

  const CATEGORIES = [
    { id: '', label: 'Any Category' },
    { id: 'push', label: 'Push' },
    { id: 'pull', label: 'Pull' },
    { id: 'legs', label: 'Legs' },
    { id: 'core', label: 'Core' },
    { id: 'activity', label: 'Activity' }
  ];

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


  const DEFAULT_TEMPLATES = [
    {
      id: 'tmpl-back',
      name: 'Back Day',
      exercises: ['Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Face Pull', 'Bicep Curl']
    },
    {
      id: 'tmpl-chest',
      name: 'Chest Day',
      exercises: ['Bench Press', 'Incline Bench Press', 'Chest Fly', 'Dip', 'Tricep Pushdown']
    },
    {
      id: 'tmpl-leg',
      name: 'Leg Day',
      exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Calf Raise']
    },
    {
      id: 'tmpl-shoulder',
      name: 'Shoulder Day',
      exercises: ['Overhead Press', 'Lateral Raise', 'Rear Delt Row', 'Face Pull', 'Shrug']
    },
    {
      id: 'tmpl-grip',
      name: 'Grip Test',
      exercises: ['Dead Hang', 'Farmer Carry', 'Finger Hold', 'Towel Homers', 'Reverse Barbell Curl']
    }
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

  function defaultStats() {
    const stats = {};
    for (const id of STAT_NAMES) stats[id] = 1;
    return stats;
  }

  function defaultMeasurements() {
    const m = {};
    for (const p of MEASURE_PARTS) m[p.id] = [];
    return m;
  }

  function defaultWidgets() {
    return { workoutsPerWeek: true, bodyWeight: true, caloricIntake: false };
  }

  function defaultState() {
    return {
      version: 3,
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
      questsClaimed: { daily: null, weekly: null },
      widgets: defaultWidgets(),
      bodyWeightLog: [],
      measurements: defaultMeasurements(),
      templates: DEFAULT_TEMPLATES.map((t) => ({ ...t, exercises: t.exercises.slice() })),
      customExercises: [],
      statsExpanded: false
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

  function normalizeMeasurements(raw) {
    const out = defaultMeasurements();
    if (!raw || typeof raw !== 'object') return out;
    for (const p of MEASURE_PARTS) {
      if (Array.isArray(raw[p.id])) out[p.id] = raw[p.id];
    }
    return out;
  }

  function normalizeTemplates(raw) {
    if (!Array.isArray(raw) || !raw.length) {
      return DEFAULT_TEMPLATES.map((t) => ({ ...t, exercises: t.exercises.slice() }));
    }
    return raw.map((t) => ({
      id: t.id || ('tmpl-' + Date.now() + Math.random().toString(36).slice(2, 6)),
      name: t.name || 'Template',
      exercises: Array.isArray(t.exercises) ? t.exercises.slice() : []
    }));
  }

  let state = load();
  let ui = {
    libSearch: '',
    filterBody: '',
    filterCat: '',
    measureTarget: null,
    templatePick: new Set(),
    previousView: 'profile',
    addExSearch: '',
    addExToDraftAfterCreate: false,
    sessionOpen: false,
    editingTemplateId: null,
    menuTemplateId: null
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        version: 3,
        stats: normalizeStats(parsed.stats),
        questsClaimed: { ...base.questsClaimed, ...(parsed.questsClaimed || {}) },
        prs: parsed.prs && typeof parsed.prs === 'object' ? parsed.prs : {},
        workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
        widgets: { ...defaultWidgets(), ...(parsed.widgets || {}) },
        bodyWeightLog: Array.isArray(parsed.bodyWeightLog) ? parsed.bodyWeightLog : [],
        measurements: normalizeMeasurements(parsed.measurements),
        templates: normalizeTemplates(parsed.templates),
        customExercises: Array.isArray(parsed.customExercises) ? parsed.customExercises : [],
        statsExpanded: !!parsed.statsExpanded
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

  function allExercises() {
    return EXERCISE_LIBRARY.concat(state.customExercises || []);
  }

  function lookupExercise(name) {
    const lib = allExercises().find((e) => e.name.toLowerCase() === String(name || '').toLowerCase());
    if (lib) {
      return {
        primary: (lib.primary || []).slice(),
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
    if (!weeks.has(cur)) cur = prevIsoWeek(cur);
    while (weeks.has(cur)) {
      streak += 1;
      cur = prevIsoWeek(cur);
      if (streak > 520) break;
    }
    return streak;
  }

  function canUseFreeze() {
    return state.streakFreezeMonth !== monthKey(new Date());
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
    renderSettings();
    renderProfile();
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
        } else if (r > 0 && w === 0) {
          const prev = state.prs[ex.name];
          if (!prev || (prev.weight === 0 && r > (prev.reps || 0))) {
            state.prs[ex.name] = {
              weight: 0,
              reps: r,
              e1rm: r,
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

  function makeEmptySets() {
    return [
      { weight: '', reps: '', rpe: '', done: false },
      { weight: '', reps: '', rpe: '', done: false },
      { weight: '', reps: '', rpe: '', done: false }
    ];
  }

  function startWorkout(opts) {
    const type = opts.type || 'Custom';
    const name = opts.name || type;
    const exerciseNames = opts.exercises || [];
    state.draft = {
      type,
      name,
      notes: '',
      startedAt: new Date().toISOString(),
      exercises: exerciseNames.map((n) => ({
        name: n,
        notes: '',
        rpe: '',
        sets: makeEmptySets()
      }))
    };
    ui.sessionOpen = true;
    save();
    showView('start');
    renderStartView();
    scrollToActiveSession();
  }

  function openActiveSession() {
    if (!state.draft) return;
    ui.sessionOpen = true;
    showView('start');
    renderStartView();
    scrollToActiveSession();
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
    ui.sessionOpen = false;
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
    showView('profile');
    renderAll();
  }

  function lastPerformance(exName) {
    const pr = state.prs[exName];
    if (pr) {
      if (pr.weight > 0) return { text: `${pr.weight}×${pr.reps}`, sub: 'best' };
      return { text: `${pr.reps} reps`, sub: 'best' };
    }
    for (const w of state.workouts) {
      if (w.isFreeze) continue;
      for (const ex of (w.exercises || [])) {
        if (ex.name.toLowerCase() !== exName.toLowerCase()) continue;
        const done = (ex.sets || []).filter((s) => s.done);
        if (!done.length) continue;
        const last = done[done.length - 1];
        const wt = Number(last.weight) || 0;
        const rp = Number(last.reps) || 0;
        if (wt > 0) return { text: `${wt}×${rp}`, sub: 'last' };
        if (rp > 0) return { text: `${rp} reps`, sub: 'last' };
      }
    }
    return null;
  }

  function categoryOf(ex) {
    const tags = ex.tags || [];
    if (tags.includes('activity') || (ex.primary || []).some((p) => ACTIVITY_STATS.has(p))) return 'activity';
    if (tags.includes('push')) return 'push';
    if (tags.includes('pull')) return 'pull';
    if (tags.includes('legs')) return 'legs';
    if (tags.includes('core') || (ex.primary || []).includes('core')) return 'core';
    return '';
  }

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 2800);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function openModal(id) {
    const el = $(id);
    if (!el) return;
    el.hidden = false;
    el.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeModal(id) {
    const el = $(id);
    if (!el) return;
    el.classList.remove('open');
    el.hidden = true;
    if (!document.querySelector('.modal.open')) {
      document.body.classList.remove('modal-open');
    }
  }

  function safeShowDialog(dlg) {
    if (!dlg) return;
    try {
      if (typeof dlg.showModal === 'function') {
        dlg.showModal();
        return;
      }
    } catch (_) { /* iOS PWA / unsupported */ }
    dlg.setAttribute('open', '');
    dlg.classList.add('fallback-open');
  }

  function safeCloseDialog(dlg) {
    if (!dlg) return;
    try {
      if (typeof dlg.close === 'function') {
        dlg.close();
        return;
      }
    } catch (_) {}
    dlg.removeAttribute('open');
    dlg.classList.remove('fallback-open');
  }

  function safeOn(id, event, handler) {
    const el = typeof id === 'string' ? $(id) : id;
    if (!el) {
      console.warn('[Iron Quest] missing element for listener:', id);
      return;
    }
    el.addEventListener(event, handler);
  }

  function bindSafe(label, fn) {
    try {
      fn();
    } catch (err) {
      console.error('[Iron Quest] bind failed:', label, err);
    }
  }

  function scrollToActiveSession() {
    requestAnimationFrame(() => {
      const session = $('session-active');
      const btn = $('btn-add-ex');
      const target = (session && !session.classList.contains('hidden') && (btn || session)) || null;
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function showView(name) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    const map = {
      profile: 'view-profile',
      history: 'view-history',
      start: 'view-start',
      exercises: 'view-exercises',
      measure: 'view-measure',
      settings: 'view-settings'
    };
    const el = $(map[name]);
    if (!el) return;
    el.classList.add('active');
    document.querySelectorAll('.tab').forEach((t) => {
      const tabView = t.dataset.view;
      t.classList.toggle('active', tabView === name || (name === 'settings' && tabView === 'profile'));
    });
    if (name !== 'settings') ui.previousView = name;
    if (name === 'profile') renderProfile();
    if (name === 'history') renderHistory();
    if (name === 'start') {
      renderStartView();
      if (state.draft && ui.sessionOpen) scrollToActiveSession();
    }
    if (name === 'exercises') renderExercisesLib();
    if (name === 'measure') renderMeasure();
    if (name === 'settings') renderSettings();
  }

  function confirmDialog(title, msg) {
    return new Promise((resolve) => {
      const dlg = $('confirm-dialog');
      $('confirm-title').textContent = title;
      $('confirm-msg').textContent = msg;
      safeShowDialog(dlg);
      dlg.addEventListener('close', function onClose() {
        dlg.removeEventListener('close', onClose);
        resolve(dlg.returnValue === 'ok');
      });
    });
  }

  function renderProfile() {
    ensureDailyXpReset();
    $('profile-name').textContent = state.displayName;
    $('profile-rank').textContent = `Level ${state.level} · ${rankForLevel(state.level)}`;
    $('level-badge').textContent = state.level;
    const need = xpForLevel(state.level);
    $('xp-current').textContent = state.xp;
    $('xp-next').textContent = need;
    $('xp-fill').style.width = `${Math.min(100, (state.xp / need) * 100)}%`;
    $('xp-today').textContent = state.xpToday;
    $('xp-cap').textContent = DAILY_XP_CAP;
    $('streak-weeks').textContent = computeStreak();
    const startCta = $('btn-profile-start');
    if (startCta) {
      startCta.textContent = state.draft ? 'Resume Workout' : 'Start Workout';
    }

    const grid = $('stats-grid');
    grid.classList.toggle('compact', !state.statsExpanded);
    grid.classList.toggle('expanded', state.statsExpanded);
    $('btn-toggle-stats').textContent = state.statsExpanded ? 'Collapse' : 'Expand';
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

    renderWidgets();
  }

  function workoutsPerWeekData() {
    const now = new Date();
    const bars = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const key = isoWeekKey(d);
      const count = workoutsInIsoWeek(key);
      const label = 'W' + key.split('-W')[1];
      bars.push({ label: i === 0 ? 'Now' : label, count });
    }
    return bars;
  }

  function renderWidgets() {
    const area = $('widgets-area');
    const w = state.widgets || defaultWidgets();
    let html = '';

    if (w.workoutsPerWeek) {
      const bars = workoutsPerWeekData();
      const max = Math.max(1, ...bars.map((b) => b.count));
      html += `<div class="widget"><h3>Workouts / week</h3><div class="bar-chart">`;
      for (const b of bars) {
        const h = Math.max(2, Math.round((b.count / max) * 70));
        html += `<div class="bar-col"><div class="bar-fill" style="height:${b.count ? h : 2}px"></div><div class="bar-label">${b.label}</div></div>`;
      }
      html += `</div></div>`;
    }

    if (w.bodyWeight) {
      const log = (state.bodyWeightLog || []).slice(-12);
      html += `<div class="widget"><h3>Body weight</h3>`;
      if (log.length < 2) {
        html += `<div class="placeholder-widget">${log.length === 1 ? `Latest: ${log[0].weight} kg` : 'No recent data'} — log on Measure</div>`;
      } else {
        const vals = log.map((e) => e.weight);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const span = Math.max(0.5, max - min);
        const pts = log.map((e, i) => {
          const x = (i / (log.length - 1)) * 280 + 10;
          const y = 70 - ((e.weight - min) / span) * 55;
          return `${x},${y}`;
        }).join(' ');
        const circles = log.map((e, i) => {
          const x = (i / (log.length - 1)) * 280 + 10;
          const y = 70 - ((e.weight - min) / span) * 55;
          return `<circle cx="${x}" cy="${y}" r="3"/>`;
        }).join('');
        html += `<svg class="line-chart" viewBox="0 0 300 80" preserveAspectRatio="none"><polyline points="${pts}"/>${circles}</svg>`;
        html += `<div class="muted small" style="margin-top:6px">${log[log.length - 1].weight} kg · ${log[log.length - 1].date}</div>`;
      }
      html += `</div>`;
    }

    if (w.caloricIntake) {
      html += `<div class="widget"><h3>Caloric intake</h3><div class="placeholder-widget">No recent data</div></div>`;
    }

    area.innerHTML = html;
  }

  function renderHistory() {
    const real = state.workouts.filter((w) => !w.isFreeze);
    const hl = $('history-list');
    if (!real.length) {
      hl.innerHTML = '<span class="muted">No workouts yet.</span>';
    } else {
      hl.innerHTML = real.map((w) => {
        const when = new Date(w.completedAt);
        const exNames = (w.exercises || []).map((e) => e.name).slice(0, 4).join(', ');
        const more = (w.exercises || []).length > 4 ? '…' : '';
        const detail = (w.exercises || []).map((e) => {
          const done = e.sets.filter((s) => s.done);
          return `${e.name}: ${done.map((s) => `${s.weight || 0}×${s.reps || 0}`).join(', ') || '—'}`;
        }).join('\n');
        return `<div class="hist-item" data-id="${w.id}">
          <div class="left">
            <strong>${escapeHtml(w.name)}</strong>
            <div class="muted small">${when.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${escapeHtml(w.type)}</div>
            <div class="muted small">${escapeHtml(exNames)}${more}</div>
            <div class="hist-detail hidden" data-detail="${w.id}">${escapeHtml(detail)}${w.notes ? '\n\n' + escapeHtml(w.notes) : ''}</div>
          </div>
          <div class="muted small">+${w.xpAwarded || 0} XP</div>
        </div>`;
      }).join('');
    }

    const prs = Object.entries(state.prs).sort((a, b) => (b[1].e1rm || 0) - (a[1].e1rm || 0));
    const pl = $('pr-list');
    if (!prs.length) {
      pl.innerHTML = '<span class="muted">PRs appear when you set a best set.</span>';
    } else {
      pl.innerHTML = prs.map(([name, p]) => `
        <div class="pr-item">
          <div><strong>${escapeHtml(name)}</strong>
            <div class="muted small">${p.weight > 0 ? 'est. 1RM ' + p.e1rm : 'reps'} · ${new Date(p.date).toLocaleDateString()}</div>
          </div>
          <div><strong>${p.weight > 0 ? p.weight + ' × ' + p.reps : p.reps + ' reps'}</strong></div>
        </div>`).join('');
    }
  }

  function renderStartView() {
    const hub = $('start-hub');
    const active = $('session-active');
    const header = $('start-header');
    const showSession = !!(state.draft && ui.sessionOpen);
    if (showSession) {
      hub.classList.add('hidden');
      active.classList.remove('hidden');
      if (header) header.classList.add('hidden');
      $('workout-title').textContent = state.draft.name || state.draft.type;
      $('active-type').textContent = state.draft.type;
      $('active-time').textContent = 'In progress';
      $('session-notes').value = state.draft.notes || '';
      renderActiveExercises();
    } else {
      hub.classList.remove('hidden');
      active.classList.add('hidden');
      if (header) header.classList.remove('hidden');
      const banner = $('resume-banner');
      if (banner) {
        if (state.draft) {
          banner.classList.remove('hidden');
          const nameEl = $('resume-banner-name');
          if (nameEl) nameEl.textContent = (state.draft.name || state.draft.type || 'Workout') + ' · Tap to resume';
        } else {
          banner.classList.add('hidden');
        }
      }
      renderTemplates();
    }
  }

  function renderTemplates() {
    const grid = $('templates-grid');
    if (!grid) return;
    const list = state.templates || [];
    if (!list.length) {
      grid.innerHTML = '<p class="muted routines-list-empty">No custom routines yet. Tap + Routine.</p>';
      return;
    }
    grid.innerHTML = list.map((t) => {
      const count = (t.exercises || []).length;
      return `<div class="routine-row" role="listitem" data-id="${escapeHtml(t.id)}">
        <button type="button" class="routine-row-main btn-start-tmpl" data-id="${escapeHtml(t.id)}">
          <strong>${escapeHtml(t.name)}</strong>
          <span class="muted">${count} exercise${count === 1 ? '' : 's'}</span>
        </button>
        <button type="button" class="routine-menu-btn btn-routine-menu" data-id="${escapeHtml(t.id)}" aria-label="Routine options">⋯</button>
      </div>`;
    }).join('');
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

  function renderActiveExercises() {
    const list = $('exercise-list');
    if (!state.draft.exercises.length) {
      list.innerHTML = '<p class="muted small">Tap + Add Exercise to pick from the library.</p>';
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

  function renderExercisesLib() {
    const bodyFilters = [{ id: '', label: 'Any Body Part' }].concat(STAT_DEFS.map((s) => ({ id: s.id, label: s.label })));
    $('filter-body').innerHTML = bodyFilters.map((f) =>
      `<button type="button" class="chip ${ui.filterBody === f.id ? 'selected' : ''}" data-body="${f.id}">${f.label}</button>`
    ).join('');
    $('filter-cat').innerHTML = CATEGORIES.map((f) =>
      `<button type="button" class="chip ${ui.filterCat === f.id ? 'selected' : ''}" data-cat="${f.id}">${f.label}</button>`
    ).join('');

    const q = ui.libSearch.trim().toLowerCase();
    let list = allExercises().slice().sort((a, b) => a.name.localeCompare(b.name));
    if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));
    if (ui.filterBody) {
      list = list.filter((e) => (e.primary || []).includes(ui.filterBody) || (e.secondary || []).includes(ui.filterBody));
    }
    if (ui.filterCat) {
      list = list.filter((e) => categoryOf(e) === ui.filterCat || (e.tags || []).includes(ui.filterCat));
    }

    const container = $('exercise-lib-list');
    if (!list.length) {
      container.innerHTML = '<p class="muted">No exercises match.</p>';
      return;
    }
    let html = '';
    let letter = '';
    for (const ex of list) {
      const L = ex.name[0].toUpperCase();
      if (L !== letter) {
        letter = L;
        html += `<div class="ex-letter">${letter}</div>`;
      }
      const primary = (ex.primary || []).map((p) => STAT_LABELS[p] || p).join(', ') || '—';
      const last = lastPerformance(ex.name);
      html += `<div class="ex-lib-row">
        <div>
          <div class="name">${escapeHtml(ex.name)}</div>
          <div class="part">${escapeHtml(primary)}</div>
        </div>
        <div class="last">${last ? escapeHtml(last.text) + `<span class="muted">${last.sub}</span>` : '<span class="muted">—</span>'}</div>
      </div>`;
    }
    container.innerHTML = html;
  }

  function renderMeasure() {
    const list = $('measure-list');
    list.innerHTML = MEASURE_PARTS.map((p) => {
      const hist = (state.measurements[p.id] || []);
      const latest = hist.length ? hist[hist.length - 1] : null;
      const val = latest ? `${latest.value} cm` : '—';
      return `<div class="measure-row" data-id="${p.id}">
        <div class="label">${escapeHtml(p.label)}</div>
        <div style="display:flex;align-items:center">
          <span class="value">${val}</span>
          <button type="button" class="btn-plus" data-id="${p.id}" aria-label="Add ${escapeHtml(p.label)}">+</button>
        </div>
      </div>`;
    }).join('');

    const wh = $('weight-history');
    const log = state.bodyWeightLog || [];
    if (!log.length) wh.textContent = 'No weight logged yet.';
    else {
      const recent = log.slice(-5).reverse();
      wh.innerHTML = recent.map((e) => `${e.date}: <strong>${e.weight} kg</strong>`).join(' · ');
    }
  }

  function renderSettings() {
    $('setting-name').value = state.displayName;
    const streak = computeStreak();
    $('settings-streak').textContent = streak;
    const weeks = weeksWithWorkouts();
    const thisWeek = isoWeekKey(new Date());
    const trained = weeks.has(thisWeek);
    $('streak-detail').textContent = trained
      ? `Trained this week · ${workoutsInIsoWeek(thisWeek)} session(s)`
      : 'Train this week to keep the streak';
    const freezeBtn = $('btn-freeze');
    freezeBtn.hidden = !canUseFreeze();

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
  }

  function renderAll() {
    renderProfile();
    renderHistory();
  }


  function addExerciseToDraft(name) {
    if (!state.draft) return;
    const n = String(name || '').trim();
    if (!n) return;
    state.draft.exercises.push({ name: n, notes: '', rpe: '', sets: makeEmptySets() });
    save();
    renderActiveExercises();
    toast('Added ' + n);
  }

  function filteredAddExList(query) {
    const q = String(query || '').trim().toLowerCase();
    let list = allExercises().slice().sort((a, b) => a.name.localeCompare(b.name));
    if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));
    return list;
  }

  function renderAddExPicker() {
    const listEl = $('add-ex-list');
    if (!listEl) return;
    const list = filteredAddExList(ui.addExSearch);
    const customBtn = $('add-ex-custom');
    const q = ui.addExSearch.trim();
    if (customBtn) {
      customBtn.textContent = q ? `Create “${q}”…` : 'Create custom…';
    }
    if (!list.length) {
      listEl.innerHTML = `<p class="add-ex-empty">No matches.${q ? ' Use Create below to add it.' : ''}</p>`;
      return;
    }
    listEl.innerHTML = list.map((ex) => {
      const primary = (ex.primary || []).map((p) => STAT_LABELS[p] || p).join(', ') || '—';
      return `<button type="button" class="add-ex-pick-row" role="option" data-name="${escapeHtml(ex.name)}">
        <div>
          <div class="name">${escapeHtml(ex.name)}</div>
          <div class="part">${escapeHtml(primary)}</div>
        </div>
        <span class="chev" aria-hidden="true">+</span>
      </button>`;
    }).join('');
  }

  function openAddExercisePicker() {
    if (!state.draft) {
      toast('Start a workout first');
      return;
    }
    ui.addExSearch = '';
    const input = $('add-ex-search');
    if (input) input.value = '';
    renderAddExPicker();
    openModal('add-ex-modal');
    setTimeout(() => { if (input) input.focus(); }, 80);
  }

  function openTemplateDialog(editId) {
    ui.editingTemplateId = editId || null;
    ui.templatePick = new Set();
    const existing = editId ? (state.templates || []).find((t) => t.id === editId) : null;
    if (existing) {
      (existing.exercises || []).forEach((n) => ui.templatePick.add(n));
      $('template-name').value = existing.name || '';
      const title = $('template-dlg-title');
      if (title) title.textContent = 'Edit routine';
    } else {
      $('template-name').value = '';
      const title = $('template-dlg-title');
      if (title) title.textContent = 'New routine';
    }
    const pick = $('template-ex-pick');
    pick.innerHTML = allExercises().slice().sort((a, b) => a.name.localeCompare(b.name)).map((e) =>
      `<button type="button" class="chip ${ui.templatePick.has(e.name) ? 'selected' : ''}" data-name="${escapeHtml(e.name)}">${escapeHtml(e.name)}</button>`
    ).join('');
    safeShowDialog($('template-dialog'));
  }

  function openRoutineMenu(id) {
    const t = (state.templates || []).find((x) => x.id === id);
    if (!t) return;
    ui.menuTemplateId = id;
    const title = $('routine-menu-title');
    if (title) title.textContent = t.name;
    openModal('routine-menu-modal');
  }

  function closeRoutineMenu() {
    closeModal('routine-menu-modal');
    ui.menuTemplateId = null;
  }

  function duplicateRoutine(id) {
    const t = (state.templates || []).find((x) => x.id === id);
    if (!t) return;
    state.templates.push({
      id: 'tmpl-' + Date.now(),
      name: (t.name || 'Routine') + ' (copy)',
      exercises: (t.exercises || []).slice()
    });
    save();
    renderTemplates();
    toast('Routine duplicated');
  }

  function openNewExerciseDialog() {
    const prim = $('new-ex-primary');
    const sec = $('new-ex-secondary');
    if (!prim || !sec) return;
    prim.innerHTML = STAT_DEFS.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');
    sec.innerHTML = '<option value="">— None —</option>' + STAT_DEFS.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');
    const nameEl = $('new-ex-name');
    if (nameEl) nameEl.value = '';
    openModal('new-ex-modal');
  }

  function bind() {
    bindSafe('tabs', () => {
      document.querySelectorAll('.tab').forEach((t) => {
        t.addEventListener('click', () => {
          const view = t.getAttribute('data-view') || t.dataset.view;
          showView(view);
          if (view === 'start' && state.draft) {
            scrollToActiveSession();
          }
        });
      });
    });

    bindSafe('settings', () => {
      safeOn('btn-settings', 'click', () => showView('settings'));
      safeOn('btn-settings-back', 'click', () => showView(ui.previousView || 'profile'));
    });

    bindSafe('toggle-stats', () => {
      safeOn('btn-toggle-stats', 'click', () => {
        state.statsExpanded = !state.statsExpanded;
        save();
        renderProfile();
      });
    });

    bindSafe('profile-start', () => {
      safeOn('btn-profile-start', 'click', () => {
        if (state.draft) {
          openActiveSession();
          toast('Resuming workout');
          return;
        }
        showView('start');
        renderStartView();
      });
    });

    bindSafe('widgets', () => {
      safeOn('btn-add-widget', 'click', () => {
        const w = state.widgets || defaultWidgets();
        const wpw = $('wig-wpw');
        const bw = $('wig-bw');
        const cal = $('wig-cal');
        if (wpw) wpw.checked = !!w.workoutsPerWeek;
        if (bw) bw.checked = !!w.bodyWeight;
        if (cal) cal.checked = !!w.caloricIntake;
        safeShowDialog($('widget-dialog'));
      });
      safeOn('widget-dialog', 'close', () => {
        if ($('widget-dialog').returnValue !== 'ok') return;
        state.widgets = {
          workoutsPerWeek: $('wig-wpw').checked,
          bodyWeight: $('wig-bw').checked,
          caloricIntake: $('wig-cal').checked
        };
        save();
        renderWidgets();
        toast('Widgets updated');
      });
    });

    bindSafe('empty-workout', () => {
      safeOn('btn-empty-workout', 'click', () => {
        if (state.draft) {
          toast('Finish or discard the current workout first');
          return;
        }
        startWorkout({ type: 'Custom', name: 'Free Form Workout', exercises: [] });
      });
      const resume = () => {
        if (!state.draft) return;
        openActiveSession();
        toast('Resuming workout');
      };
      safeOn('btn-resume-workout', 'click', (e) => {
        e.stopPropagation();
        resume();
      });
      safeOn('resume-banner', 'click', resume);
      safeOn('resume-banner', 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          resume();
        }
      });
    });

    bindSafe('templates', () => {
      safeOn('btn-new-template', 'click', () => openTemplateDialog(null));
      safeOn('template-cancel', 'click', () => {
        ui.editingTemplateId = null;
        safeCloseDialog($('template-dialog'));
      });
      safeOn('template-ex-pick', 'click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        const name = chip.getAttribute('data-name') || chip.dataset.name;
        if (ui.templatePick.has(name)) {
          ui.templatePick.delete(name);
          chip.classList.remove('selected');
        } else {
          ui.templatePick.add(name);
          chip.classList.add('selected');
        }
      });
      safeOn('template-save', 'click', () => {
        const name = ($('template-name') && $('template-name').value.trim()) || '';
        if (!name) { toast('Name required'); return; }
        if (!ui.templatePick.size) { toast('Pick at least one exercise'); return; }
        const exercises = [...ui.templatePick];
        if (ui.editingTemplateId) {
          const t = state.templates.find((x) => x.id === ui.editingTemplateId);
          if (t) {
            t.name = name;
            t.exercises = exercises;
          }
          ui.editingTemplateId = null;
          save();
          safeCloseDialog($('template-dialog'));
          renderTemplates();
          toast('Routine updated');
          return;
        }
        state.templates.push({
          id: 'tmpl-' + Date.now(),
          name,
          exercises
        });
        save();
        safeCloseDialog($('template-dialog'));
        renderTemplates();
        toast('Routine saved');
      });
      safeOn('templates-grid', 'click', async (e) => {
        const menuBtn = e.target.closest('.btn-routine-menu');
        if (menuBtn) {
          e.stopPropagation();
          openRoutineMenu(menuBtn.getAttribute('data-id') || menuBtn.dataset.id);
          return;
        }
        const start = e.target.closest('.btn-start-tmpl');
        if (start) {
          if (state.draft) {
            toast('Finish or discard the current workout first');
            return;
          }
          const t = state.templates.find((x) => x.id === (start.getAttribute('data-id') || start.dataset.id));
          if (!t) return;
          startWorkout({ type: 'Custom', name: t.name, exercises: t.exercises.slice() });
        }
      });
      safeOn('routine-menu-close', 'click', closeRoutineMenu);
      const routineModal = $('routine-menu-modal');
      if (routineModal) {
        routineModal.addEventListener('click', (e) => {
          if (e.target.closest('[data-close-modal="routine-menu-modal"]')) closeRoutineMenu();
        });
      }
      safeOn('routine-menu-edit', 'click', () => {
        const id = ui.menuTemplateId;
        closeRoutineMenu();
        if (id) openTemplateDialog(id);
      });
      safeOn('routine-menu-duplicate', 'click', () => {
        const id = ui.menuTemplateId;
        closeRoutineMenu();
        if (id) duplicateRoutine(id);
      });
      safeOn('routine-menu-delete', 'click', async () => {
        const id = ui.menuTemplateId;
        closeRoutineMenu();
        if (!id) return;
        const ok = await confirmDialog('Delete routine?', 'This cannot be undone.');
        if (!ok) return;
        state.templates = state.templates.filter((x) => x.id !== id);
        save();
        renderTemplates();
        toast('Routine deleted');
      });
    });

    bindSafe('workout-back', () => {
      safeOn('btn-workout-back', 'click', () => {
        ui.sessionOpen = false;
        if (state.draft) toast('Draft saved — resume from Start or Profile');
        showView('profile');
      });
    });

    bindSafe('add-exercise', () => {
      safeOn('btn-add-ex', 'click', openAddExercisePicker);
      safeOn('add-ex-close', 'click', () => closeModal('add-ex-modal'));
      const addModal = $('add-ex-modal');
      if (addModal) {
        addModal.addEventListener('click', (e) => {
          if (e.target.closest('[data-close-modal="add-ex-modal"]')) {
            closeModal('add-ex-modal');
          }
        });
      }
      safeOn('add-ex-search', 'input', () => {
        ui.addExSearch = $('add-ex-search').value;
        renderAddExPicker();
      });
      safeOn('add-ex-search', 'keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const list = filteredAddExList(ui.addExSearch);
        if (list.length === 1) {
          addExerciseToDraft(list[0].name);
          closeModal('add-ex-modal');
        } else if (ui.addExSearch.trim()) {
          const custom = $('add-ex-custom');
          if (custom) custom.click();
        }
      });
      safeOn('add-ex-list', 'click', (e) => {
        const row = e.target.closest('.add-ex-pick-row');
        if (!row) return;
        e.preventDefault();
        const name = row.getAttribute('data-name') || row.dataset.name;
        if (!name) return;
        addExerciseToDraft(name);
        closeModal('add-ex-modal');
      });
      safeOn('add-ex-custom', 'click', () => {
        const q = ui.addExSearch.trim();
        if (q) {
          addExerciseToDraft(q);
          closeModal('add-ex-modal');
          return;
        }
        ui.addExToDraftAfterCreate = !!state.draft;
        closeModal('add-ex-modal');
        openNewExerciseDialog();
      });
    });

    bindSafe('exercise-list', () => {
      safeOn('exercise-list', 'click', (e) => {
        const rem = e.target.closest('.btn-remove-ex');
        if (rem) {
          state.draft.exercises.splice(Number(rem.getAttribute('data-ei') || rem.dataset.ei), 1);
          save();
          renderActiveExercises();
          return;
        }
        const add = e.target.closest('.btn-add-set');
        if (add) {
          state.draft.exercises[Number(add.getAttribute('data-ei') || add.dataset.ei)].sets.push({ weight: '', reps: '', rpe: '', done: false });
          save();
          renderActiveExercises();
          return;
        }
        const chk = e.target.closest('.set-check');
        if (chk) {
          const ei = Number(chk.getAttribute('data-ei') || chk.dataset.ei);
          const si = Number(chk.getAttribute('data-si') || chk.dataset.si);
          const set = state.draft.exercises[ei].sets[si];
          set.done = !set.done;
          save();
          renderActiveExercises();
        }
      });
      safeOn('exercise-list', 'input', (e) => {
        const t = e.target;
        if (t.matches('input[data-f]')) {
          const ei = Number(t.getAttribute('data-ei') || t.dataset.ei);
          const si = Number(t.getAttribute('data-si') || t.dataset.si);
          const f = t.getAttribute('data-f') || t.dataset.f;
          state.draft.exercises[ei].sets[si][f] = t.value === '' ? '' : Number(t.value);
          save();
        }
        if (t.matches('.ex-notes')) {
          const ei = Number(t.getAttribute('data-ei') || t.dataset.ei);
          state.draft.exercises[ei].notes = t.value;
          clearTimeout(bind._noteT);
          bind._noteT = setTimeout(save, 300);
        }
      });
    });

    bindSafe('session-notes', () => {
      safeOn('session-notes', 'input', () => {
        if (!state.draft) return;
        state.draft.notes = $('session-notes').value;
        clearTimeout(bind._snT);
        bind._snT = setTimeout(save, 300);
      });
    });

    bindSafe('complete-cancel', () => {
      safeOn('btn-complete-session', 'click', completeSession);
      safeOn('btn-cancel-session', 'click', async () => {
        const ok = await confirmDialog('Discard session?', 'Unsaved sets will be lost.');
        if (!ok) return;
        state.draft = null;
        ui.sessionOpen = false;
        save();
        renderStartView();
        toast('Session discarded');
      });
    });

    bindSafe('freeze', () => {
      safeOn('btn-freeze', 'click', applyFreeze);
    });

    bindSafe('history', () => {
      safeOn('history-list', 'click', (e) => {
        const item = e.target.closest('.hist-item');
        if (!item) return;
        const det = item.querySelector('.hist-detail');
        if (det) det.classList.toggle('hidden');
      });
    });

    bindSafe('lib-filters', () => {
      safeOn('lib-search', 'input', () => {
        ui.libSearch = $('lib-search').value;
        renderExercisesLib();
      });
      safeOn('filter-body', 'click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        ui.filterBody = chip.getAttribute('data-body') || chip.dataset.body || '';
        renderExercisesLib();
      });
      safeOn('filter-cat', 'click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        ui.filterCat = chip.getAttribute('data-cat') || chip.dataset.cat || '';
        renderExercisesLib();
      });
    });

    bindSafe('new-exercise', () => {
      safeOn('btn-new-exercise', 'click', openNewExerciseDialog);
      safeOn('new-ex-cancel', 'click', () => {
        ui.addExToDraftAfterCreate = false;
        closeModal('new-ex-modal');
      });
      const newModal = $('new-ex-modal');
      if (newModal) {
        newModal.addEventListener('click', (e) => {
          if (e.target.closest('[data-close-modal="new-ex-modal"]')) {
            ui.addExToDraftAfterCreate = false;
            closeModal('new-ex-modal');
          }
        });
      }
      safeOn('new-ex-save', 'click', () => {
        const name = ($('new-ex-name') && $('new-ex-name').value.trim()) || '';
        if (!name) { toast('Name required'); return; }
        if (allExercises().some((e) => e.name.toLowerCase() === name.toLowerCase())) {
          toast('Exercise already exists');
          return;
        }
        const primary = $('new-ex-primary').value;
        const secondary = $('new-ex-secondary').value;
        const tags = [];
        if (ACTIVITY_STATS.has(primary)) tags.push('activity', primary);
        state.customExercises.push({
          name,
          primary: [primary],
          secondary: secondary ? [secondary] : [],
          tags
        });
        save();
        closeModal('new-ex-modal');
        renderExercisesLib();
        if (ui.addExToDraftAfterCreate && state.draft) {
          ui.addExToDraftAfterCreate = false;
          addExerciseToDraft(name);
        } else {
          toast('Exercise added');
        }
      });
    });

    bindSafe('measure', () => {
      safeOn('measure-list', 'click', (e) => {
        const btn = e.target.closest('.btn-plus');
        if (!btn) return;
        ui.measureTarget = btn.getAttribute('data-id') || btn.dataset.id;
        const part = MEASURE_PARTS.find((p) => p.id === ui.measureTarget);
        $('measure-dlg-title').textContent = part ? part.label : 'Log measurement';
        $('measure-value').value = '';
        safeShowDialog($('measure-dialog'));
        setTimeout(() => { const v = $('measure-value'); if (v) v.focus(); }, 50);
      });
      safeOn('measure-dialog', 'close', () => {
        if ($('measure-dialog').returnValue !== 'ok' || !ui.measureTarget) return;
        const val = Number($('measure-value').value);
        if (!val || val <= 0) { toast('Enter a positive value'); return; }
        if (!state.measurements[ui.measureTarget]) state.measurements[ui.measureTarget] = [];
        state.measurements[ui.measureTarget].push({
          date: localDateKey(new Date()),
          value: Math.round(val * 10) / 10
        });
        save();
        renderMeasure();
        toast('Measurement saved');
        ui.measureTarget = null;
      });
      safeOn('btn-log-weight', 'click', () => {
        const val = Number($('weight-input').value);
        if (!val || val <= 0) { toast('Enter weight in kg'); return; }
        state.bodyWeightLog.push({
          date: localDateKey(new Date()),
          weight: Math.round(val * 10) / 10
        });
        $('weight-input').value = '';
        save();
        renderMeasure();
        renderWidgets();
        toast('Weight logged');
      });
    });

    bindSafe('settings-actions', () => {
      safeOn('btn-save-name', 'click', () => {
        const n = ($('setting-name') && $('setting-name').value.trim()) || 'Long';
        state.displayName = n.slice(0, 24);
        save();
        toast('Name saved');
        renderProfile();
      });
      safeOn('btn-reset', 'click', async () => {
        const ok = await confirmDialog('Reset all data?', 'This wipes workouts, XP, stats, PRs, streak, routines, and measurements. Cannot undo.');
        if (!ok) return;
        state = defaultState();
        ui.sessionOpen = false;
        save();
        toast('Data reset');
        showView('profile');
        renderAll();
      });
    });

    bindSafe('escape-modals', () => {
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if ($('add-ex-modal') && $('add-ex-modal').classList.contains('open')) {
          closeModal('add-ex-modal');
        } else if ($('new-ex-modal') && $('new-ex-modal').classList.contains('open')) {
          ui.addExToDraftAfterCreate = false;
          closeModal('new-ex-modal');
        }
      });
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
  showView(state.draft ? 'start' : 'profile');
  registerSW();
})();
