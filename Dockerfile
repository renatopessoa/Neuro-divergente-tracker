# Estágio de dependências
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Estágio de build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variável necessária para o Prisma gerar o cliente durante o build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Gera o Prisma Client ANTES do build
RUN npx prisma generate
RUN npm run build

# Estágio de produção
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Configura as permissões para o cache do Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Aproveita o output standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# IMPORTANTE: Copiar o Prisma Client gerado para o runner
# O standalone do Next.js geralmente não inclui o binário do prisma engine se não for explicitamente necessário
# Mas as definições de tipo e o runtime do cliente são necessários.
# Ao usar o caminho padrão, ele fica em node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
