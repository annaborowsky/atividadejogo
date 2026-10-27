const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadBrowserScript } = require('./helpers');

const { context, window } = loadBrowserScript('js/game.js', {
  document: {
    readyState: 'loading',
    addEventListener() {}
  },
  window: {
    Storage: {},
    Audio: {},
    Words: {}
  }
});
vm.runInContext('globalThis.GameForTests = Game', context);

const Game = context.GameForTests;

function createGame(values = {}) {
  return Object.assign(Object.create(Game.prototype), {
    solution: 'CASAS',
    currentRow: 0,
    currentTile: 0,
    gameOver: false,
    mode: 'daily',
    usedHintThisRow: false,
    guesses: Array(6).fill(null).map(() => Array(5).fill('')),
    ...values
  });
}

test('feedback identifica acertos, letras presentes e ausentes', () => {
  const game = createGame();
  assert.deepEqual(
    Array.from(game.getFeedback('SABER', 'CASAS')),
    ['present', 'correct', 'absent', 'absent', 'absent']
  );
});

test('feedback limita letras repetidas à quantidade existente na resposta', () => {
  const game = createGame();
  assert.deepEqual(
    Array.from(game.getFeedback('AAAAA', 'CASAS')),
    ['absent', 'correct', 'absent', 'correct', 'absent']
  );
});

test('modo difícil mantém letras verdes e exige letras amarelas', () => {
  const game = createGame({
    currentRow: 1,
    guesses: [
      ['S', 'A', 'B', 'E', 'R'],
      ['', '', '', '', ''],
      ...Array(4).fill(null).map(() => Array(5).fill(''))
    ]
  });
  assert.equal(game.checkHardMode('CASAS'), true);
  assert.equal(game.checkHardMode('CSBAS'), false);
  assert.equal(game.checkHardMode('SABAS'), false);
});

test('resposta correta encerra a partida e registra vitória e tentativas', () => {
  const calls = [];
  window.Storage.updateStats = (...args) => {
    calls.push(args);
    return {};
  };
  window.Audio.playWin = () => {};
  const originalSetTimeout = context.setTimeout;
  context.setTimeout = callback => {
    callback();
    return 0;
  };
  const game = createGame({
    currentRow: 2,
    saveDailyProgress() {},
    showEndModal(won) {
      assert.equal(won, true);
    }
  });
  game.checkGameState('CASAS');
  context.setTimeout = originalSetTimeout;
  assert.equal(game.gameOver, true);
  assert.deepEqual(calls, [['daily', true, 3]]);
});

test('tentativa errada avança uma linha e a sexta encerra a partida', () => {
  const game = createGame({
    updateHintButton() {},
    saveDailyProgress() {}
  });
  game.checkGameState('XXXXX');
  assert.equal(game.currentRow, 1);
  assert.equal(game.currentTile, 0);

  const calls = [];
  window.Storage.updateStats = (...args) => {
    calls.push(args);
    return {};
  };
  window.Audio.playLose = () => {};
  game.currentRow = 5;
  game.showEndModal = won => assert.equal(won, false);
  game.checkGameState('XXXXX');
  assert.equal(game.gameOver, true);
  assert.deepEqual(calls, [['daily', false, 6]]);
});
