import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdmin, logAdm } from "@/lib/adm";
import { getClientIp } from "@/lib/anti-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  emailPrincipal: z
    .string()
    .trim()
    .email("E-mail principal inválido")
    .max(180)
    .optional()
    .or(z.literal("")),
  emailSecundario: z
    .string()
    .trim()
    .email("E-mail secundário inválido")
    .max(180)
    .optional()
    .or(z.literal("")),
});

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch (e) {
    const msg =
      e instanceof z.ZodError
        ? (e.issues[0]?.message ?? "Dados inválidos")
        : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const emailPrincipal = data.emailPrincipal
    ? data.emailPrincipal.toLowerCase()
    : null;
  const emailSecundario = data.emailSecundario
    ? data.emailSecundario.toLowerCase()
    : null;

  await prisma.admin.update({
    where: { id: admin.id },
    data: { emailPrincipal, emailSecundario },
  });
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "perfil.emails",
    detalhe: `principal=${emailPrincipal ?? "-"} secundario=${emailSecundario ?? "-"}`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
