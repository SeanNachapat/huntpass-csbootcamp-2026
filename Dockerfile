FROM node:20-alpine AS base
RUN apk add --no-cache openssl

FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++ \
    && ln -sf /usr/bin/python3 /usr/bin/python
ENV PYTHON=/usr/bin/python3
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Apply migrations so that Next.js static generation has a migrated database
RUN npx prisma migrate deploy

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory for SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

COPY --from=builder /app/prisma ./prisma

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Run as root to avoid SQLite permission issues with bind mounts
# USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Point SQLite database to the bind-mounted file in data directory
ENV DATABASE_URL="file:/app/data/dev.db"

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
