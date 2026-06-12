/* =============================================================================
   Pourō — app.js
   PR-005: Settings persistence + JSON/CSV export + Clear history

   PR-005 adds:
   - Settings localStorage persistence (key: pouroFable5.settings.v1)
   - Default brew settings (method, dose, ratio) applied on boot
   - Brew assist toggle persistence (wake, sound, haptic)
   - JSON export (full history with metadata)
   - CSV export (all fields, quote-escaped)
   - Clear History: full localStorage removal
   - Brew Log equipment input fields (bean, grind, temperature, equipment)

   STILL STUB (→ later PRs):
   - Service worker / manifest / offline (→ PR-006)
   ============================================================================= */

'use strict';

/* ── Utility ─────────────────────────────────────────────────────────────────── */
function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/* ── Method definitions ─────────────────────────────────────────────────────── */
const METHODS = {
  'yon-roku': {
    id: 'yon-roku',
    num: '4:6',
    name: '4:6 Method',
    sub: '前半で味、後半で濃度を調節',
    time: '約3:30',
    desc: '前半2投で味の方向を、後半の投数（軽め: 2投・標準: 3投・しっかり: 4投）で濃度を調整。再現性が高く、風味のコントロールに優れた手法です。',
    meters: [
      { label: '甘さ',  dots: [true, true, true, true, false, false] },
      { label: '酸味',  dots: [true, true, false, false, false, false] },
      { label: '濃度',  dots: [true, true, true, false, false, false] },
    ],
    hasFlavorStrength: true,
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 8.5h12v5.5a6 6 0 0 1-12 0Z"/><path d="M16.5 9.5h2.2a2.6 2.6 0 0 1 0 5.2h-2.4"/></svg>`,
    iconSm: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 8.5h12v5.5a6 6 0 0 1-12 0Z"/><path d="M16.5 9.5h2.2a2.6 2.6 0 0 1 0 5.2h-2.4"/></svg>`,
    img: 'assets/method-46.png',
    checklist: [
      'フィルターをリンスし、ドリッパーを温めてください',
      'コーヒーをセットし、タイマーの準備をしてください',
      '目標湯量を確認してください — 分量通りに注ぎます',
    ],
  },

  'hybrid': {
    id: 'hybrid',
    num: 'Hybrid',
    name: 'Hybrid',
    sub: 'HARIO Switch 浸漬 + 透過',
    time: '約3:00',
    desc: 'スイッチの開閉で浸漬と透過を組み合わせた方法。OPEN で湯を落とし（透過）、CLOSED で湯を溜めて浸漬させます。',
    meters: [
      { label: 'ボディ', dots: [true, true, true, true, true, false] },
      { label: '甘さ',   dots: [true, true, true, true, false, false] },
      { label: '酸味',   dots: [true, true, true, false, false, false] },
    ],
    hasFlavorStrength: false,
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="16" cy="12" r="3" fill="currentColor" stroke="none"/></svg>`,
    iconSm: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="16" cy="12" r="3" fill="currentColor" stroke="none"/></svg>`,
    img: 'assets/method-hybrid.png',
    checklist: [
      'スイッチを「開（OPEN）」の状態にしてセットしてください',
      'フィルターをリンスし、ドリッパーを温めてください',
      '第2投のあとスイッチを「閉（CLOSED）」に切り替えてください',
    ],
  },

  'neo': {
    id: 'neo',
    num: '10 Pour',
    name: '10 Pour',
    sub: '均等10回注湯・高再現性',
    time: '約3:30',
    desc: '第1投は30秒待機、第2投以降は15秒間隔でリズムよく注ぎます。10回均等注湯で安定した抽出を実現します。',
    meters: [
      { label: 'クリーン', dots: [true, true, true, true, true, false] },
      { label: '明るさ',   dots: [true, true, true, true, false, false] },
      { label: '濃度',     dots: [true, true, true, false, false, false] },
    ],
    hasFlavorStrength: false,
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h10"/><path d="M7 20.5h10"/><path d="M8 3.5c0 7 8 7 8 17"/><path d="M16 3.5c0 7-8 7-8 17"/></svg>`,
    iconSm: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h10"/><path d="M7 20.5h10"/><path d="M8 3.5c0 7 8 7 8 17"/><path d="M16 3.5c0 7-8 7-8 17"/></svg>`,
    img: 'assets/method-10-pour.png',
    checklist: [
      'フィルターをリンスし、ドリッパーを温めてください',
      '第1投 30秒待機、第2投以降は15秒間隔でテンポよく注ぎます',
      '湯温と注湯量を事前に確認してください',
    ],
  },

  'ice': {
    id: 'ice',
    num: 'Ice',
    name: 'Ice Brew',
    sub: 'ホット抽出 + 氷で急冷',
    time: '約3:00',
    desc: '通常より少量のお湯で濃く抽出し、氷で急冷するアイスコーヒー製法。クリアでフルーティな仕上がりに。',
    meters: [
      { label: '甘さ',   dots: [true, true, true, true, false, false] },
      { label: '明るさ', dots: [true, true, true, true, true, false] },
      { label: 'ボディ', dots: [true, true, false, false, false, false] },
    ],
    hasFlavorStrength: false,
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M7 7l5-4 5 4"/><path d="M7 17l5 4 5-4"/><path d="M3 12h18"/></svg>`,
    iconSm: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M7 7l5-4 5 4"/><path d="M7 17l5 4 5-4"/><path d="M3 12h18"/></svg>`,
    img: 'assets/method-ice-brew.png',
    checklist: [
      '氷をサーバーにセットしてください',
      'フィルターをリンスし、ドリッパーを温めてください',
      '通常より湯量を少なくして濃く抽出します — 急冷で完成します',
      '累計表示は注いだ湯量のみです — 氷は含めません',
    ],
  },
};

const METHOD_ORDER = ['yon-roku', 'hybrid', 'neo', 'ice'];

/* ── Recipe Engine ──────────────────────────────────────────────────────────── */
/*
 * RecipeEngine generates a recipe object from user inputs.
 * The same object is used by Preview timeline, Active Brew timer,
 * and the Brew Log handoff draft.
 *
 * step.type:
 *   'pour'     — user pours water
 *   'switch'   — user operates Hybrid switch (no water)
 *   'drawdown' — waiting for water to drain
 */
const RecipeEngine = {

  build(methodId, dose, ratio, flavor, strength) {
    switch (methodId) {
      case 'yon-roku': return this._buildYonRoku(dose, ratio, flavor, strength);
      case 'hybrid':   return this._buildHybrid(dose, ratio);
      case 'neo':      return this._buildNeo(dose, ratio);
      case 'ice':      return this._buildIce(dose);
      default:         return this._buildYonRoku(dose, ratio, 'balanced', 'standard');
    }
  },

  _buildYonRoku(dose, ratio, flavor = 'balanced', strength = 'standard') {
    const totalWater = Math.round(dose * ratio);
    const frontWater = Math.round(totalWater * 0.4);
    const backWater  = totalWater - frontWater;

    // Front 2 pours — flavor sets split direction
    // sweet: smaller first pour (甘め寄り); bright: larger first pour (明るめ寄り)
    let p1, p2;
    if (flavor === 'sweet') {
      p1 = Math.round(frontWater * 0.4); p2 = frontWater - p1;
    } else if (flavor === 'bright') {
      p1 = Math.round(frontWater * 0.6); p2 = frontWater - p1;
    } else {
      p1 = Math.round(frontWater / 2);   p2 = frontWater - p1;
    }

    // Back pours — strength determines count and interval
    // light: 2 pours (45s interval) → 4 total
    // standard: 3 pours (45s interval) → 5 total
    // strong: 4 pours (30s interval) → 6 total
    const backPourCount = strength === 'light' ? 2 : strength === 'strong' ? 4 : 3;
    const backInterval  = strength === 'strong' ? 30 : 45;
    const backStart     = 90;

    const perBack  = Math.round(backWater / backPourCount);
    const backAmts = Array.from({ length: backPourCount }, (_, i) =>
      i === backPourCount - 1 ? backWater - perBack * (backPourCount - 1) : perBack
    );
    const backTimes = Array.from({ length: backPourCount }, (_, i) =>
      backStart + i * backInterval
    );

    const flavorNote   = { sweet: '甘め寄り', balanced: 'バランス', bright: '明るめ寄り' };
    const strengthNote = { light: '軽め', standard: '標準', strong: 'しっかり' };
    const backLabels   = ['第3投', '第4投', '第5投', '第6投'];
    const backInstruction = (i, last) => {
      if (i === 0)    return `濃度を整える（${strengthNote[strength] || strength}）`;
      if (i === last) return '最終注湯';
      return '濃度を重ねる';
    };

    let cum = 0;
    const steps = [
      { id: 's1', timeSec: 0,  label: '第1投', instruction: `蒸らし — ${flavorNote[flavor] || flavor}`,
        pourAmount: p1, totalAmount: (cum += p1), type: 'pour' },
      { id: 's2', timeSec: 45, label: '第2投', instruction: '味の方向を定める',
        pourAmount: p2, totalAmount: (cum += p2), type: 'pour' },
    ];
    backAmts.forEach((amt, i) => {
      steps.push({
        id: `s${3 + i}`, timeSec: backTimes[i], label: backLabels[i],
        instruction: backInstruction(i, backPourCount - 1),
        pourAmount: amt, totalAmount: (cum += amt), type: 'pour',
      });
    });
    steps.push({
      id: 'draw', timeSec: 210, label: 'ドローダウン',
      instruction: '落ちるのを待つ（目安 3:30）',
      pourAmount: 0, totalAmount: cum, type: 'drawdown',
    });

    const totalPours  = 2 + backPourCount;
    const intervalStr = strength === 'strong' ? '前半0:45 / 後半0:30' : '0:45 間隔';

    return {
      id: 'yon-roku', name: '4:6 Method',
      dose, ratio, totalWater,
      targetDrawdownSec: 210,
      flavor, strength,
      pourCount: totalPours,
      summary: {
        coffee: `${dose}g`, water: `${totalWater}ml`,
        pours: `${totalPours}回`, interval: intervalStr,
        drawdown: `目安 3:30（${strengthNote[strength] || strength}）`,
      },
      steps,
    };
  },

  _buildHybrid(dose, ratio) {
    const totalWater = Math.round(dose * ratio);
    // Artifact design: 2 small OPEN percolation pours, 1 large CLOSED immersion pour
    // h1 ≈ h2 ≈ 3/14 of total (~21%), h3 = remainder (~57%)
    const h1 = Math.round(totalWater * 3 / 14);
    const h2 = Math.round(totalWater * 3 / 14);
    const h3 = totalWater - h1 - h2;
    let cum = 0;
    return {
      id: 'hybrid', name: 'Hybrid',
      dose, ratio, totalWater,
      targetDrawdownSec: 180,
      pourCount: 3,
      summary: {
        coffee: `${dose}g`, water: `${totalWater}ml`,
        pours: '3回 + Switch操作',
        interval: 'OPEN → OPEN(閉) → CLOSED(開)',
        drawdown: '目安 3:00',
      },
      steps: [
        { id: 's1',  timeSec: 0,   label: '第1投',              instruction: '透過の注湯（Switch OPEN のまま）',
          pourAmount: h1, totalAmount: (cum += h1), type: 'pour',     switchState: 'open'   },
        { id: 's2',  timeSec: 30,  label: '第2投',              instruction: '透過の注湯 — 注ぎ終えたら Switch を閉じる',
          pourAmount: h2, totalAmount: (cum += h2), type: 'pour',     switchState: 'open'   },
        { id: 's3',  timeSec: 75,  label: '第3投',              instruction: '浸漬の注湯（Switch CLOSED）',
          pourAmount: h3, totalAmount: (cum += h3), type: 'pour',     switchState: 'closed' },
        { id: 'draw', timeSec: 105, label: 'Switch OPEN・落とし切り', instruction: 'Switch を開けて落とし切る（目安 3:00）',
          pourAmount: 0,  totalAmount: cum,          type: 'drawdown', switchState: 'open'   },
      ],
    };
  },

  _buildNeo(dose, ratio) {
    // 30s then 15s rhythm:
    // 0:00, 0:30, 0:45, 1:00, 1:15, 1:30, 1:45, 2:00, 2:15, 2:30 → drawdown 3:30
    const totalWater = Math.round(dose * ratio);
    const each = Math.round(totalWater / 10);
    const times = [0, 30, 45, 60, 75, 90, 105, 120, 135, 150];
    let cum = 0;
    const pourSteps = times.map((t, i) => {
      const amt = (i === 9) ? totalWater - cum : each;
      const waitNote = i === 0 ? '（次は30秒後）' : '（15秒リズム）';
      return {
        id: `s${i + 1}`, timeSec: t, label: `第${i + 1}投`,
        instruction: `注湯${waitNote}`,
        pourAmount: amt, totalAmount: (cum += amt), type: 'pour',
      };
    });
    pourSteps.push({
      id: 'draw', timeSec: 210, label: 'ドローダウン',
      instruction: '落ちるのを待つ（目安 3:30）',
      pourAmount: 0, totalAmount: cum, type: 'drawdown',
    });
    return {
      id: 'neo', name: '10 Pour',
      dose, ratio, totalWater,
      targetDrawdownSec: 210,
      pourCount: 10,
      summary: {
        coffee: `${dose}g`, water: `${totalWater}ml`,
        pours: '10回', interval: '第1投30秒 / 以降15秒',
        drawdown: '目安 3:30',
      },
      steps: pourSteps,
    };
  },

  _buildIce(dose) {
    // Ice Brew fixed formula:
    // hotWater = dose × 7.5, ice = dose × 4
    // Cumulative pour count uses hot water only — ice is pre-set in server
    const hotWater = Math.round(dose * 7.5);
    const ice      = Math.round(dose * 4);
    const totalWater = hotWater + ice;
    // 5 equal hot pours: 0:00, 0:30, 1:00, 1:30, 2:00 → chill 3:00
    const perPour = Math.round(hotWater / 5);
    const pours = [perPour, perPour, perPour, perPour, hotWater - perPour * 4];
    const times = [0, 30, 60, 90, 120];
    let cum = 0;
    const pourSteps = times.map((t, i) => ({
      id: `s${i + 1}`, timeSec: t, label: `第${i + 1}投`,
      instruction: i === 0 ? '蒸らし（HOT）' : i === 4 ? '最終注湯（HOT）' : '注湯（HOT）',
      pourAmount: pours[i], totalAmount: (cum += pours[i]), type: 'pour',
    }));
    pourSteps.push({
      id: 'chill', timeSec: 180, label: '急冷・完成',
      instruction: 'スワールして急冷。氷が溶けたら完成（目安 3:00）',
      pourAmount: 0, totalAmount: cum, type: 'drawdown',
    });
    return {
      id: 'ice', name: 'Ice Brew',
      dose, ratio: null, totalWater, hotWater, ice,
      targetDrawdownSec: 180,
      pourCount: 5,
      summary: {
        coffee: `${dose}g`, water: `${hotWater}g HOT / ${ice}g ICE`,
        pours: '5回', interval: '0:30 間隔',
        drawdown: '急冷で完成（目安 3:00）',
      },
      steps: pourSteps,
    };
  },
};

/* ── Static sample history ──────────────────────────────────────────────────── */
const SAMPLE_HISTORY = [
  {
    id: 'h1',
    methodId: 'yon-roku',
    date: '2026-06-10',
    dose: 20, ratio: 15, flavor: 'balanced', strength: 'standard',
    rating: 4,
    tags: ['甘い', 'フルーティ'],
    note: '余韻にピーチのような甘さ。蒸らしをもう少し長くしてもいいかも。',
    nextNote: '湯温を93℃から92℃に下げてみる',
    equip: { bean: 'エチオピア ゲデオ', grind: '中細挽き (#16)', temp: '93°C', dripper: 'ハリオ V60' },
  },
  {
    id: 'h2',
    methodId: 'hybrid',
    date: '2026-06-08',
    dose: 18, ratio: 15,
    rating: 3,
    tags: ['クリーン', 'ナッツ'],
    note: 'スイッチのタイミングを少し早めた。',
    nextNote: '',
    equip: { bean: 'コロンビア フワン', grind: '中挽き (#18)', temp: '90°C', dripper: 'HARIO Switch' },
  },
  {
    id: 'h3',
    methodId: 'ice',
    date: '2026-06-05',
    dose: 20, ratio: 12,
    rating: 5,
    tags: ['フルーティ', '明るい'],
    note: '氷の量が丁度よく、クリアな仕上がり。',
    nextNote: '次は豆を粗めに挽いてみる',
    equip: { bean: 'ケニア キリニャガ', grind: '細挽き (#14)', temp: '95°C', dripper: 'ハリオ V60' },
  },
];

/* ── App state ──────────────────────────────────────────────────────────────── */
const state = {
  selectedMethodId: 'yon-roku',
  draft: { dose: 20, ratio: 15, flavor: 'balanced', strength: 'standard', customRatio: false },
  rebrewFrom: null,

  // Active recipe — set by RecipeEngine.build() before brew starts
  activeRecipe: null,

  // Timer state
  timer: {
    startedAt: null,        // performance.now() at start
    pausedAt: null,         // performance.now() when paused
    pausedDurationMs: 0,    // cumulative paused time in ms
    elapsedSec: 0,          // last computed elapsed seconds
    currentStepIndex: 0,    // index into activeRecipe.steps
    isRunning: false,
    isFinished: false,
    rafId: null,
    intervalId: null,       // setInterval fallback id (background tab support)
    startedAtWall: null,    // Date.now() at start (for log handoff)
    finishedAtWall: null,   // Date.now() at finish (for log handoff)
  },

  log: { rating: 0, tags: [] },

  // PR-003 creates an in-memory brew result draft.
  // Persistence will be implemented in PR-004.
  brewResultDraft: null,

  history: [],  // loaded from localStorage on boot via safeReadHistory()
  currentDetailId: null,
  settings: {
    defMethodId: 'yon-roku',
    defDose:     20,
    defRatio:    15,
    defFlavor:   'balanced',
    defStrength: 'standard',
    wake:   false,
    sound:  true,
    haptic: true,
  },
};

/* ── Taste tags ─────────────────────────────────────────────────────────────── */
const TASTE_TAGS = ['甘い', 'フルーティ', '明るい', 'クリーン', 'ナッツ', 'チョコ', 'スパイシー', 'まろやか'];
const RATING_LABELS    = ['', '微妙', 'まあまあ', '良い', 'とても良い', '最高'];
const FLAVOR_LABELS    = { sweet: '甘め', balanced: 'バランス', bright: '明るめ' };
const STRENGTH_LABELS  = { light: '軽め', standard: '標準', strong: 'しっかり' };
const METHOD_DISPLAY_NAMES = {
  'yon-roku': '4:6 Method', 'hybrid': 'Hybrid', 'neo': '10 Pour', 'ice': 'Ice Brew',
};

/* ── Storage ────────────────────────────────────────────────────────────────── */
const STORAGE_KEYS = {
  history:  'pouroFable5.history.v1',
  settings: 'pouroFable5.settings.v1',
};
const MAX_HISTORY_ENTRIES = 500;

function normalizeRating(v) {
  if (v === null || v === undefined || v === 0) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.round(n);
}

function normalizeHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;

  const methodId = entry.methodId || entry.recipe?.id || 'yon-roku';
  const dose     = Number(entry.dose || entry.recipe?.dose || 20);
  const ratio    = methodId === 'ice'
    ? null
    : Number(entry.ratio ?? entry.recipe?.ratio ?? 15);

  const flavor   = entry.recipe?.flavor   || entry.flavor   || 'balanced';
  const strength = entry.recipe?.strength || entry.strength || 'standard';

  const recipe = entry.recipe?.steps?.length
    ? entry.recipe
    : RecipeEngine.build(methodId, dose, ratio || 15, flavor, strength);

  return {
    schemaVersion: 1,
    id:          entry.id          || `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt:   entry.createdAt   || entry.completedAt || new Date().toISOString(),
    completedAt: entry.completedAt || entry.createdAt   || new Date().toISOString(),
    methodId,
    methodName:  entry.methodName  || recipe.name || METHOD_DISPLAY_NAMES[methodId] || methodId,
    dose,
    ratio,
    recipe,
    brew: {
      elapsedSec: Number(entry.brew?.elapsedSec || entry.elapsedSec || recipe.targetDrawdownSec || 0),
      startedAt:  entry.brew?.startedAt  || entry.startedAt  || null,
      finishedAt: entry.brew?.finishedAt || entry.finishedAt || null,
    },
    log: {
      rating:      normalizeRating(entry.log?.rating ?? entry.rating),
      tags:        Array.isArray(entry.log?.tags ?? entry.tags)
                     ? (entry.log?.tags || entry.tags || [])
                     : [],
      note:        entry.log?.note        || entry.note     || '',
      nextNote:    entry.log?.nextNote    || entry.nextNote || '',
      grind:          entry.log?.grind          || '',
      temperature:    entry.log?.temperature    || '',
      bean:           entry.log?.bean           || '',
      equipment:      entry.log?.equipment      || '',
      actualDrawdown: entry.log?.actualDrawdown || '',
    },
  };
}

function safeReadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeHistoryEntry).filter(Boolean);
  } catch (error) {
    console.warn('[Pouro] Failed to read history:', error);
    return [];
  }
}

function safeWriteHistory(entries) {
  try {
    const normalized = entries
      .map(normalizeHistoryEntry)
      .filter(Boolean)
      .slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(normalized));
    return true;
  } catch (error) {
    console.warn('[Pouro] Failed to write history:', error);
    return false;
  }
}

/* ── Settings storage ───────────────────────────────────────────────────────── */
function getDefaultSettings() {
  return {
    defMethodId: 'yon-roku',
    defDose:     20,
    defRatio:    15,
    defFlavor:   'balanced',
    defStrength: 'standard',
    wake:   false,
    sound:  true,
    haptic: true,
  };
}

function normalizeSettings(raw) {
  const d = getDefaultSettings();
  if (!raw || typeof raw !== 'object') return d;

  // Support both flat (PR-005) and the nested schema form for forward-compat
  const db = raw.defaultBrew  || {};
  const ba = raw.brewAssist   || {};

  return {
    defMethodId: (raw.defMethodId  || db.methodId  || d.defMethodId),
    defDose:     Number(raw.defDose     || db.dose      || d.defDose),
    defRatio:    Number(raw.defRatio    || db.ratio     || d.defRatio),
    defFlavor:   (raw.defFlavor   || db.flavor    || d.defFlavor),
    defStrength: (raw.defStrength || db.strength  || d.defStrength),
    wake:        Boolean(raw.wake   ?? ba.wakeLock  ?? d.wake),
    sound:       Boolean(raw.sound  ?? ba.sound     ?? d.sound),
    haptic:      Boolean(raw.haptic ?? ba.vibration ?? d.haptic),
  };
}

function safeReadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return getDefaultSettings();
    return normalizeSettings(JSON.parse(raw));
  } catch (err) {
    console.warn('[Pouro] Failed to read settings:', err);
    return getDefaultSettings();
  }
}

function safeWriteSettings(settings) {
  try {
    const payload = {
      schemaVersion: 1,
      defMethodId:   settings.defMethodId,
      defDose:       settings.defDose,
      defRatio:      settings.defRatio,
      defFlavor:     settings.defFlavor,
      defStrength:   settings.defStrength,
      wake:          settings.wake,
      sound:         settings.sound,
      haptic:        settings.haptic,
    };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('[Pouro] Failed to write settings:', err);
    return false;
  }
}

// Display-only Japanese date format — stored data stays ISO
function _formatDate(iso) {
  if (!iso) return '—';
  try {
    // Date-only legacy entries have no time information
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [, mo, da] = iso.split('-');
      return `${Number(mo)}月${Number(da)}日`;
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '—';
  }
}

/* ── DOM cache (populated after DOMContentLoaded) ───────────────────────────── */
let DOM = {};
function cacheDOM() {
  DOM.brewTimeDisplay = document.getElementById('brew-time-display');
  DOM.brewArc         = document.getElementById('brew-arc');
  DOM.brewStepBig     = document.getElementById('brew-step-big');
  DOM.brewStepSmall   = document.getElementById('brew-step-small');
  DOM.brewDotsRow     = document.getElementById('brew-dots-row');
  DOM.brewPourCard    = document.getElementById('brew-pour-card');
  DOM.brewPourAmt     = document.getElementById('brew-pour-amt');
  DOM.brewCumAmt      = document.getElementById('brew-cum-amt');
  DOM.brewPourNote    = document.getElementById('brew-pour-note');
  DOM.brewDrawCard    = document.getElementById('brew-draw-card');
  DOM.brewDrawTitle   = document.getElementById('brew-draw-title');
  DOM.brewDrawSub     = document.getElementById('brew-draw-sub');
  DOM.brewNextHint      = document.getElementById('brew-next-hint');
  DOM.brewNextTime      = document.getElementById('brew-next-time');
  DOM.brewNextAmt       = document.getElementById('brew-next-amt');
  DOM.brewNextTip       = document.getElementById('brew-next-tip');
  DOM.brewNextCountdown = document.getElementById('brew-next-countdown');
  DOM.brewChipWrap    = document.getElementById('brew-chip-wrap');
  DOM.brewChip        = document.getElementById('brew-chip');
  DOM.brewPauseIcon   = document.getElementById('brew-pause-icon');
  DOM.brewPlayIcon    = document.getElementById('brew-play-icon');
  DOM.brewPauseLabel  = document.getElementById('brew-pause-label');
  DOM.brewNextIcon    = document.getElementById('brew-next-icon');
  DOM.brewFinishIcon  = document.getElementById('brew-finish-icon');
  DOM.brewNextLabel   = document.getElementById('brew-next-label');
  DOM.brewBtnNext     = document.getElementById('btn-brew-next');
  DOM.brewSwitchRow   = document.getElementById('brew-switch-row');
  DOM.brewSwitchChip  = document.getElementById('brew-switch-chip');
  DOM.brewSwitchDesc  = document.getElementById('brew-switch-desc');
  DOM.brewMethodIcon  = document.getElementById('brew-method-icon');
  DOM.brewMethodName  = document.getElementById('brew-method-name');
  DOM.brewMethodSub   = document.getElementById('brew-method-sub');
}

/* ── SVG helpers ─────────────────────────────────────────────────────────────── */
function iconSvgFor(methodId, size = 26) {
  const m = METHODS[methodId];
  return m ? m.icon.replace(/width="26" height="26"/, `width="${size}" height="${size}"`) : '';
}

/* Method PNG icon — primary method visual across screens (Fable5 artifact parity) */
function methodImgHTML(methodId, size) {
  const m = METHODS[methodId];
  if (!m || !m.img) return '';
  return `<span style="display:inline-flex;width:${size}px;height:${size}px;align-items:center;justify-content:center;flex-shrink:0;"><img src="${m.img}" alt="" style="max-width:100%;max-height:100%;display:block;"></span>`;
}

/* ── Summary columns ────────────────────────────────────────────────────────── */
function summaryColHTML(iconSvg, label, value, unit) {
  return `<span class="summary-col">
    <span class="summary-col-icon">${iconSvg}</span>
    <span class="summary-col-label">${label}</span>
    <span class="summary-col-value">
      <span class="summary-col-num">${value}</span><span class="summary-col-unit">${unit}</span>
    </span>
  </span>`;
}

const _icons = {
  bean:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="7.5"/><path d="M12 4.5c-3.2 4.4-3.2 10.6 0 15"/></svg>`,
  water: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3.3 4 5.6 6.9 5.6 9.5a5.6 5.6 0 1 1-11.2 0c0-2.6 2.3-5.5 5.6-9.5Z"/></svg>`,
  pour:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3.3 4 5.6 6.9 5.6 9.5a5.6 5.6 0 1 1-11.2 0c0-2.6 2.3-5.5 5.6-9.5Z"/></svg>`,
  timer: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  ratio: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7.5h15"/><path d="M12 4.5v14.5"/></svg>`,
  ice:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M7 7l5-4 5 4"/><path d="M7 17l5 4 5-4"/><path d="M3 12h18"/></svg>`,
};

function buildSummaryCols(recipe) {
  const pourCount = recipe.steps.filter(s => s.type === 'pour').length;
  const timeStr   = formatTime(recipe.targetDrawdownSec);

  if (recipe.id === 'ice') {
    return (
      summaryColHTML(_icons.bean,  '豆',   recipe.dose,     'g')  +
      summaryColHTML(_icons.water, 'HOT',  recipe.hotWater, 'g')  +
      summaryColHTML(_icons.ice,   'ICE',  recipe.ice,      'g')  +
      summaryColHTML(_icons.pour,  '投数', pourCount,       '回') +
      summaryColHTML(_icons.timer, '目安', timeStr,         '')
    );
  }
  return (
    summaryColHTML(_icons.bean,  '豆',   recipe.dose,          'g')  +
    summaryColHTML(_icons.water, 'お湯', recipe.totalWater,    'ml') +
    summaryColHTML(_icons.ratio, '比率', `1:${recipe.ratio}`,  '')   +
    summaryColHTML(_icons.pour,  '投数', pourCount,            '回') +
    summaryColHTML(_icons.timer, '目安', timeStr,              '')
  );
}

/* ── Step list HTML (Preview + Detail) ─────────────────────────────────────── */
function buildStepsHTML(steps) {
  const visible = steps.filter(s => s.timeSec >= 0);
  return visible.map((st, i) => {
    const isFirst = i === 0;
    const isLast  = i === visible.length - 1;
    const isDraw  = st.type === 'drawdown';
    const dotCls  = isDraw ? 'draw' : (i === 0 ? 'active' : 'upcoming');

    let switchChip = '';
    if (st.switchState === 'open') {
      switchChip = `<span class="step-switch-chip step-switch-open">OPEN</span>`;
    } else if (st.switchState === 'closed') {
      switchChip = `<span class="step-switch-chip step-switch-closed">CLOSED</span>`;
    }

    const amtStr = st.pourAmount > 0 ? `${st.pourAmount}g` : (st.type === 'switch' ? '操作' : '—');
    const cumHTML = isDraw
      ? `<span class="step-cum" style="color:var(--color-text-faint);">完了</span>`
      : `<span class="step-cum-label">→</span><span class="step-cum">${st.totalAmount}g</span>`;

    return `<div class="step-row">
      <span class="step-rail">
        <span class="step-rail-line ${isFirst ? 'none' : 'filled'}"></span>
        <span class="step-dot ${dotCls}"></span>
        <span class="step-rail-line ${isLast ? 'none' : 'empty'}"></span>
      </span>
      <span class="step-time">${formatTime(st.timeSec)}</span>
      <span class="step-divider"></span>
      <span class="step-amt">${amtStr}</span>
      <span style="flex:1;"></span>
      ${switchChip}
      ${cumHTML}
    </div>`;
  }).join('');
}

function buildRatingStars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="rating-star ${i < rating ? 'filled' : ''}"></span>`
  ).join('');
}

/* ── Screen navigation ──────────────────────────────────────────────────────── */
// Fable5 tab rule: the tab bar shows only on root screens.
// Flow/detail screens (setup, preview, brew, log, detail) hide it so the
// CTA bar lands directly on the safe area without a double bottom.
const TAB_BAR_SCREENS = ['home', 'history', 'settings'];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`screen-${id}`);
  if (el) el.classList.add('active');

  const tabBar = document.getElementById('tab-bar');
  if (TAB_BAR_SCREENS.includes(id)) {
    tabBar.classList.remove('hidden');
  } else {
    tabBar.classList.add('hidden');
  }
  // Stop timer when leaving brew screen
  if (id !== 'brew' && state.timer.isRunning) stopTimer();

  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });

  let activeTab = null;
  if (id === 'home')     activeTab = 'brew';
  if (id === 'history')  activeTab = 'history';
  if (id === 'settings') activeTab = 'settings';

  if (activeTab) {
    const tabEl = document.getElementById(`tab-${activeTab}`);
    if (tabEl) {
      tabEl.classList.add('active');
      tabEl.setAttribute('aria-selected', 'true');
    }
  }
}

/* ── Timer Engine ───────────────────────────────────────────────────────────── */

// Shared display updater — called by both RAF loop and setInterval fallback.
// Calculates elapsed time from performance.now() so it stays accurate
// regardless of which scheduler fires the update.
function _updateTimerDisplay() {
  const t = state.timer;
  if (!t.isRunning || t.startedAt === null) return;

  const now        = performance.now();
  const elapsedMs  = now - t.startedAt - t.pausedDurationMs;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  t.elapsedSec     = elapsedSec;

  const timeStr = formatTime(elapsedSec);
  if (DOM.brewTimeDisplay.textContent !== timeStr) {
    DOM.brewTimeDisplay.textContent = timeStr;
  }

  const recipe        = state.activeRecipe;
  const progress      = Math.min(1, elapsedMs / 1000 / recipe.targetDrawdownSec);
  const circumference = 2 * Math.PI * 112;
  DOM.brewArc.setAttribute(
    'stroke-dasharray',
    `${(circumference * progress).toFixed(1)} ${circumference.toFixed(1)}`
  );

  // Next-pour countdown: show seconds until next step
  const cdEl = DOM.brewNextCountdown;
  if (cdEl) {
    const recipe = state.activeRecipe;
    if (recipe) {
      const nextStep = recipe.steps[t.currentStepIndex + 1];
      if (nextStep && nextStep.type !== 'drawdown') {
        const secs = Math.max(0, nextStep.timeSec - elapsedSec);
        cdEl.textContent = secs > 0 ? `${secs}秒後` : '注湯タイム';
      } else if (nextStep && nextStep.type === 'drawdown') {
        const secs = Math.max(0, nextStep.timeSec - elapsedSec);
        cdEl.textContent = secs > 0 ? `${secs}秒後` : '落ち切り待ち';
      } else {
        cdEl.textContent = '';
      }
    }
  }
}

// RAF loop — runs at up to 60 fps when the page is visible.
function timerTick() {
  const t = state.timer;
  if (!t.isRunning) return;
  _updateTimerDisplay();
  t.rafId = requestAnimationFrame(timerTick);
}

function startTimer() {
  const t = state.timer;
  t.startedAt        = performance.now();
  t.startedAtWall    = Date.now();
  t.pausedAt         = null;
  t.pausedDurationMs = 0;
  t.elapsedSec       = 0;
  t.isRunning        = true;
  t.isFinished       = false;
  // RAF for smooth visual updates; setInterval as 1 Hz fallback for background tabs
  t.rafId            = requestAnimationFrame(timerTick);
  t.intervalId       = setInterval(_updateTimerDisplay, 1000);
}

function pauseTimer() {
  const t = state.timer;
  if (!t.isRunning) return;
  t.pausedAt  = performance.now();
  t.isRunning = false;
  cancelAnimationFrame(t.rafId);  t.rafId      = null;
  clearInterval(t.intervalId);    t.intervalId = null;
}

function resumeTimer() {
  const t = state.timer;
  if (t.isRunning || t.isFinished) return;
  if (t.startedAt === null) { startTimer(); return; }
  if (t.pausedAt !== null) {
    t.pausedDurationMs += performance.now() - t.pausedAt;
    t.pausedAt = null;
  }
  t.isRunning  = true;
  t.rafId      = requestAnimationFrame(timerTick);
  t.intervalId = setInterval(_updateTimerDisplay, 1000);
}

function stopTimer() {
  const t = state.timer;
  t.isRunning = false;
  if (t.rafId)      { cancelAnimationFrame(t.rafId);  t.rafId      = null; }
  if (t.intervalId) { clearInterval(t.intervalId);    t.intervalId = null; }
}

/* ── Brew screen: step update (called on Next/Back/init) ────────────────────── */
function updateBrewStep() {
  const recipe = state.activeRecipe;
  const t      = state.timer;
  if (!recipe) return;

  const steps     = recipe.steps;
  const totalSteps = steps.length;
  const idx       = t.currentStepIndex;
  const step      = steps[idx];
  if (!step) return;

  // Step counter: show pour number / total pours
  const pourSteps    = steps.filter(s => s.type === 'pour');
  const donePours    = steps.slice(0, idx + 1).filter(s => s.type === 'pour').length;
  const totalPours   = pourSteps.length;

  if (step.type === 'drawdown') {
    DOM.brewStepBig.textContent   = '✓';
    DOM.brewStepSmall.textContent = '';
  } else {
    DOM.brewStepBig.textContent   = donePours || (step.type === 'switch' ? '→' : '1');
    DOM.brewStepSmall.textContent = ` / ${totalPours}`;
  }

  // Progress dots (pour steps only)
  _updateBrewDots(pourSteps, donePours);

  // Cards
  if (step.type === 'drawdown') {
    DOM.brewPourCard.classList.add('hidden');
    DOM.brewDrawCard.classList.remove('hidden');
    DOM.brewDrawCard.style.display = '';
    DOM.brewDrawTitle.textContent  = step.label;
    DOM.brewDrawSub.textContent    = step.instruction;
  } else {
    DOM.brewPourCard.classList.remove('hidden');
    DOM.brewDrawCard.classList.add('hidden');

    if (step.type === 'pour') {
      DOM.brewPourAmt.textContent  = step.pourAmount;
      DOM.brewPourAmt.style.color  = 'var(--color-text)';
    } else {
      // switch step: no pour amount
      DOM.brewPourAmt.textContent  = '—';
      DOM.brewPourAmt.style.color  = 'var(--color-text-muted)';
    }
    DOM.brewCumAmt.textContent   = step.totalAmount;
    DOM.brewPourNote.textContent = step.instruction;
  }

  // Context chip row — Hybrid switch state / Ice hot-ice reminder.
  // OPEN = percolation (water drains), CLOSED = immersion (water held).
  if (recipe.id === 'hybrid' && step.switchState) {
    DOM.brewSwitchRow.classList.remove('hidden');
    DOM.brewSwitchRow.style.display = 'flex';
    if (step.switchState === 'open') {
      DOM.brewSwitchChip.textContent  = 'OPEN';
      DOM.brewSwitchChip.style.background = '#FBF6EC';
      DOM.brewSwitchChip.style.border     = '1px solid #D9C3A6';
      DOM.brewSwitchChip.style.color      = '#8C5535';
      DOM.brewSwitchDesc.textContent  = 'スイッチ開・湯が落ちています（透過）';
    } else {
      DOM.brewSwitchChip.textContent  = 'CLOSED';
      DOM.brewSwitchChip.style.background = '#8C5535';
      DOM.brewSwitchChip.style.border     = '1px solid #8C5535';
      DOM.brewSwitchChip.style.color      = '#FBF4EA';
      DOM.brewSwitchDesc.textContent  = 'スイッチ閉・湯を溜めています（浸漬）';
    }
  } else if (recipe.id === 'ice') {
    DOM.brewSwitchRow.classList.remove('hidden');
    DOM.brewSwitchRow.style.display = 'flex';
    DOM.brewSwitchChip.textContent  = `HOT ${recipe.hotWater}g ・ ICE ${recipe.ice}g`;
    DOM.brewSwitchChip.style.background = '#FBF6EC';
    DOM.brewSwitchChip.style.border     = '1px solid #D9C3A6';
    DOM.brewSwitchChip.style.color      = '#8C5535';
    DOM.brewSwitchDesc.textContent  = '氷はサーバーに先入れ';
  } else {
    // No context for this step (e.g. Hybrid drawdown) — hide instead of
    // letting the previous step's state linger
    DOM.brewSwitchRow.classList.add('hidden');
  }

  // Next step hint
  const nextStep = steps[idx + 1];
  if (nextStep && nextStep.type !== 'drawdown') {
    DOM.brewNextHint.classList.remove('hidden');
    DOM.brewNextHint.style.display = 'flex';
    DOM.brewNextTime.textContent   = formatTime(nextStep.timeSec);
    DOM.brewNextAmt.textContent    = nextStep.pourAmount > 0 ? `${nextStep.pourAmount}g` : '';
    DOM.brewNextTip.textContent    = nextStep.instruction;
  } else if (nextStep && nextStep.type === 'drawdown') {
    DOM.brewNextHint.classList.remove('hidden');
    DOM.brewNextHint.style.display = 'flex';
    DOM.brewNextTime.textContent   = formatTime(nextStep.timeSec);
    DOM.brewNextAmt.textContent    = '';
    DOM.brewNextTip.textContent    = 'ドローダウン待機';
  } else {
    DOM.brewNextHint.classList.add('hidden');
  }

  // Next / Finish button
  const isLast = idx >= totalSteps - 1;
  if (isLast) {
    DOM.brewNextIcon.classList.add('hidden');
    DOM.brewFinishIcon.classList.remove('hidden');
    DOM.brewNextLabel.textContent    = '完了';
    DOM.brewBtnNext.style.background = 'var(--color-accent)';
    DOM.brewBtnNext.style.border     = '1px solid var(--color-accent)';
  } else {
    DOM.brewFinishIcon.classList.add('hidden');
    DOM.brewNextIcon.classList.remove('hidden');
    DOM.brewNextLabel.textContent    = '次へ';
    DOM.brewBtnNext.style.background = 'var(--color-btn-light-bg)';
    DOM.brewBtnNext.style.border     = '1px solid var(--color-border-input)';
  }
}

function _updateBrewDots(pourSteps, donePours) {
  const maxDots = Math.min(pourSteps.length, 10);
  DOM.brewDotsRow.innerHTML = Array.from({ length: maxDots }, (_, i) => {
    const num = i + 1;
    const cls = num < donePours ? 'done' : (num === donePours ? 'active' : 'upcoming');
    const lineBg = i > 0 && i < donePours
      ? 'var(--color-accent-soft)' : 'var(--color-border-card)';
    return `<span class="brew-dot-col">
      <span class="brew-dot-line" style="background:${lineBg};"></span>
      <span class="brew-dot-circle ${cls}"></span>
      <span class="brew-dot-label">${num}</span>
    </span>`;
  }).join('');
}

function _updateBrewPauseUI(running) {
  if (running) {
    DOM.brewPauseIcon.classList.remove('hidden');
    DOM.brewPlayIcon.classList.add('hidden');
    DOM.brewPauseLabel.textContent = '一時停止';
    DOM.brewChipWrap.classList.add('hidden');
  } else {
    DOM.brewPauseIcon.classList.add('hidden');
    DOM.brewPlayIcon.classList.remove('hidden');
    DOM.brewPauseLabel.textContent = '再開';
    DOM.brewChipWrap.classList.remove('hidden');
    DOM.brewChipWrap.style.display = 'flex';
    DOM.brewChip.textContent = 'PAUSED';
  }
}

/* ── Brew: initialize and start ─────────────────────────────────────────────── */
function initBrew(recipe) {
  state.activeRecipe = recipe;
  const t = state.timer;
  t.startedAt        = null;
  t.pausedAt         = null;
  t.pausedDurationMs = 0;
  t.elapsedSec       = 0;
  t.currentStepIndex = 0;
  t.isRunning        = false;
  t.isFinished       = false;
  t.rafId            = null;
  t.intervalId       = null;
  t.startedAtWall    = null;
  t.finishedAtWall   = null;

  state.log = { rating: 0, tags: [] };

  // Brew screen method header
  const m = METHODS[recipe.id];
  DOM.brewMethodIcon.innerHTML    = methodImgHTML(recipe.id, 32);
  DOM.brewMethodName.textContent  = recipe.name;
  DOM.brewMethodSub.textContent   = m.sub;

  // Ice Brew counts hot water only — say so in the cumulative header
  document.getElementById('brew-cum-label').textContent =
    recipe.id === 'ice' ? '累計（湯のみ）' : '累計';

  // Reset timer display
  DOM.brewTimeDisplay.textContent = '0:00';
  const circ = (2 * Math.PI * 112).toFixed(1);
  DOM.brewArc.setAttribute('stroke-dasharray', `0 ${circ}`);

  // Initial step and pause UI
  updateBrewStep();
  _updateBrewPauseUI(false);

  showScreen('brew');

  // Auto-start timer
  startTimer();
  _updateBrewPauseUI(true);
}

/* ── Home screen ────────────────────────────────────────────────────────────── */
// Home subcopy uses word-break: keep-all, so insert <wbr> after Japanese
// punctuation to allow line breaks only at natural phrase boundaries.
// Display-only transform — METHODS data itself stays plain text.
function homeSubHTML(sub) {
  return sub
    .replace(/、/g, '、<wbr>')
    .replace(/・/g, '・<wbr>')
    .replace(/ \+ /g, ' + '); // keep "浸漬 + 透過" style pairs on one line
}

function renderHome() {
  const container = document.getElementById('method-list');
  if (!container) return;

  const selId  = state.selectedMethodId;
  const selIdx = METHOD_ORDER.indexOf(selId);
  let html = '';

  METHOD_ORDER.forEach((id, idx) => {
    const m = METHODS[id];
    if (idx === selIdx) {
      const metersHTML = m.meters.map(mt =>
        `<span class="meter-chip">
          <span class="meter-chip-label">${mt.label}</span>
          <span class="meter-dots">
            ${mt.dots.map(f => `<span class="meter-dot ${f ? 'filled' : 'empty'}"></span>`).join('')}
          </span>
        </span>`
      ).join('');
      html += `<div class="method-selected-card">
        <div style="display:flex;gap:14px;">
          <span style="display:inline-flex;flex-shrink:0;margin-top:4px;">${methodImgHTML(id, 46)}</span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;">
              <span style="font-family:var(--font-serif);font-size:13px;color:var(--color-text-faint);">${m.num}</span>
              <span style="font-size:11px;color:var(--color-text-faint);margin-left:10px;white-space:nowrap;">目安 ${m.time}</span>
              <span style="flex:1;"></span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>
            </div>
            <div class="method-selected-name">${m.name}</div>
            <div class="method-selected-sub">${homeSubHTML(m.sub)}</div>
          </div>
        </div>
        <div class="meters-row">${metersHTML}</div>
        <div style="font-size:13px;color:var(--color-text-mid);margin-top:13px;">${m.desc}</div>
        <button id="btn-go-setup" class="btn-primary btn-primary-dark" style="margin-top:14px;">
          レシピ設定へ
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E8C7A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></svg>
        </button>
      </div>`;
    } else {
      html += `<div class="method-row" data-method-id="${id}">
        <span class="method-row-icon">${methodImgHTML(id, 34)}</span>
        <span class="method-row-num">${m.num}</span>
        <span class="method-row-text">
          <span class="method-row-name">${m.name}</span>
          <span class="method-row-sub">${homeSubHTML(m.sub)}</span>
        </span>
        <span class="method-row-time">${m.time}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
      </div>`;
    }
  });

  container.innerHTML = html;

  document.getElementById('btn-go-setup')?.addEventListener('click', () => {
    state.rebrewFrom = null;
    renderSetup();
    showScreen('setup');
  });
  container.querySelectorAll('.method-row').forEach(row => {
    row.addEventListener('click', () => {
      state.selectedMethodId = row.dataset.methodId;
      renderHome();
    });
  });
}

/* ── Setup screen ───────────────────────────────────────────────────────────── */
function renderSetup() {
  const m = METHODS[state.selectedMethodId];
  const d = state.draft;

  document.getElementById('setup-method-icon').innerHTML    = methodImgHTML(m.id, 40);
  document.getElementById('setup-method-name').textContent  = m.name;
  document.getElementById('setup-method-sub').textContent   = m.sub;
  document.getElementById('dose-display').textContent       = d.dose;

  document.getElementById('flavor-card').style.display   = m.hasFlavorStrength ? '' : 'none';
  document.getElementById('strength-card').style.display = m.hasFlavorStrength ? '' : 'none';
  document.getElementById('hybrid-card').style.display   = m.id === 'hybrid'   ? '' : 'none';
  document.getElementById('neo-card').style.display      = m.id === 'neo'       ? '' : 'none';
  document.getElementById('ice-card').style.display      = m.id === 'ice'       ? '' : 'none';
  // Ice Brew uses a fixed formula (ratio is ignored), so hide the ratio card
  document.getElementById('ratio-card').style.display    = m.id === 'ice'       ? 'none' : '';

  if (m.id === 'ice') {
    const hot = Math.round(d.dose * 7.5);
    const ice = Math.round(d.dose * 4);
    document.getElementById('ice-hot-display').textContent = hot;
    document.getElementById('ice-ice-display').textContent = ice;
  }

  updateRatioChips();
  updateFlavorChips();
  updateStrengthChips();
  renderSetupSummary();
}

function renderSetupSummary() {
  const d = state.draft;
  const recipe = RecipeEngine.build(state.selectedMethodId, d.dose, d.ratio, d.flavor, d.strength);
  document.getElementById('setup-summary-grid').innerHTML = buildSummaryCols(recipe);
}

function updateRatioChips() {
  const d = state.draft;
  document.querySelectorAll('#ratio-chips .chip-btn').forEach(btn => {
    const isActive = !d.customRatio && parseInt(btn.dataset.ratio) === d.ratio;
    btn.className = `chip-btn chip-ratio ${isActive ? 'active' : 'inactive'}`;
  });
  document.getElementById('custom-ratio-display').textContent = `1:${d.ratio}`;
  document.getElementById('btn-custom-ratio').style.color =
    d.customRatio ? 'var(--color-accent)' : 'var(--color-text-muted)';

  const customRow = document.getElementById('custom-ratio-row');
  if (d.customRatio) {
    customRow.classList.remove('hidden');
    customRow.style.display = 'flex';
  } else {
    customRow.classList.add('hidden');
  }
}

function updateFlavorChips() {
  document.querySelectorAll('#flavor-chips .chip-btn').forEach(btn => {
    btn.className = `chip-btn ${btn.dataset.flavor === state.draft.flavor ? 'active' : 'inactive'}`;
  });
}

function updateStrengthChips() {
  document.querySelectorAll('#strength-chips .chip-btn').forEach(btn => {
    btn.className = `chip-btn ${btn.dataset.strength === state.draft.strength ? 'active' : 'inactive'}`;
  });
}

/* ── Preview screen ─────────────────────────────────────────────────────────── */
function renderPreview() {
  const m = METHODS[state.selectedMethodId];
  const d = state.draft;

  // Build recipe once — same object will be passed to Active Brew
  const recipe = RecipeEngine.build(m.id, d.dose, d.ratio, d.flavor, d.strength);
  state._previewRecipe = recipe;  // stash for Start Brew button

  document.getElementById('preview-method-icon').innerHTML    = methodImgHTML(m.id, 40);
  document.getElementById('preview-method-name').textContent  = recipe.name;
  document.getElementById('preview-method-sub').textContent   = m.sub;

  const banner   = document.getElementById('rebrew-banner');
  const noteCard = document.getElementById('rebrew-next-note-card');
  if (state.rebrewFrom) {
    banner.classList.remove('hidden');
    document.getElementById('rebrew-banner-text').textContent =
      `履歴から再現 ・ ${state.rebrewFrom.date} の記録`;
    if (state.rebrewFrom.nextNote) {
      noteCard.classList.remove('hidden');
      document.getElementById('rebrew-next-note-text').textContent = state.rebrewFrom.nextNote;
    } else {
      noteCard.classList.add('hidden');
    }
  } else {
    banner.classList.add('hidden');
    noteCard.classList.add('hidden');
  }

  const flavorContainer = document.getElementById('preview-flavor-chips');
  if (m.hasFlavorStrength) {
    flavorContainer.innerHTML =
      `<span class="tag-chip">${FLAVOR_LABELS[d.flavor]}</span>` +
      `<span class="tag-chip">${STRENGTH_LABELS[d.strength]}</span>`;
  } else {
    flavorContainer.innerHTML = '';
  }

  document.getElementById('preview-summary-grid').innerHTML = buildSummaryCols(recipe);
  document.getElementById('preview-steps-list').innerHTML   = buildStepsHTML(recipe.steps);

  const drawLabel = document.getElementById('preview-draw-label');
  drawLabel.textContent = `ドローダウン目安 ${formatTime(recipe.targetDrawdownSec)}`;

  const checklist = document.getElementById('preview-checklist');
  checklist.innerHTML = m.checklist.map(item =>
    `<div class="checklist-item"><span class="checklist-dot"></span><span>${item}</span></div>`
  ).join('');
}

function clearLogEquipmentInputs() {
  ['log-bean', 'log-grind', 'log-temperature', 'log-equipment', 'log-actual-drawdown'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

/* ── Brew Log screen ────────────────────────────────────────────────────────── */
function renderLog() {
  const recipe = state.activeRecipe || RecipeEngine.build(
    state.selectedMethodId, state.draft.dose, state.draft.ratio,
    state.draft.flavor, state.draft.strength
  );
  const m = METHODS[recipe.id];

  document.getElementById('log-method-label').textContent = recipe.name;
  document.getElementById('log-method-icon').innerHTML    = methodImgHTML(recipe.id, 40);
  document.getElementById('log-method-name').textContent  = recipe.name;
  document.getElementById('log-method-sub').textContent   = m.sub;
  document.getElementById('log-summary-grid').innerHTML   = buildSummaryCols(recipe);

  const ratingContainer = document.getElementById('log-rating-dots');
  ratingContainer.innerHTML = Array.from({ length: 5 }, (_, i) => {
    const selected = i < state.log.rating;
    return `<button class="rating-dot-btn" data-rating="${i + 1}">
      <span class="rating-dot ${selected ? 'selected' : ''}"></span>
    </button>`;
  }).join('');
  document.getElementById('log-rate-label').textContent =
    state.log.rating
      ? `${state.log.rating} / 5 ・ ${RATING_LABELS[state.log.rating]}`
      : '未評価（タップで設定）';
  ratingContainer.querySelectorAll('.rating-dot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = parseInt(btn.dataset.rating);
      // Tapping the current rating again clears it (saved as null via normalizeRating)
      state.log.rating = state.log.rating === v ? 0 : v;
      renderLog();
    });
  });

  const tagContainer = document.getElementById('log-taste-tags');
  tagContainer.innerHTML = TASTE_TAGS.map(tag => {
    const active = state.log.tags.includes(tag);
    return `<button class="chip-btn ${active ? 'active' : 'inactive'}" style="height:38px;padding:0 15px;font-size:12.5px;" data-tag="${tag}">${tag}</button>`;
  }).join('');
  tagContainer.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      const idx = state.log.tags.indexOf(tag);
      if (idx === -1) state.log.tags.push(tag);
      else            state.log.tags.splice(idx, 1);
      renderLog();
    });
  });
}

/* ── History screen ─────────────────────────────────────────────────────────── */
function renderHistory() {
  const history = state.history;

  if (!history.length) {
    document.getElementById('history-content').classList.add('hidden');
    document.getElementById('history-empty').classList.remove('hidden');
    return;
  }

  document.getElementById('history-content').classList.remove('hidden');
  document.getElementById('history-empty').classList.add('hidden');

  const feat = history[0];
  const fm   = METHODS[feat.methodId] || METHODS['yon-roku'];
  const featRecipe = feat.recipe?.steps?.length
    ? feat.recipe
    : RecipeEngine.build(feat.methodId, feat.dose, feat.ratio || 15,
        feat.recipe?.flavor || feat.flavor || 'balanced',
        feat.recipe?.strength || feat.strength || 'standard');

  document.getElementById('hist-feat-icon').innerHTML    = methodImgHTML(feat.methodId, 40);
  document.getElementById('hist-feat-name').textContent  = feat.methodName || fm.name;
  document.getElementById('hist-feat-sub').textContent   = fm.sub;
  document.getElementById('hist-feat-date').textContent  = _formatDate(feat.completedAt || feat.createdAt || feat.date);
  document.getElementById('hist-feat-summary').innerHTML = buildSummaryCols(featRecipe);

  const featTags = feat.log?.tags || feat.tags || [];
  const featNote = feat.log?.note || feat.note || '';

  const tagsRow = document.getElementById('hist-feat-tags-row');
  const tagsEl  = document.getElementById('hist-feat-tags');
  if (featTags.length) {
    tagsRow.classList.remove('hidden');
    tagsEl.innerHTML = featTags.map(t => `<span class="tag-chip">${t}</span>`).join('');
  } else {
    tagsRow.classList.add('hidden');
  }

  const noteRow = document.getElementById('hist-feat-note-row');
  const noteEl  = document.getElementById('hist-feat-note');
  if (featNote) {
    noteRow.classList.remove('hidden');
    noteEl.textContent = featNote;
  } else {
    noteRow.classList.add('hidden');
  }

  const listEl = document.getElementById('history-list');
  listEl.innerHTML = history.slice(1).map(h => {
    const hm      = METHODS[h.methodId] || METHODS['yon-roku'];
    const hRating = h.log?.rating ?? h.rating ?? null;
    const hTags   = h.log?.tags   || h.tags   || [];
    const dateStr = _formatDate(h.completedAt || h.createdAt || h.date);

    // Ice Brew: show HOT/ICE instead of total water
    let meta;
    if (h.methodId === 'ice' || h.ratio === null) {
      const hr = h.recipe || {};
      meta = (hr.hotWater != null && hr.ice != null)
        ? `${h.dose}g ｜ HOT ${hr.hotWater}g / ICE ${hr.ice}g`
        : `${h.dose}g ｜ Ice Brew`;
    } else {
      const water = h.recipe?.totalWater ?? Math.round(h.dose * h.ratio);
      meta = `${h.dose}g ｜ ${water}ml`;
    }

    const stars = Array.from({ length: 5 }, (_, i) =>
      `<span class="rating-star ${hRating !== null && i < hRating ? 'filled' : ''}"></span>`
    ).join('');
    const ratingDisp = hRating !== null
      ? `<span style="display:inline-flex;gap:3px;">${stars}</span>`
      : `<span style="font-size:10.5px;color:var(--color-text-faint);border:1px dashed #D5C8B0;border-radius:var(--radius-pill);padding:2px 8px;white-space:nowrap;">未評価</span>`;
    const tags = hTags.slice(0, 2).map(t => `<span class="tag-chip">${t}</span>`).join('');

    return `<div class="history-row" data-history-id="${h.id}">
      <span style="display:inline-flex;flex-shrink:0;">${methodImgHTML(h.methodId, 30)}</span>
      <span style="flex:1;min-width:0;">
        <span style="display:flex;align-items:baseline;gap:8px;">
          <span style="font-family:var(--font-serif);font-weight:600;font-size:16px;color:var(--color-text);">${h.methodName || hm.name}</span>
          <span style="font-size:10.5px;color:var(--color-text-faint);white-space:nowrap;">${dateStr}</span>
        </span>
        <span style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <span style="font-family:var(--font-serif);font-size:12.5px;color:var(--color-text-muted);white-space:nowrap;">${meta}</span>
          ${ratingDisp}
        </span>
      </span>
      <span class="history-tags">${tags}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    </div>`;
  }).join('');

  listEl.querySelectorAll('.history-row').forEach(row => {
    row.addEventListener('click', () => {
      state.currentDetailId = row.dataset.historyId;
      renderDetail();
      showScreen('detail');
    });
  });
}

/* ── History Detail screen ──────────────────────────────────────────────────── */
function renderDetail() {
  const entry = state.history.find(h => h.id === state.currentDetailId) || state.history[0];
  if (!entry) return;

  const m = METHODS[entry.methodId] || METHODS['yon-roku'];

  // Prefer persisted recipe snapshot; fallback to rebuilding
  const flavor   = entry.recipe?.flavor   || entry.flavor   || 'balanced';
  const strength = entry.recipe?.strength || entry.strength || 'standard';
  const recipe   = entry.recipe?.steps?.length
    ? entry.recipe
    : RecipeEngine.build(entry.methodId, entry.dose, entry.ratio || 15, flavor, strength);

  const dateStr  = _formatDate(entry.completedAt || entry.createdAt || entry.date);
  const rating   = entry.log?.rating ?? entry.rating ?? null;
  const tags     = entry.log?.tags   || entry.tags   || [];
  const note     = entry.log?.note   || entry.note   || '';
  const nextNote = entry.log?.nextNote || entry.nextNote || '';

  document.getElementById('detail-date-label').textContent  = dateStr;
  document.getElementById('detail-icon').innerHTML           = methodImgHTML(entry.methodId, 38);
  document.getElementById('detail-name').textContent         = entry.methodName || m.name;
  document.getElementById('detail-sub').textContent          = m.sub;
  document.getElementById('detail-rating').innerHTML         = rating !== null
    ? buildRatingStars(rating)
    : '<span style="font-size:12px;color:var(--color-text-faint);">未評価</span>';
  document.getElementById('detail-summary-grid').innerHTML   = buildSummaryCols(recipe);
  document.getElementById('detail-steps-list').innerHTML     = buildStepsHTML(recipe.steps);

  const nextCard = document.getElementById('detail-next-note-card');
  if (nextNote) {
    nextCard.classList.remove('hidden');
    document.getElementById('detail-next-note-text').textContent = nextNote;
  } else {
    nextCard.classList.add('hidden');
  }

  const flavorChips = document.getElementById('detail-flavor-chips');
  if (m.hasFlavorStrength && flavor && strength) {
    flavorChips.innerHTML =
      `<span class="tag-chip">${FLAVOR_LABELS[flavor] || flavor}</span>` +
      `<span class="tag-chip">${STRENGTH_LABELS[strength] || strength}</span>`;
  } else {
    flavorChips.innerHTML = '';
  }

  const tagsCard = document.getElementById('detail-tags-card');
  const tagsList = document.getElementById('detail-tags-list');
  if (tags.length) {
    tagsCard.classList.remove('hidden');
    tagsList.innerHTML = tags.map(t => `<span class="tag-chip tag-chip-lg">${t}</span>`).join('');
  } else {
    tagsCard.classList.add('hidden');
  }

  const memoCard = document.getElementById('detail-memo-card');
  if (note) {
    memoCard.classList.remove('hidden');
    document.getElementById('detail-memo-text').textContent = note;
  } else {
    memoCard.classList.add('hidden');
  }

  const eq = entry.log || entry.equip || {};
  document.getElementById('detail-equip-bean').textContent     = eq.bean           || '—';
  document.getElementById('detail-equip-grind').textContent    = eq.grind          || '—';
  document.getElementById('detail-equip-temp').textContent     = eq.temperature    || eq.temp    || '—';
  document.getElementById('detail-equip-dripper').textContent  = eq.equipment      || eq.dripper || '—';
  document.getElementById('detail-equip-drawdown').textContent = eq.actualDrawdown || '—';
}

/* ── Settings screen ────────────────────────────────────────────────────────── */
function renderSettings() {
  const s = state.settings;
  document.getElementById('sett-method-val').textContent = METHOD_DISPLAY_NAMES[s.defMethodId];
  document.getElementById('sett-dose-val').textContent   = `${s.defDose}g`;
  document.getElementById('sett-ratio-val').textContent  = `1:${s.defRatio}`;
  document.getElementById('sett-history-count').textContent = `${state.history.length}件の記録`;

  ['wake', 'sound', 'haptic'].forEach(key => {
    const track = document.getElementById(`toggle-${key}`);
    if (track) {
      if (s[key]) track.classList.add('on');
      else        track.classList.remove('on');
    }
  });

  // Persist after every render that reflects a change
  safeWriteSettings(s);
}

/* ── Confirm dialog (shared bottom sheet) ───────────────────────────────────── */
// Single overlay reused by Clear History and Brew Log close — the OK action is
// swapped per caller instead of adding new dialog markup.
let _confirmOnOk = null;

function showConfirm({ title, body, okText, onOk }) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-body').innerHTML    = body;
  document.getElementById('btn-confirm-ok').textContent = okText;
  _confirmOnOk = onOk;
  document.getElementById('confirm-overlay').classList.remove('hidden');
}

function hideConfirm() {
  document.getElementById('confirm-overlay').classList.add('hidden');
  _confirmOnOk = null;
}

// True when the Brew Log screen has any unsaved user input
function _logHasInput() {
  if (state.log.rating || state.log.tags.length) return true;
  return ['log-memo', 'log-next-note', 'log-bean', 'log-grind',
          'log-temperature', 'log-equipment', 'log-actual-drawdown']
    .some(id => (document.getElementById(id)?.value || '').trim() !== '');
}

/* ── Toast ──────────────────────────────────────────────────────────────────── */
let _toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

/* ── Export helpers ─────────────────────────────────────────────────────────── */
function _exportFilename(ext) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const ts  = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `pouro-fable5-history-${ts}.${ext}`;
}

function _downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON() {
  const history = safeReadHistory();
  if (!history.length) { showToast('書き出す履歴がありません'); return; }

  const payload = {
    app:          'Pouro-Fable5',
    schemaVersion: 1,
    exportedAt:   new Date().toISOString(),
    historyCount: history.length,
    history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  _downloadBlob(blob, _exportFilename('json'));
  showToast('JSONを書き出しました');
}

function _csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCSV() {
  const history = safeReadHistory();
  if (!history.length) { showToast('書き出す履歴がありません'); return; }

  const cols = ['id','completedAt','methodId','methodName','dose','ratio',
                'totalWater','hotWater','ice','elapsedSec',
                'rating','tags','note','nextNote','actualDrawdown',
                'bean','grind','temperature','equipment'];

  const rows = [cols.join(',')];
  history.forEach(h => {
    const log = h.log || {};
    const row = [
      h.id,
      h.completedAt || h.createdAt || '',
      h.methodId,
      h.methodName || '',
      h.dose,
      h.ratio !== null && h.ratio !== undefined ? h.ratio : '',
      h.recipe?.totalWater ?? '',
      h.recipe?.hotWater   ?? '',
      h.recipe?.ice        ?? '',
      h.brew?.elapsedSec   ?? '',
      log.rating !== null && log.rating !== undefined ? log.rating : '',
      (log.tags || []).join('|'),
      log.note           || '',
      log.nextNote       || '',
      log.actualDrawdown || '',
      log.bean           || '',
      log.grind       || '',
      log.temperature || '',
      log.equipment   || '',
    ].map(_csvEscape).join(',');
    rows.push(row);
  });

  const bom  = '﻿';
  const blob = new Blob([bom + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  _downloadBlob(blob, _exportFilename('csv'));
  showToast('CSVを書き出しました');
}

/* ── Clear history ──────────────────────────────────────────────────────────── */
function safeClearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.history);
    return true;
  } catch (err) {
    console.warn('[Pouro] Failed to clear history:', err);
    return false;
  }
}

/* ── Rebrew helper ──────────────────────────────────────────────────────────── */
function _applyRebrewEntry(entry) {
  state.selectedMethodId    = entry.methodId;
  state.draft.dose          = entry.dose;
  state.draft.ratio         = entry.ratio !== null ? entry.ratio : 15;
  state.draft.flavor        = entry.recipe?.flavor   || entry.flavor   || 'balanced';
  state.draft.strength      = entry.recipe?.strength || entry.strength || 'standard';
  state.draft.customRatio   = false;
  const dateStr             = _formatDate(entry.completedAt || entry.createdAt || entry.date);
  state.rebrewFrom          = {
    id: entry.id,
    date: dateStr,
    nextNote: entry.log?.nextNote || entry.nextNote || '',
  };
  renderPreview();
  showScreen('preview');
}

/* ── Public API ─────────────────────────────────────────────────────────────── */
window.App = {
  toggleSetting(key) {
    state.settings[key] = !state.settings[key];
    renderSettings();
  },
};

/* ── Event wiring ───────────────────────────────────────────────────────────── */
function wireEvents() {
  // Tab bar
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab === 'brew') {
        renderHome();
        showScreen('home');
      } else if (tab === 'history') {
        renderHistory();
        showScreen('history');
      } else if (tab === 'settings') {
        renderSettings();
        showScreen('settings');
      }
    });
  });

  // Setup ← back
  document.getElementById('btn-setup-back').addEventListener('click', () => {
    showScreen('home');
  });

  // Setup — dose spinner
  document.getElementById('btn-dose-dec').addEventListener('click', () => {
    if (state.draft.dose > 10) { state.draft.dose--; renderSetup(); }
  });
  document.getElementById('btn-dose-inc').addEventListener('click', () => {
    if (state.draft.dose < 40) { state.draft.dose++; renderSetup(); }
  });

  // Setup — ratio chips
  document.getElementById('ratio-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip-btn');
    if (!btn) return;
    state.draft.ratio       = parseInt(btn.dataset.ratio);
    state.draft.customRatio = false;
    renderSetup();
  });

  document.getElementById('btn-custom-ratio').addEventListener('click', () => {
    state.draft.customRatio = !state.draft.customRatio;
    updateRatioChips();
  });
  document.getElementById('btn-ratio-dec').addEventListener('click', () => {
    if (state.draft.ratio > 10) { state.draft.ratio--; renderSetup(); }
  });
  document.getElementById('btn-ratio-inc').addEventListener('click', () => {
    if (state.draft.ratio < 20) { state.draft.ratio++; renderSetup(); }
  });

  // Setup — flavor / strength chips
  document.getElementById('flavor-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip-btn');
    if (btn) { state.draft.flavor = btn.dataset.flavor; updateFlavorChips(); renderSetupSummary(); }
  });
  document.getElementById('strength-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip-btn');
    if (btn) { state.draft.strength = btn.dataset.strength; updateStrengthChips(); renderSetupSummary(); }
  });

  // Setup → Preview
  document.getElementById('btn-go-preview').addEventListener('click', () => {
    renderPreview();
    showScreen('preview');
  });

  // Preview ← back
  document.getElementById('btn-preview-back').addEventListener('click', () => {
    showScreen('setup');
  });

  // Preview → Start brew
  // Passes the already-built recipe from renderPreview() to initBrew
  document.getElementById('btn-start-brew').addEventListener('click', () => {
    const recipe = state._previewRecipe ||
      RecipeEngine.build(state.selectedMethodId, state.draft.dose, state.draft.ratio,
        state.draft.flavor, state.draft.strength);
    initBrew(recipe);
  });

  // Brew — Pause / Resume
  document.getElementById('btn-brew-pause').addEventListener('click', () => {
    const t = state.timer;
    if (t.isRunning) {
      pauseTimer();
      _updateBrewPauseUI(false);
    } else {
      resumeTimer();
      _updateBrewPauseUI(true);
    }
  });

  // Brew — Back (previous step or abandon)
  document.getElementById('btn-brew-back').addEventListener('click', () => {
    const t = state.timer;
    if (t.currentStepIndex === 0) {
      // At first step — abandon brew, return to preview
      stopTimer();
      state.activeRecipe = null;
      showScreen('preview');
      return;
    }
    // Go to previous step
    t.currentStepIndex = Math.max(0, t.currentStepIndex - 1);
    const prevStep = state.activeRecipe.steps[t.currentStepIndex];

    // PR-003: snap elapsed time to the target step's timeSec on Back.
    // This is a simplification — a more precise rewind implementation is deferred to PR-004.
    if (t.startedAt !== null && prevStep.timeSec >= 0) {
      const now = performance.now();
      t.startedAt = now - prevStep.timeSec * 1000 - t.pausedDurationMs;
      t.elapsedSec = prevStep.timeSec;
    }
    updateBrewStep();
  });

  // Brew — Next step / Finish
  document.getElementById('btn-brew-next').addEventListener('click', () => {
    const t      = state.timer;
    const recipe = state.activeRecipe;
    if (!recipe) return;

    const steps = recipe.steps;
    if (t.currentStepIndex < steps.length - 1) {
      t.currentStepIndex++;
      updateBrewStep();
    } else {
      // Final step — finish brew
      stopTimer();
      t.isFinished      = true;
      t.finishedAtWall  = Date.now();

      // Create in-memory brew result draft.
      // PR-003 creates an in-memory brew result draft.
      // Persistence will be implemented in PR-004.
      state.brewResultDraft = {
        methodId:     recipe.id,
        method:       recipe.name,
        dose:         recipe.dose,
        ratio:        recipe.ratio,
        totalWater:   recipe.totalWater,
        hotWater:     recipe.hotWater  || null,
        ice:          recipe.ice       || null,
        steps:        recipe.steps,
        elapsedSec:   t.elapsedSec,
        startedAt:    t.startedAtWall,
        finishedAt:   t.finishedAtWall,
        completedAt:  new Date(t.finishedAtWall || Date.now()).toISOString(),
      };

      clearLogEquipmentInputs();
      renderLog();
      showScreen('log');
    }
  });

  // Log — close without saving (PR-011A)
  // Brew Log is a post-brew record screen, so the header control closes to Home
  // instead of going back to the finished Timer. Skipping the record on purpose
  // is a supported choice — nothing is written to history.
  document.getElementById('btn-log-close').addEventListener('click', () => {
    const goHome = () => {
      renderHome();
      showScreen('home');
    };
    if (_logHasInput()) {
      showConfirm({
        title:  '記録せずに閉じますか？',
        body:   '入力中の内容は保存されません。',
        okText: '閉じる',
        onOk:   goHome,
      });
    } else {
      goHome();
    }
  });

  // Log — Save  [PR-004: real localStorage persistence]
  document.getElementById('btn-save-log').addEventListener('click', () => {
    const recipe   = state.activeRecipe;
    const draft    = state.brewResultDraft || {};
    const methodId = recipe?.id || state.selectedMethodId;
    const completedAt = draft.completedAt || new Date().toISOString();

    const entry = {
      schemaVersion: 1,
      id:          `h_${Date.now()}`,
      createdAt:   completedAt,
      completedAt,
      methodId,
      methodName:  recipe?.name || METHOD_DISPLAY_NAMES[methodId] || methodId,
      dose:        recipe?.dose     || state.draft.dose,
      ratio:       recipe?.ratio    ?? null,
      recipe:      recipe           || RecipeEngine.build(methodId, state.draft.dose, state.draft.ratio,
                     state.draft.flavor, state.draft.strength),
      brew: {
        elapsedSec: draft.elapsedSec  || 0,
        startedAt:  draft.startedAt   || null,
        finishedAt: draft.finishedAt  || null,
      },
      log: {
        rating:      normalizeRating(state.log.rating),
        tags:        [...state.log.tags],
        note:           document.getElementById('log-memo').value.trim(),
        nextNote:       document.getElementById('log-next-note').value.trim(),
        actualDrawdown: document.getElementById('log-actual-drawdown')?.value.trim() || '',
        bean:           document.getElementById('log-bean').value.trim(),
        grind:          document.getElementById('log-grind').value.trim(),
        temperature:    document.getElementById('log-temperature').value.trim(),
        equipment:      document.getElementById('log-equipment').value.trim(),
      },
    };

    state.history.unshift(entry);
    const saved = safeWriteHistory(state.history);

    if (saved) {
      showToast('履歴に保存しました');
      setTimeout(() => {
        renderHistory();
        showScreen('history');
      }, 600);
    } else {
      showToast('保存できませんでした。端末のストレージ容量を確認してください。');
    }
  });

  // History — featured detail
  document.getElementById('btn-hist-detail').addEventListener('click', () => {
    state.currentDetailId = state.history[0]?.id;
    renderDetail();
    showScreen('detail');
  });

  // History — featured rebrew
  document.getElementById('btn-hist-rebrew').addEventListener('click', () => {
    const entry = state.history[0];
    if (entry) _applyRebrewEntry(entry);
  });

  // Detail ← back
  document.getElementById('btn-detail-back').addEventListener('click', () => {
    showScreen('history');
  });

  // Detail — rebrew
  document.getElementById('btn-detail-rebrew').addEventListener('click', () => {
    const entry = state.history.find(h => h.id === state.currentDetailId);
    if (entry) _applyRebrewEntry(entry);
  });

  // Settings — method cycle
  document.getElementById('sett-method-row').addEventListener('click', () => {
    const idx = METHOD_ORDER.indexOf(state.settings.defMethodId);
    state.settings.defMethodId = METHOD_ORDER[(idx + 1) % METHOD_ORDER.length];
    renderSettings();
  });

  // Settings — dose / ratio
  document.getElementById('sett-dose-dec').addEventListener('click', () => {
    if (state.settings.defDose > 10) { state.settings.defDose--; renderSettings(); }
  });
  document.getElementById('sett-dose-inc').addEventListener('click', () => {
    if (state.settings.defDose < 40) { state.settings.defDose++; renderSettings(); }
  });
  document.getElementById('sett-ratio-dec').addEventListener('click', () => {
    if (state.settings.defRatio > 10) { state.settings.defRatio--; renderSettings(); }
  });
  document.getElementById('sett-ratio-inc').addEventListener('click', () => {
    if (state.settings.defRatio < 20) { state.settings.defRatio++; renderSettings(); }
  });

  // Settings — export
  document.getElementById('btn-export-json').addEventListener('click', () => exportJSON());
  document.getElementById('btn-export-csv').addEventListener('click',  () => exportCSV());

  // Settings — clear history (removes the history key only; settings stay)
  const confirmOverlay = document.getElementById('confirm-overlay');
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    showConfirm({
      title:  '履歴を消去しますか？',
      body:   `保存済みの抽出履歴 ${state.history.length}件をこの端末から削除します。<br>この操作は元に戻せません。`,
      okText: '消去する',
      onOk:   () => {
        const ok = safeClearHistory();
        if (ok) {
          state.history = [];
          renderHistory();
          renderSettings();
          showToast('履歴を消去しました');
        } else {
          showToast('履歴を消去できませんでした');
        }
      },
    });
  });
  document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
    hideConfirm();
  });
  // Backdrop tap cancels (taps inside the sheet don't reach the backdrop)
  confirmOverlay.addEventListener('click', e => {
    if (e.target === confirmOverlay) hideConfirm();
  });
  document.getElementById('btn-confirm-ok').addEventListener('click', () => {
    const onOk = _confirmOnOk;
    hideConfirm();
    if (onOk) onOk();
  });
}

/* ── Boot ───────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();

  // Load persisted settings and apply to state
  const savedSettings = safeReadSettings();
  state.settings = savedSettings;

  // Apply default brew to draft so Recipe Setup opens with saved defaults
  state.draft.dose     = savedSettings.defDose;
  state.draft.ratio    = savedSettings.defRatio;
  state.draft.flavor   = savedSettings.defFlavor;
  state.draft.strength = savedSettings.defStrength;
  state.selectedMethodId = savedSettings.defMethodId;

  state.history = safeReadHistory();

  renderHome();
  renderHistory();
  renderSettings();
  wireEvents();
  showScreen('home');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
