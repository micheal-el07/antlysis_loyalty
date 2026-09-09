FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
# Full install, not --omit=dev: sequelize-cli (a devDependency) is what
# actually runs the migrate/seed step on container start, below.
RUN npm ci

COPY . .

EXPOSE 4000
CMD ["node", "src/server.js"]
