export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <span className="text-sm font-semibold tracking-widest text-amber-700 uppercase">
        Projeto digital HCE
      </span>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Fundacao do ecossistema HCE
      </h1>
      <p className="text-lg leading-relaxed text-slate-600">
        Ambiente inicial do site e do Clube HCE. Stack: Next.js, Prisma,
        Auth.js, PostgreSQL. As proximas atividades constroem o design system, o
        site institucional e a area de assinantes.
      </p>
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          Next.js 16
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          Prisma + PostgreSQL
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          Auth.js
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          Tailwind CSS
        </span>
      </div>
    </main>
  );
}
