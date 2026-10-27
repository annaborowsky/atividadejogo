// Caça-palavras - Dicionário PT-BR
// Lista de respostas (palavras que podem ser sorteadas) e dicionário de validação

const ANSWERS = [
  "CASA", "MESA", "GATO", "TERRA", "LIVRO", "PEDRA", "FORTE", "BRACO", "CACHO", "MARTE",
  "NOITE", "DIADE", "SOLAR", "LUADE", "MUNDO", "CHUVA", "VENTO", "FOGO", "AGUA", "FLOR",
  "ARVOR", "FRUTA", "CARRO", "NAVIO", "AVIAO", "PORTA", "JANEL", "CAMA", "SOFA", "MESA",
  "PAPEL", "CANET", "LAPIS", "RELOG", "CHAVE", "CADEI", "BANCO", "PRATO", "COPO", "FACA",
  "TIGRE", "LEAO", "URSO", "LOBO", "RATO", "PEIXE", "PASSA", "CORVO", "CAMELO", "ZEBRA",
  "VERDE", "AZUL", "PRETO", "BRANCO", "CINZA", "AMARE", "ROXO", "ROSA", "BEGE", "MARRO",
  "FELIZ", "TRIST", "FORTE", "FRACO", "RAPID", "LENTO", "GRAND", "PEQUE", "NOVO", "VELHO"
];

// Dicionário de validação (respostas + palavras válidas para chutes)
const VALID_GUESSES = [
  ...ANSWERS,
  "ABRIR", "AFETO", "ALEGR", "AMIGO", "ANIMO", "APOIO", "AROMA", "AUDIO", "AUTOR", "BALCA",
  "BEBER", "BEIJO", "BOLSA", "BORDA", "BRISA", "CABER", "CALMA", "CANTO", "CAPAZ", "CARNE",
  "CAUSA", "CESTA", "CHAPA", "CHEIO", "CIVIL", "CLARO", "COBRA", "COLAR", "COMER", "CORPO",
  "CRIAN", "CUIDA", "CURSO", "DANCA", "DEBIL", "DEVER", "DIZER", "DOLOR", "DURAR", "ELEVA",
  "ENTRA", "EQUIP", "ERRO", "ESCOL", "ESPIR", "ESTAR", "EXATO", "FALAR", "FALHA", "FARDO",
  "FESTA", "FIGUR", "FINAL", "FIRME", "FOLHA", "FORMA", "FRASE", "FREIO", "FRUTO", "FUNDO",
  "GANHO", "GARFO", "GELAD", "GESTO", "GIRAR", "GLOBO", "GRACA", "GRAOS", "GRITO", "GRUPO",
  "GUIA", "HABIL", "HONRA", "HUMOR", "IDEAL", "IGUAL", "IMPAR", "INDIO", "INSTA", "JOGAR",
  "JUNTO", "JUSTO", "LABOR", "LANCAR", "LEGAL", "LEITO", "LETRA", "LIMPO", "LINHA", "LISTA",
  "LIVRE", "LOGIC", "LONGE", "LUZIR", "MACIO", "MAGIA", "MALHA", "MANHA", "MASSA", "MEDIR",
  "MENTE", "METRO", "MICRO", "MILHO", "MINHA", "MOLHO", "MORAR", "MOTOR", "MUDAR", "MULTA",
  "NOBRE", "NORMA", "NORTE", "NOTAR", "NUVEM", "OBRA", "OLHAR", "ONDA", "ORDEM", "OUVIR",
  "PALHA", "PARAR", "PASSE", "PASTA", "PAZAR", "PEDIR", "PENSAR", "PERDA", "PODER", "POEMA",
  "PONTE", "PORTE", "POSAR", "POSTE", "POVO", "PRAZO", "PRECO", "PRETO", "PRIME", "PULAR",
  "PUNHO", "QUAL", "QUANT", "QUEBR", "QUERO", "QUILO", "RACAO", "RAIZ", "RAPAZ", "RAZAO",
  "RECAR", "REGRA", "REINO", "RELOG", "RENDA", "REPOR", "RESTO", "RIR", "ROCHA", "ROLAR",
  "ROSTO", "ROUBO", "ROUPA", "SABER", "SABOR", "SALTO", "SANGU", "SANTO", "SAUDE", "SECAR",
  "SEGUI", "SENHA", "SENSO", "SERVO", "SINAL", "SOBRE", "SONHO", "SORTE", "SUBIR", "SUJO",
  "TANTO", "TARDE", "TECLA", "TEMPO", "TENSA", "TERMO", "TESTE", "TEXTO", "TIRAR", "TOCAR",
  "TOMAR", "TORRE", "TRAB", "TRATO", "TREMO", "TRIBO", "TRIST", "TROCA", "TURNO", "UNIDO",
  "URGEN", "USUAL", "VAGAR", "VALID", "VARIA", "VASTO", "VELA", "VENDO", "VERAO", "VERSO",
  "VESTE", "VIAJAR", "VIGIA", "VINTE", "VIRAL", "VISIT", "VITAL", "VIVER", "VOLTA", "VONTA",
  "VOTAR", "ZELAR"
].map(w => w.length === 5 ? w : w.padEnd(5, 'A').substring(0,5));

function normalizeWord(word) {
  return word.toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace('Ç', 'C');
}

function isValidWord(word) {
  const normalized = normalizeWord(word);
  if (normalized.length !== 5) return false;
  return VALID_GUESSES.some(w => normalizeWord(w) === normalized);
}

function getRandomAnswer() {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
}

function getDailyAnswer(date = new Date()) {
  const seed = date.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ANSWERS[hash % ANSWERS.length];
}

window.Words = {
  ANSWERS,
  VALID_GUESSES,
  normalizeWord,
  isValidWord,
  getRandomAnswer,
  getDailyAnswer
};
