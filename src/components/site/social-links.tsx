import { SOCIALS } from "@/lib/site";
import { cn } from "@/lib/cn";

// Icones inline (24x24) por rede. currentColor herda a cor do link.
const ICONS: Record<string, React.ReactNode> = {
  Instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  TikTok: (
    <path d="M14 3c.4 2.2 1.9 3.9 4 4.3v2.6c-1.5 0-2.9-.4-4-1.1v5.6a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.7a2.7 2.7 0 1 0 1.9 2.6V3H14z" />
  ),
  YouTube: (
    <>
      <path d="M22 12s0-3-.4-4.3a2.6 2.6 0 0 0-1.8-1.8C18.3 5.5 12 5.5 12 5.5s-6.3 0-7.8.4A2.6 2.6 0 0 0 2.4 7.7C2 9 2 12 2 12s0 3 .4 4.3a2.6 2.6 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8C22 15 22 12 22 12z" />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  LinkedIn: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <path
        d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7"
        fill="none"
      />
    </>
  ),
  Facebook: (
    <path d="M14 8.5V7c0-.7.3-1 1-1h1.5V3.2C16 3.1 14.9 3 13.9 3 11.6 3 10 4.4 10 7v1.5H7.5V11H10v9h3v-9h2.3l.4-2.5H13z" />
  ),
  X: (
    <path d="M4 3h3.3l4 5.3L15.7 3H20l-6 7.6L20.4 21H17l-4.3-5.7L7.9 21H4l6.4-8L4 3z" />
  ),
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {SOCIALS.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`HCE no ${s.label}`}
            title={s.label}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors duration-300 hover:bg-brand-amber hover:text-brand-blue-deep"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {ICONS[s.label]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
