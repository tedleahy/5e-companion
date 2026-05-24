#!/usr/bin/env bash
set -euo pipefail

: "${API_IMAGE:?API_IMAGE is required}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${HEAD_SHA:?HEAD_SHA is required}"

docker_config_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$docker_config_dir"
}

trap cleanup EXIT
export DOCKER_CONFIG="$docker_config_dir"

compose() {
  docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod "$@"
}

cd "$DEPLOY_PATH"

git fetch origin main
latest_main="$(git rev-parse origin/main)"

if [ "$latest_main" != "$HEAD_SHA" ]; then
  echo "Skipping stale deploy for ${HEAD_SHA}; origin/main is ${latest_main}."
  exit 0
fi

git checkout main
git reset --hard "$HEAD_SHA"

export API_IMAGE

if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  printf '%s\n' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
fi

compose pull api
compose run --rm --no-build api bun run db:deploy
compose up -d --no-build

api_container="$(compose ps -q api)"
if [ -z "$api_container" ]; then
  compose ps
  echo "API container was not created after deploy"
  exit 1
fi

for attempt in $(seq 1 24); do
  api_health="$(
    docker inspect \
      --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
      "$api_container"
  )"

  if [ "$api_health" = "healthy" ]; then
    break
  fi

  if [ "$attempt" = "24" ]; then
    compose logs --tail=100 api
    echo "API container did not become healthy after deploy"
    exit 1
  fi

  sleep 5
done

if [ -n "${PRODUCTION_API_URL:-}" ]; then
  curl -fsS --max-time 10 "$PRODUCTION_API_URL" \
    -H 'content-type: application/json' \
    --data '{"query":"query { __typename }"}' \
    >/dev/null
fi
