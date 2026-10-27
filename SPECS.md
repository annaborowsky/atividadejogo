# SPECS.md — Especificação Técnica: Caça-palavras

**Versão:** 1.0  
**Data:** 27/10/2026  
**Baseado em:** `docs/plans/PRD.md`  
**Design escolhido:** Protótipo 3 — Design Visual "Expedição Noturna" (com incorporação de boas práticas dos protótipos 1 e 2)

---

## 1. Objetivo

Este documento tem como objetivo detalhar a arquitetura, tecnologias, regras, componentes e plano de implementação para o jogo **Caça-palavras**, um jogo web casual de adivinhação de palavras no estilo Wordle/Termo, em português do Brasil.

---

## 2. Arquitetura e Tecnologias

| Tecnologia | Justificativa |
|---|---|
| **HTML5** | Estrutura semântica, acessível e compatível com todos os navegadores modernos. |
| **CSS3 (Vanilla)** | Uso de CSS Variables, Grid, Flexbox, animações 3D e `@media` para responsividade. Sem pré-processadores. |
| **JavaScript (Vanilla ES6+)** | Lógica pura, sem frameworks. Leve, rápido e fácil de manter. |
| **Web Audio API** | Geração de sons sintetizados (clique, flip, acerto, erro, vitória) sem arquivos externos. |
| **localStorage** | Persistência de estatísticas, progresso, preferências e controle do desafio diário. |

O projeto será **100% frontend**, sem backend, sem dependências externas (CDN) e deverá funcionar offline após o primeiro carregamento.

---

## 3. Estrutura de Arquivos

A implementação seguirá a seguinte organização:

```text
/
├── index.html        # Estrutura principal da aplicação
├── css/
│   └── style.css     # Estilos, temas, animações e variáveis CSS
├── js/
│   ├── words.js      # Lista de respostas e dicionário de validação PT-BR
│   ├── storage.js    # Gerenciamento de localStorage (stats, streak, prefs)
│   ├── audio.js      # Efeitos sonoros via Web Audio API
│   └── game.js       # Lógica principal do jogo
└── assets/           # (Opcional) - Não utilizado. Sons gerados via Web Audio API
```

---

## 4. Identidade Visual (Design Escolhido)

### 4.1. Conceito
**"Expedição Noturna"** - O jogador assume o papel de um explorador caçando a palavra oculta. O tabuleiro é representado como um radar de expedição, transmitindo a sensação de descoberta a cada tentativa.

### 4.2. Paleta de Cores

#### Tema Escuro (Padrão - "Radar Noturno")
| Token | Cor (HEX) | Uso |
|---|---|---|
| `--bg-primary` | `#0D141B` | Fundo principal |
| `--bg-secondary` | `#16202C` | Fundo de modais e componentes |
| `--brand-cyan` | `#4FC3D9` | Logo, destaques e elementos da marca |
| `--text-primary` | `#E6EDF3` | Texto principal |
| `--text-secondary` | `#9BA3AF` | Texto secundário |
| `--border` | `#2C3845` | Bordas e divisores |
| `--correct` | `#4AA96C` | Letra correta na posição correta |
| `--present` | `#D9A13B` | Letra correta na posição errada |
| `--absent` | `#37454F` | Letra não presente na palavra |
| `--key-bg` | `#2C3845` | Teclado virtual |
| `--key-text` | `#E6EDF3` | Texto do teclado |

#### Tema Claro ("Caderno de Campo")
| Token | Cor (HEX) | Uso |
|---|---|---|
| `--bg-primary` | `#F3EFE4` | Fundo em tom papel envelhecido |
| `--bg-secondary` | `#EDE6D3` | Modais e componentes |
| `--brand-cyan` | `#0F7C90` | Logo e destaques |
| `--text-primary` | `#2D2A26` | Texto principal |
| `--text-secondary` | `#6B645B` | Texto secundário |
| `--border` | `#C9C0A8` | Bordas |
| `--correct` | `#4AA96C` | Verde (mantido para semântica) |
| `--present` | `#B88A2E` | Âmbar mais escuro para contraste |
| `--absent` | `#7A7263` | Cinza terroso |

### 4.3. Tipografia

| Elemento | Fonte | Peso | Observação |
|---|---|---|---|
| **Logo "Caça-palavras"** | `Georgia, 'Times New Roman', serif` | 700 | Remete a um diário/caderno de campo |
| **Títulos e UI** | `system-ui, -apple-system, BlinkMacSystemFont, sans-serif` | 600-700 | Limpo e legível |
| **Tabuleiro (letras)** | `system-ui, sans-serif` | 800 | Máxima legibilidade em tamanhos grandes |
| **Corpo e textos** | `system-ui, sans-serif` | 400-500 | Padrão para melhor leitura |

*Todas as fontes são nativas do sistema, garantindo funcionamento 100% offline.*

---

## 5. Regras de Jogo e Lógica

### 5.1. Regras Fundamentais
- **Tamanho da palavra:** Sempre 5 letras.
- **Tentativas:** Máximo 6 tentativas por partida.
- **Feedback por cor:** Verde (correto e posição correta), Amarelo (presente mas posição errada), Cinza (ausente).
- **Validação:** Apenas palavras presentes no dicionário PT-BR são aceitas.
- **Vitória:** Ao adivinhar a palavra correta em até 6 tentativas.
- **Derrota:** Ao esgotar as 6 tentativas sem acerto. A palavra correta deve ser revelada.

### 5.2. Algoritmo de Feedback (Letras Repetidas)
**Crítico:** Deve seguir exatamente a regra do Wordle para evitar inconsistências.

```javascript
function getFeedback(guess, solution) {
  const result = Array(5).fill('absent');
  const solutionCopy = solution.split('');
  const guessArr = guess.split('');
  
  // 1º Passo: Marcar acertos exatos (Verde)
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === solutionCopy[i]) {
      result[i] = 'correct';
      solutionCopy[i] = null;
    }
  }
  
  // 2º Passo: Marcar letras presentes em posição errada (Amarelo)
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'absent' && solutionCopy.includes(guessArr[i])) {
      result[i] = 'present';
      const idx = solutionCopy.indexOf(guessArr[i]);
      solutionCopy[idx] = null;
    }
  }
  
  return result;
}
```

### 5.3. Modos de Jogo

| Modo | Comportamento |
|---|---|
| **Desafio Diário** | Uma palavra única por dia, gerada deterministicamente com base na data (`YYYY-MM-DD`). Todos os jogadores recebem a mesma palavra. Progresso e vitória/derrota são bloqueados até o próximo dia. |
| **Modo Livre** | Palavra aleatória selecionada da lista de respostas a cada nova partida. Permite jogar quantas vezes quiser sem restrição de data. |

#### Geração da Palavra do Dia
```javascript
function getDailyWord(date = new Date()) {
  const seed = date.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ANSWERS[hash % ANSWERS.length];
}
```

### 5.4. Modo Difícil
Quando ativado, todas as tentativas subsequentes **devem obrigatoriamente utilizar** todas as informações reveladas nas tentativas anteriores.

**Regras de validação:**
- Toda letra marcada como **verde** deve permanecer na **mesma posição**.
- Toda letra marcada como **amarela** deve estar **presente** na palavra, mas **em posição diferente** da tentativa onde foi revelada.
- Letras marcadas como **cinza** não podem ser utilizadas novamente (com exceção a casos de letras repetidas onde já existe uma correspondência verde/amarela válida).

Caso a tentativa viole estas regras, exibir mensagem: *"Modo difícil: use todas as dicas reveladas"* e impedir o envio.

### 5.5. Sistema de Dicas
- **Custo:** 1 tentativa.
- **Efeito:** Revela **uma letra na posição correta** (aplica visualmente como verde) na linha atual.
- **Comportamento:** Ao utilizar a dica, a tentativa é contabilizada como "gasta".
- **Limitações:** Não disponível após o jogo terminar. Pode ser usado mesmo em modo difícil (mas deve respeitar as regras vigentes).

---

## 6. Componentes da Interface

| Componente | Descrição | Requisitos |
|---|---|---|
| **Header** | Logo "Caça-palavras", seletor Diário/Livre, botões de ação | Semântico, acessível via teclado |
| **Tabuleiro 6x5** | Grid principal com 30 células | `role="grid"`, animação flip 3D ao revelar, shake em palavra inválida |
| **Teclado Virtual** | Teclado QWERTY com teclas especiais (ENTER, ←) | Acende cores conforme feedback, `role="group"`, suporte a navegação por setas |
| **Botão Dica** | "💡 Usar dica (-1 tentativa)" | Desabilitado se sem tentativas ou jogo encerrado |
| **Botões de Ação** | Modo Difícil, Estatísticas, Som, Alternar Tema | Ícones com `aria-label`, zonas de toque >= 44px |
| **Modal de Estatísticas** | Estatísticas por modo, streak, maior streak, distribuição | Foco preso, fecha com ESC, restaura foco ao abrir/fechar |
| **Modal de Fim de Jogo** | Vitória/Derrota, palavra correta, botão "Jogar novamente" (modo livre) ou "Voltar amanhã" (modo diário) | Anunciado via live region, foco no primeiro elemento interativo |
| **Toast/Status Bar** | Mensagens temporárias | `aria-live="polite"`, não bloqueia interação |

---

## 7. Persistência (localStorage)

### 7.1. Chaves Utilizadas

| Chave | Tipo | Descrição |
|---|---|---|
| `cp_stats_daily` | JSON | Estatísticas do modo diário |
| `cp_stats_free` | JSON | Estatísticas do modo livre |
| `cp_prefs` | JSON | Preferências (tema, som, modo difícil, animações reduzidas) |
| `cp_daily_state` | JSON | Estado da partida diária do dia atual (progresso, tentativas, status) |
| `cp_last_played_date` | String | Data da última partida diária (`YYYY-MM-DD`) |

### 7.2. Schema de Estatísticas

```json
{
  "played": 0,
  "won": 0,
  "currentStreak": 0,
  "maxStreak": 0,
  "distribution": [0, 0, 0, 0, 0, 0],
  "lastPlayed": "2026-10-27"
}
```

### 7.3. Schema de Preferências

```json
{
  "theme": "dark",
  "sound": true,
  "hardMode": false,
  "reduceMotion": false
}
```

---

## 8. Acessibilidade (WCAG 2.1 AA)

| Critério | Implementação |
|---|---|
| **1.4.1 Uso de cor** | Além da cor, usar símbolo na célula (✓, ~, ✕), borda diferenciada e indicação semântica. |
| **1.4.3 Contraste** | Mínimo 4.5:1 para texto, 3:1 para elementos gráficos. |
| **1.4.10 Reflow** | Funcionar em zoom 200% sem scroll horizontal. Uso de `clamp()` e unidades relativas. |
| **2.1.1 Teclado** | Todas as ações acessíveis por teclado (Tab, Enter, Space, Backspace, Setas). |
| **2.4.7 Foco visível** | `outline` visível com bom contraste. |
| **4.1.2 Nome, Função, Valor** | `role="grid"`, `role="gridcell"`, `role="dialog"`, `aria-modal`, `aria-live`, `aria-label`. |
| **Movimento reduzido** | Respeitar `prefers-reduced-motion`. Toggle manual disponível. |
| **Anúncios** | `role="status"` para feedback, `role="alert"` para erros. |
| **Focus Trap** | Em modais, foco preso e restaurado ao fechar. |

---

## 9. Animações e Sons

### 9.1. Animações CSS
| Animação | Duração | Efeito |
|---|---|---|
| **Flip 3D** | 500ms | Rotação em X ao revelar feedback |
| **Shake** | 500ms | Tremor horizontal em erros |
| **Pop** | 100ms | Escala ao digitar |
| **Bounce** | 600ms | Nas letras corretas da vitória |
| **Glow** | 800ms | Brilho pulsante na vitória |

### 9.2. Sons via Web Audio API
| Som | Uso |
|---|---|
| **Tecla** | Ao pressionar tecla |
| **Flip** | Ao revelar letra |
| **Correto/Presente/Erro** | Conforme feedback |
| **Dica** | Ao usar dica |
| **Vitória/Derrota** | Fim de jogo |

---

## 10. Plano de Implementação

| Ordem | Arquivo | Tarefas |
|---|---|---|
| **1** | `js/words.js` | Criar `ANSWERS` e `VALID_GUESSES` em PT-BR com normalização |
| **2** | `js/storage.js` | Gerenciamento de localStorage, stats, streak, prefs e estado diário |
| **3** | `js/audio.js` | Web Audio API para efeitos sonoros com controle de mute |
| **4** | `js/game.js` | Lógica principal, input, feedback, modos, modo difícil, dica, estatísticas |
| **5** | `css/style.css` | Temas, animações, responsividade |
| **6** | `index.html` | Estrutura, modais, ARIA, integração |
| **7** | Testes | Validação completa conforme critérios |

---

## 11. Critérios de Teste

| Caso de Teste | Esperado |
|---|---|
| **Letras repetidas** | Feedback correto seguindo regra Wordle |
| **Palavra inválida** | Toast + shake, não avança tentativa |
| **Modo difícil** | Bloqueia tentativas que violam dicas anteriores |
| **Dica** | Revela letra correta, consome 1 tentativa |
| **Vitória/Derrota** | Animações, sons, modal correto com estatísticas atualizadas |
| **Palavra do dia** | Idêntica para todos no mesmo dia, muda à meia-noite |
| **Persistência** | Progresso e preferências restaurados ao reabrir |
| **Responsividade** | Funciona 320px - 1920px |
| **Acessibilidade** | Navegável por teclado, leitores de tela funcionam, reduced motion respeitado |
| **Tema** | Alternância persiste sem flicker |
| **Sem dependências** | 100% offline, sem erros no console |

---

## 12. Checklist Final

- [ ] Estrutura de arquivos criada
- [ ] Jogo funcional (tabuleiro 6x5, 6 tentativas)
- [ ] Modos Diário e Livre
- [ ] Modo Difícil com validação
- [ ] Sistema de dicas (-1 tentativa)
- [ ] Estatísticas completas com persistência
- [ ] Design "Expedição Noturna" com tema claro/escuro
- [ ] Animações 3D e efeitos visuais
- [ ] Sons via Web Audio API com mute
- [ ] Acessibilidade WCAG 2.1 AA
- [ ] Responsivo mobile/desktop
- [ ] Sem dependências externas, funciona offline
- [ ] Sem erros no console

---

**Pronto para implementação.**
