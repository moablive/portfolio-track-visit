# API Portfolio Tracker

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,ts,postgres,docker,linux,git" alt="Tecnologias" />
</p>

<p align="center">
  API simples e performática para rastreamento de visitas do seu portfólio.<br>
  <strong>Node.js + Express + TypeScript + PostgreSQL</strong>
</p>

<p align="center">
  <strong>Contador global atômico • Thread-safe • Docker ready</strong>
</p>

## Funcionalidades

- Incremento atômico do contador global de visitas
- Consulta das estatísticas atuais sem incrementar
- Health check da API e conexão com o banco
- Preparada para ambiente Docker (com docker-compose)

## Tecnologias

| Tecnologia         | Finalidade                          |
|--------------------|-------------------------------------|
| Node.js            | Runtime                             |
| Express            | Framework HTTP                      |
| TypeScript         | Tipagem estática                    |
| PostgreSQL         | Banco de dados                      |
| pg (node-postgres) | Driver de conexão                   |
| Docker             | Containerização                     |
| Docker Compose     | Orquestração local                  |

## Estrutura do Projeto

```text
portfolio-tracker-api/
├── src/
│   ├── Routes/
│   │   └── visitRoutes.ts
│   ├── Services/
│   │   └── service.ts                # Lógica de upsert atômico
│   ├── Interface/
│   │   └── EstatisticaPortfolioGlobal.ts
│   ├── Classes/
│   │   └── database-error.ts
│   ├── DB/
│   │   └── PostgresDB.ts             # Pool + conexão
│   └── server.ts                     # Entrypoint
├── .env                              # (Não versionado)
├── docker-compose.yml                # API + PostgreSQL
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Pré-requisitos

**Opção recomendada:**
- Docker + Docker Compose

**Opção manual:**
- Node.js 18+ (LTS)
- PostgreSQL instalado e rodando

## Como executar o projeto

### 🐳 1. Usando Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone <URL_DO_SEU_REPOSITORIO>
cd portfolio-tracker-api

# 2. Subir os serviços (api + postgres)
docker-compose up --build -d

# API estará disponível em:
# → http://localhost:7099
```

### 💻 2. Execução local (Sem Docker)

**Passo 1: Instalação**
```bash
npm install
```

**Passo 2: Configuração**
Crie um arquivo `.env` na raiz do projeto:

```properties
# Exemplo de .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=track
PORT=7099
```

**Passo 3: Banco de Dados**
Execute este SQL no seu banco PostgreSQL para criar a estrutura:

```sql
CREATE DATABASE track;

-- Conecte-se ao banco 'track' e rode:
CREATE TABLE estatisticas_portfolio_global (
    id              SERIAL PRIMARY KEY,
    contador_total  INTEGER NOT NULL DEFAULT 0,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insere o registro inicial (ID 1) se não existir
INSERT INTO estatisticas_portfolio_global (id, contador_total)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;
```

**Passo 4: Rodar**
```bash
npm run dev
```

## Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/` | Health check (API + Banco) |
| `POST` | `/api/track-visit` | Incrementa contador global (Retorna novo total) |
| `GET` | `/api/statistics` | Retorna estatísticas atuais (Sem incrementar) |

### Exemplo de Resposta (JSON)

**POST** `/api/track-visit`

```json
{
  "message": "Contador global de visitas atualizado com sucesso!",
  "id": 1,
  "total_geral_visitas": 142,
  "ultima_atualizacao": "2026-01-16T14:37:22.145Z"
}
```

### Tratamento de Erros

Em caso de erro, a API retorna:

```json
{
  "error": "Erro Interno do Servidor",
  "details": "Detalhes técnicos (apenas em ambiente de desenvolvimento)"
}
```

---
<p align="center">Desenvolvido por Guilherme Ferraz Bonato</p>
