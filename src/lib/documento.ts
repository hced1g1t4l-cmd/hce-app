// Validacao de CPF (e CNPJ) — usado no checkout do Clube +HCE (Fase 2) e,
// depois, na emissao de NFS-e (Fase 4). O Asaas exige cpfCnpj valido no
// cadastro do cliente; validar aqui evita ida e volta a API e melhora a UX.

/** Mantem apenas digitos. */
export function soDigitos(v: string): string {
  return (v || "").replace(/\D+/g, "");
}

/** Valida CPF pelos dois digitos verificadores. */
export function validarCpf(entrada: string): boolean {
  const cpf = soDigitos(entrada);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos iguais

  const dv = (base: string, pesoInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = dv(cpf.slice(0, 9), 10);
  const d2 = dv(cpf.slice(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

/** Valida CNPJ pelos dois digitos verificadores. */
export function validarCnpj(entrada: string): boolean {
  const cnpj = soDigitos(entrada);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const dv = (base: string): number => {
    let soma = 0;
    let peso = base.length - 7;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = dv(cnpj.slice(0, 12));
  const d2 = dv(cnpj.slice(0, 13));
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

/** Aceita CPF (11) ou CNPJ (14). Retorna so os digitos se valido, senao null. */
export function normalizarCpfCnpj(entrada: string): string | null {
  const d = soDigitos(entrada);
  if (d.length === 11 && validarCpf(d)) return d;
  if (d.length === 14 && validarCnpj(d)) return d;
  return null;
}
