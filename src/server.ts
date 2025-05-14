import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './Routers/routes';
import conexao from './DB/MariaDB';

const app: Express = express();
const port: number = 5000;

// Função principal assíncrona para encapsular a inicialização
(async () => {
    
    try {
        // Verificar a conexão com o banco de dados
        console.log('Etapa 1: Tentando conectar ao banco de dados...');
        await new Promise<void>((resolve, reject) => {
            conexao.connect((err: Error | null) => {
                if (err) {
                    console.error('Erro CRÍTICO ao conectar/verificar o banco de dados:', err.message);
                    // A lógica de process.exit(1) pode estar dentro de conexao.connect ou aqui.
                    // Para garantir, vamos adicionar aqui também, mas idealmente é centralizado.
                    // Se conexao.connect já faz process.exit, esta parte pode ser redundante.
                    reject(err); // Rejeita a promise para ser pega pelo catch externo
                    return;
                }
                console.log('Conexão com o banco de dados verificada com sucesso.');
                resolve();
            });
        });

        // Middleware para permitir que o Express interprete JSON no corpo das requisições
        app.use(express.json());

        // Middleware para permitir CORS
        app.use(cors({
            origin: '*', // Permite todas as origens para desenvolvimento
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Configura as rotas da aplicação
        router(app);
        
        // Adicionando middlewares de tratamento de erro e 404 
        app.use((req: Request, res: Response, next: NextFunction) => {
            res.status(404).json({
                erro: "Rota não encontrada.",
                metodo: req.method,
                url: req.originalUrl
            });
        });

        // Middleware para tratamento de erros global
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error("[Server] Erro global capturado:", err.stack);
            res.status(500).json({
                erro: "Erro Interno do Servidor",
                detalhes: process.env.NODE_ENV === 'production' ? 'Ocorreu um problema interno.' : err.message
            });
        });

        // Iniciar o servidor
        app.listen(port, () => {
            console.log(`Etapa 3: Servidor iniciado com sucesso.`);
            console.log(`🚀 => ${port}`);
            if (process.env.NODE_ENV !== 'production') {
                console.log(`   Ambiente: Desenvolvimento. Servidor acessível em http://localhost:${port}`);
            } else {
                console.log(`   Ambiente: Produção.`);
            }
        });

    } catch (error) {
        console.error('Falha crítica na inicialização do servidor (provavelmente erro no banco de dados).');
        console.error('A aplicação será encerrada.');
        process.exit(1);
    }
})();
