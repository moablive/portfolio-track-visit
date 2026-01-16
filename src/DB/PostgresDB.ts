import { Pool, PoolConfig, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do pool adaptada para PostgreSQL
const dbPoolConfig: PoolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_DATABASE,
    // Em Postgres (pg), 'connectionLimit' é chamado de 'max'
    max: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
    // Em Postgres (pg), 'connectTimeout' é 'connectionTimeoutMillis'
    connectionTimeoutMillis: process.env.DB_CONNECT_TIMEOUT ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10) : 10000,
    // O driver 'pg' gerencia a fila automaticamente, não precisamos definir queueLimit explicitamente aqui da mesma forma
};

// A validação inicial continua a mesma
if (!dbPoolConfig.host || !dbPoolConfig.user || !dbPoolConfig.database) {
    console.error("Erro Crítico: Variáveis de ambiente essenciais (DB_HOST, DB_USER, DB_DATABASE) não estão configuradas.");
    throw new Error("Configuração do banco de dados incompleta. A aplicação não pode iniciar.");
}

// Criação do pool PostgreSQL
const pool = new Pool(dbPoolConfig);

// Tratamento de erros inesperados no pool (recomendado para pg)
pool.on('error', (err, client) => {
    console.error('[DB] Erro inesperado no cliente inativo (idle client)', err);
    process.exit(-1);
});

console.log('[DB] Pool de conexões com PostgreSQL pronto para ser utilizado.');

/**
 * Função de verificação de conexão (Health Check).
 * No Postgres, não existe método .ping(), então executamos um "SELECT 1".
 */
const testConnection = async (): Promise<void> => {
    let client: PoolClient | null = null;
    try {
        client = await pool.connect();
        // O equivalente ao ping no Postgres é uma query simples
        await client.query('SELECT 1');
        console.log('[DB] Conexão com o PostgreSQL verificada com sucesso.');
    } catch (error) {
        console.error('[DB] Erro Crítico ao tentar conectar com o banco de dados:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
            console.log('[DB] Cliente de teste liberado de volta para o pool.');
        }
    }
};

/**
 * Exportamos o pool e a função de teste.
 * Nota: Lembre-se que ao usar pool.query(), os placeholders agora são $1, $2 (não mais ?).
 */
export const dbPool = pool;
export const dbTestConnection = testConnection;
