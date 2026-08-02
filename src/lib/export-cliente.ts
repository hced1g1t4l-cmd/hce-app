// Exportacao no navegador (CSV / Excel) do que estiver filtrado na tela.
// Gera o arquivo em memoria e dispara o download, sem ida ao servidor.

function baixar(nome: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(v: string): string {
  const s = v ?? "";
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// CSV com separador ";" (Excel pt-BR) e BOM UTF-8 para acentos corretos.
export function baixarCSV(
  nome: string,
  colunas: string[],
  linhas: string[][],
) {
  const sep = ";";
  const header = colunas.map(csvEscape).join(sep);
  const body = linhas.map((l) => l.map(csvEscape).join(sep)).join("\r\n");
  const conteudo = `${header}\r\n${body}\r\n`;
  const blob = new Blob(["\uFEFF" + conteudo], {
    type: "text/csv;charset=utf-8;",
  });
  baixar(nome, blob);
}

function htmlEscape(v: string): string {
  return (v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Excel: tabela HTML que o Excel abre nativamente, com cabecalho da marca HCE.
export function baixarXLS(
  nome: string,
  titulo: string,
  colunas: string[],
  linhas: string[][],
  dataGeracao: string,
) {
  const AZUL = "#003288";
  const CINZA = "#667085";
  const ZEBRA = "#f4f6fb";
  const ths = colunas
    .map(
      (c) =>
        `<th style="background:${AZUL};color:#fff;border:1px solid #ccc;padding:6px 10px;text-align:left;font-family:Calibri,Arial">${htmlEscape(c)}</th>`,
    )
    .join("");
  const trs = linhas
    .map(
      (l, i) =>
        `<tr style="background:${i % 2 ? ZEBRA : "#fff"}">${l
          .map(
            (v) =>
              `<td style="border:1px solid #ddd;padding:6px 10px;font-family:Calibri,Arial;mso-number-format:'\\@'">${htmlEscape(v)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"></head>
<body>
<table>
<tr><td colspan="${colunas.length}" style="font-family:Calibri,Arial;font-size:16pt;font-weight:bold;color:${AZUL}">HCE · ${htmlEscape(titulo)}</td></tr>
<tr><td colspan="${colunas.length}" style="font-family:Calibri,Arial;font-size:9pt;color:${CINZA}">Hospitalidade · Consultoria · Educação — gerado em ${htmlEscape(dataGeracao)}</td></tr>
<tr><td colspan="${colunas.length}"></td></tr>
<tr>${ths}</tr>
${trs}
</table>
</body></html>`;
  const blob = new Blob(["\uFEFF" + html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  baixar(nome, blob);
}
