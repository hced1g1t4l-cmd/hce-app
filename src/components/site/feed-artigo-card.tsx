import Link from "next/link";
import { cn } from "@/lib/cn";

export type FeedItem = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  capaUrl: string | null;
  meta: string;
};

// Card de artigo do Feed (foto + texto). Usado na grade (desktop) e no
// carrossel (mobile).
export function ArtigoCard({
  item,
  className,
}: {
  item: FeedItem;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
    >
      <Link href={`/feed/${item.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-video bg-gradient-to-br from-brand-blue to-brand-blue-deep">
          {item.capaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.capaUrl}
              alt={item.titulo}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h2 className="font-display text-xl font-bold text-brand-blue">
            {item.titulo}
          </h2>
          {item.resumo && (
            <p className="mt-3 flex-1 leading-relaxed text-muted">
              {item.resumo}
            </p>
          )}
          <p className="mt-5 text-xs tracking-wide text-muted uppercase">
            {item.meta}
          </p>
        </div>
      </Link>
    </article>
  );
}
