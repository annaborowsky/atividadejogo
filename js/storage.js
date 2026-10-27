// Caça-palavras - Gerenciamento de localStorage

class Storage {
  constructor() {
    this.keys = {
      statsDaily: 'cp_stats_daily',
      statsFree: 'cp_stats_free',
      prefs: 'cp_prefs',
      dailyState: 'cp_daily_state',
      lastPlayedDate: 'cp_last_played_date'
    };
  }

  getDefaultStats() {
    return {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0],
      lastPlayed: null
    };
  }

  getDefaultPrefs() {
    return {
      theme: 'dark',
      sound: true,
      hardMode: false,
      reduceMotion: false
    };
  }

  getStats(mode) {
    const key = mode === 'daily' ? this.keys.statsDaily : this.keys.statsFree;
    try {
      const data = localStorage.getItem(key);
      return data ? { ...this.getDefaultStats(), ...JSON.parse(data) } : this.getDefaultStats();
    } catch {
      return this.getDefaultStats();
    }
  }

  saveStats(mode, stats) {
    const key = mode === 'daily' ? this.keys.statsDaily : this.keys.statsFree;
    try {
      localStorage.setItem(key, JSON.stringify(stats));
    } catch (e) {
      console.warn('Erro ao salvar estatísticas:', e);
    }
  }

  updateStats(mode, won, attempts) {
    const stats = this.getStats(mode);
    stats.played++;
    stats.lastPlayed = new Date().toISOString().split('T')[0];
    
    if (won) {
      stats.won++;
      stats.distribution[attempts - 1]++;
      
      if (mode === 'daily') {
        const today = stats.lastPlayed;
        const last = localStorage.getItem(this.keys.lastPlayedDate);
        if (last === this.getYesterday()) {
          stats.currentStreak++;
        } else if (last !== today) {
          stats.currentStreak = 1;
        }
        if (stats.currentStreak > stats.maxStreak) {
          stats.maxStreak = stats.currentStreak;
        }
        localStorage.setItem(this.keys.lastPlayedDate, today);
      }
    } else {
      if (mode === 'daily') {
        stats.currentStreak = 0;
        localStorage.setItem(this.keys.lastPlayedDate, stats.lastPlayed);
      }
    }
    
    this.saveStats(mode, stats);
    return stats;
  }

  getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  getPrefs() {
    try {
      const data = localStorage.getItem(this.keys.prefs);
      return data ? { ...this.getDefaultPrefs(), ...JSON.parse(data) } : this.getDefaultPrefs();
    } catch {
      return this.getDefaultPrefs();
    }
  }

  savePrefs(prefs) {
    try {
      localStorage.setItem(this.keys.prefs, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Erro ao salvar preferências:', e);
    }
  }

  getDailyState(date) {
    try {
      const data = localStorage.getItem(this.keys.dailyState);
      if (!data) return null;
      const state = JSON.parse(data);
      if (state.date !== date) return null;
      return state;
    } catch {
      return null;
    }
  }

  saveDailyState(date, state) {
    try {
      localStorage.setItem(this.keys.dailyState, JSON.stringify({ date, ...state }));
    } catch (e) {
      console.warn('Erro ao salvar estado diário:', e);
    }
  }
}

window.Storage = new Storage();
