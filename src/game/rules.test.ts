import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  getComboMultiplier,
  calculateStars,
  applyDamage,
  healPlayer,
  evaluateAnswer,
  checkLevelClear,
  getGradeDisplayName,
  generateSpeedMathProblem,
} from './rules.ts';

test('getComboMultiplier returns proper tiers', () => {
  assert.equal(getComboMultiplier(0), 1.0);
  assert.equal(getComboMultiplier(1), 1.0);
  assert.equal(getComboMultiplier(2), 1.5);
  assert.equal(getComboMultiplier(3), 2.0);
  assert.equal(getComboMultiplier(5), 2.5);
  assert.equal(getComboMultiplier(10), 3.0);
});

test('calculateScore scales with base points, combo, and speed', () => {
  assert.equal(calculateScore(100, 0, 1.0), 100);
  assert.equal(calculateScore(100, 3, 1.5), 300);
});

test('calculateStars awards 1 to 3 stars according to accuracy and health', () => {
  assert.equal(calculateStars(10, 10, 1.0), 3);
  assert.equal(calculateStars(7, 10, 0.4), 2);
  assert.equal(calculateStars(4, 10, 0.2), 1);
});

test('applyDamage clamps at zero', () => {
  assert.equal(applyDamage(3, 1), 2);
  assert.equal(applyDamage(1, 1), 0);
  assert.equal(applyDamage(1, 3), 0);
});

test('healPlayer clamps at maxHp', () => {
  assert.equal(healPlayer(1, 1, 3), 2);
  assert.equal(healPlayer(2, 2, 3), 3);
  assert.equal(healPlayer(3, 1, 3), 3);
});

test('evaluateAnswer is case and whitespace insensitive', () => {
  assert.equal(evaluateAnswer('Jakarta', 'jakarta'), true);
  assert.equal(evaluateAnswer(' 24 ', 24), true);
  assert.equal(evaluateAnswer('Kucing', 'Kelinci'), false);
});

test('checkLevelClear determines victory or defeat', () => {
  assert.deepEqual(checkLevelClear(5, 5, 2), { isComplete: true, isVictory: true });
  assert.deepEqual(checkLevelClear(3, 5, 0), { isComplete: true, isVictory: false });
  assert.deepEqual(checkLevelClear(2, 5, 3), { isComplete: false, isVictory: false });
});

test('getGradeDisplayName gives appropriate labels', () => {
  const g1 = getGradeDisplayName('sd1-2');
  assert.match(g1.label, /Kelas 1 - 2/);
  const g3 = getGradeDisplayName('sd3-4');
  assert.match(g3.label, /Kelas 3 - 4/);
  const g5 = getGradeDisplayName('sd5-6');
  assert.match(g5.label, /Kelas 5 - 6/);
});

test('generateSpeedMathProblem generates valid problem and options', () => {
  const p1 = generateSpeedMathProblem('sd1-2');
  assert.ok(p1.options.includes(p1.correct));
  assert.equal(p1.options.length, 3);

  const p2 = generateSpeedMathProblem('sd3-4');
  assert.ok(p2.options.includes(p2.correct));

  const p3 = generateSpeedMathProblem('sd5-6');
  assert.ok(p3.options.includes(p3.correct));
});
