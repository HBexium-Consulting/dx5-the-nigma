#!/usr/bin/env bash
# Assemble le site complet dans _site/ pour GitHub Pages (servi sous un sous-dossier).
#   /                 ← dx5thenigma/
#   /bibliotheque/    ← dx5-bibliotheque/
#   /<page>/, /assets ← dx5-pages/
# Les chemins absolus ("/pro/", "/assets/…") sont préfixés par BASE_PATH.
# Usage : BASE_PATH=/dx5-the-nigma scripts/build-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."

BASE="${BASE_PATH:-/dx5-the-nigma}"
BASE="${BASE%/}"
OUT=_site

rm -rf "$OUT"
mkdir -p "$OUT/bibliotheque"
cp -R dx5thenigma/. "$OUT/"
rm -f "$OUT"/*.code-workspace
cp -R dx5-bibliotheque/. "$OUT/bibliotheque/"
rm -f "$OUT/bibliotheque/README.md"
cp -R dx5-pages/. "$OUT/"
find "$OUT" -name .DS_Store -delete
touch "$OUT/.nojekyll"

if [ -n "$BASE" ]; then
  # attributs HTML href="/…" et src="/…" (pas les URL protocol-relative "//…")
  find "$OUT" -name '*.html' -print0 | xargs -0 sed -i -E \
    -e "s#(href|src|action)=\"/([^/\"]|\")#\1=\"${BASE}/\2#g" \
    -e "s#<head>#<head>\n  <meta name=\"hbx-base\" content=\"${BASE}/\">#"
  # chaînes JS pointant vers la bibliothèque (extraits audio, vignettes)
  find "$OUT" -name '*.js' -print0 | xargs -0 sed -i -E \
    -e "s#(['\"\`])/bibliotheque/#\1${BASE}/bibliotheque/#g"
fi

echo "Site assemblé dans $OUT/ (base : ${BASE:-/})"
