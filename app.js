/* =============================================================================
   Pourō — app.js
   PR-002: Static app shell + screen navigation

   STUB SCOPE — the following are UI navigation mock/stubs only, NOT real implementations:
   - history save/clear: in-memory array, no localStorage persistence (→ PR-004)
   - export (JSON/CSV): toast placeholder only (→ PR-005)
   - clear history: in-memory only (→ PR-005)
   - timer: static step display only, no real countdown (→ PR-003)
   - recipe engine: hardcoded buildSteps() per method (→ PR-003)
   ============================================================================= */

'use strict';

/* ── Method definitions ─────────────────────────────────────────────────────── */
const METHODS = {
  'yon-roku': {
    id: 'yon-roku',
    num: '4:6',
    name: '4:6 Method',
    sub: '前半で味、後半で濃度を調節',
    time: '約3:30',
    desc: '前半2投で味の方向を、後半3投で濃度を調整。再現性が高く、風味のコントロールに優れた手法です。',
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
    buildSteps(dose, ratio) {
      const water = dose * ratio;
      const p1 = Math.round(water * 0.2);
      const p2 = Math.round(water * 0.2);
      const rem = water - p1 - p2;
      const p3 = Math.round(rem / 3);
      const p4 = Math.round(rem / 3);
      const p5 = rem - p3 - p4;
      let cum = 0;
      return [
        { time: '0:00', amt: `${p1}g`, note: '1投目：蒸らし', cum: (cum += p1) },
        { time: '0:45', amt: `${p2}g`, note: '2投目：味の方向', cum: (cum += p2) },
        { time: '1:30', amt: `${p3}g`, note: '3投目：濃度調整', cum: (cum += p3) },
        { time: '2:00', amt: `${p4}g`, note: '4投目', cum: (cum += p4) },
        { time: '2:30', amt: `${p5}g`, note: '5投目（最終）', cum: (cum += p5) },
        { time: '3:00', amt: '—', note: 'ドローダウン待機', cum: null, isDraw: true },
      ];
    },
  },

  'hybrid': {
    id: 'hybrid',
    num: 'Hybrid',
    name: 'Hybrid',
    sub: 'HARIO Switch 浸漬 + 透過',
    time: '約3:00',
    desc: 'スイッチを使って浸漬と透過を組み合わせた方法。前半は弁を開いて注湯、後半は弁を閉じて落とします。',
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
      'スイッチを「開」の状態にしてセットしてください',
      'フィルターをリンスし、ドリッパーを温めてください',
      '1:30 でスイッチを「閉」に切り替える準備をしてください',
    ],
    buildSteps(dose, ratio) {
      const water = dose * ratio;
      const p1 = Math.round(water * 0.5);
      const p2 = water - p1;
      let cum = 0;
      return [
        { time: '0:00', amt: `${p1}g`, note: 'OPEN — 浸漬フェーズ', sw: 'OPEN', cum: (cum += p1) },
        { time: '1:30', amt: `${p2}g`, note: 'CLOSED — 透過フェーズ', sw: 'CLOSED', cum: (cum += p2) },
        { time: '2:30', amt: '—', note: 'ドローダウン', cum: null, isDraw: true },
      ];
    },
  },

  'neo': {
    id: 'neo',
    num: '10 Pour',
    name: '10 Pour',
    sub: '均等10回注湯・高再現性',
    time: '約3:30',
    desc: '均等な10回注湯で安定した抽出を実現。第1投は30秒待機、以降は15秒間隔でリズムよく注ぎます。',
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
      '10回分の注湯量を事前に計算してください',
      'テンポよく注ぐための湯ポットを準備してください',
    ],
    buildSteps(dose, ratio) {
      // PR-002 stub timeline: first pour 0:00, wait 30s, then 15s intervals → 0:00/0:30/0:45…2:30, drawdown ~3:30
      const water = dose * ratio;
      const each = Math.round(water / 10);
      let cum = 0;
      const steps = [];
      for (let i = 0; i < 10; i++) {
        const sec = i === 0 ? 0 : 30 + (i - 1) * 15;
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        const amt = i === 9 ? water - cum : each;
        steps.push({ time: `${m}:${String(s).padStart(2,'0')}`, amt: `${amt}g`, note: `第${i+1}投`, cum: (cum += amt) });
      }
      steps.push({ time: '3:30', amt: '—', note: 'ドローダウン目安', cum: null, isDraw: true });
      return steps;
    },
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
      '氷をサーバーにセットしてください（目標量の約1/3）',
      'フィルターをリンスし、ドリッパーを温めてください',
      '通常より湯量を少なくして濃く抽出します',
    ],
    buildSteps(dose, ratio) {
      const total = dose * ratio;
      const hot = Math.round(total * 0.67);
      const p1 = Math.round(hot * 0.25);
      const p2 = Math.round(hot * 0.375);
      const p3 = hot - p1 - p2;
      let cum = 0;
      return [
        { time: '0:00', amt: `${p1}g`, note: '蒸らし（HOT）', cum: (cum += p1) },
        { time: '0:45', amt: `${p2}g`, note: '2投目（HOT）', cum: (cum += p2) },
        { time: '1:30', amt: `${p3}g`, note: '最終投（HOT）', cum: (cum += p3) },
        { time: '2:15', amt: '—', note: '氷の上へ落として急冷', cum: null, isDraw: true },
      ];
    },
  },
};

const METHOD_ORDER = ['yon-roku', 'hybrid', 'neo', 'ice'];

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
  brew: { stepIndex: 1, elapsed: 65, running: false },
  log: { rating: 0, tags: [] },
  history: [...SAMPLE_HISTORY],
  currentDetailId: null,
  settings: {
    defMethodId: 'yon-roku',
    defDose: 20,
    defRatio: 15,
    wake: false,
    sound: true,
    haptic: true,
  },
};

/* ── Taste tags ─────────────────────────────────────────────────────────────── */
const TASTE_TAGS = ['甘い', 'フルーティ', '明るい', 'クリーン', 'ナッツ', 'チョコ', 'スパイシー', 'まろやか'];

const RATING_LABELS = ['', '微妙', 'まあまあ', '良い', 'とても良い', '最高'];
const FLAVOR_LABELS = { sweet: '甘め', balanced: 'バランス', bright: '明るめ' };
const STRENGTH_LABELS = { light: 'ライト', standard: '標準', strong: 'リッチ' };
const METHOD_DISPLAY_NAMES = {
  'yon-roku': '4:6 Method', 'hybrid': 'Hybrid', 'neo': '10 Pour', 'ice': 'Ice Brew',
};

/* ── SVG helpers ─────────────────────────────────────────────────────────────── */
function iconSvgFor(methodId, size = 26) {
  const s = size;
  const m = METHODS[methodId];
  return m ? m.icon.replace(/width="26" height="26"/, `width="${s}" height="${s}"`) : '';
}

function summaryColHTML(iconSvg, label, value, unit) {
  return `<span class="summary-col">
    <span class="summary-col-icon">${iconSvg}</span>
    <span class="summary-col-label">${label}</span>
    <span class="summary-col-value">
      <span class="summary-col-num">${value}</span><span class="summary-col-unit">${unit}</span>
    </span>
  </span>`;
}

function buildSummaryCols(dose, ratio, method) {
  const water = dose * ratio;
  const steps = method.buildSteps(dose, ratio).filter(s => !s.isDraw);
  const pours = steps.length;
  const drawSecs = method.id === 'neo' ? 30 : (method.id === 'hybrid' ? 0 : 30);
  const totalMin = method.id === 'neo' ? '3:30' : (method.id === 'hybrid' ? '3:00' : (method.id === 'ice' ? '3:00' : '3:30'));

  const beanIcon  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="7.5"/><path d="M12 4.5c-3.2 4.4-3.2 10.6 0 15"/></svg>`;
  const waterIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5h15"/></svg>`;
  const pourIcon  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3.3 4 5.6 6.9 5.6 9.5a5.6 5.6 0 1 1-11.2 0c0-2.6 2.3-5.5 5.6-9.5Z"/></svg>`;
  const timerIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`;
  const ratioIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7.5h15"/><path d="M12 4.5v14.5"/></svg>`;

  return (
    summaryColHTML(beanIcon,  '豆',   dose,        'g')  +
    summaryColHTML(waterIcon, 'お湯', water,       'ml') +
    summaryColHTML(ratioIcon, '比率', `1:${ratio}`, '')  +
    summaryColHTML(pourIcon,  '投数', pours,       '回') +
    summaryColHTML(timerIcon, '目安', totalMin,    '')
  );
}

function buildStepsHTML(steps) {
  return steps.map((st, i) => {
    const isFirst = i === 0;
    const isLast  = i === steps.length - 1;
    const topBg   = isFirst ? 'transparent' : (i <= steps.findIndex(s => s.isDraw) ? 'var(--color-accent-soft)' : 'var(--color-border-card)');
    const botBg   = isLast  ? 'transparent' : (st.isDraw ? 'transparent' : 'var(--color-border-card)');
    const dotCls  = st.isDraw ? 'draw' : (i === 0 ? 'active' : 'upcoming');

    let switchChip = '';
    if (st.sw === 'OPEN') {
      switchChip = `<span class="step-switch-chip step-switch-open">OPEN</span>`;
    } else if (st.sw === 'CLOSED') {
      switchChip = `<span class="step-switch-chip step-switch-closed">CLOSED</span>`;
    }

    const cumHTML = st.cum !== null
      ? `<span class="step-cum-label">→</span><span class="step-cum">${st.cum}g</span>`
      : `<span class="step-cum" style="color:var(--color-text-faint);">完了</span>`;

    return `<div class="step-row">
      <span class="step-rail">
        <span class="step-rail-line ${isFirst ? 'none' : 'filled'}"></span>
        <span class="step-dot ${dotCls}"></span>
        <span class="step-rail-line ${isLast ? 'none' : 'empty'}"></span>
      </span>
      <span class="step-time">${st.time}</span>
      <span class="step-divider"></span>
      <span class="step-amt">${st.amt}</span>
      <span style="flex:1;"></span>
      ${switchChip}
      ${cumHTML}
    </div>`;
  }).join('');
}

function buildRatingStars(rating) {
  return Array.from({length: 5}, (_, i) =>
    `<span class="rating-star ${i < rating ? 'filled' : ''}"></span>`
  ).join('');
}

/* ── Screen navigation ──────────────────────────────────────────────────────── */
const BREW_FLOW_SCREENS = ['home', 'setup', 'preview', 'brew', 'log'];
const HISTORY_SCREENS   = ['history', 'detail'];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`screen-${id}`);
  if (el) el.classList.add('active');

  const tabBar = document.getElementById('tab-bar');
  if (id === 'brew') {
    tabBar.classList.add('hidden');
  } else {
    tabBar.classList.remove('hidden');
  }

  // Tab active state
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });

  let activeTab = null;
  if (BREW_FLOW_SCREENS.includes(id)) activeTab = 'brew';
  if (HISTORY_SCREENS.includes(id))   activeTab = 'history';
  if (id === 'settings')               activeTab = 'settings';

  if (activeTab) {
    const tabEl = document.getElementById(`tab-${activeTab}`);
    if (tabEl) {
      tabEl.classList.add('active');
      tabEl.setAttribute('aria-selected', 'true');
    }
  }
}

/* ── Home screen ────────────────────────────────────────────────────────────── */
function renderHome() {
  const container = document.getElementById('method-list');
  if (!container) return;

  const selId  = state.selectedMethodId;
  const selIdx = METHOD_ORDER.indexOf(selId);

  let html = '';

  METHOD_ORDER.forEach((id, idx) => {
    const m = METHODS[id];
    if (idx === selIdx) {
      // Selected card
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
          <span style="display:inline-flex;color:var(--color-accent);flex-shrink:0;margin-top:4px;">${m.icon}</span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;">
              <span style="font-family:var(--font-serif);font-size:13px;color:var(--color-text-faint);">${m.num}</span>
              <span style="font-size:11px;color:var(--color-text-faint);margin-left:10px;white-space:nowrap;">目安 ${m.time}</span>
              <span style="flex:1;"></span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>
            </div>
            <div class="method-selected-name">${m.name}</div>
            <div class="method-selected-sub">${m.sub}</div>
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
      // Unselected row
      html += `<div class="method-row" data-method-id="${id}">
        <span class="method-row-icon">${m.iconSm}</span>
        <span class="method-row-num">${m.num}</span>
        <span style="flex:1;min-width:0;">
          <span class="method-row-name">${m.name}</span>
          <span class="method-row-sub">${m.sub}</span>
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

  document.getElementById('setup-method-icon').innerHTML = m.icon;
  document.getElementById('setup-method-name').textContent = m.name;
  document.getElementById('setup-method-sub').textContent  = m.sub;
  document.getElementById('dose-display').textContent = d.dose;

  // Method-specific cards
  document.getElementById('flavor-card').style.display   = m.hasFlavorStrength ? '' : 'none';
  document.getElementById('strength-card').style.display = m.hasFlavorStrength ? '' : 'none';
  document.getElementById('hybrid-card').style.display   = m.id === 'hybrid'   ? '' : 'none';
  document.getElementById('neo-card').style.display      = m.id === 'neo'       ? '' : 'none';
  document.getElementById('ice-card').style.display      = m.id === 'ice'       ? '' : 'none';

  // Ice amounts
  if (m.id === 'ice') {
    const hot = Math.round(d.dose * d.ratio * 0.67);
    const ice = Math.round(d.dose * d.ratio * 0.33);
    document.getElementById('ice-hot-display').textContent = hot;
    document.getElementById('ice-ice-display').textContent = ice;
  }

  updateRatioChips();
  updateFlavorChips();
  updateStrengthChips();
  renderSetupSummary();
}

function renderSetupSummary() {
  const m = METHODS[state.selectedMethodId];
  const d = state.draft;
  document.getElementById('setup-summary-grid').innerHTML = buildSummaryCols(d.dose, d.ratio, m);
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

  document.getElementById('preview-method-icon').innerHTML = m.icon;
  document.getElementById('preview-method-name').textContent = m.name;
  document.getElementById('preview-method-sub').textContent  = m.sub;

  // Rebrew banner
  const banner = document.getElementById('rebrew-banner');
  if (state.rebrewFrom) {
    banner.classList.remove('hidden');
    document.getElementById('rebrew-banner-text').textContent =
      `${state.rebrewFrom.date} の記録をもとにレシピを読み込みました`;
  } else {
    banner.classList.add('hidden');
  }

  // Flavor chips on preview
  const flavorContainer = document.getElementById('preview-flavor-chips');
  if (m.hasFlavorStrength) {
    flavorContainer.innerHTML =
      `<span class="tag-chip">${FLAVOR_LABELS[d.flavor]}</span>` +
      `<span class="tag-chip">${STRENGTH_LABELS[d.strength]}</span>`;
  } else {
    flavorContainer.innerHTML = '';
  }

  document.getElementById('preview-summary-grid').innerHTML = buildSummaryCols(d.dose, d.ratio, m);

  const steps = m.buildSteps(d.dose, d.ratio);
  document.getElementById('preview-steps-list').innerHTML  = buildStepsHTML(steps);

  const checklist = document.getElementById('preview-checklist');
  checklist.innerHTML = m.checklist.map(item =>
    `<div class="checklist-item"><span class="checklist-dot"></span><span>${item}</span></div>`
  ).join('');
}

/* ── Brew screen ────────────────────────────────────────────────────────────── */
function renderBrew() {
  const m = METHODS[state.selectedMethodId];
  const d = state.draft;
  const b = state.brew;

  document.getElementById('brew-method-icon').innerHTML      = m.iconSm;
  document.getElementById('brew-method-name').textContent    = m.name;
  document.getElementById('brew-method-sub').textContent     = m.sub;

  const steps = m.buildSteps(d.dose, d.ratio).filter(s => !s.isDraw);
  const total = steps.length;
  const cur   = Math.min(b.stepIndex, total);

  document.getElementById('brew-step-big').textContent   = cur;
  document.getElementById('brew-step-small').textContent = ` / ${total}`;

  // Timer display (static sample: 1:05)
  document.getElementById('brew-time-display').textContent = '1:05';

  // Arc (static: ~30% progress)
  const circumference = 2 * Math.PI * 112;
  const progress = 0.3;
  document.getElementById('brew-arc').setAttribute(
    'stroke-dasharray',
    `${circumference * progress} ${circumference}`
  );

  // Step dots
  const dotsRow = document.getElementById('brew-dots-row');
  const dotCount = Math.min(total, 8);
  dotsRow.innerHTML = Array.from({length: dotCount}, (_, i) => {
    const stepNum = i + 1;
    const cls = stepNum < cur ? 'done' : (stepNum === cur ? 'active' : 'upcoming');
    const lineBg = i > 0 && i <= cur - 1
      ? 'var(--color-accent-soft)'
      : 'var(--color-border-card)';
    return `<span class="brew-dot-col">
      <span class="brew-dot-line" style="background:${lineBg};"></span>
      <span class="brew-dot-circle ${cls}"></span>
      <span class="brew-dot-label">${stepNum}</span>
    </span>`;
  }).join('');

  // Pour card
  const curStep = steps[cur - 1];
  if (curStep) {
    document.getElementById('brew-pour-amt').textContent = parseInt(curStep.amt) || '—';
    document.getElementById('brew-pour-note').textContent = curStep.note;
    document.getElementById('brew-cum-amt').textContent  = curStep.cum;
  }

  // Next hint
  const nextStep = steps[cur];
  const nextHint = document.getElementById('brew-next-hint');
  if (nextStep) {
    nextHint.classList.remove('hidden');
    nextHint.style.display = 'flex';
    document.getElementById('brew-next-time').textContent = nextStep.time;
    document.getElementById('brew-next-amt').textContent  = nextStep.amt;
    document.getElementById('brew-next-tip').textContent  = nextStep.note;
  } else {
    nextHint.classList.add('hidden');
  }

  // Finish button state
  const isLast = cur >= total;
  const nextIcon   = document.getElementById('brew-next-icon');
  const finishIcon = document.getElementById('brew-finish-icon');
  const nextLabel  = document.getElementById('brew-next-label');
  const nextBtn    = document.getElementById('btn-brew-next');

  if (isLast) {
    nextIcon.classList.add('hidden');
    finishIcon.classList.remove('hidden');
    nextLabel.textContent = '完了';
    nextBtn.style.background  = 'var(--color-accent)';
    nextBtn.style.border = '1px solid var(--color-accent)';
  } else {
    finishIcon.classList.add('hidden');
    nextIcon.classList.remove('hidden');
    nextLabel.textContent = '次へ';
    nextBtn.style.background = 'var(--color-btn-light-bg)';
    nextBtn.style.border = '1px solid var(--color-border-input)';
  }
}

/* ── Brew Log screen ────────────────────────────────────────────────────────── */
function renderLog() {
  const m = METHODS[state.selectedMethodId];
  const d = state.draft;

  document.getElementById('log-method-label').textContent = m.name;
  document.getElementById('log-method-icon').innerHTML    = m.icon;
  document.getElementById('log-method-name').textContent  = m.name;
  document.getElementById('log-method-sub').textContent   = m.sub;
  document.getElementById('log-summary-grid').innerHTML   = buildSummaryCols(d.dose, d.ratio, m);

  // Rating dots
  const ratingContainer = document.getElementById('log-rating-dots');
  ratingContainer.innerHTML = Array.from({length: 5}, (_, i) => {
    const selected = i < state.log.rating;
    return `<button class="rating-dot-btn" data-rating="${i+1}">
      <span class="rating-dot ${selected ? 'selected' : ''}"></span>
    </button>`;
  }).join('');

  document.getElementById('log-rate-label').textContent =
    state.log.rating ? RATING_LABELS[state.log.rating] : '—';

  ratingContainer.querySelectorAll('.rating-dot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.log.rating = parseInt(btn.dataset.rating);
      renderLog();
    });
  });

  // Taste tags
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
  const fm   = METHODS[feat.methodId];

  document.getElementById('hist-feat-icon').innerHTML      = fm.icon;
  document.getElementById('hist-feat-name').textContent    = fm.name;
  document.getElementById('hist-feat-sub').textContent     = fm.sub;
  document.getElementById('hist-feat-date').textContent    = feat.date;
  document.getElementById('hist-feat-summary').innerHTML   = buildSummaryCols(feat.dose, feat.ratio, fm);

  const tagsRow = document.getElementById('hist-feat-tags-row');
  const tagsEl  = document.getElementById('hist-feat-tags');
  if (feat.tags && feat.tags.length) {
    tagsRow.classList.remove('hidden');
    tagsEl.innerHTML = feat.tags.map(t => `<span class="tag-chip">${t}</span>`).join('');
  } else {
    tagsRow.classList.add('hidden');
  }

  const noteRow = document.getElementById('hist-feat-note-row');
  const noteEl  = document.getElementById('hist-feat-note');
  if (feat.note) {
    noteRow.classList.remove('hidden');
    noteEl.textContent = feat.note;
  } else {
    noteRow.classList.add('hidden');
  }

  // History list (entries after first)
  const listEl = document.getElementById('history-list');
  listEl.innerHTML = history.slice(1).map(h => {
    const hm = METHODS[h.methodId];
    const meta = `${h.dose}g · 1:${h.ratio}`;
    const stars = Array.from({length: 5}, (_, i) =>
      `<span class="rating-star ${i < h.rating ? 'filled' : ''}"></span>`
    ).join('');
    const tags = (h.tags || []).slice(0, 2).map(t =>
      `<span class="tag-chip">${t}</span>`
    ).join('');

    return `<div class="history-row" data-history-id="${h.id}">
      <span style="display:inline-flex;color:var(--color-accent);flex-shrink:0;">${hm.iconSm}</span>
      <span style="flex:1;min-width:0;">
        <span style="display:flex;align-items:baseline;gap:8px;">
          <span style="font-family:var(--font-serif);font-weight:600;font-size:16px;color:var(--color-text);">${hm.name}</span>
          <span style="font-size:10.5px;color:var(--color-text-faint);white-space:nowrap;">${h.date}</span>
        </span>
        <span style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <span style="font-family:var(--font-serif);font-size:12.5px;color:var(--color-text-muted);white-space:nowrap;">${meta}</span>
          <span style="display:inline-flex;gap:3px;">${stars}</span>
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

  const m = METHODS[entry.methodId];

  document.getElementById('detail-date-label').textContent  = entry.date;
  document.getElementById('detail-icon').innerHTML           = m.icon;
  document.getElementById('detail-name').textContent         = m.name;
  document.getElementById('detail-sub').textContent          = m.sub;
  document.getElementById('detail-rating').innerHTML         = buildRatingStars(entry.rating);
  document.getElementById('detail-summary-grid').innerHTML   = buildSummaryCols(entry.dose, entry.ratio, m);

  // Next note
  const nextCard = document.getElementById('detail-next-note-card');
  if (entry.nextNote) {
    nextCard.classList.remove('hidden');
    document.getElementById('detail-next-note-text').textContent = entry.nextNote;
  } else {
    nextCard.classList.add('hidden');
  }

  // Flavor chips
  const flavorChips = document.getElementById('detail-flavor-chips');
  if (m.hasFlavorStrength && entry.flavor && entry.strength) {
    flavorChips.innerHTML =
      `<span class="tag-chip">${FLAVOR_LABELS[entry.flavor] || entry.flavor}</span>` +
      `<span class="tag-chip">${STRENGTH_LABELS[entry.strength] || entry.strength}</span>`;
  } else {
    flavorChips.innerHTML = '';
  }

  // Steps
  document.getElementById('detail-steps-list').innerHTML = buildStepsHTML(m.buildSteps(entry.dose, entry.ratio));

  // Tags
  const tagsCard = document.getElementById('detail-tags-card');
  const tagsList = document.getElementById('detail-tags-list');
  if (entry.tags && entry.tags.length) {
    tagsCard.classList.remove('hidden');
    tagsList.innerHTML = entry.tags.map(t => `<span class="tag-chip tag-chip-lg">${t}</span>`).join('');
  } else {
    tagsCard.classList.add('hidden');
  }

  // Memo
  const memoCard = document.getElementById('detail-memo-card');
  if (entry.note) {
    memoCard.classList.remove('hidden');
    document.getElementById('detail-memo-text').textContent = entry.note;
  } else {
    memoCard.classList.add('hidden');
  }

  // Equipment
  const eq = entry.equip || {};
  document.getElementById('detail-equip-bean').textContent    = eq.bean    || '—';
  document.getElementById('detail-equip-grind').textContent   = eq.grind   || '—';
  document.getElementById('detail-equip-temp').textContent    = eq.temp    || '—';
  document.getElementById('detail-equip-dripper').textContent = eq.dripper || '—';
}

/* ── Settings screen ────────────────────────────────────────────────────────── */
function renderSettings() {
  const s = state.settings;
  document.getElementById('sett-method-val').textContent = METHOD_DISPLAY_NAMES[s.defMethodId];
  document.getElementById('sett-dose-val').textContent   = `${s.defDose}g`;
  document.getElementById('sett-ratio-val').textContent  = `1:${s.defRatio}`;

  ['wake', 'sound', 'haptic'].forEach(key => {
    const track = document.getElementById(`toggle-${key}`);
    if (track) {
      if (s[key]) track.classList.add('on');
      else        track.classList.remove('on');
    }
  });
}

/* ── Toast ──────────────────────────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

/* ── Public API (used by inline event handlers) ─────────────────────────────── */
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

  // Setup → back
  document.getElementById('btn-setup-back').addEventListener('click', () => {
    showScreen('home');
  });

  // Setup → dose spinner
  document.getElementById('btn-dose-dec').addEventListener('click', () => {
    if (state.draft.dose > 10) { state.draft.dose--; renderSetup(); }
  });
  document.getElementById('btn-dose-inc').addEventListener('click', () => {
    if (state.draft.dose < 40) { state.draft.dose++; renderSetup(); }
  });

  // Setup → ratio chips
  document.getElementById('ratio-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip-btn');
    if (!btn) return;
    state.draft.ratio       = parseInt(btn.dataset.ratio);
    state.draft.customRatio = false;
    renderSetup();
  });

  // Setup → custom ratio toggle
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

  // Setup → flavor chips
  document.getElementById('flavor-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip-btn');
    if (btn) { state.draft.flavor = btn.dataset.flavor; updateFlavorChips(); }
  });

  // Setup → strength chips
  document.getElementById('strength-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip-btn');
    if (btn) { state.draft.strength = btn.dataset.strength; updateStrengthChips(); }
  });

  // Setup → go to preview
  document.getElementById('btn-go-preview').addEventListener('click', () => {
    renderPreview();
    showScreen('preview');
  });

  // Preview → back
  document.getElementById('btn-preview-back').addEventListener('click', () => {
    showScreen('setup');
  });

  // Preview → start brew
  document.getElementById('btn-start-brew').addEventListener('click', () => {
    state.brew = { stepIndex: 1, elapsed: 65, running: false };
    state.log  = { rating: 0, tags: [] };
    renderBrew();
    showScreen('brew');
  });

  // Brew → back
  document.getElementById('btn-brew-back').addEventListener('click', () => {
    showScreen('preview');
  });

  // Brew → pause / play (static toggle)
  document.getElementById('btn-brew-pause').addEventListener('click', () => {
    const pauseIcon  = document.getElementById('brew-pause-icon');
    const playIcon   = document.getElementById('brew-play-icon');
    const chip       = document.getElementById('brew-chip');
    const chipWrap   = document.getElementById('brew-chip-wrap');
    const label      = document.getElementById('brew-pause-label');

    state.brew.running = !state.brew.running;
    if (state.brew.running) {
      pauseIcon.classList.remove('hidden');
      playIcon.classList.add('hidden');
      label.textContent = '一時停止';
      chipWrap.classList.add('hidden');
    } else {
      pauseIcon.classList.add('hidden');
      playIcon.classList.remove('hidden');
      label.textContent = '再開';
      chipWrap.classList.remove('hidden');
      chipWrap.style.display = 'flex';
      chip.textContent = 'PAUSED';
    }
  });

  // Brew → next step / finish
  document.getElementById('btn-brew-next').addEventListener('click', () => {
    const m     = METHODS[state.selectedMethodId];
    const steps = m.buildSteps(state.draft.dose, state.draft.ratio).filter(s => !s.isDraw);
    if (state.brew.stepIndex < steps.length) {
      state.brew.stepIndex++;
      renderBrew();
    } else {
      // Finished — go to log
      renderLog();
      showScreen('log');
    }
  });

  // Log → back
  document.getElementById('btn-log-back').addEventListener('click', () => {
    showScreen('brew');
  });

  // Log → save  [PR-002 STUB: in-memory only, no localStorage persistence — real persistence in PR-004]
  document.getElementById('btn-save-log').addEventListener('click', () => {
    const m = METHODS[state.selectedMethodId];
    const d = state.draft;
    const entry = {
      id:       `h${Date.now()}`,
      methodId: m.id,
      date:     new Date().toISOString().slice(0, 10),
      dose:     d.dose,
      ratio:    d.ratio,
      flavor:   d.flavor,
      strength: d.strength,
      rating:   state.log.rating,
      tags:     [...state.log.tags],
      note:     document.getElementById('log-memo').value,
      nextNote: document.getElementById('log-next-note').value,
      equip:    { bean: 'エチオピア ゲデオ', grind: '中細挽き (#16)', temp: '93°C', dripper: 'ハリオ V60' },
    };
    state.history.unshift(entry);
    showToast('記録を保存しました');
    setTimeout(() => {
      renderHistory();
      showScreen('history');
    }, 600);
  });

  // History → featured detail
  document.getElementById('btn-hist-detail').addEventListener('click', () => {
    state.currentDetailId = state.history[0]?.id;
    renderDetail();
    showScreen('detail');
  });

  // History → featured rebrew (→ Preview with rebrewFrom)
  document.getElementById('btn-hist-rebrew').addEventListener('click', () => {
    const entry = state.history[0];
    if (!entry) return;
    state.selectedMethodId   = entry.methodId;
    state.draft.dose         = entry.dose;
    state.draft.ratio        = entry.ratio;
    state.draft.flavor       = entry.flavor   || 'balanced';
    state.draft.strength     = entry.strength || 'standard';
    state.rebrewFrom         = { id: entry.id, date: entry.date };
    renderPreview();
    showScreen('preview');
  });

  // Detail → back
  document.getElementById('btn-detail-back').addEventListener('click', () => {
    showScreen('history');
  });

  // Detail → rebrew
  document.getElementById('btn-detail-rebrew').addEventListener('click', () => {
    const entry = state.history.find(h => h.id === state.currentDetailId);
    if (!entry) return;
    state.selectedMethodId   = entry.methodId;
    state.draft.dose         = entry.dose;
    state.draft.ratio        = entry.ratio;
    state.draft.flavor       = entry.flavor   || 'balanced';
    state.draft.strength     = entry.strength || 'standard';
    state.rebrewFrom         = { id: entry.id, date: entry.date };
    renderPreview();
    showScreen('preview');
  });

  // Settings → method cycle
  document.getElementById('sett-method-row').addEventListener('click', () => {
    const idx = METHOD_ORDER.indexOf(state.settings.defMethodId);
    state.settings.defMethodId = METHOD_ORDER[(idx + 1) % METHOD_ORDER.length];
    renderSettings();
  });

  // Settings → dose
  document.getElementById('sett-dose-dec').addEventListener('click', () => {
    if (state.settings.defDose > 10) { state.settings.defDose--; renderSettings(); }
  });
  document.getElementById('sett-dose-inc').addEventListener('click', () => {
    if (state.settings.defDose < 40) { state.settings.defDose++; renderSettings(); }
  });

  // Settings → ratio
  document.getElementById('sett-ratio-dec').addEventListener('click', () => {
    if (state.settings.defRatio > 10) { state.settings.defRatio--; renderSettings(); }
  });
  document.getElementById('sett-ratio-inc').addEventListener('click', () => {
    if (state.settings.defRatio < 20) { state.settings.defRatio++; renderSettings(); }
  });

  // Settings → export  [PR-002 STUB: toast placeholder only, no real export — real export in PR-005]
  document.getElementById('btn-export-json').addEventListener('click', () => showToast('JSON エクスポートは PR-005 で実装予定'));
  document.getElementById('btn-export-csv').addEventListener('click',  () => showToast('CSV エクスポートは PR-005 で実装予定'));

  // Settings → clear history
  // Clear history  [PR-002 STUB: clears in-memory array only, no real persistence — real clear in PR-005]
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    document.getElementById('confirm-overlay').classList.remove('hidden');
  });
  document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
    document.getElementById('confirm-overlay').classList.add('hidden');
  });
  document.getElementById('btn-confirm-ok').addEventListener('click', () => {
    state.history = [];
    document.getElementById('confirm-overlay').classList.add('hidden');
    showToast('履歴を削除しました');
  });
}

/* ── Boot ───────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  renderHistory();
  renderSettings();
  wireEvents();
  showScreen('home');
});
