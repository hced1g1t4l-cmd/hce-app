// Junta classes condicionais em uma string, ignorando valores falsy.
// Leve, sem dependencias; suficiente para os componentes do site.
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}
