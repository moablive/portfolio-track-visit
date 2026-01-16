import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './Routers/routes';
// CORREÇÃO: Apontando para o novo arquivo do Postgres
import { dbTestConnection } from './DB/PostgresDB';

const app: Express = express();
const port: number = parseInt(process.env.PORT || '7099', 10);

// --- Configuração de Middlewares ---
app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Configuração das Rotas ---
router(app);

// --- Middlewares de Tratamento de Erros ---
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        error: "Rota não encontrada",
        method: req.method,
        url: req.originalUrl
    });
});

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
        
        // A função agora testa a conexão com o PostgreSQL
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
