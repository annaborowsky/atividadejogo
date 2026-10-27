# PRD — Caça-palavras

**Documento de Requisitos do Produto**
Versão 1.0 — 20/10/2026

---

## 1. Visão Geral

**Caça-palavras** é um jogo casual de adivinhação de palavras no estilo Wordle/Termo, totalmente em português (BR), rodando no navegador (só frontend, sem servidor). O jogador tem **6 tentativas** para descobrir uma palavra secreta de **5 letras**, recebendo feedback de cores a cada chute.

| Item | Definição |
|---|---|
| **Nome do jogo** | Caça-palavras |
| **Plataforma** | Web (HTML/CSS/JavaScript puro) |
| **Idioma** | Português (BR) |
| **Público-alvo** | Público geral, fãs de jogos de palavras (Termo, Wordle) |
| **Estilo visual** | Minimalista tipo Wordle |
| **Persistência** | `localStorage` (sem login, sem backend) |

## 2. Regras do Jogo

1. A palavra secreta tem sempre **5 letras**.
2. O jogador dispõe de **6 tentativas**.
3. A cada tentativa, o jogo informa o quão perto o chute está:
   - 🟩 **Verde** — letra correta, na posição correta
   - 🟨 **Amarelo** — letra existe na palavra, mas em outra posição
   - ⬜ **Cinza** — letra não existe na palavra
4. **Validação:** palavras fora do dicionário PT-BR são rejeitadas com aviso ("Palavra não encontrada").
5. **Modo difícil (opcional, ativável):** após um chute, as tentativas seguintes *devem* respeitar as dicas verdes e amarelas já dadas.
6. Fim de jogo: vitória ao acertar nas 6 tentativas, derrota na 6ª tentativa errada. Ambos mostram a palavra correta.

## 3. Modos de Jogo

| Modo | Descrição |
|---|---|
| **Desafio diário** | 1 palavra por dia, idêntica para todos os jogadores (gerada a partir da data, sem servidor). Reinicia à meia-noite. |
| **Modo livre** | Palavra aleatória a cada partida, jogável quantas vezes quiser. |

## 4. Funcionalidades

- **Tabuleiro** 6×5 com animação de "virar" as letras (flip) ao confirmar.
- **Teclado virtual** (mobile e desktop) que acende as letras conforme o feedback (verde/amarelo/cinza). Também aceita teclado físico.
- **Sistema de dicas:** botão "Dica" que **custa 1 tentativa** — revela uma letra na posição correta (verde). Sem dicas gratuitas.
- **Estatísticas** (modo diário e livre separados): partidas jogadas, vitórias, % de vitória, sequência atual (streak), maior sequência e distribuição de tentativas (1–6).
- **Modo difícil** com alternador nas configurações.
- **Animações e sons:** flip das letras, shake em palavra inválida, som de acerto/erro/comemoração (com botão de mute).
- **Persistência:** tudo salvo em `localStorage` (progresso do dia, estatísticas, preferências), sem login.

## 5. Fora de Escopo (v1)

- Compartilhar resultado em redes sociais
- Temas/categorias de palavras
- Conquistas / níveis
- Modo multiplayer / PvP
- Backend, contas e login
- Monetização

## 6. Critérios de Aceite

- Jogável em celular e desktop (responsivo).
- Palavra do dia determinada pela data (mesmo resultado para todos no mesmo dia).
- Dicionário PT-BR com palavras de 5 letras + lista de respostas curada (evitar palavras obscuras).
- Estatísticas persistem após fechar o navegador.
- Sem erros no console; funciona offline após o primeiro carregamento.
- Algoritmo de feedback trata corretamente letras repetidas (regra do Wordle).

## 7. Estrutura Técnica

```
index.html      → estrutura
style.css       → layout minimalista + animações
game.js         → lógica do jogo (tabuleiro, validação, feedback)
words.js        → dicionário PT-BR e lista de respostas
storage.js      → localStorage (stats, streak, preferências)
```

## 8. Plano de Implementação

1. **`index.html`** — estrutura: tabuleiro 6×5, teclado virtual, cabeçalho com seletor de modo (Diário/Livre), botões (dica, modo difícil, mute), modal de estatísticas e fim de jogo.
2. **`style.css`** — tema minimalista estilo Wordle (neutro, verde/amarelo/cinza), responsivo para mobile/desktop, animações de flip, shake e pop.
3. **`words.js`** — lista de respostas PT-BR (palavras comuns de 5 letras) + dicionário de validação (aceitar também palavras válidas que não são respostas).
4. **`game.js`** — núcleo do jogo: geração da palavra do dia (baseada na data, hash determinístico), modo livre aleatório, algoritmo de feedback de cores (tratando letras repetidas corretamente), validação de palavras, modo difícil, dica = tentativa sacrificada, sons (Web Audio API) e animações.
5. **`storage.js`** — `localStorage`: estatísticas separadas por modo, streak, maior streak, distribuição de tentativas, preferências (som, modo difícil) e controle da palavra do dia.

**Ordem de execução:** words.js → storage.js → game.js → index.html → style.css → testes manuais (validação, letras repetidas, virada da meia-noite, persistência).
