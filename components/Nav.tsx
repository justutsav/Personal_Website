import Link from "next/link";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="px-[var(--edge)] pt-6">
      <nav className="flex items-baseline justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="font-display text-lg tracking-tight hover:text-accent transition-colors duration-200"
        >
          Utsav
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
