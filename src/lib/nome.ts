// Normaliza nomes para exibicao: primeira letra de cada nome/sobrenome em
// maiuscula, o resto minusculo, independentemente de como foi digitado.
// Conectivos comuns (de, da, do...) ficam minusculos, exceto se forem a 1a palavra.
const CONECTIVOS = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "di",
  "du",
  "del",
  "la",
  "van",
  "von",
]);

function capitalizarParte(p: string): string {
  if (!p) return p;
  return (
    p.charAt(0).toLocaleUpperCase("pt-BR") + p.slice(1).toLocaleLowerCase("pt-BR")
  );
}

export function capitalizarNome(nome?: string | null): string {
  if (!nome) return "";
  return nome
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .map((palavra, i) => {
      if (i > 0 && CONECTIVOS.has(palavra)) return palavra;
      // Trata nomes compostos com hifen (ex.: Jean-Pierre).
      return palavra.split("-").map(capitalizarParte).join("-");
    })
    .join(" ");
}
