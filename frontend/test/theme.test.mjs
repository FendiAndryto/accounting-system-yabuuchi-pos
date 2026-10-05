import test from 'node:test';
import assert from 'node:assert/strict';
import { getThemeColors, lightColors, darkColors } from '../src/theme/index.js';

test('getThemeColors returns correct light palette', () => {
  const colors = getThemeColors('light');
  assert.equal(colors.background, '#f8fafc');
  assert.equal(colors.surface, '#ffffff');
  assert.equal(colors.textPrimary, '#0f172a');
  assert.equal(colors.border, '#e2e8f0');
});

test('getThemeColors returns correct deep slate dark palette', () => {
  const colors = getThemeColors('dark');
  assert.equal(colors.background, '#0f172a');
  assert.equal(colors.surface, '#1e293b');
  assert.equal(colors.textPrimary, '#f8fafc');
  assert.equal(colors.border, '#334155');
  assert.equal(colors.sidebarBg, '#0f172a');
  assert.equal(colors.sidebarBorder, '#1e293b');
});
