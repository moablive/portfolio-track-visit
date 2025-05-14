import dbPool from '../DB/MariaDB';
import { RowDataPacket, FieldPacket, PoolConnection, QueryError } from 'mysql2/promise';
import { EstatisticaPortfolioGlobal } from '../Interface/EstatisticaPortfolioGlobal';
import {DatabaseError } from '../Classes/database-error'

// Assumindo que a tabela 'estatisticas_portfolio_global' tem uma única linha com um ID conhecido (ex: 1)
// ou que você sempre opera na primeira/única linha.
// Se a tabela estiver vazia, estas funções precisarão de lógica para inserir a primeira linha.
// Para simplificar, vamos assumir que a linha com id=1 já existe (conforme SQL de criação da tabela).
const GLOBAL_STAT_ID = 1; // ID da única linha na tabela estatisticas_portfolio_global

/**
 * Incrementa o contador global de visitas.
 *
 * @returns Uma Promise que resolve com o objeto EstatisticaPortfolioGlobal atualizado.
 * @throws DatabaseError em caso de falha na comunicação com o banco.
 */
export const incrementGlobalVisit = async (): Promise<EstatisticaPortfolioGlobal> => {
    let connection: PoolConnection | undefined;
    try {
        connection = await dbPool.pool.getConnection();
        console.log(`[Service] Conexão obtida do pool para incrementar contador global.`);

        // Query para incrementar o contador_total na linha específica
        const updateQuery: string = `
            UPDATE estatisticas_portfolio_global 
            SET contador_total = contador_total + 1 
            WHERE id = ?;
        `;
        // Executa o update
        const [updateResult] = await connection.execute(updateQuery, [GLOBAL_STAT_ID]);
        
        // Verifica se alguma linha foi afetada (deve ser 1 se o ID existir)
        // O tipo de updateResult pode variar, mas ResultSetHeader é comum para updates.
        const resultSetHeader = updateResult as import('mysql2').ResultSetHeader;
        if (resultSetHeader.affectedRows === 0) {
            // Isso pode acontecer se a linha com GLOBAL_STAT_ID não existir.
            // Poderia tentar inserir aqui, mas para este exemplo, lançamos um erro.
            console.warn(`[Service] Nenhuma linha encontrada com id=${GLOBAL_STAT_ID} para incrementar. Verifique se a linha inicial existe.`);
            // Tenta inserir a linha se ela não existir (opcional, depende da sua estratégia)
            const insertQuery = "INSERT INTO estatisticas_portfolio_global (id, contador_total) VALUES (?, 1) ON DUPLICATE KEY UPDATE contador_total = contador_total + 1";
            await connection.execute(insertQuery, [GLOBAL_STAT_ID]);
            console.log(`[Service] Linha com id=${GLOBAL_STAT_ID} inserida ou atualizada após falha no update inicial.`);
        }
        
        console.log(`[Service] Query de incremento global executada.`);

        // Busca a linha atualizada para retornar os dados completos
        const selectQuery: string = "SELECT id, contador_total, ultima_atualizacao FROM estatisticas_portfolio_global WHERE id = ?";
        const [rows]: [EstatisticaPortfolioGlobal[], FieldPacket[]] = await connection.execute<EstatisticaPortfolioGlobal[]>(selectQuery, [GLOBAL_STAT_ID]);

        const estatisticaAtualizada: EstatisticaPortfolioGlobal | undefined = rows[0];

        if (!estatisticaAtualizada) {
            console.error(`[Service] Falha ao recuperar estatística global após incremento para id: ${GLOBAL_STAT_ID}.`);
            throw new DatabaseError(`Falha ao recuperar estatística global após incremento para id: ${GLOBAL_STAT_ID}.`);
        }
        
        console.log(`[Service] Estatística global atualizada:`, estatisticaAtualizada);
        return estatisticaAtualizada;

    } catch (error: unknown) {
        const genericError = error as Error;
        console.error(`[Service] Erro ao incrementar contador global: ${genericError.message}`, error);
        throw new DatabaseError(`Erro ao interagir com o banco de dados para incrementar contador global`, error);
    } finally {
        if (connection) {
            try {
                connection.release();
                console.log(`[Service] Conexão liberada de volta para o pool (incrementGlobalVisit).`);
            } catch (releaseError: unknown) {
                const err = releaseError as Error;
                console.error(`[Service] Erro ao liberar a conexão (incrementGlobalVisit): ${err.message}`, releaseError);
            }
        }
    }
};

/**
 * Busca o estado atual do contador global de visitas.
 *
 * @returns Uma Promise que resolve com o objeto EstatisticaPortfolioGlobal.
 * @throws DatabaseError em caso de falha na comunicação com o banco ou se a linha não for encontrada.
 */
export const getGlobalVisits = async (): Promise<EstatisticaPortfolioGlobal> => {
    let connection: PoolConnection | undefined;
    try {
        connection = await dbPool.pool.getConnection();
        console.log(`[Service] Conexão obtida do pool para buscar estatísticas globais.`);
        
        const query: string = "SELECT id, contador_total, ultima_atualizacao FROM estatisticas_portfolio_global WHERE id = ?";
        const [rows]: [EstatisticaPortfolioGlobal[], FieldPacket[]] = await connection.execute<EstatisticaPortfolioGlobal[]>(query, [GLOBAL_STAT_ID]);

        const estatisticaGlobal: EstatisticaPortfolioGlobal | undefined = rows[0];

        if (!estatisticaGlobal) {
            // Se a linha não existir, pode ser um problema de setup inicial da tabela.
            // Poderia tentar inserir aqui também, ou lançar um erro mais específico.
            console.error(`[Service] Nenhuma estatística global encontrada para id: ${GLOBAL_STAT_ID}. Verifique o setup da tabela.`);
            throw new DatabaseError(`Nenhuma estatística global encontrada. A tabela pode não estar inicializada corretamente.`);
        }
        
        console.log(`[Service] Estatística global encontrada:`, estatisticaGlobal);
        return estatisticaGlobal;

    } catch (error: unknown) {
        const genericError = error as Error;
        console.error(`[Service] Erro ao buscar estatísticas globais: ${genericError.message}`, error);
        if (error instanceof DatabaseError) throw error; // Re-lança se já for um DatabaseError
        throw new DatabaseError(`Erro ao buscar estatísticas globais no banco de dados`, error);
    } finally {
        if (connection) {
            try {
                connection.release();
                console.log(`[Service] Conexão liberada de volta para o pool (getGlobalVisits).`);
            } catch (releaseError: unknown) {
                const err = releaseError as Error;
                console.error(`[Service] Erro ao liberar a conexão (getGlobalVisits): ${err.message}`, releaseError);
            }
        }
    }
};
