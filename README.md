# 5e Companion - An app to use while playing D&D 5th edition.

⚠️ heads up ⚠️ this project is pretty much entirely vibe-coded

I'm using it as a playground to learn about AI stuff, testing out different models, harnesses, prompting techniques, etc.

Consequently there's a lot of extremely questionable code in here. ye be warned

---

- Frontend: React Native with [Expo](https://docs.expo.dev/) for web, ios, and android targets
- Backend: [Apollo](https://www.apollographql.com/docs/) GraphQL API

---

## Setup
First, install bun and yarn.<br>
Why both? I had issues getting the expo app working with bun, so that uses yarn simply because it worked out of the box and was faster to build/install than npm.<br>
At some point I'll get round to fixing that and removing the dependency on yarn.

Once they're installed, from the project root, run:

```bash
# Install deps
bun server:i
bun app:i

# Start the postgres database
docker compose up

# Seed it with the SRD data
bunx prisma db seed

# Start the API server
bun server:start

# Start up the expo server to allow you to run the app on your device (or web)
bun app:start
```
