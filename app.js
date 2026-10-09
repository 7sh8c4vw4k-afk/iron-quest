(() => {
  'use strict';

  const STORAGE_KEY = 'iron-quest-v1';
  const DAILY_XP_CAP = 150;
  const STAT_NAMES = ['strength', 'conditioning', 'endurance', 'stamina', 'intelligence'];
  const STAT_LABELS = {
    strength: 'Strength',
    conditioning: 'Conditioning',
    endurance: 'Endurance',
    stamina: 'Stamina',
    intelligence: 'Intelligence'
  };
  const SESSION_TYPES = ['Push', 'Pull', 'Legs', 'Upper', 'Full', 'Custom'];
  const RANKS = [
    [1, 'Novice'], [5, 'Apprentice'], [10, 'Ironhand'],
    [15, 'Veteran'], [20, 'Champion'], [30, 'Titan'], [50, 'Legend']
  ];

  const EXERCISE_LIBRARY = [
    { name: 'Bench Press', tags: ['compound', 'push', 'chest'] },
    { name: 'Squat', tags: ['compound', 'legs'] },
    { name: 'Deadlift', tags: ['compound', 'pull', 'legs'] },
    { name: 'Overhead Press', tags: ['compound', 'push', 'shoulders'] },
    { name: 'Barbell Row', tags: ['compound', 'pull', 'back'] },
    { name: 'Pull-Up', tags: ['compound', 'pull', 'back'] },
    { name: 'Lat Pulldown', tags: ['pull', 'back'] },
    { name: 'Romanian Deadlift', tags: ['compound', 'legs', 'pull'] },
    { name: 'Leg Press', tags: ['legs'] },
    { name: 'Bicep Curl', tags: ['pull', 'arms'] },
    { name: 'Tricep Pushdown', tags: ['push', 'arms'] },
    { name: 'Plank', tags: ['conditioning', 'core'] },
    { name: 'Incline Bench Press', tags: ['compound', 'push', 'chest'] },
    { name: 'Dumbbell Row', tags: ['compound', 'pull', 'back'] },
    { name: 'Lunges', tags: ['legs'] },
    { name: 'Face Pull', tags: ['pull', 'shoulders'] },
    { name: 'Cable Fly', tags: ['push', 'chest'] },
    { name: 'Leg Curl', tags: ['legs'] },
    { name: 'Calf Raise', tags: ['legs'] },
    { name: 'Burpees', tags: ['conditioning'] }
  ];

  const COMPOUND_PATTERNS = [
    /squat/i, /bench/i, /deadlift/i, /\bohp\b/i, /overhead\s*press/i,
    /military\s*press/i, /\brow\b/i, /pull[\s-]?up/i, /chin[\s-]?up/i,
    /rdl/i, /romanian/i
  ];

  // —— state ——
  function defaultState() {
    return {
      version: 1,
      displayName: 'Long',
      level: 1,
      xp: 0,
      xpToday: 0,
      xpTodayDate: localDateKey(new Date()),
      stats: { strength: 1, conditioning: 1, endurance: 1, stamina: 1, intelligence: 1 },
      workouts: [],
      prs: {}, // name -> { weight, reps, e1rm, date }
      streakFreezeMonth: null, // 'YYYY-MM' when freeze used
      freezeAvailable: true,
      draft: null,
      questsClaimed: { daily: null, weekly: null } // ISO date / ISO week keys
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed, stats: { ...defaultState().stats, ...(parsed.stats || {}) } };
    } catch {
      return defaultState();
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // —— dates / ISO weeks ——
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
    // Monday of that ISO week
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

  // —— XP / level ——
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
    state.stats[key] = Math.min(99, Math.round((state.stats[key] + amount) * 10) / 10);
  }

  function isCompound(name, tags) {
    if (tags && tags.some((t) => t === 'compound')) return true;
    return COMPOUND_PATTERNS.some((re) => re.test(name));
  }

  function estimated1RM(weight, reps) {
    if (!weight || !reps) return 0;
    if (reps === 1) return weight;
    return weight * (1 + reps / 30); // Epley-ish light
  }

  // —— streak ——
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
    // If current week has no workout, start from previous week (streak still alive until week ends)
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
    // Inject a phantom completion marker for last week so streak bridges one gap
    state.workouts.push({
      id: 'freeze-' + Date.now(),
      type: 'Freeze',
      name: 'Streak Freeze',
      exercises: [],
      notes: '',
      completedAt: (() => {
        // date within last ISO week (Wednesday)
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

  // —— quests ——
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

  // —— workout scoring ——
  function scoreWorkout(draft) {
    let totalSets = 0;
    let completedSets = 0;
    let volume = 0; // weight * reps
    let compoundHeavy = 0;
    let highRepSets = 0;
    let hasRpeOrNotes = false;
    const prHits = [];

    for (const ex of draft.exercises) {
      const tags = (EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === ex.name.toLowerCase()) || {}).tags || [];
      const compound = isCompound(ex.name, tags);
      if (ex.rpe || (ex.notes && ex.notes.trim())) hasRpeOrNotes = true;

      for (const set of ex.sets) {
        totalSets += 1;
        if (!set.done) continue;
        completedSets += 1;
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;
        volume += w * r;
        if (r >= 12) highRepSets += 1;
        if (compound && w > 0 && r > 0 && r <= 8) compoundHeavy += 1;

        if (w > 0 && r > 0) {
          const e1 = estimated1RM(w, r);
          const prev = state.prs[ex.name];
          if (!prev || e1 > prev.e1rm) {
            state.prs[ex.name] = { weight: w, reps: r, e1rm: Math.round(e1 * 10) / 10, date: new Date().toISOString() };
            prHits.push(ex.name);
          }
        }
      }
    }

    if (draft.notes && draft.notes.trim()) hasRpeOrNotes = true;

    // XP: base + light volume scale
    let xpRaw = 20 + completedSets * 2 + Math.min(40, Math.floor(volume / 500));
    if (draft.type === 'Full' || draft.type === 'Custom') xpRaw += 5;

    const statsDelta = { strength: 0, conditioning: 0, endurance: 0, stamina: 0, intelligence: 0 };
    statsDelta.strength = Math.min(2.5, compoundHeavy * 0.35);
    statsDelta.conditioning = Math.min(2.0, highRepSets * 0.25 + (tagsHasConditioning(draft) ? 0.5 : 0));
    statsDelta.endurance = Math.min(2.0, completedSets * 0.08);
    // stamina from weekly count after save
    statsDelta.intelligence = hasRpeOrNotes ? 0.6 : 0.1;

    return { xpRaw, statsDelta, completedSets, volume, prHits, hasRpeOrNotes };
  }

  function tagsHasConditioning(draft) {
    return draft.exercises.some((ex) => {
      const lib = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === ex.name.toLowerCase());
      return lib && lib.tags.includes('conditioning');
    }) || /circuit|hiit|condition/i.test(draft.name || '') || /circuit|hiit/i.test(draft.notes || '');
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
    for (const k of STAT_NAMES) {
      if (result.statsDelta[k]) bumpStat(k, result.statsDelta[k]);
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

    // Stamina: based on workouts this week (after adding)
    const weekCount = workoutsInIsoWeek(isoWeekKey(new Date()));
    const staminaBump = Math.min(1.5, 0.3 + weekCount * 0.25);
    bumpStat('stamina', staminaBump);
    workout.statsDelta.stamina = staminaBump;

    const gained = addXp(result.xpRaw);
    workout.xpAwarded = gained;
    const questBonus = claimQuestsIfNeeded();

    state.draft = null;
    save();

    let msg = `+${gained} XP`;
    if (questBonus) msg += ` · +${questBonus} quest`;
    if (result.prHits.length) msg += ` · PR: ${result.prHits.slice(0, 2).join(', ')}`;
    if (gained === 0 && result.xpRaw > 0) msg = 'Daily XP cap reached — session saved';
    toast(msg);

    showView('home');
    renderAll();
  }

  // —— UI helpers ——
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

  // —— render ——
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
    freezeBtn.hidden = !(streak > 0 && canUseFreeze() && !trained && !weeks.has(prevIsoWeek(thisWeek)));
    // show freeze when there's a gap risk: last week empty and this week empty but older streak
    // simpler: show if freeze available this month
    freezeBtn.hidden = !canUseFreeze();
    freezeBtn.title = canUseFreeze() ? 'Use 1 streak freeze this month' : 'Freeze used this month';

    const grid = $('stats-grid');
    grid.innerHTML = STAT_NAMES.map((k) => {
      const v = state.stats[k];
      const pct = Math.min(100, (v / 50) * 100);
      return `<div class="stat-row">
        <div class="stat-name">${STAT_LABELS[k]}</div>
        <div class="stat-bar"><div class="stat-fill" style="width:${pct}%"></div></div>
        <div class="stat-val">${v}</div>
      </div>`;
    }).join('');

    // quests
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
      const lib = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === ex.name.toLowerCase());
      const tags = lib ? lib.tags : [];
      const compound = isCompound(ex.name, tags);
      return `<div class="ex-card" data-ei="${ei}">
        <div class="ex-head">
          <div>
            <strong>${escapeHtml(ex.name)}</strong>
            <div class="ex-tags">
              ${compound ? '<span class="tag compound">compound</span>' : ''}
              ${tags.includes('conditioning') ? '<span class="tag conditioning">conditioning</span>' : ''}
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

  // —— events ——
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
        // don't save every keystroke heavily — debounce
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

  // —— PWA ——
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  // init
  ensureDailyXpReset();
  claimQuestsIfNeeded(); // claim if already eligible from prior sessions today
  save();
  bind();
  renderAll();
  showView('home');
  registerSW();
})();
