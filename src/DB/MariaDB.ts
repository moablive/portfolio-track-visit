import mysql, { Pool, PoolOptions, PoolConnection, QueryError } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Define uma interface mais específica para a configuração do pool
const dbPoolConfig: PoolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
    queueLimit: 0,
    connectTimeout: process.env.DB_CONNECT_TIMEOUT ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10) : 10000
};

// Validação básica das variáveis de ambiente para o banco de dados
if (!dbPoolConfig.host || !dbPoolConfig.user || !dbPoolConfig.database) {
    console.error("Erro Crítico: Variáveis de ambiente do banco de dados (DB_HOST, DB_USER, DB_DATABASE) não estão configuradas.");
    console.error("A aplicação não pode iniciar sem a configuração do banco de dados.");
    throw new Error("Configuração do banco de dados incompleta. Verifique as variáveis de ambiente DB_HOST, DB_USER, DB_DATABASE.");
}

let pool: Pool;
try {
    pool = mysql.createPool(dbPoolConfig);
    console.log('[DB] Pool de conexões com MariaDB/MySQL criado.');
} catch (error) {
    const err = error as Error;
    console.error('[DB] Erro Crítico ao criar o pool de conexões com o MariaDB/MySQL:', err.message);
    throw err;
}

/**
 * Verifica a conexão com o banco de dados obtendo uma conexão do pool.
 * Chama um callback similar ao padrão `connect` do pacote `mysql`.
 * @param callback Função a ser chamada após a tentativa de conexão.
*/
const checkConnection = async (callback: (err: QueryError | Error | null) => void): Promise<void> => {
    let connection: PoolConnection | null = null; // Usar PoolConnection
    try {
        if (!pool) {
            throw new Error("[DB] Pool de conexões não inicializado ou falhou ao ser criado.");
        }
        connection = await pool.getConnection();
        await connection.ping();
        console.log('[DB] Conexão com o banco de dados verificada com sucesso via pool.');
        callback(null);
    } catch (error) {
        const err = error as QueryError | Error;
        console.error('[DB] Erro ao verificar a conexão com o banco de dados via pool:', err.message);
        callback(err);
    } finally {
        if (connection) {
            connection.release(); 
            console.log('[DB] Conexão de verificação liberada de volta para o pool.');
        }
    }
};

const conexao = {
    pool: pool, 
    connect: checkConnection
};

export default conexao;
