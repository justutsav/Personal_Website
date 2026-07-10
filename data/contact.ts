/* Contact channels for the "let's talk" dialog.
 * Channels with `href: null` are hidden from the dialog until filled.
 * Still pending from Utsav: WhatsApp number, Telegram username,
 * Discord user ID (Settings → Advanced → Developer Mode → Copy User ID),
 * Upwork profile URL. */

export const CONTACT_EMAIL = "justutsav.05@gmail.com";

export type ContactChannel = {
  id: string;
  /** two-letter mono badge shown instead of an icon */
  badge: string;
  label: string;
  /** short handle text shown under the label */
  handle: string;
  href: string | null;
  /** badge tint */
  color: string;
};

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "whatsapp",
    badge: "WA",
    label: "WhatsApp",
    handle: "chat directly",
    href: null, // pending: number in international format → https://wa.me/<number>?text=...
    color: "#25d366",
  },
  {
    id: "telegram",
    badge: "TG",
    label: "Telegram",
    handle: "",
    href: null, // pending: https://t.me/<username>
    color: "#2aabee",
  },
  {
    id: "discord",
    badge: "DC",
    label: "Discord",
    handle: "@justutsav",
    href: null, // pending user ID: https://discord.com/users/<id>
    color: "#5865f2",
  },
  {
    id: "linkedin",
    badge: "IN",
    label: "LinkedIn",
    handle: "in/justutsav",
    href: "https://www.linkedin.com/in/justutsav",
    color: "#0a66c2",
  },
  {
    id: "x",
    badge: "X",
    label: "X / Twitter",
    handle: "@punctualbeing",
    href: "https://x.com/punctualbeing",
    color: "#f2ede2",
  },
  {
    id: "upwork",
    badge: "UP",
    label: "Upwork",
    handle: "hire on Upwork",
    href: null, // pending: https://www.upwork.com/freelancers/<profile>
    color: "#14a800",
  },
];
