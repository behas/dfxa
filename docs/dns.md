# DNS checklist for dfxa.at

To be carried out by the domain holder, **Johann Stockinger**, at the DNS
provider of `dfxa.at`. `dfxaorg` is the name of the GitHub organisation that
owns the repository.

GitHub Pages values verified against the GitHub documentation source
(`github/docs`, `content/pages/configuring-a-custom-domain-for-your-github-pages-site/`)
on 14 October 2026. Check them again against
<https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>
before making the changes.

## 1. Before changing DNS

- [ ] The repository has been transferred to `dfxaorg` and GitHub Pages is
      enabled (Source: GitHub Actions); the first deployment has run
      (see `docs/repository-setup.md`).
- [ ] Note the existing records of `dfxa.at` (screenshot or export), so that
      they can be restored if needed.

## 2. Domain verification (prevents domain takeover)

In GitHub: Organisation `dfxaorg` → Settings → Pages → Add a domain →
`dfxa.at`. GitHub shows a TXT record:

| Host | Type | Value |
| --- | --- | --- |
| `_github-pages-challenge-dfxaorg` | TXT | value shown in the GitHub organisation settings |

- [ ] TXT record created.
- [ ] Verified in GitHub (may take up to 24 hours). Check:
      `dig _github-pages-challenge-dfxaorg.dfxa.at +nostats +nocomments +nocmd TXT`
- [ ] Keep the TXT record permanently.

## 3. Website records

| Host | Type | Value |
| --- | --- | --- |
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `@` | AAAA | `2606:50c0:8000::153` |
| `@` | AAAA | `2606:50c0:8001::153` |
| `@` | AAAA | `2606:50c0:8002::153` |
| `@` | AAAA | `2606:50c0:8003::153` |
| `www` | CNAME | `dfxaorg.github.io` |

- [ ] Remove all other existing `A`, `AAAA`, `ALIAS`/`ANAME` records for `@`
      and any existing record for `www` (e.g. a parking page of the registrar).
- [ ] Do **not** create wildcard records (`*.dfxa.at`): GitHub warns that they
      allow domain takeovers even for verified domains.
- [ ] If CAA records exist for `dfxa.at`, they must allow Let's Encrypt
      (`0 issue "letsencrypt.org"`), which GitHub Pages uses for the
      certificate.
- [ ] Check:
      `dig dfxa.at +noall +answer -t A`, `dig dfxa.at +noall +answer -t AAAA`,
      `dig www.dfxa.at +nostats +nocomments +nocmd`.

Then, in the repository: Settings → Pages → Custom domain `dfxa.at` → Save.
Once GitHub reports the DNS check as successful and the certificate has
been issued, tick **Enforce HTTPS**. GitHub redirects `www.dfxa.at` to
`dfxa.at` automatically because both records point to GitHub Pages.

## 4. Mail: forwarding of contact@dfxa.at

`contact@dfxa.at` is a forwarding address that delivers each enquiry to both
experts' own mailboxes; there is no shared mailbox (see the privacy policy).

Forwarding provider: **TODO: verify – name of the provider (Johann Stockinger)**.
The values below depend on the provider; take them from its documentation.

| Host | Type | Value |
| --- | --- | --- |
| `@` | MX | TODO: MX host(s) and priorities of the forwarding provider |
| `@` | TXT | SPF, e.g. `v=spf1 include:<provider-spf-domain> -all` (TODO: provider's include) |
| `<selector>._domainkey` | TXT/CNAME | DKIM key of the provider, if it signs mail for `dfxa.at` |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:<report address>; adkim=r; aspf=r` |

Forwarding targets (configured at the provider):

- [ ] Bernhard Haslhofer – TODO: own mailbox address
- [ ] Johann Stockinger – TODO: own mailbox address

Notes so that forwarded mail and replies are not marked as spam:

- **Forwarding:** the provider should rewrite the envelope sender (SRS) when
  forwarding; otherwise the receiving servers see an SPF failure for the
  original sender's domain. Most forwarding services do this; check it.
- **Replies:** the experts answer enquiries from their **own** addresses (they
  accept engagements in their own name). Then the SPF/DKIM/DMARC records of
  `dfxa.at` only need to cover the forwarding provider. If replies are to be
  sent *as* `contact@dfxa.at`, the experts' outgoing mail servers must be
  added to the SPF record and sign with DKIM for `dfxa.at`.
- **DMARC:** start with `p=none` and a report address, check the reports for
  a few weeks, then tighten to `p=quarantine`.
- [ ] Test: send an enquiry from an external address (e.g. Gmail) to
      `contact@dfxa.at`; check that it arrives in both mailboxes and that the
      headers show `spf=pass` (or `arc=pass`) and `dmarc=pass`.

## 5. dfxa.eu and dfxa.org

GitHub Pages serves only one custom domain per repository. At the registrar
of `dfxa.eu` and `dfxa.org`:

- [ ] Set up URL forwarding (HTTP **301**) of `dfxa.eu`, `www.dfxa.eu`,
      `dfxa.org` and `www.dfxa.org` to `https://dfxa.at/`. If the registrar
      supports it, keep the path (`dfxa.eu/x` → `https://dfxa.at/x`).
- [ ] Check that the registrar's forwarding works over HTTPS as well
      (`https://dfxa.eu` must not show a certificate error).
- [ ] If these domains do not send mail, publish:
      `@ TXT "v=spf1 -all"` and `_dmarc TXT "v=DMARC1; p=reject"`, so that they
      cannot be used for spoofing.
- [ ] Check: `curl -sI http://dfxa.eu https://dfxa.eu https://www.dfxa.org`
      → `301` with `Location: https://dfxa.at/`.

## 6. Final checks

- [ ] `https://dfxa.at` shows the site with a valid certificate.
- [ ] `http://dfxa.at` and `https://www.dfxa.at` redirect to `https://dfxa.at/`.
- [ ] `https://dfxa.eu` and `https://dfxa.org` redirect to `https://dfxa.at/`.
- [ ] GitHub organisation settings → Pages show `dfxa.at` as **verified**.
