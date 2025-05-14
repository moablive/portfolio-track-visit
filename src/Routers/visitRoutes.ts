import { Router, Request, Response, NextFunction } from 'express';
import { incrementGlobalVisit,  getGlobalVisits } from '../Services/service';

import { EstatisticaPortfolioGlobal } from '../Interface/EstatisticaPortfolioGlobal';
import {ServiceError } from '../Classes/service-error'
import {DatabaseError } from '../Classes/database-error'

const router = Router();

// Rota POST para registrar/incrementar a visita global
router.post('/track-visit', async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Router] Recebida requisição POST para /track-visit (contador global)`);

    try {
        const estatisticaGlobalAtualizada: EstatisticaPortfolioGlobal = await incrementGlobalVisit();
        
        res.status(200).json({
            message: `Contador global de visitas atualizado com sucesso!`,
            id: estatisticaGlobalAtualizada.id, // O ID da única linha na tabela global
            total_geral_visitas: estatisticaGlobalAtualizada.contador_total,
            ultima_atualizacao: estatisticaGlobalAtualizada.ultima_atualizacao
        });

    } catch (error: unknown) {
        const err = error as Error; // Type assertion para acessar error.message
        console.error(`[Router] Erro na rota /track-visit (global):`, error);
        
        if (error instanceof DatabaseError) {
            return res.status(error.statusCode || 500).json({ erro: "Erro de comunicação com o banco de dados.", detalhes: err.message });
        }
        if (error instanceof ServiceError) { // Captura outros erros de serviço genéricos
            return res.status(error.statusCode || 500).json({ erro: "Erro no serviço.", detalhes: err.message });
        }
        // Erro genérico do servidor para outros casos
        return res.status(500).json({ erro: "Erro interno inesperado ao processar a requisição." });
    }
});

// Rota GET para buscar o contador global de visitas
router.get('/statistics', async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Router] Recebida requisição GET para /statistics (contador global)`);
    try {
        const estatisticaGlobal: EstatisticaPortfolioGlobal = await getGlobalVisits();
        
        res.status(200).json({
            id: estatisticaGlobal.id,
            total_geral_visitas: estatisticaGlobal.contador_total,
            ultima_atualizacao: estatisticaGlobal.ultima_atualizacao
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error(`[Router] Erro na rota /statistics (global):`, error);

        if (error instanceof DatabaseError) {
            return res.status(error.statusCode || 500).json({ erro: "Erro de comunicação com o banco de dados ao buscar estatísticas.", detalhes: err.message });
        }
        if (error instanceof ServiceError) {
            return res.status(error.statusCode || 500).json({ erro: "Erro no serviço ao buscar estatísticas.", detalhes: err.message });
        }
        return res.status(500).json({ erro: "Erro interno inesperado ao buscar estatísticas globais." });
    }
});

export default router;
