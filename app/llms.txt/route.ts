import { llmsTxt } from "@/lib/agentMarkdown";

/** llms.txt (llmstxt.org) — served as text/plain so browsers show it inline. */
export function GET() {
  return new Response(llmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
