import { RowDataPacket } from 'mysql2/promise';

/**
 * Interface que representa a estrutura da tabela 'estatisticas_portfolio_global'.
 * Esta tabela armazena um contador global de visitas.
*/
export interface EstatisticaPortfolioGlobal extends RowDataPacket {
  id: number;                 // Corresponde a `id` int(10) unsigned NOT NULL AUTO_INCREMENT
  contador_total: number;     // Corresponde a `contador_total` int(10) unsigned NOT NULL DEFAULT 0
  ultima_atualizacao: Date;   // Corresponde a `ultima_atualizacao` timestamp NULL DEFAULT current_timestamp()
}
