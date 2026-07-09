import fs from "fs";
import path from "path";
import { publicImageSize } from "@/lib/imageMeta";
import { CaseGalleryGrid, type GalleryItem } from "@/components/CaseGalleryGrid";

const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif)$/i;

/**
 * Renders every image dropped into public/projects/<slug>/, sorted by
 * filename. Real pixel dimensions are read server-side so the grid can be
 * orientation-aware: landscape shots sit 2-per-row, portrait phone shots
 * 3-per-row — no more one phone screenshot spanning four screens of scroll.
 * If the folder is empty, shows an editorial placeholder frame instead.
 */
export function CaseGallery({ slug, name }: { slug: string; name: string }) {
  const dir = path.join(process.cwd(), "public", "projects", slug);
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort();
  } catch {
    // folder missing — treat as no images
  }

  const items: GalleryItem[] = files.flatMap((f) => {
    const dims = publicImageSize(`projects/${slug}/${f}`);
    if (!dims) return [];
    return [
      {
        src: `/projects/${slug}/${f}`,
        alt: `${name} — ${f.replace(IMAGE_EXT, "").replace(/[-_]/g, " ")}`,
        width: dims.width,
        height: dims.height,
      },
    ];
  });

  if (items.length === 0) {
    return (
      <figure className="my-16 border border-line rounded-sm aspect-[16/10] flex items-center justify-center bg-paper-raised">
        <figcaption className="text-center px-8">
          <span className="font-display text-[length:var(--text-h3)] text-ink-soft">
            {name} — screenshots coming soon
          </span>
          <span className="block mt-2 font-mono text-micro text-ink-soft">
            drop images into /public/projects/{slug}/
          </span>
        </figcaption>
      </figure>
    );
  }

  return <CaseGalleryGrid items={items} />;
}
