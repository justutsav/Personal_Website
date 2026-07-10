/* The interests world's stations — one glowing installation per obsession.
 * Positions are on the ground plane (x, z); the arena is a 24×24 slab with
 * invisible walls at ±11, so stations sit near the corners with room to run. */

export type Station = {
  id: string;
  /** short name on the floating in-world sign */
  sign: string;
  tag: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
  /** theme colour — pylon glow, floor ring, panel accent */
  color: string;
  pos: [x: number, z: number];
};

export const STATIONS: Station[] = [
  {
    id: "typing",
    sign: "TYPING",
    tag: "the keyboard is a sport",
    title: "The keyboard is a sport",
    body: "I chase WPM on Monkeytype almost daily. Typing fast isn't about speed for its own sake — it's the closest thing to muscle memory becoming thought.",
    link: { label: "Monkeytype profile", href: "https://monkeytype.com/profile/justutsav" },
    color: "#5b8cff",
    pos: [8, -7],
  },
  {
    id: "music",
    sign: "MUSIC",
    tag: "the soundtrack",
    title: "The soundtrack",
    body: "There's always something playing while I build. The vinyl disk on the home page is a real rotation — the songs I can't stop looping. Full credits live on the About page.",
    link: { label: "Credits", href: "/about#credits" },
    color: "#ff5a24",
    pos: [-8, -7],
  },
  {
    id: "edits",
    sign: "FRAMES",
    tag: "frames & edits",
    title: "Frames & edits",
    body: "Before software there was a YouTube channel. I still collect edits that hit — a few of them play in the hero on the home page. The archive is where all of this started.",
    link: { label: "YouTube (archive)", href: "https://www.youtube.com/@Blaze_Age" },
    color: "#ffa7c9",
    pos: [8, 7],
  },
  {
    id: "gaming",
    sign: "WORLDS",
    tag: "worlds I get lost in",
    title: "Worlds I get lost in",
    body: "Minecraft with Distant Horizons pushed to the horizon line, and whatever game respects my curiosity. Gaming is where the making-things itch first showed up.",
    color: "#f0b25e",
    pos: [-8, 7],
  },
];

/** distance (world units) at which a station arms its [E] prompt */
export const NEAR_RADIUS = 3.4;
