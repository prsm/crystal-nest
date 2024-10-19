# ----- BASE ------
FROM node:23 AS base

RUN apt-get update
RUN apt-get install -y procps && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm

WORKDIR /usr/src/app

# ----- DEVELOPMENT ------
FROM base AS development
COPY . .

# ----- BUILD ------
FROM development AS build
RUN pnpm install --frozen-lockfile
RUN pnpm build

# ------PREPRODUCTION
FROM build AS preproduction
RUN rm -rf node_modules
RUN pnpm install --frozen-lockfile --production --ignore-scripts

# ----- PRODUCTION ------
FROM node:23-slim AS production

COPY --from=preproduction /usr/src/app/dist ./dist
COPY --from=preproduction /usr/src/app/node_modules ./node_modules

# ----- MAIN ------
CMD ["node", "dist/main"]