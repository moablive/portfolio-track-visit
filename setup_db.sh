#!/bin/bash

# --- CONFIGURAÇÕES ---
CONTAINER_NAME="awlsrvDB_postgres"
DB_USER="admin_root"
DB_NAME="track"
API_CONTAINER="portfolio-track-api"

echo "🚀 Iniciando configuração do ambiente..."

# 1. Criar o banco 'track' conectando via banco padrão 'postgres'
# Usamos '-d postgres' para evitar o erro de 'database admin_root does not exist'
echo "🔎 Verificando/Criando banco '$DB_NAME'..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "🏗️ Banco '$DB_NAME' criado com sucesso."
else
    echo "✅ Banco '$DB_NAME' já existe ou não pôde ser criado (prosseguindo)."
fi

# 2. Criar a estrutura dentro do banco 'track'
echo "📊 Configurando tabelas e triggers no banco '$DB_NAME'..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME << EOF
-- Criar a tabela
CREATE TABLE IF NOT EXISTS estatisticas_portfolio_global (
    id INTEGER PRIMARY KEY,
    contador_total INTEGER DEFAULT 0,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Função para auto-update do timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.ultima_atualizacao = now();
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- Aplicar Trigger
DROP TRIGGER IF EXISTS update_visitas_modtime ON estatisticas_portfolio_global;
CREATE TRIGGER update_visitas_modtime
    BEFORE UPDATE ON estatisticas_portfolio_global
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Inicializar ID 1
INSERT INTO estatisticas_portfolio_global (id, contador_total) 
VALUES (1, 0) 
ON CONFLICT (id) DO NOTHING;

SELECT * FROM estatisticas_portfolio_global;
EOF

echo "✅ Estrutura de dados preparada!"

# 3. Reiniciar a API
echo "🔄 Reiniciando API..."
docker restart $API_CONTAINER

echo "------------------------------------------------------"
echo "Check final: docker logs -f $API_CONTAINER"
