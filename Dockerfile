# Estágio de dependências
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instala pnpm se necessário (opcional, usando npm aqui para simplicidade)
# COPY package.json pnpm-lock.yaml* ./
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

# Gera o Prisma Client e faz o build
RUN npx prisma generate
RUN npm run build

# Estágio de produção
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Desabilita a telemetria do Next.js durante o runtime
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos necessários do estágio de build
COPY --from=builder /app/public ./public

# Configura as permissões para o cache do Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Aproveita o output standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
