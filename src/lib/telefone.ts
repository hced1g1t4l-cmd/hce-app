// Padronizacao de telefone (BR). Usada no cadastro, perfil, contato e leads,
// para que o numero fique sempre no mesmo formato e o painel nao vire bagunca.
//
// Formato canonico BR:
//   - celular (11 digitos): (DD) 9XXXX-XXXX
//   - fixo (10 digitos):    (DD) XXXX-XXXX
// Numeros fora do padrao BR (ex.: internacionais) sao mantidos como digitos
// com "+" na frente, sem quebrar o cadastro.

export function soDigitos(v: string): string {
  return (v || "").replace(/\D/g, "");
}

// Remove o codigo do pais (55) quando vier junto de um numero BR completo.
function semDDI(d: string): string {
  if (d.length > 11 && d.startsWith("55")) return d.slice(2);
  return d;
}

// Mascara progressiva para usar no onInput dos campos (enquanto digita).
export function mascaraTelefone(v: string): string {
  let d = semDDI(soDigitos(v)).slice(0, 11);
  const n = d.length;
  if (n === 0) return "";
  if (n < 3) return `(${d}`;
  if (n <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (n <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Formato canonico para GRAVAR no banco. Garante consistencia mesmo que o
// usuario cole o numero de qualquer jeito.
export function normalizarTelefone(v: string | null | undefined): string | null {
  const bruto = (v || "").trim();
  if (!bruto) return null;

  const temMais = bruto.trim().startsWith("+");
  let d = soDigitos(bruto);
  if (!d) return null;

  const semCodigo = semDDI(d);
  if (semCodigo.length === 11) {
    return `(${semCodigo.slice(0, 2)}) ${semCodigo.slice(2, 7)}-${semCodigo.slice(7)}`;
  }
  if (semCodigo.length === 10) {
    return `(${semCodigo.slice(0, 2)}) ${semCodigo.slice(2, 6)}-${semCodigo.slice(6)}`;
  }
  // Fora do padrao BR: preserva os digitos (com + se era internacional).
  return temMais ? `+${d}` : d;
}
