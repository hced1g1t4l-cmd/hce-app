import { prisma } from "@/lib/db";

// Serve imagens do Feed HCE guardadas no Postgres (tabela Imagem).
// Publico (as imagens dos artigos precisam aparecer no site).
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const img = await prisma.imagem.findUnique({ where: { id } });
  if (!img) {
    return new Response("Imagem não encontrada", { status: 404 });
  }

  return new Response(new Uint8Array(img.dados), {
    headers: {
      "Content-Type": img.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
