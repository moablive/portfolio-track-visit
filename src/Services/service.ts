import { dbPool } from '../DB/MariaDB'; // AJUSTE: Importando dbPool diretamente, como no ajuste anterior
import { PoolConnection, FieldPacket } from 'mysql2/promise';
import { EstatisticaPortfolioGlobal } from '../Interface/EstatisticaPortfolioGlobal';
import { DatabaseError } from '../Classes/database-error';

// O ID da linha única na tabela de estatísticas globais
const GLOBAL_STAT_ID = 1;

/**
 * AJUSTE 1: Wrapper para Gerenciamento de Conexão (Princípio DRY)
 * Esta função abstrai a lógica de obter e liberar uma conexão do pool.
 * Ela garante que a conexão seja sempre liberada, mesmo em caso de erro.
 *
 * @param action A função que executa a lógica do banco de dados, recebendo a conexão como argumento.
 * @returns O resultado da função 'action'.
 */
async function withConnection<T>(action: (connection: PoolConnection) => Promise<T>): Promise<T> {
    let connection: PoolConnection | undefined;
    try {
        connection = await dbPool.getConnection();
        return await action(connection);
    } catch (error: unknown) {
        // Loga e re-lança o erro encapsulado para o chamador tratar
        const serviceError = error as Error;
        console.error(`[DB Service] Erro durante a execução da transação: ${serviceError.message}`, error);
        // Se o erro já é um DatabaseError, não o encapsula novamente
        if (error instanceof DatabaseError) {
            throw error;
        }
        throw new DatabaseError('Falha na operação com o banco de dados.', error);
    } finally {
        if (connection) {
            connection.release();
            // console.log(`[DB Service] Conexão liberada de volta para o pool.`); // Log opcional
        }
    }
}

/**
 * Incrementa o contador global de visitas de forma atômica.
 *
 * @returns Uma Promise que resolve com o objeto EstatisticaPortfolioGlobal atualizado.
 * @throws DatabaseError em caso de falha.
 */
export const incrementGlobalVisit = async (): Promise<EstatisticaPortfolioGlobal> => {
    return withConnection(async (connection) => {
        // AJUSTE 2: Lógica Atômica e Simplificada
        // Esta query única insere a linha com contador 1 se ela não existir,
        // ou incrementa o contador se ela já existir. É atômica e previne race conditions.
        const upsertQuery = `
            INSERT INTO estatisticas_portfolio_global (id, contador_total) 
            VALUES (?, 1) 
            ON DUPLICATE KEY UPDATE contador_total = contador_total + 1;
        `;
        await connection.execute(upsertQuery, [GLOBAL_STAT_ID]);
        console.log(`[Service] Operação de incremento/inserção global concluída.`);

        // Após o incremento, buscamos o estado atual para retornar os dados completos
        // (incluindo o 'ultima_atualizacao' gerado pelo banco).
        const result = await getGlobalVisits(connection);
        console.log(`[Service] Estatística global atualizada recuperada:`, result);
        return result;
    });
};

/**
 * Busca o estado atual do contador global de visitas.
 * Pode receber uma conexão existente para ser usada dentro de uma transação maior.
 *
 * @param existingConnection (Opcional) Uma conexão de banco de dados já ativa.
 * @returns Uma Promise que resolve com o objeto EstatisticaPortfolioGlobal.
 * @throws DatabaseError se a linha não for encontrada.
 */
export const getGlobalVisits = async (existingConnection?: PoolConnection): Promise<EstatisticaPortfolioGlobal> => {
    const action = async (connection: PoolConnection) => {
        const query = "SELECT id, contador_total, ultima_atualizacao FROM estatisticas_portfolio_global WHERE id = ?";
        const [rows] = await connection.execute<EstatisticaPortfolioGlobal[]>(query, [GLOBAL_STAT_ID]);

        const estatisticaGlobal = rows[0];

        if (!estatisticaGlobal) {
            console.error(`[Service] Nenhuma estatística global encontrada para id: ${GLOBAL_STAT_ID}. A tabela pode não estar inicializada.`);
            throw new DatabaseError(`Nenhuma estatística global encontrada. A tabela precisa ser inicializada com a linha de id=${GLOBAL_STAT_ID}.`);
        }

        console.log(`[Service] Estatística global encontrada:`, estatisticaGlobal);
        return estatisticaGlobal;
    };

    // Se uma conexão já foi passada, usa ela. Senão, usa o wrapper `withConnection`.
    if (existingConnection) {
        return action(existingConnection);
    } else {
        return withConnection(action);
    }
};
