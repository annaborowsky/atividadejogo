const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBrowserScript } = require('./helpers');

const { window, context } = loadBrowserScript('js/words.js');
const words = window.Words;

test('todas as respostas têm cinco letras e são aceitas pelo dicionário', () => {
  assert.ok(words.ANSWERS.length > 0);
  for (const answer of words.ANSWERS) {
    assert.equal(answer.length, 5, `${answer} deve ter cinco letras`);
    assert.equal(words.isValidWord(answer), true, `${answer} deve ser válida`);
  }
});

test('normaliza acentos e cedilha antes de validar palavras', () => {
  assert.equal(words.normalizeWord('ação'), 'ACAO');
  assert.equal(words.isValidWord('braco'), true);
  assert.equal(words.isValidWord('ação'), false);
});

test('rejeita palavras que não têm cinco letras ou não estão no dicionário', () => {
  assert.equal(words.isValidWord('CASA'), false);
  assert.equal(words.isValidWord('ZZZZZ'), false);
});

test('cada entrada do dicionário de tentativas tem exatamente cinco letras', () => {
  assert.ok(words.VALID_GUESSES.length > words.ANSWERS.length);
  assert.ok(words.VALID_GUESSES.every(word => word.length === 5));
});

test('palavra diária é determinística para a mesma data', () => {
  const date = new Date('2026-10-27T12:00:00.000Z');
  assert.equal(words.getDailyAnswer(date), words.getDailyAnswer(date));
  assert.ok(words.ANSWERS.includes(words.getDailyAnswer(date)));
});

test('sorteio aleatório escolhe um item do conjunto de respostas', () => {
  context.Math.random = () => 0;
  assert.equal(words.getRandomAnswer(), words.ANSWERS[0]);
  context.Math.random = () => 0.999999;
  assert.equal(words.getRandomAnswer(), words.ANSWERS.at(-1));
});
