FROM node:22-alpine as runtime_deps

RUN corepack enable

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY .npmrc .

ENV PNPM_HOME=/pnpm
ENV CI=1
ENV NODE_ENV=production
# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY --from=runtime_deps /app/node_modules node_modules
COPY . .

# Run with...
# Source maps enabled, since it does not affect performance from what I found
ENV NODE_OPTIONS="--enable-source-maps"
# Warnings disabled, we know what we're doing and they're annoying
ENV NODE_NO_WARNINGS=1
# Use production in case any dependencies use it in any way
ENV NODE_ENV=production

CMD ["node", "--run", "start"]
