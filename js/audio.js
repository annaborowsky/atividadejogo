// Caça-palavras - Efeitos sonoros via Web Audio API

class AudioManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
  }

  init() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API não suportada');
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      // Silenciosamente falhar
    }
  }

  playClick() {
    this.playTone(800, 0.05, 'square', 0.2);
  }

  playFlip() {
    this.playTone(500, 0.1, 'sine', 0.25);
  }

  playCorrect() {
    this.playTone(880, 0.15, 'sine', 0.3);
  }

  playPresent() {
    this.playTone(660, 0.15, 'sine', 0.3);
  }

  playError() {
    this.playTone(200, 0.3, 'sawtooth', 0.25);
  }

  playHint() {
    this.playTone(523, 0.1, 'sine', 0.25);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.25), 80);
  }

  playWin() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'sine', 0.3), i * 100);
    });
  }

  playLose() {
    const notes = [392, 330, 262];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.25, 'sine', 0.25), i * 150);
    });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

window.Audio = new AudioManager();
