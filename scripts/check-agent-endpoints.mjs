#!/usr/bin/env node
/**
 * Agent-readiness checks: run against a built server.
 *   npm run build && npm start
 *   node scripts/check-agent-endpoints.mjs [baseUrl]   # default http://localhost:3000
 * Also works against production: node scripts/check-agent-endpoints.mjs https://justutsav.com
 */
import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const MD = "text/markdown";

const get = (path, accept) =>
  fetch(base + path, { headers: accept ? { Accept: accept } : {} });

const text = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const count = (html, tag) => (html.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;

/** "Accept-Encoding" must not count as varying on Accept */
const variesOnAccept = (res) =>
  res.headers
    .get("vary")
    ?.split(",")
    .some((v) => v.trim().toLowerCase() === "accept") ?? false;

let failures = 0;
async function check(name, fn) {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (error) {
    failures++;
    console.log(`FAIL ${name}\n     ${error.message.split("\n")[0]}`);
  }
}

// 1. HTML homepage: server-rendered content, one h1, real hierarchy, Vary
await check("homepage renders content without JS", async () => {
  const res = await get("/");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  const html = await res.text();
  assert.equal(count(html, "h1"), 1, "homepage must have exactly one h1");
  assert.ok(count(html, "h2") >= 3, "homepage needs h2 sections");
  assert.ok(count(html, "h3") >= 3, "homepage needs h3 sub-headings");
  assert.ok(text(html).length >= 500, "homepage needs 500+ chars of raw text");
});

// 2. Markdown content negotiation (acceptmarkdown.com)
await check("Accept: text/markdown returns markdown + Vary: Accept", async () => {
  const res = await get("/", MD);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.ok(variesOnAccept(res), `Vary must list Accept, got "${res.headers.get("vary")}"`);
  const body = await res.text();
  assert.match(body, /^# /, "markdown body must start with a heading");
  assert.match(body, /## Selected work/);
});

await check("markdown twins exist for about and case studies", async () => {
  const about = await get("/about", MD);
  assert.equal(about.status, 200);
  assert.match(await about.text(), /^# About Utsav/);
  const grit = await get("/work/grit", MD);
  assert.equal(grit.status, 200);
  const body = await grit.text();
  assert.match(body, /## The problem/);
  assert.match(body, /## The outcome/);
});

// 3. q-values: HTML stays the default for browsers and unspecific clients
await check("HTML wins when it out-ranks or ties markdown", async () => {
  for (const accept of [
    "*/*",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "text/html;q=0.9, text/markdown;q=0.5",
    "text/markdown;q=0",
    // a readiness scanner asking for both must still see the HTML page
    "text/html, text/markdown",
    "text/markdown, text/html",
  ]) {
    const res = await get("/", accept);
    assert.match(
      res.headers.get("content-type"),
      /text\/html/,
      `Accept: ${accept} should stay HTML`
    );
  }
  for (const accept of [
    "text/html;q=0.4, text/markdown;q=0.8",
    "text/markdown, */*", // more specific ask at the same q still wins
  ]) {
    const res = await get("/", accept);
    assert.match(
      res.headers.get("content-type"),
      /text\/markdown/,
      `Accept: ${accept} should be markdown`
    );
  }
});

// 3b. The homepage an LLM crawler sees: one descriptive h1, real prose
await check("homepage h1 describes the page, not just the wordmark", async () => {
  const html = await (await get("/")).text();
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "";
  const words = text(h1);
  assert.ok(words.length >= 60, `h1 text too thin for a crawler: "${words}"`);
  assert.match(words, /independent developer/i);
});

// 4. Trust anchors: agents check these before recommending anyone
await check("contact and privacy pages carry real content", async () => {
  for (const [path, needle] of [
    ["/contact", /IST \(UTC\+5:30\)/],
    ["/privacy", /Vercel Web Analytics/],
  ]) {
    const res = await get(path);
    assert.equal(res.status, 200, `${path} must exist`);
    const html = await res.text();
    assert.ok(
      text(html).length >= 500,
      `${path} needs 500+ chars of text, got ${text(html).length}`
    );
    assert.equal(count(html, "h1"), 1, `${path} needs exactly one h1`);
    assert.match(html, needle);
    assert.match(html, new RegExp(`rel="canonical" href="[^"]*${path}"`));
    const md = await get(path, MD);
    assert.equal(md.status, 200, `${path} needs a markdown twin`);
    assert.match(await md.text(), /^# /);
  }
  const sitemap = await (await get("/sitemap.xml")).text();
  assert.match(sitemap, /\/contact</);
  assert.match(sitemap, /\/privacy</);
});

// 4. Agent-friendly 404s
await check("unknown path 404s with a recovery map (HTML)", async () => {
  const res = await get("/definitely-not-a-real-page");
  assert.equal(res.status, 404);
  const body = await res.text();
  assert.match(body, /sitemap\.xml/);
  assert.match(body, /llms\.txt/);
  assert.match(body, /Where to look next/);
});

await check("unknown path 404s with a markdown body", async () => {
  const res = await get("/definitely-not-a-real-page", MD);
  assert.equal(res.status, 404);
  assert.equal(res.headers.get("content-type"), "text/markdown; charset=utf-8");
  const body = await res.text();
  assert.match(body, /^# 404/);
  assert.match(body, /\[sitemap\.xml\]/);
});

// 5. Agent instructions
await check("llms.txt states when to use the site", async () => {
  const res = await get("/llms.txt");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/plain/);
  const body = await res.text();
  assert.match(body, /^# Utsav \(justutsav\)/);
  assert.match(body, /^> /m, "llms.txt needs the spec's blockquote summary");
  assert.match(body, /When to use this site/);
  assert.match(body, /How to call it/);
  assert.match(body, /## Case studies/);
});

// 6. Crawl basics + canonical per page (a layout-wide canonical deindexes pages)
await check("sitemap, robots and per-page canonicals", async () => {
  const sitemap = await get("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /work\/grit/);
  assert.equal((await get("/robots.txt")).status, 200);
  const about = await get("/about");
  assert.match(await about.text(), /rel="canonical" href="[^"]*\/about"/);
});

console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
process.exit(failures ? 1 : 0);
