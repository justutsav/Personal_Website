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

  // projects whose shots are all peers (no hero) render as one even grid
  const EQUAL_GRID = new Set(["wpm-overlay"]);
  // the hero is cover.* — pull it to the front so it becomes the left "main"
  const coverIdx = items.findIndex((it) => /\/cover\.[a-z0-9]+$/i.test(it.src));
  const ordered =
    coverIdx > 0
      ? [items[coverIdx], ...items.slice(0, coverIdx), ...items.slice(coverIdx + 1)]
      : items;
  const equal = EQUAL_GRID.has(slug) || coverIdx === -1;

  if (items.length === 0) {
    return (
      <p className="my-16 max-w-[52ch] font-mono text-small leading-relaxed text-ink-soft">
        No screenshots for {name} — it runs a live business on private data,
        so the visuals stay behind closed doors. The numbers are the proof
        that matters.
      </p>
    );
  }

  return <CaseGalleryGrid items={ordered} equal={equal} />;
}
