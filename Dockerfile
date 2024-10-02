FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY ./src /usr/src/app/src


RUN npm install

COPY . .

RUN npm install -g typescript
RUN tsc

EXPOSE 4000

CMD ["node", "dist/server.js"]
    