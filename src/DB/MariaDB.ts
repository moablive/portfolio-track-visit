import mysql, { Pool, PoolOptions, PoolConnection, QueryError } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// A configuração do pool permanece a mesma, está ótima.
const dbPoolConfig: PoolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // mysql2 lida bem com 'undefined' se a senha não for definida
    port: parseInt(process.env.DB_PORT || '9306', 10),
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
    queueLimit: 0,
    connectTimeout: process.env.DB_CONNECT_TIMEOUT ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10) : 10000
};

// A validação inicial também está excelente, vamos mantê-la.
if (!dbPoolConfig.host || !dbPoolConfig.user || !dbPoolConfig.database) {
    console.error("Erro Crítico: Variáveis de ambiente essenciais (DB_HOST, DB_USER, DB_DATABASE) não estão configuradas.");
    throw new Error("Configuração do banco de dados incompleta. A aplicação não pode iniciar.");
}

// Criamos o pool de conexões de forma mais direta. O mysql2/promise já pode lançar um erro aqui.
const pool: Pool = mysql.createPool(dbPoolConfig);
console.log('[DB] Pool de conexões com MariaDB/MySQL pronto para ser utilizado.');


/**
 * AJUSTE 1: Função de verificação de conexão modernizada.
 * Agora ela é totalmente baseada em Promises e não precisa mais de um callback.
 * Retorna uma Promise que resolve se a conexão for bem-sucedida ou rejeita se houver um erro.
 * Isso permite usar async/await de forma limpa onde for chamada.
 * @returns {Promise<void>}
*/
const testConnection = async (): Promise<void> => {
    let connection: PoolConnection | null = null;
    try {
        connection = await pool.getConnection();
        await connection.ping();
        console.log('[DB] Conexão com o banco de dados verificada com sucesso.');
    } catch (error) {
        const err = error as QueryError;
        console.error('[DB] Erro Crítico ao tentar conectar com o banco de dados:', err.message);
        // Em vez de chamar um callback, nós relançamos o erro para que a Promise seja rejeitada.
        throw err;
    } finally {
        if (connection) {
            connection.release();
            console.log('[DB] Conexão de teste liberada de volta para o pool.');
        }
    }
};


/**
 * AJUSTE 2: Estrutura de exportação simplificada.
 * Exportamos diretamente o pool. Qualquer parte da aplicação que precisar de uma
 * conexão poderá importá-lo e usar `pool.getConnection()` ou `pool.query()`.
 * Também exportamos a função de teste, caso seja útil para verificações de saúde (health checks).
*/
export const dbPool = pool;
export const dbTestConnection = testConnection;