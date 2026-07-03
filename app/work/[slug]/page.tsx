import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
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
          <Reveal delay={0.1}>
            <h1 className="font-display text-[length:var(--text-h1)] max-w-[16ch]">
              {project.name}
            </h1>
          </Reveal>
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
                  className="font-mono text-micro uppercase tracking-wide text-ink-soft border border-line rounded-full px-3 py-1"
                >
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </header>

        {/* ---- Metrics band ---- */}
        <Reveal>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-8 border-y border-line py-8 max-w-[75ch]">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <dd className="font-display text-[length:var(--text-h2)] text-accent">
                  {m.value}
                </dd>
                <dt className="mt-1 text-small text-ink-soft max-w-[20ch]">
                  {m.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* ---- Story ---- */}
        <article className="max-w-[68ch]">
          {storySections.map((s, i) => (
            <Reveal key={s.key}>
              <section className="mt-16">
                <h2 className="flex items-baseline gap-4">
                  <span className="font-mono text-small text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[length:var(--text-h3)]">
                    {s.label}
                  </span>
                </h2>
                <p className="mt-4 text-ink-soft leading-relaxed">
                  {project.story[s.key]}
                </p>
              </section>
            </Reveal>
          ))}

          {project.privateNote && (
            <Reveal>
              <aside className="mt-16 bg-paper-raised rounded-sm px-8 py-6 border-l-2 border-accent">
                <p className="font-display text-ink-soft">
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
