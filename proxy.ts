import { NextResponse, type NextRequest } from "next/server";

/**
 * RFC 9110 quality of one media type in an Accept header. More specific
 * matches win over wildcards: `text/markdown` > `text/*` > `*​/*`.
 */
function quality(accept: string, type: string): number {
  const group = `${type.split("/")[0]}/*`;
  let best = 0;
  let bestRank = -1;
  for (const part of accept.split(",")) {
    const [raw, ...params] = part.split(";");
    const media = raw.trim().toLowerCase();
    const rank = media === type ? 2 : media === group ? 1 : media === "*/*" ? 0 : -1;
    if (rank < bestRank) continue;
    const q = params
      .map((p) => p.trim().toLowerCase())
      .find((p) => p.startsWith("q="));
    const value = q ? Number(q.slice(2)) : 1;
    const weight = Number.isNaN(value) ? 1 : value;
    if (rank > bestRank || weight > best) {
      bestRank = rank;
      best = weight;
    }
  }
  return bestRank < 0 ? 0 : best;
}

/** Markdown only when it is asked for by name and not out-ranked by HTML. */
export function wantsMarkdown(accept: string | null): boolean {
  if (!accept || !/(^|,)\s*text\/markdown\b/i.test(accept)) return false;
  const md = quality(accept, "text/markdown");
  return md > 0 && md >= quality(accept, "text/html");
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
