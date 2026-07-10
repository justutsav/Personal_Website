/**
 * Hero media pool. Drop videos/photos into public/assests/hero/ and add
 * them here. HeroExperience cycles them in order per session; the Preloader
 * warms the first PRELOAD_HERO_COUNT clips before lifting the curtain so the
 * hero's opening frame is ready the instant the site is revealed.
 */
export type HeroMedia = { src: string; type: "video" | "image" };

export const HERO_MEDIA: HeroMedia[] = [
  { src: "/assests/hero/01.mp4", type: "video" },
  { src: "/assests/hero/02.mp4", type: "video" },
  { src: "/assests/hero/03.mp4", type: "video" },
  { src: "/assests/hero/04.mp4", type: "video" },
  { src: "/assests/hero/05.mp4", type: "video" },
  // add more: drop into public/assests/hero/ and append { src, type } here
];

/** How many leading clips the preloader waits on before revealing the site. */
export const PRELOAD_HERO_COUNT = 2;

/** The video sources the preloader should warm (first N videos in order). */
export const HERO_PRELOAD_SRCS = HERO_MEDIA.filter((m) => m.type === "video")
  .slice(0, PRELOAD_HERO_COUNT)
  .map((m) => m.src);
