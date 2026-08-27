import { markdownFor, notFoundMarkdown, SITE } from "@/lib/agentMarkdown";

/**
 * Markdown twin of every page. Reached two ways:
 *   - directly:  /md/about
 *   - negotiated: GET /about with `Accept: text/markdown` (see proxy.ts)
 * Unknown paths answer 404 with a recovery map instead of an empty body.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const pathname = `/${(slug ?? []).join("/")}`;
  const body = markdownFor(pathname);

  return new Response(body ?? notFoundMarkdown(pathname), {
    status: body ? 200 : 404,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      Link: `<${SITE}${pathname === "/" ? "/" : pathname}>; rel="canonical"`,
      "Cache-Control": body
        ? "public, max-age=0, must-revalidate"
        : "no-store",
    },
  });
}
