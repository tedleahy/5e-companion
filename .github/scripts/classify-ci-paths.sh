#!/usr/bin/env bash
set -euo pipefail

backend=false
frontend=false
e2e=false

while IFS= read -r -d '' path; do
  case "$path" in
    server/* | deploy/* | srd-json-files/* | .github/scripts/* | .github/workflows/* | bun.lock | package.json)
      backend=true
      ;;
  esac

  case "$path" in
    mobile-app/* | server/schema.graphql | .github/workflows/frontend-checks.yml)
      frontend=true
      ;;
  esac

  case "$path" in
    server/* | mobile-app/* | srd-json-files/* | .github/workflows/e2e.yml | bun.lock | package.json)
      e2e=true
      ;;
  esac

  case "$path" in
    .github/scripts/classify-ci-paths.sh | .github/scripts/classify-ci-paths.test.sh | .github/workflows/pr-checks.yml)
      backend=true
      frontend=true
      e2e=true
      ;;
  esac
done

printf 'backend=%s\n' "$backend"
printf 'frontend=%s\n' "$frontend"
printf 'e2e=%s\n' "$e2e"
