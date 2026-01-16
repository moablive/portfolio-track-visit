# Estágio de Build (Compilação)
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependências (incluindo devDependencies para rodar o tsc)
RUN npm install

# Copia o código fonte
COPY src ./src

# Compila o TypeScript para JavaScript (gera a pasta /dist)
RUN npm run build

# Estágio de Produção (Imagem final leve)
FROM node:20-alpine

WORKDIR /app

# Copia apenas o código compilado e o package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instala apenas dependências de produção
RUN npm install --omit=dev

# Variáveis de ambiente padrão
ENV PORT=7099
EXPOSE 7099

# Inicia a API
CMD ["node", "dist/server.js"]
