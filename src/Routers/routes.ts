import { Express } from 'express';
import visitRoutes from './visitRoutes';

const setupRoutes = (app: Express): void => {

  // Rota raiz para verificação
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'API Portfolio Tracker está funcionando! 🚀',
        });
    });
    
    // Suas rotas API
    app.use('/api', visitRoutes);
};

export default setupRoutes;
