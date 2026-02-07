#!/bin/bash

# --- CONFIGURAÇÕES FIXAS (Baseadas no seu docker ps) ---
CONTAINER_NAME="awlsrvDB_postgres"
DB_USER="awlsrv"             # Usuário comum no seu ambiente
DB_NAME="portfolio_db"       # Ajuste se o nome do banco no seu .env for outro

echo "🚀 Iniciando criação da tabela no container: $CONTAINER_NAME..."

# Executa o comando SQL
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME << EOF
-- 1. Criar a tabela para o contador global
CREATE TABLE IF NOT EXISTS estatisticas_portfolio_global (
    id INTEGER PRIMARY KEY,
    contador_total INTEGER DEFAULT 0,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Função para atualizar o timestamp automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.ultima_atualizacao = now();
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- 3. Trigger para disparar a função no UPDATE
DROP TRIGGER IF EXISTS update_visitas_modtime ON estatisticas_portfolio_global;
CREATE TRIGGER update_visitas_modtime
    BEFORE UPDATE ON estatisticas_portfolio_global
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- 4. Inicializar a linha única necessária pelo seu service.ts
INSERT INTO estatisticas_portfolio_global (id, contador_total) 
VALUES (1, 0) 
ON CONFLICT (id) DO NOTHING;

-- Mostrar resultado
SELECT * FROM estatisticas_portfolio_global;
EOF

echo "✅ Tabela configurada com sucesso!"
echo "🔄 Reiniciando a API para aplicar as mudanças..."
docker restart portfolio-track-api
