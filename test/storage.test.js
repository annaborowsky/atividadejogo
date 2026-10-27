const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBrowserScript } = require('./helpers');

function createStorage() {
  const values = new Map();
  const localStorage = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    }
  };
  const { window } = loadBrowserScript('js/storage.js', { localStorage });
  return { storage: window.Storage, localStorage };
}

test('retorna estatísticas e preferências padrão quando não há dados salvos', () => {
  const { storage } = createStorage();
  assert.deepEqual(JSON.parse(JSON.stringify(storage.getStats('daily'))), {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    lastPlayed: null
  });
  assert.deepEqual(JSON.parse(JSON.stringify(storage.getPrefs())), {
    theme: 'dark',
    sound: true,
    hardMode: false,
    reduceMotion: false
  });
});

test('mescla dados parciais salvos com os valores padrão', () => {
  const { storage, localStorage } = createStorage();
  localStorage.setItem('cp_prefs', JSON.stringify({ theme: 'light' }));
  localStorage.setItem('cp_stats_free', JSON.stringify({ played: 3 }));
  assert.equal(storage.getPrefs().sound, true);
  assert.equal(storage.getPrefs().theme, 'light');
  assert.equal(storage.getStats('free').played, 3);
  assert.equal(storage.getStats('free').won, 0);
});

test('dados corrompidos não impedem carregar os valores padrão', () => {
  const { storage, localStorage } = createStorage();
  localStorage.setItem('cp_prefs', '{');
  localStorage.setItem('cp_stats_daily', '{');
  localStorage.setItem('cp_daily_state', '{');
  assert.equal(storage.getPrefs().theme, 'dark');
  assert.equal(storage.getStats('daily').played, 0);
  assert.equal(storage.getDailyState('2026-10-27'), null);
});

test('atualiza vitória, distribuição e sequência do modo diário', () => {
  const { storage, localStorage } = createStorage();
  const yesterday = storage.getYesterday();
  localStorage.setItem('cp_last_played_date', yesterday);
  const stats = storage.updateStats('daily', true, 3);
  assert.equal(stats.played, 1);
  assert.equal(stats.won, 1);
  assert.equal(stats.distribution[2], 1);
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.maxStreak, 1);
  assert.equal(stats.lastPlayed, new Date().toISOString().split('T')[0]);
});

test('derrota diária reinicia a sequência e uma partida livre não altera a diária', () => {
  const { storage } = createStorage();
  storage.updateStats('daily', true, 2);
  const dailyBefore = storage.getStats('daily');
  const free = storage.updateStats('free', false, 6);
  assert.equal(free.played, 1);
  assert.equal(storage.getStats('daily').currentStreak, dailyBefore.currentStreak);
  const loss = storage.updateStats('daily', false, 6);
  assert.equal(loss.played, 2);
  assert.equal(loss.currentStreak, 0);
  assert.equal(loss.won, 1);
});

test('estado diário só é restaurado para a data salva', () => {
  const { storage } = createStorage();
  storage.saveDailyState('2026-10-27', { currentRow: 2, gameOver: false });
  assert.deepEqual(JSON.parse(JSON.stringify(storage.getDailyState('2026-10-27'))), {
    date: '2026-10-27',
    currentRow: 2,
    gameOver: false
  });
  assert.equal(storage.getDailyState('2026-10-28'), null);
});
