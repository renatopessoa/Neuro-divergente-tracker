FROM node:22-alpine AS base

# Fase 1: Instalando e buildando a aplicação
FROM base AS builder
# libc6-compat é necessário para algumas dependências nativas (como o Prisma)
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copia os arquivos de configuração de pacotes e o schema do Prisma
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Instala as dependências
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile não encontrado." && npm install; \
    fi

# Copia o resto do código da aplicação
COPY . .

# Garante que o diretório public existe para evitar erro no estágio runner
RUN mkdir -p public

# Gera o cliente Prisma
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

# Executa o build da aplicação
RUN npm run build

# Fase 2: Imagem de produção
FROM base AS runner
WORKDIR /app

# Instala o openssl para o Prisma no runtime
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# A opção standalone copia apenas o que é estritamente necessário para rodar a aplicação
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# O prisma precisa estar presente na execução em produção
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]