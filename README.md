# API Portfolio Tracker

API desenvolvida com Node.js e Express para rastrear estatísticas de visitas em uma página de portfólio, utilizando MariaDB como banco de dados.

## Funcionalidades

* **Rastreamento de Visitas:** Incrementa um contador global de visitas a cada acesso registrado.
* **Consulta de Estatísticas:** Permite consultar o total de visitas globais e a data da última atualização.
* **Verificação de Status da API:** Uma rota raiz para verificar se a API está operacional.

## Tecnologias Utilizadas

* **Node.js:** Ambiente de execução JavaScript no servidor.
* **Express.js:** Framework web para Node.js, utilizado para criar as rotas da API.
* **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
* **MariaDB/MySQL:** Banco de dados relacional para armazenar as estatísticas de visitas.
    * Driver: `mysql2/promise`
* **dotenv:** Módulo para carregar variáveis de ambiente a partir de um arquivo `.env`.

## Estrutura do Projeto (Inferida)

```text
/
├── src/
│   ├── Routes/
│   │   └── visitRoutes.ts       # Define as rotas relacionadas às visitas
│   ├── Services/
│   │   └── service.ts           # Lógica de negócio (incrementar, buscar visitas)
│   ├── Interfaces/
│   │   └── EstatisticaPortfolioGlobal.ts # Interface para os dados de estatísticas
│   ├── Classes/
│   │   ├── service-error.ts     # Classe de erro para serviços
│   │   └── database-error.ts    # Classe de erro para o banco de dados
│   ├── Config/
│   │   └── database.ts          # Configuração e conexão com o banco de dados (conexao.ts no seu exemplo)
│   └── setupRoutes.ts           # Configuração principal das rotas da aplicação
│   └── server.ts                # Ponto de entrada da aplicação (não fornecido, mas usual)
├── .env                         # Arquivo para variáveis de ambiente (NÃO versionar)
├── package.json
├── tsconfig.json
└── README.md
```

## Pré-requisitos

* Node.js (versão recomendada: LTS)
* NPM ou Yarn
* Uma instância do MariaDB ou MySQL acessível.

## Configuração do Ambiente

1.  Clone o repositório:
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DO_SEU_PROJETO>
    ```

2.  Instale as dependências:
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  Crie um arquivo `.env` na raiz do projeto e configure as variáveis de ambiente para a conexão com o banco de dados. Baseado no arquivo `conexao.ts`, as seguintes variáveis são necessárias:

    ```env
    DB_HOST=seu_host_do_banco
    DB_USER=seu_usuario_do_banco
    DB_PASSWORD=sua_senha_do_banco
    DB_PORT=3306 # ou a porta do seu banco
    DB_DATABASE=nome_do_seu_banco
    DB_CONNECTION_LIMIT=10 # Opcional, padrão 10
    DB_CONNECT_TIMEOUT=10000 # Opcional, padrão 10000
    ```

    **Importante:** O projeto possui uma validação que impede a inicialização caso `DB_HOST`, `DB_USER`, ou `DB_DATABASE` não estejam configurados.

## Como Executar

1.  **Compilar o TypeScript (se ainda não estiver configurado para rodar com `ts-node` ou similar):**
    ```bash
    npm run build # Ou o comando de build configurado no seu package.json (ex: tsc)
    ```

2.  **Iniciar o servidor:**
    ```bash
    npm start # Ou o comando de start configurado no seu package.json (ex: node dist/server.js)
    ```

    A API deverá estar rodando na porta configurada em seu `server.ts` (geralmente `3000` ou `8080`).

## Endpoints da API

A base para as rotas de estatísticas é `/api`.

* ### Verificação de Status da API
    * **GET /**
        * **Descrição:** Verifica se a API está funcionando.
        * **Resposta de Sucesso (200):**
            ```json
            {
                "message": "API Portfolio Tracker está funcionando! 🚀"
            }
            ```

* ### Registrar Visita Global
    * **POST /api/track-visit**
        * **Descrição:** Incrementa o contador global de visitas.
        * **Corpo da Requisição:** Vazio.
        * **Resposta de Sucesso (200):**
            ```json
            {
                "message": "Contador global de visitas atualizado com sucesso!",
                "id": "ID_DA_ESTATISTICA_GLOBAL",
                "total_geral_visitas": 125,
                "ultima_atualizacao": "2025-05-14T12:30:00.000Z"
            }
            ```
        * **Respostas de Erro:**
            * `500 Internal Server Error` (com mensagens específicas para `DatabaseError` ou `ServiceError`).

* ### Obter Estatísticas Globais
    * **GET /api/statistics**
        * **Descrição:** Retorna as estatísticas globais de visitas.
        * **Resposta de Sucesso (200):**
            ```json
            {
                "id": "ID_DA_ESTATISTICA_GLOBAL",
                "total_geral_visitas": 125,
                "ultima_atualizacao": "2025-05-14T12:30:00.000Z"
            }
            ```
        * **Respostas de Erro:**
            * `500 Internal Server Error` (com mensagens específicas para `DatabaseError` ou `ServiceError`).

## Tratamento de Erros

A API utiliza classes customizadas de erro (`DatabaseError`, `ServiceError`) para fornecer respostas mais detalhadas em caso de falhas:

* **`DatabaseError`:** Indica problemas na comunicação com o banco de dados.
    * Exemplo de resposta:
        ```json
        {
            "erro": "Erro de comunicação com o banco de dados.",
            "detalhes": "Mensagem específica do erro do banco"
        }
        ```
* **`ServiceError`:** Indica problemas na lógica de serviço da aplicação.
    * Exemplo de resposta:
        ```json
        {
            "erro": "Erro no serviço.",
            "detalhes": "Mensagem específica do erro de serviço"
        }
        ```
* **Erro Genérico do Servidor (500):** Para outros erros inesperados.
    * Exemplo de resposta:
        ```json
        {
            "erro": "Erro interno inesperado ao processar a requisição."
        }
        ```

## Banco de Dados

O projeto utiliza um pool de conexões com o MariaDB/MySQL gerenciado pelo driver `mysql2/promise`. A configuração do pool inclui:

* `waitForConnections`: `true`
* `connectionLimit`: Definido por `DB_CONNECTION_LIMIT` (padrão: 10)
* `queueLimit`: `0` (sem limite para a fila de conexões)
* `connectTimeout`: Definido por `DB_CONNECT_TIMEOUT` (padrão: 10000ms)

Uma função `checkConnection` é disponibilizada no módulo de conexão para verificar o status do banco de dados ao obter e "pingar" uma conexão do pool.

---