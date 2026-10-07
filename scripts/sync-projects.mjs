// Writes data/projects.json: a snapshot of Sujguha's public repos with a
// short summary taken from each README. work.html uses it to describe repos
// that have no GitHub description, and as the list to show when GitHub's API
// doesn't respond. Run by .github/workflows/sync-projects.yml.
//
// Only fields that change when a project changes are stored (no push dates),
// so the file, and the site, only get a new commit when there is news.

import { mkdir, readFile, writeFile } from "node:fs/promises";

const USER = "Sujguha";
const OUT = "data/projects.json";
const headers = { "Accept": "application/vnd.github+json", "User-Agent": USER + "-site-sync" };
if (process.env.GITHUB_TOKEN) headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;

async function gh(path, accept) {
  const res = await fetch("https://api.github.com" + path, {
    headers: accept ? { ...headers, Accept: accept } : headers,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(path + " -> HTTP " + res.status);
  return accept ? res.text() : res.json();
}

// First real paragraph of a README (8+ words, so "Version 1.2 · Changelog"
// lines don't count): skips headings, badges, images, HTML, tables, code
// blocks, quotes and lists; strips Markdown links and emphasis.
export function summarize(md) {
  if (!md) return "";
  const lines = md.replace(/\r/g, "").replace(/```[\s\S]*?```/g, "").replace(/<!--[\s\S]*?-->/g, "").split("\n");
  const paras = [[]];
  for (const raw of lines) {
    const line = raw.trim();
    const skip = /^(#|!\[|\[!\[|<|\||>|[-*+] |\d+\. |---|===)/.test(line);
    if (!line || skip) {
      if (paras[paras.length - 1].length) paras.push([]);
      continue;
    }
    paras[paras.length - 1].push(line);
  }
  for (const para of paras) {
    let text = para.join(" ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]{1,3}([^*_`]+)[*_`]{1,3}/g, "$1")
      .replace(/\s+/g, " ").trim();
    if (text.split(" ").length < 8) continue;
    if (text.length > 400) text = text.slice(0, 400).replace(/\s+\S*$/, "") + "…";
    return text;
  }
  return "";
}

async function main() {
  const repos = (await gh(`/users/${USER}/repos?per_page=100&type=owner`)) || [];
  const projects = [];
  for (const r of repos) {
    if (r.fork || r.archived || r.private || r.size === 0) continue;
    const readme = await gh(`/repos/${USER}/${r.name}/readme`, "application/vnd.github.raw+json");
    projects.push({
      name: r.name,
      url: r.html_url,
      description: r.description || "",
      summary: summarize(readme),
      language: r.language || "",
      topics: r.topics || [],
      homepage: r.homepage || "",
      created_at: r.created_at,
    });
  }
  projects.sort((a, b) => b.created_at.localeCompare(a.created_at));

  const next = JSON.stringify({ user: USER, projects }, null, 2) + "\n";
  const prev = await readFile(OUT, "utf8").catch(() => "");
  if (prev === next) {
    console.log("No changes (" + projects.length + " projects).");
    return;
  }
  await mkdir("data", { recursive: true });
  await writeFile(OUT, next);
  console.log("Updated " + OUT + ": " + projects.map((p) => p.name).join(", "));
}

if (import.meta.url === "file://" + process.argv[1]) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
