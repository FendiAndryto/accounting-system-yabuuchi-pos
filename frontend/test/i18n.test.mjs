import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, formatDate, t, translations } from '../src/i18n/index.js';

test('formatCurrency formats Indonesian Rupiah correctly', () => {
  const result = formatCurrency(16000000, 'id');
  // Should start with Rp and contain formatted 16.000.000
  assert.match(result, /^Rp\s*16[.,]000[.,]000/);
});

test('formatCurrency converts to US Dollars with benchmark rate (1 USD ~ 16,000 IDR)', () => {
  const result = formatCurrency(16000000, 'en');
  // 16,000,000 / 16,000 = 1,000.00
  assert.match(result, /^\$\s*1,000\.00/);
});

test('formatCurrency converts to Japanese Yen with benchmark rate (1 JPY ~ 105 IDR)', () => {
  const result = formatCurrency(16000000, 'ja');
  // 16,000,000 / 105 ≈ 152,381
  assert.match(result, /^¥\s*152,381/);
});

test('formatDate renders locale-specific date format', () => {
  const testDate = new Date('2026-10-05T12:00:00Z');
  const idDate = formatDate(testDate, 'id');
  const enDate = formatDate(testDate, 'en');
  const jaDate = formatDate(testDate, 'ja');

  assert.ok(idDate.includes('2026'), 'idDate includes 2026');
  assert.ok(enDate.includes('2026'), 'enDate includes 2026');
  assert.ok(jaDate.includes('2026'), 'jaDate includes 2026');
  // Japanese date format contains 年 or Japanese era representation
  assert.ok(jaDate.includes('年') || jaDate.includes('10'), 'jaDate contains Japanese character or month');
});

test('t returns correct translations for id, en, and ja', () => {
  assert.equal(t('nav.dashboard', 'id'), 'Dashboard');
  assert.equal(t('nav.dashboard', 'en'), 'Dashboard');
  assert.equal(t('nav.dashboard', 'ja'), 'ダッシュボード');

  assert.equal(t('nav.master_accounts', 'id'), 'Rekening Bank');
  assert.equal(t('nav.master_accounts', 'en'), 'Bank Accounts');
  assert.equal(t('nav.master_accounts', 'ja'), '銀行口座');

  assert.equal(t('nav.cash_in', 'ja'), '入金 (Cash In)');
  assert.equal(t('nav.cash_out', 'ja'), '出金 (Cash Out)');
});
