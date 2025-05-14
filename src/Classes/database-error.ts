import { ServiceError } from './service-error';

/**
 * Erro específico para falhas de banco de dados
 */
export class DatabaseError extends ServiceError {
    
    constructor(message: string, originalError?: unknown) {
        const originalErrorMessage = originalError instanceof Error 
            ? originalError.message 
            : String(originalError);
        const fullMessage = originalError 
            ? `${message}: ${originalErrorMessage}` 
            : message;
        super(fullMessage, 500);
    }
}