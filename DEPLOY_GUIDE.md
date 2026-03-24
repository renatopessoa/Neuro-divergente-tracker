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
Como o banco de dados está exposto externamente no IP `72.62.137.175`, você pode e deve rodar as migrations e o seed diretamente **do seu próprio computador (localmente)** antes de testar a aplicação no Coolify. O erro `datasource.url` na VPS ocorre porque o terminal do container do Next.js nem sempre carrega a variável do arquivo `.env` sem ajuda, e o arquivo `seed.ts` não constava na imagem do Docker de produção antes desta versão.

Abra o seu terminal (PowerShell ou VSCode local) e rode:

```bash
# Se estiver no Windows PowerShell
$env:DATABASE_URL="postgres://postgres:xurOtXYuNOXzV1hVUIEWVfaK1qzLY4I89Q5LEmvemJnFakbFk1GVh1q1pIeynMIE@72.62.137.175:5432/postgres"

# Execute a sincronização do banco na VPS através do seu computador local:
npx prisma db push

# E popule o usuário admin inicial:
npx --yes tsx prisma/seed.ts
```

O usuário padrão criado será:
- **Email**: `admin@neurotracker.com`
- **Senha**: `senha_provisoria_123` (Recomendamos alterar após o logar).

## 5. Verificação
Após o deploy e a criação do banco, acesse a URL configurada no Coolify (ex: `http://p08sosgwgg4ww4cksc8o8k8s.72.62.137.175.sslip.io`) e faça login.
