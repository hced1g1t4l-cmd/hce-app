import PDFDocument from "pdfkit";

// Utilitarios de exportacao (CSV / Excel / PDF) para o painel /adm.

export type Coluna = { titulo: string; largura: number };
export type Linha = string[];

export type Planilha = {
  titulo: string; // ex.: "Leads · +HCE"
  colunas: Coluna[];
  linhas: Linha[];
};

// --- Cores da marca HCE ---
const AZUL = "#003288";
const AZUL_ESCURO = "#001d52";
const AMBAR = "#f4b400";
const CINZA = "#667085";
const LINHA_ZEBRA = "#f4f6fb";

// ================= CSV =================
function csvEscape(v: string): string {
  const s = v ?? "";
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCSV(p: Planilha): Buffer {
  const sep = ";"; // Excel pt-BR usa ; como separador
  const header = p.colunas.map((c) => csvEscape(c.titulo)).join(sep);
  const body = p.linhas.map((l) => l.map(csvEscape).join(sep)).join("\r\n");
  const conteudo = `${header}\r\n${body}\r\n`;
  // BOM UTF-8 para o Excel abrir acentos corretamente.
  return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(conteudo, "utf8")]);
}

// ================= Excel (HTML .xls) =================
// Gera uma tabela HTML que o Excel abre nativamente, com cabecalho da marca.
function htmlEscape(v: string): string {
  return (v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function toXLS(p: Planilha, dataGeracao: string): Buffer {
  const ths = p.colunas
    .map(
      (c) =>
        `<th style="background:${AZUL};color:#fff;border:1px solid #ccc;padding:6px 10px;text-align:left;font-family:Calibri,Arial">${htmlEscape(c.titulo)}</th>`,
    )
    .join("");
  const trs = p.linhas
    .map(
      (l, i) =>
        `<tr style="background:${i % 2 ? LINHA_ZEBRA : "#fff"}">${l
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
<tr><td colspan="${p.colunas.length}" style="font-family:Calibri,Arial;font-size:16pt;font-weight:bold;color:${AZUL}">HCE · ${htmlEscape(p.titulo)}</td></tr>
<tr><td colspan="${p.colunas.length}" style="font-family:Calibri,Arial;font-size:9pt;color:${CINZA}">Hospitalidade · Consultoria · Educação — gerado em ${htmlEscape(dataGeracao)}</td></tr>
<tr><td colspan="${p.colunas.length}"></td></tr>
<tr>${ths}</tr>
${trs}
</table>
</body></html>`;
  return Buffer.from(html, "utf8");
}

// ================= PDF (papel timbrado) =================
export function toPDF(p: Planilha, dataGeracao: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 110, bottom: 60, left: 36, right: 36 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const contentW = right - left;

    // ---- Cabecalho (papel timbrado), repetido em cada pagina ----
    const desenharCabecalho = () => {
      // Faixa azul
      doc.save();
      doc.rect(0, 0, pageWidth, 78).fill(AZUL);
      // Emblema "hce" (caixinha) a esquerda
      doc.roundedRect(left, 20, 54, 40, 8).fill(AZUL_ESCURO);
      doc
        .fillColor(AMBAR)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("hce", left, 30, { width: 54, align: "center" });
      // Titulo
      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text(p.titulo, left + 70, 22, { width: contentW - 70 });
      doc
        .fillColor("#dbe4f5")
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Hospitalidade · Consultoria · Educação   |   Gerado em ${dataGeracao}`,
          left + 70,
          48,
          { width: contentW - 70 },
        );
      // Regua ambar
      doc.rect(0, 78, pageWidth, 3).fill(AMBAR);
      doc.restore();
    };

    // ---- Rodape com paginacao ----
    const desenharRodape = () => {
      const y = doc.page.height - 40;
      doc.save();
      doc.rect(left, y, contentW, 0.8).fill("#e5e9f2");
      doc
        .fillColor(CINZA)
        .font("Helvetica")
        .fontSize(8)
        .text(
          "HCE — Hospitalidade, Consultoria e Educação em Gastronomia · www.hcegastronomia.com",
          left,
          y + 6,
          { width: contentW, align: "left" },
        );
      doc.restore();
    };

    // Larguras proporcionais das colunas
    const somaW = p.colunas.reduce((s, c) => s + c.largura, 0);
    const larguras = p.colunas.map((c) => (c.largura / somaW) * contentW);

    const desenharCabecalhoTabela = (y: number): number => {
      doc.save();
      doc.rect(left, y, contentW, 22).fill(AZUL);
      let x = left;
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5);
      p.colunas.forEach((c, i) => {
        doc.text(c.titulo.toUpperCase(), x + 5, y + 6, {
          width: larguras[i] - 10,
          ellipsis: true,
        });
        x += larguras[i];
      });
      doc.restore();
      return y + 22;
    };

    desenharCabecalho();
    desenharRodape();
    let y = doc.page.margins.top;
    y = desenharCabecalhoTabela(y);

    doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a");
    const padY = 5;
    const lineH = 10;
    const bottomLimit = doc.page.height - doc.page.margins.bottom;

    p.linhas.forEach((linha, idx) => {
      // Altura da linha = maior numero de linhas de texto entre as colunas
      const alturas = linha.map((cel, i) => {
        const h = doc.heightOfString(cel || "—", {
          width: larguras[i] - 10,
        });
        return h;
      });
      const rowH = Math.max(lineH, ...alturas) + padY * 2;

      if (y + rowH > bottomLimit) {
        doc.addPage();
        desenharCabecalho();
        desenharRodape();
        y = doc.page.margins.top;
        y = desenharCabecalhoTabela(y);
        doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a");
      }

      // Zebra
      if (idx % 2 === 1) {
        doc.save();
        doc.rect(left, y, contentW, rowH).fill(LINHA_ZEBRA);
        doc.restore();
      }

      let x = left;
      doc.fillColor("#1a1a1a").font("Helvetica").fontSize(8);
      linha.forEach((cel, i) => {
        doc.text(cel || "—", x + 5, y + padY, {
          width: larguras[i] - 10,
        });
        x += larguras[i];
      });
      // Linha divisoria
      doc.save();
      doc.rect(left, y + rowH, contentW, 0.4).fill("#e5e9f2");
      doc.restore();
      y += rowH;
    });

    doc.end();
  });
}
