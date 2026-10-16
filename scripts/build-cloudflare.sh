#!/bin/sh
# Build command for Cloudflare Workers Builds (see docs/cloudflare.md).
#
# Production (branch main): language parity, Hugo build, SEO check and the
# TODO guard must all pass, otherwise the build fails and nothing is deployed.
# Preview builds (other branches): same checks except the TODO guard; the
# preview is marked noindex so that search engines do not index it.
# Requires the build variable HUGO_VERSION=0.166.0 (Hugo extended).
set -eu
cd "$(dirname "$0")/.."

# enableGitInfo needs the full history for correct "last updated" dates.
git fetch --unshallow --quiet 2>/dev/null || true

hugo version
node scripts/check-language-parity.mjs
hugo --gc
node scripts/check-seo.mjs

branch="${WORKERS_CI_BRANCH:-}"
if [ "$branch" = "main" ]; then
  sh scripts/check-no-todo.sh
else
  echo "Preview build (branch '${branch:-local}'): TODO guard skipped, adding X-Robots-Tag: noindex."
  printf '\n/*\n  X-Robots-Tag: noindex\n' >> public/_headers
fi
