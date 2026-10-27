# RELATÓRIO DE AUDITORIA - Jogo "Caça-palavras"

**Data da Auditoria:** 27/10/2026  
**Arquivos Analisados:** docs/plans/PRD.md, SPECS.md, index.html, css/style.css, js/words.js, js/storage.js, js/audio.js, js/game.js  

---

## CHECKLIST OBRIGATÓRIO

| # | Requisito | Status | Observações |
|---|----------|--------|-------------|
| 1 | Palavra de 5 letras, 6 tentativas | CONFORME | Tabuleiro 6x5 implementado. game.js conta até 6 tentativas (gameOver na linha 5). |
| 2 | Feedback verde/amarelo/cinza correto | CONFORME | Algoritmo em getFeedback() segue regra do Wordle (verdes primeiro, depois amarelos com cópia do array). Trata repetições corretamente. |
| 3 | Modos Diário e Livre | CONFORME | Botões em index.html e lógica em game.js. |
| 4 | Palavra do dia determinística por data | CONFORME | getDailyAnswer() usa data YYYY-MM-DD como seed com hash determinístico. |
| 5 | Dica custa 1 tentativa | NÃO CONFORME | Botão existe, mas useHint() apenas preenche letra correta na linha atual sem avançar tentativa/submeter. Não consome 1 tentativa conforme especificado. |
| 6 | Modo difícil opcional | PARCIAL | Botão/persistência existem, mas checkHardMode() sempre retorna true. Não valida regras (letras verdes fixas, amarelas presentes em outra posição, cinzas). |
| 7 | Validação de palavras no dicionário | CONFORME | isValidWord() normaliza acentos/ç, verifica em VALID_GUESSES. Rejeita com "Palavra não encontrada" e shake. |
| 8 | Estatísticas completas | CONFORME | Jogadas, vitórias, %, streak, maior streak, distribuição 1-6. Separados por modo. |
| 9 | Persistência em localStorage | CONFORME | Storage gerencia stats, prefs, estado diário, última data. |
| 10 | Teclado virtual + físico | CONFORME | Ambos implementados e chamam handleKey(). |
| 11 | Animações flip/shake | CONFORME | CSS animations aplicadas em showGuess() e shakeRow(). |
| 12 | Sons via Web Audio API com mute | CONFORME | AudioManager com tons sintetizados, controle de mute persistente. |
| 13 | Tema claro/escuro | CONFORME | CSS variables, toggle, persistido. |
| 14 | Responsivo | CONFORME | Media queries e viewport configurados. |
| 15 | Acessibilidade básica (ARIA, teclado) | PARCIAL | Roles ARIA presentes, foco visível, teclado funciona. Falta trap de foco em modais, listener ESC, melhor semântica para leitores de tela em alguns casos. |
| 16 | Sem dependências externas | CONFORME | Vanilla HTML/CSS/JS, fontes do sistema. |
| 17 | Funciona offline | CONFORME | Sem requisições, usa localStorage e Web Audio API. |

**NOTA GERAL: 7.5 / 10**

## PONTOS DE MELHORIA

### Críticos
1. **Dica deve consumir 1 tentativa** (PRD 4.6) - Implementar: ao usar dica, avançar para próxima linha/submeter tentativa ou incrementar contador de tentativas. Estado atual não penaliza tentativa.
2. **Modo difícil não funcional** (PRD 2.5, SPECS 5.4) - Implementar validação completa: letras verdes devem manter posição, letras amarelas devem estar presentes em posição diferente, letras cinzas não reutilizáveis com exceções para repetições válidas.

### Importantes
3. **Fechar modais com ESC** - Adicionar listener para tecla Escape fechando stats/end modals.
4. **Focus trap em modais** - Garantir foco preso e restaurado ao abrir/fechar (acessibilidade).
5. **Dica em modo difícil** - Quando dica revela letra, deve respeitar regras do modo difícil (já parcialmente considerado).
6. **Tratamento de streak** - Em Storage.updateStats() para modo livre, não atualiza streak (correto por design). Mas garantir lógica consistente.
7. **Palavra do dia - progresso** - Ao reabrir jogo diário com partida em andamento, `revealAllGuesses()` chamado se gameOver, senão restaura guesses. OK. Mas garantir que após derrota/vitória não permite nova jogada no mesmo dia (bloqueado por gameOver).
8. **Teclado físico desabilitado quando modal aberto** - Já feito (linha 93 game.js), OK.
9. **Dicionário com palavras truncadas** - Muitas palavras em VALID_GUESSES/ANSWERS tem apenas 4-5 chars truncados (ex: "DIADE", "LUADE", "ARVOR", "JANEL" - parecem truncadas). isValidWord normaliza mas palavras podem não ser "reais" PT-BR completas. Verificar se atende "dicionário PT-BR com palavras de 5 letras" conforme PRD 6.3.

### Menores
10. **aria-labels** - Alguns elementos podem melhorar descrição para leitores de tela.
11. **Transições/redução movimento** - CSS tem media query, mas toggle manual em prefs (`reduceMotion`) existe no schema mas não há botão/UI para ativar/desativar manualmente (só respeita prefers-reduced-motion). Opcional conforme spec.
12. **Mensagem de erro para modo difícil** - Implementar mensagem correta quando regra violada.
13. **Botão "Jogar novamente" no modo livre** - Funciona. No modo diário mostra "Volte amanhã" - OK.
14. **Animações de vitória** - CSS tem .tile.bounce/.glow mencionados no spec mas não usados no código. Pode adicionar.

## RECOMENDAÇÕES PRIORITÁRIAS

1. **PRIORITÁRIO 1:** Corrigir sistema de dica para consumir exatamente 1 tentativa (conforme PRD). 
2. **PRIORITÁRIO 2:** Implementar validação completa do Modo Difícil.
3. **PRIORITÁRIO 3:** Adicionar ESC para fechar modais e melhorar acessibilidade (focus trap).

## CONCLUSÃO

O jogo está bem estruturado, segue arquitetura proposta, tem boa separação de arquivos, feedback correto de cores, modos diário/livre, persistência, sons, temas. As principais falhas são a dica não consumir tentativa e o modo difícil não funcional - ambos explicitamente requeridos. Com correções nestes pontos, atinge conformidade quase total.
