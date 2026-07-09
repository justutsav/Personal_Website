import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";
import { CaseGallery } from "@/components/CaseGallery";
import { projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} — Utsav`,
    description: project.tagline,
  };
}

const storySections = [
  { key: "problem", label: "The problem" },
  { key: "build", label: "What I built" },
  { key: "outcome", label: "The outcome" },
] as const;

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();
  const project = projects[idx];
  const next = projects[(idx + 1) % projects.length];

  return (
    <>
      <Nav />
      <main className="px-[var(--edge)]">
        {/* ---- Case header ---- */}
        <header className="pt-[10vh] pb-16">
          <Reveal>
            <p className="font-mono text-micro uppercase tracking-[0.2em] text-accent mb-6">
              {project.category} · {project.year}
            </p>
          </Reveal>
          <KineticTitle
            text={project.name}
            className="font-display max-w-[16ch] text-[clamp(2.6rem,8vw,6rem)] font-extrabold uppercase leading-[0.95]"
            delay={0.1}
          />
          <Reveal delay={0.2}>
            <p className="mt-6 text-ink-soft max-w-[55ch] text-[length:var(--text-h3)]">
              {project.tagline}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
              {project.stack.map((s) => (
                <li
                  key={s}
                  className="font-mono text-micro uppercase tracking-wide text-ink-soft border border-line rounded-full px-3 py-1 transition-colors duration-200 hover:border-accent hover:text-accent"
                >
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </header>

        {/* ---- Metrics band ---- */}
        <Reveal>
          <dl className="grid grid-cols-2 gap-y-10 border-y border-line py-10 md:grid-cols-3">
            {project.metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 0.1}>
                <div>
                  <dd
                    className={`font-display text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none ${
                      i % 2 === 0 ? "text-accent" : "text-accent-2"
                    }`}
                  >
                    {m.value}
                  </dd>
                  <dt className="mt-2 max-w-[20ch] text-small text-ink-soft">
                    {m.label}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </Reveal>

        {/* ---- Story: sticky labels, prose scrolls past ---- */}
        <article className="mt-16">
          {storySections.map((s, i) => (
            <section
              key={s.key}
              className="grid gap-4 border-t border-line py-14 md:grid-cols-[220px_1fr] md:gap-12"
            >
              <div className="md:sticky md:top-28 md:self-start">
                <h2 className="flex items-baseline gap-3">
                  <span
                    className={`font-display text-[clamp(2rem,4vw,3rem)] font-extrabold ${
                      i % 2 === 0 ? "text-accent" : "text-accent-2"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
                    {s.label}
                  </span>
                </h2>
              </div>
              <Reveal>
                <p className="max-w-[62ch] text-[length:var(--text-h3)] leading-relaxed text-ink">
                  {project.story[s.key]}
                </p>
              </Reveal>
            </section>
          ))}

          {project.privateNote && (
            <Reveal>
              <aside className="relative mt-8 overflow-hidden rounded-xl border border-accent/40 bg-paper-raised px-8 py-7">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    background:
                      "repeating-linear-gradient(to bottom, rgba(255,90,36,0.05) 0px, rgba(255,90,36,0.05) 1px, transparent 1px, transparent 4px)",
                  }}
                />
                <p className="relative mb-3 font-mono text-micro uppercase tracking-[0.25em] text-accent">
                  🔒 Why this stays private
                </p>
                <p className="relative max-w-[60ch] text-ink-soft">
                  {project.privateNote}
                </p>
              </aside>
            </Reveal>
          )}

          {project.links && project.links.length > 0 && (
            <Reveal>
              <ul className="mt-10 flex gap-6">
                {project.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-small text-accent hover:text-accent-deep underline underline-offset-4 transition-colors duration-200"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </article>

        {/* ---- Screenshots ---- */}
        <Reveal>
          <CaseGallery slug={project.slug} name={project.name} />
        </Reveal>

        {/* ---- Next case ---- */}
        <nav className="border-t border-line-strong py-16 mb-8">
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft mb-4">
            Next
          </p>
          <Link
            href={`/work/${next.slug}`}
            className="font-display text-[length:var(--text-h1)] hover:text-accent transition-colors duration-200"
          >
            {next.name} →
          </Link>
        </nav>
      </main>
    </>
  );
}
