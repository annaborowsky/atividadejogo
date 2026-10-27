const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { projectRoot } = require('./helpers');

test('HTML carrega todos os módulos do jogo na ordem necessária', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
    .map(match => match[1]);
  assert.deepEqual(scripts, [
    'js/words.js',
    'js/storage.js',
    'js/audio.js',
    'js/game.js'
  ]);
  for (const script of scripts) {
    assert.equal(fs.existsSync(path.join(projectRoot, script)), true, `${script} deve existir`);
  }
});

test('HTML fornece tabuleiro, teclado e estado acessíveis esperados pelo jogo', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  assert.match(html, /id="board" role="grid"/);
  assert.match(html, /id="keyboard" role="group"/);
  assert.match(html, /id="statusBar" aria-live="polite"/);
});
