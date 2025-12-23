import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './Routers/routes';
import { dbTestConnection } from './DB/MariaDB';

const app: Express = express();
const port: number = parseInt(process.env.PORT || '7099', 10);

// --- Configuração de Middlewares ---
// Middlewares essenciais devem ser configurados antes das rotas.
// Eles não dependem da conexão com o banco de dados para serem definidos.

// Middleware para permitir que o Express interprete JSON no corpo das requisições
app.use(express.json());

// Middleware para habilitar CORS com configuração mais segura para o futuro
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Permite configurar a origem via .env
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Configuração das Rotas ---
router(app);

// --- Middlewares de Tratamento de Erros ---

// Middleware para tratar rotas não encontradas (404)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        error: "Rota não encontrada",
        method: req.method,
        url: req.originalUrl
    });
});

// Middleware de tratamento de erros global.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("[Server] Erro global capturado:", err.stack);
    res.status(500).json({
        error: "Erro Interno do Servidor",
        details: process.env.NODE_ENV !== 'production' ? err.message : 'Ocorreu um problema inesperado.'
    });
});


// --- Função de Inicialização do Servidor ---
const startServer = async () => {
    try {

        console.log('Verificando conexão com o banco de dados...');
        await dbTestConnection();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        app.listen(port, () => {
            console.log(`\n🚀 Servidor iniciado com sucesso na porta ${port}`);
            if (process.env.NODE_ENV !== 'production') {
                console.log(`   Ambiente: Desenvolvimento. Acesse em http://localhost:${port}`);
            } else {
                console.log(`   Ambiente: Produção.`);
            }
        });

    } catch (error) {
        console.error('\n❌ Falha crítica na inicialização do servidor.');
        console.error('   O erro ocorreu ao tentar conectar com o banco de dados.');
        process.exit(1);
    }
};

// Inicia a aplicação
startServer();
