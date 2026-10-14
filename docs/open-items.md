# Open items before launch

Status: 14 October 2026. `scripts/list-todos.sh` lists all `TODO` markers
in the repository. The deployment workflow refuses to publish while any
built HTML page still contains `TODO` (see `.github/workflows/deploy.yml`).

## Bernhard Haslhofer

- [ ] Portrait: add `content/experts/bernhard-haslhofer/portrait.jpg`
      (square or portrait format, at least 400 × 400 px) and remove the TODO
      comment in both front matter files.
- [ ] Background paragraph (DE and EN): career, research, publications.
      Drafting from bernhardhaslhofer.info needs network access to that host
      in the session environment; alternatively provide the text.

## Johann Stockinger

- [ ] Court certification (JustizOnline entry W383379): official name of
      field 68.60, any restrictions ("Nur für …") and the "Zertifiziert bis"
      dates of 68.60 and 68.62.
- [ ] Issuing body of the Certified Fraud Investigator (CFI) certification.
- [ ] Working languages and audiences (currently: German, English; all five
      audiences).
- [ ] Background paragraph (DE and EN) and portrait.
- [ ] Mail forwarding provider for contact@dfxa.at (name, address, transfer
      outside the EU) – needed for the privacy policy and `docs/dns.md`.
- [ ] Own mailbox addresses of both experts as forwarding targets.
- [ ] Confirm the robots.txt policy (all crawlers allowed, including AI
      training crawlers).
- [ ] DNS changes according to `docs/dns.md` (after the repository transfer).
- [ ] Approve the shared pages (home, about, legal notice, privacy) – required
      for all shared pages by the cooperation agreement.

## Legal review

- [ ] Legal notice (whole text), including whether VAT identification
      numbers must be stated.
- [ ] Privacy policy (whole text), including GitHub, Inc.'s address and
      contracting entity and its certification under the EU-US Data Privacy
      Framework, and the address of the Datenschutzbehörde.

## Repository and deployment

- [ ] Create the GitHub organisation, make both experts owners, transfer
      `behas/dfxa` and rename it to `dfxa.at`; replace `<org>` in
      `docs/repository-setup.md` and `docs/dns.md`.
- [ ] Enable GitHub Pages (Source: GitHub Actions), branch protection and
      required checks (`build`, `link check`, `accessibility`) as in
      `docs/repository-setup.md`.
- [ ] Merge this branch into `main` via a pull request reviewed by the other
      expert; the deployment runs on the push to `main`.
- [ ] Custom domain `dfxa.at`, Enforce HTTPS; redirects of `www.dfxa.at`,
      `dfxa.eu`, `dfxa.org` (see `docs/dns.md`, section 6).

## After launch

- [ ] Validate structured data and register the site in Google Search
      Console and Bing Webmaster Tools (`docs/seo.md`).
- [ ] Link from the experts' own websites and profiles to their DFXA
      profiles (`docs/seo.md`).

## Acceptance checklist (from the brief)

| Item | Status |
| --- | --- |
| Disclaimer and "Network of Independent Experts" on every page | done |
| No wording presenting the network as a contracting party | done; to be confirmed in the experts' review |
| Court certifications only on profile pages, linked to JustizOnline | done (service-page cards show the court fields, as specified in section 5) |
| No contact form; all contact links to contact@dfxa.at with forwarding note | done |
| No third-party requests | done (tested in Chromium) |
| Everything in German and English; language-parity check in CI | done |
| hreflang, canonical URLs, language switcher point to equivalent pages | done |
| JSON-LD without errors; network never Organization/LocalBusiness | checked by `scripts/check-seo.mjs`; external validation after launch |
| Unique titles and descriptions; sitemap and robots.txt | done |
| llms.txt, llms-full.txt, Markdown alternates with disclaimer | done |
| robots.txt policy for AI training crawlers confirmed by the experts | open (Johann Stockinger) |
| Service finder with and without JavaScript; shareable filter URLs | done (`scripts/test-finder.cjs`) |
| Lighthouse mobile ≥ 95; no axe errors | done locally (100 / 0 violations) |
| Link check passes in CI | done locally; CI runs on the first pull request |
| https://dfxa.at with valid certificate; www, dfxa.eu, dfxa.org redirect | open (milestone 6) |
| Branch protection and CODEOWNERS active | CODEOWNERS done; branch protection open |
| All `TODO: verify` items confirmed | open (this list) |
