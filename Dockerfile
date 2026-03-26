# Estágio 1: Base para instalação
FROM node:22-alpine AS base

# Estágio 2: Dependências e Build
FROM base AS builder
# Instala bibliotecas necessárias para o Prisma e o build [cite: 7, 8]
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copia arquivos de definição de pacotes e o schema do Prisma [cite: 11, 12]
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Instala as dependências de forma otimizada usando o lockfile disponível [cite: 10, 14]
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile não encontrado." && npm install; \
    fi

# Copia o código fonte e gera o Prisma Client [cite: 11, 13, 17]
COPY . .
RUN npx prisma generate

# Desabilita telemetria e executa o build de produção [cite: 14, 29, 30]
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Estágio 3: Runner (Imagem final de produção)
FROM base AS runner
WORKDIR /app

# Instala o openssl necessário para a engine do Prisma em tempo de execução 
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Configura usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia apenas os arquivos necessários do estágio builder
COPY --from=builder /app/public ./public

# O Next.js em modo standalone requer apenas esses arquivos para rodar
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Mantemos a pasta prisma para permitir migrações se necessário
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Executa o servidor standalone do Next.js
CMD ["node", "server.js"]