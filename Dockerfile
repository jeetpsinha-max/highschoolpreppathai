FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3002
COPY package*.json ./
# tsx (used to run server.ts) is a devDependency, so include dev deps.
RUN npm ci --include=dev --no-audit --no-fund
COPY server.ts tsconfig*.json ./
EXPOSE 3002
USER node
CMD ["npm", "run", "server"]
