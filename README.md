# 5e Companion - An app to use while playing D&D 5th edition.

⚠️ heads up ⚠️ this project is pretty much entirely vibe-coded

I'm using it as a playground to learn about AI stuff, testing out different models, harnesses, prompting techniques, etc.

Consequently there's a lot of extremely questionable code in here. ye be warned

---

- **Frontend:** React Native with [Expo](https://docs.expo.dev/) for web, iOS, and Android
- **Backend:** [Apollo](https://www.apollographql.com/docs/) GraphQL API (Bun + Prisma + PostgreSQL)

## Setup

Install **Bun** and **Yarn** (Expo still uses Yarn in this repo). Then follow **[`docs/local-development.md`](docs/local-development.md)** for env files, Postgres, seeding, and running the server + Expo dev server.

Quick start after prerequisites:

```bash
bun setup                                    # install + codegen (optional one-off)
# edit server/.env and mobile-app/.env — see docs/local-development.md
docker compose -f server/docker-compose.yml up -d
bun db:seed
bun server:start
bun app:start
```

Agent rules: [`AGENTS.md`](AGENTS.md). Full docs index: [`docs/README.md`](docs/README.md).
