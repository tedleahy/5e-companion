#!/usr/bin/env bash
# Screenshot a mockup's phone frames with headless Chromium.
#
#   ./mockups/shoot.sh character-sheet 1 2 3      # frames 1, 2 and 3
#   ./mockups/shoot.sh character-sheet            # every frame
#   QUERY=hits ./mockups/shoot.sh character-sheet  # extra query string, here painting hit areas
#
# Chromium is the snap build, so it cannot read /tmp and the page is served
# over localhost instead of opened from a file. Output lands in mockups/shots/.
set -euo pipefail
cd "$(dirname "$0")/.."

NAME="${1:?usage: shoot.sh <mockup-name> [frame numbers]}"
shift || true
SRC="mockups/$NAME.html"
[ -f "$SRC" ] || { echo "no such mockup: $SRC" >&2; exit 1; }

WORK="$(mktemp -d "$HOME/.cache/mockup-shots.XXXXXX")"
trap 'rm -rf "$WORK"; [ -n "${SERVER:-}" ] && kill "$SERVER" 2>/dev/null || true' EXIT
mkdir -p mockups/shots

# A copy with a helper that isolates one frame and strips the gallery chrome.
# The mockup itself never carries screenshot code.
python3 - "$SRC" "$WORK/preview.html" <<'PY'
import sys
src, dst = sys.argv[1], sys.argv[2]
helper = """
<script>
(function(){
  var m = location.search.match(/frame=(\\d+)/);
  if(!m) return;
  var i = +m[1] - 1;
  document.querySelectorAll('.framewrap').forEach(function(w,j){ if(j!==i) w.remove(); });
  ['.gal-top','#mixer'].forEach(function(s){ var e=document.querySelector(s); if(e) e.remove(); });
  document.querySelectorAll('.frames-head').forEach(function(h){ h.remove(); });
  document.querySelector('.studio').style.padding = '0';
  var fw = document.querySelector('.framewrap');
  if(fw){
    var a = fw.querySelector('.frame-label'), b = fw.querySelector('.frame-note');
    if(a) a.remove(); if(b) b.remove();
    fw.style.width = '390px';
  }
  var ph = document.querySelector('.phone');
  if(ph){ ph.style.cssText += ';border-radius:0;box-shadow:none;padding:0;width:390px'; }
  var sc = document.querySelector('.phone-screen'); if(sc) sc.style.borderRadius = '0';
  var y = location.search.match(/scroll=(\\d+)/);
  if(y) setTimeout(function(){ document.querySelector('.phone-scroll').scrollTop = +y[1]; }, 200);
})();
</script>
</body>"""
open(dst, 'w').write(open(src).read().replace('</body>', helper, 1))
PY

python3 -m http.server 8932 --directory "$WORK" >/dev/null 2>&1 &
SERVER=$!
sleep 1

if [ "$#" -eq 0 ]; then
  set -- $(python3 -c "
import re
print(' '.join(str(i+1) for i in range(len(re.findall(r'id=\"tpl-', open('$SRC').read())))))")
fi

for i in "$@"; do
  out="mockups/shots/$NAME-$i.png"
  chromium --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 --window-size=390,812 \
    --screenshot="$PWD/$out" --virtual-time-budget=5000 \
    "http://localhost:8932/preview.html?frame=$i${QUERY:+&$QUERY}" >/dev/null 2>&1
  echo "$out"
done
