FROM oven/bun:1 AS base

WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dnd_companion
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json bun.lock tsconfig.json prisma.config.ts schema.graphql ./
COPY prisma ./prisma

RUN bun install --frozen-lockfile
RUN bun run prisma:generate

COPY . .

EXPOSE 4000

CMD ["bun", "run", "start"]
