# DFXA – Digital Forensics Austria · Network of Independent Experts

Source of the website [dfxa.at](https://dfxa.at). The site presents the
independent, court-certified digital forensics experts in the network and helps
visitors find the expert for a given service.

Digital Forensics Austria is a network of independent experts. Engagements are
accepted exclusively by the individual experts in their own name. There is no
joint liability. The website must never present the network as a contracting
party (see "Content rules" below).

## Technology

- [Hugo](https://gohugo.io/) **extended, version 0.166.0** (pinned in
  `.hugo-version`, `hugo.toml` and the workflows in `.github/workflows/`).
- Custom minimal theme in `layouts/` and `assets/`; no third-party theme.
- No external fonts, CDNs, scripts, cookies or analytics. CSS and JS are
  bundled with Hugo Pipes.
- Bilingual: German (default, `/`) and English (`/en/`).
- Hosted on GitHub Pages, deployed by GitHub Actions on every push to `main`.

## Repository layout

| Path | Purpose |
| --- | --- |
| `hugo.toml` | Site configuration, languages, localised permalinks, menus, taxonomies |
| `content/` | Pages; every file exists as `*.de.md` and `*.en.md` |
| `i18n/de.toml`, `i18n/en.toml` | All UI strings (never hard-code text in templates) |
| `layouts/` | Templates (`baseof.html`, `home.html`, …) and partials in `layouts/_partials/` |
| `assets/` | CSS and JS processed by Hugo Pipes |
| `static/CNAME` | Custom domain for GitHub Pages (`dfxa.at`) |
| `scripts/check-language-parity.mjs` | CI check: every content file and i18n key in both languages |
| `docs/` | Operational documentation (repository settings, DNS, SEO, admission of experts) |

## Local development

Install Hugo extended 0.166.0 (see the
[installation guide](https://gohugo.io/installation/)), then:

```sh
hugo server                     # http://localhost:1313/ (DE) and /en/ (EN)
hugo --gc                       # production build into public/
node scripts/check-language-parity.mjs
```

`enableGitInfo` is on, so the repository needs at least one commit for the
build to succeed. Use `hugo server --enableGitInfo=false` in a fresh clone
without history.

## Editing content

### Edit or add an expert

Each expert is a page bundle in `content/experts/<slug>/` with
`index.de.md`, `index.en.md` and a portrait image. The front matter schema
(court certification, services, audiences, domains, optional contact data) is
documented in `docs/adding-an-expert.md`. Each expert edits only their own
bundle; `CODEOWNERS` assigns it to them.

### Add a service

1. Create `content/services/<slug>/_index.de.md` and `_index.en.md` with
   `title`, `description` and `domains`.
2. Add `<slug>` to the `services` list in the front matter of every expert
   who offers it. The service finder is generated from the expert profiles;
   it is not maintained by hand.

### Content rules

- Use wording such as "the experts in this network" and "contact the expert
  directly". Never "we offer", "our team", "book us", "& Partner", "Group",
  "Institute" or "Office".
- Court certifications appear only on the individual expert's profile page.
- No references to cases or clients, testimonials, client logos, statistics
  or case counts unless the expert provides them explicitly.
- Every page needs a `description` (≤ 155 characters) in both languages.
- Items that need confirmation are marked `TODO: verify` in the content files.

## Review rule for shared pages

Changes to shared pages (home, about, legal notice, privacy, disclaimer
text in `i18n/`) and to templates require the approval of all experts.
This is enforced by branch protection on `main` and by `CODEOWNERS`; see
`docs/repository-setup.md`.

## Deployment

Every push to `main` runs the checks in `.github/workflows/ci.yml` (language
parity, build, internal link check) and then deploys with the official
GitHub Pages actions (`.github/workflows/deploy.yml`). Pull requests run the
same checks without deploying. External links are checked weekly by
`.github/workflows/linkcheck-external.yml`.
