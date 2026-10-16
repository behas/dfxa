# Hosting on Cloudflare

The site is a static Hugo build served by a **Cloudflare Worker with static
assets** (`wrangler.jsonc`), built and deployed by **Cloudflare Workers
Builds** (Git integration with the GitHub repository `dfxaorg/dfxa`). The
domains `dfxa.at`, `dfxa.eu` and `dfxa.org` are registered with and managed
in Cloudflare. Mail to `contact@dfxa.at` is handled by **Cloudflare Email
Routing** and a small Email Worker (`workers/mail/`).

Checked against the Cloudflare documentation source
(`cloudflare/cloudflare-docs`) on 16 October 2026. Menu names in the
dashboard change from time to time; the links in each section point to the
current documentation.

## 1. How a change goes live

1. A pull request against `main` runs the GitHub Actions checks
   (`.github/workflows/ci.yml`): language parity, Hugo build, SEO check,
   internal link check, accessibility (axe) and Content-Security-Policy
   check, service finder test. Branch protection requires them, plus the
   other expert's approval (`docs/repository-setup.md`).
2. Workers Builds builds every pushed branch. For branches other than `main`
   it uploads a **preview** (a preview URL on `workers.dev`, marked
   `X-Robots-Tag: noindex`) without changing the live site.
3. After merging, Workers Builds builds `main` with
   `sh scripts/build-cloudflare.sh` and deploys it to `dfxa.at`. The build
   fails, and nothing is deployed, if the language parity check, the Hugo
   build, the SEO check or the TODO guard (no `TODO` in published files)
   fails.

## 2. Create the Worker and connect the repository

Documentation: <https://developers.cloudflare.com/workers/ci-cd/builds/>

- [ ] Cloudflare dashboard → Workers & Pages → Create → Import a repository →
      GitHub → install the Cloudflare GitHub app for the organisation
      `dfxaorg` (repository `dfxa` only) → select `dfxaorg/dfxa`.
- [ ] Project settings:

  | Setting | Value |
  | --- | --- |
  | Worker name | `dfxa` (must match `name` in `wrangler.jsonc`) |
  | Production branch | `main` |
  | Build command | `sh scripts/build-cloudflare.sh` |
  | Deploy command | `npx wrangler deploy` |
  | Preview command | default (`npx wrangler preview`) |
  | Root directory | `/` |

- [ ] Build variables (Settings → Build → Variables and secrets):

  | Variable | Value | Purpose |
  | --- | --- | --- |
  | `HUGO_VERSION` | `0.166.0` | The build image ships an older Hugo by default |
  | `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | `1` | Browser tests run in GitHub Actions, not in Workers Builds |

- [ ] Settings → Build → Branch control: enable preview builds for
      non-production branches (optional, useful for reviewing pull requests).

## 3. Custom domain and redirects

Documentation: <https://developers.cloudflare.com/workers/configuration/routing/custom-domains/>,
<https://developers.cloudflare.com/rules/url-forwarding/>

- [ ] `dfxa.at` is attached to the Worker by `wrangler.jsonc`
      (`"routes": [{ "pattern": "dfxa.at", "custom_domain": true }]`); the
      first deployment creates the DNS record and the certificate. Remove
      any existing `A`/`AAAA`/`CNAME` record for `dfxa.at` first. If the
      first deployment fails because the build token may not create the
      custom domain, add `dfxa.at` in the dashboard instead (Worker →
      Settings → Domains & Routes → Add → Custom domain); the entry in
      `wrangler.jsonc` then matches the existing domain.
- [ ] `www.dfxa.at` → `https://dfxa.at` (zone `dfxa.at`):
  - DNS: proxied record for `www` (e.g. `AAAA www 100::`, proxied/orange cloud),
    so that Cloudflare receives the requests.
  - Rules → Redirect Rules → create: wildcard pattern
    `http*://www.dfxa.at/*` → `https://dfxa.at/${2}`, status 301,
    preserve query string.
- [ ] `dfxa.eu` and `dfxa.org` → `https://dfxa.at` (in each zone):
  - DNS: proxied records for `@` and `www` (e.g. `AAAA @ 100::` and
    `AAAA www 100::`, proxied).
  - Redirect Rule: `http*://dfxa.eu/*` → `https://dfxa.at/${2}` and
    `http*://www.dfxa.eu/*` → `https://dfxa.at/${2}`, status 301, preserve
    query string (same for `dfxa.org`). Alternatively one account-level
    Bulk Redirect list with all four source hostnames.
- [ ] `/de/` → `/` is handled by `static/_redirects`.

## 4. Zone settings (privacy and no third-party content)

The site must not load third-party resources, set cookies or run analytics.
Some Cloudflare features inject scripts or set cookies; check that they are
**off** for `dfxa.at` (and leave them off for `dfxa.eu`/`dfxa.org`):

- [ ] Web Analytics / Real User Monitoring (RUM): no automatic setup and no
      beacon for `dfxa.at`.
- [ ] Scrape Shield → **Email Address Obfuscation**: off. The site already
      obfuscates addresses itself; Cloudflare's feature would inject a script
      (blocked by the site's Content-Security-Policy) and rewrite the links.
- [ ] Speed → **Rocket Loader**: off.
- [ ] Security → **Bot Fight Mode** / JavaScript challenges: off (they can
      inject scripts and set the `__cf_bm` cookie).
- [ ] Zaraz: not enabled.
- [ ] SSL/TLS: mode Full (strict), **Always Use HTTPS** on, minimum TLS 1.2.
      HSTS is sent by the site itself (`static/_headers`); enable HSTS in the
      dashboard only if all subdomains are served over HTTPS.

After launch, verify in the browser developer tools (Network tab, Cookies)
that no request leaves `dfxa.at` and no cookie is set.

## 5. Response headers

`static/_headers` sets a strict Content-Security-Policy (only same-origin
scripts, plus the hash of the one-line inline script in
`layouts/_partials/head.html`), HSTS, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy` and the content types of the
Markdown and `llms.txt` files. If the inline script changes, update its hash:

```sh
printf '%s' 'document.documentElement.classList.add("js")' | openssl dgst -sha256 -binary | base64
```

`npm run check:a11y` reports any CSP violation on any page.

## 6. Mail: contact@dfxa.at

Documentation: <https://developers.cloudflare.com/email-service/>

An Email Routing rule can forward to only one destination; to deliver each
enquiry to both experts, the rule sends mail to the Email Worker
`workers/mail/src/index.js`, which forwards it to every address in the
secret `FORWARD_TO`.

- [ ] Email Routing → enable for `dfxa.at`; Cloudflare adds the MX and SPF
      records (see `docs/dns.md`).
- [ ] Destination addresses: add both experts' own mailbox addresses and have
      each expert confirm the verification email.
- [ ] Create the Worker `dfxa-mail`: Workers & Pages → Create → Import a
      repository → `dfxaorg/dfxa`, root directory `workers/mail`, no build
      command, deploy command `npx wrangler deploy`.
- [ ] Worker `dfxa-mail` → Settings → Variables and secrets → add **secret**
      `FORWARD_TO` = `<address 1>,<address 2>` (not stored in the repository).
- [ ] Email Routing → Routing rules → custom address `contact@dfxa.at` →
      action **Send to a Worker** → `dfxa-mail`.
- [ ] Catch-all: drop (do not forward other addresses).
- [ ] Test (see `docs/dns.md`, section 4).
