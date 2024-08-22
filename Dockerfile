# Dockerfile for User Service
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g typescript
RUN tsc

EXPOSE 3000

CMD ["node", "dist/server.js"]
