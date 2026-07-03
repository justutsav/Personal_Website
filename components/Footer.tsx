const socials = [
  { label: "GitHub", href: "https://github.com/justutsav" },
  { label: "Monkeytype", href: "https://monkeytype.com/profile/justutsav" },
  { label: "YouTube", href: "https://www.youtube.com/@Blaze_Age" },
  { label: "Email", href: "mailto:justutsav.05@gmail.com" },
];

export function Footer() {
  return (
    <footer className="mt-auto px-[var(--edge)] pb-8">
      <div className="border-t border-line pt-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <p className="font-mono text-micro text-ink-soft">
          © {new Date().getFullYear()} Utsav · justutsav everywhere
        </p>
        <ul className="flex gap-5">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-micro text-ink-soft hover:text-accent transition-colors duration-200"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        {/*
          Phone-server heartbeat widget goes here once the Hermes server
          exposes a public ping endpoint:
          "served-alongside a recycled phone · uptime Xd"
        */}
      </div>
    </footer>
  );
}
