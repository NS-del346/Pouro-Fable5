#!/usr/bin/env node
// PR-011R1 docs-only validator for coffee_app_tips_master_v2.1.json
// This script validates the POINT/TIPS master data foundation. It is a
// documentation/data verification helper only. It is NOT imported by, and does
// NOT alter, any Pouro-Fable5 runtime app code (index.html / app.js / styles.css /
// sw.js / manifest). Run with: node docs/data/validate_tips_master.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(here, 'coffee_app_tips_master_v2.1.json');
const csvPath = join(here, 'coffee_app_tips_master_v2.1_audit.csv');

const results = [];
const fail = (msg) => results.push(['FAIL', msg]);
const pass = (msg) => results.push(['PASS', msg]);

// --- JSON parse ---
let data;
try {
  data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  pass('JSON parses successfully');
} catch (e) {
  fail(`JSON parse error: ${e.message}`);
  report();
  process.exit(1);
}

// --- CSV readability ---
try {
  const raw = readFileSync(csvPath, 'utf8').replace(/^﻿/, '');
  const rows = raw.split(/\r?\n/).filter((l) => l.length > 0);
  pass(`CSV readable: ${rows.length} rows (incl. header)`);
} catch (e) {
  fail(`CSV read error: ${e.message}`);
}

// --- top-level keys ---
const topKeys = [
  'version', 'generatedAt', 'project', 'status', 'methodSources',
  'recipeScope', 'textRules', 'displayPolicy', 'items',
];
for (const k of topKeys) {
  if (k in data) pass(`top-level key present: ${k}`);
  else fail(`missing top-level key: ${k}`);
}

// --- items array ---
if (!Array.isArray(data.items)) {
  fail('items is not an array');
  report();
  process.exit(1);
}
pass('items is an array');

// --- per-item field + enum checks ---
const itemFields = [
  'id', 'type', 'scope', 'recipeCode', 'category', 'displayContext',
  'contentJa', 'contentShortJa', 'whyJa', 'source', 'verificationLevel',
  'confidence', 'appAdoption', 'notes',
];
const TYPES = new Set(['POINT', 'TIPS']);
const CONTEXTS = new Set(['setup', 'preview', 'timer', 'finish', 'historyDetail', 'quarantine']);
const ADOPTIONS = new Set(['adoptable', 'quarantine']);

let fieldOk = true, typeOk = true, ctxOk = true, adoptOk = true, quarOk = true;
for (const it of data.items) {
  for (const f of itemFields) if (!(f in it)) { fieldOk = false; fail(`item ${it.id ?? '?'} missing field: ${f}`); }
  if (!TYPES.has(it.type)) { typeOk = false; fail(`item ${it.id} bad type: ${it.type}`); }
  const ctxs = Array.isArray(it.displayContext) ? it.displayContext : [it.displayContext];
  for (const c of ctxs) if (!CONTEXTS.has(c)) { ctxOk = false; fail(`item ${it.id} bad displayContext: ${c}`); }
  if (!ADOPTIONS.has(it.appAdoption)) { adoptOk = false; fail(`item ${it.id} bad appAdoption: ${it.appAdoption}`); }
  if (it.appAdoption === 'quarantine' && !ctxs.every((c) => c === 'quarantine')) {
    quarOk = false; fail(`quarantine item ${it.id} not in quarantine displayContext`);
  }
  if (ctxs.includes('quarantine') && it.appAdoption !== 'quarantine') {
    quarOk = false; fail(`quarantine-context item ${it.id} is not appAdoption quarantine`);
  }
}
if (fieldOk) pass('all items have required fields');
if (typeOk) pass('all item types are POINT/TIPS');
if (ctxOk) pass('all displayContext values are valid');
if (adoptOk) pass('all appAdoption values are valid');
if (quarOk) pass('quarantine items use displayContext+appAdoption quarantine');

// --- counts ---
const total = data.items.length;
const adoptable = data.items.filter((i) => i.appAdoption === 'adoptable').length;
const quarantine = data.items.filter((i) => i.appAdoption === 'quarantine').length;
(total === 39 ? pass : fail)(`total items = ${total} (expected 39)`);
(adoptable === 38 ? pass : fail)(`adoptable = ${adoptable} (expected 38)`);
(quarantine === 1 ? pass : fail)(`quarantine = ${quarantine} (expected 1)`);

const expectByCode = { ALL: 4, 406: 5, ICE: 7, HYB_BASE: 3, HYB_DEVIL: 6, HYB_NEW: 6, NEO: 7, OTHER: 1 };
const byCode = {};
for (const it of data.items) byCode[it.recipeCode] = (byCode[it.recipeCode] || 0) + 1;
for (const [code, exp] of Object.entries(expectByCode)) {
  const got = byCode[code] || 0;
  (got === exp ? pass : fail)(`recipeCode ${code} = ${got} (expected ${exp})`);
}

// --- required content checks ---
const byId = Object.fromEntries(data.items.map((i) => [i.id, i]));
const has = (id, substr, label) => {
  const it = byId[id];
  const text = it ? `${it.contentJa}${it.contentShortJa}${it.whyJa}${it.notes}` : '';
  (it && text.includes(substr) ? pass : fail)(`${label} (${id} contains "${substr}")`);
};
has('P-HYB-NEW-003', '常温水', 'HYB_NEW room-temperature water into dripper');
has('P-HYB-NEW-003', 'ドリッパー内', 'HYB_NEW room-temperature water placed in dripper');
has('T-HYB-NEW-002', '300g', 'HYB_NEW room-temp water counted in total 300g');
has('T-HYB-NEW-002', '70', 'HYB_NEW liquid temp 70-80C target');
has('P-HYB-NEW-004', '2:10', 'HYB_NEW Switch close ~2:10');
has('P-HYB-NEW-004', '2:45', 'HYB_NEW Switch open ~2:45');
has('P-NEO-003', '1:45', 'NEO 1:45 step preserved');
has('P-NEO-003', '210g', 'NEO pour to 210g preserved');
has('T-NEO-004', '粗', 'NEO very coarse grind guidance');

// NEO schedule items use primary_visual_confirmed
const neoSchedule = ['P-NEO-001', 'P-NEO-003'];
for (const id of neoSchedule) {
  const it = byId[id];
  (it && it.verificationLevel === 'primary_visual_confirmed' ? pass : fail)(
    `${id} verificationLevel = primary_visual_confirmed`,
  );
}

// --- app-facing copy legal/expression check (contentJa + contentShortJa only) ---
const forbidden = ['完全', '100%', '必ず', '誰でも世界チャンピオンの味', '公式完全再現', '絶対に失敗しない', '究極', '神', '悪魔', 'どんな豆も必ず美味しくなる', '唯一の正解'];
let copyOk = true;
for (const it of data.items) {
  const facing = `${it.contentJa} ${it.contentShortJa} ${it.whyJa}`;
  for (const w of forbidden) {
    if (facing.includes(w)) { copyOk = false; fail(`forbidden expression "${w}" in app-facing copy of ${it.id}`); }
  }
}
if (copyOk) pass('no forbidden expressions in app-facing copy (contentJa/Short/why)');

function report() {
  const failed = results.filter((r) => r[0] === 'FAIL');
  for (const [s, m] of results) console.log(`[${s}] ${m}`);
  console.log('\n=== SUMMARY ===');
  console.log(`PASS: ${results.length - failed.length}  FAIL: ${failed.length}`);
  console.log(failed.length === 0 ? 'RESULT: ALL CHECKS PASS' : 'RESULT: FAILURES PRESENT');
}
report();
process.exit(results.some((r) => r[0] === 'FAIL') ? 1 : 0);
