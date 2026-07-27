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

export default async function AdmPage() {
  if (!(await isAuthed())) redirect("/adm/login");

  const leads = await prisma.clubeLead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="leads" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Leads · +HCE
          </h1>
          <p className="text-sm text-muted">
            {leads.length} {leads.length === 1 ? "cadastro" : "cadastros"}
          </p>
        </div>
        {leads.length === 0 ? (
          <p className="rounded-xl border border-line bg-white p-8 text-center text-muted">
            Nenhum cadastro ainda.
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
                  <Th>Meio (aviso)</Th>
                  <Th>Promoções</Th>
                  <Th>Observações</Th>
                  <Th>IP</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const meios = [
                    l.canalEmail && "E-mail",
                    l.canalSms && "SMS",
                    l.canalWhatsapp && "WhatsApp",
                  ].filter(Boolean) as string[];
                  return (
                    <tr key={l.id} className="border-b border-line/70">
                      <Td>{fmtData.format(l.createdAt)}</Td>
                      <Td>{fmtHora.format(l.createdAt)}</Td>
                      <Td className="font-medium text-ink">{l.nome}</Td>
                      <Td>{l.email}</Td>
                      <Td>{l.telefone}</Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {meios.map((m) => (
                            <span
                              key={m}
                              className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </Td>
                      <Td>
                        {l.aceitaPromos ? (
                          <span className="rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                            Sim
                          </span>
                        ) : (
                          <span className="text-muted">Não</span>
                        )}
                      </Td>
                      <td className="px-4 py-3 align-top">
                        <LeadObs id={l.id} inicial={l.observacoes} />
                      </td>
                      <Td className="text-muted">{l.ip ?? "—"}</Td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <LeadDelete id={l.id} nome={l.nome} />
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
  return (
    <td className={`px-4 py-3 whitespace-nowrap ${className ?? ""}`}>
      {children}
    </td>
  );
}
