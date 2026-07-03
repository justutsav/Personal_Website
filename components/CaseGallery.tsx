import fs from "fs";
import path from "path";
import Image from "next/image";

const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif)$/i;

/**
 * Renders every image dropped into public/projects/<slug>/, sorted by
 * filename. If the folder is empty, shows an editorial placeholder frame
 * so the layout reads correctly before screenshots are added.
 */
export function CaseGallery({ slug, name }: { slug: string; name: string }) {
  const dir = path.join(process.cwd(), "public", "projects", slug);
  let images: string[] = [];
  try {
    images = fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort();
  } catch {
    // folder missing — treat as no images
  }

  if (images.length === 0) {
    return (
      <figure className="my-16 border border-line rounded-sm aspect-[16/10] flex items-center justify-center bg-paper-raised">
        <figcaption className="text-center px-8">
          <span className="font-display italic text-[length:var(--text-h3)] text-ink-soft">
            {name} — screenshots coming soon
          </span>
          <span className="block mt-2 font-mono text-micro text-ink-soft">
            drop images into /public/projects/{slug}/
          </span>
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="my-16 space-y-10">
      {images.map((img) => (
        <figure key={img}>
          <Image
            src={`/projects/${slug}/${img}`}
            alt={`${name} — ${img.replace(IMAGE_EXT, "").replace(/[-_]/g, " ")}`}
            width={1600}
            height={1000}
            className="w-full h-auto rounded-sm border border-line"
          />
        </figure>
      ))}
    </div>
  );
}
