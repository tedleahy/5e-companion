#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
classifier="${script_dir}/classify-ci-paths.sh"

assert_classification() {
  local expected="$1"
  shift

  local actual
  actual="$(printf '%s\0' "$@" | bash "$classifier")"

  if [[ "$actual" != "$expected" ]]; then
    printf 'Expected:\n%s\nActual:\n%s\n' "$expected" "$actual" >&2
    return 1
  fi
}

none=$'backend=false\nfrontend=false\ne2e=false'
backend=$'backend=true\nfrontend=false\ne2e=false'
backend_frontend=$'backend=true\nfrontend=true\ne2e=false'
frontend_e2e=$'backend=false\nfrontend=true\ne2e=true'
backend_e2e=$'backend=true\nfrontend=false\ne2e=true'
all=$'backend=true\nfrontend=true\ne2e=true'

assert_classification "$none" docs/testing.md
assert_classification "$backend" deploy/compose.yml
assert_classification "$frontend_e2e" mobile-app/app/index.tsx
assert_classification "$backend_e2e" server/src/index.ts
assert_classification "$all" server/schema.graphql
assert_classification "$backend_e2e" package.json
assert_classification "$backend" .github/workflows/new-workflow.yml
assert_classification "$backend_frontend" .github/workflows/frontend-checks.yml
assert_classification "$backend_e2e" .github/workflows/e2e.yml
assert_classification "$all" .github/workflows/pr-checks.yml
assert_classification "$all" .github/scripts/classify-ci-paths.sh
assert_classification "$all" docs/testing.md mobile-app/app/index.tsx server/src/index.ts
