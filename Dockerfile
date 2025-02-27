# Dependencies
FROM --platform=linux/amd64 node:20.14-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
RUN apk add --no-cache python3 make g++ && \
    ln -sf python3 /usr/bin/python
WORKDIR /app


COPY package.json package-lock.json ./

RUN  npm i --legacy-peer-deps
# Build
FROM --platform=linux/amd64 node:20.14-alpine AS builder
ENV DATABASE_URL "postgres://root:root@localhos2:5432/muze"
ENV NEXTAUTH_SECRET "kRvf9Vl7K9MGvFX+/RjxaE+mmC3rQvsBMpXgsqcGwd6ACe08BidZX7HFlNA+mQk1vkM0KgUKnJm5uwN+wAO7bZZjaXfOclirNvFFB32fxEdA2A9P6l6lm0szxGq0kPWgwPtR6OeDUKlQoNlEbXXVJVnEEam3MxwL4qqzUFmXo0Ju+X+/eZeInvWKp1bvWszKD5/AMvXgsch+zVKDgtOnNkJ0IsaBgLzX1JIdg=="



WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1


RUN npm run build --legacy-peer-deps

# Runner

FROM --platform=linux/amd64 node:20.14-alpine AS runner
ENV DATABASE_URL "postgres://root:root@localhos2:5432/muze"
ENV NEXTAUTH_SECRET "kRvf9Vl7K9MGvFX+/RjxaE+mmC3rQvsBMpXgsqcGwd6ACe08BidZX7HFlNA+mQk1vkM0KgUKnJm5uwN+wAO7bZZjaXfOclirNvFFB32fxEdA2A9P6l6lm0szxGq0kPWgwPtR6OeDUKlQoNlEbXXVJVnEEam3MxwL4qqzUFmXo0Ju+X+/eZeInvWKp1bvWszKD5/AMvXgsch+zVKDgtOnNkJ0IsaBgLzX1JIdg=="
ENV MUSIC_PATH "/app/music"
ENV COVER_ART_PATH "/app/covers"


WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/src/env.js ./src/
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/ ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=deps  /app/package.json ./package.json
RUN mkdir /app/music
RUN mkdir /app/covers


EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"] 
