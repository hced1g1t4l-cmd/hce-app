import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmHeader } from "@/components/adm/adm-header";
import { LeadObs, LeadDelete } from "@/components/adm/lead-acoes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const fmtData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});
const fmtHora = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export default async function AdmContatosPage() {
  if (!(await isAuthed())) redirect("/adm/login");

  const mensagens = await prisma.contatoMensagem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="contatos" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Mensagens · Fale com a HCE
          </h1>
          <p className="text-sm text-muted">
            {mensagens.length}{" "}
            {mensagens.length === 1 ? "mensagem" : "mensagens"}
          </p>
        </div>

        {mensagens.length === 0 ? (
          <p className="rounded-xl border border-line bg-white p-8 text-center text-muted">
            Nenhuma mensagem ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-xs tracking-wide text-muted uppercase">
                  <Th>Data</Th>
                  <Th>Hora</Th>
                  <Th>Nome</Th>
                  <Th>E-mail</Th>
                  <Th>Telefone</Th>
                  <Th>Mensagem</Th>
                  <Th>Permissões</Th>
                  <Th>Observações</Th>
                  <Th>IP</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {mensagens.map((m) => {
                  const permissoes = [
                    m.permiteEmail && "E-mail",
                    m.permiteTelefone && "Telefone",
                  ].filter(Boolean) as string[];
                  return (
                    <tr key={m.id} className="border-b border-line/70 align-top">
                      <Td>{fmtData.format(m.createdAt)}</Td>
                      <Td>{fmtHora.format(m.createdAt)}</Td>
                      <Td className="font-medium text-ink">{m.nome}</Td>
                      <Td>{m.email}</Td>
                      <Td>{m.telefone ?? "—"}</Td>
                      <Td className="max-w-sm whitespace-normal text-ink">
                        {m.mensagem}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {permissoes.length > 0 ? (
                            permissoes.map((p) => (
                              <span
                                key={p}
                                className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue"
                              >
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </div>
                      </Td>
                      <td className="px-4 py-3 align-top">
                        <LeadObs
                          id={m.id}
                          inicial={m.observacoes}
                          endpoint="/api/adm/contatos"
                        />
                      </td>
                      <Td className="text-muted">{m.ip ?? "—"}</Td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <LeadDelete
                          id={m.id}
                          nome={m.nome}
                          endpoint="/api/adm/contatos"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold whitespace-nowrap">{children}</th>;
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className ?? "whitespace-nowrap"}`}>{children}</td>;
}
