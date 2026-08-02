// Utilitarios para o @ (handle) publico do usuario, usado nos comentarios.
// Formato: minusculas, numeros, ponto e underline; 3 a 30 caracteres.

const RE_HANDLE = /^[a-z0-9._]{3,30}$/;

// Normaliza o texto digitado para o formato de armazenamento (sem o @,
// minusculo, sem espacos/acentos). Retorna null se ficar vazio.
export function normalizarHandle(v: string | null | undefined): string | null {
  if (!v) return null;
  const limpo = v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .trim()
    .toLowerCase()
    .replace(/^@+/, "") // tira @ do inicio
    .replace(/\s+/g, "") // sem espacos
    .replace(/[^a-z0-9._]/g, ""); // so caracteres permitidos
  return limpo.length ? limpo : null;
}

// Valida um handle ja normalizado. Retorna mensagem de erro ou null (ok).
export function validarHandle(h: string): string | null {
  if (!RE_HANDLE.test(h)) {
    return "O @ deve ter de 3 a 30 caracteres: letras, números, ponto ou _.";
  }
  return null;
}
