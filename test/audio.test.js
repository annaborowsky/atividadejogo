const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBrowserScript } = require('./helpers');

function createAudioManager(audioContextConstructor = class {}) {
  const { window } = loadBrowserScript('js/audio.js', {
    window: { AudioContext: audioContextConstructor }
  });
  return window.Audio;
}

test('som desativado não inicializa o contexto nem toca áudio', () => {
  let created = 0;
  const audio = createAudioManager(class {
    constructor() {
      created++;
    }
  });
  audio.setEnabled(false);
  audio.playClick();
  assert.equal(created, 0);
});

test('tom configura frequência, tipo, volume e duração solicitados', () => {
  const oscillator = {
    frequency: {},
    connect() {},
    start(value) {
      this.startedAt = value;
    },
    stop(value) {
      this.stoppedAt = value;
    }
  };
  const gain = {
    gain: {
      setValueAtTime(value, time) {
        this.initial = [value, time];
      },
      exponentialRampToValueAtTime(value, time) {
        this.final = [value, time];
      }
    },
    connect() {}
  };
  const audio = createAudioManager(class {
    constructor() {
      this.state = 'running';
      this.currentTime = 2;
      this.destination = {};
    }
    createOscillator() {
      return oscillator;
    }
    createGain() {
      return gain;
    }
  });

  audio.playTone(440, 0.25, 'triangle', 0.4);
  assert.equal(oscillator.frequency.value, 440);
  assert.equal(oscillator.type, 'triangle');
  assert.equal(oscillator.startedAt, 2);
  assert.equal(oscillator.stoppedAt, 2.25);
  assert.deepEqual(gain.gain.initial, [0.4, 2]);
  assert.deepEqual(gain.gain.final, [0.01, 2.25]);
});

test('inicializa Web Audio usando a alternativa webkit quando disponível', () => {
  let created = 0;
  const { window } = loadBrowserScript('js/audio.js', {
    window: {
      webkitAudioContext: class {
        constructor() {
          created++;
        }
      }
    }
  });
  window.Audio.init();
  assert.equal(created, 1);
});
