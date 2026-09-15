# Sujoy Guha — Portfolio Site

Live site: https://sujguha.github.io/Mywebsite/

A single-page portfolio built with plain HTML/CSS (no build step, no framework), styled as a dark "release changelog" — sections read like version history entries, projects read like changelog cards.

## Pages

| File            | Description                                                                 |
|-----------------|------------------------------------------------------------------------------|
| `index.html`    | Home page — About, Experience, Projects, Skills, Certifications, Contact    |
| `ersa.html`     | Subpage on ERSA (Enterprise Release Stability Agent), a LangChain-based agentic tool for release governance decisioning |
| `articles.html` | Subpage listing published articles (LinkedIn Pulse) and work in progress   |
| `profile.png`   | Profile photo used in the hero section of `index.html`                      |

## Structure & theme

- All styling is inline `<style>` in each page's `<head>` — no external stylesheet, no build tooling. Copy the `:root` variables and section styles when adding a new page so it matches the existing dark theme.
- Color tokens: `--bg`, `--surface`, `--border`, `--text`, `--text-dim`, `--go` (accent green), `--hold` (amber, used for "in progress" states).
- Fonts: IBM Plex Sans (body), IBM Plex Mono (labels, nav, meta text) — loaded from Google Fonts.
- Navigation lives in `.topbar .nav` on every page and links to `index.html#section` anchors plus the two subpages.

## Updating content

- **Experience / Projects / Skills / Certifications**: edit the relevant section directly in `index.html`.
- **ERSA details**: edit `ersa.html`.
- **Articles**: edit `articles.html`. The LinkedIn Pulse article card has a placeholder `href="#"` — replace with the live article URL once available. The AI Implementation Series entry is marked "in progress" until published.

## Deploying

This is a GitHub Pages site served from the repo root on the default branch. Upload or commit changes directly to `main` — GitHub Pages picks them up automatically after a short build delay.
