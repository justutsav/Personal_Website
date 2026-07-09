import fs from "fs";
import path from "path";
import { imageSize } from "image-size";

export type ImageDims = { width: number; height: number };

/** Read the real pixel size of an image under /public. Server-side only. */
export function publicImageSize(rel: string): ImageDims | null {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", rel));
    const { width, height } = imageSize(buf);
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  }
}
