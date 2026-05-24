#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_ACTOR:?GITHUB_ACTOR is required}"
: "${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_TOKEN:?GITHUB_TOKEN is required}"
: "${HEAD_SHA:?HEAD_SHA is required}"

repository_name="$(printf '%s' "$GITHUB_REPOSITORY" | tr '[:upper:]' '[:lower:]')"
repository_owner="${repository_name%%/*}"
repository_slug="${repository_name#*/}"
image_name="ghcr.io/${repository_owner}/${repository_slug}-api"
image_ref="${image_name}:${HEAD_SHA}"

printf '%s\n' "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
docker build --pull --tag "$image_ref" --tag "${image_name}:main" server
docker push "$image_ref"
docker push "${image_name}:main"

{
  echo "api_image=$image_ref"
} >> "$GITHUB_OUTPUT"
