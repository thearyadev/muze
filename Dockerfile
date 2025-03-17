FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN apk add --no-cache libc6-compat openssl python3 make g++ 
RUN ln -sf /usr/bin/python3 /usr/bin/python
ENV PYTHON=/usr/bin/python3
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN apk add --no-cache libc6-compat openssl python3 make g++
RUN ln -sf /usr/bin/python3 /usr/bin/python
ENV PYTHON=/usr/bin/python3
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ENV DATABASE_URL="postgres://root:root@localhos2:5432/muze"
ENV MUSIC_PATH="/app/music"
ENV COVER_ART_PATH="/app/covers"

RUN pnpm run build

FROM base


ENV DATABASE_URL="postgres://root:root@localhos2:5432/muze"
ENV MUSIC_PATH="/app/music"
ENV COVER_ART_PATH="/app/covers"
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next
EXPOSE 3000
CMD [ "pnpm", "start" ]
