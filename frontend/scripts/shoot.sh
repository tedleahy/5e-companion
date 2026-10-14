#!/usr/bin/env bash
# Screenshot the web build at phone, tablet portrait, tablet landscape and desktop sizes.
#
#   ./scripts/shoot.sh                          # the character list, at /
#   ./scripts/shoot.sh /component-library       # any other route
#   EXPO_PUBLIC_API_TOKEN=wrong ./scripts/shoot.sh   # EXPO_PUBLIC_* overrides reach the build
#
# Expects PostgreSQL, a seeded database and `bin/rails s` to be running already. Compare the
# results with `mockups/shoot.sh character-list`.
#
# Chromium is the snap build, so it cannot read /tmp: the build is served over localhost from
# under ~/.cache instead. It cannot write there either, so output lands in frontend/shots/.
set -euo pipefail
cd "$(dirname "$0")/.."

ROUTE="${1:-/}"
PORT=8933
# Width by height, in points. Each is taken at 2x.
SIZES=(390x812 820x1180 1180x820 1440x900)

# The build reads .env, but a variable already in the environment wins, as Expo's own loading does.
API_URL="${EXPO_PUBLIC_API_URL:-$(sed -n 's/^EXPO_PUBLIC_API_URL=//p' .env 2>/dev/null)}"
if ! curl -s -o /dev/null --max-time 3 "$API_URL/up"; then
  echo "warning: can't reach the API at ${API_URL:-(unset)}; is bin/rails s running?" >&2
  echo "carrying on, so the screenshots will show what the app does without it." >&2
fi

WORK="$(mktemp -d "$HOME/.cache/app-shots.XXXXXX")"
trap 'rm -rf "$WORK"; [ -n "${SERVER:-}" ] && kill "$SERVER" 2>/dev/null || true' EXIT
mkdir -p shots

# The component library only exists in development builds, and redirects to / in a release one.
EXPORT_MODE=()
if [ "$ROUTE" = /component-library ]; then
  EXPORT_MODE=(--dev)
fi

# Metro inlines EXPO_PUBLIC_* values when it transforms a file and caches the result, so without
# --clear an override would be ignored for any file the cache already holds.
npx expo export -p web --clear "${EXPORT_MODE[@]}" --output-dir "$WORK/dist" >/dev/null

# The build is a single page app, so any path that isn't a file gets index.html.
python3 - "$WORK/dist" "$PORT" <<'PY' >/dev/null 2>&1 &
import functools, http.server, os, sys
root, port = sys.argv[1], int(sys.argv[2])

class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        if not os.path.isfile(self.translate_path(self.path)):
            self.path = '/index.html'
        return super().send_head()

http.server.ThreadingHTTPServer(
    ('127.0.0.1', port), functools.partial(Handler, directory=root)
).serve_forever()
PY
SERVER=$!
sleep 1

NAME="$(echo "$ROUTE" | tr -c 'a-z0-9-\n' '-' | sed 's/^-*//; s/-*$//')"
NAME="${NAME:-characters}"

for size in "${SIZES[@]}"; do
  out="shots/$NAME-$size.png"
  chromium --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 --window-size="${size/x/,}" \
    --screenshot="$PWD/$out" --virtual-time-budget=8000 \
    "http://localhost:$PORT$ROUTE" >/dev/null 2>&1
  echo "$out"
done
