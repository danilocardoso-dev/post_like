# Backend Likes API

API REST em Node.js que simula um sistema de likes em posts, com processamento assíncrono via fila, cache de leitura e controle de concorrência.

## Stack

- **Node.js + TypeScript** — runtime e linguagem
- **Fastify** — framework HTTP
- **PostgreSQL** — banco de dados (fonte de verdade)
- **Redis** — cache de leitura e fila de jobs
- **BullMQ** — processamento assíncrono de likes
- **Prisma v7** — acesso ao banco com `@prisma/adapter-pg`
- **Swagger (OpenAPI 3.0)** — documentação interativa em `/docs`

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (ou via Docker)
- Redis rodando localmente (ou via Docker)

### Subindo dependências rápido com Docker

```bash
docker run -d --name postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=likes_db -p 5432:5432 postgres:16
docker run -d --name redis -p 6379:6379 redis:7
```

---

## Setup

### 1. Clone o repositório

```bash
git clone https://github.com/danilocardoso-dev/post_like
cd post-like
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com os valores corretos:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/likes_db
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Execute as migrations do banco

```bash
npm run db:migrate
```

### 5. Inicie a API

```bash
# desenvolvimento (com hot reload)
npm run start:watch

# desenvolvimento (sem hot reload)
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.  
Documentação Swagger: `http://localhost:3000/docs`

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run start:dev` | Inicia a API em modo desenvolvimento |
| `npm run start:watch` | Inicia com hot reload |
| `npm run build` | Compila para JavaScript em `dist/` |
| `npm run start:dist` | Build + executa versão compilada |
| `npm run db:migrate` | Executa as migrations do banco |
| `npm run db:generate` | Regenera o Prisma Client |
| `npm run db:studio` | Abre o Prisma Studio |

---

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/posts` | Lista todos os posts |
| `GET` | `/posts/top` | Top 10 posts por likes |
| `GET` | `/posts/:id` | Retorna um post pelo ID |
| `GET` | `/posts/:id/likes` | Retorna contagem de likes de um post |
| `POST` | `/posts/:id/like` | Registra um like (processado via fila) |

### Exemplo: registrar um like

```bash
curl -X POST http://localhost:3000/posts/<post-uuid>/like \
  -H "Content-Type: application/json" \
  -d '{"userId": "<user-uuid>"}'
```

Resposta: `202 Accepted` — o like é enfileirado e processado de forma assíncrona.

---

## Arquitetura

```
src/
├── app.ts                     # registra plugins e rotas
├── server.ts                  # entry point (listen + worker)
├── cache/redis.ts             # cliente Redis + helpers (get/set/invalidate)
├── db/prisma.ts               # instância singleton do PrismaClient
├── queue/likes.queue.ts       # definição da fila BullMQ
├── workers/likes.worker.ts    # consumer da fila
├── plugins/swagger.ts         # configuração do Swagger
└── modules/
    ├── posts/
    │   ├── posts.routes.ts    # definição de rotas + schemas OpenAPI
    │   ├── posts.controller.ts
    │   └── posts.service.ts   # lógica de negócio + cache
    └── likes/
        ├── likes.routes.ts
        ├── likes.controller.ts
        └── likes.service.ts   # transação SQL com idempotência
```

---

## Decisões técnicas

### Fila de likes (BullMQ)
O endpoint `POST /posts/:id/like` não escreve no banco diretamente — ele enfileira um job e responde `202 Accepted` imediatamente. Isso evita contenção no banco sob alta concorrência e suaviza picos de tráfego. O worker processa os jobs de forma serializada por padrão, permitindo escala horizontal adicionando mais workers.

Configuração de resiliência: 3 tentativas com backoff exponencial (1s, 2s, 4s).

### Idempotência e concorrência (PostgreSQL)
A tabela `post_likes` tem chave primária composta `(post_id, user_id)`, o que torna impossível -- em nível de banco -- que um usuário dê dois likes no mesmo post. A query usa `INSERT ... ON CONFLICT DO NOTHING` e só incrementa o `likes_count` se a inserção realmente ocorreu. Tudo dentro de uma transação, garantindo consistência forte.

### Cache de leitura (Redis)
As rotas de leitura (`GET /posts`, `GET /posts/top`, `GET /posts/:id`, `GET /posts/:id/likes`) usam estratégia read-through: primeiro consultam o Redis, só vão ao banco em caso de miss. Após cada like processado, o worker invalida as chaves afetadas. Isso entrega consistência eventual no cache com consistência forte no banco.

### Por que Fastify e não Express?
Fastify tem validação de schema nativa via JSON Schema, serialização de resposta otimizada e suporte oficial ao Swagger integrado. Para uma API de alto volume de likes, a diferença de throughput é relevante.

### Por que Prisma v7 com adapter-pg e não um ORM mais simples?
O Prisma v7 introduziu os `Adapters` como forma de controlar a conexão com o banco diretamente via `pg`, mantendo o benefício do Client tipado. Para operações de concorrência crítica (`$executeRaw` com `ON CONFLICT DO NOTHING`), o controle explícito do SQL é necessário — o Prisma permite misturar queries tipadas com SQL raw na mesma transação.

### Worker no mesmo processo da API
Para simplicidade de dev/deploy, o worker roda no mesmo processo Node.js que a API. Em produção, o ideal é separar em processos distintos (dois deployments) para escalar independentemente. A separação seria simples: basta um segundo entry point que chame apenas `startLikesWorker()`.

---

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL | `postgresql://user:pass@localhost:5432/likes_db` |
| `REDIS_HOST` | Host do Redis | `localhost` |
| `REDIS_PORT` | Porta do Redis | `6379` |
