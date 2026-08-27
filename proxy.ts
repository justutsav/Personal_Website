import { NextResponse, type NextRequest } from "next/server";

/**
 * How well an Accept header asks for one media type, per RFC 9110: the q of
 * the matching range, plus how specific that range was — `text/markdown` (2)
 * beats `text/*` (1) beats `*​/*` (0).
 */
function quality(accept: string, type: string): { q: number; rank: number } {
  const group = `${type.split("/")[0]}/*`;
  let best = { q: 0, rank: -1 };
  for (const part of accept.split(",")) {
    const [raw, ...params] = part.split(";");
    const media = raw.trim().toLowerCase();
    const rank = media === type ? 2 : media === group ? 1 : media === "*/*" ? 0 : -1;
    if (rank < best.rank) continue;
    const param = params
      .map((p) => p.trim().toLowerCase())
      .find((p) => p.startsWith("q="));
    const parsed = param ? Number(param.slice(2)) : 1;
    const q = Number.isNaN(parsed) ? 1 : parsed;
    if (rank > best.rank || q > best.q) best = { q, rank };
  }
  return best.rank < 0 ? { q: 0, rank: -1 } : best;
}

/**
 * Markdown only when asked for by name AND preferred over HTML. An outright
 * tie goes to HTML: a scanner listing both (`text/html, text/markdown`) wants
 * to see what the page looks like, not its twin. A more specific ask at the
 * same q still wins, so `text/markdown, *​/*` gets markdown.
 */
export function wantsMarkdown(accept: string | null): boolean {
  if (!accept || !/(^|,)\s*text\/markdown\b/i.test(accept)) return false;
  const md = quality(accept, "text/markdown");
  const html = quality(accept, "text/html");
  if (md.q <= 0) return false;
  return md.q > html.q || (md.q === html.q && md.rank > html.rank);
}

export function proxy(request: NextRequest) {
  if (wantsMarkdown(request.headers.get("accept"))) {
    const url = request.nextUrl.clone();
    url.pathname = `/md${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }
  // Signal the negotiation on the HTML variant too. Next's own setVaryHeader
  // currently wins on prerendered pages, so this is belt-and-braces: the
  // rewrite above runs before any cache lookup, so an agent asking for
  // markdown can never be handed the cached HTML entry anyway.
  const response = NextResponse.next();
  response.headers.append("Vary", "Accept");
  return response;
}

export const config = {
  matcher: [
    // pages only: skip Next internals and anything with a file extension
    // (public/ media, robots.txt, sitemap.xml, llms.txt — none negotiable)
    "/((?!_next/static|_next/image|.*\\.[a-z0-9]+$).*)",
  ],
};
