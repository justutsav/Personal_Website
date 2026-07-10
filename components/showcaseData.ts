/* ---------- services (what I can build for you) ----------
 * Each slide = one service. `tech` renders as chips on the 3D panel; `metric`
 * is the one-line caption at the bottom. All grounded in real shipped work.
 * Lives in its own module (no three.js imports) so the DOM half of the
 * showcase can read it without pulling the WebGL bundle. */

export type Service = {
  tag: string;
  label: string;
  /** forced title line breaks; falls back to width-wrapping `label` */
  labelLines?: string[];
  metric: string;
  tech: string[];
  tint: string;
};

export const SHOWCASE: Service[] = [
  {
    tag: "end to end",
    label: "Full-Stack Websites",
    labelLines: ["Full-Stack", "Websites"],
    metric: "A complete website, built and launched for you — from a rough idea to something real people use every day.",
    tech: ["Logins & accounts", "Your own database", "Live on the web"],
    tint: "#1f4a3a",
  },
  {
    tag: "on the phone",
    label: "Mobile Apps",
    metric: "Your product as a real phone app people can download, open, and keep coming back to.",
    tech: ["On the app store", "Works offline", "Push notifications"],
    tint: "#2a2f5e",
  },
  {
    tag: "hands off",
    label: "AI Automation",
    metric: "Hand off the boring, repeating work — it runs itself, so you don't have to lift a finger.",
    tech: ["Tedious tasks, gone", "Runs on its own", "Cloud or private"],
    tint: "#4a2148",
  },
  {
    tag: "one clear view",
    label: "Dashboards & Portals",
    metric: "All your scattered numbers pulled into one screen you — and the people you answer to — can trust.",
    tech: ["One clear view", "Always up to date", "Secure logins"],
    tint: "#1c3a5e",
  },
  {
    tag: "when nothing fits",
    label: "Custom Tools",
    metric: "When no app quite fits, a small tool that does exactly the one thing you need — often within the week.",
    tech: ["Built for one job", "Small & fast", "Made this week"],
    tint: "#5c3a1c",
  },
];

export const N = SHOWCASE.length;
/** angular gap between cards — wider than a closed ring so neighbours
 * sit half off-screen */
export const SPACING = 0.95;
