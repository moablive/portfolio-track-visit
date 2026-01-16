import { dbPool } from '../DB/PostgresDB'; // Ajustado para o novo arquivo
import { PoolClient, QueryResult } from 'pg'; // Tipos do PostgreSQL
import { EstatisticaPortfolioGlobal } from '../Interface/EstatisticaPortfolioGlobal';
import { DatabaseError } from '../Classes/database-error';

// O ID da linha única na tabela de estatísticas globais
const GLOBAL_STAT_ID = 1;

/**
 * Wrapper para Gerenciamento de Conexão (Adaptado para PG)
 * Obtém um cliente do pool, executa a ação e libera o cliente.
 */
async function withConnection<T>(action: (client: PoolClient) => Promise<T>): Promise<T> {
    let client: PoolClient | undefined;
    try {
        client = await dbPool.connect(); // Em PG, usamos connect() para pegar um cliente
        return await action(client);
    } catch (error: unknown) {
        const serviceError = error as Error;
        console.error(`[DB Service] Erro durante a execução: ${serviceError.message}`, error);
        
        if (error instanceof DatabaseError) {
            throw error;
        }
        throw new DatabaseError('Falha na operação com o banco de dados.', error);
    } finally {
        if (client) {
            client.release(); // Libera o cliente de volta para o pool
        }
    }
}

/**
 * Incrementa o contador global de visitas.
 * Usa sintaxe nativa do PostgreSQL para UPSERT.
 */
export const incrementGlobalVisit = async (): Promise<EstatisticaPortfolioGlobal> => {
    return withConnection(async (client) => {
        // AJUSTE CRÍTICO: Sintaxe de UPSERT do PostgreSQL
        // Em vez de "ON DUPLICATE KEY", usamos "ON CONFLICT (id) DO UPDATE"
        // E usamos $1 e $2 para parâmetros.
        const upsertQuery = `
            INSERT INTO estatisticas_portfolio_global (id, contador_total)
            VALUES ($1, 1)
            ON CONFLICT (id) 
            DO UPDATE SET contador_total = estatisticas_portfolio_global.contador_total + 1;
        `;
        
        // Executa a query
        await client.query(upsertQuery, [GLOBAL_STAT_ID]);
        console.log(`[Service] Operação de incremento/inserção global concluída.`);

        // Busca o estado atual para retornar (reutilizando o cliente)
        const result = await getGlobalVisits(client);
        console.log(`[Service] Estatística global atualizada recuperada:`, result);
        return result;
    });
};

/**
 * Busca o estado atual do contador global de visitas.
 * Suporta reutilização de cliente (transação/conexão existente).
 */
export const getGlobalVisits = async (existingClient?: PoolClient): Promise<EstatisticaPortfolioGlobal> => {
    const action = async (client: PoolClient) => {
        // AJUSTE: Placeholders do Postgres são $1, $2, etc.
        const query = "SELECT id, contador_total, ultima_atualizacao FROM estatisticas_portfolio_global WHERE id = $1";
        
        // AJUSTE: O retorno do PG é um objeto que contém a propriedade 'rows'
        const result: QueryResult<EstatisticaPortfolioGlobal> = await client.query(query, [GLOBAL_STAT_ID]);
        
        const estatisticaGlobal = result.rows[0];

        if (!estatisticaGlobal) {
            console.error(`[Service] Nenhuma estatística global encontrada para id: ${GLOBAL_STAT_ID}.`);
            throw new DatabaseError(`Nenhuma estatística global encontrada. A tabela precisa ser inicializada.`);
        }

        console.log(`[Service] Estatística global encontrada:`, estatisticaGlobal);
        return estatisticaGlobal;
    };

    if (existingClient) {
        return action(existingClient);
    } else {
        return withConnection(action);
    }
};
