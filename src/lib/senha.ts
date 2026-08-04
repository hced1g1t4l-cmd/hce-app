import crypto from "crypto";

// Geracao de senhas provisorias com aleatoriedade CRIPTOGRAFICA (crypto),
// nao Math.random(). Usada ao criar admin ou resetar senha no painel.
//
// Formato: sempre atende a regra de senha forte do sistema (maiuscula,
// minuscula, numero e simbolo) e tem entropia alta (~12 caracteres).

// Alfabetos sem caracteres ambiguos (0/O, 1/l/I) para leitura/ditado.
const MAIUS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const MINUS = "abcdefghijkmnpqrstuvwxyz";
const NUMS = "23456789";
const SIMB = "!@#$%&*?";
const TODOS = MAIUS + MINUS + NUMS + SIMB;

function escolher(alfabeto: string): string {
  // crypto.randomInt e uniforme e sem vies de modulo.
  return alfabeto[crypto.randomInt(alfabeto.length)]!;
}

export function gerarSenhaProvisoria(tamanho = 12): string {
  const min = Math.max(tamanho, 8);
  const chars: string[] = [
    escolher(MAIUS),
    escolher(MINUS),
    escolher(NUMS),
    escolher(SIMB),
  ];
  while (chars.length < min) chars.push(escolher(TODOS));

  // Embaralha (Fisher-Yates) com indices criptograficos para nao vazar a
  // posicao fixa de cada classe de caractere.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}
