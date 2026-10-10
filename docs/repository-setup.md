# Repository setup and branch protection

These settings are made in the GitHub web interface by an organisation owner.
They are not stored in the repository.

The organisation name is referred to as `<org>` below.
TODO: replace `<org>` once the organisation name has been decided.

## 1. Organisation and repository

- [ ] Create the GitHub organisation `<org>` (not a personal account).
- [ ] Make both experts organisation **owners**
      (Organisation → Settings → Member privileges / People → Role: Owner).
- [ ] Require two-factor authentication for all members
      (Organisation → Settings → Authentication security).
- [ ] Transfer the repository from its current location `behas/dfxa` to the
      organisation (Repository → Settings → General → Danger Zone → Transfer
      ownership) and rename it to `dfxa.at`. GitHub redirects the old URLs.
      Do this before GitHub Pages and the custom domain are configured
      (milestone 6), so that the domain is verified for the organisation and
      not for a personal account.

## 2. GitHub Pages

- [ ] Repository → Settings → Pages → Build and deployment → Source:
      **GitHub Actions**.
- [ ] After the DNS records in `docs/dns.md` are in place: Settings → Pages →
      Custom domain: `dfxa.at`, then tick **Enforce HTTPS** once the
      certificate has been issued.
- [ ] Verify the domain for the organisation to prevent domain takeover:
      Organisation → Settings → Pages → Add a domain → `dfxa.at`
      (requires the TXT record from `docs/dns.md`).
- [ ] Settings → Environments → `github-pages` → Deployment branches and tags:
      restrict to `main`.

## 3. Branch protection for `main`

Either a classic branch protection rule or a repository ruleset
(Settings → Rules → Rulesets → New branch ruleset, target `main`) with:

- [ ] **Require a pull request before merging**
  - [ ] Required approvals: **1** (the other expert)
  - [ ] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from Code Owners
- [ ] **Require status checks to pass** and require branches to be up to date:
  - `build` (job of workflow "CI")
  - `link check` (job of workflow "CI")
  The checks appear in the selection list only after the CI workflow has run
  at least once on a pull request.
- [ ] **Block force pushes**
- [ ] **Restrict deletions**
- [ ] Do not allow bypassing the above settings (also for administrators),
      so that changes to shared pages always need the other expert's approval.

## 4. Code owners

`.github/CODEOWNERS` lists both experts for every path; on an expert's own
profile bundle (`content/experts/<slug>/`) that expert is listed first.
Together with "Require review from Code Owners" and one required approval:

- a change by the profile owner to their own profile needs the other
  expert's approval (GitHub does not count the author's own review);
- a change by anyone else to a profile needs the profile owner's approval;
- a change to shared pages, templates, i18n strings or workflows needs the
  approval of the expert who did not author it.

Usernames: Bernhard Haslhofer `@behas`, Johann Stockinger `@uptuk`. Both must
have write access to the repository, otherwise GitHub ignores their entries.

With more than two experts, "approval of all experts" for shared pages cannot
be expressed by GitHub's review count alone; in that case raise the required
number of approvals to (number of experts − 1).
