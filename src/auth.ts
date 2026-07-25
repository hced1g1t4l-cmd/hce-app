import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

// Configuracao base do Auth.js (NextAuth v5).
// Providers ficam vazios por enquanto; entram na atividade de autenticacao
// (ex.: e-mail/magic link e/ou login social). A sessao usa JWT para nao
// depender de escrita no banco a cada request.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/entrar",
  },
  providers: [],
});
