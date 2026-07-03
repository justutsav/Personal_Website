import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="px-[var(--edge)] pt-6">
      <nav className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="group flex items-center gap-3 font-display text-lg tracking-tight"
        >
          <Image
            src="/avatar.png"
            alt="Utsav"
            width={32}
            height={32}
            className="rounded-full border border-line self-center"
          />
          <span className="group-hover:text-accent transition-colors duration-200">
            Utsav
          </span>
        </Link>
        <ul className="flex gap-6 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-ink-soft hover:text-accent transition-colors duration-200"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
