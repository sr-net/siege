FROM platformatic/node-caged:26-alpine AS base

WORKDIR /app

ENV CI=1
# Use production in case any dependencies use it in any way
ENV NODE_ENV=production
ENV UPM_STORE=/upm

# Enable node compile cache
ENV NODE_COMPILE_CACHE_PORTABLE=1
ENV NODE_COMPILE_CACHE=/node-cc
RUN mkdir -p $NODE_COMPILE_CACHE

FROM base AS base_deps

ENV CI=1

COPY package.json upm.lock ./

RUN npm i -g npm@latest
RUN npm i -g upm@1.4.0

# Install dependencies
RUN --mount=type=cache,target=/upm \
    upm install --frozen-lockfile --ignore-scripts

FROM base_deps AS build

WORKDIR /app

COPY --from=runtime_deps /app/node_modules/ node_modules/
COPY dbschema/ dbschema/
COPY src/ src/
COPY package.json tsconfig.json ./

# Run with...
# Source maps enabled, since it does not affect performance from what I found
ENV NODE_OPTIONS="--enable-source-maps"

CMD ["node", "--run", "start"]
