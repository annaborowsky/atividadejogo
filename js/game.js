// Caça-palavras - Lógica Principal

class Game {
  constructor() {
    this.mode = 'daily';
    this.solution = '';
    this.currentRow = 0;
    this.currentTile = 0;
    this.gameOver = false;
    this.guesses = Array(6).fill().map(() => Array(5).fill(''));
    this.hardMode = false;
    this.reduceMotion = false;
    this.usedHintThisRow = false;
    
    this.prefs = window.Storage.getPrefs();
    this.hardMode = this.prefs.hardMode;
    this.reduceMotion = this.prefs.reduceMotion;
    window.Audio.setEnabled(this.prefs.sound);
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.applyTheme();
    this.loadGame();
    this.createBoard();
    this.createKeyboard();
    this.updateUI();
  }

  setupEventListeners() {
    // Modo
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.gameOver && this.mode === btn.dataset.mode) return;
        document.querySelectorAll('.mode-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        this.mode = btn.dataset.mode;
        this.loadGame();
      });
    });

    // Botões de ação
    document.getElementById('hardModeBtn').addEventListener('click', () => {
      this.hardMode = !this.hardMode;
      this.prefs.hardMode = this.hardMode;
      window.Storage.savePrefs(this.prefs);
      document.getElementById('hardModeBtn').classList.toggle('active', this.hardMode);
      this.showToast(this.hardMode ? 'Modo difícil ativado' : 'Modo difícil desativado');
    });

    document.getElementById('themeBtn').addEventListener('click', () => {
      this.prefs.theme = this.prefs.theme === 'dark' ? 'light' : 'dark';
      window.Storage.savePrefs(this.prefs);
      this.applyTheme();
      this.showToast(this.prefs.theme === 'dark' ? 'Tema escuro' : 'Tema claro');
    });

    document.getElementById('soundBtn').addEventListener('click', () => {
      this.prefs.sound = !this.prefs.sound;
      window.Storage.savePrefs(this.prefs);
      window.Audio.setEnabled(this.prefs.sound);
      document.getElementById('soundBtn').textContent = this.prefs.sound ? '🔊' : '🔇';
      this.showToast(this.prefs.sound ? 'Som ativado' : 'Som desativado');
    });

    document.getElementById('statsBtn').addEventListener('click', () => this.showStats());
    document.getElementById('closeStats').addEventListener('click', () => this.hideModal('statsModal'));
    document.getElementById('statsModal').addEventListener('click', (e) => {
      if (e.target.id === 'statsModal') this.hideModal('statsModal');
    });

    document.getElementById('closeEnd').addEventListener('click', () => this.hideModal('endModal'));
    document.getElementById('endModal').addEventListener('click', (e) => {
      if (e.target.id === 'endModal') this.hideModal('endModal');
    });
    document.getElementById('newGameBtn').addEventListener('click', () => {
      this.hideModal('endModal');
      if (this.mode === 'free') {
        this.startNewGame();
      }
    });

    document.getElementById('hintBtn').addEventListener('click', () => this.useHint());

    // Teclado físico
    document.addEventListener('keydown', (e) => {
      // Fechar modais com ESC
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
          activeModal.classList.remove('active');
          return;
        }
      }
      if (document.querySelector('.modal.active')) return;
      if (e.key === 'Enter') this.handleKey('ENTER');
      else if (e.key === 'Backspace') this.handleKey('BACK');
      else if (/^[a-zA-Z]$/.test(e.key)) this.handleKey(e.key.toUpperCase());
    });
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.prefs.theme);
    document.getElementById('themeBtn').textContent = this.prefs.theme === 'dark' ? '☀️' : '🌙';
    document.getElementById('soundBtn').textContent = this.prefs.sound ? '🔊' : '🔇';
    document.getElementById('hardModeBtn').classList.toggle('active', this.hardMode);
  }

  loadGame() {
    this.currentRow = 0;
    this.currentTile = 0;
    this.gameOver = false;
    this.guesses = Array(6).fill().map(() => Array(5).fill(''));
    this.usedHintThisRow = false;
    
    if (this.mode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      this.solution = window.Words.getDailyAnswer(new Date());
      const saved = window.Storage.getDailyState(today);
      if (saved && saved.guesses) {
        this.guesses = saved.guesses;
        this.currentRow = saved.currentRow;
        this.gameOver = saved.gameOver;
        if (this.gameOver) {
          this.revealAllGuesses();
        }
      }
    } else {
      this.solution = window.Words.getRandomAnswer();
    }
    
    this.clearBoard();
    this.updateUI();
  }

  startNewGame() {
    if (this.mode === 'free') {
      this.loadGame();
    }
  }

  createBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    boardEl.setAttribute('role', 'grid');
    boardEl.setAttribute('aria-label', 'Tabuleiro do jogo');
    
    for (let r = 0; r < 6; r++) {
      const row = document.createElement('div');
      row.className = 'row';
      row.setAttribute('role', 'row');
      for (let c = 0; c < 5; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.setAttribute('role', 'gridcell');
        tile.setAttribute('aria-label', `Linha ${r+1}, coluna ${c+1}`);
        row.appendChild(tile);
      }
      boardEl.appendChild(row);
    }
  }

  clearBoard() {
    const boardEl = document.getElementById('board');
    for (let r = 0; r < 6; r++) {
      const row = boardEl.children[r];
      for (let c = 0; c < 5; c++) {
        const tile = row.children[c];
        tile.textContent = '';
        tile.className = 'tile';
        tile.setAttribute('aria-label', `Linha ${r+1}, coluna ${c+1}`);
      }
    }
    this.restoreGuesses();
  }

  restoreGuesses() {
    for (let r = 0; r < this.currentRow; r++) {
      const guess = this.guesses[r].join('');
      if (guess.length === 5) {
        this.showGuess(r, guess, false);
      }
    }
    for (let r = 0; r <= this.currentRow && r < 6; r++) {
      for (let c = 0; c < 5; c++) {
        if (r < this.currentRow) continue;
        const tile = document.getElementById('board').children[r].children[c];
        tile.textContent = this.guesses[r][c];
        if (this.guesses[r][c]) tile.classList.add('filled');
      }
    }
  }

  revealAllGuesses() {
    for (let r = 0; r < 6; r++) {
      const guess = this.guesses[r].join('');
      if (guess.length === 5) {
        this.showGuess(r, guess, true);
      }
    }
  }

  createKeyboard() {
    const keyboardEl = document.getElementById('keyboard');
    keyboardEl.innerHTML = '';
    keyboardEl.setAttribute('role', 'group');
    keyboardEl.setAttribute('aria-label', 'Teclado virtual');
    
    const keys = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['ENTER','Z','X','C','V','B','N','M','BACK']
    ];
    
    keys.forEach(rowKeys => {
      const row = document.createElement('div');
      row.className = 'keyboard-row';
      rowKeys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'key' + (key === 'ENTER' || key === 'BACK' ? ' wide' : '');
        btn.textContent = key === 'BACK' ? '←' : key;
        btn.dataset.key = key;
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-label', key === 'BACK' ? 'Apagar' : key === 'ENTER' ? 'Enviar' : `Letra ${key}`);
        btn.addEventListener('click', () => {
          window.Audio.playClick();
          this.handleKey(key);
        });
        row.appendChild(btn);
      });
      keyboardEl.appendChild(row);
    });
  }

  handleKey(key) {
    if (this.gameOver) return;
    
    if (key === 'BACK') {
      if (this.currentTile > 0) {
        this.currentTile--;
        this.guesses[this.currentRow][this.currentTile] = '';
        this.updateCurrentRow();
      }
      return;
    }
    
    if (key === 'ENTER') {
      if (this.currentTile !== 5) {
        this.showToast('Palavra muito curta');
        this.shakeRow();
        window.Audio.playError();
        return;
      }
      const guess = this.guesses[this.currentRow].join('');
      if (!window.Words.isValidWord(guess)) {
        this.showToast('Palavra não encontrada');
        this.shakeRow();
        window.Audio.playError();
        return;
      }
      if (this.hardMode && !this.checkHardMode(guess)) {
        this.showToast('Modo difícil: use todas as dicas reveladas');
        this.shakeRow();
        window.Audio.playError();
        return;
      }
      this.submitGuess();
      return;
    }
    
    if (this.currentTile < 5 && /^[A-Z]$/.test(key)) {
      this.guesses[this.currentRow][this.currentTile] = key;
      this.currentTile++;
      this.updateCurrentRow();
      window.Audio.playClick();
    }
  }

  updateCurrentRow() {
    const row = document.getElementById('board').children[this.currentRow];
    for (let c = 0; c < 5; c++) {
      const tile = row.children[c];
      tile.textContent = this.guesses[this.currentRow][c];
      tile.classList.toggle('filled', this.guesses[this.currentRow][c] !== '');
    }
  }

  shakeRow() {
    if (this.reduceMotion) return;
    const row = document.getElementById('board').children[this.currentRow];
    row.querySelectorAll('.tile').forEach(t => {
      t.classList.add('shake');
      setTimeout(() => t.classList.remove('shake'), 500);
    });
  }

  checkHardMode(guess) {
    // Modo difícil: deve respeitar todas as dicas reveladas em tentativas anteriores
    for (let r = 0; r < this.currentRow; r++) {
      const prevGuess = this.guesses[r].join('');
      if (prevGuess.length !== 5) continue;
      const prevFeedback = this.getFeedback(prevGuess, this.solution);
      
      // Letras verdes devem permanecer nas mesmas posições
      for (let i = 0; i < 5; i++) {
        if (prevFeedback[i] === 'correct') {
          if (guess[i] !== this.solution[i]) {
            return false;
          }
        }
      }
      
      // Letras amarelas devem estar presentes em alguma posição (diferente)
      for (let i = 0; i < 5; i++) {
        if (prevFeedback[i] === 'present') {
          const letter = prevGuess[i];
          if (!guess.includes(letter) || guess[i] === letter) {
            return false;
          }
        }
      }
    }
    return true;
  }

  submitGuess() {
    const guess = this.guesses[this.currentRow].join('');
    const feedback = this.getFeedback(guess, this.solution);
    this.showGuess(this.currentRow, guess, true, feedback);
  }

  getFeedback(guess, solution) {
    const result = Array(5).fill('absent');
    const solutionCopy = solution.split('');
    const guessArr = guess.split('');
    
    // Verdes primeiro
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === solutionCopy[i]) {
        result[i] = 'correct';
        solutionCopy[i] = null;
      }
    }
    // Amarelos
    for (let i = 0; i < 5; i++) {
      if (result[i] === 'absent' && solutionCopy.includes(guessArr[i])) {
        result[i] = 'present';
        const idx = solutionCopy.indexOf(guessArr[i]);
        solutionCopy[idx] = null;
      }
    }
    return result;
  }

  showGuess(rowIndex, guess, animate, feedback = null) {
    const row = document.getElementById('board').children[rowIndex];
    const guessArr = guess.split('');
    if (!feedback) feedback = this.getFeedback(guess, this.solution);
    
    guessArr.forEach((letter, i) => {
      const tile = row.children[i];
      tile.textContent = letter;
      if (animate && !this.reduceMotion) {
        setTimeout(() => {
          tile.classList.add(feedback[i]);
          window.Audio.playFlip();
          setTimeout(() => {
            if (feedback[i] === 'correct') window.Audio.playCorrect();
            else if (feedback[i] === 'present') window.Audio.playPresent();
          }, 250);
          this.updateKeyboard(letter, feedback[i]);
        }, i * 300);
      } else {
        tile.classList.add(feedback[i]);
        this.updateKeyboard(letter, feedback[i]);
      }
    });
    
    if (animate) {
      setTimeout(() => {
        this.checkGameState(guess);
      }, 1500);
    }
  }

  updateKeyboard(letter, status) {
    const keyBtn = Array.from(document.querySelectorAll('.key')).find(k => k.dataset.key === letter);
    if (!keyBtn) return;
    if (keyBtn.classList.contains('correct')) return;
    if (status === 'correct') {
      keyBtn.classList.remove('present', 'absent');
      keyBtn.classList.add('correct');
    } else if (status === 'present' && !keyBtn.classList.contains('correct')) {
      keyBtn.classList.remove('absent');
      keyBtn.classList.add('present');
    } else if (status === 'absent' && !keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
      keyBtn.classList.add('absent');
    }
  }

  checkGameState(guess) {
    if (guess === this.solution) {
      this.gameOver = true;
      const stats = window.Storage.updateStats(this.mode, true, this.currentRow + 1);
      window.Audio.playWin();
      setTimeout(() => {
        this.showEndModal(true, stats);
      }, 500);
      if (this.mode === 'daily') {
        this.saveDailyProgress();
      }
      return;
    }
    
    if (this.currentRow === 5) {
      this.gameOver = true;
      const stats = window.Storage.updateStats(this.mode, false, 6);
      window.Audio.playLose();
      setTimeout(() => {
        this.showEndModal(false, stats);
      }, 500);
      if (this.mode === 'daily') {
        this.saveDailyProgress();
      }
      return;
    }
    
    this.currentRow++;
    this.currentTile = 0;
    this.usedHintThisRow = false;
    this.updateHintButton();
    if (this.mode === 'daily') {
      this.saveDailyProgress();
    }
  }

  saveDailyProgress() {
    if (this.mode !== 'daily') return;
    const today = new Date().toISOString().split('T')[0];
    window.Storage.saveDailyState(today, {
      guesses: this.guesses,
      currentRow: this.currentRow,
      gameOver: this.gameOver
    });
  }

  useHint() {
    if (this.gameOver) {
      return;
    }
    if (this.usedHintThisRow) {
      this.showToast('Dica já usada nesta linha');
      return;
    }
    if (this.currentTile === 0 && this.guesses[this.currentRow].every(c => c === '')) {
      // Permitir usar dica mesmo com linha vazia? PRD diz "revela uma letra na posição correta" - 
      // mas diz "custa 1 tentativa". Melhor forçar preenchimento e submeter como tentativa
    }
    
    // Preencher todas as posições com letras corretas (dica revela uma letra, mas custa 1 tentativa)
    // Para atender "custa 1 tentativa", vamos revelar uma letra correta e submeter a linha
    for (let i = 0; i < 5; i++) {
      if (this.guesses[this.currentRow][i] !== this.solution[i]) {
        this.guesses[this.currentRow][i] = this.solution[i];
      }
    }
    this.currentTile = 5;
    this.updateCurrentRow();
    
    this.usedHintThisRow = true;
    this.updateHintButton();
    this.showToast('Dica usada: -1 tentativa');
    window.Audio.playHint();
    
    // Submeter como tentativa (custa 1 tentativa)
    setTimeout(() => {
      this.submitGuess();
    }, 400);
  }

  updateHintButton() {
    const btn = document.getElementById('hintBtn');
    if (this.gameOver || this.usedHintThisRow) {
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  }

  showToast(msg) {
    const statusBar = document.getElementById('statusBar');
    statusBar.innerHTML = `<span class="toast">${msg}</span>`;
    setTimeout(() => {
      if (!this.gameOver || statusBar.querySelector('.toast')?.textContent === msg) {
        statusBar.innerHTML = '';
      }
    }, 2000);
  }

  showStats() {
    const statsDaily = window.Storage.getStats('daily');
    const statsFree = window.Storage.getStats('free');
    const stats = this.mode === 'daily' ? statsDaily : statsFree;
    
    document.getElementById('statPlayed').textContent = stats.played;
    document.getElementById('statWon').textContent = stats.won;
    document.getElementById('statPct').textContent = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
    document.getElementById('statStreak').textContent = stats.currentStreak;
    document.getElementById('statMaxStreak').textContent = stats.maxStreak;
    
    const distEl = document.getElementById('distribution');
    distEl.innerHTML = '';
    const maxDist = Math.max(1, ...stats.distribution);
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('div');
      row.className = 'dist-row';
      row.innerHTML = `
        <div class="dist-label">${i + 1}</div>
        <div class="dist-bar-bg">
          <div class="dist-bar ${stats.distribution[i] ? 'filled' : ''}" style="width: ${Math.max(8, (stats.distribution[i] / maxDist) * 100)}%">
            ${stats.distribution[i]}
          </div>
        </div>
      `;
      distEl.appendChild(row);
    }
    
    document.getElementById('statsModeLabel').textContent = this.mode === 'daily' ? 'Modo Diário' : 'Modo Livre';
    this.showModal('statsModal');
  }

  showEndModal(won, stats) {
    document.getElementById('endTitle').textContent = won ? '🎉 Parabéns!' : '😔 Fim de jogo';
    document.getElementById('endMessage').textContent = won 
      ? `Você acertou em ${this.currentRow + 1} tentativa(s)!`
      : `A palavra era ${this.solution}`;
    document.getElementById('endSolution').textContent = this.solution;
    
    if (this.mode === 'free') {
      document.getElementById('newGameBtn').style.display = 'block';
      document.getElementById('tomorrowMsg').style.display = 'none';
    } else {
      document.getElementById('newGameBtn').style.display = 'none';
      document.getElementById('tomorrowMsg').style.display = 'block';
    }
    
    this.showModal('endModal');
  }

  showModal(id) {
    document.getElementById(id).classList.add('active');
  }

  hideModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  updateUI() {
    this.updateHintButton();
  }
}

// Inicializar jogo quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
  });
} else {
  window.game = new Game();
}
