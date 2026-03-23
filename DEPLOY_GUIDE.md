# Guia de Deploy no Coolify - NeuroTracker

Este guia detalha os passos para realizar o deploy da aplicação no seu painel Coolify.

## 1. Configuração do Repositório
As alterações necessárias já foram enviadas para o seu repositório GitHub.
- **Dockerfile**: Configurado para build standalone do Next.js.
- **docker-compose.yml**: Pronto para o Coolify.
- **.env.example**: Modelo das variáveis de ambiente.

## 2. No Painel Coolify
1. Vá em **Resources** > **New Resource**.
2. Selecione **Public Repository** ou **GitHub App** (se já tiver conectado sua conta).
3. Cole a URL do repositório: `https://github.com/renatopessoa/Neuro-divergente-tracker`.
4. Selecione o branch `main`.

## 3. Variáveis de Ambiente (Environment Variables)
No Coolify, na aba **Environment Variables**, adicione as seguintes chaves:

| Chave | Valor |
| :--- | :--- |
| `DATABASE_URL` | `postgres://postgres:xurOtXYuNOXzV1hVUIEWVfaK1qzLY4I89Q5LEmvemJnFakbFk1GVh1q1pIeynMIE@72.62.137.175:5432/postgres` |
| `NEXTAUTH_SECRET` | *(Gere uma chave aleatória ou use uma existente)* |
| `NEXTAUTH_URL` | `https://seu-dominio-no-coolify.com` |
| `NODE_ENV` | `production` |

> **Nota**: Certifique-se de que o `DATABASE_URL` esteja marcado como "Build Variable" também, pois o Prisma precisa dele durante o build.

## 4. Banco de Dados e Migrations
Como você já tem o banco rodando no IP `72.62.137.175`, a aplicação irá se conectar automaticamente. 

Para rodar as migrations iniciais e criar o usuário admin, você pode usar o terminal do Coolify após o primeiro deploy bem-sucedido:
```bash
npx prisma migrate deploy
npx ts-node seed.ts
```

O usuário padrão criado será:
- **Email**: `admin@neurotracker.com`
- **Senha**: `senha_provisoria_123` (Recomendamos alterar após o primeiro login).

## 5. Verificação
Após o deploy, acesse o domínio configurado no Coolify e verifique se a página de login carrega corretamente.
