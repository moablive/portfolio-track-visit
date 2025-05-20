markdown
# API Portfolio Tracker

API desenvolvida com Node.js e Express para rastrear estatísticas de visitas em uma página de portfólio, utilizando MariaDB como banco de dados.

## Funcionalidades

- **Rastreamento de Visitas:** Incrementa um contador global de visitas a cada acesso registrado.
- **Consulta de Estatísticas:** Permite consultar o total de visitas globais e a data da última atualização.
- **Verificação de Status da API:** Uma rota raiz para verificar se a API está operacional.

## Tecnologias Utilizadas

- **Node.js:** Ambiente de execução JavaScript no servidor.
- **Express.js:** Framework web para Node.js, utilizado para criar as rotas da API.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
- **MariaDB/MySQL:** Banco de dados relacional para armazenar as estatísticas de visitas.
  - Driver: `mysql2/promise`
- **dotenv:** Módulo para carregar variáveis de ambiente a partir de um arquivo `.env`.

## Estrutura do Projeto (Inferida)

```text
/
├── src/
│   ├── Routes/
│   │   └── visitRoutes.ts        # Define as rotas relacionadas às visitas
│   ├── Services/
│   │   └── service.ts            # Lógica de negócio (incrementar, buscar visitas)
│   ├── Interfaces/
│   │   └── EstatisticaPortfolioGlobal.ts # Interface para os dados de estatísticas
│   ├── Classes/
│   │   ├── service-error.ts      # Classe de erro para serviços
│   │   └── database-error.ts     # Classe de erro para o banco de dados
│   ├── Config/
│   │   └── database.ts           # Configuração e conexão com o banco de dados
│   ├── setupRoutes.ts            # Configuração principal das rotas da aplicação
│   └── server.ts                 # Ponto de entrada da aplicação (não fornecido, mas usual)
├── .env                          # Arquivo para variáveis de ambiente (NÃO versionar)
├── package.json
├── tsconfig.json
└── README.md

```

## Pré-requisitos

- Node.js (versão recomendada: LTS)
- NPM ou Yarn
- Uma instância do MariaDB ou MySQL acessível

## Configuração do Ambiente

1. Clone o repositório:

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_SEU_PROJETO>
Instale as dependências:
```

```bash
npm install
# ou
yarn install
```

## Crie um arquivo .env na raiz do projeto com as seguintes variáveis:

```text
DB_HOST=seu_host_do_banco
DB_USER=seu_usuario_do_banco
DB_PASSWORD=sua_senha_do_banco
DB_PORT=3306 # ou a porta do seu banco
DB_DATABASE=meu_portfolio_db
DB_CONNECTION_LIMIT=10 # Opcional, padrão 10
DB_CONNECT_TIMEOUT=10000 # Opcional, padrão 10000
Importante: A aplicação não inicia sem DB_HOST, DB_USER ou DB_DATABASE configurados.
```

Configuração Inicial do Banco de Dados
Execute este script SQL no seu MariaDB/MySQL:


```sql
-- 1. Crie o banco de dados
CREATE DATABASE meu_portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Selecione o banco
USE meu_portfolio_db;

-- 3. Crie a tabela
CREATE TABLE `estatisticas_portfolio_global` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `contador_total` INT UNSIGNED NOT NULL DEFAULT 0,
  `ultima_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Insira valor inicial
INSERT INTO `estatisticas_portfolio_global` (id, contador_total) VALUES (1, 0);
```

## Como Executar
Compile o TypeScript:

```bash
npm run build
Inicie o servidor:
```

```bash
npm start
Endpoints da API
Base URL: /api
```
## Routes
Verificação de Status
GET /
Verifica se a API está funcionando.

Resposta (200):

```json
{
  "message": "API Portfolio Tracker está funcionando! 🚀"
}
```

Registrar Visita
POST /api/track-visit
Incrementa o contador global de visitas.

Resposta (200):

```json
{
  "message": "Contador global de visitas atualizado com sucesso!",
  "id": "ID_DA_ESTATISTICA_GLOBAL",
  "total_geral_visitas": 125,
  "ultima_atualizacao": "2025-05-14T12:30:00.000Z"
}
```

Obter Estatísticas
GET /api/statistics
Retorna estatísticas globais.

Resposta (200):

```json
{
  "id": "ID_DA_ESTATISTICA_GLOBAL",
  "total_geral_visitas": 125,
  "ultima_atualizacao": "2025-05-14T12:30:00.000Z"
}
```

Tratamento de Erros
DatabaseError

```json
{
  "erro": "Erro de comunicação com o banco de dados.",
  "detalhes": "Mensagem específica do erro do banco"
}
```

ServiceError
```json
{
  "erro": "Erro no serviço.",
  "detalhes": "Mensagem específica do erro de serviço"
}
```

Erro Genérico (500)
```json
{
  "erro": "Erro interno inesperado ao processar a requisição."
}
```

Banco de Dados
Configuração do pool de conexões:

waitForConnections: true

connectionLimit: Definido por DB_CONNECTION_LIMIT (padrão: 10)

queueLimit: 0

connectTimeout: Definido por DB_CONNECT_TIMEOUT (padrão: 10000ms)